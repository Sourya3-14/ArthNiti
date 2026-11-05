import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BrainCircuit,
  Building2,
  Calculator,
  CheckCircle2,
  Loader2,
  Sparkles,
  WalletCards,
  IndianRupee,
} from "lucide-react";

const translations = {
  english: {
    generateTitle: "Create Financial Plan",
    regenerateTitle: "Regenerate Financial Plan",
    generateSubtitle:
      "Choose how you want us to determine the financial inputs for your business.",
    regenerateSubtitle:
      "Choose whether to reuse your own figures or let AI estimate the financial inputs again.",
    provideInputs: "I'll provide the inputs",
    provideInputsDescription:
      "Enter your expected monthly revenue and costs yourself.",
    aiEstimate: "Let AI estimate them",
    aiEstimateDescription:
      "AI will use your Business Analysis and available business data to estimate realistic financial figures.",
    selected: "Selected",
    margin: "Your Contribution / Margin",
    monthlyRevenue: "Monthly Revenue",
    monthlyDirectCosts: "Monthly Direct Costs",
    monthlyFixedCosts: "Monthly Fixed Costs",
    revenueHint: "Expected monthly sales/revenue",
    directCostsHint:
      "Raw materials, inventory, production and other variable costs",
    fixedCostsHint: "Rent, salaries, utilities and other fixed monthly costs",
    marginHint: "Amount you can contribute toward the project cost",
    aiNotice:
      "AI estimation will use the completed Business Analysis to estimate realistic monthly revenue and costs. You do not need to enter those figures.",
    businessAnalysisRequired: "Business Analysis Required",
    businessAnalysisRequiredText:
      "Complete the Business Analysis first. Financial planning uses its market, competition, pricing and business insights to produce better estimates.",
    completeBusinessAnalysis: "Complete Business Analysis",
    back: "Back to Workspace",
    generate: "Generate Financial Analysis",
    regenerate: "Regenerate Financial Analysis",
    chooseMethod: "Choose an option above to continue.",
    businessSummary: "Business Summary",
    businessName: "Business Name",
    category: "Category",
    location: "Location",
    capital: "Project Capital",
    generating: "Generating financial analysis...",
    regenerating: "Regenerating financial analysis...",
  },
  hindi: {
    generateTitle: "वित्तीय योजना बनाएं",
    regenerateTitle: "वित्तीय योजना दोबारा बनाएं",
    generateSubtitle:
      "चुनें कि आपके व्यवसाय के वित्तीय इनपुट कैसे निर्धारित किए जाएं।",
    regenerateSubtitle:
      "चुनें कि अपने आंकड़ों का उपयोग करना है या AI से वित्तीय आंकड़ों का दोबारा अनुमान लगवाना है।",
    provideInputs: "मैं इनपुट दूंगा",
    provideInputsDescription: "अपनी अपेक्षित मासिक आय और खर्च स्वयं दर्ज करें।",
    aiEstimate: "AI को अनुमान लगाने दें",
    aiEstimateDescription:
      "AI आपके Business Analysis और उपलब्ध व्यवसाय डेटा के आधार पर उचित वित्तीय आंकड़ों का अनुमान लगाएगा।",
    selected: "चयनित",
    margin: "आपका योगदान / मार्जिन",
    monthlyRevenue: "मासिक आय",
    monthlyDirectCosts: "मासिक प्रत्यक्ष खर्च",
    monthlyFixedCosts: "मासिक स्थायी खर्च",
    revenueHint: "अपेक्षित मासिक बिक्री/आय",
    directCostsHint: "कच्चा माल, इन्वेंटरी, उत्पादन और अन्य परिवर्तनीय खर्च",
    fixedCostsHint: "किराया, वेतन, बिजली और अन्य स्थायी मासिक खर्च",
    marginHint: "परियोजना लागत में आपका योगदान",
    aiNotice:
      "AI पूरा किए गए Business Analysis का उपयोग करके उचित मासिक आय और खर्च का अनुमान लगाएगा। आपको ये आंकड़े दर्ज करने की आवश्यकता नहीं है।",
    businessAnalysisRequired: "Business Analysis आवश्यक है",
    businessAnalysisRequiredText:
      "पहले Business Analysis पूरा करें। वित्तीय योजना बेहतर अनुमान के लिए बाजार, प्रतिस्पर्धा, कीमत और व्यवसाय संबंधी जानकारी का उपयोग करती है।",
    completeBusinessAnalysis: "Business Analysis पूरा करें",
    back: "वर्कस्पेस पर वापस जाएँ",
    generate: "वित्तीय विश्लेषण बनाएं",
    regenerate: "वित्तीय विश्लेषण दोबारा बनाएं",
    chooseMethod: "जारी रखने के लिए ऊपर से एक विकल्प चुनें।",
    businessSummary: "व्यवसाय सारांश",
    businessName: "व्यवसाय का नाम",
    category: "श्रेणी",
    location: "स्थान",
    capital: "परियोजना पूंजी",
    generating: "वित्तीय विश्लेषण बनाया जा रहा है...",
    regenerating: "वित्तीय विश्लेषण दोबारा बनाया जा रहा है...",
  },
  bengali: {
    generateTitle: "আর্থিক পরিকল্পনা তৈরি করুন",
    regenerateTitle: "আর্থিক পরিকল্পনা পুনরায় তৈরি করুন",
    generateSubtitle:
      "আপনার ব্যবসার আর্থিক ইনপুট কীভাবে নির্ধারণ করা হবে তা বেছে নিন।",
    regenerateSubtitle:
      "নিজের তথ্য ব্যবহার করবেন নাকি AI দিয়ে আর্থিক তথ্যের পুনরায় অনুমান করাবেন তা বেছে নিন।",
    provideInputs: "আমি ইনপুট দেব",
    provideInputsDescription: "আপনার প্রত্যাশিত মাসিক আয় ও খরচ নিজে লিখুন।",
    aiEstimate: "AI-কে অনুমান করতে দিন",
    aiEstimateDescription:
      "AI আপনার Business Analysis এবং উপলব্ধ ব্যবসায়িক তথ্য ব্যবহার করে বাস্তবসম্মত আর্থিক তথ্য অনুমান করবে।",
    selected: "নির্বাচিত",
    margin: "আপনার অবদান / মার্জিন",
    monthlyRevenue: "মাসিক আয়",
    monthlyDirectCosts: "মাসিক প্রত্যক্ষ খরচ",
    monthlyFixedCosts: "মাসিক স্থায়ী খরচ",
    revenueHint: "প্রত্যাশিত মাসিক বিক্রয়/আয়",
    directCostsHint: "কাঁচামাল, ইনভেন্টরি, উৎপাদন এবং অন্যান্য পরিবর্তনশীল খরচ",
    fixedCostsHint: "ভাড়া, বেতন, বিদ্যুৎ এবং অন্যান্য স্থায়ী মাসিক খরচ",
    marginHint: "প্রকল্পের মোট খরচে আপনার অবদান",
    aiNotice:
      "AI সম্পূর্ণ Business Analysis ব্যবহার করে বাস্তবসম্মত মাসিক আয় ও খরচের অনুমান করবে। আপনাকে এই তথ্যগুলি দিতে হবে না।",
    businessAnalysisRequired: "Business Analysis প্রয়োজন",
    businessAnalysisRequiredText:
      "প্রথমে Business Analysis সম্পূর্ণ করুন। আর্থিক পরিকল্পনা আরও ভালো অনুমানের জন্য বাজার, প্রতিযোগিতা, মূল্য এবং ব্যবসায়িক তথ্য ব্যবহার করে।",
    completeBusinessAnalysis: "Business Analysis সম্পূর্ণ করুন",
    back: "ওয়ার্কস্পেসে ফিরে যান",
    generate: "আর্থিক বিশ্লেষণ তৈরি করুন",
    regenerate: "আর্থিক বিশ্লেষণ পুনরায় তৈরি করুন",
    chooseMethod: "চালিয়ে যেতে উপরের একটি বিকল্প বেছে নিন।",
    businessSummary: "ব্যবসার সারাংশ",
    businessName: "ব্যবসার নাম",
    category: "শ্রেণি",
    location: "স্থান",
    capital: "প্রকল্প মূলধন",
    generating: "আর্থিক বিশ্লেষণ তৈরি হচ্ছে...",
    regenerating: "আর্থিক বিশ্লেষণ পুনরায় তৈরি হচ্ছে...",
  },
};

