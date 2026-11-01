import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../utils/supabase";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  BriefcaseBusiness,
  ShieldCheck,
  ShoppingBag,
  Loader2,
  AlertCircle,
  RefreshCw,
  Landmark,
  Globe2,
  Hash,
  Pencil,
  Sparkles,
  X,
  Check,
  CircleDollarSign,
  CheckCircle2,
  ArrowRight,
  Plus,
} from "lucide-react";
import { api } from "../utils/api";
import { useLanguage } from "../context/LanguageContext";
import ImageLightbox from "../components/ImageLightbox";
import BusinessImageGallery from "./business/BusinessImageGallery";
import BusinessDetailsModal from "./business/business_detail/BusinessDetailsModal";

const PROFILE_ENDPOINT = "/auth/me";
const UPDATE_PROFILE_ENDPOINT = "/auth/update-profile";

const getText = (value, languageCode) => {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "string" || typeof value === "number")
    return String(value);

  if (Array.isArray(value)) {
    return value
      .map((item) => getText(item, languageCode))
      .filter(Boolean)
      .join(", ");
  }

  if (typeof value === "object") {
    const localizedValue =
      value[languageCode] ??
      value.en ??
      value.english ??
      value.hi ??
      value.hindi ??
      value.bn ??
      value.bengali;

    if (
      localizedValue !== undefined &&
      localizedValue !== null &&
      localizedValue !== ""
    ) {
      return getText(localizedValue, languageCode);
    }

    const fallback = Object.values(value).find(
      (item) =>
        item !== null &&
        item !== undefined &&
        item !== "" &&
        typeof item !== "object",
    );
    return fallback !== undefined ? String(fallback) : "";
  }
  return String(value);
};

const formatCapital = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  const number = Number(value);
  if (Number.isNaN(number)) return String(value);
  return `₹${number.toLocaleString("en-IN")}`;
};

const languageMap = {
  english: "en",
  en: "en",
  eng: "en",
  hindi: "hi",
  hi: "hi",
  hin: "hi",
  bengali: "bn",
  bn: "bn",
  bng: "bn",
};

// Extracted outside to prevent unmounting inputs on state change
const InfoItem = ({
  icon: Icon,
  label,
  value,
  fullWidth = false,
  field,
  editable = false,
  isEditing = false,
  editValue = "",
  onEditChange,
  saving = false,
  displayFallback,
}) => (
  <div
    className={`rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/40 p-4 ${fullWidth ? "sm:col-span-2" : ""
      }`}
  >
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-gray-800/70">
        <Icon size={16} className="text-blue-600 dark:text-blue-400" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-500">
          {label}
        </p>

        {isEditing && editable ? (
          <input
            type="text"
            value={editValue}
            onChange={(event) => onEditChange?.(field, event.target.value)}
            disabled={saving}
            className="mt-2 w-full rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 dark:placeholder:text-gray-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          />
        ) : (
          <p className="mt-1 break-words text-sm font-semibold text-slate-800 dark:text-gray-200">
            {value || displayFallback}
          </p>
        )}
      </div>
    </div>
  </div>
);

// Extracted outside to preserve element tree stability
const ProfileSection = ({ icon: Icon, title, headerAction, children }) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 shadow-sm dark:shadow-[0_15px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl">
    <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-gray-800 px-6 py-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
          <Icon size={19} className="text-blue-600 dark:text-blue-400" />
        </div>

        <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
      </div>

      {headerAction}
    </div>

    <div className="p-6">{children}</div>
  </section>
);

