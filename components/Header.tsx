import Link from "next/link";

const navItems = [
  { href: "#plans", label: "Plans" },
  { href: "#why", label: "Why Flex" },
  { href: "#destinations", label: "Destinations" },
  { href: "#faq", label: "Help" },
];

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-slate-900 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mint text-base font-extrabold text-coal shadow-card">
            FM
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.38em] text-slate-500">Flex Mobile</span>
            <span className="text-lg font-semibold">Roam like a local</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-[0.75rem] font-semibold uppercase tracking-[0.32em] text-slate-500 lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-slate-900">
              {item.label}
            </Link>
          ))}
          <Link
            href="/destinations"
            className="rounded-full bg-coal px-6 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.32em] text-white shadow-card transition hover:bg-coal/90"
          >
            Browse plans
          </Link>
        </nav>
      </div>
    </header>
  );
}
