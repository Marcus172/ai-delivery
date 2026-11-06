import { l, type L10n } from "./l10n";

export type Role = {
  company: string;
  client?: string;
  title: L10n;
  /** YYYY-MM */
  from: string;
  /** YYYY-MM, or null for the current role */
  to: string | null;
  summary: L10n;
};

export type Cv = {
  headline: L10n;
  /** One-line facts for recruiters (role now, place, languages, availability), shown on landing and CV. */
  facts: L10n[];
  profile: L10n;
  roles: Role[];
  skills: { group: L10n; items: string[] }[];
  languages: L10n[];
  contact: { email: string; linkedin: string; github: string; site: string };
};

/** Historical job titles stay as they were (readers check them against LinkedIn and references). */
const title = (t: string): L10n => ({ en: t, cs: t });

// src: author's CV (PDF), rewritten towards product engineering; current role per spec §5.4.
export const CV: Cv = {
  headline: title("Senior Product Engineer"),
  facts: [
    l("Now: Product Engineering & AI Lead", "Teď: Product Engineering & AI Lead"),
    l("Prague or remote", "Praha nebo remote"),
    l("English, Czech", "čeština, angličtina"),
    l("Available from January 2027", "K dispozici od ledna 2027"),
  ],
  profile: l(
    "Senior Product Engineer with 12 years of delivering web and mobile products, from product design and architecture to production. My current focus is AI-enabled software delivery for whole teams: a shared delivery flow with guardrails, measurements and quality gates that hold with or without AI, and agent tooling that analysts and testers use in their own work. The process that worked before AI stays; AI takes over the grunt work and people decide. Strong TypeScript, React and Next.js foundation, hands-on Node.js, Kotlin and Spring Boot, and a widening back-end and cloud scope.",
    "Senior Product Engineer s dvanácti lety praxe v dodávání webových a mobilních produktů – od produktového návrhu a architektury až po provoz. Dnes se soustředím na dodávání softwaru s AI pro celé týmy: sdílený delivery flow s mantinely, měřením a branami kvality, které platí s AI i bez ní, a agentní nástroje, které si do své práce vzali i analytici a testeři. Proces, který fungoval před AI, zůstává; mravenčí práci přebírá AI a rozhodují lidé. Pevný základ v TypeScriptu, Reactu a Next.js, praxe s Node.js, Kotlinem a Spring Bootem a postupně rozšiřovaný záběr do backendu a cloudu.",
  ),
  roles: [
    {
      company: "Finshape",
      client: "J&T Bank — internet banking & investments",
      title: title("Product Engineering & AI Lead"),
      from: "2026-04",
      to: null,
      summary: l(
        "Lead product engineering for an internet-banking and investment platform built with Next.js, TypeScript and GraphQL, delivered across several parallel release lines. Combine hands-on delivery with technical direction and product coordination. Brought AI-assisted delivery to the whole team: a shared delivery flow with guardrails and quality gates for developers, and AI tooling for testing and analysis, with people approving every result.",
        "Vedu produktový vývoj platformy internetového bankovnictví a investic (Next.js, TypeScript, GraphQL) dodávané v několika paralelních release liniích. Spojuji vlastní vývoj s technickým směřováním a produktovou koordinací. Zavedl jsem dodávání s AI pro celý tým: sdílený delivery flow s mantinely a branami kvality pro vývojáře a AI nástroje pro testování a analýzu, přičemž každý výsledek schvaluje člověk.",
      ),
    },
    {
      company: "ApiTree s.r.o.",
      client: "Gloat",
      title: title("Senior React Engineer"),
      from: "2025-08",
      to: "2026-03",
      summary: l(
        "Delivered product features in Gloat's React monorepo alongside Python back-end teams. Used Claude Code and Cursor to speed up delivery without lowering quality, contributed to product design in Figma, and built agents and automation for development workflows and CI.",
        "Dodával jsem produktové funkce v React monorepu Gloatu vedle backendových týmů v Pythonu. Claude Code a Cursor jsem používal ke zrychlení dodávky bez slevy z kvality, podílel jsem se na produktovém návrhu ve Figmě a stavěl agenty a automatizaci pro vývojové workflow a CI.",
      ),
    },
    {
      company: "ApiTree s.r.o.",
      client: "Česká spořitelna — Partner24",
      title: title("Senior Full-Stack Engineer"),
      from: "2024-04",
      to: "2025-07",
      summary: l(
        "Led the modernization of a portfolio of about 20 applications. Helped establish a new React and Kotlin architecture, reduce technical debt and improve integration with teams, systems and DevOps. Delivered end-to-end features including Kotlin and Spring Boot back-end services, mentored colleagues and made key technical decisions.",
        "Vedl jsem modernizaci portfolia zhruba 20 aplikací. Pomáhal jsem zavést novou architekturu na Reactu a Kotlinu, snížit technický dluh a zlepšit napojení na týmy, systémy a DevOps. Dodával jsem funkce od začátku do konce včetně backendových služeb v Kotlinu a Spring Bootu, mentoroval kolegy a dělal klíčová technická rozhodnutí.",
      ),
    },
    {
      company: "Valatron s.r.o.",
      client: "Veolia — Olivea, smart building & factory monitoring",
      title: title("Senior React Developer / Architect"),
      from: "2023-09",
      to: "2024-03",
      summary: l(
        "Designed and built a greenfield single-page application for real-time monitoring of smart buildings and factories: responsive charts, device management and notifications over high-volume IoT data under heavy concurrency. Set up automated performance testing with Grafana k6.",
        "Navrhl a postavil jsem od nuly single-page aplikaci pro monitoring chytrých budov a továren v reálném čase: responzivní grafy, správu zařízení a notifikace nad velkým objemem IoT dat při vysoké souběžnosti. Zavedl jsem automatizované výkonnostní testy v Grafana k6.",
      ),
    },
    {
      company: "Valatron s.r.o.",
      title: title("Senior React Developer / Architect"),
      from: "2023-03",
      to: "2023-10",
      summary: l(
        "Led the web architecture and implementation of a seed-stage NFT crowdfunding platform: a Next.js storefront and administration portal integrated with .NET Core services, Stripe, Polygon and Solidity smart contracts.",
        "Vedl jsem webovou architekturu a implementaci crowdfundingové NFT platformy v seed fázi: storefront a administraci v Next.js napojené na služby v .NET Core, Stripe, Polygon a smart kontrakty v Solidity.",
      ),
    },
    {
      company: "Phrase a.s.",
      title: title("Mobile Development Team / Tech Lead"),
      from: "2019-11",
      to: "2022-10",
      summary: l(
        "Joined as a React Native engineer and took over team leadership after a year. Led weekly roadmap planning, architecture, product workshops and stakeholder presentations in English while staying hands-on in delivering the mobile app of a localization platform.",
        "Nastoupil jsem jako React Native vývojář a po roce převzal vedení týmu. Vedl jsem týdenní plánování roadmapy, architekturu, produktové workshopy a prezentace pro stakeholdery v angličtině a přitom dál sám vyvíjel mobilní aplikaci lokalizační platformy.",
      ),
    },
    {
      company: "nangu.TV, a.s.",
      title: title("Front-end Engineer"),
      from: "2017-03",
      to: "2019-10",
      summary: l(
        "Built set-top box, web and mobile applications for a media and live-streaming platform serving B2B clients including O2 TV and Orange TV: feature delivery, performance optimization and code shared across web, Android, iOS and constrained set-top box environments.",
        "Vyvíjel jsem aplikace pro set-top boxy, web a mobil pro mediální a streamovací platformu, jejímiž B2B klienty byly mimo jiné O2 TV a Orange TV: dodávka funkcí, optimalizace výkonu a kód sdílený mezi webem, Androidem, iOS a omezeným prostředím set-top boxů.",
      ),
    },
    {
      company: "Diebold Nixdorf s.r.o.",
      client: "Lloyds Banking Group",
      title: title("Service Support Engineer"),
      from: "2016-06",
      to: "2017-02",
      summary: l(
        "L2 server support: incident analysis, production systems and operational reliability.",
        "Podpora serverů na úrovni L2: analýza incidentů, produkční systémy a provozní spolehlivost.",
      ),
    },
    {
      company: "FutureTek Solutions",
      title: title("Web Application Developer"),
      from: "2014-08",
      to: "2016-06",
      summary: l(
        "Developed and extended a Yii2 CMS for multiple customer projects and built tailored user interfaces in AngularJS, from concept through deployment.",
        "Vyvíjel a rozšiřoval jsem CMS na Yii2 pro řadu zákaznických projektů a stavěl na míru uživatelská rozhraní v AngularJS, od konceptu po nasazení.",
      ),
    },
  ],
  skills: [
    { group: l("AI-enabled delivery", "Dodávání s AI"), items: ["Claude Code", "Codex", "Cursor", "Agent skills & plugins", "MCP", "Agentic workflows", "CI/CD"] },
    { group: l("Languages", "Jazyky"), items: ["TypeScript", "Java", "Kotlin", "Swift"] },
    {
      group: l("Frameworks", "Frameworky"),
      items: ["Next.js", "Node.js", "React", "React Native", "GraphQL", "React Query", "Redux", "Spring Boot", "Tailwind CSS"],
    },
    {
      group: l("Quality", "Kvalita"),
      items: ["Playwright", "Cypress", "Jest", "React Testing Library", "Storybook", "Visual regression testing"],
    },
    {
      group: l("Platform", "Platforma"),
      items: ["Monorepos (Turborepo)", "Docker", "GitHub CI/CD", "GitLab CI/CD", "Kubernetes basics", "Cloud architecture basics"],
    },
    { group: l("Product & leadership", "Produkt a vedení"), items: ["Product design", "Figma", "Tech leadership", "Mentoring", "Workshops & training"] },
  ],
  languages: [l("English — fluent", "angličtina – plynně"), l("Czech — native", "čeština – rodilý mluvčí")],
  contact: {
    email: "marek.marcus.rom@gmail.com",
    linkedin: "https://www.linkedin.com/in/marek-rom-a91445b8",
    github: "https://github.com/Marcus172",
    site: "https://marcus172.github.io/ai-delivery/",
  },
};
