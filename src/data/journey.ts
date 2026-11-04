import { l, type L10n } from "./l10n";

export type Milestone = {
  /** YYYY-MM */
  date: string;
  /** compact before 2024-01, expanded from it */
  weight: "compact" | "expanded";
  title: L10n;
  body: L10n;
};

// 2014–2023: names exactly as on the CV. 2024–2025: past clients may be named.
// 2026: anonymized — never the employer, the client or the client's industry.
// src: author's CV (PDF); research note 03, §4 (timeline); notes 01, 02, 04 for the 2026 facts.
export const JOURNEY: Milestone[] = [
  {
    date: "2014-08",
    weight: "compact",
    title: l("Web apps and CMS", "Webové aplikace a CMS"),
    body: l(
      "FutureTek Solutions: a Yii2 CMS for many customer projects, AngularJS interfaces, from concept to deployment.",
      "FutureTek Solutions: CMS na Yii2 pro řadu zákaznických projektů, rozhraní v AngularJS, od konceptu po nasazení.",
    ),
  },
  {
    date: "2016-06",
    weight: "compact",
    title: l("Production support for a UK bank", "Provozní podpora pro britskou banku"),
    body: l(
      "Diebold Nixdorf for Lloyds Banking Group: L2 support, incident analysis and operational reliability.",
      "Diebold Nixdorf pro Lloyds Banking Group: podpora L2, analýza incidentů a provozní spolehlivost.",
    ),
  },
  {
    date: "2017-03",
    weight: "compact",
    title: l("Set-top boxes and streaming", "Set-top boxy a streaming"),
    body: l(
      "nangu.TV: one platform on set-top boxes, web and mobile for TV operators such as O2 TV and Orange TV.",
      "nangu.TV: jedna platforma na set-top boxech, webu i mobilu pro TV operátory jako O2 TV a Orange TV.",
    ),
  },
  {
    date: "2019-11",
    weight: "compact",
    title: l("React Native, then team lead", "React Native, pak vedení týmu"),
    body: l(
      "Phrase: joined the mobile team as an engineer and took over its leadership a year later — roadmap, architecture, product workshops.",
      "Phrase: do mobilního týmu jsem nastoupil jako vývojář a po roce převzal jeho vedení – roadmapa, architektura, produktové workshopy.",
    ),
  },
  {
    date: "2023-03",
    weight: "compact",
    title: l("Architecture: a Web3 crowdfunding platform", "Architektura: crowdfundingová platforma na Web3"),
    body: l(
      "Valatron: storefront and admin in Next.js on top of .NET Core, Stripe, Polygon and Solidity contracts.",
      "Valatron: storefront a administrace v Next.js nad .NET Core, Stripe, Polygonem a kontrakty v Solidity.",
    ),
  },
  {
    date: "2023-09",
    weight: "compact",
    title: l("Architecture: IoT monitoring", "Architektura: IoT monitoring"),
    body: l(
      "Valatron for Veolia: real-time monitoring of smart buildings and factories, performance-tested with k6.",
      "Valatron pro Veolii: monitoring chytrých budov a továren v reálném čase, výkonnostně testovaný v k6.",
    ),
  },
  {
    date: "2024-04",
    weight: "expanded",
    title: l("Modernizing ~20 applications at a large Czech bank", "Modernizace ~20 aplikací ve velké české bance"),
    body: l(
      "At ApiTree for Česká spořitelna I led the modernization of a portfolio of about twenty applications: a new React and Kotlin architecture, less technical debt, better integration with other teams and DevOps. I delivered features end to end, Spring Boot services included, and mentored colleagues.",
      "V ApiTree pro Českou spořitelnu jsem vedl modernizaci portfolia zhruba dvaceti aplikací: nová architektura na Reactu a Kotlinu, menší technický dluh, lepší napojení na další týmy a DevOps. Funkce jsem dodával od začátku do konce včetně služeb ve Spring Bootu a mentoroval kolegy.",
    ),
  },
  {
    date: "2025-08",
    weight: "expanded",
    title: l("AI in delivery at a product company", "AI v dodávání v produktové firmě"),
    body: l(
      "In Gloat's React monorepo, Claude Code and Cursor became part of my daily delivery. I built agents and automation for development workflows and CI, and contributed to product design in Figma.",
      "V React monorepu Gloatu se Claude Code a Cursor staly součástí mé každodenní dodávky. Stavěl jsem agenty a automatizaci pro vývojové workflow a CI a podílel se na produktovém návrhu ve Figmě.",
    ),
  },
  {
    date: "2026-04",
    weight: "expanded",
    title: l("AI setup of a large product monorepo", "AI setup velkého produktového monorepa"),
    body: l(
      "Joined a fintech vendor as Product Engineering & AI Lead: a large product monorepo with several parallel release lines and a cross-functional team of developers, analysts and testers. The AI setup landed as one team-agreed change, built on two colleagues' proposals: one vendor-neutral instruction file for every agent tool, rules, skills and commands. A shared plugin marketplace followed at the end of the month.",
      "Nastoupil jsem jako Product Engineering & AI Lead do fintechové softwarové firmy: velké produktové monorepo s několika paralelními release liniemi a smíšený tým vývojářů, analytiků a testerů. AI setup přišel jako jedna změna dohodnutá v týmu, postavená na návrzích dvou kolegů: jeden soubor instrukcí nezávislý na dodavateli pro všechny agentní nástroje, pravidla, skilly a příkazy. Na konci měsíce přibyl sdílený marketplace pluginů.",
    ),
  },
  {
    date: "2026-05",
    weight: "expanded",
    title: l("Accessibility as a test system", "Přístupnost jako testovací systém"),
    body: l(
      "An external audit delivered 2,423 findings without selectors. Analysis showed 18 systemic patterns behind them, so the fixes went into shared components, tracked in a machine-readable manifest with a test pyramid whose final screen-reader check stays human. The build stack moved to Turborepo and React 19 the same month.",
      "Externí audit dodal 2 423 nálezů bez selektorů. Analýza za nimi našla 18 systémových vzorců, takže opravy šly do sdílených komponent. Stav drží strojově čitelný manifest a pyramida testů, jejíž poslední kontrola se čtečkou obrazovky zůstává na člověku. Týž měsíc build přešel na Turborepo a React 19.",
    ),
  },
  {
    date: "2026-06",
    weight: "expanded",
    title: l("Tooling modernization: Biome", "Modernizace nástrojů: Biome"),
    body: l(
      "ESLint and Prettier gave way to Biome across 2,110 files: 81 config files became one, missing rules were rebuilt as plugins and a script. The first orchestration pattern appeared too — subagents per failure bucket bringing a whole test suite to green or classified, with the main thread only coordinating.",
      "ESLint a Prettier nahradil Biome ve 2 110 souborech: z 81 konfigurací zbyla jedna, chybějící pravidla vznikla znovu jako pluginy a skript. Objevil se i první orchestrační vzor – subagenti po skupinách chyb dovedli celou testovou sadu do stavu „zelené, nebo klasifikované“ a hlavní vlákno jen koordinovalo.",
    ),
  },
  {
    date: "2026-07",
    weight: "expanded",
    title: l("Visual plans, kept local", "Vizuální plány, jen lokálně"),
    body: l(
      "Specs and design decisions moved into interactive visual plans that people annotate and agents read back — run strictly on my own machine, because project data must not go to a hosted service. The same month brought TypeScript 7, behavioural probes for the agent setup and a context diet that cut always-loaded instructions from 57.6 KB to 7 KB.",
      "Specifikace a návrhová rozhodnutí se přesunuly do interaktivních vizuálních plánů, které lidé komentují a agenti čtou zpět – výhradně na mém stroji, protože projektová data nesmí na hostovanou službu. Týž měsíc přinesl TypeScript 7, behaviorální sondy pro AI setup a dietu kontextu, která zmenšila trvale načtené instrukce z 57,6 kB na 7 kB.",
    ),
  },
  {
    date: "2026-08",
    weight: "expanded",
    title: l("The delivery flow becomes a contract", "Delivery flow se stává kontraktem"),
    body: l(
      "Five personal skills turned into a versioned delivery-flow contract in the shared marketplace: generic layer, client preset, repository procedures and a personal layer with closed extension points. A queryable context layer followed (an impact question went from 161 s to 58 s), and the first orchestrator swap, from cmux to Superset.",
      "Z pěti osobních skillů vznikl verzovaný kontrakt delivery flow ve sdíleném marketplace: generická vrstva, klientský preset, procedury repozitáře a osobní vrstva s uzavřeným seznamem bodů rozšíření. Následovala dotazovatelná kontextová vrstva (otázka po dopadu změny z 161 s na 58 s) a první výměna orchestrátoru, z cmux na Superset.",
    ),
  },
  {
    date: "2026-09",
    weight: "expanded",
    title: l("Superset → Paseo, and a two-machine fleet", "Superset → Paseo a flotila dvou strojů"),
    body: l(
      "The orchestrator changed again, to Paseo, and work spread over two machines with git-replicated state and per-ticket workspaces. Only the personal layer changed; the contract did not. Another developer adopted the same contract for a second client with only a new preset; the core stayed as it was. The contract also gained a grill gate: questions before code.",
      "Orchestrátor se vyměnil znovu, za Paseo, a práce se rozložila na dva stroje se stavem replikovaným přes git a samostatným workspacem pro každý tiket. Změnila se jen osobní vrstva, kontrakt ne. Jiný vývojář nasadil tentýž kontrakt u druhého klienta jen s novým presetem, jádro zůstalo beze změny. Kontrakt navíc získal „grill“ bránu: nejdřív otázky, pak kód.",
    ),
  },
  {
    date: "2026-10",
    weight: "expanded",
    title: l("Wayfinder maps and a symmetric fleet", "Mapy Wayfinder a symetrická flotila"),
    body: l(
      "Large features that were still unclear started as decision maps — 47 decision tickets across 4 maps, settled before the first line of code. The fleet became symmetric: either machine can orchestrate or execute, so work follows the person, not the hardware. The Tailwind migration of ~1,300 components finished.",
      "Velké a zatím nejasné featury začínají jako mapy rozhodnutí – 47 rozhodovacích tiketů ve 4 mapách, uzavřených před první řádkou kódu. Flotila se stala symetrickou: řídit i vykonávat umí kterýkoli stroj, takže práce jde za člověkem, ne za hardwarem. Skončila migrace ~1 300 komponent na Tailwind.",
    ),
  },
  {
    date: "2026-11",
    weight: "expanded",
    title: l("AI persona and the copy audit", "AI persona a audit textů"),
    body: l(
      "A vague “the tone feels inconsistent” became brand voice as code: a persona with rule IDs, a glossary, a deterministic checker and a tiered model pipeline with verification. Since October it has audited ~4,500 strings and proposed ~700 changes, nearly all with an in-context screenshot, for a human to approve. Without AI this would have stayed a style guide nobody enforces.",
      "Vágní „tón působí nejednotně“ se proměnil v hlas značky jako kód: persona s ID pravidel, slovník, deterministický checker a víceúrovňový pipeline modelů s ověřováním. Od října prověřil ~4 500 textů a navrhl ~700 změn, téměř všechny se snímkem v kontextu obrazovky, ke schválení člověkem. Bez AI by z toho zůstal jen stylistický manuál, který nikdo nevymáhá.",
    ),
  },
];
