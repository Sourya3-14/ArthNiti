import { useEffect, useState } from "react";
import {
  Building2,
  MapPin,
  Plus,
  Loader2,
  AlertCircle,
  X,
  Check,
  Navigation,
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { api } from "../../utils/api";

// Fix Leaflet marker icon asset resolution in Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const CREATE_BUSINESS_ENDPOINT = "/businesses/create";

// Component to handle map clicks and marker positioning
const LocationPickerMarker = ({ position, onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? <Marker position={position} /> : null;
};

// Component to dynamically re-center map view when coordinates/searches change
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 13);
    }
  }, [center, zoom, map]);
  return null;
};

const InputField = ({
  name,
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
}) => (
  <div>
    <label
      htmlFor={name}
      className="mb-2 block text-sm font-semibold text-slate-700 dark:text-gray-300"
    >
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>

    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      min={type === "number" ? "0" : undefined}
      step={name === "margin_capital" ? "any" : undefined}
      className="w-full rounded-xl border border-slate-300 dark:border-gray-700 bg-slate-50 dark:bg-gray-950/70 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-gray-600 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
    />
  </div>
);

const INITIAL_FORM_STATE = {
  business_name: "",
  category: "",
  description: "",
  village: "",
  district: "",
  city: "",
  state: "",
  country: "",
  margin_capital: "",
  pincode: "",
  latitude: "",
  longitude: "",
};

// Default map view: Center of India
const DEFAULT_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 4;

