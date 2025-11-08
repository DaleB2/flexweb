import Link from "next/link";

export default function ThankYouPage() {
  return (
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
