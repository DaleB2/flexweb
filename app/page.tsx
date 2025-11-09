import Image from "next/image";
import Link from "next/link";

import Header from "@/components/Header";
import PlanSearch from "@/components/PlanSearch";

import styles from "./page.module.css";

const highlightStats = [
  { label: "Destinations", value: "200+" },
  { label: "Activation", value: "Instant" },
  { label: "Devices", value: "Phones & tablets" },
];

const featureCards = [
  {
    title: "Instant QR activation",
    description: "Checkout in under a minute and scan the QR code to bring your Flex line online immediately.",
  },
  {
    title: "One profile, 200+ countries",
    description: "Stay connected worldwide without swapping SIMs or juggling multiple accounts.",
  },
  {
    title: "Transparent pricing",
    description: "Wholesale plus a small Flex service margin—taxes and support baked into the price you see.",
  },
  {
    title: "Works on every device",
    description: "Phones, tablets, hotspots—if it supports eSIM, Flex connects it with high-speed data.",
  },
];

const destinationShowcase = [
  "Austria",
  "United States",
  "United Kingdom",
  "Japan",
  "Turkey",
  "Thailand",
  "Portugal",
  "Spain",
];

const faqs = [
  {
    question: "How does Flex compare to Roamless?",
    answer:
      "We match the transparent pricing and onboarding experience you love while adding our own perks like local support and curated plan recommendations.",
  },
  {
    question: "Can I keep my current number?",
    answer: "Yes. Your regular line stays active for calls and texts while Flex handles all the data for your trip.",
  },
  {
    question: "Do plans expire?",
    answer: "Choose the duration that fits your stay. Once the timer runs out you can search again and top up instantly—no need for a new profile.",
  },
  {
    question: "Is hotspotting supported?",
    answer: "Absolutely. Share data with laptops, tablets, and travel companions without throttling or surprise fees.",
  },
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <span className={styles.heroBadge}>Flex Mobile</span>
              <h1 className={styles.heroTitle}>The Roamless-inspired eSIM built for every trip.</h1>
              <p className={styles.heroParagraph}>
                Forget airport kiosks. Search any destination, lock in fair pricing, and activate in minutes. Flex mirrors the
                Roamless experience with our own concierge support.
              </p>
              <div className={styles.heroActions}>
                <Link href="#plans" className={styles.primaryButton}>
                  Browse plans
                </Link>
                <Link href="#destinations" className={styles.secondaryButton}>
                  Explore destinations
                </Link>
              </div>
              <div className={styles.stats}>
                {highlightStats.map((stat) => (
                  <div key={stat.label} className={styles.statBlock}>
                    <span className={styles.statValue}>{stat.value}</span>
                    <span className={styles.statLabel}>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.heroImageFrame}>
              <Image
                src="https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80"
                alt="Traveler holding a phone with an eSIM app"
                width={900}
                height={1200}
                className={styles.heroImage}
                priority
              />
            </div>
          </div>
        </section>

        <section id="plans" className={styles.planSection}>
          <PlanSearch />
        </section>

        <section id="features" className={styles.featureSection}>
          <div className={styles.featureHeader}>
            <h2>Everything you expect from Roamless—plus more support.</h2>
            <p>
              We borrowed the premium visuals and transparent pricing flow, then layered in concierge onboarding and curated
              plan suggestions for every traveler.
            </p>
          </div>
          <div className={styles.featureGrid}>
            {featureCards.map((feature) => (
              <article key={feature.title} className={styles.featureCard}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="destinations" className={styles.destinationsSection}>
          <div className={styles.destinationsHeader}>
            <div>
              <h2>Popular destinations ready to activate</h2>
              <p>
                Flex keeps you online in 200+ countries with the same smooth checkout and profile management you’ve seen on
                Roamless.
              </p>
            </div>
            <Link href="/destinations" className={styles.linkButton}>
              View all
            </Link>
          </div>
          <div className={styles.destinationsGrid}>
            {destinationShowcase.map((destination) => (
              <div key={destination} className={styles.destinationCard}>
                <strong>{destination}</strong>
                <span>Included with Flex</span>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className={styles.faqSection}>
          <div className={styles.faqIntro}>
            <h2>Questions before you switch?</h2>
            <p>We’ve redesigned Flex to mirror the Roamless experience—here’s what travelers ask us most.</p>
          </div>
          <div className={styles.faqList}>
            {faqs.map((faq) => (
              <article key={faq.question} className={styles.faqItem}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
