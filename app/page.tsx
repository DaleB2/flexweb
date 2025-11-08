import Header from "@/components/Header";
import PlanCard from "@/components/PlanCard";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-heroGrad">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(24,6,62,0.55),_transparent_65%)]" aria-hidden />
      <Header />

      <main className="relative z-10 flex flex-col items-center gap-16 px-5 pb-24 pt-28 lg:flex-row lg:items-start lg:justify-between lg:px-16 lg:pb-32 lg:pt-36">
        <section className="max-w-xl text-white">
          <div className="inline-flex items-center gap-3 rounded-full bg-daisy px-5 py-2 text-xs font-extrabold uppercase tracking-[0.4em] text-bottle">
            Up to 10× cheaper than roaming
          </div>
          <h1 className="mt-6 text-5xl font-extrabold uppercase leading-[0.95] tracking-tight drop-shadow-lg sm:text-6xl lg:text-7xl">
            Unlimited
            <br />
            Internet that
            <br />
            Travels with you
          </h1>
          <p className="mt-6 text-lg font-medium text-white/90 drop-shadow">
            Truly Switchless® eSIMs that activate instantly in 190+ destinations. Keep your number, stay online.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm font-semibold text-white/90">
            <span className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur">Trusted by globetrotters</span>
            <span className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur">4G/5G Speeds</span>
            <span className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur">Hotspot Friendly</span>
          </div>
        </section>

        <aside className="w-full max-w-lg lg:sticky lg:top-24">
          <PlanCard />
        </aside>
      </main>

      <div className="fixed bottom-4 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-4 rounded-full bg-bottle px-6 py-3 text-xs font-bold uppercase tracking-[0.3em] text-white shadow-card lg:flex">
        <span>Switchless® ESIMs</span>
        <span className="h-2 w-2 rounded-full bg-mint" aria-hidden />
        <span>Best Network Guarantee</span>
        <span className="h-2 w-2 rounded-full bg-mint" aria-hidden />
        <span>Hotspot / Tethering</span>
        <span className="h-2 w-2 rounded-full bg-mint" aria-hidden />
        <span>190+ Destinations</span>
      </div>
    </div>
  );
}
