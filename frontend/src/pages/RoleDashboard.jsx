import React from "react";
import { Link, Navigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Compass,
  FileText,
  Landmark,
  Search,
  ShieldCheck,
  ShoppingBag,
  User,
  WalletCards,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const translations = {
  english: {
    welcome: "Welcome",
    there: "there",
    yourWorkspace: "Your workspace",
    startAction: "Start with the action that matters",
    nextSteps: "Next steps",
    exploreTools: "Explore your tools",
    builtAroundRole: "Built around your role",
    open: "Open",
    roles: {
      entrepreneur: {
        eyebrow: "Entrepreneur command center",
        title: "Turn your business idea into a clear next step.",
        description:
          "Create and manage your businesses, study local opportunity, plan your finances, and find the support schemes that fit your work.",
        primaryLabel: "Manage My Businesses",
        primaryDesc:
          "Open a business workspace or create your next business profile.",
        nextTitle: "A practical path for your next decision",
        nextDesc:
          "Start with your business profile. Every workspace keeps its analysis, finances, schemes, and AI assistant together.",
        cards: {
          analysis: {
            label: "Business Analysis",
            desc: "Review feasibility, demand, competitors, supply chain, and local market evidence.",
          },
          finance: {
            label: "Financial Planning",
            desc: "Use the financial analysis inside each business workspace to understand cost, loan, and repayment options.",
          },
          schemes: {
            label: "Government Schemes",
            desc: "Find assistance and schemes matched to your business profile and eligibility.",
          },
          explore: {
            label: "Explore Local Businesses",
            desc: "Browse the active business directory to understand the local business landscape.",
          },
        },
      },
      buyer: {
        eyebrow: "Buyer discovery hub",
        title: "Find businesses and opportunities that fit your needs.",
        description:
          "Search the active business directory, compare local businesses, and contact owners when you are ready to explore an opportunity.",
        primaryLabel: "Browse Business Directory",
        primaryDesc:
          "Search active businesses by name, category, and location.",
        nextTitle: "Your buyer workflow",
        nextDesc:
          "Discover first, inspect the details, then contact the owner when a local opportunity looks right for you.",
        cards: {
          search: {
            label: "Search Local Businesses",
            desc: "Filter active listings by category, village, district, city, state, or pincode.",
          },
          compare: {
            label: "Compare Business Details",
            desc: "Review descriptions, locations, status, and available business information before reaching out.",
          },
          contact: {
            label: "Contact Owners",
            desc: "Sign in to view available owner contact details and connect with a business directly.",
          },
          profile: {
            label: "Keep Your Profile Ready",
            desc: "Maintain your contact and location information so your account stays ready for future opportunities.",
          },
        },
      },
      government: {
        eyebrow: "Government workspace",
        title: "Government dashboard is on hold for now.",
        description:
          "The government-official experience is being prepared. Your profile and the public business directory remain available while this workspace is on hold.",
        primaryLabel: "View Business Directory",
        primaryDesc:
          "Browse active businesses while the government workspace is being prepared.",
        nextTitle: "What is available now",
        nextDesc:
          "Government tools will be added here later. For now, use the links above to access the available public and profile experiences.",
        cards: {
          profile: {
            label: "Profile",
            desc: "Review your account and official profile information.",
          },
          directory: {
            label: "Public Business Directory",
            desc: "Explore active businesses and their published information.",
          },
        },
      },
    },
  },
  hindi: {
    welcome: "स्वागत है",
    there: "मित्र",
    yourWorkspace: "आपका कार्यक्षेत्र",
    startAction: "महत्वपूर्ण कार्यों से शुरुआत करें",
    nextSteps: "अगले कदम",
    exploreTools: "उपकरण देखें",
    builtAroundRole: "आपकी भूमिका के अनुसार तैयार",
    open: "खोलें",
    roles: {
      entrepreneur: {
        eyebrow: "उद्यमी नियंत्रण केंद्र",
        title: "अपने व्यावसायिक विचार को एक स्पष्ट कदम में बदलें।",
        description:
          "अपने व्यवसायों का निर्माण और प्रबंधन करें, स्थानीय अवसरों का अध्ययन करें, अपने वित्त की योजना बनाएं और अपनी आवश्यकताओं के अनुकूल सरकारी योजनाएं खोजें।",
        primaryLabel: "मेरे व्यवसाय प्रबंधित करें",
        primaryDesc:
          "एक व्यवसाय कार्यक्षेत्र खोलें या अपनी नई व्यावसायिक प्रोफ़ाइल बनाएं।",
        nextTitle: "आपके अगले निर्णय के लिए एक व्यावहारिक मार्ग",
        nextDesc:
          "अपनी व्यावसायिक प्रोफ़ाइल से शुरुआत करें। प्रत्येक कार्यक्षेत्र विश्लेषण, वित्त, योजनाएं और AI सहायक को एक साथ रखता है।",
        cards: {
          analysis: {
            label: "व्यवसाय विश्लेषण",
            desc: "व्यवहार्यता, मांग, प्रतिस्पर्धियों, आपूर्ति श्रृंखला और स्थानीय बाजार के साक्ष्यों की समीक्षा करें।",
          },
          finance: {
            label: "वित्तीय योजना",
            desc: "लागत, ऋण और पुनर्भुगतान विकल्पों को समझने के लिए प्रत्येक कार्यक्षेत्र में वित्तीय विश्लेषण का उपयोग करें।",
          },
          schemes: {
            label: "सरकारी योजनाएं",
            desc: "अपनी व्यावसायिक प्रोफ़ाइल और पात्रता से मेल खाने वाली सहायता और योजनाएं खोजें।",
          },
          explore: {
            label: "स्थानीय व्यवसाय देखें",
            desc: "स्थानीय व्यावसायिक परिदृश्य को समझने के लिए सक्रिय व्यापार निर्देशिका ब्राउज़ करें।",
          },
        },
      },
      buyer: {
        eyebrow: "खरीदार खोज केंद्र",
        title: "अपनी आवश्यकताओं के अनुकूल व्यवसाय और अवसर खोजें।",
        description:
          "सक्रिय व्यवसाय निर्देशिका खोजें, स्थानीय व्यवसायों की तुलना करें, और जब आप किसी अवसर का पता लगाने के लिए तैयार हों तो स्वामियों से संपर्क करें।",
        primaryLabel: "व्यवसाय निर्देशिका ब्राउज़ करें",
        primaryDesc:
          "नाम, श्रेणी और स्थान के आधार पर सक्रिय व्यवसायों को खोजें।",
        nextTitle: "आपकी खरीदारी प्रक्रिया",
        nextDesc:
          "पहले खोजें, विवरणों की जांच करें, फिर जब कोई स्थानीय अवसर उपयुक्त लगे तो स्वामी से संपर्क करें।",
        cards: {
          search: {
            label: "स्थानीय व्यवसाय खोजें",
            desc: "श्रेणी, गांव, जिला, शहर, राज्य या पिनकोड द्वारा सक्रिय लिस्टिंग फ़िल्टर करें।",
          },
          compare: {
            label: "व्यावसायिक विवरण की तुलना करें",
            desc: "संपर्क करने से पहले विवरण, स्थान, स्थिति और उपलब्ध व्यावसायिक जानकारी की समीक्षा करें।",
          },
          contact: {
            label: "स्वामियों से संपर्क करें",
            desc: "स्वामी के संपर्क विवरण देखने और सीधे व्यवसाय से जुड़ने के लिए साइन इन करें।",
          },
          profile: {
            label: "अपनी प्रोफ़ाइल तैयार रखें",
            desc: "अपनी संपर्क और स्थान की जानकारी अपडेट रखें ताकि आपका खाता भावी अवसरों के लिए तैयार रहे।",
          },
        },
      },
      government: {
        eyebrow: "सरकारी कार्यक्षेत्र",
        title: "सरकारी डैशबोर्ड अभी प्रगति पर है।",
        description:
          "सरकारी अधिकारियों का अनुभव तैयार किया जा रहा है। इस दौरान आपकी प्रोफ़ाइल और सार्वजनिक व्यवसाय निर्देशिका उपलब्ध रहेगी।",
        primaryLabel: "व्यवसाय निर्देशिका देखें",
        primaryDesc:
          "सरकारी कार्यक्षेत्र तैयार होने तक सक्रिय व्यवसायों को ब्राउज़ करें।",
        nextTitle: "वर्तमान में क्या उपलब्ध है",
        nextDesc:
          "सरकारी उपकरण यहां बाद में जोड़े जाएंगे। फिलहाल, उपलब्ध सार्वजनिक और प्रोफ़ाइल अनुभागों तक पहुंचने के लिए ऊपर दिए गए लिंक का उपयोग करें।",
        cards: {
          profile: {
            label: "प्रोफ़ाइल",
            desc: "अपने खाते और आधिकारिक प्रोफ़ाइल जानकारी की समीक्षा करें।",
          },
          directory: {
            label: "सार्वजनिक व्यवसाय निर्देशिका",
            desc: "सक्रिय व्यवसायों और उनकी प्रकाशित जानकारी का अन्वेषण करें।",
          },
        },
      },
    },
  },
  bengali: {
    welcome: "স্বাগতম",
    there: "মিত্র",
    yourWorkspace: "আপনার কার্যক্ষেত্র",
    startAction: "গুরুত্বপূর্ণ পদক্ষেপ দিয়ে শুরু করুন",
    nextSteps: "পরবর্তী পদক্ষেপ",
    exploreTools: "টুলগুলি দেখুন",
    builtAroundRole: "আপনার ভূমিকার জন্য তৈরি",
    open: "খুলুন",
    roles: {
      entrepreneur: {
        eyebrow: "উদ্যোক্তা নিয়ন্ত্রণ কেন্দ্র",
        title: "আপনার ব্যবসার ধারণাকে একটি পরিষ্কার পদক্ষেপে রূপান্তর করুন।",
        description:
          "আপনার ব্যবসা তৈরি ও পরিচালনা করুন, স্থানীয় সুযোগ যাচাই করুন, আর্থিক পরিকল্পনা করুন এবং উপযোগী সরকারি স্কিমগুলি খুঁজুন।",
        primaryLabel: "আমার ব্যবসা পরিচালনা করুন",
        primaryDesc:
          "একটি ব্যবসায়িক কার্যক্ষেত্র খুলুন অথবা আপনার নতুন ব্যবসায়িক প্রোফাইল তৈরি করুন।",
        nextTitle: "আপনার পরবর্তী সিদ্ধান্তের বাস্তবসম্মত পথ",
        nextDesc:
          "ব্যবসায়িক প্রোফাইল দিয়ে শুরু করুন। প্রতিটি ওয়ার্কস্পেস বিশ্লেষণ, অর্থ, স্কিম এবং এআই সহকারীকে একত্রে রাখে।",
        cards: {
          analysis: {
            label: "ব্যবসায়িক বিশ্লেষণ",
            desc: "সম্ভাব্যতা, চাহিদা, প্রতিযোগী, সরবরাহ শৃঙ্খল এবং স্থানীয় বাজারের প্রমাণ পর্যালোচনা করুন।",
          },
          finance: {
            label: "আর্থিক পরিকল্পনা",
            desc: "ব্যয়, ঋণ এবং পরিশোধের বিকল্পগুলি বুঝতে প্রতিটি ব্যবসায়িক ওয়ার্কস্পেসের আর্থিক বিশ্লেষণ ব্যবহার করুন।",
          },
          schemes: {
            label: "সরকারি স্কিম",
            desc: "আপনার ব্যবসায়িক প্রোফাইল এবং যোগ্যতার সাথে মেলে এমন সহায়তা এবং স্কিমগুলি সন্ধান করুন।",
          },
          explore: {
            label: "স্থানীয় ব্যবসা অন্বেষণ করুন",
            desc: "স্থানীয় ব্যবসায়িক পরিবেশ বুঝতে সক্রিয় ব্যবসা ডিরেক্টরি ব্রাউজ করুন।",
          },
        },
      },
      buyer: {
        eyebrow: "ক্রেতা সন্ধান কেন্দ্র",
        title: "আপনার প্রয়োজন অনুযায়ী ব্যবসা এবং সুযোগ খুঁজুন।",
        description:
          "সক্রিয় ব্যবসা ডিরেক্টরি অনুসন্ধান করুন, স্থানীয় ব্যবসার তুলনা করুন এবং প্রস্তুত হলে মালিকদের সাথে যোগাযোগ করুন।",
        primaryLabel: "ব্যবসা ডিরেক্টরি ব্রাউজ করুন",
        primaryDesc:
          "নাম, বিভাগ এবং অবস্থান অনুযায়ী সক্রিয় ব্যবসা অনুসন্ধান করুন।",
        nextTitle: "আপনার ক্রয় প্রক্রিয়া",
        nextDesc:
          "প্রথমে সন্ধান করুন, বিবরণ যাচাই করুন, তারপর কোনো স্থানীয় সুযোগ উপযুক্ত মনে হলে মালিকের সাথে যোগাযোগ করুন।",
        cards: {
          search: {
            label: "স্থানীয় ব্যবসা খুঁজুন",
            desc: "বিভাগ, গ্রাম, জেলা, শহর, রাজ্য বা পিনকোড অনুসারে তালিকা ফিল্টার করুন।",
          },
          compare: {
            label: "ব্যবসার বিবরণ তুলনা করুন",
            desc: "যোগাযোগ করার আগে বিবরণ, অবস্থান, অবস্থা এবং উপলব্ধ ব্যবসায়িক তথ্য পর্যালোচনা করুন।",
          },
          contact: {
            label: "মালিকদের সাথে যোগাযোগ করুন",
            desc: "যোগাযোগের বিবরণ দেখতে এবং সরাসরি ব্যবসার সাথে যুক্ত হতে সাইন ইন করুন।",
          },
          profile: {
            label: "প্রোফাইল প্রস্তুত রাখুন",
            desc: "আপনার তথ্য আপডেট রাখুন যাতে আপনার অ্যাকাউন্ট ভবিষ্যতের সুযোগের জন্য প্রস্তুত থাকে।",
          },
        },
      },
      government: {
        eyebrow: "সরকারি ওয়ার্কস্পেস",
        title: "সরকারি ড্যাশবোর্ড প্রক্রিয়াধীন রয়েছে।",
        description:
          "সরকারি কর্মকর্তাদের ব্যবহারের সুবিধা প্রস্তুত করা হচ্ছে। এই সময়ে আপনার প্রোফাইল এবং পাবলিক ডিরেক্টরি উপলব্ধ থাকবে।",
        primaryLabel: "ব্যবসা ডিরেক্টরি দেখুন",
        primaryDesc:
          "সরকারি ওয়ার্কস্পেস প্রস্তুত হওয়া পর্যন্ত সক্রিয় ব্যবসাগুলি ব্রাউজ করুন।",
        nextTitle: "বর্তমানে যা উপলব্ধ রয়েছে",
        nextDesc:
          "সরকারি সরঞ্জামগুলি পরবর্তীতে যোগ করা হবে। আপাতত উপলব্ধ পাবলিক ও প্রোফাইল সুবিধা ব্যবহার করতে উপরের লিঙ্কটি ব্যবহার করুন।",
        cards: {
          profile: {
            label: "প্রোফাইল",
            desc: "আপনার অ্যাকাউন্ট এবং অফিসিয়াল প্রোফাইল তথ্য পর্যালোচনা করুন।",
          },
          directory: {
            label: "পাবলিক ব্যবসা ডিরেক্টরি",
            desc: "সক্রিয় ব্যবসা এবং তাদের প্রকাশিত তথ্য অন্বেষণ করুন।",
          },
        },
      },
    },
  },
};

// Normalize any language output format to match dictionary keys
const resolveLanguageKey = (lang) => {
  const normalized = String(lang || "")
    .toLowerCase()
    .trim();
  if (normalized === "hi" || normalized === "hindi") return "hindi";
  if (
    normalized === "bn" ||
    normalized === "bengali" ||
    normalized === "bangla"
  )
    return "bengali";
  return "english";
};

const roleKey = (role) => {
  const normalized = String(role || "")
    .toLowerCase()
    .replace(/[\s-]/g, "_");

  if (normalized === "entrepreneur" || normalized === "enterpreneur") {
    return "entrepreneur";
  }
  if (normalized === "buyer") return "buyer";
  if (normalized === "government" || normalized === "government_official") {
    return "government";
  }
  return "unknown";
};

const getRoleConfig = (role, t) => {
  const roleText = t?.roles?.[role] || translations.english.roles[role];
  if (!roleText) return null;

  const cardsMap = roleText.cards || {};

  const configs = {
    entrepreneur: {
      ...roleText,
      icon: Building2,
      primary: {
        to: "/businesses",
        icon: Building2,
        label: roleText.primaryLabel || "Manage My Businesses",
        description:
          roleText.primaryDesc ||
          "Open a business workspace or create your next business profile.",
      },
      cards: [
        {
          label: cardsMap?.analysis?.label || "Business Analysis",
          description:
            cardsMap?.analysis?.desc ||
            "Review feasibility, demand, competitors, supply chain, and local market evidence.",
          to: "/businesses",
          icon: BarChart3,
        },
        {
          label: cardsMap?.finance?.label || "Financial Planning",
          description:
            cardsMap?.finance?.desc ||
            "Use the financial analysis inside each business workspace to understand cost, loan, and repayment options.",
          to: "/businesses",
          icon: WalletCards,
        },
        {
          label: cardsMap?.schemes?.label || "Government Schemes",
          description:
            cardsMap?.schemes?.desc ||
            "Find assistance and schemes matched to your business profile and eligibility.",
          to: "/businesses",
          icon: Landmark,
        },
        {
          label: cardsMap?.explore?.label || "Explore Local Businesses",
          description:
            cardsMap?.explore?.desc ||
            "Browse the active business directory to understand the local business landscape.",
          to: "/businesses/details",
          icon: Compass,
        },
      ],
    },
    buyer: {
      ...roleText,
      icon: ShoppingBag,
      primary: {
        to: "/businesses/details",
        icon: Search,
        label: roleText.primaryLabel || "Browse Business Directory",
        description:
          roleText.primaryDesc ||
          "Search active businesses by name, category, and location.",
      },
      cards: [
        {
          label: cardsMap?.search?.label || "Search Local Businesses",
          description:
            cardsMap?.search?.desc ||
            "Filter active listings by category, village, district, city, state, or pincode.",
          to: "/businesses/details",
          icon: Search,
        },
        {
          label: cardsMap?.compare?.label || "Compare Business Details",
          description:
            cardsMap?.compare?.desc ||
            "Review descriptions, locations, status, and available business information before reaching out.",
          to: "/businesses/details",
          icon: FileText,
        },
        {
          label: cardsMap?.contact?.label || "Contact Owners",
          description:
            cardsMap?.contact?.desc ||
            "Sign in to view available owner contact details and connect with a business directly.",
          to: "/businesses/details",
          icon: User,
        },
        {
          label: cardsMap?.profile?.label || "Keep Your Profile Ready",
          description:
            cardsMap?.profile?.desc ||
            "Maintain your contact and location information so your account stays ready for future opportunities.",
          to: "/profile",
          icon: ShieldCheck,
        },
      ],
    },
    government: {
      ...roleText,
      icon: Landmark,
      primary: {
        to: "/businesses/details",
        icon: Search,
        label: roleText.primaryLabel || "View Business Directory",
        description:
          roleText.primaryDesc ||
          "Browse active businesses while the government workspace is being prepared.",
      },
      cards: [
        {
          label: cardsMap?.profile?.label || "Profile",
          description:
            cardsMap?.profile?.desc ||
            "Review your account and official profile information.",
          to: "/profile",
          icon: User,
        },
        {
          label: cardsMap?.directory?.label || "Public Business Directory",
          description:
            cardsMap?.directory?.desc ||
            "Explore active businesses and their published information.",
          to: "/businesses/details",
          icon: Building2,
        },
      ],
    },
  };

  return configs[role] || null;
};

const blueStyles = {
  icon: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  eyebrow: "text-blue-600 dark:text-blue-400",
  button: "bg-blue-600 hover:bg-blue-500",
  line: "bg-blue-500",
};

const getUserName = (user, fallback) => {
  const name = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();
  return name || user?.name || fallback;
};

const RoleDashboard = () => {
  const { language } = useLanguage();
  const { user } = useAuth();

  const langKey = resolveLanguageKey(language);
  const t = translations[langKey] || translations.english;

  const key = roleKey(user?.role);
  const content = getRoleConfig(key, t);

  if (!content) return <Navigate to="/" replace />;

  const Icon = content.icon;
  const PrimaryIcon = content.primary.icon;

  return (
    <section className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-gray-950 px-4 py-8 text-slate-900 dark:text-white sm:px-6 lg:px-10">
      {/* Background Glows (Strictly Blue) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="border-b border-slate-200 dark:border-gray-800 pb-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div
                className={`mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] ${blueStyles.eyebrow}`}
              >
                <Icon size={17} />
                {content.eyebrow}
              </div>
              <p className="mb-3 text-sm text-slate-500 dark:text-gray-500">
                {t.welcome}, {getUserName(user, t.there)}
              </p>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                {content.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-gray-400 sm:text-lg">
                {content.description}
              </p>
            </div>

            <Link
              to={content.primary.to}
              className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold !text-white transition hover:-translate-y-0.5 shadow-md shadow-blue-500/20 ${blueStyles.button}`}
            >
              <PrimaryIcon size={18} />
              {content.primary.label}
              <ArrowRight size={17} />
            </Link>
          </div>
        </header>

        <div className="grid gap-6 py-10 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-6 shadow-sm dark:shadow-none backdrop-blur-xl sm:p-8">
            <div className="mb-7 flex items-start justify-between gap-5">
              <div>
                <p
                  className={`text-xs font-bold uppercase tracking-[0.18em] ${blueStyles.eyebrow}`}
                >
                  {t.yourWorkspace}
                </p>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                  {t.startAction}
                </h2>
              </div>
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${blueStyles.icon}`}
              >
                <PrimaryIcon size={21} />
              </div>
            </div>

            <Link
              to={content.primary.to}
              className="group flex items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-950/70 p-5 transition hover:border-blue-400 dark:hover:border-gray-600 hover:bg-slate-100 dark:hover:bg-gray-950 shadow-sm dark:shadow-none"
            >
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {content.primary.label}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-gray-400">
                  {content.primary.description}
                </p>
              </div>
              <ArrowRight
                size={19}
                className="shrink-0 text-slate-400 dark:text-gray-500 transition group-hover:translate-x-1 group-hover:text-blue-600 dark:group-hover:text-white"
              />
            </Link>
          </section>

          <section className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 p-6 sm:p-8 shadow-sm dark:shadow-none">
            <p
              className={`text-xs font-bold uppercase tracking-[0.18em] ${blueStyles.eyebrow}`}
            >
              {t.nextSteps}
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
              {content.nextTitle}
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-gray-400">
              {content.nextDesc}
            </p>
          </section>
        </div>

        <section className="pb-12">
          <div className="mb-6">
            <p className="text-sm font-semibold text-slate-500 dark:text-gray-500">
              {t.exploreTools}
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
              {t.builtAroundRole}
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(content.cards || []).map((card) => {
              const CardIcon = card.icon;
              return (
                <Link
                  key={card.label}
                  to={card.to}
                  className="group flex min-h-52 flex-col rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-6 shadow-sm dark:shadow-none transition hover:-translate-y-1 hover:border-blue-400 dark:hover:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-900 hover:shadow-md"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border ${blueStyles.icon}`}
                  >
                    <CardIcon size={19} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                    {card.label}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600 dark:text-gray-500">
                    {card.description}
                  </p>
                  <span
                    className={`mt-5 flex items-center gap-2 text-sm font-bold ${blueStyles.eyebrow}`}
                  >
                    {t.open}{" "}
                    <ArrowRight
                      size={15}
                      className="transition group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </section>
  );
};

export default RoleDashboard;
