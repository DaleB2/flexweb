"use client";

type Props = {
  iccid: string;
  qrCode: string;
  onViewAccount: () => void;
};

export default function SuccessCard({ iccid, qrCode, onViewAccount }: Props) {
  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <div className="space-y-2">
        <h4 className="text-xl font-semibold text-[#061031]">You’re connected</h4>
        <p className="text-sm text-slate-500">
          We’ve issued your eSIM and sent setup instructions to your inbox. Activate the plan anytime from your Flex dashboard.
        </p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">ICCID</p>
        <p className="text-lg font-semibold text-[#061031]">…{iccid.slice(-4)}</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">QR Code</p>
        <p className="text-sm text-slate-500">Scan the QR we emailed to install instantly.</p>
        <a href={qrCode} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#061031] underline">
          View QR download
        </a>
      </div>
      <button
        type="button"
        onClick={onViewAccount}
        className="mt-auto flex w-full items-center justify-center rounded-2xl bg-[#061031] px-6 py-3 text-sm font-semibold uppercase tracking-[0.32em] text-white transition hover:bg-[#0a1a3c]"
      >
        View in account
      </button>
    </div>
  );
}
