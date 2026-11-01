import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";

import { api } from "../../../../utils/api";
import { useLanguage } from "../../../../context/LanguageContext";

const translations = {
  english: { business: "Business", category: "Business category" },
  hindi: { business: "व्यवसाय", category: "व्यवसाय श्रेणी" },
  bengali: { business: "ব্যবসা", category: "ব্যবসার বিভাগ" },
};

const BusinessScopeBadge = ({ businessId, className = "" }) => {
  const { language } = useLanguage();
  const t = translations[language] || translations.english;
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadBusiness = async () => {
      try {
        const response = await api.get(`/businesses/${businessId}`);
        if (isMounted) {
          setBusiness(response?.data?.business || response?.data || response);
        }
      } catch {
        // The page can still render its existing content when the profile is unavailable.
      }
    };

    if (businessId) loadBusiness();

    return () => {
      isMounted = false;
    };
  }, [businessId]);

  const businessName = business?.business_name || business?.name;
  const category = business?.category || business?.business_category;

  if (!businessName && !category) return null;

  return (
    <div
      className={`flex max-w-full items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-right shadow-sm ${className}`}
      aria-label={`${businessName || t.business}${category ? `, ${t.category}: ${category}` : ""}`}
    >
      <Building2 size={16} className="shrink-0 text-amber-600 dark:text-amber-300" />
      <div className="min-w-0">
        <p className="truncate text-sm font-extrabold text-slate-900 dark:text-white">
          {businessName || t.business}
        </p>
        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-200">
          {t.category}
        </p>
        <p className="truncate text-xs font-bold text-amber-900 dark:text-amber-50">
          {category || "—"}
        </p>
      </div>
    </div>
  );
};

export default BusinessScopeBadge;
