import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bot,
  ChevronDown,
  ChevronUp,
  ImagePlus,
  Landmark,
  Loader2,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RefreshCw,
  RotateCcw,
  Send,
  User,
  WalletCards,
} from "lucide-react";

import { aiApi } from "../../../utils/api";
import { supabase } from "../../../utils/supabase";
import { useLanguage } from "../../../context/LanguageContext";
import ImageLightbox from "../../../components/ImageLightbox";
import BusinessScopeBadge from "./components/BusinessScopeBadge";

const CHAT_IMAGE_BUCKET = "chat-images";

const translations = {
  english: {
    myBusinesses: "My Businesses",
    workspaceTitle: "AI Business Workspace",
    workspaceHeading: "Business Workspace",
    businessIdLabel: "Business ID",
    hideModules: "Hide Modules",
    showModules: "Show Modules",
    chatSessions: "Chat Sessions",
    conversation: "conversation",
    conversations: "conversations",
    loadingConversations: "Loading conversations...",
    unableToLoadSessions: "Unable to load sessions",
    tryAgain: "Try Again",
    retryMessage: "Retry Send",
    failedToSendMessage: "Failed to send message. Please try again.",
    noSessionsYet: "No chat sessions yet",
    startChatPrompt: "Start a conversation with your AI Business Assistant.",
    startNewChat: "Start New Chat",
    newChat: "New Chat",
    aiAssistant: "AI Business Assistant",
    businessConversation: "Active business conversation",
    startConversationPrompt: "Start a new business conversation",
    conversationPlaceholderTitle: "Start a business conversation",
    conversationPlaceholderDesc:
      "Ask questions about market demand, feasibility, competitors, financing, and government schemes.",
    loadingConversation: "Loading conversation...",
    unableToLoadConversation: "Unable to load conversation",
    noMessagesYet: "No messages yet",
    noMessagesDesc:
      "Send a message below to start chatting with your AI assistant.",
    inputPlaceholder: "Ask about feasibility, competitors, schemes...",
    sending: "Sending...",
    send: "Send",
    modules: {
      businessAnalysis: {
        title: "Business Analysis",
        description:
          "Explore market demand, population, competitors, supply chain and feasibility.",
      },
      financialAnalysis: {
        title: "Financial Analysis",
        description:
          "Review investment, revenue, expenses, profitability and repayment insights.",
      },
      governmentSchemes: {
        title: "Government Schemes",
        description:
          "Discover schemes and assistance relevant to this business.",
      },
    },
  },
  hindi: {
    myBusinesses: "मेरे व्यवसाय",
    workspaceTitle: "एआई बिज़नेस वर्कस्पेस",
    workspaceHeading: "बिज़नेस वर्कस्पेस",
    businessIdLabel: "व्यवसाय आईडी",
    hideModules: "मॉड्यूल छिपाएं",
    showModules: "मॉड्यूल दिखाएं",
    chatSessions: "चैट सत्र",
    conversation: "बातचीत",
    conversations: "बातचीत",
    loadingConversations: "बातचीत लोड हो रही है...",
    unableToLoadSessions: "सत्र लोड करने में असमर्थ",
    tryAgain: "पुनः प्रयास करें",
    retryMessage: "पुनः भेजें",
    failedToSendMessage: "संदेश भेजने में विफल। कृपया पुनः प्रयास करें।",
    noSessionsYet: "अभी तक कोई बातचीत नहीं",
    startChatPrompt: "अपने एआई बिज़नेस असिस्टेंट के साथ बातचीत शुरू करें।",
    startNewChat: "नई चैट शुरू करें",
    newChat: "नई बातचीत",
    aiAssistant: "एआई बिज़नेस असिस्टेंट",
    businessConversation: "सक्रिय व्यापार वार्तालाप",
    startConversationPrompt: "एक नया व्यापार वार्तालाप शुरू करें",
    conversationPlaceholderTitle: "एक व्यापार वार्तालाप शुरू करें",
    conversationPlaceholderDesc:
      "बाजार की मांग, व्यवहार्यता, प्रतिस्पर्धियों, वित्तपोषण और सरकारी योजनाओं के बारे में प्रश्न पूछें।",
    loadingConversation: "बातचीत लोड हो रही है...",
    unableToLoadConversation: "बातचीत लोड करने में असमर्थ",
    noMessagesYet: "अभी तक कोई संदेश नहीं",
    noMessagesDesc:
      "अपने एआई सहायक के साथ बातचीत शुरू करने के लिए नीचे एक संदेश भेजें।",
    inputPlaceholder: "मांग, प्रतिस्पर्धियों, योजनाओं आदि के बारे में पूछें...",
    sending: "भेज रहे हैं...",
    send: "भेजें",
    modules: {
      businessAnalysis: {
        title: "व्यवसाय विश्लेषण",
        description:
          "बाजार मांग, जनसंख्या, प्रतिस्पर्धियों, आपूर्ति श्रृंखला और व्यवहार्यता का पता लगाएं।",
      },
      financialAnalysis: {
        title: "वित्तीय विश्लेषण",
        description:
          "निवेश, राजस्व, व्यय, लाभप्रदता और ऋण पुनर्भुगतान अंतर्दृष्टि की समीक्षा करें।",
      },
      governmentSchemes: {
        title: "सरकारी योजनाएं",
        description:
          "इस व्यवसाय से संबंधित योजनाओं और सरकारी सहायता की खोज करें।",
      },
    },
  },
  bengali: {
    myBusinesses: "আমার ব্যবসা",
    workspaceTitle: "এআই বিজনেস ওয়ার্কস্পেস",
    workspaceHeading: "বিজনেস ওয়ার্কস্পেস",
    businessIdLabel: "ব্যবসা আইডি",
    hideModules: "মডিউল লুকান",
    showModules: "মডিউল দেখুন",
    chatSessions: "চ্যাট সেশন",
    conversation: "কথোপকথন",
    conversations: "কথোপকথন",
    loadingConversations: "কথোপকথন লোড হচ্ছে...",
    unableToLoadSessions: "সেশন লোড করা যায়নি",
    tryAgain: "আবার চেষ্টা করুন",
    retryMessage: "আবার পাঠান",
    failedToSendMessage:
      "বার্তা পাঠাতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
    noSessionsYet: "এখনও কোনো চ্যাট সেশন নেই",
    startChatPrompt:
      "আপনার এআই বিজনেস অ্যাসিস্ট্যান্টের সাথে আলোচনা শুরু করুন।",
    startNewChat: "নতুন চ্যাট শুরু করুন",
    newChat: "নতুন চ্যাট",
    aiAssistant: "এআই বিজনেস অ্যাসিস্ট্যান্ট",
    businessConversation: "সক্রিয় ব্যবসায়িক কথোপকথন",
    startConversationPrompt: "একটি নতুন ব্যবসায়িক আলোচনা শুরু করুন",
    conversationPlaceholderTitle: "ব্যবসায়িক আলোচনা শুরু করুন",
    conversationPlaceholderDesc:
      "বাজারের চাহিদা, সম্ভাব্যতা, প্রতিযোগী, ঋণ ও সরকারি প্রকল্প সম্পর্কে প্রশ্ন করুন।",
    loadingConversation: "কথোপকথন লোড হচ্ছে...",
    unableToLoadConversation: "কথোপকথন লোড করা যায়নি",
    noMessagesYet: "এখনও কোনো বার্তা নেই",
    noMessagesDesc: "আপনার এআই সহায়কের সাথে কথা বলতে নিচে একটি বার্তা পাঠান।",
    inputPlaceholder:
      "বাজারের চাহিদা, প্রতিযোগী, প্রকল্প ইত্যাদি সম্পর্কে জিজ্ঞাসা করুন...",
    sending: "পাঠানো হচ্ছে...",
    send: "পাঠান",
    modules: {
      businessAnalysis: {
        title: "ব্যবসা বিশ্লেষণ",
        description:
          "বাজারের চাহিদা, জনসংখ্যা, প্রতিযোগী ও সম্ভাব্যতার বিশদ বিবরণ দেখুন।",
      },
      financialAnalysis: {
        title: "আর্থিক বিশ্লেষণ",
        description: "বিনিয়োগ, আয়, ব্যয় এবং লাভজনকতার পর্যালোচনা করুন।",
      },
      governmentSchemes: {
        title: "সরকারি প্রকল্প",
        description:
          "এই ব্যবসার সাথে সম্পর্কিত বিভিন্ন সরকারি প্রকল্পের সুযোগ অন্বেষণ করুন।",
      },
    },
  },
};

