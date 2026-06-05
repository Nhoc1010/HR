/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// Create Express app
const app = express();
const PORT = 3000;

// 1. HARDEN CORE INFRASTRUCTURE SECURITY --
// Disable X-Powered-By header to prevent technology stack disclosure
app.disable("x-powered-by");

// 2. ENHANCE SECURITY RESPONSE HEADERS --
app.use((req, res, next) => {
  // Prevent mime-sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Force XSS Filter in browser
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // Prevent referrer leakage
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Immersive Frame & Content Security Policy:
  // Must allow AI Studio and standard Google environment frameworks to load the iframe while maintaining safety
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' data: https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://generativelanguage.googleapis.com; " +
    "frame-ancestors 'self' https://*.run.app https://ai.studio https://*.google.com https://*.googleusercontent.com"
  );
  next();
});

// 3. SECURE BODY PARSING LIMITS --
// Restrict incoming payload sizes to prevent memory flooding (DDoS/DoS)
app.use(express.json({ limit: "1mb" }));

// 4. INPUT DEEP-SANITIZATION MIDDLEWARE --
// Recursively monitors and scrubs script tags, frames, and dangerous XSS inputs from incoming req.body 
const sanitizeHTML = (text: string): string => {
  if (typeof text !== "string") return text;
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "[filtered-script-tag]")
    .replace(/javascript:/gi, "[filtered-js-protocol]")
    .replace(/onload=/gi, "")
    .replace(/onerror=/gi, "")
    .replace(/onclick=/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "[filtered-iframe]");
};

const sanitizeInputMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const sanitizeDeep = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === "string") {
      return sanitizeHTML(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeDeep(item));
    }
    if (typeof obj === "object") {
      const sanitizedObj: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          sanitizedObj[key] = sanitizeDeep(obj[key]);
        }
      }
      return sanitizedObj;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeDeep(req.body);
  }
  next();
};

app.use(sanitizeInputMiddleware);

// 5. SLIDING WINDOW RATE LIMITER --
// Limits malicious flooding or API token drainage
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const rateLimits = new Map<string, RateLimitRecord>();

const createRateLimiter = (limitCount: number, windowMs: number) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown-ip";
    const now = Date.now();
    
    let record = rateLimits.get(ip);
    if (!record) {
      record = { count: 1, resetTime: now + windowMs };
      rateLimits.set(ip, record);
      return next();
    }
    
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }
    
    record.count++;
    if (record.count > limitCount) {
      return res.status(429).json({
        error: "Yêu cầu quá thường xuyên. Hệ thống phối hợp ngăn chặn spam & bảo vệ tài nguyên API. Vui lòng quay lại sau 1 phút."
      });
    }
    next();
  };
};

const chatLimiter = createRateLimiter(25, 60000); // 25 chats/min
const documentLimiter = createRateLimiter(15, 60000); // 15 gen/min

// Initialize Gemini API with lazy initialization for enhanced security
let aiInstance: GoogleGenAI | null = null;

function getAI(customApiKey?: string): GoogleGenAI {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Không tìm thấy cấu hình GEMINI_API_KEY. Vui lòng thiết lập khóa API để kích hoạt AI.");
  }
  
  if (customApiKey) {
    // Return a new sandbox-clean instance for client dynamic credentials to avoid cross-contamination
    return new GoogleGenAI({
      apiKey: customApiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// AI endpoints
// 1. General HRM assistant chat
app.post("/api/chat", chatLimiter, async (req, res) => {
  try {
    const customKey = req.headers["x-gemini-key"] as string;
    if (!customKey || customKey.trim() === "") {
      return res.status(400).json({ error: "Yêu cầu khóa API. Vui lòng nhập chính xác Gemini API Key trong góc hội thoại để kích hoạt Trợ lý AI." });
    }
    const ai = getAI(customKey);
    const { message, chatHistory } = req.body;
    
    // Format history for the model
    const systemPrompt = `Bạn là Trợ lý AI nâng cao được tích hợp trong phần mềm HRM Pro (Hệ thống quản lý nhân sự chuyên nghiệp). 
Nhiệm vụ của bạn là hỗ trợ các nhà quản lý nhân sự (HR Manager) giải quyết các thắc mắc về luật lao động Việt Nam, soạn thảo văn bản hành chính, tư vấn chế độ phúc lợi, thiết kế KPI, và đưa ra quyết định nhân sự sáng suốt.
Hãy trả lời ngắn gọn, súc tích, chuyên nghiệp bằng tiếng Việt và hiển thị dưới dạng Markdown đẹp mắt.`;

    // Concat previous messages for context
    const contents = chatHistory ? chatHistory.map((msg: any) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    })) : [];

    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text || "Xin lỗi, không có phản hồi." });
  } catch (error: any) {
    console.error("Error in AI Chat:", error);
    res.status(500).json({ error: "Lỗi xử lý đối thoại AI. Vui lòng thiết lập chính xác khóa GEMINI_API_KEY hoặc thử lại sau." });
  }
});

