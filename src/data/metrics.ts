import { l, type L10n } from "./l10n";

export type { L10n } from "./l10n";

export type Metric = {
  id: string;
  value: L10n;
  label: L10n;
  kind: "measured" | "estimate";
  /** Source type and period or baseline. */
  period: L10n;
  caveat?: L10n;
};

/** One as-of date for the whole site; each metric additionally names its own period. */
export const AS_OF: L10n = l("as of November 2026", "stav k listopadu 2026");

// Shared periods. Cohorts: six months before the change vs the five months after it (April 2026 excluded as the transition month).
const TRACKER = l(
  "issue tracker · Oct 2025 – Mar 2026 vs May – Sep 2026",
  "data z issue trackeru · říjen 2025 – březen 2026 vs. květen – září 2026",
);
const PULL_REQUESTS = l(
  "pull requests · Oct 2025 – Mar 2026 vs May – Sep 2026",
  "pull requesty · říjen 2025 – březen 2026 vs. květen – září 2026",
);
const REPO_TESTS = l(
  "repository · 31 Mar 2026 vs 3 Oct 2026, end-to-end suites excluded",
  "repozitář · 31. března 2026 vs. 3. října 2026, bez end-to-end testů",
);
const A11Y = l(
  "external WCAG 2.1 AA audit · status as of November 2026",
  "externí audit WCAG 2.1 AA · stav k listopadu 2026",
);
const PERSONA = l(
  "first audit phase · October – early November 2026, about four weeks",
  "první fáze auditu · říjen – začátek listopadu 2026, zhruba čtyři týdny",
);

