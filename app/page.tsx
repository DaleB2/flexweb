import Image from "next/image";
import Link from "next/link";

import Header from "@/components/Header";
import PlanCard from "@/components/PlanCard";
import { Badge } from "@/components/ui/badge";

const heroBenefits = [
  "Best network guarantee",
  "Switchless activation",
  "Hotspot & tethering",
  "Visa, Apple Pay & Google Pay",
];

const highlightStats = [
  { label: "Countries", value: "200+" },
  { label: "Activation", value: "Instant" },
  { label: "Support", value: "24/7" },
];

const featureCards = [
  {
    title: "Roam like a local",
    description: "Unlimited data on top partner networks in 200+ destinations with no surprise charges.",
  },
  {
    title: "Keep your number",
    description: "Stay on iMessage and WhatsApp with your existing SIM while Flex powers your data.",
  },
  {
    title: "Five minute setup",
    description: "Purchase, scan the QR we email instantly, and you’re live before wheels down.",
  },
  {
    title: "One account everywhere",
    description: "Manage all of your eSIMs, top ups, and receipts from a single Truely-style dashboard.",
  },
];

const destinationShowcase = [
  "United States",
  "United Kingdom",
  "Japan",
  "Spain",
  "Thailand",
  "Portugal",
  "Germany",
  "Mexico",
  "Turkey",
  "Italy",
  "France",
  "Greece",
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
    <div className="relative min-h-screen overflow-hidden">
      <Header />

      <main className="relative z-10 flex flex-col gap-28 pb-28 pt-28">
        <section className="relative isolate overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1522149374751-76d3c53f625a?auto=format&fit=crop&w=1800&q=80"
              alt="Blue sky with clouds"
              fill
              priority
              className="-z-20 object-cover"
            />
            <div className="absolute inset-0 -z-10 bg-heroOverlay" />
            <div className="absolute inset-x-0 top-10 -z-10 h-80 bg-heroHalo blur-3xl" />
          </div>

          <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-12 sm:px-6 lg:flex-row lg:items-center lg:px-8">
            <div className="flex-1 space-y-6 text-white">
              <Badge className="bg-white/20 text-white">Truely Switchless</Badge>
              <h1 className="text-4xl font-semibold leading-tight sm:text-[3.4rem]">
                Unlimited internet that travels with you.
              </h1>
              <p className="max-w-xl text-lg text-white/85">
                Truely Switchless keeps you online in over 200 countries. Pick a destination, preview unlimited plans, and glide through the stacked checkout just like the original site.
              </p>
              <div className="flex flex-wrap gap-2">
                {heroBenefits.map((benefit) => (
                  <span
                    key={benefit}
                    className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-white/80"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-8 pt-6 text-white/80">
                {highlightStats.map((stat) => (
                  <div key={stat.label} className="space-y-1">
                    <p className="text-3xl font-semibold text-white">{stat.value}</p>
                    <p className="text-xs uppercase tracking-[0.36em]">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  href="#plans"
                  className="rounded-full bg-truelyLime px-10 py-3 text-sm font-semibold uppercase tracking-[0.36em] text-truelyNavy shadow-[0_24px_70px_rgba(156,255,0,0.35)] transition hover:shadow-[0_28px_90px_rgba(156,255,0,0.5)]"
                >
                  View packages
                </Link>
                <Link
                  href="#destinations"
                  className="rounded-full border border-white/30 px-10 py-3 text-sm font-semibold uppercase tracking-[0.36em] text-white/80 transition hover:border-white hover:text-white"
                >
                  Popular regions
                </Link>
              </div>
            </div>

            <div className="flex w-full max-w-lg shrink-0 flex-col gap-6">
              <div className="rounded-[40px] border border-white/15 bg-white/10 p-1 shadow-[0_30px_120px_rgba(4,17,49,0.45)] backdrop-blur">
                <PlanCard />
              </div>
            </div>
          </div>
        </section>

        <section id="plans" className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[36px] border border-white/10 bg-white/5 p-10 text-white shadow-[0_32px_120px_rgba(4,25,70,0.35)] backdrop-blur">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="space-y-5">
                <Badge className="bg-white/20 text-white">How it works</Badge>
                <h2 className="text-3xl font-semibold">Stacked steps, zero friction.</h2>
                <p className="text-base text-white/80">
                  Select your country above, explore available plans in the sheet, and continue into the Truely-style checkout flow where email verification, login, and payment live in one stack.
                </p>
                <ul className="space-y-3 text-sm text-white/75">
                  <li>• Country picker opens the slider sheet for data + duration.</li>
                  <li>• Plan summary keeps totals front-and-center before checkout.</li>
                  <li>• Checkout cards stack email → login → payment seamlessly.</li>
                </ul>
              </div>
              <div className="rounded-[32px] border border-white/15 bg-white/10 p-1 shadow-[0_26px_90px_rgba(4,25,70,0.35)] backdrop-blur">
                <PlanCard />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[36px] border border-white/10 bg-white text-truelyNavy shadow-[0_36px_110px_rgba(5,25,71,0.35)]">
            <div className="grid gap-6 p-10 sm:grid-cols-2">
              {featureCards.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-[28px] border border-truelySky/30 bg-white/60 p-6 text-left shadow-[0_18px_60px_rgba(7,25,67,0.12)]"
                >
                  <h3 className="text-xl font-semibold text-truelyNavy">{feature.title}</h3>
                  <p className="mt-3 text-sm text-truelyNavy/70">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="destinations" className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[36px] border border-white/10 bg-white/5 p-10 text-white shadow-[0_32px_110px_rgba(4,25,70,0.35)] backdrop-blur">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-3">
                <Badge className="bg-white/20 text-white">200+ regions</Badge>
                <h2 className="text-3xl font-semibold">Pick a hotspot, land connected.</h2>
                <p className="text-base text-white/75">
                  Flex automatically pairs you with the strongest partner networks in each location, so you can work, stream, and share without roaming shock.
                </p>
              </div>
              <Link
                href="/destinations"
                className="rounded-full border border-white/30 px-8 py-3 text-sm font-semibold uppercase tracking-[0.36em] text-white/80 transition hover:border-white hover:text-white"
              >
                See destination list
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {destinationShowcase.map((destination) => (
                <div
                  key={destination}
                  className="rounded-[28px] border border-white/15 bg-white/10 px-5 py-6 text-white shadow-[0_18px_70px_rgba(4,25,70,0.35)]"
                >
                  <p className="text-lg font-semibold">{destination}</p>
                  <p className="text-xs uppercase tracking-[0.34em] text-white/60">Unlimited data partner</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
