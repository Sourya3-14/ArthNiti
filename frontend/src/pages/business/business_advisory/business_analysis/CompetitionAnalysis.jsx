import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShoppingCart, MapPin, Users, Store } from "lucide-react";

import { aiApi } from "../../../../utils/api";
import { useLanguage } from "../../../../context/LanguageContext";
import BusinessEvidenceLayout, {
  SectionCard,
  Metric,
  InfoRow,
} from "../components/BusinessEvidenceLayout";

const CompetitionAnalysis = () => {
  const { businessId } = useParams();
  const { language } = useLanguage();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const translations = {
    english: {
      title: "Competition Analysis",
      subtitle: "Nearby businesses and competitive market intelligence",
      totalCompetitors: "Total Competitors",
      within2km: "Within 2 km",
      within5km: "Within 5 km",
      within10km: "Within 10 km",
      competitorDensity: "Competitor Density",
      searchInformation: "Search Information",
      businessType: "Business Type",
      radius: "Radius",
      latitude: "Latitude",
      longitude: "Longitude",
      nearbyCompetitors: "Nearby Competitors",
      noCompetitors: "No mapped competitors were found.",
      unnamedBusiness: "Unnamed Business",
      shop: "Shop",
      halal: "Halal",
      failed: "Failed to load competition analysis.",
      people: "people",
      openStreetMap: "OpenStreetMap",
    },
    hindi: {
      title: "प्रतिस्पर्धा विश्लेषण",
      subtitle: "आस-पास के व्यवसाय और प्रतिस्पर्धी बाजार की जानकारी",
      totalCompetitors: "कुल प्रतिस्पर्धी",
      within2km: "2 किमी के भीतर",
      within5km: "5 किमी के भीतर",
      within10km: "10 किमी के भीतर",
      competitorDensity: "प्रतिस्पर्धी घनत्व",
      searchInformation: "खोज जानकारी",
      businessType: "व्यवसाय का प्रकार",
      radius: "दायरा",
      latitude: "अक्षांश",
      longitude: "देशांतर",
      nearbyCompetitors: "आस-पास के प्रतिस्पर्धी",
      noCompetitors: "कोई मैप किए गए प्रतिस्पर्धी नहीं मिले।",
      unnamedBusiness: "अनाम व्यवसाय",
      shop: "दुकान",
      halal: "हलाल",
      failed: "प्रतिस्पर्धा विश्लेषण लोड करने में विफल।",
      people: "लोग",
      openStreetMap: "OpenStreetMap",
    },
    bengali: {
      title: "প্রতিযোগিতা বিশ্লেষণ",
      subtitle: "কাছাকাছি ব্যবসা এবং প্রতিযোগিতামূলক বাজারের তথ্য",
      totalCompetitors: "মোট প্রতিযোগী",
      within2km: "২ কিমির মধ্যে",
      within5km: "৫ কিমির মধ্যে",
      within10km: "১০ কিমির মধ্যে",
      competitorDensity: "প্রতিযোগীর ঘনত্ব",
      searchInformation: "অনুসন্ধানের তথ্য",
      businessType: "ব্যবসার ধরন",
      radius: "ব্যাসার্ধ",
      latitude: "অক্ষাংশ",
      longitude: "দ্রাঘিমাংশ",
      nearbyCompetitors: "কাছাকাছি প্রতিযোগী",
      noCompetitors: "কোনও ম্যাপ করা প্রতিযোগী পাওয়া যায়নি।",
      unnamedBusiness: "নামবিহীন ব্যবসা",
      shop: "দোকান",
      halal: "হালাল",
      failed: "প্রতিযোগিতা বিশ্লেষণ লোড করা যায়নি।",
      people: "জন",
      openStreetMap: "OpenStreetMap",
    },
  };

  const t =
    translations[
      language === "hi" ? "hindi" : language === "bn" ? "bengali" : language
    ] || translations.english;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await aiApi.get(
          `api/v1/businesses/${businessId}/report/evidence?language=${language}&payload_type=competitors`,
        );

        setData(response.data || response);
      } catch (err) {
        setError(err?.response?.data?.detail || err?.message || t.failed);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [businessId, language]);

  const dataSet = data?.payload?.data;
  const summary = dataSet?.competitor_summary;
  const competitors = dataSet?.competitors || [];

  return (
    <BusinessEvidenceLayout
      title={t.title}
      subtitle={t.subtitle}
      icon={ShoppingCart}
      iconClassName="text-violet-400"
      loading={loading}
      error={error}
    >
      {dataSet && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Metric
              label={t.totalCompetitors}
              value={summary?.total_unique_competitors}
            />

            <Metric label={t.within2km} value={summary?.within_2km} />

            <Metric label={t.within5km} value={summary?.within_5km} />

            <Metric label={t.within10km} value={summary?.within_10km} />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <SectionCard title={t.competitorDensity} icon={Users}>
              <InfoRow
                label="2 km"
                value={`${summary?.competitor_density_per_1000_people?.["2km"] ?? 0} / 1,000 ${t.people}`}
              />

              <InfoRow
                label="5 km"
                value={`${summary?.competitor_density_per_1000_people?.["5km"] ?? 0} / 1,000 ${t.people}`}
              />

              <InfoRow
                label="10 km"
                value={`${summary?.competitor_density_per_1000_people?.["10km"] ?? 0} / 1,000 ${t.people}`}
              />
            </SectionCard>

            <SectionCard title={t.searchInformation} icon={MapPin}>
              <InfoRow
                label={t.businessType}
                value={dataSet.search?.business_type}
              />

              <InfoRow
                label={t.radius}
                value={`${dataSet.search?.radius_km} km`}
              />

              <InfoRow label={t.latitude} value={dataSet.search?.latitude} />

              <InfoRow label={t.longitude} value={dataSet.search?.longitude} />
            </SectionCard>
          </div>

          <div className="mt-5">
            <SectionCard title={t.nearbyCompetitors} icon={Store}>
              {competitors.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 dark:border-gray-800 p-8 text-center text-sm text-slate-500 dark:text-gray-600">
                  {t.noCompetitors}
                </div>
              ) : (
                <div className="space-y-3">
                  {competitors.map((competitor) => (
                    <div
                      key={`${competitor.osm_type}-${competitor.osm_id}`}
                      className="rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/60 p-4 transition hover:border-slate-300 dark:hover:border-gray-700"
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row">
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-gray-200">
                            {competitor.name || t.unnamedBusiness}
                          </h3>

                          <p className="mt-1 text-xs text-slate-500 dark:text-gray-600">
                            {competitor.source || t.openStreetMap}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-sm font-semibold text-violet-600 dark:text-violet-400">
                          <MapPin size={14} />
                          {competitor.distance_km} km
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {competitor.tags?.shop && (
                          <span className="rounded-lg border border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-900 px-2.5 py-1 text-xs text-slate-600 dark:text-gray-500">
                            {t.shop}: {competitor.tags.shop}
                          </span>
                        )}

                        {competitor.tags?.butcher && (
                          <span className="rounded-lg border border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-900 px-2.5 py-1 text-xs text-slate-600 dark:text-gray-500">
                            {competitor.tags.butcher}
                          </span>
                        )}

                        {competitor.tags?.["diet:halal"] && (
                          <span className="rounded-lg border border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-900 px-2.5 py-1 text-xs text-slate-600 dark:text-gray-500">
                            {t.halal}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </>
      )}
    </BusinessEvidenceLayout>
  );
};

export default CompetitionAnalysis;
