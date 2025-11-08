import Link from "next/link";

const navItems = [
  { href: "#plans", label: "Plans" },
  { href: "#why", label: "Why Flex" },
  { href: "#help", label: "Help" },
];

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-bottle/10 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-bottle sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mint/90 text-base font-extrabold text-bottle shadow-[0_8px_25px_rgba(47,239,204,0.35)]">
            FM
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.4em] text-bottle/50">Flex Mobile</span>
            <span className="text-lg font-semibold">Switchless eSIM</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-[0.8rem] font-semibold uppercase tracking-[0.28em] text-bottle/60 lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-bottle">
              {item.label}
            </Link>
          ))}
          <Link
            href="/checkout"
            className="rounded-full bg-bottle px-6 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.32em] text-white transition hover:opacity-90"
          >
            Start checkout
          </Link>
        </nav>
      </div>
    </header>
  );
}
