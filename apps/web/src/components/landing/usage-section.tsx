import { MorphText } from "@/components/landing/morph-heading";
import { IkIcon } from "@/components/ui/ik-icon";
import type { UsageStats } from "@/lib/usage";

const GITHUB_SEARCH = `https://github.com/search?type=code&q=${encodeURIComponent('"@ikions/" path:package.json')}`;

/** Real usage numbers with their sources. Only metrics above zero are shown. */
export function UsageSection({ stats }: { stats: UsageStats }) {
  const metrics = [
    stats.npm && stats.npm.total > 0
      ? { value: stats.npm.total, label: "npm downloads, last 30 days", href: "https://www.npmjs.com/package/@ikions/react", source: "npm" }
      : null,
    stats.cdn && stats.cdn.total > 0
      ? { value: stats.cdn.total, label: "CDN requests, last 30 days", href: "https://www.jsdelivr.com/package/npm/@ikions/icons", source: "jsDelivr" }
      : null,
    stats.github && stats.github.count > 0
      ? { value: stats.github.count, label: "public projects on GitHub", href: GITHUB_SEARCH, source: "GitHub" }
      : null,
  ].filter((m): m is NonNullable<typeof m> => m !== null);

  const updated = new Date(stats.updatedAt).toLocaleDateString("en", { dateStyle: "medium" });

  return (
    <section className="mx-auto max-w-[1200px] px-4 pt-20 sm:px-6 sm:pt-28" aria-labelledby="usage-heading">
      <MorphText
        id="usage-heading"
        lines={["Used in real projects"]}
        className="text-center font-display text-[34px] font-semibold leading-[1.1] tracking-[-0.035em] text-balance sm:text-[40px]"
      />

      <dl className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col-reverse justify-end rounded-[22px] bg-surface p-6 shadow-card">
            <dt className="mt-1 text-[13px] text-ink-2">
              {m.label} ·{" "}
              <a href={m.href} target="_blank" rel="noopener noreferrer" className="text-accent-text hover:underline">
                {m.source}
              </a>
            </dt>
            <dd className="font-display text-[34px] font-semibold leading-none tracking-[-0.04em] tabular-nums">{m.value.toLocaleString("en")}</dd>
          </div>
        ))}
      </dl>

      {stats.github && stats.github.projects.length > 0 ? (
        <ul className="mx-auto mt-6 grid max-w-3xl gap-3 sm:grid-cols-2" aria-label="Public projects using Ikions">
          {stats.github.projects.slice(0, 6).map((project) => (
            <li key={project.name}>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full flex-col rounded-[22px] bg-surface p-5 shadow-card transition-colors hover:text-accent-text"
              >
                <span className="flex items-center justify-between gap-3 font-mono text-[13.5px] font-medium">
                  {project.name}
                  {project.stars > 0 ? (
                    <span className="flex shrink-0 items-center gap-1 text-[12.5px] text-ink-2">
                      <IkIcon name="star" size={14} />
                      {project.stars.toLocaleString("en")}
                    </span>
                  ) : null}
                </span>
                {project.description ? <span className="mt-1.5 text-[13.5px] leading-6 text-ink-2">{project.description}</span> : null}
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mx-auto mt-6 max-w-xl text-center text-[13px] leading-6 text-ink-2">
        Live from public data, refreshed every few hours (last checked {updated}). Private projects can’t be counted.
      </p>
    </section>
  );
}
