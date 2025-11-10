import CheckoutFlow from "@/components/CheckoutFlow";
import { fetchCountries } from "@/lib/esimAccess";

export default async function HomePage() {
  const countries = await fetchCountries();
  const defaultMarkup = Number(process.env.ESIM_ACCESS_DEFAULT_MARKUP_PCT ?? 25);

  return (
    <main className="min-h-screen bg-[#01050F] pb-24 pt-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 sm:px-6 lg:px-8">
        <CheckoutFlow countries={countries} defaultMarkupPct={defaultMarkup} />
        <section className="grid gap-6 rounded-[36px] border border-white/10 bg-white/5 p-10 text-white shadow-[0_32px_120px_rgba(4,17,49,0.35)] backdrop-blur lg:grid-cols-3">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold">How the stack works</h2>
            <p className="text-sm text-white/70">
              Every step of the checkout is rendered in place. We only update the URL with shallow pushes so the browser never reloads, mirroring Truely’s signature flow.
            </p>
          </div>
          <div className="space-y-2 text-sm text-white/70">
            <h3 className="text-sm font-semibold uppercase tracking-[0.32em] text-white/60">State machine</h3>
            <p>Select → Summary → Email → Login (if needed) → Payment → Success. Back buttons simply update the step query without losing selections.</p>
          </div>
          <div className="space-y-2 text-sm text-white/70">
            <h3 className="text-sm font-semibold uppercase tracking-[0.32em] text-white/60">Inline auth</h3>
            <p>Existing accounts must log in before payment, while new emails continue as guests and receive an invitation after checkout.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
