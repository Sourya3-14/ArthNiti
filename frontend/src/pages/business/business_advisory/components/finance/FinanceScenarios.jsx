import {
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

const formatCurrency = (value) => {
  if (value == null || Number.isNaN(Number(value))) return "—";

  return `₹${Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

const FinanceScenarios = ({ scenarios, t }) => {
  if (!scenarios) return null;

  const cards = [
    {
      key: "best",
      title: t.best,
      icon: TrendingUp,
      accent: "emerald",
    },
    {
      key: "expected",
      title: t.expected,
      icon: CheckCircle2,
      accent: "blue",
    },
    {
      key: "worst",
      title: t.worst,
      icon: TrendingDown,
      accent: "rose",
    },
  ];

  return (
    <section className="mt-6">
      <div className="mb-5">
        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{t.scenarios}</p>

        <h2 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{t.scenarios}</h2>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {cards.map((card) => {
          const scenario = scenarios[card.key];

          if (!scenario) return null;

          const Icon = card.icon;

          return (
            <ScenarioCard
              key={card.key}
              title={card.title}
              scenario={scenario}
              icon={Icon}
              accent={card.accent}
              t={t}
            />
          );
        })}
      </div>
    </section>
  );
};

const ScenarioCard = ({ title, scenario, icon: Icon, accent, t }) => {
  const accentClasses = {
    emerald: {
      border: "border-emerald-500/20",
      bg: "bg-emerald-500/10",
      text: "text-emerald-600 dark:text-emerald-400",
    },
    blue: {
      border: "border-blue-500/20",
      bg: "bg-blue-500/10",
      text: "text-blue-600 dark:text-blue-400",
    },
    rose: {
      border: "border-rose-500/20",
      bg: "bg-rose-500/10",
      text: "text-rose-600 dark:text-rose-400",
    },
  };

  const colors = accentClasses[accent];

  return (
    <div
      className={`rounded-2xl border ${colors.border} bg-white dark:bg-gray-900/60 p-6 shadow-sm backdrop-blur-xl`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl border ${colors.border} ${colors.bg}`}
        >
          <Icon size={19} className={colors.text} />
        </div>

        <span className="rounded-lg border border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-950 px-3 py-1 text-xs font-bold capitalize text-slate-600 dark:text-gray-400">
          {scenario.risk || "—"}
        </span>
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">{title}</h3>

      <div className="mt-5 space-y-1">
        <ScenarioRow
          label={t.revenueShort}
          value={formatCurrency(scenario.revenue)}
        />

        <ScenarioRow
          label={t.expensesShort}
          value={formatCurrency(scenario.expenses)}
        />

        <ScenarioRow
          label={t.surplus}
          value={formatCurrency(scenario.operating_surplus)}
        />

        <ScenarioRow
          label={t.dscr}
          value={scenario.dscr != null ? scenario.dscr : "—"}
          highlight
        />

        <ScenarioRow label={t.risk} value={scenario.risk || "—"} />
      </div>
    </div>
  );
};

const ScenarioRow = ({ label, value, highlight }) => (
  <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-gray-800/70 py-3 last:border-0">
    <span className="text-sm text-slate-500 dark:text-gray-500">{label}</span>

    <span
      className={`text-sm font-bold ${
        highlight ? "text-slate-900 dark:text-gray-100" : "text-slate-700 dark:text-gray-300"
      }`}
    >
      {value}
    </span>
  </div>
);

export default FinanceScenarios;