const CreateBusinessModal = ({ isOpen, onClose, onSuccess, language, t }) => {
  const [businessForm, setBusinessForm] = useState(INITIAL_FORM_STATE);
  const [useProfileLocation, setUseProfileLocation] = useState(null);
  const [creatingBusiness, setCreatingBusiness] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Automatically adjust map when user enters/updates location strings
  useEffect(() => {
    const queryParts = [
      businessForm.city,
      businessForm.district,
      businessForm.state,
      businessForm.country,
    ]
      .map((p) => String(p || "").trim())
      .filter(Boolean);

    if (queryParts.length === 0) return;

    const timer = setTimeout(async () => {
      try {
        setIsGeocoding(true);
        const searchQuery = queryParts.join(", ");
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery,
          )}&limit=1`,
        );
        const data = await response.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setMapCenter([lat, lon]);
          setMapZoom(businessForm.city ? 12 : 7);
        }
      } catch (err) {
        console.warn("Geocoding lookup failed:", err);
      } finally {
        setIsGeocoding(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [
    businessForm.city,
    businessForm.district,
    businessForm.state,
    businessForm.country,
  ]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (creatingBusiness || profileLoading) return;
    setBusinessForm(INITIAL_FORM_STATE);
    setUseProfileLocation(null);
    setCreateError("");
    setMapCenter(DEFAULT_CENTER);
    setMapZoom(DEFAULT_ZOOM);
    onClose();
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setBusinessForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMapLocationSelect = (lat, lng) => {
    const fixedLat = Number(lat.toFixed(6));
    const fixedLng = Number(lng.toFixed(6));
    setBusinessForm((prev) => ({
      ...prev,
      latitude: fixedLat,
      longitude: fixedLng,
    }));
  };

  const handleUseProfileLocation = async () => {
    try {
      setUseProfileLocation(true);
      setProfileLoading(true);
      setCreateError("");

      const response = await api.get("/auth/me", {
        params: { language: language || "english" },
      });
      const profile = response.data;

      setBusinessForm((prev) => ({
        ...prev,
        village: profile.village || "",
        district: profile.district || "",
        city: profile.city || "",
        state: profile.state || "",
        country: profile.country || "",
        pincode: profile.pincode || "",
      }));
    } catch (err) {
      console.error("Failed to fetch profile location:", err);
      setUseProfileLocation(false);
      setCreateError(err.response?.data?.detail || t.profileLocationFailed);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleDifferentLocation = () => {
    setUseProfileLocation(false);
    setBusinessForm((prev) => ({
      ...prev,
      village: "",
      district: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
      latitude: "",
      longitude: "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setCreateError("");

    if (!businessForm.business_name.trim()) {
      setCreateError(t.requiredBusinessName);
      return;
    }

    if (!businessForm.category.trim()) {
      setCreateError(t.requiredCategory);
      return;
    }

    try {
      setCreatingBusiness(true);
      const payload = {
        business_name: businessForm.business_name.trim() || null,
        category: businessForm.category.trim() || null,
        description: businessForm.description.trim() || null,
        village: businessForm.village.trim() || null,
        district: businessForm.district.trim() || null,
        city: businessForm.city.trim() || null,
        state: businessForm.state.trim() || null,
        country: businessForm.country.trim() || null,
        margin_capital:
          businessForm.margin_capital !== ""
            ? Number(businessForm.margin_capital)
            : null,
        pincode: businessForm.pincode.trim() || null,
        latitude:
          businessForm.latitude !== "" ? Number(businessForm.latitude) : null,
        longitude:
          businessForm.longitude !== "" ? Number(businessForm.longitude) : null,
      };

      const response = await api.post(CREATE_BUSINESS_ENDPOINT, payload, {
        params: { language: language || "english" },
      });

      handleClose();
      await onSuccess(response.data);
    } catch (err) {
      console.error("Failed to create business:", err);
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setCreateError(
          detail
            .map((item) => item.msg)
            .filter(Boolean)
            .join(", "),
        );
      } else {
        setCreateError(detail || t.createFailed);
      }
    } finally {
      setCreatingBusiness(false);
    }
  };

  const markerPosition =
    businessForm.latitude !== "" && businessForm.longitude !== ""
      ? [Number(businessForm.latitude), Number(businessForm.longitude)]
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-gray-800 px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
              <Building2 size={22} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {t.createBusiness}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-gray-500">
                {t.createBusinessDescription}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={creatingBusiness || profileLoading}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-800/50 text-slate-500 dark:text-gray-400 transition hover:bg-slate-200 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(92vh-150px)] overflow-y-auto"
        >
          <div className="space-y-8 p-6 sm:p-8">
            {createError && (
              <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-red-500"
                />
                <p className="text-sm leading-6 text-red-700 dark:text-red-300">{createError}</p>
              </div>
            )}

            {/* Location Question */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Navigation size={17} className="text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.businessLocationQuestion}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleUseProfileLocation}
                  disabled={profileLoading || creatingBusiness}
                  className={`relative rounded-2xl border p-4 text-left transition-all ${
                    useProfileLocation === true
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 ring-1 ring-blue-500/30"
                      : "border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/40 hover:border-slate-300 dark:hover:border-gray-700 hover:bg-slate-100 dark:hover:bg-gray-800/40"
                  }`}
                >
                  {useProfileLocation === true && (
                    <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        useProfileLocation === true
                          ? "bg-blue-500/20"
                          : "bg-slate-200 dark:bg-gray-800"
                      }`}
                    >
                      {profileLoading ? (
                        <Loader2
                          size={19}
                          className="animate-spin text-blue-600 dark:text-blue-400"
                        />
                      ) : (
                        <MapPin size={19} className="text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {t.yesUseProfile}
                      </p>
                      {profileLoading && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-gray-500">
                          {t.profileLocationLoading}
                        </p>
                      )}
                      {!profileLoading && useProfileLocation === true && (
                        <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                          {t.profileLocationLoaded}
                        </p>
                      )}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleDifferentLocation}
                  disabled={profileLoading || creatingBusiness}
                  className={`relative rounded-2xl border p-4 text-left transition-all ${
                    useProfileLocation === false
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 ring-1 ring-blue-500/30"
                      : "border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/40 hover:border-slate-300 dark:hover:border-gray-700 hover:bg-slate-100 dark:hover:bg-gray-800/40"
                  }`}
                >
                  {useProfileLocation === false && (
                    <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        useProfileLocation === false
                          ? "bg-blue-500/20"
                          : "bg-slate-200 dark:bg-gray-800"
                      }`}
                    >
                      <MapPin size={19} className="text-slate-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {t.noDifferentLocation}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-gray-500">
                        {t.manualLocation}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Business Information */}
            <div>
              <h3 className="mb-5 text-base font-bold text-slate-900 dark:text-white">
                {t.businessInformation}
              </h3>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <InputField
                    name="business_name"
                    label={t.businessName}
                    placeholder={t.businessNamePlaceholder}
                    value={businessForm.business_name}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <InputField
                  name="category"
                  label={t.category}
                  placeholder={t.categoryPlaceholder}
                  value={businessForm.category}
                  onChange={handleFormChange}
                  required
                />
                <InputField
                  name="margin_capital"
                  label={t.marginCapital}
                  placeholder={t.marginCapitalPlaceholder}
                  value={businessForm.margin_capital}
                  onChange={handleFormChange}
                  type="number"
                />
                <div className="sm:col-span-2">
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-gray-300"
                  >
                    {t.description}
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={businessForm.description}
                    onChange={handleFormChange}
                    placeholder={t.descriptionPlaceholder}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-slate-300 dark:border-gray-700 bg-slate-50 dark:bg-gray-950/70 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-gray-600 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>
              </div>
            </div>

            {/* Location Address Fields */}
            <div>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t.locationInformation}
                  </h3>
                  {useProfileLocation === true && (
                    <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                      {t.profileLocationLoaded}
                    </p>
                  )}
                </div>
                <MapPin size={18} className="text-slate-400 dark:text-gray-600" />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <InputField
                  name="village"
                  label={t.village}
                  placeholder={t.villagePlaceholder}
                  value={businessForm.village}
                  onChange={handleFormChange}
                  disabled={useProfileLocation === true}
                />
                <InputField
                  name="district"
                  label={t.district}
                  placeholder={t.districtPlaceholder}
                  value={businessForm.district}
                  onChange={handleFormChange}
                  disabled={useProfileLocation === true}
                />
                <InputField
                  name="city"
                  label={t.city}
                  placeholder={t.cityPlaceholder}
                  value={businessForm.city}
                  onChange={handleFormChange}
                  disabled={useProfileLocation === true}
                />
                <InputField
                  name="state"
                  label={t.state}
                  placeholder={t.statePlaceholder}
                  value={businessForm.state}
                  onChange={handleFormChange}
                  disabled={useProfileLocation === true}
                />
                <InputField
                  name="country"
                  label={t.country}
                  placeholder={t.countryPlaceholder}
                  value={businessForm.country}
                  onChange={handleFormChange}
                  disabled={useProfileLocation === true}
                />
                <InputField
                  name="pincode"
                  label={t.pincode}
                  placeholder={t.pincodePlaceholder}
                  value={businessForm.pincode}
                  onChange={handleFormChange}
                  disabled={useProfileLocation === true}
                />
              </div>
            </div>

            {/* Interactive Leaflet Map for Pinning Precise Coordinates */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-300">
                    Pin Exact Business Location on Map (Optional)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-500">
                    Click anywhere on the map to place or move your location
                    pin.
                  </p>
                </div>
                {isGeocoding && (
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
                    <Loader2 size={13} className="animate-spin" />
                    <span>Focusing map...</span>
                  </div>
                )}
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-300 dark:border-gray-700 bg-slate-100 dark:bg-gray-950">
                <div className="h-64 w-full">
                  <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    scrollWheelZoom={false}
                    className="h-full w-full z-0"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapUpdater center={mapCenter} zoom={mapZoom} />
                    <LocationPickerMarker
                      position={markerPosition}
                      onLocationSelect={handleMapLocationSelect}
                    />
                  </MapContainer>
                </div>

                {/* Coordinate status readout */}
                <div className="flex items-center justify-between border-t border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900/80 px-4 py-2.5 text-xs text-slate-600 dark:text-gray-400">
                  {markerPosition ? (
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span>
                        Pinned:{" "}
                        <strong className="text-slate-900 dark:text-white">
                          {businessForm.latitude}
                        </strong>
                        ,{" "}
                        <strong className="text-slate-900 dark:text-white">
                          {businessForm.longitude}
                        </strong>
                      </span>
                    </div>
                  ) : (
                    <span>Click on the map to set coordinates</span>
                  )}

                  {markerPosition && (
                    <button
                      type="button"
                      onClick={() =>
                        setBusinessForm((prev) => ({
                          ...prev,
                          latitude: "",
                          longitude: "",
                        }))
                      }
                      className="text-xs font-semibold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Clear Pin
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 px-6 py-4 backdrop-blur-xl sm:flex-row sm:justify-end sm:px-8">
            <button
              type="button"
              onClick={handleClose}
              disabled={creatingBusiness || profileLoading}
              className="rounded-xl border border-slate-300 dark:border-gray-700 bg-slate-100 dark:bg-gray-800/70 px-5 py-3 text-sm font-bold text-slate-700 dark:text-gray-300 transition hover:bg-slate-200 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={creatingBusiness || profileLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold !text-white shadow-[0_10px_25px_rgba(37,99,235,0.2)] transition-all hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creatingBusiness ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  {t.creating}
                </>
              ) : (
                <>
                  <Plus size={17} />
                  {t.create}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBusinessModal;