export const METRICS: Metric[] = [
  // ── Landing ────────────────────────────────────────────────────────────

  // src: research note 02, §5.2; tracker-metrics note, main table
  {
    id: "in-progress-to-pr",
    value: l("−70 %", "−70 %"),
    label: l(
      "from In Progress to pull request, median (2.3 → 0.7 days)",
      "od rozpracování po pull request, medián (2,3 → 0,7 dne)",
    ),
    kind: "measured",
    period: TRACKER,
    caveat: l(
      "Medium reliability, but sturdier than lead time: the pull-request status was set by hand in both periods.",
      "Střední spolehlivost, ale odolnější než lead time: stav pull requestu se v obou obdobích přepínal ručně.",
    ),
  },
  // src: research note 02, §5.2; PR-metrics note, summary #5
  {
    id: "prs-with-tests",
    value: l("1 % → 56 %", "1 % → 56 %"),
    label: l("product pull requests that add or change tests", "produktové pull requesty, které přidávají nebo mění testy"),
    kind: "measured",
    period: PULL_REQUESTS,
  },
  // src: research note 01, §2.1
  {
    id: "a11y-patterns",
    value: l("2,423 / 18", "2 423 / 18"),
    label: l(
      "audit findings / systemic patterns behind them, fixed in shared components",
      "nálezů auditu / systémových vzorců za nimi, opravených ve sdílených komponentách",
    ),
    kind: "measured",
    period: A11Y,
  },

  // ── Results: before / after ───────────────────────────────────────────

  // src: research note 02, §5.2; tracker-metrics note, main table + distortions
  {
    id: "lead-time",
    value: l("−57 %", "−57 %"),
    label: l(
      "lead time from In Progress to ready for test, median (2.8 → 1.2 days)",
      "lead time od rozpracování po předání do testu, medián (2,8 → 1,2 dne)",
    ),
    kind: "measured",
    period: TRACKER,
    caveat: l(
      "Medium reliability. Part of the drop is status discipline: after a merge the flow moves the ticket to ready-for-test automatically, a step that used to be manual and sometimes late.",
      "Střední spolehlivost. Část zkrácení je disciplína ve stavech: po merge flow sám přepne tiket do testu, což se dřív dělalo ručně a někdy se zpožděním.",
    ),
  },
  // src: research note 02, §5.2; tracker-metrics note, main table + distortions
  {
    id: "returns-from-test",
    value: l("21 % → 11 %", "21 % → 11 %"),
    label: l("tickets returned from testing within 30 days", "tikety vrácené z testu do 30 dnů"),
    kind: "measured",
    period: TRACKER,
    caveat: l(
      "Medium reliability. Same 30-day window in both periods; returns from later acceptance testing are not counted, and the most recent tickets may still collect some.",
      "Střední spolehlivost. Stejné 30denní okno v obou obdobích; pozdější vrácení z akceptačního testování se nepočítají a nejnovější tikety je ještě mohou dostat.",
    ),
  },
  // src: PR-metrics note, §7 (baseline 31 Mar 2026)
  {
    id: "unit-spec-files",
    value: l("16 → 348", "16 → 348"),
    label: l(
      "unit test files in the repository (155 → 1,869 test cases)",
      "souborů s unit testy v repozitáři (155 → 1 869 testových případů)",
    ),
    kind: "measured",
    period: REPO_TESTS,
  },
  // src: PR-metrics note, §7
  {
    id: "stories",
    value: l("138 → 464", "138 → 464"),
    label: l(
      "Storybook stories, the base of the visual regression tests",
      "Storybook stories, základ vizuálních regresních testů",
    ),
    kind: "measured",
    period: REPO_TESTS,
  },
  // src: research note 02, §5.2 and §4 (gate 5); tracker-metrics note, main table
  {
    id: "structured-test-notes",
    value: l("0 % → 31 %", "0 % → 31 %"),
    label: l(
      "tickets handed to testing with a structured note: environment, test plan, regression scope",
      "tiketů předaných do testu se strukturovanou poznámkou: prostředí, plán testu, rozsah regrese",
    ),
    kind: "measured",
    period: TRACKER,
    caveat: l(
      "Shows that the process is used, not how good the notes are; the flow drafts them and the developer approves.",
      "Ukazuje, že se proces používá, ne jak dobré poznámky jsou; návrh připraví flow a vývojář ho schválí.",
    ),
  },
  // src: research note 02, §5.2; tracker-metrics note, main table + distortions
  {
    id: "multi-line-delivery",
    value: l("12 % → 57 %", "12 % → 57 %"),
    label: l(
      "tickets delivered to three or more parallel release lines",
      "tiketů doručených na tři a více paralelních release linií",
    ),
    kind: "measured",
    period: TRACKER,
    caveat: l(
      "More release lines ran in parallel after the change, so part of the rise is structural. Porting did not get slower: the median time from the first to the last line stayed at zero days.",
      "Po změně běželo paralelně víc release linií, takže část nárůstu je daná strukturou. Portování se nezpomalilo: medián od první do poslední linie zůstal nula dní.",
    ),
  },
  // ── Results: caveats ──────────────────────────────────────────────────

  // src: PR-metrics note, §3 + distortion 2; tracker-metrics note, distortions
  {
    id: "team-size",
    value: l("4–6 → 2–3", "4–6 → 2–3"),
    label: l(
      "developers delivering the work, while monthly ticket volume held steady",
      "vývojářů, kteří práci dodávali, při stejném měsíčním objemu tiketů",
    ),
    kind: "measured",
    period: PULL_REQUESTS,
    caveat: l(
      "The same output from a smaller team is an efficiency argument. The data is not clean enough for a productivity percentage, and per-head figures are pulled up by one person.",
      "Stejný výkon menšího týmu je argument pro efektivitu. Na procento produktivity ale data čistá nejsou a čísla na hlavu táhne nahoru jeden člověk.",
    ),
  },
  // src: PR-metrics note, §1 (context line) + distortion 2; research note 01, §0
  {
    id: "author-pr-share",
    value: l("66 %", "66 %"),
    label: l(
      "share of merged pull requests authored by me after the change",
      "podíl zmergovaných pull requestů, které jsem po změně napsal já",
    ),
    kind: "measured",
    period: l("pull requests · May – Sep 2026", "pull requesty · květen – září 2026"),
    caveat: l(
      "My share of the work is high. I joined the project in April 2026, so there is no before figure for me.",
      "Můj podíl na práci je vysoký. Do projektu jsem nastoupil v dubnu 2026, takže moje číslo „před“ neexistuje.",
    ),
  },
  // src: tracker-metrics note, distortions
  {
    id: "tracker-scope",
    value: l("whole ticket", "celý tiket"),
    label: l(
      "scope of the tracker figures: the tracker does not separate front-end from back-end work",
      "rozsah čísel z trackeru: tracker neodděluje frontendovou a backendovou práci",
    ),
    kind: "measured",
    period: TRACKER,
    caveat: l(
      "Lead time and returns from test cover everything on a ticket, including back-end work outside this codebase.",
      "Lead time i vrácení z testu zahrnují vše na tiketu, včetně backendové práce mimo tento kód.",
    ),
  },

  // ── Guardrails and context ────────────────────────────────────────────

  // src: research note 01, §1.4 (measurement 1 of 2 — precomputed impact query)
  {
    id: "impact-query",
    value: l("161 s → 58 s", "161 s → 58 s"),
    label: l(
      "agent answering a change-impact question with a precomputed query instead of searching",
      "agent odpovídá na otázku po dopadu změny předpočítaným dotazem místo hledání",
    ),
    kind: "measured",
    period: l("three measurement rounds · August 2026", "tři kola měření · srpen 2026"),
    caveat: l(
      "A separate measurement from the subagent token saving. Run-to-run spread fell from 373 s to 14 s; an earlier gain I had claimed did not survive repeated rounds and was withdrawn.",
      "Samostatné měření, nezávislé na úspoře tokenů přes subagenta. Rozptyl mezi běhy klesl z 373 s na 14 s; dřívější zlepšení, které jsem ohlásil, opakované měření nepotvrdilo, a tak jsem ho stáhl.",
    ),
  },
  // src: research note 01, §1.4 (measurement 2 of 2 — subagent route)
  {
    id: "subagent-tokens",
    value: l("−89 %", "−89 %"),
    label: l(
      "tokens spent on exploring the repository when routed through a subagent (517k → 59k)",
      "tokenů na průzkum repozitáře při průchodu přes subagenta (517 tis. → 59 tis.)",
    ),
    kind: "measured",
    period: l("separate measurement · August 2026", "samostatné měření · srpen 2026"),
  },
  // src: research note 01, §1.4 (wrapper output 93.6 KB → ~1.5 KB)
  {
    id: "graph-output",
    value: l("94 KB → 1.5 KB", "94 kB → 1,5 kB"),
    label: l(
      "output of one code-graph query after shaping; reading the raw dump was what made graph-backed answers slow",
      "výstup jednoho dotazu do code grafu po zhuštění; právě čtení surového výpisu dělalo odpovědi z grafu pomalé",
    ),
    kind: "measured",
    period: l("repository tooling · August 2026", "nástroje repozitáře · srpen 2026"),
  },
  // src: research note 01, §1.2
  {
    id: "context-diet",
    value: l("57.6 KB → 7 KB", "57,6 kB → 7 kB"),
    label: l(
      "always-loaded agent instructions after the context diet",
      "trvale načtené instrukce pro agenta po dietě kontextu",
    ),
    kind: "measured",
    period: l("repository · July 2026", "repozitář · červenec 2026"),
    caveat: l(
      "Verified by behavioural probes, not by feel. It has since grown back to about 28 KB as release and tracker knowledge was added; the probes check that this knowledge stays reachable.",
      "Ověřeno behaviorálními sondami, ne pocitem. Od té doby kontext znovu narostl na zhruba 28 kB, protože přibyly znalosti o release liniích a trackeru; sondy hlídají, že zůstávají dosažitelné.",
    ),
  },
  // src: research note 01, §1.2 (growth table) and §1.3
  {
    id: "behavioural-probes",
    value: l("18 → 37", "18 → 37"),
    label: l(
      "behavioural probes that test the agent setup after every change to it",
      "behaviorálních sond, které po každé změně AI setupu otestují, co agent ví a umí",
    ),
    kind: "measured",
    period: l("repository · July → early November 2026", "repozitář · červenec → začátek listopadu 2026"),
  },
  // src: research note 01, §1.5; research note 02, §4 (gate 3)
  {
    id: "ci-gate-steps",
    value: l("0 → 23", "0 → 23"),
    label: l(
      "steps in the CI gate every change passes, with or without AI",
      "kroků CI brány, kterou projde každá změna, s AI i bez ní",
    ),
    kind: "measured",
    period: l("repository · April → early November 2026", "repozitář · duben → začátek listopadu 2026"),
  },

  // ── Delivery flow architecture ────────────────────────────────────────

  // src: research note 02, §1.1 (preset ~20 capabilities under shared names)
  {
    id: "preset-capabilities",
    value: l("~20", "~20"),
    label: l(
      "capabilities a client preset implements under names the contract defines",
      "capabilities, které klientský preset implementuje pod jmény danými kontraktem",
    ),
    kind: "measured",
    period: l("delivery-flow contract · October 2026", "kontrakt delivery flow · říjen 2026"),
  },
  // src: research note 02, §1.1 (5 repo procedures, cap 6)
  {
    id: "repo-procedures",
    value: l("5", "5"),
    label: l(
      "procedures a repository has to supply; the cap is six, a seventh would signal a wrong abstraction",
      "procedur, které musí dodat repozitář; strop je šest, sedmá by prozradila špatnou abstrakci",
    ),
    kind: "measured",
    period: l("delivery-flow contract · October 2026", "kontrakt delivery flow · říjen 2026"),
  },
  // src: research note 02, §1.1 and note 03, §2 (7 closed extension points)
  {
    id: "extension-points",
    value: l("7", "7"),
    label: l(
      "extension points in the personal layer, a closed list; tools live only there",
      "bodů rozšíření v osobní vrstvě, uzavřený seznam; nástroje žijí jen tam",
    ),
    kind: "measured",
    period: l("delivery-flow contract · October 2026", "kontrakt delivery flow · říjen 2026"),
  },

  // ── Enablement ────────────────────────────────────────────────────────

  // src: research note 02, §2.1 and §5.1
  {
    id: "marketplace-plugins",
    value: l("10", "10"),
    label: l(
      "plugins with 28 skills in the team's shared plugin marketplace",
      "pluginů s 28 skilly v týmovém marketplace pluginů",
    ),
    kind: "measured",
    period: l("plugin marketplace · April → early November 2026", "marketplace pluginů · duben → začátek listopadu 2026"),
  },
  // src: research note 02, §2.2 and §5.1
  {
    id: "marketplace-contributors",
    value: l("7 / 5", "7 / 5"),
    label: l(
      "people / roles contributing to the marketplace: developers, an analyst, a tester and the PM",
      "lidí / rolí, které do marketplace přispívají: vývojáři, analytik, tester i PM",
    ),
    kind: "measured",
    period: l("plugin marketplace · April → early November 2026", "marketplace pluginů · duben → začátek listopadu 2026"),
    caveat: l(
      "I wrote 55 % of the commits; the rest came from colleagues writing skills for their own roles.",
      "55 % commitů je mých; zbytek napsali kolegové, kteří si tvoří skilly pro vlastní roli.",
    ),
  },
  // src: research note 02, §3.4
  {
    id: "incident-triage",
    value: l("57", "57"),
    label: l(
      "real incidents used to calibrate the triage rules; about a fifth turned out not to be bugs",
      "skutečných incidentů, na kterých se kalibrovala pravidla triáže; zhruba pětina nebyla chyba",
    ),
    kind: "measured",
    period: l("second calibration round · 2026", "druhé kolo kalibrace · 2026"),
  },
  // src: research note 01, §3.1
  {
    id: "product-map-nodes",
    value: l("~720", "~720"),
    label: l(
      "nodes in the product map testers plan from, generated from code, each showing its end-to-end coverage",
      "uzlů produktové mapy, ze které testeři plánují, generované z kódu, každý s vlastním pokrytím end-to-end testy",
    ),
    kind: "measured",
    period: l("repository · early November 2026", "repozitář · začátek listopadu 2026"),
  },

  // ── Planning ──────────────────────────────────────────────────────────

  // src: research note 03, §3.1
  {
    id: "decision-maps",
    value: l("4 / 47", "4 / 47"),
    label: l(
      "decision maps / decision tickets for large features, settled before code",
      "map rozhodnutí / rozhodovacích tiketů pro velké featury, uzavřených před kódem",
    ),
    kind: "measured",
    period: l("decision maps · October 2026", "mapy rozhodnutí · říjen 2026"),
  },

  // ── Case: AI persona ──────────────────────────────────────────────────

  // src: research note 04, §11
  {
    id: "persona-strings",
    value: l("~4,500", "~4 500"),
    label: l("UI strings audited against the brand persona", "textů v UI prověřených proti personě značky"),
    kind: "measured",
    period: PERSONA,
  },
  // src: research note 04, §3 and §11
  {
    id: "persona-findings",
    value: l("~900 → ~700", "~900 → ~700"),
    label: l(
      "findings that survived independent model verification before any human saw them",
      "nálezů, které prošly nezávislým ověřením dalším modelem dřív, než je viděl člověk",
    ),
    kind: "measured",
    period: PERSONA,
  },
  // src: research note 04, §11
  {
    id: "persona-proposals",
    value: l("~700", "~700"),
    label: l(
      "proposed changes, each with a rule ID and nearly all with an in-context screenshot, for a human to approve",
      "navržených změn, každá s ID pravidla a téměř všechny se snímkem v kontextu obrazovky, ke schválení člověkem",
    ),
    kind: "measured",
    period: PERSONA,
  },

  // src: research note 04, §2 and §11 (17 base + 33 brand rules, 32 terms, 5 conflicts; rounded per NDA verdict)
  {
    id: "persona-rules",
    value: l("~50 / ~30 / 5", "~50 / ~30 / 5"),
    label: l(
      "rules with a stable id / glossary terms / recorded conflicts in the client's own rules, all versioned in git",
      "pravidel se stálým id / termínů slovníku / evidovaných rozporů v pravidlech klienta, vše verzované v gitu",
    ),
    kind: "measured",
    period: l("persona repository · October – early November 2026", "repozitář persony · říjen – začátek listopadu 2026"),
  },
  // src: research note 04, §4 and §11 (585 keys → 544 framed + 9 plain; ~10k tokens per key in the pilot)
  {
    id: "persona-screenshots",
    value: l("~95 %", "~95 %"),
    label: l(
      "of the strings that needed a screenshot got one in context, taken by browser agents; the rest carry a written reason",
      "textů, které potřebovaly snímek, ho dostalo v kontextu od agentů v prohlížeči; zbytek nese napsaný důvod",
    ),
    kind: "measured",
    period: PERSONA,
    caveat: l(
      "About ten thousand tokens per string in the pilot: three agents, seventy minutes, seventy-six strings.",
      "V pilotu zhruba deset tisíc tokenů na text: tři agenti, sedmdesát minut, sedmdesát šest textů.",
    ),
  },

  // ── Case: accessibility ───────────────────────────────────────────────

  // src: research note 01, §2.1 (18 of 27 criteria fail on 99 % of pages; one fix ≈ 130 pages)
  {
    id: "a11y-fix-reach",
    value: l("~130", "~130"),
    label: l(
      "pages a single fix in a shared component reaches; 18 of 27 criteria were failing on almost every page",
      "stránek, kam dosáhne jediná oprava ve sdílené komponentě; 18 z 27 kritérií padalo téměř na každé stránce",
    ),
    kind: "measured",
    period: A11Y,
  },

  // src: research note 01, §2.1
  {
    id: "a11y-specs",
    value: l("134 + 49", "134 + 49"),
    label: l(
      "component-level + end-to-end accessibility specs; the screen-reader check stays human",
      "komponentových + end-to-end testů přístupnosti; kontrola se čtečkou obrazovky zůstává na člověku",
    ),
    kind: "measured",
    period: A11Y,
  },

  // ── Case: styled-components → Tailwind ────────────────────────────────

  // src: research note 01, §2.2
  {
    id: "tailwind-components",
    value: l("~1,300", "~1 300"),
    label: l(
      "components migrated from CSS-in-JS to Tailwind in about ten weeks",
      "komponent převedených z CSS-in-JS na Tailwind za zhruba deset týdnů",
    ),
    kind: "measured",
    period: l("repository · late July – early October 2026", "repozitář · konec července – začátek října 2026"),
  },
  // src: research note 01, §2.2
  {
    id: "bundle-size",
    value: l("−10 KB", "−10 kB"),
    label: l("gzipped bundle size in each of three apps", "velikosti bundlu po gzipu v každé ze tří aplikací"),
    kind: "measured",
    period: l("build output · after the migration, October 2026", "výstup buildu · po migraci, říjen 2026"),
  },
  // src: migration docs, phase 1 (jsdom, 100 distinct prop combinations)
  {
    id: "runtime-style-rules",
    value: l("101 → 0", "101 → 0"),
    label: l(
      "style rules injected at runtime for 100 prop combinations of one layout primitive (24.6 KB of generated CSS); Tailwind injects none",
      "stylových pravidel vložených za běhu pro 100 kombinací props jednoho layoutového primitiva (24,6 kB generovaného CSS); Tailwind nevkládá žádné",
    ),
    kind: "measured",
    period: l("jsdom measurement · August 2026", "měření v jsdom · srpen 2026"),
  },
  // src: migration docs, phase 4 (dependency removal)
  {
    id: "packages-removed",
    value: l("27", "27"),
    label: l(
      "packages gone from the install with the old styling libraries (3.68 MiB)",
      "balíčků, které s původními stylovacími knihovnami zmizely z instalace (3,68 MiB)",
    ),
    kind: "measured",
    period: l("dependency manifest · October 2026", "manifest závislostí · říjen 2026"),
  },
  // src: migration docs, phase 4 (React types bump, the migration's done gate)
  {
    id: "react-types",
    value: l("18 → 19", "18 → 19"),
    label: l(
      "React type definitions, held back by the old library; all 74 packages typecheck clean on 19",
      "typové definice Reactu, které držela původní knihovna; všech 74 balíčků projde typovou kontrolou na verzi 19",
    ),
    kind: "measured",
    period: l("repository · October 2026", "repozitář · říjen 2026"),
  },
  // src: migration docs, phase 0.5 (determinism)
  {
    id: "vrt-flake",
    value: l("16 / 287 → 0 / 500", "16 / 287 → 0 / 500"),
    label: l(
      "flaky screenshot comparisons per run, before and after the determinism work",
      "nestabilních porovnání snímků na běh, před prací na determinismu a po ní",
    ),
    kind: "measured",
    period: l("VRT harness · July – August 2026", "VRT harness · červenec – srpen 2026"),
  },
  // src: migration docs, phase 1 (layout ~2,682 + typography 3,278 call sites)
  {
    id: "primitive-call-sites",
    value: l("~6,000", "~6 000"),
    label: l(
      "call sites of the layout and text primitives left untouched: the primitives kept their props and emit classes underneath",
      "míst volání layoutových a textových primitiv, na která se nesáhlo: primitiva si nechala props a pod nimi generují třídy",
    ),
    kind: "measured",
    period: l("repository · August 2026", "repozitář · srpen 2026"),
  },


  // ── Case: keeping the stack current (src: repo and backend history, upgrade tickets) ──

  // src: repository history, package manifests before the May 2026 upgrade vs. successor release dates
  {
    id: "stack-drift",
    value: l("6 years", "6 let"),
    label: l(
      "how long the oldest part of the stack, the package manager, had been superseded when the upgrade began; the GraphQL library was 4.5 years behind, Node.js a year past its end of life",
      "jak dlouho už měla nejstarší část stacku, správce balíčků, nástupce, když upgrade začal; knihovna GraphQL byla 4,5 roku pozadu, Node.js rok po konci podpory",
    ),
    kind: "measured",
    period: l("repository history · April 2020 → May 2026", "historie repozitáře · duben 2020 → květen 2026"),
  },
  {
    id: "stack-one-pr",
    value: l("231 files", "231 souborů"),
    label: l(
      "one pull request: Next.js 15.3 → 16.2, React 19.2, Node.js 18 → 24, Yarn 1 → 4, Storybook 8 → 10, Nx 22, React Compiler on",
      "jeden pull request: Next.js 15.3 → 16.2, React 19.2, Node.js 18 → 24, Yarn 1 → 4, Storybook 8 → 10, Nx 22, zapnutý React Compiler",
    ),
    kind: "measured",
    period: l("repository history · May 2026", "historie repozitáře · květen 2026"),
  },
  {
    id: "stack-java",
    value: l("5 days", "5 dní"),
    label: l(
      "from the first commit to the merge, with agents running through the weekend: the last backend group from Java 11 / Spring Boot 2.5 to Java 21 / Spring Boot 3.4; the ticket had estimated 35–50 person-days",
      "od prvního commitu po merge, s agenty běžícími i přes víkend: poslední skupina backendu z Javy 11 / Spring Bootu 2.5 na Javu 21 / Spring Boot 3.4; tiket ji odhadoval na 35–50 člověkodnů",
    ),
    kind: "measured",
    period: l("repository history · July 2026", "historie repozitáře · červenec 2026"),
  },
  {
    id: "stack-backend-tests",
    value: l("2,113 / 2,113", "2 113 / 2 113"),
    label: l(
      "backend tests green across about 90 modules after the move, matching the baseline taken before it",
      "zelených testů backendu v zhruba 90 modulech po přechodu, shodně s baseline změřenou před ním",
    ),
    kind: "measured",
    period: l("test run · July 2026", "běh testů · červenec 2026"),
  },
  {
    id: "stack-turbo",
    value: l("−21,000", "−21 000"),
    label: l(
      "lines removed by moving the build from Nx to Turborepo (+6.1k / −21.0k across 509 files)",
      "řádků odebraných přechodem buildu z Nx na Turborepo (+6,1 tis. / −21,0 tis. v 509 souborech)",
    ),
    kind: "measured",
    period: l("repository history · May 2026", "historie repozitáře · květen 2026"),
  },
  {
    id: "stack-image",
    value: l("2.33 GB → 979 MB", "2,33 GB → 979 MB"),
    label: l(
      "production container image of one app: 2,534 → 884 packages once the development toolchain stopped shipping",
      "produkční image kontejneru jedné aplikace: 2 534 → 884 balíčků, jakmile se přestala přibalovat vývojářská výbava",
    ),
    kind: "measured",
    period: l("container build · July 2026", "build kontejneru · červenec 2026"),
  },
  {
    id: "stack-port",
    value: l("37 / 37", "37 / 37"),
    label: l(
      "package edits that matched exactly once on every receiving release line in one upgrade wave",
      "úprav balíčků, které na každé přijímající release linii sedly právě jednou v jedné vlně upgradů",
    ),
    kind: "measured",
    period: l("port script · September 2026", "portovací skript · září 2026"),
  },
  {
    id: "stack-line-audit",
    value: l("55 → 1", "55 → 1"),
    label: l(
      "missing fixes reported by matching titles, against the real ones found by comparing content",
      "chybějících oprav hlášených podle názvů proti skutečným, nalezeným porovnáním obsahu",
    ),
    kind: "measured",
    period: l("release-line audit · July 2026", "audit release linií · červenec 2026"),
  },

  // ── Case: security as a system (src: security audit report and its tickets, code audit, dependency sweeps) ──

  {
    id: "sec-close",
    value: l("2 days", "2 dny"),
    label: l(
      "from the tickets to closing the critical and both high findings, out of 18 (1 critical, 2 high, 6 medium, 9 low)",
      "od tiketů po uzavření kritického a obou vysokých nálezů z 18 (1 kritický, 2 vysoké, 6 středních, 9 nízkých)",
    ),
    kind: "measured",
    period: l("security audit · June – July 2026", "bezpečnostní audit · červen – červenec 2026"),
  },
  {
    id: "sec-advisories",
    value: l("5 → 0", "5 → 0"),
    label: l(
      "critical advisories in the dependency audit; high 68 → 0, all advisories 167 → 47",
      "kritických nálezů v auditu závislostí; vysoké 68 → 0, všechny nálezy 167 → 47",
    ),
    kind: "measured",
    period: l("dependency audit · August – September 2026", "audit závislostí · srpen – září 2026"),
  },
  {
    id: "sec-code",
    value: l("~250k", "~250 tis."),
    label: l(
      "lines of production code read by eight review agents in parallel, one per area; every critical finding verified by a person",
      "řádků produkčního kódu, které paralelně přečetlo osm review agentů, jeden na oblast; každý kritický nález ověřil člověk",
    ),
    kind: "measured",
    period: l("code audit · July 2026", "audit kódu · červenec 2026"),
  },
  {
    id: "sec-drift",
    value: l("7", "7"),
    label: l(
      "security fixes found sitting in lockfile drift on the script's first run, one of them high severity",
      "bezpečnostních oprav, které při prvním běhu skriptu ležely v driftu lockfilu, jedna z nich vysoké závažnosti",
    ),
    kind: "measured",
    period: l("dependency sweep · August 2026", "úklid závislostí · srpen 2026"),
  },

  // ── Along the way: smaller wins (src: repo history, docs, tracker and the plugin marketplace; see the along-the-way data) ──

  {
    id: "atw-package-tests",
    value: l("75", "75"),
    label: l(
      "packages whose own test command started working",
      "balíčků, jejichž vlastní testovací příkaz začal fungovat",
    ),
    kind: "measured",
    period: l("git history · August – October 2026", "historie gitu · srpen – říjen 2026"),
  },
  {
    id: "atw-parity",
    value: l("0 diffs", "0 rozdílů"),
    label: l(
      "between the old repository and the new apps across 33 parity scenarios; a negative control does report one",
      "mezi původním repozitářem a novými aplikacemi ve 33 scénářích shody; negativní kontrola rozdíl hlásí",
    ),
    kind: "measured",
    period: l("parity run · October 2026", "běh shody · říjen 2026"),
  },
  {
    id: "atw-i18n-keys",
    value: l("275", "275"),
    label: l(
      "unused translation keys removed after static and manual checks",
      "nepoužívaných překladových klíčů odstraněných po statické a ruční kontrole",
    ),
    kind: "measured",
    period: l("git history · October 2026", "historie gitu · říjen 2026"),
  },
  {
    id: "atw-handover",
    value: l("~208 + 48", "~208 + 48"),
    label: l(
      "manual scenarios and screenshots in the testing handover of one feature area",
      "ručních scénářů a snímků v předávce testingu jedné oblasti produktu",
    ),
    kind: "measured",
    period: l("handover document · October 2026", "předávací dokument · říjen 2026"),
  },
  {
    id: "atw-nightly",
    value: l("0", "0"),
    label: l(
      "application bugs among the nightly failures in the first full sort; all were test data, outdated tests, flakes or infrastructure",
      "chyb aplikace mezi nočními selháními při prvním úplném roztřídění; všechno byla testovací data, zastaralé testy, nestabilní běhy nebo infrastruktura",
    ),
    kind: "measured",
    period: l("nightly runs · July 2026", "noční běhy · červenec 2026"),
  },
  {
    id: "atw-mocks",
    value: l("3", "3"),
    label: l(
      "endpoints with no mock, found in one feature area on the first run",
      "endpointy bez mocku, nalezené v jedné oblasti produktu při prvním běhu",
    ),
    kind: "measured",
    period: l("mock audit · June 2026", "audit mocků · červen 2026"),
  },
  {
    id: "atw-reviews",
    value: l("153", "153"),
    label: l(
      "pull request reviews: 106 self-reviews of drafts and 47 as a reviewer",
      "review pull requestů: 106 vlastních review draftů a 47 jako reviewer",
    ),
    kind: "measured",
    period: l("review ledger · July – November 2026", "záznam review · červenec – listopad 2026"),
  },

  // ── Estimate ──────────────────────────────────────────────────────────

  // src: research note 04, §9 (author's own words, explicitly not measured)
  {
    id: "five-to-ten-x",
    value: l("5–10×", "5–10×"),
    label: l("faster delivery with AI, same process", "rychlejší dodávání s AI při stejném procesu"),
    kind: "estimate",
    period: l("personal estimate, 2026", "osobní odhad, 2026"),
    caveat: l(
      "Not measured. The measured team figures are reported separately.",
      "Neměřeno. Měřená čísla týmu jsou uvedená zvlášť.",
    ),
  },
];

