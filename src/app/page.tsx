import ExperimentGrid from '@/components/cards/ExperimentGrid';
import HomeHero from '@/components/hero/HomeHero';

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col px-7 pb-32 pt-10 sm:pt-14">
      <HomeHero>
        <header className="flex flex-col gap-10">
          <p className="fw-vogue text-[0.875rem] tracking-[0.5em] text-ink-2">FrissonWorks</p>

          <div className="flex flex-col gap-8">
            <h1 className="fw-vogue text-[clamp(28px,6.4vw,72px)] leading-[1.1] text-ink">Design Lab</h1>
            <p className="fw-big max-w-[26ch] text-[29px] font-light leading-[1.25] text-ink">
              Try the shared components before any app has to live with them.
            </p>
          </div>
        </header>
      </HomeHero>

      <section aria-labelledby="experiments" className="flex flex-col gap-8">
        <div className="flex items-baseline gap-3">
          <span className="fw-kicker fw-tabular text-t1">01</span>
          <h2 id="experiments" className="fw-kicker text-ink">
            Experiments
          </h2>
        </div>

        <ExperimentGrid />
      </section>
    </main>
  );
}
