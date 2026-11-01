import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Boxes, Factory, Snowflake, Tractor, MapPin } from "lucide-react";

import { aiApi } from "../../../../utils/api";
import { useLanguage } from "../../../../context/LanguageContext";
import BusinessEvidenceLayout, {
  SectionCard,
  Metric,
  InfoRow,
} from "../components/BusinessEvidenceLayout";

const SupplyChainAnalysis = () => {
  const { businessId } = useParams();
  const { language } = useLanguage();

  const translations = {
    english: {
      title: "Supply Chain Analysis",
      subtitle: "Sourcing, processing and logistics infrastructure",
      overallScore: "Overall Score",
      businessType: "Business Type",
      location: "Location",
      livestockSourcing: "Livestock Sourcing & Farms",
      processingSlaughter: "Slaughterhouse & Processing",
      coldChainLogistics: "Cold Chain & Logistics",
      score: "Score",
      status: "Status",
      nearestFacility: "Nearest Facility",
      distance: "Distance",
      notMapped: "Not mapped",
      analysisLocation: "Analysis Location",
      latitude: "Latitude",
      longitude: "Longitude",
      failedToLoad: "Failed to load supply chain analysis.",
    },
    hindi: {
      title: "आपूर्ति श्रृंखला विश्लेषण",
      subtitle: "स्रोत, प्रसंस्करण और लॉजिस्टिक्स बुनियादी ढांचा",
      overallScore: "कुल स्कोर",
      businessType: "व्यवसाय का प्रकार",
      location: "स्थान",
      livestockSourcing: "पशुधन स्रोत और फार्म",
      processingSlaughter: "वधशाला और प्रसंस्करण",
      coldChainLogistics: "कोल्ड चेन और लॉजिस्टिक्स",
      score: "स्कोर",
      status: "स्थिति",
      nearestFacility: "निकटतम सुविधा",
      distance: "दूरी",
      notMapped: "मैप नहीं किया गया",
      analysisLocation: "विश्लेषण स्थान",
      latitude: "अक्षांश",
      longitude: "देशांतर",
      failedToLoad: "आपूर्ति श्रृंखला विश्लेषण लोड करने में विफल।",
    },
    bengali: {
      title: "সরবরাহ শৃঙ্খল বিশ্লেষণ",
      subtitle: "সংগ্রহ, প্রক্রিয়াকরণ এবং লজিস্টিক অবকাঠামো",
      overallScore: "সামগ্রিক স্কোর",
      businessType: "ব্যবসার ধরন",
      location: "অবস্থান",
      livestockSourcing: "পশু সংগ্রহ ও খামার",
      processingSlaughter: "কসাইখানা ও প্রক্রিয়াকরণ",
      coldChainLogistics: "কোল্ড চেইন ও লজিস্টিকস",
      score: "স্কোর",
      status: "স্থিতি",
      nearestFacility: "নিকটতম সুবিধা",
      distance: "দূরত্ব",
      notMapped: "ম্যাপ করা হয়নি",
      analysisLocation: "বিশ্লেষণের অবস্থান",
      latitude: "অক্ষাংশ",
      longitude: "দ্রাঘিমাংশ",
      failedToLoad: "সরবরাহ শৃঙ্খল বিশ্লেষণ লোড করতে ব্যর্থ হয়েছে।",
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
          `api/v1/businesses/${businessId}/report/evidence?language=${language}&payload_type=supply_chain`,
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

  const supply = data?.payload?.data;
  const pillars = supply?.pillars;

  const pillarConfig = [
    {
      key: "livestock_sourcing",
      title: t.livestockSourcing,
      icon: Tractor,
    },
    {
      key: "processing_slaughter",
      title: t.processingSlaughter,
      icon: Factory,
    },
    {
      key: "cold_chain_logistics",
      title: t.coldChainLogistics,
      icon: Snowflake,
    },
  ];

  return (
    <BusinessEvidenceLayout
      title={t.title}
      subtitle={t.subtitle}
      icon={Boxes}
      iconClassName="text-amber-600 dark:text-amber-400"
      loading={loading}
      error={error}
    >
      {supply && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Metric
              label={t.overallScore}
              value={`${supply.overall_supply_chain_score}/100`}
            />

            <Metric label={t.businessType} value={supply.business_type} />

            <Metric label={t.location} value={supply.location} />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {pillarConfig.map((item) => {
              const pillar = pillars?.[item.key];
              const Icon = item.icon;

              return (
                <SectionCard key={item.key} title={item.title} icon={Icon}>
                  <div className="mb-5 flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-gray-500">{t.score}</span>

                    <span className="text-2xl font-extrabold text-slate-900 dark:text-gray-200">
                      {pillar?.score ?? "—"}
                      <span className="text-sm text-slate-400 dark:text-gray-600">/100</span>
                    </span>
                  </div>

                  <InfoRow label={t.status} value={pillar?.status} />

                  <InfoRow
                    label={t.nearestFacility}
                    value={pillar?.nearest_name}
                  />

                  <InfoRow
                    label={t.distance}
                    value={
                      pillar?.distance_km != null
                        ? `${pillar.distance_km} km`
                        : t.notMapped
                    }
                  />
                </SectionCard>
              );
            })}
          </div>

          <div className="mt-5">
            <SectionCard title={t.analysisLocation} icon={MapPin}>
              <InfoRow
                label={t.latitude}
                value={supply.coordinates?.latitude}
              />

              <InfoRow
                label={t.longitude}
                value={supply.coordinates?.longitude}
              />

              <InfoRow label={t.location} value={supply.location} />
            </SectionCard>
          </div>
        </>
      )}
    </BusinessEvidenceLayout>
  );
};

export default SupplyChainAnalysis;
