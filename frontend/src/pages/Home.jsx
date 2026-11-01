import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import {
  MapPin,
  BrainCircuit,
  Calculator,
  Landmark,
  MessageCircle,
  BarChart3,
  ShieldCheck,
  TrendingUp,
  Users,
  ArrowRight,
  CheckCircle2,
  Database,
  Languages,
  Store,
  Building2,
  WalletCards,
  Target,
  Sparkles,
  Award,
} from "lucide-react";

const Home = () => {
  const { language } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  const dashboardPath = isAuthenticated ? "/dashboard" : "/login";

  const translations = {
    english: {
      // Hero
      badge: "AI-POWERED RURAL BUSINESS ADVISORY",
      title1: "Build the Right Business.",
      title2: "Backed by Local Data.",
      description:
        "An AI-powered hyper-local business advisory and financial structuring assistant designed to help rural and semi-urban entrepreneurs make smarter, data-driven decisions.",
      getStarted: "Get Started",
      explore: "Explore Features",

      // App Mockup (Visual) Translations
      appTitle: "Finance AI",
      appSubtitle: "Business Intelligence",
      aiActive: "AI Active",
      marketOpp: "Market Opportunity",
      high: "High",
      marketReach: "Market Reach",
      localDemand: "Local Demand",
      strong: "Strong",
      opportunity: "Opportunity",
      riskLevel: "Risk Level",
      moderate: "Moderate",
      recStrategy: "Recommended Strategy",
      recStrategyDesc: "Local demand supports the proposed business model.",

      // Stats
      stat1: "Hyper-Local",
      stat1Desc: "Business Intelligence",
      stat2: "AI-Powered",
      stat2Desc: "Feasibility Analysis",
      stat3: "Smart",
      stat3Desc: "Financial Structuring",
      stat4: "Multilingual",
      stat4Desc: "Rural Accessibility",

      // Input section
      advisoryTitle: "Your Business Idea. Our Intelligence.",
      advisoryDesc:
        "Provide three simple inputs and let our AI build a localized business strategy and financial roadmap for you.",
      location: "Your Location",
      locationDesc: "Village / Block / District",
      capital: "Available Capital",
      capitalDesc: "Your margin contribution",
      category: "Business Category",
      categoryDesc: "Dairy / Retail / Textiles etc.",
      directory: "Business Directory",
      directoryDesc:
        "Explore active local businesses by category and location, then connect with owners.",
      analyze: "Analyze My Business",

      // Module section
      modulesBadge: "THREE CORE MODULES",
      modulesTitle: "Everything You Need Before Starting",
      modulesDesc:
        "From understanding your local market to knowing exactly how much you can borrow, Finance Assistant brings institutional-grade business consulting to your fingertips.",

      module1Title: "Hyper-Local Business Feasibility",
      module1Desc:
        "Understand whether your business idea makes sense in your specific local economy.",
      module1Items: [
        "Market reach within 5–10 km",
        "Local competitor mapping",
        "Opportunity & underserved niches",
        "Localized SWOT analysis",
        "Supply chain & seasonal threats",
        "Regional product pricing",
      ],

      module2Title: "Smart Financial Calculator",
      module2Desc:
        "Turn your available margin capital into a clear and actionable financial roadmap.",
      module2Items: [
        "Calculate feasible project cost",
        "Calculate maximum loan eligibility",
        "Automatically select the right scheme",
        "Generate EMI & repayment schedule",
        "Estimate working capital needs",
        "Understand moratorium periods",
      ],

      module3Title: "Smart Scheme Recommender",
      module3Desc:
        "Automatically discover the best government schemes matched to your business profile, eligibility, and specific needs.",
      module3Items: [
        "Profile-based scheme matching",
        "Eligibility criteria verification",
        "Business need similarity scoring",
        "Subsidy & grant estimation",
        "Documentation checklist",
        "Application process guide",
      ],

      // How it works
      processBadge: "HOW IT WORKS",
      processTitle: "From Idea to Action in Four Steps",

      step1Title: "Tell Us About You",
      step1Desc:
        "Enter your location, available margin capital and proposed business category.",

      step2Title: "AI Studies Your Market",
      step2Desc:
        "Our system analyzes demographic, economic, market and competitor data.",

      step3Title: "Get Your Roadmap",
      step3Desc:
        "Receive a localized feasibility report and personalized financial structure.",

      step4Title: "Apply With Confidence",
      step4Desc:
        "Understand your scheme eligibility and make an informed funding decision.",

      // AI section
      aiBadge: "YOUR DIGITAL BUSINESS CONSULTANT",
      aiTitle: "Ask. Understand. Decide.",
      aiDesc:
        "Our multilingual AI Business Assistant stays with you beyond the feasibility report. Ask questions about your business, finances, schemes, markets and repayment plans in your preferred language.",
      chatNow: "Talk to AI Assistant",
      persistent: "Persistent Memory",
      persistentDesc:
        "Your business context stays available across conversations.",
      multilingual: "Multilingual",
      multilingualDesc: "Interact in English, Hindi or Bengali.",
      dataDriven: "Data Driven",
      dataDrivenDesc:
        "Answers are grounded in your business analysis and evidence.",

      // Financial example
      financeBadge: "SMART SCHEME ROUTER",
      financeTitle: "Know Exactly What You Can Afford",
      financeDesc:
        "Your available margin capital becomes the starting point for calculating your feasible project cost and loan eligibility.",

      margin: "Available Margin",
      projectCost: "Feasible Project Cost",
      loan: "Maximum Loan",
      example: "Example",
      exampleText:
        "With ₹1,00,000 available margin capital, the system calculates a ₹10,00,000 project cost and up to ₹9,00,000 concessional loan eligibility.",

      micro: "Micro Finance Scheme",
      microDesc: "Up to ₹1.40 lakh project cost",
      microRate: "6.5% Interest",
      microTenure: "3 Year Tenure",

      term: "Term Loan Scheme",
      termDesc: "₹1.40 lakh – ₹50 lakh project cost",
      termRate: "8% Interest",
      termTenure: "7 Year Tenure",

      // Impact
      impactBadge: "OUR IMPACT",
      impactTitle: "Making Entrepreneurship More Data-Driven",
      impact1: "Reduce Business Failure",
      impact1Desc:
        "Help entrepreneurs choose viable businesses based on actual local demand instead of guesswork.",
      impact2: "Eliminate Financial Confusion",
      impact2Desc:
        "Clearly explain margin contribution, loan eligibility and repayment obligations.",
      impact3: "Empower Rural Youth",
      impact3Desc:
        "Bring professional business intelligence to the grassroots through accessible AI.",

      // CTA
      ctaTitle: "Your Idea Could Become the Next Local Success Story.",
      ctaDesc:
        "Start with your location, your capital and your idea. Let AI handle the analysis.",
      ctaButton: "Start Your Business Analysis",

      // Footer
      footer:
        "AI-Driven Hyper-Local Business Advisory & Financial Structuring Assistant",
    },

    hindi: {
      badge: "एआई-संचालित ग्रामीण व्यवसाय सलाहकार",
      title1: "सही व्यवसाय शुरू करें।",
      title2: "स्थानीय डेटा के आधार पर।",
      description:
        "ग्रामीण और अर्ध-शहरी उद्यमियों के लिए बनाया गया एआई-संचालित हाइपर-लोकल बिज़नेस और वित्तीय सलाहकार, जो बेहतर और डेटा-आधारित निर्णय लेने में मदद करता है।",
      getStarted: "शुरू करें",
      explore: "फीचर्स देखें",

      // App Mockup (Visual) Translations
      appTitle: "फाइनेंस एआई",
      appSubtitle: "बिज़नेस इंटेलिजेंस",
      aiActive: "एआई सक्रिय",
      marketOpp: "बाजार का अवसर",
      high: "उच्च",
      marketReach: "बाजार पहुंच",
      localDemand: "स्थानीय मांग",
      strong: "मजबूत",
      opportunity: "अवसर",
      riskLevel: "जोखिम स्तर",
      moderate: "मध्यम",
      recStrategy: "अनुशंसित रणनीति",
      recStrategyDesc:
        "स्थानीय मांग प्रस्तावित व्यापार मॉडल का समर्थन करती है।",

      stat1: "हाइपर-लोकल",
      stat1Desc: "बिज़नेस इंटेलिजेंस",
      stat2: "एआई-संचालित",
      stat2Desc: "व्यवसाय विश्लेषण",
      stat3: "स्मार्ट",
      stat3Desc: "वित्तीय संरचना",
      stat4: "बहुभाषी",
      stat4Desc: "ग्रामीण पहुंच",

      advisoryTitle: "आपका बिज़नेस आइडिया। हमारी इंटेलिजेंस।",
      advisoryDesc:
        "तीन सरल जानकारी दें और हमारा एआई आपके लिए स्थानीय व्यवसाय रणनीति और वित्तीय रोडमैप तैयार करेगा।",
      location: "आपका स्थान",
      locationDesc: "गांव / ब्लॉक / जिला",
      capital: "उपलब्ध पूंजी",
      capitalDesc: "आपका मार्जिन योगदान",
      category: "व्यवसाय श्रेणी",
      categoryDesc: "डेयरी / रिटेल / टेक्सटाइल आदि",
      directory: "व्यवसाय निर्देशिका",
      directoryDesc:
        "श्रेणी और स्थान के आधार पर सक्रिय स्थानीय व्यवसाय खोजें और मालिकों से जुड़ें।",
      analyze: "मेरे व्यवसाय का विश्लेषण करें",

      modulesBadge: "तीन मुख्य मॉड्यूल",
      modulesTitle: "व्यवसाय शुरू करने से पहले सब कुछ जानें",
      modulesDesc:
        "स्थानीय बाजार को समझने से लेकर यह जानने तक कि आप कितना ऋण ले सकते हैं, Finance Assistant आपके लिए संस्थागत स्तर की बिज़नेस कंसल्टिंग उपलब्ध कराता है।",

      module1Title: "हाइपर-लोकल व्यवसाय व्यवहार्यता",
      module1Desc:
        "जानें कि आपका व्यवसाय आपके स्थानीय बाजार में वास्तव में सफल हो सकता है या नहीं।",
      module1Items: [
        "5–10 किमी के भीतर बाजार पहुंच",
        "स्थानीय प्रतिस्पर्धी मैपिंग",
        "अवसर और अनसेव्ड बाजार",
        "स्थानीय SWOT विश्लेषण",
        "सप्लाई चेन और मौसमी जोखिम",
        "स्थानीय उत्पाद मूल्य निर्धारण",
      ],

      module2Title: "स्मार्ट वित्तीय कैलकुलेटर",
      module2Desc:
        "अपनी उपलब्ध मार्जिन पूंजी को एक स्पष्ट वित्तीय योजना में बदलें।",
      module2Items: [
        "संभावित प्रोजेक्ट लागत की गणना",
        "अधिकतम ऋण पात्रता",
        "सही योजना का ऑटो चयन",
        "EMI और भुगतान शेड्यूल",
        "वर्किंग कैपिटल आवश्यकता",
        "मोराटोरियम अवधि की जानकारी",
      ],

      module3Title: "स्मार्ट सरकारी योजना सलाहकार",
      module3Desc:
        "अपनी व्यावसायिक प्रोफ़ाइल, पात्रता और विशिष्ट आवश्यकताओं के आधार पर सर्वोत्तम सरकारी योजनाओं की स्वचालित रूप से खोज करें।",
      module3Items: [
        "प्रोफ़ाइल-आधारित योजना मिलान",
        "पात्रता मानदंड सत्यापन",
        "व्यापार की जरूरतों के साथ समानता",
        "सब्सिडी और अनुदान अनुमान",
        "दस्तावेज़ीकरण चेकलिस्ट",
        "आवेदन प्रक्रिया मार्गदर्शन",
      ],

      processBadge: "यह कैसे काम करता है",
      processTitle: "आइडिया से एक्शन तक चार चरण",

      step1Title: "अपने बारे में बताएं",
      step1Desc:
        "अपना स्थान, उपलब्ध मार्जिन पूंजी और व्यवसाय श्रेणी दर्ज करें।",

      step2Title: "एआई बाजार का अध्ययन करता है",
      step2Desc:
        "हमारा सिस्टम जनसांख्यिकीय, आर्थिक, बाजार और प्रतिस्पर्धी डेटा का विश्लेषण करता है।",

      step3Title: "अपना रोडमैप पाएं",
      step3Desc:
        "स्थानीय व्यवहार्यता रिपोर्ट और व्यक्तिगत वित्तीय संरचना प्राप्त करें।",

      step4Title: "विश्वास के साथ आवेदन करें",
      step4Desc: "अपनी योजना की पात्रता समझें और सही वित्तीय निर्णय लें।",

      aiBadge: "आपका डिजिटल बिज़नेस कंसल्टेंट",
      aiTitle: "पूछें। समझें। निर्णय लें।",
      aiDesc:
        "हमारा बहुभाषी एआई बिज़नेस असिस्टेंट रिपोर्ट के बाद भी आपके साथ रहता है। अपने व्यवसाय, वित्त, सरकारी योजनाओं, बाजार और भुगतान योजनाओं के बारे में सवाल पूछें।",
      chatNow: "एआई असिस्टेंट से बात करें",
      persistent: "पर्सिस्टेंट मेमोरी",
      persistentDesc: "आपके व्यवसाय का संदर्भ बातचीत के दौरान उपलब्ध रहता है।",
      multilingual: "बहुभाषी",
      multilingualDesc: "अंग्रेजी, हिंदी या बंगाली में बातचीत करें।",
      dataDriven: "डेटा आधारित",
      dataDrivenDesc: "उत्तर आपके व्यवसाय विश्लेषण और प्रमाणों पर आधारित हैं।",

      financeBadge: "स्मार्ट योजना चयन",
      financeTitle: "जानें कि आप कितना खर्च कर सकते हैं",
      financeDesc:
        "आपकी उपलब्ध मार्जिन पूंजी से प्रोजेक्ट लागत और ऋण पात्रता की गणना की जाती है।",

      margin: "उपलब्ध मार्जिन",
      projectCost: "संभावित प्रोजेक्ट लागत",
      loan: "अधिकतम ऋण",
      example: "उदाहरण",
      exampleText:
        "यदि आपके पास ₹1,00,000 मार्जिन है, तो सिस्टम ₹10,00,000 की प्रोजेक्ट लागत और ₹9,00,000 तक के ऋण की पात्रता निर्धारित करता है।",

      micro: "माइक्रो फाइनेंस योजना",
      microDesc: "₹1.40 लाख तक की प्रोजेक्ट लागत",
      microRate: "6.5% ब्याज",
      microTenure: "3 वर्ष अवधि",

      term: "टर्म लोन योजना",
      termDesc: "₹1.40 लाख – ₹50 लाख प्रोजेक्ट लागत",
      termRate: "8% ब्याज",
      termTenure: "7 वर्ष अवधि",

      impactBadge: "हमारा प्रभाव",
      impactTitle: "उद्यमिता को अधिक डेटा-आधारित बनाना",
      impact1: "व्यवसाय विफलता कम करें",
      impact1Desc:
        "वास्तविक स्थानीय मांग के आधार पर सही व्यवसाय चुनने में उद्यमियों की मदद करें।",
      impact2: "वित्तीय भ्रम खत्म करें",
      impact2Desc:
        "मार्जिन, ऋण पात्रता और भुगतान दायित्व को सरल तरीके से समझाएं।",
      impact3: "ग्रामीण युवाओं को सशक्त बनाएं",
      impact3Desc:
        "एआई के माध्यम से पेशेवर बिज़नेस इंटेलिजेंस को गांवों तक पहुंचाएं।",

      ctaTitle: "आपका आइडिया अगली स्थानीय सफलता की कहानी बन सकता है।",
      ctaDesc:
        "अपने स्थान, पूंजी और आइडिया से शुरुआत करें। विश्लेषण एआई पर छोड़ दें।",
      ctaButton: "बिज़नेस विश्लेषण शुरू करें",

      footer: "एआई-संचालित हाइपर-लोकल बिज़नेस सलाहकार और वित्तीय संरचना सहायक",
    },

    bengali: {
      badge: "এআই-চালিত গ্রামীণ ব্যবসায়িক পরামর্শদাতা",
      title1: "সঠিক ব্যবসা শুরু করুন।",
      title2: "স্থানীয় তথ্যের ভিত্তিতে।",
      description:
        "গ্রামীণ ও আধা-শহুরে উদ্যোক্তাদের জন্য তৈরি একটি এআই-চালিত হাইপার-লোকাল ব্যবসায়িক ও আর্থিক পরামর্শদাতা, যা তথ্যভিত্তিক সিদ্ধান্ত নিতে সাহায্য করে।",
      getStarted: "শুরু করুন",
      explore: "ফিচার দেখুন",

      // App Mockup (Visual) Translations
      appTitle: "ফাইন্যান্স এআই",
      appSubtitle: "বিজনেস ইন্টেলিজেন্স",
      aiActive: "এআই সক্রিয়",
      marketOpp: "বাজারের সুযোগ",
      high: "উচ্চ",
      marketReach: "বাজার পৌঁছানো",
      localDemand: "স্থানীয় চাহিদা",
      strong: "শক্তিশালী",
      opportunity: "সুযোগ",
      riskLevel: "ঝুঁকির মাত্রা",
      moderate: "মাঝারি",
      recStrategy: "প্রস্তাবিত কৌশল",
      recStrategyDesc:
        "স্থানীয় চাহিদা প্রস্তাবিত ব্যবসায়িক মডেলটিকে সমর্থন করে।",

      stat1: "হাইপার-লোকাল",
      stat1Desc: "বিজনেস ইন্টেলিজেন্স",
      stat2: "এআই-চালিত",
      stat2Desc: "ব্যবসায়িক বিশ্লেষণ",
      stat3: "স্মার্ট",
      stat3Desc: "আর্থিক কাঠামো",
      stat4: "বহুভাষিক",
      stat4Desc: "গ্রামীণ অ্যাক্সেস",

      advisoryTitle: "আপনার ব্যবসার ধারণা। আমাদের বুদ্ধিমত্তা।",
      advisoryDesc:
        "তিনটি সহজ তথ্য দিন এবং আমাদের এআই আপনার জন্য একটি স্থানীয় ব্যবসায়িক কৌশল ও আর্থিক রোডম্যাপ তৈরি করবে।",
      location: "আপনার অবস্থান",
      locationDesc: "গ্রাম / ব্লক / জেলা",
      capital: "উপলব্ধ মূলধন",
      capitalDesc: "আপনার মার্জিন অবদান",
      category: "ব্যবসার বিভাগ",
      categoryDesc: "ডেইরি / রিটেল / টেক্সটাইল ইত্যাদি",
      directory: "ব্যবসা ডিরেক্টরি",
      directoryDesc:
        "বিভাগ ও অবস্থান অনুযায়ী সক্রিয় স্থানীয় ব্যবসা খুঁজুন এবং মালিকদের সাথে যোগাযোগ করুন।",
      analyze: "আমার ব্যবসা বিশ্লেষণ করুন",

      modulesBadge: "তিনটি মূল মডিউল",
      modulesTitle: "ব্যবসা শুরু করার আগে সবকিছু জানুন",
      modulesDesc:
        "স্থানীয় বাজার বোঝা থেকে শুরু করে আপনি কত ঋণ নিতে পারবেন তা জানা পর্যন্ত, Finance Assistant আপনার জন্য পেশাদার ব্যবসায়িক পরামর্শ নিয়ে আসে।",

      module1Title: "হাইপার-লোকাল ব্যবসায়িক সম্ভাব্যতা",
      module1Desc:
        "আপনার স্থানীয় অর্থনীতিতে আপনার ব্যবসার ধারণাটি কতটা কার্যকর তা বুঝুন।",
      module1Items: [
        "৫–১০ কিমি এলাকার বাজার",
        "স্থানীয় প্রতিযোগী ম্যাপিং",
        "সুযোগ ও অনাবৃত বাজার",
        "স্থানীয় SWOT বিশ্লেষণ",
        "সাপ্লাই চেইন ও মৌসুমি ঝুঁকি",
        "স্থানীয় পণ্যের মূল্য নির্ধারণ",
      ],

      module2Title: "স্মার্ট ফাইন্যান্সিয়াল ক্যালকুলেটর",
      module2Desc:
        "আপনার উপলব্ধ মার্জিন মূলধনকে একটি পরিষ্কার আর্থিক পরিকল্পনায় রূপান্তর করুন।",
      module2Items: [
        "সম্ভাব্য প্রকল্প খরচ হিসাব",
        "সর্বোচ্চ ঋণ যোগ্যতা",
        "সঠিক স্কিম স্বয়ংক্রিয় নির্বাচন",
        "EMI ও পরিশোধের সময়সূচি",
        "ওয়ার্কিং ক্যাপিটাল প্রয়োজন",
        "মোরাটোরিয়াম সময়কাল",
      ],

      module3Title: "স্মার্ট সরকারি স্কিম সুপারিশকারী",
      module3Desc:
        "আপনার ব্যবসার প্রোফাইল, যোগ্যতা এবং নির্দিষ্ট চাহিদার উপর ভিত্তি করে সেরা সরকারি স্কিমগুলি স্বয়ংক্রিয়ভাবে খুঁজুন।",
      module3Items: [
        "প্রোফাইল-ভিত্তিক স্কিম মিল",
        "যোগ্যতা যাচাইকরণ",
        "ব্যবসায়িক প্রয়োজনের সাথে সামঞ্জস্যতা",
        "ভর্তুকি ও অনুদানের হিসাব",
        "নথিপত্রের চেকলিস্ট",
        "আবেদন প্রক্রিয়ার নির্দেশিকা",
      ],

      processBadge: "কীভাবে কাজ করে",
      processTitle: "ধারণা থেকে বাস্তবায়ন — চারটি ধাপ",

      step1Title: "আপনার তথ্য দিন",
      step1Desc: "আপনার অবস্থান, উপলব্ধ মার্জিন মূলধন এবং ব্যবসার বিভাগ লিখুন।",

      step2Title: "এআই বাজার বিশ্লেষণ করে",
      step2Desc:
        "আমাদের সিস্টেম জনসংখ্যা, অর্থনীতি, বাজার ও প্রতিযোগী সংক্রান্ত তথ্য বিশ্লেষণ করে।",

      step3Title: "আপনার রোডম্যাপ পান",
      step3Desc:
        "একটি স্থানীয় সম্ভাব্যতা রিপোর্ট এবং ব্যক্তিগত আর্থিক কাঠামো পান।",

      step4Title: "আত্মবিশ্বাসের সাথে আবেদন করুন",
      step4Desc: "আপনার স্কিমের যোগ্যতা বুঝে সঠিক অর্থনৈতিক সিদ্ধান্ত নিন।",

      aiBadge: "আপনার ডিজিটাল ব্যবসায়িক পরামর্শদাতা",
      aiTitle: "জিজ্ঞাসা করুন। বুঝুন। সিদ্ধান্ত নিন।",
      aiDesc:
        "আমাদের বহুভাষিক এআই বিজনেস অ্যাসিস্ট্যান্ট রিপোর্টের পরেও আপনার সাথে থাকবে। ব্যবসা, অর্থ, সরকারি স্কিম, বাজার এবং ঋণ পরিশোধ সম্পর্কে প্রশ্ন করুন।",
      chatNow: "এআই অ্যাসিস্ট্যান্টের সাথে কথা বলুন",
      persistent: "পার্সিস্টেন্ট মেমরি",
      persistentDesc: "আপনার ব্যবসার প্রসঙ্গ ভবিষ্যৎ কথোপকথনেও উপলব্ধ থাকবে।",
      multilingual: "বহুভাষিক",
      multilingualDesc: "ইংরেজি, হিন্দি অথবা বাংলায় কথা বলুন।",
      dataDriven: "তথ্যভিত্তিক",
      dataDrivenDesc:
        "উত্তরগুলি আপনার ব্যবসায়িক বিশ্লেষণ ও প্রমাণের উপর ভিত্তি করে।",

      financeBadge: "স্মার্ট স্কিম রাউটার",
      financeTitle: "আপনি কতটা খরচ করতে পারবেন তা জানুন",
      financeDesc:
        "আপনার উপলব্ধ মার্জিন মূলধন ব্যবহার করে সম্ভাব্য প্রকল্প খরচ এবং ঋণের যোগ্যতা হিসাব করা হয়।",

      margin: "উপলব্ধ মার্জিন",
      projectCost: "সম্ভাব্য প্রকল্প খরচ",
      loan: "সর্বোচ্চ ঋণ",
      example: "উদাহরণ",
      exampleText:
        "আপনার কাছে ₹1,00,000 মার্জিন থাকলে সিস্টেম ₹10,00,000 প্রকল্প খরচ এবং ₹9,00,000 পর্যন্ত ঋণের যোগ্যতা হিসাব করবে।",

      micro: "মাইক্রো ফাইন্যান্স স্কিম",
      microDesc: "₹1.40 লক্ষ পর্যন্ত প্রকল্প খরচ",
      microRate: "6.5% সুদ",
      microTenure: "৩ বছর মেয়াদ",

      term: "টার্ম লোন স্কিম",
      termDesc: "₹1.40 লক্ষ – ₹50 লক্ষ প্রকল্প খরচ",
      termRate: "8% সুদ",
      termTenure: "৭ বছর মেয়াদ",

      impactBadge: "আমাদের প্রভাব",
      impactTitle: "উদ্যোক্তাকে আরও তথ্যভিত্তিক করে তোলা",
      impact1: "ব্যবসায়িক ব্যর্থতা কমানো",
      impact1Desc:
        "স্থানীয় প্রকৃত চাহিদার ভিত্তিতে সঠিক ব্যবসা বেছে নিতে উদ্যোক্তাদের সাহায্য করা।",
      impact2: "আর্থিক বিভ্রান্তি দূর করা",
      impact2Desc:
        "মার্জিন, ঋণের যোগ্যতা এবং পরিশোধের দায়বদ্ধতা সহজভাবে বোঝানো।",
      impact3: "গ্রামীণ যুবকদের ক্ষমতায়ন",
      impact3Desc:
        "এআই-এর মাধ্যমে পেশাদার ব্যবসায়িক বুদ্ধিমত্তা গ্রামীণ পর্যায়ে পৌঁছে দেওয়া।",

      ctaTitle: "আপনার ধারণাই হতে পারে পরবর্তী স্থানীয় সাফল্যের গল্প।",
      ctaDesc:
        "আপনার স্থান, মূলধন এবং ধারণা দিয়ে শুরু করুন। বিশ্লেষণের দায়িত্ব এআই-এর।",
      ctaButton: "ব্যবসায়িক বিশ্লেষণ শুরু করুন",

      footer:
        "এআই-চালিত হাইপার-লোকাল ব্যবসায়িক পরামর্শদাতা ও আর্থিক কাঠামো সহায়ক",
    },
  };

  const t = translations[language] || translations.english;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white overflow-hidden">
      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative min-h-[90vh] flex items-center px-6 md:px-12 lg:px-20 py-20">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.6) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300 text-xs font-bold tracking-wider mb-7">
              <Sparkles size={14} />
              {t.badge}
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-slate-900 dark:text-white">
              {t.title1}
              <span className="block mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
                {t.title2}
              </span>
            </h1>

            <p className="mt-7 text-lg md:text-xl text-slate-600 dark:text-gray-400 leading-relaxed max-w-2xl">
              {t.description}
            </p>

            <div className="flex flex-wrap gap-4 mt-9">
              <Link
                to={dashboardPath}
                className="group flex items-center gap-3 px-7 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 !text-white font-bold shadow-[0_15px_40px_rgba(37,99,235,0.25)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.4)] hover:-translate-y-1 transition-all"
              >
                {t.getStarted}
                <ArrowRight
                  size={19}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>

              <a
                href="#features"
                className="flex items-center gap-3 px-7 py-4 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900/70 hover:bg-slate-50 dark:hover:bg-gray-800 text-slate-800 dark:text-white transition-all font-bold shadow-sm"
              >
                {t.explore}
              </a>
            </div>
          </div>

          {/* Right visual (App Mockup) */}
          <div className="relative hidden lg:block">
            <div className="relative bg-white dark:bg-gray-900/80 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 shadow-xl dark:shadow-[0_30px_100px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              <div className="flex items-center justify-between mb-7">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                    <BrainCircuit size={23} />
                  </div>

                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{t.appTitle}</p>
                    <p className="text-xs text-slate-500 dark:text-gray-500">{t.appSubtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-green-600 dark:text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 animate-pulse" />
                  {t.aiActive}
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-slate-600 dark:text-gray-400">{t.marketOpp}</span>
                    <span className="text-green-600 dark:text-green-400 font-bold">{t.high}</span>
                  </div>

                  <div className="h-2 rounded-full bg-slate-200 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full w-[82%] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800">
                    <MapPin size={18} className="text-blue-500 dark:text-blue-400 mb-3" />
                    <p className="text-xs text-slate-500 dark:text-gray-500">{t.marketReach}</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-1">5–10 KM</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800">
                    <Users size={18} className="text-indigo-500 dark:text-indigo-400 mb-3" />
                    <p className="text-xs text-slate-500 dark:text-gray-500">{t.localDemand}</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-1">{t.strong}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800">
                    <TrendingUp size={18} className="text-green-500 dark:text-green-400 mb-3" />
                    <p className="text-xs text-slate-500 dark:text-gray-500">{t.opportunity}</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-1">{t.high}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800">
                    <ShieldCheck size={18} className="text-purple-500 dark:text-purple-400 mb-3" />
                    <p className="text-xs text-slate-500 dark:text-gray-500">{t.riskLevel}</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-1">{t.moderate}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-3">
                    <Target size={20} className="text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{t.recStrategy}</p>
                      <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">
                        {t.recStrategyDesc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-8 -left-12 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-2xl p-4 shadow-xl dark:shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <WalletCards size={20} className="text-green-600 dark:text-green-400" />
                </div>

                <div>
                  <p className="text-xs text-slate-500 dark:text-gray-500">{t.loan}</p>
                  <p className="font-bold text-lg text-slate-900 dark:text-white">₹9,00,000</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          STATS
      ========================================================= */}
      <section className="border-y border-slate-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4">
          {[
            [MapPin, t.stat1, t.stat1Desc],
            [BrainCircuit, t.stat2, t.stat2Desc],
            [Calculator, t.stat3, t.stat3Desc],
            [Languages, t.stat4, t.stat4Desc],
          ].map(([Icon, title, desc], index) => (
            <div
              key={index}
              className="p-7 border-r border-slate-200 dark:border-gray-800 last:border-r-0 flex items-center gap-4"
            >
              <Icon size={25} className="text-blue-600 dark:text-blue-400" />

              <div>
                <p className="font-bold text-slate-900 dark:text-white">{title}</p>
                <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================
          INPUT / ADVISORY
      ========================================================= */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-widest">
              {t.advisoryTitle}
            </p>

            <h2 className="text-4xl md:text-5xl font-black mt-3 text-slate-900 dark:text-white">
              {t.advisoryTitle}
            </h2>

            <p className="text-slate-600 dark:text-gray-400 mt-5 text-lg">{t.advisoryDesc}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
            {[
              [MapPin, t.location, t.locationDesc],
              [WalletCards, t.capital, t.capitalDesc],
              [Store, t.category, t.categoryDesc],
              [Building2, t.directory, t.directoryDesc],
            ].map(([Icon, title, desc], index) => (
              <Link
                key={index}
                to={
                  title === t.directory ? "/businesses/details" : dashboardPath
                }
                className="group p-7 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl hover:border-blue-500/40 hover:-translate-y-1 transition-all shadow-sm hover:shadow-md dark:shadow-none"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-5">
                  <Icon size={23} className="text-blue-600 dark:text-blue-400" />
                </div>

                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{title}</h3>
                <p className="text-slate-600 dark:text-gray-500 text-sm mt-2">{desc}</p>
                {title === t.directory && (
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400">
                    {t.explore}
                    <ArrowRight size={16} />
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <Link
              to={dashboardPath}
              className="flex items-center gap-3 px-7 py-4 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-gray-950 font-bold hover:bg-slate-800 dark:hover:bg-blue-50 transition-all shadow-md"
            >
              {t.analyze}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          CORE MODULES
      ========================================================= */}
      <section id="features" className="px-6 py-24 bg-slate-100/70 dark:bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <p className="text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-widest">
              {t.modulesBadge}
            </p>

            <h2 className="text-4xl md:text-5xl font-black mt-3 text-slate-900 dark:text-white">
              {t.modulesTitle}
            </h2>

            <p className="text-slate-600 dark:text-gray-400 mt-5 text-lg">{t.modulesDesc}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-7 mt-14">
            {/* Module 1 */}
            <div className="relative overflow-hidden p-8 md:p-10 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl shadow-sm dark:shadow-none">
              <div className="absolute -right-20 -top-20 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl" />

              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-7">
                  <BarChart3 size={27} className="text-blue-600 dark:text-blue-400" />
                </div>

                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  MODULE 01
                </span>

                <h3 className="text-2xl md:text-3xl font-black mt-2 text-slate-900 dark:text-white">
                  {t.module1Title}
                </h3>

                <p className="text-slate-600 dark:text-gray-400 mt-4 leading-relaxed">
                  {t.module1Desc}
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 mt-7">
                  {t.module1Items.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-2 items-start text-sm text-slate-700 dark:text-gray-300"
                    >
                      <CheckCircle2
                        size={17}
                        className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"
                      />
                      {item}
                    </div>
                  ))}
                </div>

                <Link
                  to={dashboardPath}
                  className="inline-flex items-center gap-2 mt-8 text-blue-600 dark:text-blue-400 font-bold hover:text-blue-500 dark:hover:text-blue-300"
                >
                  {t.explore}
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>

            {/* Module 2 */}
            <div className="relative overflow-hidden p-8 md:p-10 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl shadow-sm dark:shadow-none">
              <div className="absolute -right-20 -top-20 w-60 h-60 bg-indigo-600/10 rounded-full blur-3xl" />

              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-7">
                  <Calculator size={27} className="text-indigo-600 dark:text-indigo-400" />
                </div>

                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  MODULE 02
                </span>

                <h3 className="text-2xl md:text-3xl font-black mt-2 text-slate-900 dark:text-white">
                  {t.module2Title}
                </h3>

                <p className="text-slate-600 dark:text-gray-400 mt-4 leading-relaxed">
                  {t.module2Desc}
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 mt-7">
                  {t.module2Items.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-2 items-start text-sm text-slate-700 dark:text-gray-300"
                    >
                      <CheckCircle2
                        size={17}
                        className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5"
                      />
                      {item}
                    </div>
                  ))}
                </div>

                <Link
                  to={dashboardPath}
                  className="inline-flex items-center gap-2 mt-8 text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-500 dark:hover:text-indigo-300"
                >
                  {t.explore}
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>

            {/* Module 3 */}
            <div className="relative overflow-hidden p-8 md:p-10 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl shadow-sm dark:shadow-none">
              <div className="absolute -right-20 -top-20 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl" />

              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-7">
                  <Award size={27} className="text-purple-600 dark:text-purple-400" />
                </div>

                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                  MODULE 03
                </span>

                <h3 className="text-2xl md:text-3xl font-black mt-2 text-slate-900 dark:text-white">
                  {t.module3Title}
                </h3>

                <p className="text-slate-600 dark:text-gray-400 mt-4 leading-relaxed">
                  {t.module3Desc}
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 mt-7">
                  {t.module3Items.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-2 items-start text-sm text-slate-700 dark:text-gray-300"
                    >
                      <CheckCircle2
                        size={17}
                        className="text-purple-600 dark:text-purple-400 shrink-0 mt-0.5"
                      />
                      {item}
                    </div>
                  ))}
                </div>

                <Link
                  to={dashboardPath}
                  className="inline-flex items-center gap-2 mt-8 text-purple-600 dark:text-purple-400 font-bold hover:text-purple-500 dark:hover:text-purple-300"
                >
                  {t.explore}
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS
      ========================================================= */}
      <section className="px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-widest">
              {t.processBadge}
            </p>

            <h2 className="text-4xl md:text-5xl font-black mt-3 text-slate-900 dark:text-white">
              {t.processTitle}
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mt-14">
            {[
              [MapPin, "01", t.step1Title, t.step1Desc],
              [Database, "02", t.step2Title, t.step2Desc],
              [BrainCircuit, "03", t.step3Title, t.step3Desc],
              [CheckCircle2, "04", t.step4Title, t.step4Desc],
            ].map(([Icon, number, title, desc]) => (
              <div key={number} className="relative">
                <div className="p-6 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl h-full shadow-sm dark:shadow-none">
                  <div className="flex justify-between items-start">
                    <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Icon size={21} className="text-blue-600 dark:text-blue-400" />
                    </div>

                    <span className="text-3xl font-black text-slate-300 dark:text-gray-800">
                      {number}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg mt-6 text-slate-900 dark:text-white">{title}</h3>

                  <p className="text-slate-600 dark:text-gray-500 text-sm mt-3 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          FINANCIAL CALCULATOR
      ========================================================= */}
      <section className="px-6 py-24 bg-slate-100/70 dark:bg-gray-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <p className="text-indigo-600 dark:text-indigo-400 text-sm font-bold uppercase tracking-widest">
              {t.financeBadge}
            </p>

            <h2 className="text-4xl md:text-5xl font-black mt-3 text-slate-900 dark:text-white">
              {t.financeTitle}
            </h2>

            <p className="text-slate-600 dark:text-gray-400 mt-5 max-w-2xl mx-auto">
              {t.financeDesc}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mt-14">
            <div className="p-7 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl text-center shadow-sm dark:shadow-none">
              <p className="text-slate-600 dark:text-gray-500 text-sm">{t.margin}</p>
              <p className="text-3xl font-black mt-3 text-slate-900 dark:text-white">₹1,00,000</p>
              <p className="text-xs text-slate-500 dark:text-gray-600 mt-2">10%</p>
            </div>

            <div className="p-7 bg-white dark:bg-gray-900 border border-blue-500/30 rounded-2xl text-center shadow-[0_15px_40px_rgba(37,99,235,0.08)]">
              <p className="text-blue-600 dark:text-blue-400 text-sm font-bold">{t.projectCost}</p>
              <p className="text-3xl font-black mt-3 text-slate-900 dark:text-white">₹10,00,000</p>
              <p className="text-xs text-slate-500 dark:text-gray-600 mt-2">100%</p>
            </div>

            <div className="p-7 bg-white dark:bg-gray-900 border border-indigo-500/30 rounded-2xl text-center shadow-sm dark:shadow-none">
              <p className="text-indigo-600 dark:text-indigo-400 text-sm font-bold">{t.loan}</p>
              <p className="text-3xl font-black mt-3 text-slate-900 dark:text-white">₹9,00,000</p>
              <p className="text-xs text-slate-500 dark:text-gray-600 mt-2">90%</p>
            </div>
          </div>

          <div className="mt-7 p-6 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm dark:shadow-none">
            <p className="text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold">
              {t.example}
            </p>

            <p className="text-slate-600 dark:text-gray-400 mt-2 leading-relaxed">
              {t.exampleText}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-7">
            <div className="p-7 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-3">
                <Landmark className="text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t.micro}</h3>
              </div>

              <p className="text-slate-600 dark:text-gray-500 text-sm mt-3">{t.microDesc}</p>

              <div className="flex gap-3 mt-5">
                <span className="px-3 py-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold">
                  {t.microRate}
                </span>

                <span className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 dark:bg-gray-800 dark:text-gray-300 text-xs font-bold">
                  {t.microTenure}
                </span>
              </div>
            </div>

            <div className="p-7 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-3">
                <Landmark className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t.term}</h3>
              </div>

              <p className="text-slate-600 dark:text-gray-500 text-sm mt-3">{t.termDesc}</p>

              <div className="flex gap-3 mt-5">
                <span className="px-3 py-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                  {t.termRate}
                </span>

                <span className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 dark:bg-gray-800 dark:text-gray-300 text-xs font-bold">
                  {t.termTenure}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          AI CHATBOT
      ========================================================= */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-950/40 dark:via-gray-900 dark:to-indigo-950/30 p-8 md:p-14 shadow-lg dark:shadow-none">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full" />

            <div className="relative grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-widest">
                  <MessageCircle size={17} />
                  {t.aiBadge}
                </div>

                <h2 className="text-4xl md:text-5xl font-black mt-4 text-slate-900 dark:text-white">
                  {t.aiTitle}
                </h2>

                <p className="text-slate-600 dark:text-gray-400 mt-5 leading-relaxed">{t.aiDesc}</p>

                <Link
                  to={dashboardPath}
                  className="inline-flex items-center gap-3 mt-7 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold !text-white transition-all shadow-md shadow-blue-500/20"
                >
                  <MessageCircle size={19} />
                  {t.chatNow}
                </Link>
              </div>

              <div className="space-y-4">
                {[
                  [Database, t.persistent, t.persistentDesc],
                  [Languages, t.multilingual, t.multilingualDesc],
                  [BrainCircuit, t.dataDriven, t.dataDrivenDesc],
                ].map(([Icon, title, desc], index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-5 rounded-2xl bg-white/90 dark:bg-gray-950/60 border border-slate-200 dark:border-gray-800 shadow-sm dark:shadow-none"
                  >
                    <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Icon size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
                      <p className="text-slate-600 dark:text-gray-500 text-sm mt-1">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          IMPACT
      ========================================================= */}
      <section className="px-6 py-24 bg-slate-100/70 dark:bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-widest">
              {t.impactBadge}
            </p>

            <h2 className="text-4xl md:text-5xl font-black mt-3 text-slate-900 dark:text-white">
              {t.impactTitle}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-14">
            {[
              [TrendingUp, t.impact1, t.impact1Desc],
              [ShieldCheck, t.impact2, t.impact2Desc],
              [Users, t.impact3, t.impact3Desc],
            ].map(([Icon, title, desc], index) => (
              <div
                key={index}
                className="p-8 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-sm dark:shadow-none"
              >
                <Icon size={28} className="text-blue-600 dark:text-blue-400" />

                <h3 className="text-xl font-black mt-6 text-slate-900 dark:text-white">{title}</h3>

                <p className="text-slate-600 dark:text-gray-500 mt-3 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <section className="px-6 py-28">
        <div className="max-w-5xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_15px_40px_rgba(37,99,235,0.3)] text-white">
            <Sparkles size={28} />
          </div>

          <h2 className="text-4xl md:text-6xl font-black mt-7 text-slate-900 dark:text-white">{t.ctaTitle}</h2>

          <p className="text-slate-600 dark:text-gray-400 text-lg mt-5 max-w-2xl mx-auto">
            {t.ctaDesc}
          </p>

          <Link
            to={dashboardPath}
            className="inline-flex items-center gap-3 mt-8 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-bold !text-white shadow-[0_15px_40px_rgba(37,99,235,0.25)] hover:-translate-y-1 transition-all"
          >
            {t.ctaButton}
            <ArrowRight size={19} />
          </Link>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="border-t border-slate-200 dark:border-gray-800 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-white">
              F
            </div>

            <div>
              <p className="font-bold text-slate-900 dark:text-white">Finance Assistant</p>
              <p className="text-xs text-slate-500 dark:text-gray-500">{t.footer}</p>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-gray-500">
            SIH 2026 • Problem Statement 26091
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
