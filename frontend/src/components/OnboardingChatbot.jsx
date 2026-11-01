import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, ChevronDown, Loader2, Send } from "lucide-react";
import { useLocation } from "react-router-dom";

import { useLanguage } from "../context/LanguageContext";
import { aiApi } from "../utils/api";

const languageNames = {
  english: "English",
  hindi: "Hindi",
  bengali: "Bengali",
};

const translations = {
  english: {
    assistant: "ArthNiti Assistant",
    prompt: "How can I help you navigate ArthNiti?",
    placeholder: "Ask about the platform...",
    send: "Send message",
    close: "Close assistant",
    open: "Open assistant",
    thinking: "Thinking...",
    error: "I could not reach the assistant. Please try again.",
    sources: "Sources",
  },
  hindi: {
    assistant: "अर्थनीति सहायक",
    prompt: "मैं अर्थनीति पर आपकी कैसे मदद कर सकता हूँ?",
    placeholder: "प्लेटफ़ॉर्म के बारे में पूछें...",
    send: "संदेश भेजें",
    close: "सहायक बंद करें",
    open: "सहायक खोलें",
    thinking: "सोच रहा हूँ...",
    error: "सहायक से संपर्क नहीं हो सका। कृपया फिर कोशिश करें।",
    sources: "स्रोत",
  },
  bengali: {
    assistant: "অর্থনীতি সহায়ক",
    prompt: "অর্থনীতি ব্যবহার করতে আমি কীভাবে সাহায্য করতে পারি?",
    placeholder: "প্ল্যাটফর্ম সম্পর্কে জিজ্ঞাসা করুন...",
    send: "বার্তা পাঠান",
    close: "সহায়ক বন্ধ করুন",
    open: "সহায়ক খুলুন",
    thinking: "ভাবছি...",
    error: "সহায়কের সাথে যোগাযোগ করা যায়নি। আবার চেষ্টা করুন।",
    sources: "উৎস",
  },
};

const OnboardingChatbot = () => {
  const { language } = useLanguage();
  const { pathname } = useLocation();
  const t = translations[language] || translations.english;
  const isBusinessWorkspace = /^\/businesses\/[^/]+$/.test(pathname);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, messages, isSending]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending) return;

    setMessage("");
    setMessages((current) => [
      ...current,
      { role: "user", content: trimmedMessage },
    ]);
    setIsSending(true);

    try {
      const response = await aiApi.post("/api/v1/chat/onboarding", {
        message: trimmedMessage,
        language: languageNames[language] || languageNames.english,
      });

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: response.data.reply,
          sources: response.data.sources || [],
        },
      ]);
    } catch (error) {
      console.error("Onboarding assistant request failed:", error);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: t.error, isError: true },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className="fixed flex flex-col items-end gap-3"
      style={{
        right: "24px",
        bottom: isBusinessWorkspace ? "112px" : "24px",
        zIndex: 9999,
      }}
    >
      {isOpen && (
        <section
          aria-label={t.assistant}
          className="flex h-[min(600px,calc(100vh-110px))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-blue-400/20 bg-white dark:bg-gray-950/95 text-slate-900 dark:text-white shadow-2xl backdrop-blur-xl"
        >
          <header className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-blue-600/10 to-indigo-600/5 dark:from-blue-600/20 dark:to-indigo-600/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-300">
                <Bot size={20} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t.assistant}</h2>
                <p className="text-xs text-emerald-600 dark:text-emerald-300">● Online</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={t.close}
              title={t.close}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
            >
              <ChevronDown size={20} />
            </button>
          </header>

          <div
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            aria-live="polite"
          >
            {messages.length === 0 && (
              <div className="rounded-xl border border-blue-400/20 bg-blue-50 dark:bg-blue-500/5 p-4 text-sm leading-6 text-slate-700 dark:text-gray-300">
                {t.prompt}
              </div>
            )}

            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
                    item.role === "user"
                      ? "rounded-br-md bg-blue-600 !text-white"
                      : item.isError
                        ? "rounded-bl-md border border-red-400/20 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-200"
                        : "rounded-bl-md border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-gray-200"
                  }`}
                >
                  {item.role === "assistant" ? (
                    <ReactMarkdown
                      components={{
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 dark:text-blue-300 underline"
                          />
                        ),
                      }}
                    >
                      {item.content}
                    </ReactMarkdown>
                  ) : (
                    item.content
                  )}
                  {item.sources?.length > 0 && (
                    <div className="mt-3 border-t border-slate-200 dark:border-white/10 pt-2 text-xs text-slate-500 dark:text-gray-400">
                      <p className="mb-1 font-semibold text-slate-700 dark:text-gray-300">
                        {t.sources}
                      </p>
                      {item.sources.map((source) => (
                        <p key={source.chunk_id}>• {source.title}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400">
                <Loader2 size={14} className="animate-spin text-blue-500" />
                {t.thinking}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="border-t border-slate-200 dark:border-white/10 p-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-300 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/80 p-1.5 focus-within:border-blue-500">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={t.placeholder}
                disabled={isSending}
                aria-label={t.placeholder}
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-gray-500"
              />
              <button
                type="submit"
                disabled={isSending || !message.trim()}
                aria-label={t.send}
                title={t.send}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </section>
      )}

      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={t.open}
          title={t.open}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_12px_35px_rgba(37,99,235,0.45)] transition hover:scale-105 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-gray-950"
        >
          <Bot size={25} />
        </button>
      )}
    </div>
  );
};

export default OnboardingChatbot;
