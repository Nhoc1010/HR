import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Send, Key, Eye, EyeOff, X, Bot, User, 
  HelpCircle, ShieldAlert, CheckCircle2, ChevronDown, RefreshCw 
} from "lucide-react";
import { encryptData, decryptData } from "./StickyNotes";

interface Message {
  id: string;
  sender: "user" | "ai" | "system";
  text: string;
  timestamp: Date;
}

interface AiAssistantCornerProps {
  theme: "light" | "dark";
  accentColor: string;
  onAddNotification?: (title: string, message: string, type: "success" | "warn" | "info") => void;
}

export function AiAssistantCorner({ theme, accentColor, onAddNotification }: AiAssistantCornerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize and load secured API key
  useEffect(() => {
    try {
      const savedSecuredKey = localStorage.getItem("hrm_gemini_api_key_secure");
      if (savedSecuredKey) {
        const decryptedKey = decryptData(savedSecuredKey);
        setApiKey(decryptedKey);
        setApiKeyInput(decryptedKey);
      }
    } catch (e) {
      console.error("Error loading secured API Key:", e);
    }
  }, []);

  // Set default welcoming message once component rises
  useEffect(() => {
    setMessages([
      {
        id: "msg-welcome",
        sender: "ai",
        text: "Xin chào! Tôi là **Trợ lý AI hỗ trợ phần mềm HRM Pro**.\n\nĐể kích hoạt hệ thống đàm thoại và sử dụng sức mạnh AI, vui lòng nhập khóa **Gemini API Key** của bạn ở thanh điều khiển phía trên. Khóa này sẽ được hệ thống mã hóa đầu cuối và lưu an toàn tại máy khách của riêng bạn, đáp ứng tuyệt đối bảo mật quốc tế.\n\nBạn muốn tìm hiểu chủ đề gì hôm nay?",
        timestamp: new Date()
      }
    ]);
  }, []);

  // Scroll to bottom helper
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSaveKey = () => {
    try {
      if (!apiKeyInput.trim()) {
        localStorage.removeItem("hrm_gemini_api_key_secure");
        setApiKey("");
        if (onAddNotification) {
          onAddNotification("Bảo mật AI", "Đã xóa Gemini API Key khỏi hệ thống lưu trữ.", "warn");
        }
        return;
      }

      const encrypted = encryptData(apiKeyInput.trim());
      localStorage.setItem("hrm_gemini_api_key_secure", encrypted);
      setApiKey(apiKeyInput.trim());
      setErrorStatus(null);
      
      if (onAddNotification) {
        onAddNotification("Bảo mật AI", "Nhập khóa API thành công! Trợ lý AI đã được kích hoạt.", "success");
      }
    } catch (e) {
      console.error("Error saving secured API key:", e);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText ? customText.trim() : inputText.trim();
    if (!textToSend) return;
    if (!apiKey) {
      setErrorStatus("Vui lòng thiết lập khóa Gemini API Key phía trên để đàm thoại với AI.");
      return;
    }

    // Add user message to history
    const userMsgId = `msg-user-${Date.now()}`;
    const newMsg: Message = {
      id: userMsgId,
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMsg]);
    if (!customText) setInputText("");
    setIsSending(true);
    setErrorStatus(null);

    // Format historical messages for context
    const chatHistory = messages
      .filter(m => m.id !== "msg-welcome")
      .map(m => ({
        sender: m.sender === "user" ? "user" : "model",
        text: m.text
      }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-key": apiKey // Deliver API Key security header strictly derived from user configuration
        },
        body: JSON.stringify({
          message: textToSend,
          chatHistory: chatHistory
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Không thể nhận được phản hồi phù hợp từ cổng máy chủ AI.");
      }

      setMessages(prev => [
        ...prev,
        {
          id: `msg-ai-${Date.now()}`,
          sender: "ai",
          text: data.text,
          timestamp: new Date()
        }
      ]);
    } catch (err: any) {
      console.error("AI Assistant service error:", err);
      setErrorStatus(err.message || "Đường truyền AI gián đoạn. Vui lòng thử lại!");
      setMessages(prev => [
        ...prev,
        {
          id: `msg-sys-${Date.now()}`,
          sender: "system",
          text: `⚠️ **Lỗi kết nối**: ${err.message || "Vui lòng xem lại API Key đã nhập chính xác hay chưa."}`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Safe inline regex-based Markdown text parser
  const parseInlineBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-extrabold text-indigo-400 bg-indigo-500/10 px-1 py-0.5 rounded border border-indigo-500/15">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const parseMarkdownLine = (line: string, index: number) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("### ")) {
      return <h4 key={index} className="text-[13px] font-black text-blue-400 mt-3 mb-1">{parseInlineBold(line.slice(4))}</h4>;
    }
    if (trimmed.startsWith("## ")) {
      return <h3 key={index} className="text-sm font-black text-indigo-300 mt-4 mb-1.5">{parseInlineBold(line.slice(3))}</h3>;
    }
    if (trimmed.startsWith("# ")) {
      return <h2 key={index} className="text-base font-black text-indigo-400 mt-5 mb-2">{parseInlineBold(line.slice(2))}</h2>;
    }
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      return (
        <li key={index} className="ml-3 list-disc text-[11px] text-slate-350 leading-relaxed mb-1">
          {parseInlineBold(line.slice(2))}
        </li>
      );
    }
    if (line.match(/^\d+\.\s/)) {
      const text = line.replace(/^\d+\.\s/, "");
      return (
        <li key={index} className="ml-3 list-decimal text-[11px] text-slate-350 leading-relaxed mb-1">
          {parseInlineBold(text)}
        </li>
      );
    }
    if (trimmed === "") {
      return <div key={index} className="h-2.5" />;
    }
    return <p key={index} className="text-[11px] text-slate-300 leading-relaxed mb-1 py-0.5">{parseInlineBold(line)}</p>;
  };

  const formatText = (text: string) => {
    const lines = text.split("\n");
    return <div className="space-y-0.5 text-left">{lines.map((line, idx) => parseMarkdownLine(line, idx))}</div>;
  };

  // Quick action queries triggers
  const suggestions = [
    "Quy trình soạn thảo HĐLĐ chuẩn luật?",
    "Mẹo thiết kế KPI hiệu quả?",
    "Hỏi luật chế độ thai sản mới nhất",
  ];

  const hasApiKey = apiKey.trim().length > 0;

  return (
    <div className="fixed bottom-18 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`w-[390px] h-[580px] rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border flex flex-col backdrop-blur-3xl mb-4
              ${theme === "light" 
                ? "bg-white/95 border-slate-200 text-slate-800 shadow-slate-300/40" 
                : "bg-[#0c0d15]/95 border-white/10 text-slate-100"
              }`}
          >
            {/* Header Dialog Area */}
            <div className={`p-4 flex items-center justify-between border-b relative
              ${theme === "light" ? "border-slate-100 bg-slate-50/50" : "border-white/5 bg-slate-950/40"}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500/30 to-purple-600/30 flex items-center justify-center border border-indigo-500/20 shadow-inner">
                  <Bot className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">Trợ lý AI - HRM Pro</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${hasApiKey ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-450 text-slate-400">
                      {hasApiKey ? "KÍCH HOẠT SẴN SÀNG" : "YÊU CẦU GEMINI KEY"}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* API KEY CONTROLLERS - MANDATORY TO ACTIVATE AI */}
            <div className={`p-3.5 border-b flex flex-col gap-2 relative
              ${theme === "light" ? "bg-amber-50/30 border-slate-100" : "bg-indigo-950/10 border-white/5"}`}
            >
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Gemini API Credential (Không tự động)</span>
                </label>
                {hasApiKey && (
                  <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    ĐÃ KHÓA BẢO MẬT
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="Nhập khóa API của bạn..."
                    className={`w-full text-xs font-mono px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-1 transition-all pr-8
                      ${theme === "light" 
                        ? "bg-slate-100 border-slate-200 focus:ring-slate-400 focus:border-slate-400" 
                        : "bg-slate-950/80 border-slate-800 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSaveKey}
                  style={{ backgroundColor: accentColor }}
                  className="font-bold text-[11px] px-3.5 rounded-xl text-white hover:opacity-90 transition-all select-none shadow hover:shadow-indigo-500/20 active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3 animate-spin duration-3000" style={{ animationPlayState: isSending ? "running" : "paused" }} />
                  <span>Xác nhận</span>
                </button>
              </div>
              <p className="text-[9px] text-zinc-400 leading-relaxed">
                Hệ thống <b>không tự động thêm khóa API</b>. Nhập khóa để kích hoạt dịch vụ đối thoại trực quan. Bạn có thể lấy khóa miễn phí tại Google AI Studio.
              </p>
            </div>

            {/* Conversation Core */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth flex flex-col
              ${theme === "light" ? "bg-slate-50/50" : "bg-slate-950/20"}`}
              style={{ scrollbarWidth: "thin" }}
            >
              {messages.map((message) => {
                const isAi = message.sender === "ai";
                const isSys = message.sender === "system";

                if (isSys) {
                  return (
                    <div key={message.id} className="flex justify-center my-1.5 self-center">
                      <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 max-w-[90%] text-left flex gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>{formatText(message.text)}</div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 max-w-[85%] ${isAi ? "self-start align-top" : "self-end flex-row-reverse align-top"}`}
                  >
                    <div className={`w-8 h-8 rounded-xl shrink-0 border flex items-center justify-center shadow
                      ${isAi 
                        ? theme === "light" ? "bg-slate-100 border-slate-200 text-slate-600" : "bg-[#181a28] border-indigo-500/20 text-indigo-400"
                        : theme === "light" ? "bg-indigo-100 border-indigo-200 text-indigo-700" : "bg-indigo-950/40 border-indigo-500/30 text-indigo-300"
                      }`}
                    >
                      {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <div className={`px-3.5 py-3.5 rounded-3xl text-xs shadow-md border leading-relaxed
                        ${isAi 
                          ? theme === "light" 
                            ? "bg-white border-slate-250 text-slate-800 rounded-tl-sm shadow-slate-200/50" 
                            : "bg-[#141523]/80 border-slate-850 text-slate-200 rounded-tl-sm shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                          : theme === "light"
                            ? "bg-indigo-600 border-indigo-500 text-white rounded-tr-sm"
                            : "bg-indigo-900/60 border-indigo-500/20 text-slate-100 rounded-tr-sm"
                        }`}
                      >
                        {formatText(message.text)}
                      </div>
                      <span className="text-[8px] text-slate-500 font-mono tracking-wide px-1">
                        {message.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isSending && (
                <div className="flex gap-3 max-w-[85%] self-start items-center">
                  <div className="w-8 h-8 rounded-xl shrink-0 border flex items-center justify-center bg-[#181a28] border-indigo-500/20 text-indigo-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-[#141523]/80 border border-slate-850 text-slate-300 rounded-tl-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-0" />
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce duration-1000 delay-150" />
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce duration-1200 delay-300" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ERROR STATS BAR */}
            {errorStatus && (
              <div className="px-4 py-2 bg-rose-500/10 border-t border-b border-rose-500/20 text-rose-400 text-[10px] items-start flex gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorStatus}</span>
              </div>
            )}

            {/* Quick Suggestions block */}
            <div className={`p-2.5 border-t flex flex-wrap gap-1.5 shrink-0 select-none
              ${theme === "light" ? "bg-slate-50/30 border-slate-100" : "bg-slate-950/20 border-white/5"}`}
            >
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(sug)}
                  disabled={!hasApiKey || isSending}
                  className="px-2.5 py-1 text-[10px] rounded-full border border-indigo-500/10 hover:border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-400 transition-all cursor-pointer whitespace-nowrap disabled:opacity-45 disabled:pointer-events-none"
                >
                  {sug}
                </button>
              ))}
            </div>

            {/* Input Form Fields */}
            <div className={`p-3 border-t flex gap-2 shrink-0
              ${theme === "light" ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-white/5"}`}
            >
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!hasApiKey || isSending}
                placeholder={hasApiKey ? "Nhập câu hỏi của bạn tại đây..." : "⚡ Nhập API Key phía trên để mở khóa... "}
                className={`flex-1 rounded-xl text-xs px-3 py-2.5 resize-none focus:outline-none focus:ring-1 h-12 border transition-all max-h-24
                  ${theme === "light" 
                    ? "bg-white border-slate-200 focus:ring-indigo-500/50 focus:border-indigo-500/50" 
                    : "bg-slate-950 border-slate-800 text-slate-200 focus:ring-indigo-500/40 focus:border-indigo-500/40"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!hasApiKey || isSending || !inputText.trim()}
                style={{ backgroundColor: hasApiKey && inputText.trim() ? accentColor : undefined }}
                className={`w-12 rounded-xl flex items-center justify-center transition-all select-none border border-white/5 relative
                  ${hasApiKey && inputText.trim()
                    ? "text-white shadow hover:opacity-90 active:scale-95 cursor-pointer" 
                    : "bg-white/5 text-slate-500 cursor-not-allowed"
                  }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING ACTION TRIGGER BUBBLE BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          backgroundColor: accentColor,
          boxShadow: `0 8px 32px rgba(${parseInt(accentColor.slice(1,3), 16) || 99}, ${parseInt(accentColor.slice(3,5), 16) || 102}, ${parseInt(accentColor.slice(5,7), 16) || 241}, 0.35)` 
        }}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white cursor-pointer active:scale-90 hover:scale-105 transition-all outline-none border border-white/10 relative group select-none`}
        title="Trợ lý AI Hỗ trợ hệ thống"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="down"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="sparkles"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <Sparkles className="w-6 h-6 text-white" />
              {!hasApiKey && (
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-amber-500 border border-slate-950 flex items-center justify-center animate-pulse">
                  <span className="text-[7px] font-black leading-none text-slate-950">!</span>
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
