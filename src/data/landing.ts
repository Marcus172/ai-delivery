import { l } from "./l10n";

/** Landing page copy (spec §5.1). Czech gets Czech typography via `l()`. */
export const LANDING = {
  who: l("Senior Product Engineer", "Senior Product Engineer"),
  headline: l("One delivery flow. AI for the whole team.", "Jeden delivery flow. AI pro celý tým."),
  lead: l(
    "I have shipped software for twelve years. In 2026 I built AI-assisted delivery for a whole product team: a large product monorepo with several parallel release lines and a cross-functional team of developers, analysts and testers. The process that worked stays. AI takes over the grunt work, the gates hold with or without it, and people decide.",
    "Software dodávám dvanáct let. V roce 2026 jsem postavil AI-asistované dodávání pro celý produktový tým: velké produktové monorepo s několika paralelními release liniemi a tým napříč rolemi – vývojáři, analytici i testeři. Proces, který fungoval, zůstává. Mravenčí práci přebírá AI, brány platí s ní i bez ní a rozhodují lidé.",
  ),
  statsPeriodBefore: l(
    "Measured on one team; periods, baselines and caveats are in the ",
    "Měřeno na jednom týmu; období, výchozí stavy a výhrady jsou ve ",
  ),
  statsPeriodLink: l("Wins & cases", "Výsledcích a případech"),

  offerEyebrow: l("Consulting", "Konzultace"),
  offerTitle: l("What I can set up for you", "Co vám můžu nastavit"),
  offerIntro: l(
    "Not one fast developer. A flow the whole team works in, tools each person can swap on their own, and gates that hold for people who never open an AI tool.",
    "Ne jeden rychlý vývojář. Flow, ve kterém pracuje celý tým, nástroje, které si každý vymění sám, a brány, které platí i pro ty, kdo AI nikdy neotevřou.",
  ),

  aboutEyebrow: l("About me", "O mně"),
  aboutTitle: l("Twelve years of shipping. One with AI for the whole team.", "Dvanáct let dodávání. Jeden rok s AI pro celý tým."),
  aboutBio: l(
    "Web and mobile products from product design and architecture to production: TypeScript and React at the core, Node.js, Kotlin and Spring Boot when the back end needs a hand. I have led a mobile team, modernised a portfolio of about twenty applications and built greenfield monitoring for IoT data.",
    "Webové a mobilní produkty od produktového návrhu a architektury až po provoz: v jádru TypeScript a React, Node.js, Kotlin a Spring Boot, když je potřeba sáhnout na backend. Vedl jsem mobilní tým, modernizoval portfolio zhruba dvaceti aplikací a stavěl greenfield monitoring IoT dat.",
  ),
  aboutBio2: l(
    "The process the agents follow today is the one I worked in long before them. That is why I know which steps AI speeds up and which it does not, and why the speed-up below is an estimate, not a measurement.",
    "Proces, kterým se dnes řídí agenti, je ten, ve kterém jsem pracoval dávno před nimi. Proto vím, které kroky AI zrychlí a které ne, a proto je zrychlení níž odhad, ne měření.",
  ),
  photoAlt: l("Marek Rom, portrait", "Marek Rom, portrét"),
  badge: l("Prague or remote · available from January 2027", "Praha nebo remote · k dispozici od ledna 2027"),

  readEyebrow: l("Read on", "Čtěte dál"),
  teasers: [
    {
      page: "ai-delivery" as const,
      title: l("AI Delivery", "AI Delivery"),
      body: l(
        "How the system works: principle, flow, tooling, guardrails, enablement, planning and the offer.",
        "Jak systém funguje: princip, flow, nástroje, mantinely, enablement, plánování a nabídka.",
      ),
    },
    {
      page: "wins" as const,
      title: l("Wins & cases", "Výsledky a případy"),
      body: l(
        "What it delivered: measured results with their caveats, and cases in depth.",
        "Co to přineslo: měřené výsledky i s výhradami a případy do hloubky.",
      ),
    },
    {
      page: "journey" as const,
      title: l("Journey", "Cesta"),
      body: l("The whole career year by year, weighted to the last two.", "Celá kariéra rok po roce, s důrazem na poslední dva."),
    },
    {
      page: "cv" as const,
      title: l("CV", "Životopis"),
      body: l("Roles, skills and languages on one page, also as a PDF.", "Role, dovednosti a jazyky na jedné stránce, i jako PDF."),
    },
  ],
};
