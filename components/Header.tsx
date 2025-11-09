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
    <header className={styles.wrapper}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <span className={styles.badge}>FM</span>
          <span className={styles.brandCopy}>
            <span className={styles.brandLabel}>Flex Mobile</span>
            <span className={styles.brandTitle}>Reliable global eSIMs</span>
          </span>
        </Link>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
          <Link href="/checkout" className={styles.cta}>
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
