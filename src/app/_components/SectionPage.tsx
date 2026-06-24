type SectionPageProps = {
  title: string;
  description: string;
  routePath: string;
  highlights?: string[];
};

export default function SectionPage({
  title,
  description,
  routePath,
  highlights = [],
}: SectionPageProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur dark:border-slate-800 dark:bg-slate-950/60">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
          {routePath}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          {description}
        </p>
        {highlights.length > 0 ? (
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {highlights.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                {item}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}