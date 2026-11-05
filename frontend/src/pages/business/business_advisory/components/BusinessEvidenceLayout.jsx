import { ArrowLeft, AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import BusinessScopeBadge from "./BusinessScopeBadge";

const BusinessEvidenceLayout = ({
  title,
  subtitle,
  icon: Icon,
  iconClassName = "text-blue-400",
  children,
  loading,
  error,
}) => {
  const navigate = useNavigate();
  const { businessId } = useParams();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 px-4 py-8 text-slate-900 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => navigate(`/businesses/${businessId}/analysis`)}
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-gray-400 transition hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Analysis
        </button>

        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
              <Icon size={27} className={iconClassName} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                Business Evidence
              </p>

              <h1 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">{title}</h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-gray-500">{subtitle}</p>
            </div>
          </div>

          <BusinessScopeBadge
            businessId={businessId}
            className="self-end sm:self-auto"
          />
        </div>

        {loading && (
          <div className="space-y-6 animate-pulse">
            {/* 4 Metric Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-5 shadow-sm"
                >
                  <div className="h-3 w-20 rounded bg-slate-200 dark:bg-gray-800" />
                  <div className="mt-3 h-8 w-28 rounded-lg bg-slate-200 dark:bg-gray-800" />
                </div>
              ))}
            </div>

            {/* 2 Detail Section Cards */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-6 shadow-sm"
                >
                  <div className="mb-5 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-slate-200 dark:bg-gray-800" />
                    <div className="h-5 w-40 rounded bg-slate-200 dark:bg-gray-800" />
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((j) => (
                      <div
                        key={j}
                        className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/60 px-4 py-3"
                      >
                        <div className="h-4 w-28 rounded bg-slate-200 dark:bg-gray-800" />
                        <div className="h-4 w-24 rounded bg-slate-200 dark:bg-gray-800" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Full-Width Evidence List */}
            <div className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-slate-200 dark:bg-gray-800" />
                <div className="h-5 w-48 rounded bg-slate-200 dark:bg-gray-800" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((k) => (
                  <div
                    key={k}
                    className="rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/60 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-5 w-40 rounded bg-slate-200 dark:bg-gray-800" />
                        <div className="h-3 w-24 rounded bg-slate-200 dark:bg-gray-800" />
                      </div>
                      <div className="h-5 w-16 rounded bg-slate-200 dark:bg-gray-800" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
            <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-400" />

            <h2 className="text-xl font-bold">Unable to Load Evidence</h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">
              {error}
            </p>
          </div>
        )}

        {!loading && !error && children}
      </div>
    </div>
  );
};

export const SectionCard = ({ title, icon: Icon, children }) => (
  <div className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-6 shadow-sm backdrop-blur-xl">
    <div className="mb-5 flex items-center gap-3">
      {Icon && (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10">
          <Icon size={17} className="text-blue-600 dark:text-blue-400" />
        </div>
      )}

      <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
    </div>

    {children}
  </div>
);

export const Metric = ({ label, value, suffix = "" }) => (
  <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/60 p-4">
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-600">
      {label}
    </p>

    <p className="mt-2 text-xl font-extrabold text-slate-900 dark:text-gray-200">
      {value ?? "—"}
      {value !== null && value !== undefined && suffix}
    </p>
  </div>
);

export const InfoRow = ({ label, value }) => (
  <div className="flex flex-col gap-1 border-b border-slate-200/80 dark:border-gray-800 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
    <span className="text-sm text-slate-500 dark:text-gray-500">{label}</span>
    <span className="text-sm font-semibold text-slate-800 dark:text-gray-200">{value ?? "—"}</span>
  </div>
);

export default BusinessEvidenceLayout;
