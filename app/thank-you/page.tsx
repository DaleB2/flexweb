import Link from "next/link";

export default function ThankYouPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-heroGrad px-6 py-16">
      <div className="max-w-xl rounded-[26px] bg-white/90 p-10 text-center shadow-card backdrop-blur">
        <span className="text-5xl" role="img" aria-label="party popper">
          🎉
        </span>
        <h1 className="mt-4 text-4xl font-extrabold uppercase text-bottle">Thanks!</h1>
        <p className="mt-4 text-sm font-medium text-bottle/70">
          Your payment is confirmed and your eSIM is getting ready. Check your inbox for the QR code and setup steps.
        </p>
        <div className="mt-8 space-y-3 text-sm font-semibold text-bottle/70">
          <p>• Allow a few minutes for provisioning.</p>
          <p>• Need help? Reply directly to the confirmation email.</p>
        </div>
        <Link
          href="/"
          className="mt-10 inline-flex rounded-full bg-bottle px-6 py-3 text-sm font-bold uppercase tracking-[0.3em] text-white transition hover:bg-bottle/90"
        >
          Back to plans
        </Link>
      </div>
    </main>
  );
}
