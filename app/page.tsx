import Image from "next/image";
import Link from "next/link";

import Header from "@/components/Header";
import PlanCard from "@/components/PlanCard";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#F4FBFF] to-[#FFF6EF] text-bottle">
      <Header />

      <main className="pb-24 pt-28">
        <section id="plans" className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-x-0 top-6 -z-10 flex justify-center">
            <div className="h-72 w-full max-w-5xl rounded-full bg-gradient-to-r from-mint/20 via-anakiwa/30 to-daisy/30 blur-3xl" />
          </div>
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="space-y-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-bottle/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-bottle/70">
                <span className="h-2 w-2 rounded-full bg-mint" aria-hidden />
                Global travel eSIM
              </span>
              <h1 className="text-4xl font-semibold leading-tight text-bottle sm:text-5xl">
                Roam easy from Marrakech souks to Seoul night markets.
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-bottle/70">
                Flex Mobile pairs switchless eSIM tech with fair, transparent pricing. Choose a destination, receive your QR instantly, and stream, navigate, and share without worrying about roaming shocks.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Destinations", value: "190+" },
                  { label: "Average setup", value: "2 min" },
                  { label: "Support", value: "24/7" },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-2xl border border-bottle/10 bg-white/80 p-4 text-left shadow-sm">
                    <p className="text-2xl font-semibold text-bottle">{value}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.28em] text-bottle/50">{label}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <Link
                  href="/checkout"
                  className="inline-flex items-center justify-center rounded-full bg-bottle px-8 py-4 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:opacity-90"
                >
                  Start checkout
                </Link>
                <Link
                  href="#why"
                  className="inline-flex items-center justify-center rounded-full border border-bottle/20 bg-white/70 px-8 py-4 text-sm font-semibold uppercase tracking-[0.3em] text-bottle transition hover:border-bottle/40"
                >
                  Why travelers choose us
                </Link>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/70 p-4 text-sm text-bottle/70 shadow-inner">
                <Image
                  src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=120&q=80"
                  alt="Travelers sharing tea"
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full object-cover"
                  priority={false}
                />
                <p>
                  "I landed in Dakar, scanned the QR in the taxi, and joined my video stand-up on time. The local tips in the welcome email were a nice touch."
                  <span className="block text-xs uppercase tracking-[0.28em] text-bottle/40">— Amara, Product lead working remotely</span>
                </p>
              </div>
            </div>

            <aside className="w-full max-w-lg lg:sticky lg:top-32">
              <PlanCard />
            </aside>
          </div>
        </section>

        <section className="mt-20 border-y border-bottle/10 bg-white/70 py-8">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-6 px-4 text-sm font-semibold uppercase tracking-[0.28em] text-bottle/60 sm:px-6 lg:px-8">
            <span className="flex items-center gap-2"><span className="text-xl">🌍</span>Local partner networks</span>
            <span className="flex items-center gap-2"><span className="text-xl">🕌</span>Respectful roaming guidance</span>
            <span className="flex items-center gap-2"><span className="text-xl">🍜</span>Culture-first travel tips</span>
            <span className="flex items-center gap-2"><span className="text-xl">🛟</span>Real crew, any timezone</span>
          </div>
        </section>

        <section id="why" className="mx-auto mt-24 max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-bottle/50">Why it feels effortless</p>
              <h2 className="text-3xl font-semibold text-bottle sm:text-4xl">Designed with global communities in mind</h2>
              <p className="text-base leading-relaxed text-bottle/70">
                From festival hopping in Rio to remote work weeks in Lisbon, Flex Mobile keeps you connected without overshadowing the local experience. Every plan pairs reliable connectivity with cultural briefings sourced from residents and frequent flyers.
              </p>
              <ul className="space-y-3 text-sm text-bottle/70">
                <li className="flex items-start gap-3">
                  <span aria-hidden className="mt-1 text-bottle">✔</span>
                  Curated welcome notes with etiquette tips for greetings, tipping, and transit in your chosen country.
                </li>
                <li className="flex items-start gap-3">
                  <span aria-hidden className="mt-1 text-bottle">✔</span>
                  Automatic timezone awareness so support responds in your daylight hours.
                </li>
                <li className="flex items-start gap-3">
                  <span aria-hidden className="mt-1 text-bottle">✔</span>
                  Pricing converted upfront — no surprise fees or conversions mid-trip.
                </li>
              </ul>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {[
                {
                  title: "City breaks",
                  description: "Weekend essentials for art walks in Mexico City or brunch in Copenhagen.",
                  icon: "🎨",
                },
                {
                  title: "Sacred journeys",
                  description: "Connectivity that respects prayer times in Istanbul or Varanasi.",
                  icon: "🕯️",
                },
                {
                  title: "Food pilgrimages",
                  description: "Stream your ramen crawl in Tokyo while staying on local data partners.",
                  icon: "🍲",
                },
                {
                  title: "Work-from-anywhere",
                  description: "Secure hotspots for collaboration from Nairobi to New York.",
                  icon: "💻",
                },
              ].map(({ title, description, icon }) => (
                <div key={title} className="rounded-3xl border border-bottle/10 bg-white/80 p-6 shadow-sm">
                  <span className="text-2xl" aria-hidden>
                    {icon}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-bottle">{title}</h3>
                  <p className="mt-2 text-sm text-bottle/70">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="rounded-3xl border border-bottle/10 bg-white/90 p-8 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-bottle/50">How it works</p>
              <h2 className="mt-4 text-3xl font-semibold text-bottle">Three steps to dependable data</h2>
              <ol className="mt-6 space-y-5 text-sm text-bottle/70">
                {[
                  "Pick your destination and data style from the dropdown.",
                  "Checkout with Stripe — taxes and currency conversion are locked in before you pay.",
                  "Scan the QR we email, switch on data roaming, and you're live.",
                ].map((step, index) => (
                  <li key={step} className="flex items-start gap-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bottle/10 text-sm font-semibold text-bottle">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-3xl border border-bottle/10 bg-white/90 p-8 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-bottle/50">Community signals</p>
              <h2 className="mt-4 text-3xl font-semibold text-bottle">Loved by travelers everywhere</h2>
              <div className="mt-6 space-y-5 text-sm text-bottle/70">
                <p>
                  "Flex kept us connected during the Lunar New Year rush in Hanoi. The cultural do's & don'ts email helped our team show respect at temples."
                  <span className="mt-2 block text-xs uppercase tracking-[0.3em] text-bottle/40">Lan & Malik · Creative duo</span>
                </p>
                <p>
                  "Data stayed strong while volunteering in the Atlas Mountains. Being able to top up with local pricing meant more funds for the project."
                  <span className="mt-2 block text-xs uppercase tracking-[0.3em] text-bottle/40">Sonia · Community organizer</span>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="help" className="border-t border-bottle/10 bg-white/80 py-12 text-bottle">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-bottle/50">Need a human?</p>
            <p className="mt-2 text-lg font-semibold">hello@flexmobile.com</p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-bottle/50">
            <span className="rounded-full border border-bottle/10 bg-white px-4 py-2">Best network guarantee</span>
            <span className="rounded-full border border-bottle/10 bg-white px-4 py-2">Hotspot &amp; tethering</span>
            <span className="rounded-full border border-bottle/10 bg-white px-4 py-2">Secure payments</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
