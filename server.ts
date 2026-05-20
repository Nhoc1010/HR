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

// Enable JSON parsing
app.use(express.json());

// Initialize Gemini API with lazy initialization for enhanced security
let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Không tìm thấy cấu hình GEMINI_API_KEY trong biến môi trường. Vui lòng thiết lập khóa API trong phần cài đặt.");
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
app.post("/api/chat", async (req, res) => {
  try {
    const ai = getAI();
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
    res.status(500).json({ error: error.message || "Lỗi xử lý yêu cầu AI." });
  }
});

// 2. Draft labor contract
app.post("/api/draft-contract", async (req, res) => {
  try {
    const ai = getAI();
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
    res.status(500).json({ error: error.message || "Lỗi tạo hợp đồng." });
  }
});

// 3. Evaluate CV & Candidate
app.post("/api/analyze-candidate", async (req, res) => {
  try {
    const ai = getAI();
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
    res.status(500).json({ error: error.message || "Lỗi phân tích ứng viên." });
  }
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
