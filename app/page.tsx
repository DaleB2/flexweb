import Image from "next/image";
import Link from "next/link";

import Header from "@/components/Header";
import PlanCard from "@/components/PlanCard";

const highlightStats = [
  { label: "Destinations", value: "200+" },
  { label: "Activation", value: "Instant" },
  { label: "Devices", value: "Phones & tablets" },
];

const featureCards = [
  {
    title: "Single global eSIM",
    description: "Stay connected as you hop countries without swapping plastic SIMs or managing multiple plans.",
  },
  {
    title: "Pay-as-you-go flexibility",
    description: "Top up your balance whenever you need more data. Your plan pauses when you do.",
  },
  {
    title: "No expiration stress",
    description: "Unused data stays on your profile so you can reconnect on your next trip without re-purchasing.",
  },
  {
    title: "Global app calling",
    description: "Keep in touch with local numbers through the Flex app wherever you’re travelling.",
  },
];

const destinationShowcase = [
  "United States",
  "United Kingdom",
  "Turkey",
  "Thailand",
  "Switzerland",
  "Spain",
  "Saudi Arabia",
  "Portugal",
  "New Zealand",
  "Greece",
  "Japan",
  "Germany",
];

const comparisons = [
  { label: "Single global eSIM", flex: true, roaming: false, tourist: false },
  { label: "Pay-as-you-go flexibility", flex: true, roaming: false, tourist: false },
  { label: "No expiration", flex: true, roaming: false, tourist: false },
  { label: "Fixed data plans", flex: true, roaming: true, tourist: true },
  { label: "Affordable pricing", flex: true, roaming: false, tourist: false },
  { label: "International voice calls", flex: true, roaming: true, tourist: false },
];

