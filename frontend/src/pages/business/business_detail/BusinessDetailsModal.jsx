import React, { useEffect } from "react";
import {
  Building2,
  CalendarDays,
  CircleDollarSign,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  User,
  X,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import BusinessImageGallery from "../BusinessImageGallery";

// Fix standard Leaflet marker icon asset resolution issues in Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

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

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatCapital = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  const number = Number(value);
  if (Number.isNaN(number)) return String(value);
  return `₹${number.toLocaleString("en-IN")}`;
};

const normalizePhoneForWhatsApp = (phone) => {
  if (!phone) return "";
  const digits = String(phone).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("91") && digits.length >= 12) return digits;
  if (digits.length === 10) return `91${digits}`;
  return digits;
};

const SectionTitle = ({ icon, title }) => (
  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
    <span className="text-indigo-600 dark:text-indigo-400">{icon}</span>
    {title}
  </div>
);

const DetailItem = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] p-3.5">
    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-1 break-words text-sm font-medium text-slate-800 dark:text-slate-200">
      {value !== null && value !== undefined && value !== ""
        ? String(value)
        : "-"}
    </p>
  </div>
);

const BusinessDetailsModal = ({
  business,
  ownerContact,
  contactLoading,
  authenticated,
  languageCode,
  t,
  onClose,
  onVisitProfile,
}) => {
  const businessName =
    getText(business.business_name, languageCode) || t.notAvailable;
  const category = getText(business.category, languageCode) || t.notAvailable;
  const description =
    getText(business.description, languageCode) || t.notAvailable;

  const targetOwnerId =
    business?.owner_id || ownerContact?.owner_id || ownerContact?.user_id;

  const ownerName = getText(ownerContact?.owner_name, languageCode);
  const ownerEmail = getText(ownerContact?.email, languageCode);
  const ownerPhone = getText(
    ownerContact?.phone_number || ownerContact?.phone,
    languageCode,
  );
  const whatsappNumber = normalizePhoneForWhatsApp(ownerPhone);

  const lat = parseFloat(business.latitude);
  const lng = parseFloat(business.longitude);
  const hasValidCoordinates = !Number.isNaN(lat) && !Number.isNaN(lng);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 dark:bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-white/10 px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-300">
              <Building2 size={23} />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                {businessName}
              </h2>
              <p className="mt-1 text-sm font-medium text-indigo-600 dark:text-indigo-300">{category}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
            aria-label={t.close}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-5 py-6 sm:px-6">
          {/* Description */}
          <section>
            <SectionTitle
              icon={<Building2 size={17} />}
              title={t.description}
            />
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] p-4">
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300">
                {description}
              </p>
            </div>
          </section>

          <BusinessImageGallery
            businessId={business.id}
            title={t.businessImages}
            emptyLabel={t.noImages}
            errorLabel={t.imagesLoadFailed}
          />

          {/* Location Details */}
          <section className="mt-7">
            <SectionTitle icon={<MapPin size={17} />} title={t.location} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailItem
                label={t.village}
                value={getText(business.village, languageCode)}
              />
              <DetailItem
                label={t.district}
                value={getText(business.district, languageCode)}
              />
              <DetailItem
                label={t.city}
                value={getText(business.city, languageCode)}
              />
              <DetailItem
                label={t.state}
                value={getText(business.state, languageCode)}
              />
              <DetailItem
                label={t.country}
                value={getText(business.country, languageCode)}
              />
              <DetailItem
                label={t.pincode}
                value={getText(business.pincode, languageCode)}
              />
            </div>
          </section>

          {/* Map */}
          <section className="mt-7">
            <SectionTitle icon={<MapPin size={17} />} title={t.location} />
            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
              {hasValidCoordinates ? (
                <div className="h-64 w-full">
                  <MapContainer
                    center={[lat, lng]}
                    zoom={13}
                    scrollWheelZoom={false}
                    className="h-full w-full z-0"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[lat, lng]}>
                      <Popup>
                        <div className="text-slate-900 font-semibold">
                          {businessName}
                        </div>
                        <div className="text-xs text-slate-600">{category}</div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center p-4 text-sm text-slate-400">
                  {t.notAvailable}
                </div>
              )}
            </div>
          </section>

          {/* Financial Info */}
          <section className="mt-7">
            <SectionTitle
              icon={<CircleDollarSign size={17} />}
              title={t.financial}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailItem
                label={t.capital}
                value={formatCapital(business.margin_capital)}
              />
              <DetailItem
                label={t.status}
                value={
                  getText(business.status, languageCode) === "active"
                    ? t.active
                    : getText(business.status, languageCode) || t.notAvailable
                }
              />
            </div>
          </section>

          {/* Metadata */}
          <section className="mt-7">
            <SectionTitle
              icon={<CalendarDays size={17} />}
              title={t.businessDetails}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailItem label={t.businessId} value={business.id} />
              <DetailItem
                label={t.owner}
                value={
                  authenticated ? ownerName || targetOwnerId : t.notAvailable
                }
              />
              <DetailItem
                label={t.created}
                value={formatDate(business.created_at)}
              />
              <DetailItem
                label={t.updated}
                value={formatDate(business.updated_at)}
              />
            </div>
          </section>

          {/* Owner Details */}
          <section className="mt-7">
            <SectionTitle icon={<User size={17} />} title={t.contactOwner} />

            {!authenticated ? (
              <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/10 p-5">
                <p className="text-sm leading-6 text-indigo-200">
                  {t.signInToContact}
                </p>
              </div>
            ) : contactLoading ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
                <div className="mt-3 h-4 w-56 animate-pulse rounded bg-white/10" />
                <div className="mt-3 h-4 w-44 animate-pulse rounded bg-white/10" />
              </div>
            ) : ownerContact ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
                <div className="space-y-4">
                  {ownerName && (
                    <div className="flex items-center gap-3">
                      <User size={17} className="text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500">{t.owner}</p>
                        <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
                          {ownerName}
                        </p>
                      </div>
                    </div>
                  )}

                  {ownerEmail && (
                    <div className="flex items-center gap-3">
                      <Mail size={17} className="text-slate-500" />
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">{t.email}</p>
                        <p className="mt-0.5 break-all text-sm font-medium text-slate-900 dark:text-white">
                          {ownerEmail}
                        </p>
                      </div>
                    </div>
                  )}

                  {ownerPhone && (
                    <div className="flex items-center gap-3">
                      <Phone size={17} className="text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500">{t.phone}</p>
                        <p className="mt-0.5 text-sm font-medium text-slate-900 dark:text-white">
                          {ownerPhone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 dark:border-white/10 pt-5 sm:flex-row">
                  {targetOwnerId && (
                    <button
                      type="button"
                      onClick={() => onVisitProfile(targetOwnerId)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 shadow-sm"
                    >
                      <User size={17} />
                      {t.visitProfile}
                    </button>
                  )}

                  {ownerEmail && (
                    <a
                      href={`mailto:${ownerEmail}`}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-white transition hover:bg-slate-200 dark:hover:bg-white/10"
                    >
                      <Mail size={17} />
                      {t.email}
                    </a>
                  )}

                  {whatsappNumber && (
                    <a
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-white transition hover:bg-slate-200 dark:hover:bg-white/10"
                    >
                      <MessageCircle size={17} />
                      {t.whatsapp}
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] p-5">
                <p className="text-sm text-slate-600 dark:text-slate-400">{t.contactUnavailable}</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetailsModal;