const normalizeLanguage = (value) => {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "hi" || normalized === "hindi") return "hindi";
  if (normalized === "bn" || normalized === "bengali") return "bengali";
  return "english";
};

const FinanceGeneration = ({
  business,
  loading,
  error,
  onGenerate,
  onBack,
  onCompleteBusinessAnalysis,
  businessAnalysisAvailable,
  language,
  isRegeneration = false,
  initialInputs = null,
}) => {
  const currentLanguage = normalizeLanguage(language);
  const t = translations[currentLanguage];

  const [method, setMethod] = useState(null);
  const [inputs, setInputs] = useState({
    margin: 0,
    monthly_revenue: 0,
    monthly_direct_costs: 0,
    monthly_fixed_costs: 0,
  });

  useEffect(() => {
    setInputs({
      margin: Number(
        initialInputs?.margin ??
          initialInputs?.margin_capital ??
          business?.margin_capital ??
          0,
      ),
      monthly_revenue: Number(
        initialInputs?.monthly_revenue ?? business?.monthly_revenue ?? 0,
      ),
      monthly_direct_costs: Number(
        initialInputs?.monthly_direct_costs ??
          business?.monthly_direct_costs ??
          0,
      ),
      monthly_fixed_costs: Number(
        initialInputs?.monthly_fixed_costs ??
          business?.monthly_fixed_costs ??
          0,
      ),
    });
    setMethod(null);
  }, [initialInputs, business]);

  const handleInputChange = (field, value) => {
    setInputs((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleGenerate = () => {
    if (!method || loading) return;

    onGenerate({
      method,
      inputs: {
        margin: Number(inputs.margin || 0),
        monthly_revenue:
          method === "ai" ? 0 : Number(inputs.monthly_revenue || 0),
        monthly_direct_costs:
          method === "ai" ? 0 : Number(inputs.monthly_direct_costs || 0),
        monthly_fixed_costs:
          method === "ai" ? 0 : Number(inputs.monthly_fixed_costs || 0),
      },
    });
  };

  const canGenerate = Boolean(method) && businessAnalysisAvailable === true;

  const displayCapital = Number(
    inputs.margin ||
      business?.margin_capital ||
      business?.project_cost ||
      business?.total_capital ||
      0,
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 px-4 py-8 text-slate-900 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-gray-400 transition hover:text-slate-900 dark:hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft size={16} />
          {t.back}
        </button>

        <div className="mb-8 rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-6 shadow-sm dark:shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <WalletCards size={26} />
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                <Sparkles size={15} />
                {isRegeneration ? t.regenerateTitle : t.generateTitle}
              </div>
              <h1 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
                {isRegeneration ? t.regenerateTitle : t.generateTitle}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-gray-500">
                {isRegeneration ? t.regenerateSubtitle : t.generateSubtitle}
              </p>
            </div>
          </div>
        </div>

        {business && (
          <div className="mb-6 rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/50 p-5 backdrop-blur-xl sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Building2 size={18} className="text-blue-600 dark:text-blue-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {t.businessSummary}
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 dark:border-gray-800/80 bg-white dark:bg-gray-900/40 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-gray-500">
                  {t.businessName}
                </p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-gray-200">
                  {business.name ||
                    business.business_name ||
                    business.title ||
                    "—"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-gray-800/80 bg-white dark:bg-gray-900/40 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-gray-500">
                  {t.category}
                </p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-gray-200">
                  {business.category || business.business_category || "—"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-gray-800/80 bg-white dark:bg-gray-900/40 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-gray-500">
                  {t.location}
                </p>
                <p className="mt-1 truncate font-semibold text-slate-900 dark:text-gray-200">
                  {[business.village, business.district, business.state]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-gray-800/80 bg-white dark:bg-gray-900/40 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-gray-500">
                  {t.capital}
                </p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-gray-200">
                  ₹{displayCapital.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        )}

        {businessAnalysisAvailable === false && (
          <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
              <div className="flex-1">
                <h2 className="font-bold text-amber-300">
                  {t.businessAnalysisRequired}
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-400">
                  {t.businessAnalysisRequiredText ||
                    t.businessAnalysisDescription}
                </p>
                <button
                  type="button"
                  onClick={onCompleteBusinessAnalysis}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-amber-500"
                >
                  <Sparkles size={14} />
                  {t.completeBusinessAnalysis}
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-2xl border border-blue-500/20 bg-blue-500/5 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Sparkles size={18} className="animate-spin" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {isRegeneration ? t.regenerating : t.generating}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    Calculating multi-year cash flow models, debt servicing & financial ratios...
                  </p>
                </div>
              </div>
              <div className="h-2 w-24 overflow-hidden rounded-full bg-blue-500/20">
                <div className="h-full w-full animate-pulse bg-blue-500" />
              </div>
            </div>

            {/* Financial Analysis Demo Template Skeleton */}
            <div className="space-y-6 animate-pulse">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: "Est. Monthly Revenue", val: "w-24" },
                  { label: "Operating Costs", val: "w-20" },
                  { label: "Projected Margin", val: "w-16" },
                  { label: "Break-Even Month", val: "w-12" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-5 shadow-sm"
                  >
                    <p className="text-xs font-semibold uppercase text-slate-400 dark:text-gray-500">
                      {item.label}
                    </p>
                    <div className={`mt-3 h-7 ${item.val} rounded-lg bg-slate-200 dark:bg-gray-800`} />
                  </div>
                ))}
              </div>

              {/* Schedule Table Skeleton */}
              <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between border-b border-slate-200 dark:border-gray-800 pb-4">
                  <div className="h-5 w-48 rounded bg-slate-200 dark:bg-gray-800" />
                  <div className="h-4 w-28 rounded bg-slate-200 dark:bg-gray-800" />
                </div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((row) => (
                    <div
                      key={row}
                      className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-gray-800/80 bg-slate-50 dark:bg-gray-950/40 px-4 py-3"
                    >
                      <div className="h-4 w-32 rounded bg-slate-200 dark:bg-gray-800" />
                      <div className="flex gap-6">
                        <div className="h-4 w-20 rounded bg-slate-200 dark:bg-gray-800" />
                        <div className="h-4 w-20 rounded bg-slate-200 dark:bg-gray-800" />
                        <div className="h-4 w-16 rounded bg-slate-200 dark:bg-gray-800" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setMethod("manual")}
                disabled={businessAnalysisAvailable !== true}
                className={`group rounded-2xl border p-6 text-left backdrop-blur-xl transition ${
                  method === "manual"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 ring-1 ring-blue-500/30"
                    : "border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 hover:border-slate-300 dark:hover:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-900 shadow-sm"
                } ${
                  businessAnalysisAvailable !== true
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Calculator size={21} />
                  </div>
                  {method === "manual" && (
                    <CheckCircle2 size={21} className="text-blue-600 dark:text-blue-400" />
                  )}
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                  {t.provideInputs}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-gray-500">
                  {t.provideInputsDescription}
                </p>

                {method === "manual" && (
                  <span className="mt-4 inline-flex rounded-lg border border-blue-500/30 bg-blue-500/20 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
                    {t.selected}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setMethod("ai")}
                disabled={businessAnalysisAvailable !== true}
                className={`group rounded-2xl border p-6 text-left backdrop-blur-xl transition ${
                  method === "ai"
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10 ring-1 ring-violet-500/30"
                    : "border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 hover:border-slate-300 dark:hover:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-900 shadow-sm"
                } ${
                  businessAnalysisAvailable !== true
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400">
                    <BrainCircuit size={21} />
                  </div>
                  {method === "ai" && (
                    <CheckCircle2 size={21} className="text-violet-600 dark:text-violet-400" />
                  )}
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                  {t.aiEstimate}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-gray-500">
                  {t.aiEstimateDescription}
                </p>

                {method === "ai" && (
                  <span className="mt-4 inline-flex rounded-lg border border-violet-500/30 bg-violet-500/20 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
                    {t.selected}
                  </span>
                )}
              </button>
            </div>

            {method === "manual" && (
              <div className="mt-6 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950/40 p-6 shadow-sm backdrop-blur-xl sm:p-8">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-gray-200">
                    {t.provideInputs}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-gray-500">
                    Enter the figures you expect for your business.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-gray-300">
                      {t.margin}
                    </label>
                    <div className="relative">
                      <IndianRupee
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-600"
                      />
                      <input
                        type="number"
                        min="0"
                        value={inputs.margin}
                        onChange={(event) =>
                          handleInputChange("margin", event.target.value)
                        }
                        className="w-full rounded-xl border border-slate-300 dark:border-gray-800 bg-slate-50 dark:bg-gray-950 py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 dark:placeholder:text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-gray-600">
                      {t.marginHint}
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-gray-300">
                      {t.monthlyRevenue}
                    </label>
                    <div className="relative">
                      <IndianRupee
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-600"
                      />
                      <input
                        type="number"
                        min="0"
                        value={inputs.monthly_revenue}
                        onChange={(event) =>
                          handleInputChange(
                            "monthly_revenue",
                            event.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 dark:border-gray-800 bg-slate-50 dark:bg-gray-950 py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 dark:placeholder:text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-gray-600">
                      {t.revenueHint}
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-gray-300">
                      {t.monthlyDirectCosts}
                    </label>
                    <div className="relative">
                      <IndianRupee
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-600"
                      />
                      <input
                        type="number"
                        min="0"
                        value={inputs.monthly_direct_costs}
                        onChange={(event) =>
                          handleInputChange(
                            "monthly_direct_costs",
                            event.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 dark:border-gray-800 bg-slate-50 dark:bg-gray-950 py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 dark:placeholder:text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-gray-600">
                      {t.directCostsHint}
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-gray-300">
                      {t.monthlyFixedCosts}
                    </label>
                    <div className="relative">
                      <IndianRupee
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-600"
                      />
                      <input
                        type="number"
                        min="0"
                        value={inputs.monthly_fixed_costs}
                        onChange={(event) =>
                          handleInputChange(
                            "monthly_fixed_costs",
                            event.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 dark:border-gray-800 bg-slate-50 dark:bg-gray-950 py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 dark:placeholder:text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-gray-600">
                      {t.fixedCostsHint}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {method === "ai" && (
              <div className="mt-6 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6 backdrop-blur-xl">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400">
                    <BrainCircuit size={21} />
                  </div>
                  <div>
                    <h2 className="font-bold text-violet-700 dark:text-violet-300">
                      {t.aiEstimate}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-gray-400">
                      {t.aiNotice}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onBack}
                className="rounded-xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-gray-950 px-5 py-3 text-sm font-bold text-slate-700 dark:text-gray-400 transition hover:bg-slate-100 dark:hover:bg-gray-900 hover:text-slate-900 dark:hover:text-white"
              >
                {t.back}
              </button>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold !text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRegeneration ? (
                  <Sparkles size={16} />
                ) : (
                  <WalletCards size={16} />
                )}
                {isRegeneration ? t.regenerate : t.generate}
              </button>
            </div>

            {!method && businessAnalysisAvailable === true && (
              <p className="mt-3 text-center text-xs text-gray-600">
                {t.chooseMethod}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FinanceGeneration;
