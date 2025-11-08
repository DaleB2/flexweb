import Image from "next/image";
import Link from "next/link";

import Header from "@/components/Header";
import PlanCard from "@/components/PlanCard";

const heroStats = [
  { label: "Destinations ready", value: "190+" },
  { label: "Activation time", value: "60 sec" },
  { label: "Support crew", value: "24/7" },
];

const networkSignals = [
  { icon: "⚡", label: "Instant QR delivery" },
  { icon: "📶", label: "Partnered local towers" },
  { icon: "🛡️", label: "Secure Stripe checkout" },
  { icon: "🧭", label: "Arrival city briefings" },
];

const whyHighlights = [
  {
    title: "City breaks and sabbaticals",
    description: "Stay powered for Lisbon workweeks or Seoul neon nights with plans sized to the day.",
    icon: "🛫",
  },
  {
    title: "Cultural respect built in",
    description: "Each activation bundles etiquette intel from residents so you blend in with ease.",
    icon: "🪩",
  },
  {
    title: "Data without guesswork",
    description: "Pricing is locked in the currency you pick. No roaming shocks or hidden add ons.",
    icon: "💳",
  },
  {
    title: "Hotspot friendly",
    description: "Share connectivity with your travel crew or laptop without throttling surprises.",
    icon: "📡",
  },
];

const steps = [
  "Pick the destination and plan variant that matches your stay length.",
  "Checkout through Stripe with taxes and currency confirmed up front.",
  "Scan the emailed QR when you land and toggle roaming to go live.",
];

const communityStories = [
  {
    body: "Flex kept our founders online through Nairobi demo day week. The cultural brief calmed first time travelers.",
    author: "Sasha · Accelerator lead",
  },
  {
    body: "During Sao Paulo fashion prep the hotspot handled streaming and uploads without a hitch.",
    author: "Renata · Creative director",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050B18] text-white">
      <Header />

      <main className="relative overflow-hidden pb-24 pt-32">
        <div className="pointer-events-none absolute inset-x-0 top-10 -z-10 flex justify-center">
          <div className="h-[520px] w-[720px] rounded-full bg-[radial-gradient(circle_at_top,_rgba(47,239,204,0.25),_rgba(5,11,24,0))] blur-3xl" />
        </div>

        <section id="plans" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="space-y-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-white/70">
                <span className="h-2 w-2 rounded-full bg-mint" aria-hidden />
                Instant global eSIM
              </span>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                Activate high speed data before the baggage belt.
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-white/70">
                Flex Mobile spins up a digital SIM in under a minute. Select a country, lock pricing in your currency, and step off the plane ready to stream, navigate, and coordinate with your crew.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {heroStats.map(({ label, value }) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/10 p-4 text-left shadow-[0_18px_40px_rgba(8,16,31,0.22)]">
                    <p className="text-2xl font-semibold text-white">{value}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.32em] text-white/50">{label}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/checkout"
                  className="inline-flex items-center justify-center rounded-full bg-mint px-8 py-4 text-sm font-semibold uppercase tracking-[0.32em] text-coal shadow-[0_18px_40px_rgba(47,239,204,0.35)] transition hover:bg-mint/90"
                >
                  Start checkout
                </Link>
                <Link
                  href="#why"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-4 text-sm font-semibold uppercase tracking-[0.32em] text-white transition hover:border-mint/60 hover:text-mint"
                >
                  Why travelers switch
                </Link>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70 shadow-[0_14px_35px_rgba(5,12,32,0.25)]">
                <Image
                  src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80"
                  alt="Traveler checking phone"
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full object-cover"
                  priority={false}
                />
                <p>
                  Teams rely on Flex Mobile during multi-country project sprints. One dashboard keeps every device in sync.
                  <span className="block text-xs uppercase tracking-[0.32em] text-white/40">Field ops feedback</span>
                </p>
              </div>
            </div>

            <aside className="relative w-full max-w-lg lg:sticky lg:top-28">
              <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-[radial-gradient(circle_at_top,_rgba(47,239,204,0.25),_rgba(5,11,24,0))] blur-2xl" aria-hidden />
              <PlanCard />
            </aside>
          </div>
        </section>

        <section className="mt-20 border-y border-white/10 bg-white/5 py-10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-6 px-4 text-sm font-semibold uppercase tracking-[0.3em] text-white/60 sm:px-6 lg:px-8">
            {networkSignals.map((item) => (
              <span key={item.label} className="flex items-center gap-2">
                <span className="text-lg" aria-hidden>
                  {item.icon}
                </span>
                {item.label}
              </span>
            ))}
          </div>
        </section>

        <section id="why" className="mx-auto mt-24 max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-mint">Why travelers switch</p>
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">Confidence for long hauls and weekend hops</h2>
              <p className="text-base leading-relaxed text-white/70">
                Flex Mobile keeps roaming fair from Marrakech souks to Tokyo alleys. Plans stay flexible while cultural intelligence in every welcome email helps you move with respect.
              </p>
              <ul className="space-y-3 text-sm text-white/70">
                <li className="flex items-start gap-3">
                  <span aria-hidden className="mt-1 text-mint">◆</span>
                  Coverage vetted with local partner feedback across 190 destinations.
                </li>
                <li className="flex items-start gap-3">
                  <span aria-hidden className="mt-1 text-mint">◆</span>
                  Local language support that respects time zones and cultural nuances.
                </li>
                <li className="flex items-start gap-3">
                  <span aria-hidden className="mt-1 text-mint">◆</span>
                  Real time plan analytics keep your crew aligned on usage and top ups.
                </li>
              </ul>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {whyHighlights.map((highlight) => (
                <div key={highlight.title} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_45px_rgba(5,12,32,0.26)]">
                  <span className="text-2xl" aria-hidden>
                    {highlight.icon}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-white">{highlight.title}</h3>
                  <p className="mt-2 text-sm text-white/70">{highlight.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_26px_60px_rgba(5,12,32,0.24)]">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-mint/80">How it works</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">Three steps to dependable roaming</h2>
              <ol className="mt-6 space-y-5 text-sm text-white/70">
                {steps.map((step, index) => (
                  <li key={step} className="flex items-start gap-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-semibold text-white">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_26px_60px_rgba(5,12,32,0.24)]">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-mint/80">Community signals</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">Loved by crews on the move</h2>
              <div className="mt-6 space-y-5 text-sm text-white/70">
                {communityStories.map((story) => (
                  <p key={story.author}>
                    {story.body}
                    <span className="mt-2 block text-xs uppercase tracking-[0.32em] text-white/40">{story.author}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="help" className="border-t border-white/10 bg-[#040812] py-12 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/50">Need a human</p>
            <p className="mt-2 text-lg font-semibold">hello@flexmobile.com</p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">Best network guarantee</span>
            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">Hotspot and tethering</span>
            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">Secure payments</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
