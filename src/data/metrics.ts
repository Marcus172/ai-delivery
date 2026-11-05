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
    value: l("2,423 → 18", "2 423 → 18"),
    label: l(
      "accessibility audit findings traced to 18 systemic patterns, fixed in shared components",
      "nálezů auditu přístupnosti svedených na 18 systémových vzorců, opravovaných ve sdílených komponentách",
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
      "nodes in the product map testers plan from, generated from code; 51 % covered by end-to-end tests",
      "uzlů produktové mapy, ze které testeři plánují, generované z kódu; 51 % pokrývají end-to-end testy",
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
    value: l("1 → ~130", "1 → ~130"),
    label: l(
      "pages one fix in a shared component reaches; 18 of 27 criteria were failing on almost every page",
      "stránek, kam dosáhne jedna oprava ve sdílené komponentě; 18 z 27 kritérií padalo téměř na každé stránce",
    ),
    kind: "measured",
    period: A11Y,
  },

  // src: research note 01, §2.1
  {
    id: "a11y-criteria",
    value: l("18 / 21", "18 / 21"),
    label: l("systemic accessibility criteria done; the other 3 are blocked", "systémových kritérií přístupnosti hotovo; zbylá 3 jsou blokovaná"),
    kind: "measured",
    period: A11Y,
  },
  // src: research note 01, §2.1
  {
    id: "a11y-page-findings",
    value: l("182 / 212", "182 / 212"),
    label: l("page-level findings passing or done", "stránkových nálezů hotových nebo s procházejícím testem"),
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
    id: "story-coverage",
    value: l("44.5 % → 100 %", "44,5 % → 100 %"),
    label: l(
      "components covered by stories; the visual-regression harness was built before the migration started",
      "komponent pokrytých stories; harness pro vizuální regrese vznikl ještě před začátkem migrace",
    ),
    kind: "measured",
    period: l("repository · late July – early October 2026", "repozitář · konec července – začátek října 2026"),
    caveat: l(
      "Counted by adjacency (a story sits next to every component), not as a screenshot of each one.",
      "Počítáno podle sousedství (u každé komponenty leží story), ne jako snímek každé z nich.",
    ),
  },
  // src: research note 01, §2.2
  {
    id: "bundle-size",
    value: l("−10 KB", "−10 kB"),
    label: l("gzipped bundle size in each of three apps", "velikosti bundlu po gzipu v každé ze tří aplikací"),
    kind: "measured",
    period: l("build output · after the migration, October 2026", "výstup buildu · po migraci, říjen 2026"),
  },

  // src: research note 01, §2.2 (VRT-audited marker gate, 445 → 217)
  {
    id: "vrt-unread-stories",
    value: l("445 → 217", "445 → 217"),
    label: l(
      "story screenshots not yet read by a person; the gate lets this number only fall",
      "snímků stories, které ještě nečetl člověk; brána dovolí tomuto číslu jen klesat",
    ),
    kind: "measured",
    period: l("repository · August – October 2026", "repozitář · srpen – říjen 2026"),
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
export const RESULTS_METRIC_IDS = [
  "lead-time",
  "in-progress-to-pr",
  "returns-from-test",
  "prs-with-tests",
  "unit-spec-files",
  "stories",
  "structured-test-notes",
  "multi-line-delivery",
] as const;

/** The open caveats block of the Results chapter. */
export const RESULTS_CAVEAT_IDS = ["team-size", "author-pr-share", "tracker-scope"] as const;

const BY_ID = new Map(METRICS.map((m) => [m.id, m]));

export function metric(id: string): Metric {
  const m = BY_ID.get(id);
  if (!m) throw new Error(`unknown metric: ${id}`);
  return m;
}
