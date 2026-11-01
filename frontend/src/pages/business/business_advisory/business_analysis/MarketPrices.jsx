import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { TrendingUp, Database, Tag, BarChart3 } from "lucide-react";

import { aiApi } from "../../../../utils/api";
import { useLanguage } from "../../../../context/LanguageContext";
import BusinessEvidenceLayout, {
  SectionCard,
  Metric,
  InfoRow,
} from "../components/BusinessEvidenceLayout";

const MarketPrices = () => {
  const { businessId } = useParams();
  const { language } = useLanguage();

  const translations = {
    english: {
      title: "Market Prices",
      subtitle: "Commodity pricing and market intelligence",
      minimum: "Minimum",
      median: "Median",
      mean: "Mean",
      maximum: "Maximum",
      commodityInformation: "Commodity Information",
      businessType: "Business Type",
      state: "State",
      matchedCommodity: "Matched Commodity",
      commodityId: "Commodity ID",
      dataPoints: "Data Points",
      dataSources: "Data Sources",
      source: "Source",
      commodityAliases: "Commodity Aliases",
      pricingDataAdvisory: "Pricing Data Advisory",
      advisoryText:
        "The reported statistics may combine wholesale lots, different units and market conditions. They should not automatically be treated as standardized retail per-kg prices without local verification.",
      failedToLoad: "Failed to load market price analysis.",
    },
    hindi: {
      title: "बाज़ार मूल्य",
      subtitle: "वस्तु मूल्य निर्धारण और बाज़ार संबंधी जानकारी",
      minimum: "न्यूनतम",
      median: "मध्यिका",
      mean: "औसत",
      maximum: "अधिकतम",
      commodityInformation: "वस्तु की जानकारी",
      businessType: "व्यवसाय का प्रकार",
      state: "राज्य",
      matchedCommodity: "मिलान की गई वस्तु",
      commodityId: "वस्तु आईडी",
      dataPoints: "डेटा बिंदु",
      dataSources: "डेटा स्रोत",
      source: "स्रोत",
      commodityAliases: "वस्तु के वैकल्पिक नाम",
      pricingDataAdvisory: "मूल्य डेटा सलाह",
      advisoryText:
        "रिपोर्ट किए गए आंकड़ों में थोक लॉट, अलग-अलग इकाइयां और विभिन्न बाज़ार स्थितियां शामिल हो सकती हैं। स्थानीय सत्यापन के बिना इन्हें मानकीकृत खुदरा प्रति किलोग्राम कीमत के रूप में नहीं माना जाना चाहिए।",
      failedToLoad: "बाज़ार मूल्य विश्लेषण लोड करने में विफल।",
    },
    bengali: {
      title: "বাজার মূল্য",
      subtitle: "পণ্যের মূল্য এবং বাজার সংক্রান্ত তথ্য",
      minimum: "সর্বনিম্ন",
      median: "মধ্যমা",
      mean: "গড়",
      maximum: "সর্বোচ্চ",
      commodityInformation: "পণ্যের তথ্য",
      businessType: "ব্যবসার ধরন",
      state: "রাজ্য",
      matchedCommodity: "মিল পাওয়া পণ্য",
      commodityId: "পণ্য আইডি",
      dataPoints: "ডেটা পয়েন্ট",
      dataSources: "ডেটার উৎস",
      source: "উৎস",
      commodityAliases: "পণ্যের বিকল্প নাম",
      pricingDataAdvisory: "মূল্য সংক্রান্ত পরামর্শ",
      advisoryText:
        "প্রতিবেদিত পরিসংখ্যানে পাইকারি লট, বিভিন্ন একক এবং বিভিন্ন বাজার পরিস্থিতির তথ্য একত্রিত হতে পারে। স্থানীয় যাচাই ছাড়া এগুলোকে মানসম্মত খুচরা প্রতি কেজি মূল্য হিসেবে স্বয়ংক্রিয়ভাবে বিবেচনা করা উচিত নয়।",
      failedToLoad: "বাজার মূল্য বিশ্লেষণ লোড করতে ব্যর্থ হয়েছে।",
    },
  };

  const t =
    translations[
      language === "hi" ? "hindi" : language === "bn" ? "bengali" : language
    ] || translations.english;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const response = await aiApi.get(
          `api/v1/businesses/${businessId}/report/evidence?language=${language}&payload_type=market_price`,
        );

        setData(response.data || response);
      } catch (err) {
        setError(err?.response?.data?.detail || err?.message || t.failedToLoad);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [businessId, language]);

  const market = data?.payload?.data;

  const statistics =
    market?.sources?.agmarknet_prices?.["Goat Meat"]?.statistics;

  const commodity = market?.sources?.agmarknet_prices?.["Goat Meat"];

  const profile = market?.ai_generated_profile;

  return (
    <BusinessEvidenceLayout
      title={t.title}
      subtitle={t.subtitle}
      icon={TrendingUp}
      iconClassName="text-emerald-400"
      loading={loading}
      error={error}
    >
      {market && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Metric
              label={t.minimum}
              value={
                statistics?.min != null
                  ? `₹${statistics.min.toLocaleString("en-IN")}`
                  : "—"
              }
            />

            <Metric
              label={t.median}
              value={
                statistics?.median != null
                  ? `₹${statistics.median.toLocaleString("en-IN")}`
                  : "—"
              }
            />

            <Metric
              label={t.mean}
              value={
                statistics?.mean != null
                  ? `₹${statistics.mean.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}`
                  : "—"
              }
            />

            <Metric
              label={t.maximum}
              value={
                statistics?.max != null
                  ? `₹${statistics.max.toLocaleString("en-IN")}`
                  : "—"
              }
            />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <SectionCard title={t.commodityInformation} icon={Tag}>
              <InfoRow label={t.businessType} value={market.business_type} />

              <InfoRow label={t.state} value={market.state} />

              <InfoRow
                label={t.matchedCommodity}
                value={commodity?.matched_commodity}
              />

              <InfoRow label={t.commodityId} value={commodity?.commodity_id} />

              <InfoRow label={t.dataPoints} value={statistics?.data_points} />
            </SectionCard>

            <SectionCard title={t.dataSources} icon={Database}>
              {profile?.sources?.map((source) => (
                <InfoRow key={source} label={t.source} value={source} />
              ))}
            </SectionCard>
          </div>

          <div className="mt-5">
            <SectionCard title={t.commodityAliases} icon={BarChart3}>
              <div className="flex flex-wrap gap-2">
                {commodity?.matched_commodity &&
                  profile?.commodities?.[0]?.aliases?.map((alias) => (
                    <span
                      key={alias}
                      className="rounded-lg border border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-950 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-gray-400"
                    >
                      {alias}
                    </span>
                  ))}
              </div>
            </SectionCard>
          </div>

          <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
            <h3 className="font-bold text-amber-700 dark:text-amber-300">
              {t.pricingDataAdvisory}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-gray-500">
              {t.advisoryText}
            </p>
          </div>
        </>
      )}
    </BusinessEvidenceLayout>
  );
};

export default MarketPrices;
