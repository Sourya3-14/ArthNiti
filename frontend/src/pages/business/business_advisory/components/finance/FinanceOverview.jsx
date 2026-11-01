import {
  Banknote,
  Calculator,
  CircleDollarSign,
  Landmark,
  Percent,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

const formatCurrency = (value) => {
  if (value == null || Number.isNaN(Number(value))) return "—";

  return `₹${Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

const FinanceOverview = ({ plan, t }) => {
  const business = plan?.business || {};
  const financing = plan?.financing || {};
  const loan = plan?.loan || {};
  const scheme = plan?.scheme || {};
  const workingCapital = plan?.working_capital || {};
  const debtCapacity = plan?.debt_capacity || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={TrendingUp}
          label={t.monthlyRevenue}
          value={formatCurrency(business.monthly_revenue)}
          accent="emerald"
        />

        <MetricCard
          icon={TrendingDown}
          label={t.monthlyExpenses}
          value={formatCurrency(business.monthly_expenses)}
          accent="amber"
        />

        <MetricCard
          icon={CircleDollarSign}
          label={t.netProfit}
          value={formatCurrency(business.net_profit)}
          accent="blue"
        />

        <MetricCard
          icon={Percent}
          label={t.profitMargin}
          value={
            business.profit_margin != null ? `${business.profit_margin}%` : "—"
          }
          accent="violet"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <SectionCard title={t.investment} icon={Wallet}>
          <InfoRow
            label={t.projectCost}
            value={formatCurrency(financing.project_cost)}
          />
          <InfoRow
            label={t.marginCapital}
            value={formatCurrency(financing.margin)}
          />
          <InfoRow
            label={t.loanAmount}
            value={formatCurrency(financing.loan_amount)}
          />
          <InfoRow
            label={t.workingCapital}
            value={formatCurrency(workingCapital.recommended)}
          />
          <InfoRow
            label={t.months}
            value={
              workingCapital.months != null ? `${workingCapital.months}` : "—"
            }
          />
        </SectionCard>

        <SectionCard title={t.loan} icon={Landmark}>
          <InfoRow
            label={t.loanAmount}
            value={formatCurrency(financing.loan_amount)}
          />
          <InfoRow label={t.emi} value={formatCurrency(loan.emi)} />
          <InfoRow
            label={t.tenure}
            value={
              scheme.tenure_years != null ? `${scheme.tenure_years} years` : "—"
            }
          />
          <InfoRow
            label={t.interestRate}
            value={
              scheme.interest_rate != null ? `${scheme.interest_rate}%` : "—"
            }
          />
          <InfoRow
            label={t.moratorium}
            value={
              scheme.moratorium_months != null
                ? `${scheme.moratorium_months} months`
                : "—"
            }
          />
        </SectionCard>

        <SectionCard title={t.profitability} icon={Calculator}>
          <InfoRow
            label={t.monthlyDirectCosts}
            value={formatCurrency(business.monthly_direct_costs)}
          />
          <InfoRow
            label={t.monthlyFixedCosts}
            value={formatCurrency(business.monthly_fixed_costs)}
          />
          <InfoRow
            label={t.grossProfit}
            value={formatCurrency(business.gross_profit)}
          />
          <InfoRow
            label={t.breakEven}
            value={formatCurrency(business.break_even_revenue)}
          />
          <InfoRow
            label={t.dscr}
            value={debtCapacity.dscr != null ? debtCapacity.dscr : "—"}
          />
          <InfoRow
            label={t.assessment}
            value={debtCapacity.assessment || "—"}
          />
        </SectionCard>
      </div>
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value, accent }) => {
  const classes = {
    emerald: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
    amber: "border-amber-500/20 bg-amber-500/5 text-amber-400",
    blue: "border-blue-500/20 bg-blue-500/5 text-blue-400",
    violet: "border-violet-500/20 bg-violet-500/5 text-violet-400",
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-5 shadow-sm dark:shadow-none backdrop-blur-xl">
      <div
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl border ${classes[accent]}`}
      >
        <Icon size={19} />
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-gray-100">{value}</p>
    </div>
  );
};

const SectionCard = ({ title, icon: Icon, children }) => (
  <div className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-6 shadow-sm dark:shadow-none backdrop-blur-xl">
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
        <Icon size={19} className="text-blue-600 dark:text-blue-400" />
      </div>

      <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
    </div>

    <div className="space-y-1">{children}</div>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-gray-800/70 py-3 last:border-0">
    <span className="text-sm text-slate-600 dark:text-gray-400">{label}</span>
    <span className="text-right text-sm font-bold text-slate-900 dark:text-gray-200">{value}</span>
  </div>
);

export default FinanceOverview;
