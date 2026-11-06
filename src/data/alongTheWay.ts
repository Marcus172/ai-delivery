/**
 * "Along the way": the smaller wins beyond the three cases, grouped by area and placed on a month axis.
 * Platform upgrades and security have their own cases; client analyses stay off the site.
 * Every figure is a metric id (see `metrics.ts`), so it carries its measured/estimate label and period.
 * Sources: the product repo's history and docs, the vendor's wiki and tracker, and the team's plugin marketplace;
 * all anonymized, and only finished work (the site presents the solution, not its progress).
 */
import { l, type L10n } from "./l10n";

export type AreaId = "delivery" | "testing" | "tooling";
export type Role = "agent" | "script" | "person";

export interface Area {
  id: AreaId;
  title: L10n;
  note: L10n;
}

export interface Win {
  id: string;
  area: AreaId;
  /** Month index on the axis (0 = May 2026), inclusive. */
  from: number;
  to: number;
  title: L10n;
  /** A few words for the map. */
  short: L10n;
  text: L10n;
  metric?: string;
  who: Role[];
}

/** The axis runs May – November 2026. */
export const MONTHS: L10n[] = [
  l("May", "kvě"),
  l("Jun", "čvn"),
  l("Jul", "čvc"),
  l("Aug", "srp"),
  l("Sep", "zář"),
  l("Oct", "říj"),
  l("Nov", "lis"),
];
export const YEAR = "2026";

const MONTH_NAMES: L10n[] = [
  l("May", "květen"),
  l("June", "červen"),
  l("July", "červenec"),
  l("August", "srpen"),
  l("September", "září"),
  l("October", "říjen"),
  l("November", "listopad"),
];

/** "May 2026" or "July – September 2026". */
export function winPeriod(w: Win, locale: "en" | "cs"): string {
  const a = MONTH_NAMES[w.from][locale];
  const b = MONTH_NAMES[w.to][locale];
  return w.from === w.to ? `${a} ${YEAR}` : `${a} – ${b} ${YEAR}`;
}

export const AREAS: Area[] = [
  {
    id: "delivery",
    title: l("CI/CD, build and the monorepo", "CI/CD, build a monorepo"),
    note: l(
      "Pipelines that deploy the right thing to the right place, one repository instead of two, and translations that cannot ship stale.",
      "Pipeliny, které nasadí správnou věc na správné místo, jeden repozitář místo dvou a překlady, které nemůžou odejít zastaralé.",
    ),
  },
  {
    id: "testing",
    title: l("Testing and handover", "Testování a předávky"),
    note: l(
      "Tests that tell the truth, and handovers a tester can work from without asking.",
      "Testy, které říkají pravdu, a předávky, podle kterých tester pracuje bez doptávání.",
    ),
  },
  {
    id: "tooling",
    title: l("Everyday tooling", "Nástroje na každý den"),
    note: l(
      "Small automations the team uses daily, each with a clear line it never crosses.",
      "Drobné automatizace, které tým používá denně, každá s jasnou hranicí, kterou nepřekročí.",
    ),
  },
];

