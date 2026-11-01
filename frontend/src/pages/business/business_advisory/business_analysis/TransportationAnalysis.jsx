import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Truck, Route, Fuel, Clock, MapPin } from "lucide-react";

import { aiApi } from "../../../../utils/api";
import { useLanguage } from "../../../../context/LanguageContext";
import BusinessEvidenceLayout, {
  SectionCard,
  Metric,
  InfoRow,
} from "../components/BusinessEvidenceLayout";

const TransportationAnalysis = () => {
  const { businessId } = useParams();
  const { language } = useLanguage();

  const translations = {
    english: {
      title: "Transportation Analysis",
      subtitle: "Routes, vehicles and modeled logistics expenditure",
      activeRoutes: "Active Routes",
      monthlyFreight: "Monthly Freight",
      roadDistance: "Road Distance",
      travelTime: "Travel Time",
      origin: "Origin",
      location: "Location",
      latitude: "Latitude",
      longitude: "Longitude",
      monthlyCost: "Monthly Cost",
      destination: "Destination",
      detourFactor: "Detour Factor",
      monthlyTrips: "Monthly Trips",
      vehicle: "Vehicle",
      payloadCapacity: "Payload Capacity",
      ratePerKm: "Rate / km",
      logisticsCostAdvisory: "Logistics Cost Advisory",
      advisoryText:
        "The transportation figures are modeled estimates based on discovered or estimated supply-chain nodes. They should be treated as planning estimates rather than confirmed commercial quotations.",
      failedToLoad: "Failed to load transportation analysis.",
      minutes: "minutes",
    },
    hindi: {
      title: "परिवहन विश्लेषण",
      subtitle: "मार्ग, वाहन और अनुमानित लॉजिस्टिक्स व्यय",
      activeRoutes: "सक्रिय मार्ग",
      monthlyFreight: "मासिक माल ढुलाई",
      roadDistance: "सड़क दूरी",
      travelTime: "यात्रा समय",
      origin: "प्रारंभिक स्थान",
      location: "स्थान",
      latitude: "अक्षांश",
      longitude: "देशांतर",
      monthlyCost: "मासिक लागत",
      destination: "गंतव्य",
      detourFactor: "अतिरिक्त मार्ग कारक",
      monthlyTrips: "मासिक यात्राएँ",
      vehicle: "वाहन",
      payloadCapacity: "भार क्षमता",
      ratePerKm: "दर / किमी",
      logisticsCostAdvisory: "लॉजिस्टिक्स लागत सलाह",
      advisoryText:
        "परिवहन के आंकड़े खोजे गए या अनुमानित आपूर्ति-श्रृंखला केंद्रों के आधार पर मॉडल किए गए अनुमान हैं। इन्हें निश्चित व्यावसायिक कोटेशन के बजाय योजना बनाने के अनुमान के रूप में माना जाना चाहिए।",
      failedToLoad: "परिवहन विश्लेषण लोड करने में विफल।",
      minutes: "मिनट",
    },
    bengali: {
      title: "পরিবহন বিশ্লেষণ",
      subtitle: "রুট, যানবাহন এবং মডেল করা লজিস্টিক্স ব্যয়",
      activeRoutes: "সক্রিয় রুট",
      monthlyFreight: "মাসিক মাল পরিবহন",
      roadDistance: "সড়ক দূরত্ব",
      travelTime: "যাত্রার সময়",
      origin: "উৎসস্থান",
      location: "অবস্থান",
      latitude: "অক্ষাংশ",
      longitude: "দ্রাঘিমাংশ",
      monthlyCost: "মাসিক খরচ",
      destination: "গন্তব্য",
      detourFactor: "বিকল্প পথের ফ্যাক্টর",
      monthlyTrips: "মাসিক যাত্রা",
      vehicle: "যানবাহন",
      payloadCapacity: "বহন ক্ষমতা",
      ratePerKm: "হার / কিমি",
      logisticsCostAdvisory: "লজিস্টিক্স খরচ সংক্রান্ত পরামর্শ",
      advisoryText:
        "পরিবহনের পরিসংখ্যান আবিষ্কৃত বা আনুমানিক সরবরাহ-শৃঙ্খল কেন্দ্রের ভিত্তিতে মডেল করা হয়েছে। এগুলিকে নিশ্চিত বাণিজ্যিক কোটেশনের পরিবর্তে পরিকল্পনার আনুমানিক হিসাব হিসেবে বিবেচনা করা উচিত।",
      failedToLoad: "পরিবহন বিশ্লেষণ লোড করা যায়নি।",
      minutes: "মিনিট",
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
          `api/v1/businesses/${businessId}/report/evidence?language=${language}&payload_type=transportation`,
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

  const transportation = data?.payload?.data;
  const summary = transportation?.summary;
  const routes = transportation?.transportation_logistics_opex || {};

  return (
    <BusinessEvidenceLayout
      title={t.title}
      subtitle={t.subtitle}
      icon={Truck}
      iconClassName="text-cyan-400"
      loading={loading}
      error={error}
    >
      {transportation && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Metric
              label={t.activeRoutes}
              value={summary?.active_routes_modeled}
            />

            <Metric
              label={t.monthlyFreight}
              value={
                summary?.total_monthly_freight_opex_inr != null
                  ? `₹${summary.total_monthly_freight_opex_inr.toLocaleString(
                      "en-IN",
                      { maximumFractionDigits: 2 },
                    )}`
                  : "—"
              }
            />

            <Metric
              label={t.roadDistance}
              value={
                Object.values(routes)[0]?.route_metrics?.road_distance_km
                  ? `${Object.values(routes)[0].route_metrics.road_distance_km} km`
                  : "—"
              }
            />

            <Metric
              label={t.travelTime}
              value={
                Object.values(routes)[0]?.route_metrics?.duration_minutes
                  ? `${Object.values(routes)[0].route_metrics.duration_minutes} min`
                  : "—"
              }
            />
          </div>

          <div className="mt-5">
            <SectionCard title={t.origin} icon={MapPin}>
              <InfoRow label={t.location} value={transportation.origin?.name} />

              <InfoRow
                label={t.latitude}
                value={transportation.origin?.coordinates?.lat}
              />

              <InfoRow
                label={t.longitude}
                value={transportation.origin?.coordinates?.lon}
              />
            </SectionCard>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {Object.entries(routes).map(([key, route]) => {
              const metrics = route.route_metrics;
              const schedule = route.dispatch_schedule;
              const vehicle = route.vehicle_specification;

              return (
                <SectionCard
                  key={key}
                  title={route.pillar_label || key}
                  icon={Route}
                >
                  <div className="mb-5 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/60 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-gray-600">
                          {t.monthlyCost}
                        </p>

                        <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-gray-200">
                          ₹
                          {schedule?.estimated_monthly_cost_inr?.toLocaleString(
                            "en-IN",
                            { maximumFractionDigits: 2 },
                          )}
                        </p>
                      </div>

                      <Fuel className="text-cyan-600 dark:text-cyan-400" size={22} />
                    </div>
                  </div>

                  <InfoRow
                    label={t.destination}
                    value={route.destination_facility}
                  />

                  <InfoRow
                    label={t.roadDistance}
                    value={`${metrics?.road_distance_km ?? "—"} km`}
                  />

                  <InfoRow
                    label={t.travelTime}
                    value={`${metrics?.duration_minutes ?? "—"} ${t.minutes}`}
                  />

                  <InfoRow
                    label={t.detourFactor}
                    value={metrics?.detour_factor}
                  />

                  <InfoRow
                    label={t.monthlyTrips}
                    value={schedule?.estimated_monthly_trips}
                  />

                  <InfoRow
                    label={t.vehicle}
                    value={vehicle?.recommended_vehicle}
                  />

                  <InfoRow
                    label={t.payloadCapacity}
                    value={
                      vehicle?.payload_capacity_kg
                        ? `${vehicle.payload_capacity_kg} kg`
                        : "—"
                    }
                  />

                  <InfoRow
                    label={t.ratePerKm}
                    value={
                      vehicle?.rate_per_km_inr
                        ? `₹${vehicle.rate_per_km_inr}`
                        : "—"
                    }
                  />
                </SectionCard>
              );
            })}
          </div>

          <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-500 dark:text-amber-400" />

              <div>
                <h3 className="font-bold text-amber-700 dark:text-amber-300">
                  {t.logisticsCostAdvisory}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-gray-500">
                  {t.advisoryText}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </BusinessEvidenceLayout>
  );
};

export default TransportationAnalysis;