export const LANDING_METRIC_IDS = ["in-progress-to-pr", "prs-with-tests", "a11y-patterns"] as const;

/** Before/after set for the Results chapter, in display order. */
export type ResultsGroup = { id: string; title: L10n; note: L10n; metrics: readonly string[] };

/** The measured before/after set on Wins & cases, grouped and ordered from the sturdiest figure down. */
export const RESULTS_GROUPS: readonly ResultsGroup[] = [
  {
    id: "speed",
    title: l("Speed", "Rychlost"),
    note: l(
      "The time from In Progress to pull request is the sturdiest figure here; lead time is partly status discipline.",
      "Doba od rozpracování po pull request je tu nejodolnější; lead time je zčásti disciplína ve stavech.",
    ),
    metrics: ["in-progress-to-pr", "lead-time"],
  },
  {
    id: "quality",
    title: l("Quality and tests", "Kvalita a testy"),
    note: l(
      "The share of tickets returned from testing is the quality signal; the other three count the tests that came with the work.",
      "Signál o kvalitě je podíl tiketů vrácených z testu; zbylá tři čísla počítají testy, které s prací přibyly.",
    ),
    metrics: ["returns-from-test", "prs-with-tests", "unit-spec-files", "stories"],
  },
  {
    id: "process",
    title: l("Process", "Proces"),
    note: l(
      "Process measures, not quality measures: structured test notes show that the handover format is used, and multi-line delivery rose partly because more release lines ran in parallel.",
      "Čísla o procesu, ne o kvalitě: strukturované poznámky pro testery ukazují, že se formát předání používá, a doručení na víc linií vzrostlo zčásti proto, že paralelně běželo víc release linií.",
    ),
    metrics: ["structured-test-notes", "multi-line-delivery"],
  },
];

export const RESULTS_METRIC_IDS: readonly string[] = RESULTS_GROUPS.flatMap((g) => g.metrics);

/** The open caveats block of the Results chapter. */
export const RESULTS_CAVEAT_IDS = ["team-size", "author-pr-share", "tracker-scope"] as const;

const BY_ID = new Map(METRICS.map((m) => [m.id, m]));

export function metric(id: string): Metric {
  const m = BY_ID.get(id);
  if (!m) throw new Error(`unknown metric: ${id}`);
  return m;
}