export const WINS: Win[] = [


  // ── CI/CD and build ───────────────────────────────────────────────────
  {
    id: "pipelines",
    area: "delivery",
    from: 0,
    to: 5,
    title: l("Deploys per environment, releases from the right tag", "Nasazení po prostředích, release ze správného tagu"),
    short: l("pipelines rebuilt", "přestavěné pipeliny"),
    text: l(
      "Deploys moved from one branch pushed everywhere by a nightly timer to one pipeline per environment, all fed by one webhook; mapping an environment to a branch is a one-line edit. An ad-hoc pipeline builds any ref to any test environment, and three lint stages became one run that reports every error. Two release bugs were closed on the way: production images had been built from the main branch instead of the release tag, and a commit with two tags had stamped a release with the wrong version.",
      "Nasazení přešlo z jedné větve, kterou noční časovač posílal všude, na jednu pipelinu pro každé prostředí, všechny napájené jedním webhookem; přiřadit prostředí větev je úprava jednoho řádku. Ad-hoc pipelina sestaví libovolný ref do libovolného testovacího prostředí a tři lintové fáze se spojily do jednoho běhu, který nahlásí všechny chyby. Cestou se zavřely dvě chyby v releasech: produkční image se stavěly z hlavní větve místo z tagu releasu a commit se dvěma tagy jednou označil release špatnou verzí.",
    ),
    who: ["agent", "person"],
  },
  {
    id: "package-tests",
    area: "delivery",
    from: 3,
    to: 5,
    title: l("Package test commands that had never run", "Testovací příkazy balíčků, které nikdy nefungovaly"),
    short: l("per-package tests fixed", "testy po balíčcích opravené"),
    text: l(
      "The per-package test command had never worked in any package that declared one. The binary resolution was fixed, spec files got their own type-check gate, and React Compiler now runs in Jest and Storybook just as it does in the apps, so tests see the code users get.",
      "Testovací příkaz po balíčcích nikdy nefungoval v žádném balíčku, který ho deklaroval. Opravilo se dohledání binárek, testy dostaly vlastní typovou kontrolu a React Compiler teď běží v Jestu i Storybooku stejně jako v aplikacích, takže testy vidí kód, který dostanou uživatelé.",
    ),
    metric: "atw-package-tests",
    who: ["agent", "person"],
  },

  {
    id: "service-merge",
    area: "delivery",
    from: 2,
    to: 5,
    title: l("A restarting service, reproduced and brought home", "Restartující služba, zreprodukovaná a přestěhovaná domů"),
    short: l("service into the monorepo", "služba do monorepa"),
    text: l(
      "A real-time subscription service kept restarting in the client's environment, where nobody could debug. Three levels of tests were built from scratch: integration tests in CI, a capacity harness, and a load script that replays the traffic pattern from the client's logs, with a ramp-up and a load estimate printed before every run. When a fix failed to reach newer release lines because the service lived in its own repository, the service moved into the monorepo, hardened on the way and proven equivalent by a side-by-side parity run.",
      "Real-time služba pro odběry se v prostředí klienta opakovaně restartovala a ladit se tam nedalo. Od nuly vznikly tři úrovně testů: integrační testy v CI, harness na kapacitu a zátěžový skript, který přehrává vzorec provozu z logů klienta, s postupným náběhem a odhadem zátěže vypsaným před každým během. Když se oprava nedostala na novější release linie, protože služba žila ve vlastním repozitáři, služba se přestěhovala do monorepa, cestou se zabezpečila a běh shody vedle sebe prokázal, že se chová stejně.",
    ),
    metric: "atw-parity",
    who: ["agent", "script", "person"],
  },
  {
    id: "translations",
    area: "delivery",
    from: 1,
    to: 5,
    title: l("Translations that cannot ship stale", "Překlady, které nemůžou odejít zastaralé"),
    short: l("translation gate and sync", "brána a sync překladů"),
    text: l(
      "A release once shipped a translation the source had already deleted. A build gate now compares the compiled translations with the source, two-way sync with the translation platform runs nightly and opens a draft pull request for a person to review, and repeated failures escalate instead of piling up.",
      "Release jednou odešel s překladem, který zdroj už smazal. Brána v buildu teď porovnává zkompilované překlady se zdrojem, obousměrná synchronizace s překladovou platformou běží každou noc a otevírá draft pull request ke kontrole člověkem a opakovaná selhání se eskalují, místo aby se hromadila.",
    ),
    metric: "atw-i18n-keys",
    who: ["script", "person"],
  },

  // ── Testing and handover ──────────────────────────────────────────────
  {
    id: "handover",
    area: "testing",
    from: 1,
    to: 5,
    title: l("Handovers to testing, with examples", "Předávky testingu s příklady"),
    short: l("testing handovers", "předávky testingu"),
    text: l(
      "Every fix goes to testing with a step-by-step plan, the scope of regression and a plain-language summary for the client. An intermittent bug comes with how many repeats prove anything: it showed about once in ten runs, so repeat it at least ten times. A larger feature gets a four-part document: what to test and what not to report, the developer's own results, the technical reference and a demo script, with screenshots as the test cases.",
      "Každá oprava jde do testingu s plánem krok za krokem, rozsahem regrese a srozumitelným shrnutím pro klienta. Občasná chyba přijde s tím, kolik opakování něco dokazuje: objevila se zhruba jednou z deseti běhů, takže aspoň deset opakování. Větší feature dostane dokument o čtyřech částech: co testovat a co nehlásit, výsledky vývojáře, technickou referenci a scénář dema, se snímky obrazovky jako testovacími případy.",
    ),
    metric: "atw-handover",
    who: ["agent", "person"],
  },
  {
    id: "nightly",
    area: "testing",
    from: 0,
    to: 2,
    title: l("End-to-end tests back, nightly failures sorted", "End-to-end testy zpátky, noční selhání roztříděná"),
    short: l("e2e suite and nightly triage", "e2e sada a noční triáž"),
    text: l(
      "The end-to-end suite had drifted behind the product; it was brought back, with each of 81 spec files isolated per test. Then every nightly failure was sorted into test data, an outdated test, a flaky run or infrastructure, against a ledger of known flaky patterns. The sort also showed that the job turned red even when every test passed, because a mail step was broken.",
      "End-to-end sada zaostala za produktem; vrátila se zpátky a každý z 81 souborů testů má izolaci po jednotlivých testech. Pak se každé noční selhání roztřídilo na testovací data, zastaralý test, nestabilní běh nebo infrastrukturu, proti záznamu známých nestabilních vzorců. Třídění zároveň ukázalo, že job zčervenal, i když všechny testy prošly, protože byl rozbitý krok s e-mailem.",
    ),
    metric: "atw-nightly",
    who: ["agent", "person"],
  },
  {
    id: "mock-audit",
    area: "testing",
    from: 1,
    to: 2,
    title: l("Mocks checked against the live backend", "Mocky ověřené proti živému backendu"),
    short: l("mock audit", "audit mocků"),
    text: l(
      "A browser drives the same feature against the live backend and against the mock server, then reports what is stale or not mocked at all. It runs on its own ports, so it never touches a developer's running server, returns data shapes only, never raw bodies or personal data, and patches a mock only on request.",
      "Prohlížeč projde stejnou funkci proti živému backendu a proti mock serveru a nahlásí, co je zastaralé nebo vůbec nemockované. Běží na vlastních portech, takže nikdy nesáhne na vývojářův běžící server, vrací jen tvary dat, nikdy surová těla ani osobní údaje, a mock opraví jen na vyžádání.",
    ),
    metric: "atw-mocks",
    who: ["agent", "person"],
  },


  // ── Everyday tooling ──────────────────────────────────────────────────
  {
    id: "pr-review",
    area: "tooling",
    from: 2,
    to: 6,
    title: l("AI review that never approves", "AI review, které nikdy neschvaluje"),
    short: l("pull request review", "review pull requestů"),
    text: l(
      "A review posts at most about ten high-confidence comments and a summary, the way a senior developer would. It never approves, declines or merges, and when a posted comment silently takes a pull request out of draft, it puts it back.",
      "Review zveřejní nejvýš zhruba deset komentářů s vysokou jistotou a shrnutí, tak jak by to udělal senior vývojář. Nikdy neschvaluje, nezamítá ani nemerguje, a když zveřejněný komentář potichu vytáhne pull request z draftu, vrátí ho zpátky.",
    ),
    metric: "atw-reviews",
    who: ["agent", "person"],
  },
  {
    id: "request-logs",
    area: "tooling",
    from: 0,
    to: 0,
    title: l("From a browser request to the server's log lines", "Od požadavku z prohlížeče k řádkům v logu serveru"),
    short: l("request to logs", "požadavek → logy"),
    text: l(
      "Paste a captured request or a network trace; the skill maps it to the right cluster, namespace and service, then pulls the server's log lines by the request's correlation id. Read-only, with the developer's own access.",
      "Vložíte zachycený požadavek nebo síťový záznam; skill ho přiřadí ke správnému clusteru, namespace a službě a stáhne řádky logu serveru podle correlation id požadavku. Jen pro čtení, s vlastním přístupem vývojáře.",
    ),
    who: ["agent", "script"],
  },
  {
    id: "client-comments",
    area: "tooling",
    from: 1,
    to: 3,
    title: l("Comments the client reads, and comments only the team sees", "Komentáře pro klienta a komentáře jen pro tým"),
    short: l("comment visibility", "viditelnost komentářů"),
    text: l(
      "The tracker's built-in tool could not restrict who sees a comment, so a small command-line tool that can was built and contributed company-wide. A separate rule defines the one comment the client reads: one message, no code references, no links to pull requests.",
      "Vestavěný nástroj trackeru neuměl omezit, kdo komentář uvidí, takže vznikl malý nástroj pro příkazovou řádku, který to umí, a přispěl se pro celou firmu. Samostatné pravidlo určuje jediný komentář, který čte klient: jedna zpráva, žádné odkazy do kódu ani na pull requesty.",
    ),
    who: ["script", "person"],
  },
  {
    id: "onboarding",
    area: "tooling",
    from: 1,
    to: 1,
    title: l("Claude Code for analysts and the project manager", "Claude Code pro analytiky a projektového manažera"),
    short: l("onboarding non-developers", "onboarding mimo vývoj"),
    text: l(
      "Step-by-step setup guides for macOS and Windows let analysts and the project manager read the source code and pull tickets and wiki pages through Claude Code, with a recommended plugin for writing specifications.",
      "Návody krok za krokem pro macOS i Windows umožnily analytikům a projektovému manažerovi číst zdrojový kód a stahovat tikety a stránky wiki přes Claude Code, s doporučeným pluginem na psaní zadání.",
    ),
    who: ["person"],
  },
];

/** The wins of one area in time order: by start, then by end. Cards and the map number them this way. */
export function winsIn(area: AreaId): Win[] {
  return WINS.filter((w) => w.area === area).sort((a, b) => a.from - b.from || a.to - b.to);
}
