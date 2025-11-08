import Link from "next/link";

const navItems = [
  { href: "#plans", label: "Plans" },
  { href: "#why", label: "Why Flex" },
  { href: "#help", label: "Help" },
];

export default function Header() {
  return (
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
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  );
}
