import Link from "next/link";
import Header from "@/components/Header";
import PlanCard from "@/components/PlanCard";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-coal text-white">
      <Header />

      <main className="relative isolate overflow-hidden pb-28 pt-32">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-[-15%] top-0 h-[520px] w-[520px] rounded-full bg-mint/40 blur-[150px]" />
          <div className="absolute right-[-20%] top-24 h-[600px] w-[600px] rounded-full bg-heliotrope/40 blur-[180px]" />
          <div className="absolute inset-x-0 bottom-[-40%] h-[500px] bg-gradient-to-t from-violet via-coal to-transparent" />
        </div>

        <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 sm:px-6 lg:flex-row lg:items-start lg:gap-24 lg:px-8">
          <section className="max-w-2xl space-y-8" id="plans">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-white/80 shadow-[0_14px_30px_rgba(255,255,255,0.08)]">
              <span className="h-2 w-2 rounded-full bg-mint" aria-hidden />
              Unlimited travel internet
            </span>
            <h1 className="text-4xl font-extrabold leading-tight sm:text-6xl">
              Switch on <span className="text-mint">vacay mode.</span>
              <br />
              Leave roaming rip-offs behind.
            </h1>
            <p className="text-lg leading-relaxed text-white/70">
              Flex Mobile keeps you online in 190+ countries with Switchless® eSIM tech, neon-fast activations, and pricing that
              slaps. Choose a plan, tap to pay, and your QR lands in your inbox before the wheels hit the runway.
            </p>
            <div className="flex flex-wrap gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
              <span className="rounded-full border border-white/20 bg-white/5 px-4 py-2">4G/5G Speeds</span>
              <span className="rounded-full border border-white/20 bg-white/5 px-4 py-2">Hotspot Friendly</span>
              <span className="rounded-full border border-white/20 bg-white/5 px-4 py-2">Keep WhatsApp</span>
            </div>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <Link
                href="#why"
                className="inline-flex items-center justify-center rounded-full bg-mint px-8 py-4 text-sm font-bold uppercase tracking-[0.4em] text-coal shadow-[0_18px_50px_rgba(47,239,204,0.55)] transition hover:scale-[1.03]"
              >
                Why Flex?
              </Link>
              <div className="flex items-center gap-3 text-left text-sm text-white/70">
                <img
                  src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=96&q=80"
                  alt="Happy traveler"
                  className="h-12 w-12 rounded-full object-cover"
                  loading="lazy"
                />
                <p>
                  “I activated before customs. Insta stories stayed lit the entire trip.”
                  <span className="block text-xs font-semibold uppercase tracking-[0.3em] text-white/40">— Jess, Seoul</span>
                </p>
              </div>
            </div>
          </section>

          <aside className="w-full max-w-lg lg:sticky lg:top-36">
            <PlanCard />
          </aside>
        </div>
      </main>

      <section className="border-y border-white/10 bg-daisy/95 py-5 text-coal">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-6 px-4 text-sm font-bold uppercase tracking-[0.35em] sm:px-6 lg:px-8">
          <span className="flex items-center gap-2"><span className="text-2xl">🌍</span>190+ Countries</span>
          <span className="flex items-center gap-2"><span className="text-2xl">⚡</span>2-Min Activation</span>
          <span className="flex items-center gap-2"><span className="text-2xl">🛫</span>Roam Like Local</span>
          <span className="flex items-center gap-2"><span className="text-2xl">🛟</span>24/7 Crew</span>
        </div>
      </section>

      <section id="why" className="bg-white py-24 text-coal">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-persian">Why Switchless® is a game-changer</p>
            <h2 className="mt-4 text-4xl font-extrabold sm:text-5xl">The neon-clear difference</h2>
            <p className="mt-4 text-lg text-coal/80">
              Old-school roaming keeps you on hold. Flex Mobile beams data straight to your phone, no drama, no hidden fees.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl bg-coal p-10 text-white shadow-[0_25px_60px_rgba(9,41,39,0.35)]">
              <h3 className="text-2xl font-extrabold uppercase tracking-[0.4em] text-mint">Flex Mobile</h3>
              <ul className="mt-6 space-y-4 text-lg font-semibold text-white/90">
                <li className="flex items-start gap-3"><span className="mt-1 text-mint">✔</span> Unlimited or massive data buckets built for TikTok and tethering.</li>
                <li className="flex items-start gap-3"><span className="mt-1 text-mint">✔</span> Switchless® install — scan QR, go live in two minutes flat.</li>
                <li className="flex items-start gap-3"><span className="mt-1 text-mint">✔</span> Real humans on support, not bots, ready 24/7.</li>
                <li className="flex items-start gap-3"><span className="mt-1 text-mint">✔</span> Pricing locked — what you see on checkout is what Stripe charges.</li>
              </ul>
            </div>
            <div className="rounded-3xl border-4 border-dashed border-coal/20 bg-white p-10 text-coal/70 shadow-inner">
              <h3 className="text-2xl font-extrabold uppercase tracking-[0.4em] text-coal/50">Competitor eSIM</h3>
              <ul className="mt-6 space-y-4 text-lg font-semibold">
                <li className="flex items-start gap-3"><span className="mt-1">✖</span> Pay-per-MB plans that throttle once you actually travel.</li>
                <li className="flex items-start gap-3"><span className="mt-1">✖</span> Manual activations, support tickets, and QR codes that take days.</li>
                <li className="flex items-start gap-3"><span className="mt-1">✖</span> Surprise taxes and “processing fees” stacked at the end.</li>
                <li className="flex items-start gap-3"><span className="mt-1">✖</span> Limited hotspot support or carrier bans on tethering.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-coal py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {[{
              title: "Flexible data or truly unlimited",
              copy: "Pick the vibe — marathon hotspotting or casual scrolling. Plans flex from 3GB weekenders to all-you-can-surf monsters.",
              accent: "bg-heliotrope",
              emoji: "💫",
            }, {
              title: "Set up in 2 minutes flat",
              copy: "iOS or Android. Scan the QR from your confirmation email, toggle on data roaming, and you’re connected.",
              accent: "bg-anakiwa",
              emoji: "⚙️",
            }, {
              title: "Always fast, always on",
              copy: "Local-tier 4G/5G partners keep speeds spicy. Stream, hotspot, share without drops.",
              accent: "bg-daisy",
              emoji: "🚀",
            }, {
              title: "Earn while you travel",
              copy: "Refer your travel crew and stack credits toward your next trip’s data binge.",
              accent: "bg-mint",
              emoji: "💸",
            }].map(({ title, copy, accent, emoji }) => (
              <div
                key={title}
                className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_25px_60px_rgba(0,0,0,0.25)] transition hover:-translate-y-1 hover:shadow-[0_40px_90px_rgba(0,0,0,0.35)]`}
              >
                <div className={`absolute right-6 top-6 h-16 w-16 rounded-2xl ${accent} blur-[40px] opacity-50 transition group-hover:opacity-80`} aria-hidden />
                <span className="text-3xl">{emoji}</span>
                <h3 className="mt-6 text-2xl font-extrabold text-white">{title}</h3>
                <p className="mt-4 text-base leading-relaxed text-white/70">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24 text-coal">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-persian">How it works</p>
          <h2 className="text-4xl font-extrabold sm:text-5xl">Three taps to touchdown-ready internet</h2>
          <ol className="grid gap-6 text-left sm:grid-cols-3">
            {["Pick your destination & data vibe.", "Checkout with the real Stripe total we send.", "Scan the QR. Toggle data. Go live."].map((step, index) => (
              <li key={step} className="rounded-3xl border border-coal/10 bg-nurse p-6 shadow-[0_20px_60px_rgba(24,6,62,0.1)]">
                <span className="text-sm font-bold uppercase tracking-[0.35em] text-persian/80">Step {index + 1}</span>
                <p className="mt-4 text-xl font-extrabold text-coal">{step}</p>
              </li>
            ))}
          </ol>
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center rounded-full bg-coal px-8 py-4 text-sm font-bold uppercase tracking-[0.4em] text-white shadow-[0_18px_45px_rgba(9,41,39,0.45)] transition hover:scale-[1.03]"
          >
            Start Checkout
          </Link>
        </div>
      </section>

      <footer id="help" className="border-t border-white/10 bg-coal py-12 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">Need a human?</p>
            <p className="mt-2 text-lg font-extrabold">hello@flexmobile.com</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
            <span className="rounded-full border border-white/20 bg-white/5 px-4 py-2">Best Network Guarantee</span>
            <span className="rounded-full border border-white/20 bg-white/5 px-4 py-2">Hotspot &amp; Tethering</span>
            <span className="rounded-full border border-white/20 bg-white/5 px-4 py-2">Secure Payments</span>
    <div className="min-h-screen bg-white text-slate-900">
      <Header />

      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-4 pb-20 pt-32 sm:px-6 lg:flex-row lg:items-start lg:gap-24 lg:px-8">
        <section className="max-w-xl space-y-6" id="plans">
          <span className="inline-flex items-center rounded-full bg-mint/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-bottle">
            Travel with confidence
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Unlimited internet that travels with you.
          </h1>
          <p className="text-base leading-relaxed text-slate-600">
            Flex Mobile eSIMs activate instantly in 190+ destinations. Choose your plan, pay securely, and we&apos;ll deliver setup instructions straight to your inbox.
          </p>
          <dl className="grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Simple checkout</dt>
              <dd className="mt-2 font-semibold">Pay with cards or wallets. No surprise fees.</dd>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Instant delivery</dt>
              <dd className="mt-2 font-semibold">Get your QR code within minutes of payment.</dd>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Keep your number</dt>
              <dd className="mt-2 font-semibold">Stay reachable on WhatsApp and calls.</dd>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Hotspot ready</dt>
              <dd className="mt-2 font-semibold">Share data safely with all your devices.</dd>
            </div>
          </dl>
        </section>

        <aside className="w-full max-w-lg lg:sticky lg:top-32">
          <PlanCard />
        </aside>
      </main>

      <section id="why" className="bg-slate-50 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          {["190+ destinations", "Switchless® setup", "4G/5G coverage"].map((highlight) => (
            <div key={highlight} className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Why travelers choose us</p>
              <p className="mt-4 text-lg font-semibold text-slate-800">{highlight}</p>
              <p className="mt-2 text-sm text-slate-600">
                Reliable networks and transparent pricing mean you can focus on your trip—not your phone bill.
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer id="help" className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="font-semibold text-slate-700">Need a hand? Email hello@flexmobile.com</p>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full border border-slate-200 px-3 py-1">Best network guarantee</span>
            <span className="rounded-full border border-slate-200 px-3 py-1">Hotspot &amp; tethering</span>
            <span className="rounded-full border border-slate-200 px-3 py-1">Secure payments</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