const BusinessWorkspace = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const t = translations[language] || translations.english;

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);

  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const [sessionsError, setSessionsError] = useState("");
  const [messagesError, setMessagesError] = useState("");

  const [inputMessage, setInputMessage] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState("");
  const [selectedChatImage, setSelectedChatImage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState(null);

  const [showModules, setShowModules] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending, sendError]);

  const fetchChatSessions = async () => {
    if (!businessId) return;

    try {
      setSessionsLoading(true);
      setSessionsError("");

      const response = await aiApi.get(
        `/api/v1/businesses/${businessId}/chat/sessions`,
        {
          params: {
            language: language || "en",
          },
        },
      );

      const fetchedSessions = response.data?.sessions || [];
      setSessions(fetchedSessions);

      if (fetchedSessions.length > 0) {
        setActiveSessionId((currentSessionId) => {
          const stillExists = fetchedSessions.some(
            (session) => session.session_id === currentSessionId,
          );
          return stillExists ? currentSessionId : fetchedSessions[0].session_id;
        });
      } else {
        setActiveSessionId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to fetch chat sessions:", error);
      setSessionsError(
        error.response?.data?.detail ||
          "Unable to load chat sessions. Please try again.",
      );
    } finally {
      setSessionsLoading(false);
    }
  };

  const fetchChatMessages = async (sessionId) => {
    if (!businessId || !sessionId) return;

    try {
      setMessagesLoading(true);
      setMessagesError("");
      setSendError(null);

      const response = await aiApi.get(
        `/api/v1/businesses/${businessId}/chat/sessions/${sessionId}`,
        {
          params: {
            language: language || "en",
          },
        },
      );

      setMessages(response.data?.messages || []);
    } catch (error) {
      console.error("Failed to fetch chat messages:", error);
      setMessagesError(
        error.response?.data?.detail ||
          "Unable to load this conversation. Please try again.",
      );
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    fetchChatSessions();
  }, [businessId, language]);

  useEffect(() => {
    if (!activeSessionId) {
      setMessages([]);
      setSendError(null);
      return;
    }
    fetchChatMessages(activeSessionId);
  }, [businessId, activeSessionId, language]);

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const uploadChatImage = async (file) => {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${businessId}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(CHAT_IMAGE_BUCKET)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from(CHAT_IMAGE_BUCKET)
      .getPublicUrl(fileName);

    if (!publicUrlData?.publicUrl) {
      throw new Error("Unable to create an image URL.");
    }

    return publicUrlData.publicUrl;
  };

  const sendMessageContent = async (
    textToSend,
    imageFile = null,
    tempMsgId = null,
  ) => {
    if ((!textToSend && !imageFile) || isSending || !businessId) return;

    setSendError(null);
    setIsSending(true);

    try {
      const imageBase64 = imageFile ? await fileToDataUrl(imageFile) : null;
      const supabaseUrl = imageFile ? await uploadChatImage(imageFile) : null;

      const response = await aiApi.post("/api/v1/assistant/chat", {
        business_id: businessId,
        message: textToSend || "Please analyze this image.",
        session_id: activeSessionId || null,
        language: language || "en",
        image_url: supabaseUrl,
        supabase_url: supabaseUrl,
        image_base64: imageBase64,
      });

      const {
        response: agentResponse,
        session_id: newSessionId,
        image_url: persistedImageUrl,
      } = response.data;

      // Update the optimistic message image with the persistent Supabase URL
      if (persistedImageUrl && tempMsgId) {
        setMessages((previous) =>
          previous.map((message) =>
            message.message_id === tempMsgId
              ? { ...message, image_url: persistedImageUrl }
              : message,
          ),
        );
      }

      const agentMsg = {
        message_id: `agent-${Date.now()}`,
        role: "agent",
        content: agentResponse,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, agentMsg]);

      if (!activeSessionId && newSessionId) {
        setActiveSessionId(newSessionId);
        fetchChatSessions();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setSendError({
        errorText: error.response?.data?.detail || t.failedToSendMessage,
        failedMessageText: textToSend,
        failedImageFile: imageFile,
        tempMsgId: tempMsgId,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();

    const trimmed = inputMessage.trim();
    if ((!trimmed && !selectedImageFile) || isSending || !businessId) return;

    const tempMsgId = `temp-${Date.now()}`;
    const previewUrl = selectedImagePreview;
    const imageFile = selectedImageFile;

    const optimisticUserMsg = {
      message_id: tempMsgId,
      role: "user",
      content: trimmed,
      image_url: previewUrl,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMsg]);
    setInputMessage("");
    setSelectedImageFile(null);
    setSelectedImagePreview("");

    await sendMessageContent(trimmed, imageFile, tempMsgId);
  };

  const handleRetryFailedMessage = () => {
    if (!sendError) return;
    const { failedMessageText, failedImageFile, tempMsgId } = sendError;
    sendMessageContent(failedMessageText, failedImageFile, tempMsgId);
  };

  const handleImageSelection = (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    if (selectedImagePreview) {
      URL.revokeObjectURL(selectedImagePreview);
    }

    setSelectedImageFile(file);
    setSelectedImagePreview(URL.createObjectURL(file));
    event.target.value = "";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const activeSession = sessions.find(
    (session) => session.session_id === activeSessionId,
  );

  const activeSessionTitle = activeSession?.title || t.aiAssistant;

  const formatSessionDate = (dateString) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return "";

      const now = new Date();
      const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

      if (isToday) return "Today";

      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);

      const isYesterday =
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear();

      if (isYesterday) return "Yesterday";

      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  const modules = [
    {
      title: t.modules.businessAnalysis.title,
      description: t.modules.businessAnalysis.description,
      icon: BarChart3,
      path: `/businesses/${businessId}/analysis`,
    },
    {
      title: t.modules.financialAnalysis.title,
      description: t.modules.financialAnalysis.description,
      icon: WalletCards,
      path: `/businesses/${businessId}/financial-analysis`,
    },
    {
      title: t.modules.governmentSchemes.title,
      description: t.modules.governmentSchemes.description,
      icon: Landmark,
      path: `/businesses/${businessId}/government-schemes`,
    },
  ];

  const handleSelectSession = (sessionId) => {
    if (sessionId === activeSessionId) return;
    setActiveSessionId(sessionId);
    setMessages([]);
    setSendError(null);
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setSendError(null);
  };

  const handleRetryMessages = () => {
    if (activeSessionId) {
      fetchChatMessages(activeSessionId);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950 text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 h-96 w-96 rounded-full bg-purple-600/5 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto flex h-screen w-full flex-col px-4 py-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="mb-3 shrink-0">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/businesses")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-white"
            >
              <ArrowLeft size={16} />
              {t.myBusinesses}
            </button>

            <button
              type="button"
              onClick={() => setShowModules((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-800 bg-gray-900/60 px-3 py-1.5 text-xs font-semibold text-gray-300 transition hover:border-gray-700 hover:text-white"
            >
              {showModules ? (
                <>
                  <ChevronUp size={14} />
                  {t.hideModules}
                </>
              ) : (
                <>
                  <ChevronDown size={14} />
                  {t.showModules}
                </>
              )}
            </button>
          </div>

          <div className="mt-2 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                <Bot size={15} />
                <span>{t.workspaceTitle}</span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                {t.workspaceHeading}
              </h1>
            </div>
            <BusinessScopeBadge businessId={businessId} className="shrink-0" />
          </div>
        </div>

        {/* Collapsible Modules */}
        <div
          className={`grid shrink-0 transition-all duration-300 ease-in-out ${
            showModules
              ? "mb-4 grid-rows-[1fr] opacity-100"
              : "mb-0 grid-rows-[0fr] opacity-0 pointer-events-none"
          }`}
        >
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 pt-1">
              {modules.map((module) => {
                const Icon = module.icon;
                return (
                  <button
                    key={module.title}
                    type="button"
                    onClick={() => navigate(module.path)}
                    className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/70 p-4 text-left shadow-[0_15px_40px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500/30 hover:bg-gray-900"
                  >
                    <div className="relative flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
                        <Icon size={20} className="text-blue-400" />
                      </div>
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-800 bg-gray-800/50 transition group-hover:border-blue-500/30 group-hover:bg-blue-500/10">
                        <ArrowRight
                          size={14}
                          className="text-gray-500 transition group-hover:translate-x-0.5 group-hover:text-blue-400"
                        />
                      </div>
                    </div>

                    <div className="relative mt-3">
                      <h2 className="text-sm font-bold text-white">
                        {module.title}
                      </h2>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-400">
                        {module.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Workspace Layout Container */}
        <div className="relative flex flex-1 min-h-0 overflow-hidden rounded-3xl border border-gray-800 bg-gray-900/60 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          {/* Collapsible Sidebar */}
          <aside
            className={`flex flex-col border-r border-gray-800 bg-gray-950/40 transition-all duration-300 ease-in-out ${
              isSidebarOpen
                ? "w-80 opacity-100"
                : "w-0 border-r-0 opacity-0 pointer-events-none"
            }`}
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-800 px-4">
              <div className="truncate pr-2">
                <h2 className="text-sm font-bold text-white">
                  {t.chatSessions}
                </h2>
                <p className="text-[11px] text-gray-500">
                  {sessions.length}{" "}
                  {sessions.length === 1 ? t.conversation : t.conversations}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleNewChat}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-800 bg-gray-900 text-gray-400 transition hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-400"
                  title={t.startNewChat}
                >
                  <Plus size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-800 bg-gray-900 text-gray-400 transition hover:border-gray-700 hover:text-white"
                  title="Close sidebar"
                >
                  <PanelLeftClose size={15} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {sessionsLoading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 size={20} className="animate-spin text-blue-400" />
                  <p className="mt-2 text-xs text-gray-500">
                    {t.loadingConversations}
                  </p>
                </div>
              )}

              {!sessionsLoading && sessionsError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                  <p className="text-xs font-semibold text-red-400">
                    {t.unableToLoadSessions}
                  </p>
                  <p className="mt-1 text-[11px] leading-4 text-gray-500">
                    {sessionsError}
                  </p>
                  <button
                    type="button"
                    onClick={fetchChatSessions}
                    className="mt-3 inline-flex items-center gap-1 rounded border border-gray-800 bg-gray-900 px-2 py-1 text-[11px] text-gray-300 transition hover:text-white"
                  >
                    <RefreshCw size={11} /> {t.tryAgain}
                  </button>
                </div>
              )}

              {!sessionsLoading && !sessionsError && sessions.length === 0 && (
                <div className="flex flex-col items-center justify-center px-2 py-10 text-center">
                  <MessageCircle size={20} className="text-gray-600" />
                  <p className="mt-2 text-xs font-semibold text-gray-400">
                    {t.noSessionsYet}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-600">
                    {t.startChatPrompt}
                  </p>
                  <button
                    type="button"
                    onClick={handleNewChat}
                    className="mt-3 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-500"
                  >
                    {t.startNewChat}
                  </button>
                </div>
              )}

              {!sessionsLoading &&
                !sessionsError &&
                sessions.length > 0 &&
                sessions.map((session) => {
                  const isActive = session.session_id === activeSessionId;
                  return (
                    <button
                      key={session.session_id}
                      type="button"
                      onClick={() => handleSelectSession(session.session_id)}
                      className={`mb-2 w-full rounded-xl border p-2.5 text-left transition-all duration-200 ${
                        isActive
                          ? "border-blue-500/30 bg-blue-500/10 shadow-[0_5px_15px_rgba(37,99,235,0.06)]"
                          : "border-transparent hover:border-gray-800 hover:bg-gray-800/40"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                            isActive ? "bg-blue-500/10" : "bg-gray-800/70"
                          }`}
                        >
                          <MessageCircle
                            size={14}
                            className={
                              isActive ? "text-blue-400" : "text-gray-500"
                            }
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate text-xs font-semibold ${
                              isActive ? "text-white" : "text-gray-300"
                            }`}
                          >
                            {session.title || t.newChat}
                          </p>
                          <p className="text-[10px] text-gray-600">
                            {formatSessionDate(session.created_at)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </aside>

          {/* Chat Workspace Main Area */}
          <section className="flex flex-1 min-w-0 flex-col h-full overflow-hidden">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-800 px-4 sm:px-6">
              <div className="flex items-center gap-3">
                {!isSidebarOpen && (
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(true)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-800 bg-gray-900 text-gray-400 transition hover:border-gray-700 hover:text-white"
                    title="Open sidebar"
                  >
                    <PanelLeftOpen size={16} />
                  </button>
                )}

                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10">
                  <Bot size={18} className="text-blue-400" />
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-sm font-bold text-white">
                    {activeSessionId ? activeSessionTitle : t.aiAssistant}
                  </h2>
                  <p className="text-[11px] text-gray-500">
                    {activeSessionId
                      ? t.businessConversation
                      : t.startConversationPrompt}
                  </p>
                </div>
              </div>
            </div>

            {/* Scrolling Chat Container */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 sm:px-8">
              {!activeSessionId && messages.length === 0 && (
                <div className="flex h-full min-h-[300px] items-center justify-center">
                  <div className="max-w-md text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
                      <Bot size={24} className="text-blue-400" />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-white">
                      {t.conversationPlaceholderTitle}
                    </h3>
                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      {t.conversationPlaceholderDesc}
                    </p>
                  </div>
                </div>
              )}

              {activeSessionId && messagesLoading && (
                <div className="flex h-full min-h-[300px] items-center justify-center">
                  <Loader2 size={24} className="animate-spin text-blue-400" />
                </div>
              )}

              {activeSessionId && !messagesLoading && messagesError && (
                <div className="flex h-full min-h-[300px] items-center justify-center">
                  <div className="text-center">
                    <p className="text-xs font-semibold text-red-400">
                      {messagesError}
                    </p>
                    <button
                      type="button"
                      onClick={handleRetryMessages}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-gray-800 bg-gray-900 px-3 py-1.5 text-xs text-gray-300 transition hover:text-white"
                    >
                      <RefreshCw size={13} /> {t.tryAgain}
                    </button>
                  </div>
                </div>
              )}

              {activeSessionId &&
                !messagesLoading &&
                !messagesError &&
                messages.length === 0 && (
                  <div className="flex h-full min-h-[300px] items-center justify-center text-center">
                    <div>
                      <MessageCircle
                        size={22}
                        className="mx-auto text-gray-600"
                      />
                      <h3 className="mt-2 text-xs font-semibold text-gray-400">
                        {t.noMessagesYet}
                      </h3>
                      <p className="mt-1 text-xs text-gray-600">
                        {t.noMessagesDesc}
                      </p>
                    </div>
                  </div>
                )}

              {messages.length > 0 && (
                <div className="w-full space-y-4">
                  {messages.map((message) => {
                    const isUser = message.role === "user";
                    return (
                      <div
                        key={message.message_id}
                        className={`flex gap-3 ${
                          isUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isUser && (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10">
                            <Bot size={16} className="text-blue-400" />
                          </div>
                        )}

                        <div
                          className={`max-w-[94%] rounded-2xl border px-4 py-2.5 ${
                            isUser
                              ? "border-blue-500/20 bg-blue-600/20 text-gray-100"
                              : "w-full border-gray-800 bg-gray-900/80 text-gray-200"
                          }`}
                        >
                          {message.image_url && (
                            <button
                              type="button"
                              className="mb-2 block max-w-full overflow-hidden rounded-xl text-left"
                              onClick={() =>
                                setSelectedChatImage(message.image_url)
                              }
                              aria-label="Open chat image"
                            >
                              <img
                                src={message.image_url}
                                alt="Chat attachment"
                                className="max-h-64 max-w-full cursor-zoom-in rounded-xl object-contain transition hover:opacity-90"
                              />
                            </button>
                          )}
                          {isUser ? (
                            <p className="whitespace-pre-wrap text-sm leading-6">
                              {message.content}
                            </p>
                          ) : (
                            <div className="text-sm leading-relaxed space-y-2">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  p: ({ node, ...props }) => (
                                    <p className="leading-6 my-1" {...props} />
                                  ),
                                  strong: ({ node, ...props }) => (
                                    <strong
                                      className="font-bold text-white"
                                      {...props}
                                    />
                                  ),
                                  ul: ({ node, ...props }) => (
                                    <ul
                                      className="list-disc pl-5 my-2 space-y-1"
                                      {...props}
                                    />
                                  ),
                                  ol: ({ node, ...props }) => (
                                    <ol
                                      className="list-decimal pl-5 my-2 space-y-1"
                                      {...props}
                                    />
                                  ),
                                  li: ({ node, ...props }) => (
                                    <li className="text-gray-300" {...props} />
                                  ),
                                  h1: ({ node, ...props }) => (
                                    <h1
                                      className="text-base font-bold text-white mt-3 mb-1"
                                      {...props}
                                    />
                                  ),
                                  h2: ({ node, ...props }) => (
                                    <h2
                                      className="text-sm font-bold text-white mt-2 mb-1"
                                      {...props}
                                    />
                                  ),
                                  h3: ({ node, ...props }) => (
                                    <h3
                                      className="text-xs font-semibold text-blue-300 mt-2 mb-0.5"
                                      {...props}
                                    />
                                  ),
                                  blockquote: ({ node, ...props }) => (
                                    <blockquote
                                      className="border-l-2 border-blue-500 pl-3 my-2 text-xs italic text-gray-400"
                                      {...props}
                                    />
                                  ),
                                  code: ({ node, inline, ...props }) =>
                                    inline ? (
                                      <code
                                        className="rounded bg-gray-800 px-1.5 py-0.5 text-xs text-blue-300 font-mono"
                                        {...props}
                                      />
                                    ) : (
                                      <div className="overflow-x-auto rounded-lg bg-gray-950 p-3 my-2 border border-gray-800">
                                        <code
                                          className="text-xs font-mono text-gray-300 block"
                                          {...props}
                                        />
                                      </div>
                                    ),
                                  table: ({ node, ...props }) => (
                                    <div className="overflow-x-auto my-3 rounded-lg border border-gray-800">
                                      <table
                                        className="w-full text-left text-xs border-collapse"
                                        {...props}
                                      />
                                    </div>
                                  ),
                                  th: ({ node, ...props }) => (
                                    <th
                                      className="border-b border-gray-800 bg-gray-800/40 p-2 font-semibold text-gray-200"
                                      {...props}
                                    />
                                  ),
                                  td: ({ node, ...props }) => (
                                    <td
                                      className="border-b border-gray-800/50 p-2 text-gray-300"
                                      {...props}
                                    />
                                  ),
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          )}

                          {message.created_at && (
                            <p className="mt-1 text-[10px] text-gray-600 text-right">
                              {new Date(message.created_at).toLocaleTimeString(
                                "en-IN",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          )}
                        </div>

                        {isUser && (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-800 bg-gray-800">
                            <User size={15} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Sending Loader Bubble */}
                  {isSending && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10">
                        <Bot size={16} className="text-blue-400" />
                      </div>
                      <div className="flex items-center gap-2 rounded-2xl border border-gray-800 bg-gray-900/80 px-4 py-3 text-sm text-gray-400">
                        <Loader2
                          size={16}
                          className="animate-spin text-blue-400"
                        />
                        <span className="text-xs">{t.sending}</span>
                      </div>
                    </div>
                  )}

                  {/* Failed Message Error & Retry Option */}
                  {sendError && !isSending && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10">
                        <AlertCircle size={16} className="text-red-400" />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                        <span className="text-xs text-red-300">
                          {sendError.errorText}
                        </span>
                        <button
                          type="button"
                          onClick={handleRetryFailedMessage}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-200 transition hover:bg-red-500/30 hover:text-white shrink-0 self-start sm:self-auto"
                        >
                          <RotateCcw size={13} />
                          {t.retryMessage}
                        </button>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Composer Box */}
            <div className="shrink-0 border-t border-gray-800 p-3 sm:p-4">
              {selectedImagePreview && (
                <div className="mb-2 flex items-center gap-2">
                  <img
                    src={selectedImagePreview}
                    alt="Selected chat attachment"
                    className="h-16 w-16 rounded-lg border border-gray-700 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedImagePreview) {
                        URL.revokeObjectURL(selectedImagePreview);
                      }
                      setSelectedImageFile(null);
                      setSelectedImagePreview("");
                    }}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Remove image
                  </button>
                </div>
              )}
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2 rounded-2xl border border-gray-800 bg-gray-950/80 p-1.5 focus-within:border-blue-500/40"
              >
                <label
                  htmlFor="chat-image-upload"
                  className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-800 hover:text-white ${
                    isSending ? "pointer-events-none opacity-40" : ""
                  }`}
                  title="Attach image"
                >
                  <ImagePlus size={16} />
                </label>
                <input
                  id="chat-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelection}
                  disabled={isSending}
                  className="hidden"
                />
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.inputPlaceholder}
                  disabled={isSending}
                  className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none disabled:opacity-50"
                />

                <button
                  type="submit"
                  disabled={
                    (!inputMessage.trim() && !selectedImageFile) || isSending
                  }
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isSending ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <>
                      <Send size={14} />
                      <span className="hidden sm:inline">{t.send}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>
      <ImageLightbox
        src={selectedChatImage}
        alt="Chat attachment"
        onClose={() => setSelectedChatImage("")}
      />
    </div>
  );
};

export default BusinessWorkspace;
