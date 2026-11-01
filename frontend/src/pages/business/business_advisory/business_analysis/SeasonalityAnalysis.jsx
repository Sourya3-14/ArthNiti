import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CloudSun,
  CloudRain,
  Thermometer,
  TrendingUp,
  Activity,
  IndianRupee,
} from "lucide-react";

import { aiApi } from "../../../../utils/api";
import { useLanguage } from "../../../../context/LanguageContext";
import BusinessEvidenceLayout, {
  SectionCard,
  Metric,
  InfoRow,
} from "../components/BusinessEvidenceLayout";

const SeasonalityAnalysis = () => {
  const { businessId } = useParams();
  const { language } = useLanguage();

  const translations = {
    english: {
      title: "Seasonality Analysis",
      subtitle: "Monthly demand, production, pricing and environmental risks",
      accessibility: "Accessibility",
      leanMonths: "Lean Months",
      businessCategory: "Business Category",
      marketPriceBaseline: "Market Price Baseline",
      seasonalAdvisory: "Seasonal Advisory",
      noAdvisory: "No advisory available.",
      indexBaseline: "Index Baseline",
      derivedFromMarketPrice: "Derived from market-price evidence",
      priceIndexBaseline: "Price Index Baseline",
      representsMarketBaseline: "Represents the market-price baseline",
      indexInterpretation: "Index Interpretation",
      aboveBaseline: "Above 100% = above baseline",
      belowBaseline: "Below 100% = below baseline",
      vulnerableMonths: "Vulnerable Months",
      noVulnerableMonths: "No vulnerable months identified.",
      monthlySeasonalityProfile: "Monthly Seasonality Profile",
      indexDescription:
        "Price is shown relative to the market-price baseline. Demand and production are shown as percentage indices where 100% represents the baseline level.",
      month: "Month",
      temp: "Temp",
      rainfall: "Rainfall",
      priceIndex: "Price Index",
      estimatedPrice: "Est. Price",
      demandIndex: "Demand Index",
      productionIndex: "Production Index",
      heatStress: "Heat Stress",
      monsoonRisk: "Monsoon Risk",
      location: "Location",
      latitude: "Latitude",
      longitude: "Longitude",
      supplyChainAccessibility: "Supply Chain Accessibility",
      failedToLoad: "Failed to load seasonality analysis.",
      people: "people",
    },
    hindi: {
      title: "मौसमी विश्लेषण",
      subtitle: "मासिक मांग, उत्पादन, मूल्य और पर्यावरणीय जोखिम",
      accessibility: "पहुंच",
      leanMonths: "कम मांग वाले महीने",
      businessCategory: "व्यवसाय श्रेणी",
      marketPriceBaseline: "बाज़ार मूल्य आधार",
      seasonalAdvisory: "मौसमी सलाह",
      noAdvisory: "कोई सलाह उपलब्ध नहीं है।",
      indexBaseline: "सूचकांक आधार",
      derivedFromMarketPrice: "बाज़ार मूल्य डेटा से प्राप्त",
      priceIndexBaseline: "मूल्य सूचकांक आधार",
      representsMarketBaseline: "बाज़ार मूल्य के आधार को दर्शाता है",
      indexInterpretation: "सूचकांक की व्याख्या",
      aboveBaseline: "100% से अधिक = आधार से अधिक",
      belowBaseline: "100% से कम = आधार से कम",
      vulnerableMonths: "जोखिम वाले महीने",
      noVulnerableMonths: "कोई जोखिम वाला महीना नहीं मिला।",
      monthlySeasonalityProfile: "मासिक मौसमी प्रोफ़ाइल",
      indexDescription:
        "मूल्य को बाज़ार मूल्य आधार के सापेक्ष दिखाया गया है। मांग और उत्पादन को प्रतिशत सूचकांक के रूप में दिखाया गया है, जहां 100% आधार स्तर को दर्शाता है।",
      month: "महीना",
      temp: "तापमान",
      rainfall: "वर्षा",
      priceIndex: "मूल्य सूचकांक",
      estimatedPrice: "अनुमानित मूल्य",
      demandIndex: "मांग सूचकांक",
      productionIndex: "उत्पादन सूचकांक",
      heatStress: "गर्मी का तनाव",
      monsoonRisk: "मानसून जोखिम",
      location: "स्थान",
      latitude: "अक्षांश",
      longitude: "देशांतर",
      supplyChainAccessibility: "आपूर्ति श्रृंखला पहुंच",
      failedToLoad: "मौसमी विश्लेषण लोड करने में विफल।",
      people: "लोग",
    },
    bengali: {
      title: "ঋতুভিত্তিক বিশ্লেষণ",
      subtitle: "মাসিক চাহিদা, উৎপাদন, মূল্য এবং পরিবেশগত ঝুঁকি",
      accessibility: "অ্যাক্সেসিবিলিটি",
      leanMonths: "কম চাহিদার মাস",
      businessCategory: "ব্যবসার শ্রেণি",
      marketPriceBaseline: "বাজার মূল্যের ভিত্তি",
      seasonalAdvisory: "ঋতুভিত্তিক পরামর্শ",
      noAdvisory: "কোনো পরামর্শ পাওয়া যায়নি।",
      indexBaseline: "সূচকের ভিত্তি",
      derivedFromMarketPrice: "বাজার মূল্যের তথ্য থেকে নির্ধারিত",
      priceIndexBaseline: "মূল্য সূচকের ভিত্তি",
      representsMarketBaseline: "বাজার মূল্যের ভিত্তি নির্দেশ করে",
      indexInterpretation: "সূচকের ব্যাখ্যা",
      aboveBaseline: "100%-এর বেশি = ভিত্তির চেয়ে বেশি",
      belowBaseline: "100%-এর কম = ভিত্তির চেয়ে কম",
      vulnerableMonths: "ঝুঁকিপূর্ণ মাস",
      noVulnerableMonths: "কোনো ঝুঁকিপূর্ণ মাস শনাক্ত হয়নি।",
      monthlySeasonalityProfile: "মাসিক ঋতুভিত্তিক প্রোফাইল",
      indexDescription:
        "মূল্য বাজার মূল্যের ভিত্তির তুলনায় দেখানো হয়েছে। চাহিদা এবং উৎপাদন শতাংশ সূচক হিসেবে দেখানো হয়েছে, যেখানে 100% ভিত্তি স্তরকে নির্দেশ করে।",
      month: "মাস",
      temp: "তাপমাত্রা",
      rainfall: "বৃষ্টিপাত",
      priceIndex: "মূল্য সূচক",
      estimatedPrice: "আনুমানিক মূল্য",
      demandIndex: "চাহিদা সূচক",
      productionIndex: "উৎপাদন সূচক",
      heatStress: "তাপজনিত চাপ",
      monsoonRisk: "বর্ষার ঝুঁকি",
      location: "অবস্থান",
      latitude: "অক্ষাংশ",
      longitude: "দ্রাঘিমাংশ",
      supplyChainAccessibility: "সরবরাহ শৃঙ্খলের অ্যাক্সেসিবিলিটি",
      failedToLoad: "ঋতুভিত্তিক বিশ্লেষণ লোড করতে ব্যর্থ হয়েছে।",
      people: "জন",
    },
  };

  const t =
    translations[
      language === "hi" ? "hindi" : language === "bn" ? "bengali" : language
    ] || translations.english;

  const [data, setData] = useState(null);
  const [marketPriceData, setMarketPriceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const [seasonalityResponse, marketPriceResponse] = await Promise.all([
          aiApi.get(
            `api/v1/businesses/${businessId}/report/evidence?language=${language}&payload_type=seasonality`,
          ),
          aiApi.get(
            `api/v1/businesses/${businessId}/report/evidence?language=${language}&payload_type=market_price`,
          ),
        ]);

        setData(seasonalityResponse.data || seasonalityResponse);
        setMarketPriceData(marketPriceResponse.data || marketPriceResponse);
      } catch (err) {
        setError(err?.response?.data?.detail || err?.message || t.failedToLoad);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [businessId, language]);

  const seasonality = data?.payload?.data;

  const monthly =
    seasonality?.dynamic_seasonality_analysis?.monthly_index_profile || [];

  const vulnerable =
    seasonality?.dynamic_seasonality_analysis?.vulnerable_lean_months || [];

  const accessibility =
    seasonality?.supply_chain_metrics?.overall_accessibility_score;

  const marketPriceBaseline = useMemo(() => {
    const marketPayload =
      marketPriceData?.payload?.data ||
      marketPriceData?.payload ||
      marketPriceData?.data ||
      marketPriceData;

    const statistics =
      marketPayload?.sources?.agmarknet_prices?.["Goat Meat"]?.statistics ||
      marketPayload?.data?.sources?.agmarknet_prices?.["Goat Meat"]
        ?.statistics ||
      {};

    const candidates = [
      statistics.median,
      statistics.mean,
      statistics.average,
      statistics.avg,
    ];

    const baseline = candidates.find(
      (value) =>
        value !== null &&
        value !== undefined &&
        !Number.isNaN(Number(value)) &&
        Number(value) > 0,
    );

    return baseline ? Number(baseline) : null;
  }, [marketPriceData]);

  const normalizeIndex = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      Number.isNaN(Number(value))
    ) {
      return null;
    }

    const numeric = Number(value);

    return numeric <= 10 ? numeric * 100 : numeric;
  };

  const getPriceFromIndex = (index) => {
    if (!marketPriceBaseline || index === null) {
      return null;
    }

    return marketPriceBaseline * (index / 100);
  };

  const formatPercent = (value) => {
    const normalized = normalizeIndex(value);

    if (normalized === null) {
      return "—";
    }

    return `${normalized.toFixed(1)}%`;
  };

  const formatPrice = (value) => {
    if (value === null || value === undefined) {
      return "—";
    }

    return `₹${Number(value).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <BusinessEvidenceLayout
      title={t.title}
      subtitle={t.subtitle}
      icon={CloudSun}
      iconClassName="text-rose-400"
      loading={loading}
      error={error}
    >
      {seasonality && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              label={t.accessibility}
              value={
                accessibility !== null && accessibility !== undefined
                  ? accessibility
                  : "—"
              }
            />

            <Metric label={t.leanMonths} value={vulnerable.length} />

            <Metric
              label={t.businessCategory}
              value={seasonality.business_category || "—"}
            />

            <Metric
              label={t.marketPriceBaseline}
              value={formatPrice(marketPriceBaseline)}
            />
          </div>

          <div className="mt-5">
            <SectionCard title={t.seasonalAdvisory} icon={CloudRain}>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
                <p className="text-sm leading-7 text-gray-400">
                  {seasonality.dynamic_seasonality_analysis
                    ?.moratorium_advisory || t.noAdvisory}
                </p>
              </div>
            </SectionCard>
          </div>

          <div className="mt-5">
            <SectionCard title={t.indexBaseline} icon={IndianRupee}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-600">
                    {t.marketPriceBaseline}
                  </p>

                  <p className="mt-2 text-xl font-bold text-gray-100">
                    {formatPrice(marketPriceBaseline)}
                  </p>

                  <p className="mt-1 text-xs text-gray-600">
                    {t.derivedFromMarketPrice}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-600">
                    {t.priceIndexBaseline}
                  </p>

                  <p className="mt-2 text-xl font-bold text-gray-100">100%</p>

                  <p className="mt-1 text-xs text-gray-600">
                    {t.representsMarketBaseline}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-600">
                    {t.indexInterpretation}
                  </p>

                  <p className="mt-2 text-sm font-semibold text-gray-300">
                    {t.aboveBaseline}
                  </p>

                  <p className="mt-1 text-xs text-gray-600">
                    {t.belowBaseline}
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>

          <div className="mt-5">
            <SectionCard title={t.vulnerableMonths} icon={Activity}>
              <div className="flex flex-wrap gap-2">
                {vulnerable.length ? (
                  vulnerable.map((month) => (
                    <span
                      key={month}
                      className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-700 dark:text-rose-300"
                    >
                      {month}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500 dark:text-gray-600">
                    {t.noVulnerableMonths}
                  </span>
                )}
              </div>
            </SectionCard>
          </div>

          <div className="mt-5">
            <SectionCard title={t.monthlySeasonalityProfile} icon={TrendingUp}>
              <div className="mb-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
                <p className="text-xs leading-6 text-slate-600 dark:text-gray-500">
                  {t.indexDescription}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-gray-800 text-xs uppercase tracking-wider text-slate-500 dark:text-gray-600">
                      <th className="px-3 py-3">{t.month}</th>
                      <th className="px-3 py-3">{t.temp}</th>
                      <th className="px-3 py-3">{t.rainfall}</th>
                      <th className="px-3 py-3">{t.priceIndex}</th>
                      <th className="px-3 py-3">{t.estimatedPrice}</th>
                      <th className="px-3 py-3">{t.demandIndex}</th>
                      <th className="px-3 py-3">{t.productionIndex}</th>
                      <th className="px-3 py-3">{t.heatStress}</th>
                      <th className="px-3 py-3">{t.monsoonRisk}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {monthly.map((month) => {
                      const priceIndex = normalizeIndex(month.price_index);
                      const demandIndex = normalizeIndex(month.demand_index);
                      const productionIndex = normalizeIndex(
                        month.production_index,
                      );

                      const estimatedPrice = getPriceFromIndex(priceIndex);

                      return (
                        <tr
                          key={month.month}
                          className="border-b border-slate-100 dark:border-gray-900 text-sm"
                        >
                          <td className="px-3 py-4 font-bold text-slate-900 dark:text-gray-200">
                            {month.month}
                          </td>

                          <td className="px-3 py-4 text-slate-500 dark:text-gray-500">
                            <span className="inline-flex items-center gap-1">
                              <Thermometer size={13} />
                              {month.avg_temp_c ?? "—"}°C
                            </span>
                          </td>

                          <td className="px-3 py-4 text-slate-500 dark:text-gray-500">
                            {month.rainfall_mm ?? "—"} mm
                          </td>

                          <td className="px-3 py-4 font-semibold text-slate-700 dark:text-gray-300">
                            {formatPercent(month.price_index)}
                          </td>

                          <td className="px-3 py-4 font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatPrice(estimatedPrice)}
                          </td>

                          <td className="px-3 py-4 font-semibold text-blue-600 dark:text-blue-400">
                            {formatPercent(month.demand_index)}
                          </td>

                          <td className="px-3 py-4 font-semibold text-violet-600 dark:text-violet-400">
                            {formatPercent(month.production_index)}
                          </td>

                          <td className="px-3 py-4 text-slate-600 dark:text-gray-400">
                            {formatPercent(month.heat_stress_factor)}
                          </td>

                          <td className="px-3 py-4">
                            <span
                              className={
                                Number(month.monsoon_risk_factor) >= 0.8
                                  ? "font-bold text-rose-600 dark:text-rose-400"
                                  : Number(month.monsoon_risk_factor) >= 0.5
                                    ? "font-semibold text-amber-600 dark:text-amber-400"
                                    : "text-slate-500 dark:text-gray-500"
                              }
                            >
                              {month.monsoon_risk_factor ?? "—"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <SectionCard title={t.location} icon={CloudSun}>
              <InfoRow label={t.location} value={seasonality.location || "—"} />

              <InfoRow
                label={t.latitude}
                value={seasonality.coordinates?.lat ?? "—"}
              />

              <InfoRow
                label={t.longitude}
                value={seasonality.coordinates?.lon ?? "—"}
              />
            </SectionCard>

            <SectionCard title={t.supplyChainAccessibility} icon={Activity}>
              {Object.entries(
                seasonality.supply_chain_metrics?.nodes || {},
              ).map(([key, node]) => (
                <InfoRow
                  key={key}
                  label={node.pillar || key}
                  value={`${node.road_distance_km ?? "—"} km · ${
                    node.travel_time_minutes ?? "—"
                  } min`}
                />
              ))}
            </SectionCard>
          </div>
        </>
      )}
    </BusinessEvidenceLayout>
  );
};

export default SeasonalityAnalysis;
