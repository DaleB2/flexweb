import Link from "next/link";

export default function ThankYouPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-violet via-coal to-royal px-6 py-16 text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-10%] top-20 h-[420px] w-[420px] rounded-full bg-mint/40 blur-[150px]" />
        <div className="absolute right-[-15%] top-36 h-[520px] w-[520px] rounded-full bg-heliotrope/35 blur-[190px]" />
        <div className="absolute inset-x-0 bottom-[-30%] h-[420px] bg-gradient-to-t from-coal via-transparent to-transparent" />
      </div>
      <div className="mx-auto max-w-xl rounded-[36px] border border-white/20 bg-white/10 p-12 text-center shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-mint text-3xl text-coal shadow-[0_16px_40px_rgba(47,239,204,0.5)]" role="img" aria-label="party popper">
          🎉
        </div>
        <h1 className="mt-6 text-4xl font-black leading-tight">Payment locked. eSIM en route.</h1>
        <p className="mt-4 text-base font-semibold text-white/70">
          Your QR code and setup flow are racing to your inbox. Install before you land and flip on roaming when you touch down.
        </p>
        <div className="mt-8 space-y-3 text-sm font-semibold text-white/60">
          <p>• Provisioning takes just a couple minutes — refresh email if you don’t see it.</p>
          <p>• Need help? Reply to the confirmation email and our crew jumps in.</p>
        </div>
        <Link
          href="/"
          className="mt-10 inline-flex rounded-full bg-mint px-8 py-3 text-sm font-bold uppercase tracking-[0.4em] text-coal shadow-[0_18px_50px_rgba(47,239,204,0.45)] transition hover:scale-[1.03]"
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16">
      <div className="max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <span className="text-5xl" role="img" aria-label="party popper">
          🎉
        </span>
        <h1 className="mt-4 text-4xl font-semibold text-slate-900">Thanks for your order!</h1>
        <p className="mt-4 text-sm font-medium text-slate-600">
          Your payment is confirmed and your eSIM is getting ready. Check your inbox for the QR code and setup steps.
        </p>
        <div className="mt-8 space-y-3 text-sm font-medium text-slate-600">
          <p>• Allow a few minutes for provisioning.</p>
          <p>• Need help? Reply directly to the confirmation email.</p>
        </div>
        <Link
          href="/"
          className="mt-10 inline-flex rounded-full bg-bottle px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-bottle/90"
        >
          Back to plans
        </Link>
      </div>
    </main>
  );
}