const ProfileBusinessCard = ({ business, languageCode, t, onClick }) => {
  const businessName =
    getText(business.business_name, languageCode) || t.notAvailable;
  const category = getText(business.category, languageCode) || t.notAvailable;
  const description =
    getText(business.description, languageCode) || t.notAvailable;

  const statusText =
    getText(business.status, languageCode) === "active"
      ? t.active
      : getText(business.status, languageCode) || t.active;

  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/50 p-5 shadow-sm hover:shadow-md dark:shadow-lg backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:border-blue-500/40 hover:bg-slate-100 dark:hover:bg-gray-900/60">
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        className="flex w-full flex-1 flex-col text-left cursor-pointer focus:outline-none"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Building2 size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-slate-900 dark:text-white transition group-hover:text-blue-600 dark:group-hover:text-blue-300">
                {businessName}
              </h3>
              <p className="mt-0.5 truncate text-xs font-semibold text-blue-600 dark:text-blue-400/90">
                {category}
              </p>
            </div>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={12} />
            {statusText}
          </span>
        </div>

        <div className="mt-4 flex-1">
          <p className="line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-gray-800/60">
        <BusinessImageGallery
          businessId={business.id}
          title={t.businessImages}
          emptyLabel={t.noImages}
          errorLabel={t.imagesLoadFailed}
        />
      </div>
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    address: "",
    village: "",
    district: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");
  const [selectedProfileImage, setSelectedProfileImage] = useState("");

  const [businesses, setBusinesses] = useState([]);
  const [businessesLoading, setBusinessesLoading] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [ownerContact, setOwnerContact] = useState(null);
  const [contactLoading, setContactLoading] = useState(false);

  const translations = {
    english: {
      profile: "Profile",
      subtitle: "Manage your personal information and profile details.",
      loading: "Loading your profile...",
      unableToLoad: "Unable to load profile",
      tryAgain: "Try Again",
      personalInformation: "Personal Information",
      contactInformation: "Contact Information",
      addressInformation: "Address Information",
      roleInformation: "Role Information",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      phone: "Phone",
      address: "Address",
      village: "Village",
      district: "District",
      city: "City",
      state: "State",
      country: "Country",
      pincode: "Pincode",
      entrepreneur: "Entrepreneur",
      buyer: "Buyer",
      government: "Government Official",
      unknownRole: "Profile",
      entrepreneurDescription:
        "Your entrepreneur-specific information will appear here.",
      buyerDescription: "Your buyer-specific information will appear here.",
      governmentDescription: "Your government official information.",
      designation: "Designation",
      agencyName: "Agency Name",
      agencyAddress: "Agency Address",
      agencyCity: "Agency City",
      agencyState: "Agency State",
      agencyCountry: "Agency Country",
      agencyType: "Agency Type",
      agencyPincode: "Agency Pincode",
      notAvailable: "Not available",
      profileUpdated: "Profile information",
      poweredBy: "AI-powered business platform",
      editProfile: "Edit Profile",
      saveChanges: "Save Changes",
      saving: "Saving...",
      cancel: "Cancel",
      profileUpdatedSuccess: "Profile updated successfully.",
      profileUpdateFailed: "Failed to update your profile. Please try again.",
      imageUploadFailed: "Failed to upload image.",
      selectImage: "Please select an image file.",
      uploading: "Uploading...",
      businesses: "Businesses",
      myBusinessesBoard: "My Businesses",
      manageMyBusinesses: "Manage in My Businesses",
      noBusinessesAdded: "No businesses added yet.",
      addFirstBusiness: "Create and manage your businesses in My Businesses.",
      loadingBusinesses: "Loading businesses...",
      viewDetails: "View details",
      close: "Close",
      description: "Description",
      businessImages: "Business images",
      noImages: "No images uploaded yet.",
      imagesLoadFailed: "Unable to load business images.",
      location: "Location",
      financial: "Financial information",
      capital: "Margin capital",
      status: "Status",
      active: "Active",
      businessDetails: "Business details",
      businessId: "Business ID",
      owner: "Owner",
      created: "Created",
      updated: "Updated",
      contactOwner: "Owner Information & Contact",
      signInToContact:
        "Sign in to view owner details, visit their profile, and contact them.",
      whatsapp: "WhatsApp",
      visitProfile: "Visit Profile",
      contactUnavailable: "Owner details are currently unavailable.",
    },
    hindi: {
      profile: "प्रोफ़ाइल",
      subtitle: "अपनी व्यक्तिगत जानकारी और प्रोफ़ाइल विवरण प्रबंधित करें।",
      loading: "आपकी प्रोफ़ाइल लोड हो रही है...",
      unableToLoad: "प्रोफ़ाइल लोड नहीं हो सकी",
      tryAgain: "पुनः प्रयास करें",
      personalInformation: "व्यक्तिगत जानकारी",
      contactInformation: "संपर्क जानकारी",
      addressInformation: "पते की जानकारी",
      roleInformation: "भूमिका की जानकारी",
      firstName: "पहला नाम",
      lastName: "अंतिम नाम",
      email: "ईमेल",
      phone: "फ़ोन",
      address: "पता",
      village: "गाँव",
      district: "जिला",
      city: "शहर",
      state: "राज्य",
      country: "देश",
      pincode: "पिनकोड",
      entrepreneur: "उद्यमी",
      buyer: "खरीदार",
      government: "सरकारी अधिकारी",
      unknownRole: "प्रोफ़ाइल",
      entrepreneurDescription: "आपकी उद्यमी संबंधी जानकारी यहाँ दिखाई देगी।",
      buyerDescription: "आपकी खरीदार संबंधी जानकारी यहाँ दिखाई देगी।",
      governmentDescription: "आपकी सरकारी अधिकारी संबंधी जानकारी।",
      designation: "पद",
      agencyName: "एजेंसी का नाम",
      agencyAddress: "एजेंसी का पता",
      agencyCity: "एजेंसी का शहर",
      agencyState: "एजेंसी का राज्य",
      agencyCountry: "एजेंसी का देश",
      agencyType: "एजेंसी का प्रकार",
      agencyPincode: "एजेंसी पिनकोड",
      notAvailable: "उपलब्ध नहीं",
      profileUpdated: "प्रोफ़ाइल जानकारी",
      poweredBy: "AI-संचालित बिज़नेस प्लेटफ़ॉर्म",
      editProfile: "प्रोफ़ाइल संपादित करें",
      saveChanges: "परिवर्तन सहेजें",
      saving: "सहेजा जा रहा है...",
      cancel: "रद्द करें",
      profileUpdatedSuccess: "प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई।",
      profileUpdateFailed:
        "प्रोफ़ाइल अपडेट नहीं हो सकी। कृपया पुनः प्रयास करें।",
      imageUploadFailed: "प्रोफ़ाइल चित्र अपलोड नहीं हो सका।",
      selectImage: "कृपया एक चित्र फ़ाइल चुनें।",
      uploading: "अपलोड हो रहा है...",
      businesses: "व्यवसाय",
      myBusinessesBoard: "मेरे व्यवसाय",
      manageMyBusinesses: "मेरे व्यवसाय में प्रबंधित करें",
      noBusinessesAdded: "अभी तक कोई व्यवसाय नहीं जोड़ा गया।",
      addFirstBusiness: "मेरे व्यवसाय पृष्ठ पर जाकर अपना पहला व्यवसाय जोड़ें।",
      loadingBusinesses: "व्यवसाय लोड हो रहे हैं...",
      viewDetails: "विवरण देखें",
      close: "बंद करें",
      description: "विवरण",
      businessImages: "व्यवसाय की तस्वीरें",
      noImages: "अभी तक कोई तस्वीर अपलोड नहीं हुई है।",
      imagesLoadFailed: "व्यवसाय की तस्वीरें लोड नहीं हो सकीं।",
      location: "स्थान",
      financial: "वित्तीय जानकारी",
      capital: "मार्जिन पूंजी",
      status: "स्थिति",
      active: "सक्रिय",
      businessDetails: "व्यवसाय का विवरण",
      businessId: "व्यवसाय आईडी",
      owner: "मालिक",
      created: "बनाया गया",
      updated: "अपडेट किया गया",
      contactOwner: "मालिक की जानकारी और संपर्क",
      signInToContact:
        "मालिक की जानकारी देखने, प्रोफ़ाइल देखने और संपर्क करने के लिए साइन इन करें।",
      whatsapp: "व्हाट्सऐप",
      visitProfile: "प्रोफ़ाइल देखें",
      contactUnavailable: "मालिक की जानकारी उपलब्ध नहीं है।",
    },
    bengali: {
      profile: "প্রোফাইল",
      subtitle: "আপনার ব্যক্তিগত তথ্য এবং প্রোফাইলের বিবরণ পরিচালনা করুন।",
      loading: "আপনার প্রোফাইল লোড হচ্ছে...",
      unableToLoad: "প্রোফাইল লোড করা যায়নি",
      tryAgain: "আবার চেষ্টা করুন",
      personalInformation: "ব্যক্তিগত তথ্য",
      contactInformation: "যোগাযোগের তথ্য",
      addressInformation: "ঠিকানার তথ্য",
      roleInformation: "ভূমিকার তথ্য",
      firstName: "নাম",
      lastName: "পদবি",
      email: "ইমেল",
      phone: "ফোন",
      address: "ঠিকানা",
      village: "গ্রাম",
      district: "জেলা",
      city: "শহর",
      state: "রাজ্য",
      country: "দেশ",
      pincode: "পিনকোড",
      entrepreneur: "উদ্যোক্তা",
      buyer: "ক্রেতা",
      government: "সরকারি কর্মকর্তা",
      unknownRole: "প্রোফাইল",
      entrepreneurDescription:
        "আপনার উদ্যোক্তা সম্পর্কিত তথ্য এখানে প্রদর্শিত হবে।",
      buyerDescription: "আপনার ক্রেতা সম্পর্কিত তথ্য এখানে প্রদর্শিত হবে।",
      governmentDescription: "আপনার সরকারি কর্মকর্তা সম্পর্কিত তথ্য।",
      designation: "পদবি",
      agencyName: "এজেন্সির নাম",
      agencyAddress: "এজেন্সির ঠিকানা",
      agencyCity: "এজেন্সির শহর",
      agencyState: "এজেন্সির রাজ্য",
      agencyCountry: "এজেন্সির দেশ",
      agencyType: "এজেন্সির ধরন",
      agencyPincode: "এজেন্সির পিনকোড",
      notAvailable: "উপলব্ধ নয়",
      profileUpdated: "প্রোফাইলের তথ্য",
      poweredBy: "AI-চালিত বিজনেস প্ল্যাটফর্ম",
      editProfile: "প্রোফাইল সম্পাদনা করুন",
      saveChanges: "পরিবর্তন সংরক্ষণ করুন",
      saving: "সংরক্ষণ করা হচ্ছে...",
      cancel: "বাতিল",
      profileUpdatedSuccess: "প্রোফাইল সফলভাবে আপডেট হয়েছে।",
      profileUpdateFailed:
        "প্রোফাইল আপডেট করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।",
      imageUploadFailed: "প্রোফাইল ছবি আপলোড করা যায়নি।",
      selectImage: "অনুগ্রহ করে একটি ছবি ফাইল নির্বাচন করুন।",
      uploading: "আপলোড হচ্ছে...",
      businesses: "ব্যবসা",
      myBusinessesBoard: "আমার ব্যবসা",
      manageMyBusinesses: "আমার ব্যবসায় পরিচালনা করুন",
      noBusinessesAdded: "এখনও কোনো ব্যবসা যোগ করা হয়নি।",
      addFirstBusiness: "আমার ব্যবসা পৃষ্ঠায় গিয়ে আপনার প্রথম ব্যবসা তৈরি করুন।",
      loadingBusinesses: "ব্যবসা লোড হচ্ছে...",
      viewDetails: "বিস্তারিত দেখুন",
      close: "বন্ধ করুন",
      description: "বিবরণ",
      businessImages: "ব্যবসার ছবি",
      noImages: "এখনও কোনো ছবি আপলোড হয়নি।",
      imagesLoadFailed: "ব্যবসার ছবি লোড করা যায়নি।",
      location: "অবস্থান",
      financial: "আর্থিক তথ্য",
      capital: "মার্জিন মূলধন",
      status: "স্থিতি",
      active: "সক্রিয়",
      businessDetails: "ব্যবসার বিবরণ",
      businessId: "ব্যবসা আইডি",
      owner: "মালিক",
      created: "তৈরি হয়েছে",
      updated: "আপডেট হয়েছে",
      contactOwner: "মালিকের তথ্য ও যোগাযোগ",
      signInToContact:
        "মালিকের বিবরণ দেখতে, প্রোফাইল দেখতে এবং যোগাযোগ করতে সাইন ইন করুন।",
      whatsapp: "হোয়াটসঅ্যাপ",
      visitProfile: "প্রোফাইল দেখুন",
      contactUnavailable: "মালিকের তথ্য পাওয়া যায়নি।",
    },
  };

  const t = translations[language] || translations.english;

  const getLocalizedValue = (value) => {
    if (value === null || value === undefined || value === "") return "";

    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }

    if (Array.isArray(value)) {
      return value
        .map((item) => getLocalizedValue(item))
        .filter(Boolean)
        .join(", ");
    }

    if (typeof value === "object") {
      const languageKeys = {
        english: ["english", "en"],
        hindi: ["hindi", "hi"],
        bengali: ["bengali", "bn"],
      };

      const keys = languageKeys[language] || languageKeys.english;

      for (const key of keys) {
        if (
          value[key] !== undefined &&
          value[key] !== null &&
          value[key] !== ""
        ) {
          return getLocalizedValue(value[key]);
        }
      }

      for (const key of ["en", "english", "hi", "hindi", "bn", "bengali"]) {
        if (
          value[key] !== undefined &&
          value[key] !== null &&
          value[key] !== ""
        ) {
          return getLocalizedValue(value[key]);
        }
      }

      return "";
    }

    return String(value);
  };

  const getProfileImage = (profileData = profile) => {
    if (!profileData) return "";

    return (
      getLocalizedValue(profileData.profile_pic) ||
      getLocalizedValue(profileData.profile_image) ||
      ""
    );
  };

  const fetchEntrepreneurDetails = async () => ({
    available: false,
    data: null,
  });

  const fetchBuyerDetails = async () => ({
    available: false,
    data: null,
  });

  const startEditing = () => {
    setEditForm({
      first_name: getLocalizedValue(profile?.first_name),
      last_name: getLocalizedValue(profile?.last_name),
      phone_number: getLocalizedValue(profile?.phone || profile?.phone_number),
      address: getLocalizedValue(profile?.address),
      village: getLocalizedValue(profile?.village),
      district: getLocalizedValue(profile?.district),
      city: getLocalizedValue(profile?.city),
      state: getLocalizedValue(profile?.state),
      country: getLocalizedValue(profile?.country),
      pincode: getLocalizedValue(profile?.pincode),
    });
    setSaveError("");
    setSaveSuccess("");
    setImageError("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setSaveError("");
    setSaveSuccess("");
  };

  const handleEditChange = (field, value) => {
    setEditForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const saveProfile = async () => {
    try {
      setSavingProfile(true);
      setSaveError("");
      setSaveSuccess("");

      const response = await api.patch(UPDATE_PROFILE_ENDPOINT, editForm, {
        params: {
          language: language || "english",
        },
      });

      const updatedProfile = response.data || {};

      setProfile((previous) => ({
        ...previous,
        ...(typeof updatedProfile === "object" ? updatedProfile : {}),
        first_name: updatedProfile.first_name ?? editForm.first_name,
        last_name: updatedProfile.last_name ?? editForm.last_name,
        phone:
          updatedProfile.phone ??
          updatedProfile.phone_number ??
          editForm.phone_number,
        phone_number:
          updatedProfile.phone_number ??
          updatedProfile.phone ??
          editForm.phone_number,
        address: updatedProfile.address ?? editForm.address,
        village: updatedProfile.village ?? editForm.village,
        district: updatedProfile.district ?? editForm.district,
        city: updatedProfile.city ?? editForm.city,
        state: updatedProfile.state ?? editForm.state,
        country: updatedProfile.country ?? editForm.country,
        pincode: updatedProfile.pincode ?? editForm.pincode,
      }));

      setIsEditing(false);
      setSaveSuccess(t.profileUpdatedSuccess);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setSaveError(
        getLocalizedValue(err.response?.data?.detail) || t.profileUpdateFailed,
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setImageError("");
    setSaveError("");
    setSaveSuccess("");
    setUploadingImage(true);

    try {
      if (!file.type.startsWith("image/")) {
        throw new Error(t.selectImage);
      }

      const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("profile-images")
        .getPublicUrl(fileName);

      const imageUrl = publicUrlData?.publicUrl;

      if (!imageUrl) {
        throw new Error(t.imageUploadFailed);
      }

      const response = await api.patch(
        UPDATE_PROFILE_ENDPOINT,
        {
          profile_pic: imageUrl,
        },
        {
          params: {
            language: language || "english",
          },
        },
      );

      const updatedProfile = response.data || {};

      setProfile((previous) => ({
        ...previous,
        ...(typeof updatedProfile === "object" ? updatedProfile : {}),
        profile_pic: imageUrl,
        profile_image: imageUrl,
      }));

      setSaveSuccess(t.profileUpdatedSuccess);
    } catch (err) {
      console.error("Image upload failed:", err);
      setImageError(
        getLocalizedValue(err.response?.data?.detail) ||
        err.message ||
        t.imageUploadFailed,
      );
    } finally {
      setUploadingImage(false);

      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(PROFILE_ENDPOINT, {
        params: {
          language: language || "english",
        },
      });

      const profileData = response.data || {};

      const role = getLocalizedValue(profileData.role)
        .toLowerCase()
        .replace(/[\s-]/g, "_");

      if (role === "entrepreneur" || role === "enterpreneur") {
        const entrepreneurDetails = await fetchEntrepreneurDetails();
        profileData.role_specific = entrepreneurDetails.data;
        fetchMyBusinesses();
      }

      if (role === "buyer") {
        const buyerDetails = await fetchBuyerDetails();
        profileData.role_specific = buyerDetails.data;
      }

      setProfile(profileData);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError(getLocalizedValue(err.response?.data?.detail) || t.unableToLoad);
    } finally {
      setLoading(false);
    }
  };

  const languageCode = languageMap[language] || "en";

  const fetchMyBusinesses = async () => {
    try {
      setBusinessesLoading(true);
      const idsResponse = await api.get("/businesses/my");
      const businessIds = idsResponse.data || [];

      if (businessIds.length === 0) {
        setBusinesses([]);
        return;
      }

      const businessResponses = await Promise.all(
        businessIds.map((businessId) =>
          api.get(`/businesses/${businessId}`, {
            params: {
              language: language || "english",
            },
          }),
        ),
      );

      setBusinesses(businessResponses.map((res) => res.data));
    } catch (err) {
      console.error("Failed to fetch my businesses:", err);
      setBusinesses([]);
    } finally {
      setBusinessesLoading(false);
    }
  };

  const handleOpenBusiness = async (business) => {
    setSelectedBusiness(business);
    const fallbackContact = {
      owner_id: business.owner_id || profile?.id || profile?.user_id,
      owner_name: [
        getLocalizedValue(profile?.first_name),
        getLocalizedValue(profile?.last_name),
      ]
        .filter(Boolean)
        .join(" "),
      email: getLocalizedValue(profile?.email),
      phone_number: getLocalizedValue(profile?.phone || profile?.phone_number),
    };
    setOwnerContact(fallbackContact);

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setContactLoading(true);
      const response = await api.get(`/businesses/${business.id}/contact`);
      if (response.data) {
        setOwnerContact(response.data);
      }
    } catch (err) {
      console.error("Failed to load owner contact:", err);
    } finally {
      setContactLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedBusiness(null);
    setOwnerContact(null);
  };

  const handleVisitProfile = (ownerId) => {
    if (!ownerId) return;
    handleCloseModal();
    navigate(`/profile/${ownerId}`);
  };

  useEffect(() => {
    fetchProfile();
  }, [language]);

  const getRoleKey = () => {
    if (!profile?.role) return "unknown";

    return getLocalizedValue(profile.role).toLowerCase().replace(/[\s-]/g, "_");
  };

  const getRoleLabel = () => {
    const role = getRoleKey();

    if (role === "entrepreneur" || role === "enterpreneur") {
      return t.entrepreneur;
    }

    if (role === "buyer") {
      return t.buyer;
    }

    if (role === "government" || role === "government_official") {
      return t.government;
    }

    return getLocalizedValue(profile?.role) || t.unknownRole;
  };

  const getRoleIcon = () => {
    const role = getRoleKey();

    if (role === "entrepreneur" || role === "enterpreneur") {
      return BriefcaseBusiness;
    }

    if (role === "buyer") return ShoppingBag;

    if (role === "government" || role === "government_official") {
      return Landmark;
    }

    return User;
  };

  const getInitials = () => {
    const first = getLocalizedValue(profile?.first_name);
    const last = getLocalizedValue(profile?.last_name);
    const initials = `${first.charAt(0)}${last.charAt(0)}`;

    return initials.toUpperCase() || "U";
  };

  const displayValue = (value) => {
    const resolvedValue = getLocalizedValue(value);
    return resolvedValue || t.notAvailable;
  };

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-50 dark:bg-blue-500/10">
              <Loader2 size={30} className="animate-spin text-blue-500" />
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-gray-400">{t.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-screen max-w-xl items-center justify-center p-6">
          <div className="w-full rounded-3xl border border-red-500/20 bg-red-500/5 p-8 backdrop-blur-xl">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-500/10">
                <AlertCircle size={26} className="text-red-500 dark:text-red-400" />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                {t.unableToLoad}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-gray-400">{error}</p>

              <button
                type="button"
                onClick={fetchProfile}
                className="mt-6 inline-flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-600 !text-white px-5 py-3 text-sm font-bold transition hover:bg-blue-500 shadow-sm"
              >
                <RefreshCw size={16} />
                {t.tryAgain}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const RoleIcon = getRoleIcon();
  const role = getRoleKey();
  const firstName = getLocalizedValue(profile.first_name);
  const lastName = getLocalizedValue(profile.last_name);
  const email = getLocalizedValue(profile.email);
  const phone = getLocalizedValue(profile.phone || profile.phone_number);
  const profileImage = getProfileImage(profile);
  const roleInfo = profile?.role_info || {};

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 h-96 w-96 rounded-full bg-purple-600/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-400">
            <Sparkles size={16} />
            <span>{t.poweredBy}</span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white sm:text-4xl">
                {t.profile}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-gray-400 sm:text-base">
                {t.subtitle}
              </p>
            </div>

            {!isEditing ? (
              <button
                type="button"
                onClick={startEditing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900/80 px-5 py-3 text-sm font-bold text-slate-800 dark:text-white transition hover:border-blue-500/40 hover:bg-slate-50 dark:hover:bg-gray-800 shadow-sm"
              >
                <Pencil size={16} />
                {t.editProfile}
              </button>
            ) : (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={savingProfile}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900/80 px-5 py-3 text-sm font-bold text-slate-700 dark:text-gray-300 transition hover:bg-slate-50 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
                >
                  <X size={16} />
                  {t.cancel}
                </button>

                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={savingProfile}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold !text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-md shadow-blue-500/20"
                >
                  {savingProfile ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  {savingProfile ? t.saving : t.saveChanges}
                </button>
              </div>
            )}
          </div>
        </div>

        {saveError && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-500">
            <AlertCircle size={17} />
            <span>{saveError}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3 text-sm text-green-600 dark:text-green-400">
            <ShieldCheck size={17} />
            <span>{saveSuccess}</span>
          </div>
        )}

        {imageError && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-500">
            <AlertCircle size={17} />
            <span>{imageError}</span>
          </div>
        )}

        <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/70 shadow-sm dark:shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <div className="relative overflow-hidden p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-blue-600/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative shrink-0">
                {profileImage ? (
                  <button
                    type="button"
                    onClick={() => setSelectedProfileImage(profileImage)}
                    className="group block rounded-2xl"
                    aria-label="View profile image"
                  >
                    <img
                      src={profileImage}
                      alt={`${firstName} ${lastName}`}
                      className="h-24 w-24 rounded-2xl border border-slate-200 dark:border-gray-700 object-cover shadow-xl transition duration-200 group-hover:scale-105 sm:h-28 sm:w-28"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  </button>
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-2xl font-extrabold text-blue-600 dark:text-blue-400 shadow-xl sm:h-28 sm:w-28 sm:text-3xl">
                    {getInitials()}
                  </div>
                )}

                <label
                  htmlFor="profile-image-upload"
                  className={`absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-700 dark:text-gray-300 shadow-md transition ${uploadingImage
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white"
                    }`}
                >
                  {uploadingImage ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Pencil size={15} />
                  )}
                </label>

                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="break-words text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
                      {[firstName, lastName].filter(Boolean).join(" ") ||
                        "User"}
                    </h2>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                        <RoleIcon size={13} />
                        {getRoleLabel()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div className="flex min-w-0 items-center gap-2 text-slate-600 dark:text-gray-400">
                    <Mail size={15} className="shrink-0 text-slate-400 dark:text-gray-600" />
                    <span className="truncate">{displayValue(email)}</span>
                  </div>

                  <div className="flex min-w-0 items-center gap-2 text-slate-600 dark:text-gray-400">
                    <Phone size={15} className="shrink-0 text-slate-400 dark:text-gray-600" />
                    <span className="truncate">{displayValue(phone)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ImageLightbox
          src={selectedProfileImage}
          alt={`${firstName} ${lastName}`}
          onClose={() => setSelectedProfileImage("")}
        />

        <div className="space-y-6">
          <ProfileSection icon={User} title={t.personalInformation}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoItem
                icon={User}
                label={t.firstName}
                value={getLocalizedValue(profile.first_name)}
                field="first_name"
                editable
                isEditing={isEditing}
                editValue={editForm.first_name}
                onEditChange={handleEditChange}
                saving={savingProfile}
                displayFallback={t.notAvailable}
              />
              <InfoItem
                icon={User}
                label={t.lastName}
                value={getLocalizedValue(profile.last_name)}
                field="last_name"
                editable
                isEditing={isEditing}
                editValue={editForm.last_name}
                onEditChange={handleEditChange}
                saving={savingProfile}
                displayFallback={t.notAvailable}
              />
              <InfoItem
                icon={Mail}
                label={t.email}
                value={getLocalizedValue(profile.email)}
                displayFallback={t.notAvailable}
              />
              <InfoItem
                icon={Phone}
                label={t.phone}
                value={getLocalizedValue(profile.phone || profile.phone_number)}
                field="phone_number"
                editable
                isEditing={isEditing}
                editValue={editForm.phone_number}
                onEditChange={handleEditChange}
                saving={savingProfile}
                displayFallback={t.notAvailable}
              />
            </div>
          </ProfileSection>

          <ProfileSection icon={MapPin} title={t.addressInformation}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoItem
                icon={MapPin}
                label={t.address}
                value={getLocalizedValue(profile.address)}
                field="address"
                editable
                fullWidth
                isEditing={isEditing}
                editValue={editForm.address}
                onEditChange={handleEditChange}
                saving={savingProfile}
                displayFallback={t.notAvailable}
              />
              <InfoItem
                icon={MapPin}
                label={t.village}
                value={getLocalizedValue(profile.village)}
                field="village"
                editable
                isEditing={isEditing}
                editValue={editForm.village}
                onEditChange={handleEditChange}
                saving={savingProfile}
                displayFallback={t.notAvailable}
              />
              <InfoItem
                icon={MapPin}
                label={t.district}
                value={getLocalizedValue(profile.district)}
                field="district"
                editable
                isEditing={isEditing}
                editValue={editForm.district}
                onEditChange={handleEditChange}
                saving={savingProfile}
                displayFallback={t.notAvailable}
              />
              <InfoItem
                icon={MapPin}
                label={t.city}
                value={getLocalizedValue(profile.city)}
                field="city"
                editable
                isEditing={isEditing}
                editValue={editForm.city}
                onEditChange={handleEditChange}
                saving={savingProfile}
                displayFallback={t.notAvailable}
              />
              <InfoItem
                icon={MapPin}
                label={t.state}
                value={getLocalizedValue(profile.state)}
                field="state"
                editable
                isEditing={isEditing}
                editValue={editForm.state}
                onEditChange={handleEditChange}
                saving={savingProfile}
                displayFallback={t.notAvailable}
              />
              <InfoItem
                icon={Globe2}
                label={t.country}
                value={getLocalizedValue(profile.country)}
                field="country"
                editable
                isEditing={isEditing}
                editValue={editForm.country}
                onEditChange={handleEditChange}
                saving={savingProfile}
                displayFallback={t.notAvailable}
              />
              <InfoItem
                icon={Hash}
                label={t.pincode}
                value={getLocalizedValue(profile.pincode)}
                field="pincode"
                editable
                isEditing={isEditing}
                editValue={editForm.pincode}
                onEditChange={handleEditChange}
                saving={savingProfile}
                displayFallback={t.notAvailable}
              />
            </div>
          </ProfileSection>

          {(role === "government" || role === "government_official") && (
            <ProfileSection icon={Landmark} title={t.roleInformation}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoItem
                  icon={BriefcaseBusiness}
                  label={t.designation}
                  value={getLocalizedValue(roleInfo.designation)}
                  displayFallback={t.notAvailable}
                />
                <InfoItem
                  icon={Building2}
                  label={t.agencyName}
                  value={getLocalizedValue(roleInfo.agency_name)}
                  displayFallback={t.notAvailable}
                />
                <InfoItem
                  icon={MapPin}
                  label={t.agencyAddress}
                  value={getLocalizedValue(roleInfo.agency_address)}
                  fullWidth
                  displayFallback={t.notAvailable}
                />
                <InfoItem
                  icon={MapPin}
                  label={t.agencyCity}
                  value={getLocalizedValue(roleInfo.agency_city)}
                  displayFallback={t.notAvailable}
                />
                <InfoItem
                  icon={MapPin}
                  label={t.agencyState}
                  value={getLocalizedValue(roleInfo.agency_state)}
                  displayFallback={t.notAvailable}
                />
                <InfoItem
                  icon={Globe2}
                  label={t.agencyCountry}
                  value={getLocalizedValue(roleInfo.agency_country)}
                  displayFallback={t.notAvailable}
                />
                <InfoItem
                  icon={Building2}
                  label={t.agencyType}
                  value={getLocalizedValue(roleInfo.agency_type)}
                  displayFallback={t.notAvailable}
                />
                <InfoItem
                  icon={Hash}
                  label={t.agencyPincode}
                  value={getLocalizedValue(roleInfo.agency_pincode)}
                  displayFallback={t.notAvailable}
                />
              </div>
            </ProfileSection>
          )}

          {(role === "entrepreneur" || role === "enterpreneur") && (
            <>
              <ProfileSection icon={BriefcaseBusiness} title={t.roleInformation}>
                <div className="rounded-2xl border border-blue-500/10 bg-blue-500/5 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                      <BriefcaseBusiness size={22} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {t.entrepreneur}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-gray-400">
                        {t.entrepreneurDescription}
                      </p>
                    </div>
                  </div>
                </div>
              </ProfileSection>

              <ProfileSection
                icon={Building2}
                title={t.myBusinessesBoard}
                headerAction={
                  <Link
                    to="/businesses"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3.5 py-2 text-xs font-bold text-blue-400 transition hover:border-blue-500/40 hover:bg-blue-500/20 hover:text-white"
                  >
                    <span>{t.manageMyBusinesses}</span>
                    <ArrowRight size={14} />
                  </Link>
                }
              >
                {businessesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={28} className="animate-spin text-blue-400" />
                    <span className="ml-3 text-sm text-gray-400">
                      {t.loadingBusinesses}
                    </span>
                  </div>
                ) : businesses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/30 p-8 text-center">
                    <Building2
                      size={36}
                      className="mx-auto text-slate-400 dark:text-gray-600 mb-3"
                    />
                    <p className="text-sm font-semibold text-slate-800 dark:text-gray-300">
                      {t.noBusinessesAdded}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-gray-500">
                      {t.addFirstBusiness}
                    </p>
                    <Link
                      to="/businesses"
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold !text-white transition hover:bg-blue-500 shadow-sm"
                    >
                      <Plus size={14} />
                      <span>{t.manageMyBusinesses}</span>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {businesses.map((business) => (
                      <ProfileBusinessCard
                        key={business.id}
                        business={business}
                        languageCode={languageCode}
                        t={t}
                        onClick={() => handleOpenBusiness(business)}
                      />
                    ))}
                  </div>
                )}
              </ProfileSection>
            </>
          )}

          {role === "buyer" && (
            <ProfileSection icon={ShoppingBag} title={t.roleInformation}>
              <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10">
                    <ShoppingBag size={22} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{t.buyer}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-gray-400">
                      {t.buyerDescription}
                    </p>
                  </div>
                </div>
              </div>
            </ProfileSection>
          )}

          {role !== "government" &&
            role !== "government_official" &&
            role !== "entrepreneur" &&
            role !== "enterpreneur" &&
            role !== "buyer" && (
              <ProfileSection icon={ShieldCheck} title={t.roleInformation}>
                <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/40 p-5">
                  <div className="flex items-center gap-3">
                    <RoleIcon size={20} className="text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {getRoleLabel()}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-gray-500">
                        {t.profileUpdated}
                      </p>
                    </div>
                  </div>
                </div>
              </ProfileSection>
            )}
        </div>
      </div>

      {selectedBusiness && (
        <BusinessDetailsModal
          business={selectedBusiness}
          ownerContact={ownerContact}
          contactLoading={contactLoading}
          authenticated={Boolean(localStorage.getItem("token"))}
          languageCode={languageCode}
          t={t}
          onClose={handleCloseModal}
          onVisitProfile={handleVisitProfile}
        />
      )}
    </div>
  );
};

export default Profile;
