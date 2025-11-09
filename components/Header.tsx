import Link from "next/link";

import styles from "./Header.module.css";

const navItems = [
  { href: "#features", label: "Features" },
  { href: "#destinations", label: "Destinations" },
  { href: "#plans", label: "Plans" },
  { href: "#faq", label: "Support" },
];

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-midnight/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-white sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-iris to-fuchsia text-base font-extrabold text-white shadow-[0_18px_45px_rgba(123,60,237,0.4)]">
            FM
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-white/60">Flex Mobile</span>
            <span className="text-lg font-semibold">Reliable global eSIMs</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-10 text-[0.75rem] font-semibold uppercase tracking-[0.34em] text-white/70 lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
          <Link
            href="/checkout"
            className="rounded-full bg-gradient-to-r from-iris to-fuchsia px-6 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.34em] text-white shadow-[0_18px_45px_rgba(123,60,237,0.4)] transition hover:shadow-[0_22px_60px_rgba(123,60,237,0.55)]"
          >
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