const faqs = [
  {
    question: "What is an eSIM?",
    answer:
      "An eSIM is a digital SIM that lets you activate a cellular plan without a physical SIM card. Scan the QR code we send after checkout to get online instantly.",
  },
  {
    question: "How do I set it up?",
    answer:
      "Setup is simple: purchase a plan, scan the QR delivered to your inbox, and follow the on-device steps. The Flex app guides you if you need help.",
  },
  {
    question: "Can I keep my number?",
    answer:
      "Yes. Your existing phone number stays active for calls and messaging while your Flex eSIM handles data.",
  },
  {
    question: "Is hotspotting allowed?",
    answer: "Absolutely. Share data with laptops, tablets, and friends without extra fees.",
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <Header />

      <main className="flex flex-col gap-24 pb-32 pt-28">
        <section className="relative isolate overflow-hidden">
          <div className="absolute inset-0 bg-heroDepth" />
          <div className="absolute -top-32 right-0 h-[32rem] w-[32rem] rounded-full bg-heroOrb blur-3xl" />
          <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:px-8">
            <div className="flex-1 space-y-6">
              <span className="inline-flex items-center gap-3 rounded-full bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.34em] text-white/70">
                Flex Mobile
              </span>
              <h1 className="text-4xl font-semibold leading-tight sm:text-[3.1rem]">
                The reliable eSIM for explorers.
              </h1>
              <p className="max-w-xl text-lg text-white/80">
                Stay connected like a local at home or abroad. Instant setup, flexible data, and coverage in 200+ countries—all inspired by the Roamless experience you love.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="#plans"
                  className="rounded-full bg-gradient-to-r from-iris to-fuchsia px-8 py-3 text-sm font-semibold uppercase tracking-[0.34em] text-white shadow-[0_22px_70px_rgba(123,60,237,0.55)] transition hover:shadow-[0_26px_85px_rgba(123,60,237,0.7)]"
                >
                  Choose a plan
                </Link>
                <Link
                  href="#destinations"
                  className="rounded-full border border-white/20 px-8 py-3 text-sm font-semibold uppercase tracking-[0.34em] text-white/80 transition hover:border-white hover:text-white"
                >
                  Explore destinations
                </Link>
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-white/70">
                {highlightStats.map((stat) => (
                  <div key={stat.label} className="space-y-1">
                    <p className="text-2xl font-semibold text-white">{stat.value}</p>
                    <p className="text-xs uppercase tracking-[0.34em]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex-1">
              <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-fuchsia/40 blur-3xl" />
              <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-white/10 p-6 backdrop-blur">
                <Image
                  src="https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80"
                  alt="Traveler holding phone"
                  width={900}
                  height={1200}
                  className="h-[28rem] w-full rounded-[28px] object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 text-center">
            <h2 className="text-3xl font-semibold">Made to move with you</h2>
            <p className="mx-auto max-w-2xl text-base text-white/80">
              Setup once, top up on the go, and stay online in over 200 destinations with one global eSIM.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {featureCards.map((feature) => (
              <div key={feature.title} className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-left shadow-[0_18px_50px_rgba(18,7,50,0.3)]">
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm text-white/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="plans" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.34em] text-white/70">
                Plans for every destination
              </span>
              <h2 className="text-3xl font-semibold">Pick your stopover and download data instantly.</h2>
              <p className="text-base text-white/80">
                We surface the best unlimited plans for each country and price them in your currency. No hidden fees, no airport kiosks.
              </p>
              <ul className="space-y-3 text-sm text-white/70">
                <li>• Instant QR delivery with setup instructions.</li>
                <li>• Works across phones, tablets, and hotspots.</li>
                <li>• Friendly support if you need a hand getting online.</li>
              </ul>
            </div>
            <PlanCard />
          </div>
        </section>

        <section id="destinations" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[36px] border border-white/10 bg-white/5 p-8 shadow-[0_18px_50px_rgba(18,7,50,0.3)]">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-3xl font-semibold">200+ destinations</h2>
                <p className="mt-2 max-w-xl text-base text-white/80">
                  Change countries, not SIMs. Flex switches between partners and networks automatically.
                </p>
              </div>
              <Link
                href="/destinations"
                className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold uppercase tracking-[0.32em] text-white/80 transition hover:border-white hover:text-white"
              >
                See all destinations
              </Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {destinationShowcase.map((destination) => (
                <div key={destination} className="rounded-[24px] border border-white/10 bg-white/10 px-5 py-6 text-white/80">
                  <p className="text-lg font-semibold text-white">{destination}</p>
                  <p className="text-xs uppercase tracking-[0.32em] text-white/60">Included with Flex</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[36px] border border-white/10 bg-white text-midnight shadow-[0_28px_90px_rgba(18,7,50,0.35)]">
            <div className="border-b border-lilac/40 p-8 text-center">
              <h2 className="text-3xl font-semibold text-midnight">Why Flex Mobile is simply better</h2>
              <p className="mt-3 text-base text-midnight/70">
                Compare Flex with traditional roaming and tourist SIMs.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] divide-y divide-lilac/40 text-left text-sm">
                <thead>
                  <tr className="text-[0.65rem] uppercase tracking-[0.32em] text-midnight/50">
                    <th className="px-6 py-4">Comparison</th>
                    <th className="px-6 py-4 text-center">Flex Mobile</th>
                    <th className="px-6 py-4 text-center">Travel roaming</th>
                    <th className="px-6 py-4 text-center">Tourist SIMs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lilac/30">
                  {comparisons.map((row) => (
                    <tr key={row.label} className="text-midnight/80">
                      <td className="px-6 py-4 font-semibold">{row.label}</td>
                      <td className="px-6 py-4 text-center text-iris">{row.flex ? "✓" : "—"}</td>
                      <td className="px-6 py-4 text-center text-midnight/50">{row.roaming ? "✓" : "—"}</td>
                      <td className="px-6 py-4 text-center text-midnight/50">{row.tourist ? "✓" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <div className="lg:w-1/3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-white/70">
                Need help?
              </span>
              <h2 className="mt-4 text-3xl font-semibold">Answers before takeoff</h2>
              <p className="mt-3 text-base text-white/75">
                Learn how Flex keeps you connected and what to expect during activation.
              </p>
            </div>
            <div className="grid flex-1 gap-6 sm:grid-cols-2">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_18px_50px_rgba(18,7,50,0.3)]">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">{faq.question}</p>
                  <p className="mt-3 text-sm text-white/75">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl rounded-[36px] border border-white/10 bg-gradient-to-r from-iris to-fuchsia px-8 py-12 text-center shadow-[0_26px_90px_rgba(123,60,237,0.6)]">
          <h2 className="text-3xl font-semibold">Ready to roam?</h2>
          <p className="mt-3 text-base text-white/80">
            Choose your destination, pick a plan, and checkout in under a minute.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="#plans"
              className="rounded-full bg-white px-8 py-3 text-sm font-semibold uppercase tracking-[0.34em] text-iris transition hover:bg-white/90"
            >
              Start planning
            </Link>
            <Link
              href="/checkout"
              className="rounded-full border border-white/60 px-8 py-3 text-sm font-semibold uppercase tracking-[0.34em] text-white/90 transition hover:border-white hover:text-white"
            >
              Secure checkout
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
