import Image from "next/image";
import Link from "next/link";

import Header from "@/components/Header";
import PlanCard from "@/components/PlanCard";

const promoHighlights = [
  { icon: "🌍", label: "200+ countries" },
  { icon: "⚡️", label: "Instant QR delivery" },
  { icon: "🧳", label: "Pause anytime" },
];

const citySpotlights = [
  {
    code: "PT",
    name: "Lisbon",
    copy: "Easy roaming for long sunny workations.",
    image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1200&q=80",
  },
  {
    code: "JP",
    name: "Tokyo",
    copy: "Stream, share, and explore without limits.",
    image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
  },
  {
    code: "MX",
    name: "Mexico City",
    copy: "Weekend escape to remote work base in one tap.",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
  },
];

const reasons = [
  {
    title: "No guesswork",
    description: "Pick a destination and we surface the most popular unlimited plans—already translated into your currency.",
  },
  {
    title: "Keep things light",
    description: "One QR code covers phones, tablets, and hotspots so you can roam without juggling plastic SIMs.",
  },
  {
    title: "Culture brief included",
    description: "Every checkout ships a quick guide with greetings, tipping vibes, and power plug tips for the city you land in.",
  },
];

const faqs = [
  {
    question: "Do I need an account first?",
    answer: "Nope. We’ll prompt you to sign in with Supabase Auth only if you’ve used the same email before.",
  },
  {
    question: "Can I hotspot for my laptop?",
    answer: "Yes. Flex plans are hotspot friendly and work across unlocked phones, tablets, and travel routers.",
  },
  {
    question: "How fast is activation?",
    answer: "The QR and instructions arrive instantly. Most travellers are online in under a minute once they scan.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />

      <main className="pb-24 pt-28">
        <section className="mx-auto flex max-w-6xl flex-col gap-12 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full bg-nurse px-5 py-2 text-sm font-semibold">
              <span className="text-coal">Flex Mobile</span>
              <span className="text-slate-500">Cultural roaming for rebels</span>
            </div>
            <h1 className="text-4xl font-semibold leading-tight sm:text-[3.1rem]">
              Travel like you already know the city.
            </h1>
            <p className="max-w-xl text-lg text-slate-600">
              Flex keeps your phone online in 200+ places with a single global eSIM. Simple pricing, instant delivery, and a
              cheeky culture brief in every order.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/destinations"
                className="inline-flex items-center gap-2 rounded-full bg-coal px-6 py-3 text-sm font-semibold uppercase tracking-[0.32em] text-white shadow-card transition hover:bg-coal/90"
              >
                Browse destinations
              </Link>
              <Link
                href="#plans"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold uppercase tracking-[0.32em] text-slate-600 transition hover:border-coal hover:text-coal"
              >
                Build a plan
              </Link>
            </div>

            <div className="rounded-2xl bg-daisy/70 px-6 py-4">
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-coal">
                <span className="rounded-full bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-coal">
                  New: more countries, same price
                </span>
                <p className="text-sm text-coal/80">
                  We just unlocked more coverage across South America and Asia—tap a destination to see the fresh unlimited picks.
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-coal/80">
                {promoHighlights.map((item) => (
                  <span key={item.label} className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="grid gap-4 sm:grid-cols-2">
              {citySpotlights.map((city) => (
                <Link
                  key={city.code}
                  href={`/destinations/${city.code.toLowerCase()}`}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <Image
                    src={city.image}
                    alt={city.name}
                    width={600}
                    height={500}
                    className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 space-y-1 p-5 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">Flex city</p>
                    <p className="text-xl font-semibold">{city.name}</p>
                    <p className="text-sm text-white/80">{city.copy}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="plans" className="mx-auto mt-24 max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-coal px-4 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-white">
                Unlimited data made simple
              </span>
              <h2 className="text-3xl font-semibold leading-snug sm:text-[2.5rem]">Pick your stopover and we’ll handle the rest.</h2>
              <p className="text-base text-slate-600">
                Choose a country to see a handful of tried-and-true plans. Prices are shown up front and include everything—no
                airport upsells, no surprise add-ons.
              </p>
              <ul className="space-y-3 text-base text-slate-600">
                <li>Instant QR delivery with setup instructions.</li>
                <li>Works across phones, tablets, and hotspots.</li>
                <li>Friendly support if you need a hand getting online.</li>
              </ul>
            </div>
            <PlanCard />
          </div>
        </section>

        <section id="why" className="mx-auto mt-24 max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {reasons.map((reason) => (
              <div key={reason.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
                <h3 className="text-xl font-semibold">{reason.title}</h3>
                <p className="mt-3 text-sm text-slate-600">{reason.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="destinations" className="mx-auto mt-24 max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-semibold">Every destination gets a spotlight page.</h2>
              <p className="mt-2 text-base text-slate-600">
                Dive into a country guide to see all unlimited plan options before you checkout. When you’re ready, it’s one tap to
                lock it in.
              </p>
            </div>
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold uppercase tracking-[0.32em] text-slate-600 transition hover:border-coal hover:text-coal"
            >
              See all destinations →
            </Link>
          </div>
        </section>

        <section id="faq" className="mx-auto mt-24 max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-card">
            <h2 className="text-2xl font-semibold">Need a quick answer?</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {faqs.map((faq) => (
                <div key={faq.question} className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">{faq.question}</p>
                  <p className="text-sm text-slate-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-24 max-w-4xl rounded-3xl bg-coal px-8 py-12 text-white shadow-card">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-white/60">Ready to roll?</p>
              <h2 className="text-3xl font-semibold">Choose your next country and lock in data before take-off.</h2>
            </div>
            <Link
              href="/destinations"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.32em] text-coal transition hover:bg-white/90"
            >
              Explore destinations
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