// 2. Draft labor contract
app.post("/api/draft-contract", documentLimiter, async (req, res) => {
  try {
    const customKey = req.headers["x-gemini-key"] as string;
    const ai = getAI(customKey);
    const { employee, contract } = req.body;
    const prompt = `Hãy soạn thảo một HỢP ĐỒNG LAO ĐỘNG chi tiết, chuyên nghiệp và đúng luật lao động Việt Nam dựa trên các thông tin sau:
- Tên nhân viên: ${employee.name} (${employee.gender === "Nam" ? "Ông" : "Bà"})
- Mã nhân viên: ${employee.code}
- Email: ${employee.email}
- Số điện thoại: ${employee.phone}
- Địa chỉ: ${employee.address}
- Phòng ban: ${employee.department}
- Chức vụ: ${employee.position}
- Lương cơ bản: ${employee.salary.toLocaleString("vi-VN")} VNĐ
- Số BHXH: ${employee.bhxhNumber || "Đang cập nhật"}
- Loại hợp đồng: ${contract.contractType}
- Ngày bắt đầu làm việc & Hợp đồng: ${contract.contractStartDate}

Yêu cầu hợp đồng:
- Đầy đủ các điều khoản chính: Công việc, Địa điểm làm việc, Thời giờ làm việc, Quyền lợi & Nghĩa vụ, Bảo hiểm xã hội, Điều khoản thi hành.
- Trình bày định dạng Markdown chỉn chu, có tiêu đề cấp 1, cấp 2 rõ ràng.
- Giọng văn trang trọng, chuẩn pháp lý của Việt Nam.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.3,
      }
    });

    res.json({ contract: response.text });
  } catch (error: any) {
    console.error("Error drafting contract:", error);
    res.status(500).json({ error: "Lỗi soạn thảo văn bản tự động. Vui lòng thử lại hoặc kiểm tra khóa GEMINI_API_KEY." });
  }
});

// 3. Evaluate CV & Candidate
app.post("/api/analyze-candidate", documentLimiter, async (req, res) => {
  try {
    const customKey = req.headers["x-gemini-key"] as string;
    const ai = getAI(customKey);
    const { candidate } = req.body;
    const prompt = `Hãy đóng vai trò là một chuyên gia tuyển dụng cao cấp. Phân tích và đưa ra đánh giá, phê duyệt cho ứng viên sau:
- Tên ứng viên: ${candidate.name}
- Vị trí ứng tuyển: ${candidate.position}
- Số điện thoại: ${candidate.phone}
- Email: ${candidate.email}
- Điểm đánh giá (0-100): ${candidate.score}/100
- Ghi chú: ${candidate.notes}

Hãy đưa ra bài đánh giá cụ thể gồm các mục:
1. Đánh giá hồ sơ tổng quan.
2. Dự đoán mức độ hòa nhập văn hóa dựa trên mô tả.
3. Câu hỏi phỏng vấn gợi ý (khoảng 3 câu hỏi liên quan đến vị trí ${candidate.position}).
4. Đề xuất quyết định (Phù hợp/Cần cân nhắc thêm/Từ chối).

Trình bày bằng Markdown súc tích, chuyên nghiệp.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.5,
      }
    });

    res.json({ evaluation: response.text });
  } catch (error: any) {
    console.error("Error analyzing candidate:", error);
    res.status(500).json({ error: "Lỗi phân tích ứng viên. Vui lòng kiểm tra lại cấu hình hệ thống." });
  }
});

// Centralized error-handling middleware for safety (OWASP A04:2021-XML/JSON External Entity/Stack Leak Protection)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({
    error: "Phát hiện lỗi không mong muốn từ hệ thống của máy chủ. Yêu cầu đã được ghi nhật ký bảo mật bảo vệ thiết bị."
  });
});

// Vite middleware development setup or server static assets for production
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[HRM Pro] Server running on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Fail to start express + vite server:", err);
});
