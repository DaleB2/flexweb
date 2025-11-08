import Link from "next/link";

export default function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-6 lg:px-12">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 shadow-card backdrop-blur">
          <span className="text-lg font-bold text-bottle">F</span>
        </div>
        <div className="flex flex-col leading-tight text-white drop-shadow">
          <span className="text-sm font-semibold uppercase tracking-[0.35em]">Flex Mobile</span>
          <span className="text-lg font-bold">Travel eSIMs</span>
        </div>
      </div>
      <nav className="hidden items-center gap-8 text-sm font-semibold uppercase text-white/90 drop-shadow lg:flex">
        <Link href="#destinations" className="transition hover:text-white">
          Destinations
        </Link>
        <Link href="#pricing" className="transition hover:text-white">
          Pricing
        </Link>
        <Link href="#help" className="transition hover:text-white">
          Help Center
        </Link>
        <Link
          href="/checkout"
          className="rounded-full border border-white/60 bg-white/10 px-6 py-2 text-xs font-bold tracking-widest text-white shadow-sm backdrop-blur transition hover:bg-white hover:text-bottle"
        >
          Sign In
        </Link>
      </nav>
    </header>
  );
}
