import { FileText, Sparkles } from "lucide-react";

const FinanceReport = ({ markdown, t }) => {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-6 shadow-sm dark:shadow-none backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
            <FileText size={19} className="text-blue-600 dark:text-blue-400" />
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
              <Sparkles size={14} />
              {t.aiPlanning}
            </div>

            <h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">{t.report}</h2>
          </div>
        </div>
      </div>

      <div className="max-h-[700px] overflow-y-auto rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/70 p-5">
        <MarkdownReport markdown={markdown} noReport={t.noAnalysis} />
      </div>
    </div>
  );
};

const MarkdownReport = ({ markdown, noReport }) => {
  if (!markdown) {
    return <p className="text-sm leading-6 text-slate-500 dark:text-gray-500">{noReport}</p>;
  }

  const lines = String(markdown).split("\n");

  return (
    <div className="space-y-2 text-sm leading-7 text-slate-700 dark:text-gray-400">
      {lines.map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={index} className="h-2" />;
        }

        if (trimmed === "---") {
          return <hr key={index} className="my-5 border-slate-200 dark:border-gray-800" />;
        }

        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={index} className="mt-5 text-base font-bold text-slate-800 dark:text-gray-200">
              {formatInlineMarkdown(trimmed.slice(4))}
            </h4>
          );
        }

        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={index} className="mt-7 text-xl font-extrabold text-slate-900 dark:text-white">
              {formatInlineMarkdown(trimmed.slice(3))}
            </h3>
          );
        }

        if (trimmed.startsWith("# ")) {
          return (
            <h2 key={index} className="mb-5 text-2xl font-extrabold text-slate-900 dark:text-white">
              {formatInlineMarkdown(trimmed.slice(2))}
            </h2>
          );
        }

        if (trimmed.startsWith("- ")) {
          return (
            <div key={index} className="flex gap-3 pl-2">
              <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 dark:bg-blue-400" />
              <p>{formatInlineMarkdown(trimmed.slice(2))}</p>
            </div>
          );
        }

        if (/^\d+\.\s/.test(trimmed)) {
          const content = trimmed.replace(/^\d+\.\s/, "");

          return (
            <div key={index} className="flex gap-3 pl-2">
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {trimmed.match(/^\d+/)?.[0]}.
              </span>

              <p>{formatInlineMarkdown(content)}</p>
            </div>
          );
        }

        return <p key={index}>{formatInlineMarkdown(trimmed)}</p>;
      })}
    </div>
  );
};

const formatInlineMarkdown = (text) => {
  const parts = String(text).split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-bold text-slate-900 dark:text-gray-200">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <span key={index}>{part}</span>;
  });
};

export default FinanceReport;
