import Link from "next/link";

const navItems = [
  { href: "#plans", label: "Plans" },
  { href: "#why", label: "Why Flex" },
  { href: "#help", label: "Help" },
];

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-coal/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-white sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mint text-base font-extrabold text-coal shadow-[0_10px_25px_rgba(47,239,204,0.45)]">
            FM
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.45em] text-white/60">Flex Mobile</span>
            <span className="text-lg font-extrabold">Switchless eSIM</span>
          </div>
        </Link>
        <nav className="hidden items-center gap-8 text-[0.85rem] font-semibold uppercase tracking-[0.32em] text-white/70 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-white"
            >
    <header className="fixed inset-x-0 top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bottle text-sm font-bold text-white">
            FM
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Flex Mobile</span>
            <span className="text-base font-semibold">Travel eSIMs</span>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-slate-900">
              {item.label}
            </Link>
          ))}
          <Link
            href="/checkout"
            className="rounded-full bg-mint px-5 py-2 text-[0.75rem] font-bold uppercase tracking-[0.4em] text-coal shadow-[0_12px_40px_rgba(47,239,204,0.55)] transition hover:scale-105 hover:shadow-[0_20px_60px_rgba(47,239,204,0.65)]"
          >
            Log In
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  );
}
