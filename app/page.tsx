import Header from "@/components/Header";
import PlanCard from "@/components/PlanCard";

export default function HomePage() {
  return (
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
