import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  Loader2,
  MapPin,
  MoreVertical,
  Pencil,
  X,
} from "lucide-react";
import BusinessImageGallery from "./BusinessImageGallery";
import EditBusinessModal from "./EditBusinessModal";

const BusinessCard = ({
  business: initialBusiness,
  t,
  onOpen,
  onUpdateStatus,
}) => {
  const [business, setBusiness] = useState(initialBusiness);
  const [menuOpen, setMenuOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const menuRef = useRef(null);

  // Synchronize state if parent updates initialBusiness
  useEffect(() => {
    setBusiness(initialBusiness);
  }, [initialBusiness]);

  const getStatusLabel = (status) => {
    if (!status) return "";

    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus === "approved") return t.approved;
    if (normalizedStatus === "rejected") return t.rejected;
    if (normalizedStatus === "pending") return t.pending;
    if (normalizedStatus === "active") return t.active;
    if (normalizedStatus === "cancelled") return t.cancelled;

    if (
      normalizedStatus === "under_review" ||
      normalizedStatus === "under-review"
    ) {
      return t.underReview;
    }

    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getStatusClasses = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "approved":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "cancelled":
      case "rejected":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "pending":
      case "under_review":
      case "under-review":
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [menuOpen]);

  const handleStatusChange = async (status) => {
    if (updatingStatus || business.status === status) {
      setMenuOpen(false);
      return;
    }

    const confirmationMessage =
      status === "cancelled" ? t.confirmCancelled : t.confirmActive;

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    try {
      setUpdatingStatus(true);
      setMenuOpen(false);

      await onUpdateStatus(business.id, status);
    } catch (error) {
      console.error("Business status update failed:", error);
      window.alert(error?.response?.data?.detail || t.statusUpdateFailed);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleEditSuccess = (updatedBusiness) => {
    if (updatedBusiness) {
      setBusiness(updatedBusiness);
    }
    setShowEditModal(false);
  };

  const isActive = business.status?.toLowerCase() === "active";
  const isCancelled = business.status?.toLowerCase() === "cancelled";

  return (
    <div className="group text-left">
      <div className="relative h-full overflow-visible rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/70 p-6 shadow-sm hover:shadow-xl dark:shadow-[0_15px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-blue-500/30 hover:bg-slate-50 dark:hover:bg-gray-900 hover:shadow-blue-500/10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-600/10 blur-3xl transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative flex items-start justify-between">
          <div className="flex h-13 w-13 items-center justify-center rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 transition-all duration-300 group-hover:border-blue-500/40 group-hover:from-blue-500/20 group-hover:to-indigo-500/20">
            <Building2 size={25} className="text-blue-600 dark:text-blue-400" />
          </div>

          <div ref={menuRef} className="relative flex items-center gap-2">
            {business.status && (
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                  business.status,
                )}`}
              >
                {getStatusLabel(business.status)}
              </span>
            )}

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setMenuOpen((previous) => !previous);
              }}
              disabled={updatingStatus}
              aria-label={t.manageBusiness}
              title={t.manageBusiness}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-800/60 text-slate-500 dark:text-gray-400 transition-all hover:border-slate-300 dark:hover:border-gray-700 hover:bg-slate-200 dark:hover:bg-gray-700/80 hover:text-slate-900 dark:hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updatingStatus ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <MoreVertical size={18} />
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl dark:shadow-2xl shadow-black/10 dark:shadow-black/40">
                <div className="border-b border-slate-200 dark:border-gray-800 px-3 py-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-500">
                    {t.manageBusiness}
                  </p>
                </div>

                <div className="p-1.5">
                  {/* EDIT DETAILS TRIGGER */}
                  <button
                    type="button"
                    onMouseDown={(event) => {
                      event.stopPropagation();
                      setMenuOpen(false);
                      setShowEditModal(true);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 dark:text-gray-300 transition hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <Pencil size={16} />
                    <span>{t.editDetails}</span>
                  </button>

                  <div className="my-1 border-t border-slate-200 dark:border-gray-800" />

                  {/* MARK ACTIVE */}
                  <button
                    type="button"
                    disabled={isActive || updatingStatus}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleStatusChange("active");
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 dark:text-gray-300 transition hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Check size={16} />
                    <span>{t.markActive}</span>

                    {isActive && (
                      <span className="ml-auto text-xs text-emerald-600 dark:text-emerald-400">
                        ✓
                      </span>
                    )}
                  </button>

                  {/* MARK CANCELLED */}
                  <button
                    type="button"
                    disabled={isCancelled || updatingStatus}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleStatusChange("cancelled");
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 dark:text-gray-300 transition hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <X size={16} />
                    <span>{t.markCancelled}</span>

                    {isCancelled && (
                      <span className="ml-auto text-xs text-red-500 dark:text-red-400">✓</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <BusinessImageGallery
          businessId={business.id}
          canUpload
          title={t.businessImages}
          uploadLabel={t.addImages}
          emptyLabel={t.noImages}
          uploadingLabel={t.uploadingImages}
          errorLabel={t.imagesLoadFailed}
        />

        <button
          type="button"
          onClick={() => onOpen(business.id)}
          className="relative mt-6 block w-full text-left"
        >
          <h2 className="line-clamp-1 text-xl font-bold text-slate-900 dark:text-white">
            {business.business_name || t.unnamedBusiness}
          </h2>

          {business.category && (
            <p className="mt-1.5 line-clamp-1 text-sm font-semibold text-blue-600 dark:text-blue-400">
              {business.category}
            </p>
          )}

          <div className="mt-5 flex min-h-[24px] items-center gap-2 text-sm text-slate-600 dark:text-gray-500">
            <MapPin size={16} className="shrink-0 text-slate-400 dark:text-gray-600" />

            <span className="line-clamp-1">
              {business.city || business.state
                ? [business.city, business.state].filter(Boolean).join(", ")
                : t.locationUnavailable}
            </span>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-200 dark:border-gray-800 pt-5">
            <span className="text-sm font-bold text-slate-700 dark:text-gray-300 transition-colors group-hover:text-blue-600 dark:group-hover:text-white">
              {t.openWorkspace}
            </span>

            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-800/50 transition-all duration-300 group-hover:border-blue-500/30 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10">
              <ArrowRight
                size={17}
                className="text-slate-400 dark:text-gray-500 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400"
              />
            </div>
          </div>
        </button>
      </div>

      {/* Edit Modal Embedded Directly Inside Card */}
      <EditBusinessModal
        isOpen={showEditModal}
        business={business}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
        t={t}
      />
    </div>
  );
};

export default BusinessCard;
