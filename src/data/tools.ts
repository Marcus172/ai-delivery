/**
 * External tools the site names, with their official link. One registry for the whole site: prose is
 * linked automatically (rendered MDX through `linkToolsInHtml` in `Prose`, data strings through
 * `<Linked>`), diagrams and the Sources page read from here. `match` covers the forms the copy uses,
 * Czech inflections included.
 * Order matters: a longer phrase is listed before a shorter tool name it contains.
 */
import { l, type L10n } from "./l10n";

/** Where a tool sits on the Sources page; tools without a group are only linked in the text (history). */
export type ToolGroup = "agents" | "skills" | "workspaces" | "planning" | "context" | "fleet" | "quality" | "site";

export type Tool = {
  id: string;
  name: string;
  url: string;
  match: RegExp;
  group?: ToolGroup;
  /** What the tool does in my flow, one sentence for the Sources page. */
  what?: L10n;
  /** Documentation, when it lives somewhere else than `url`. */
  docs?: string;
  /** A video where the author shows how the tool is used. */
  video?: string;
  /**
   * Linked in the text only and deliberately left off the Sources page: past tools and the
   * application stack (React, Next.js and the like). Every tool has either this or a `group`.
   */
  textOnly?: true;
  /** Name on the Sources page, when it differs from the name used in the text. */
  label?: L10n;
};

export const TOOLS: Tool[] = [
  {
    id: "plugin-marketplace",
    name: "Claude Code plugin marketplace",
    url: "https://code.claude.com/docs/en/plugin-marketplaces",
    match: /Claude(?: Code)? plugin marketplace|marketplace pluginů pro Claude(?: Code)?/,
    group: "skills",
    what: l(
      "How the team's plugins and skills reach every machine and every role.",
      "Jak se týmové pluginy a skilly dostanou na každý stroj a ke každé roli.",
    ),
  },
  {
    id: "claude-code",
    name: "Claude Code",
    url: "https://www.claude.com/product/claude-code",
    match: /Claude Code/,
    group: "agents",
    what: l(
      "The agent the flow is built on: it reads, plans, writes the code and the tests, and runs the gates.",
      "Agent, na kterém flow stojí: čte, plánuje, píše kód a testy a pouští brány.",
    ),
    docs: "https://code.claude.com/docs",
  },
  {
    id: "codex",
    name: "Codex",
    url: "https://openai.com/codex/",
    match: /\bCodex\b/,
    group: "agents",
    what: l(
      "A second agent on the same repository and the same skills, with no change to the repository.",
      "Druhý agent nad stejným repozitářem a stejnými skilly, bez jediné změny v repozitáři.",
    ),
    docs: "https://developers.openai.com/codex",
  },
  {
    id: "opencode",
    name: "OpenCode",
    url: "https://opencode.ai/",
    match: /\bOpenCode\b/,
    textOnly: true,
  },
  {
    id: "pi",
    name: "Pi",
    url: "https://pi.dev/",
    match: /(?<=OpenCode (?:or|nebo) )Pi\b/,
    textOnly: true,
  },
  {
    id: "oh-my-pi",
    name: "Oh My Pi",
    url: "https://omp.sh/",
    match: /\bOh My Pi\b/,
    group: "agents",
    what: l(
      "A feature-rich fork of the minimal Pi coding agent: subagents, language-server integration, a debugger.",
      "Bohatší fork minimalistického agenta Pi: subagenti, napojení na language server, debugger.",
    ),
    docs: "https://github.com/can1357/oh-my-pi",
  },
  { id: "cursor", name: "Cursor", url: "https://cursor.com/", match: /\bCursor\b/, textOnly: true },
  {
    id: "paseo",
    name: "Paseo",
    url: "https://paseo.sh/",
    match: /\bPase(?:o|u|em|a)\b/,
    group: "workspaces",
    what: l(
      "My orchestrator: a daemon per machine, an end-to-end encrypted relay, a command line for everything and a mobile app.",
      "Můj orchestrátor: daemon na každém stroji, end-to-end šifrovaný relay, příkazová řádka na všechno a mobilní aplikace.",
    ),
    docs: "https://paseo.sh/docs",
  },
  {
    id: "worktrunk",
    name: "worktrunk",
    url: "https://worktrunk.dev/",
    match: /\bworktrunk(?:u|em|a)?\b/,
    group: "workspaces",
    what: l(
      "The team default: a git worktree per ticket with hooks that provision it.",
      "Týmový default: git worktree na tiket s hooky, které ho připraví.",
    ),
  },
  {
    id: "superset",
    name: "Superset",
    url: "https://superset.sh/",
    match: /\bSuperset(?:u|em)?\b/,
    group: "workspaces",
    what: l(
      "An earlier orchestrator, swapped out without a change to the flow.",
      "Dřívější orchestrátor, vyměněný bez změny flow.",
    ),
  },
  {
    id: "cmux",
    name: "cmux",
    url: "https://cmux.com/",
    match: /\bcmux\b/,
    group: "workspaces",
    what: l(
      "The first terminal I ran parallel agents in.",
      "První terminál, ve kterém jsem pouštěl paralelní agenty.",
    ),
    docs: "https://cmux.com/docs",
  },
  {
    id: "agent-native",
    name: "Agent-Native",
    url: "https://www.agent-native.com/",
    match: /\bAgent-Native\b/,
    group: "planning",
    what: l(
      "Visual plans and recaps: a spec or a finished change as an interactive page a person reviews.",
      "Vizuální plány a recapy: spec nebo hotová změna jako interaktivní stránka, kterou člověk reviduje.",
    ),
    docs: "https://www.agent-native.com/docs",
  },
  {
    id: "mattpocock-skills",
    name: "Matt Pocock's skills",
    label: l("Matt Pocock's skills", "Skilly Matta Pococka"),
    url: "https://github.com/mattpocock/skills",
    match: /Matt Pocock's skills/,
    group: "skills",
    what: l(
      "An open set of engineering skills; I use grilling before implementation and Wayfinder for large, unclear work.",
      "Otevřená sada inženýrských skillů; používám grilování před implementací a Wayfinder pro velkou nejasnou práci.",
    ),
  },
  {
    id: "wayfinder",
    name: "Wayfinder",
    url: "https://github.com/mattpocock/skills/tree/main/skills/engineering/wayfinder",
    match: /\bWayfinder\b/,
    group: "planning",
    what: l(
      "Matt Pocock's skill for work bigger than one session: a shared map of decision tickets, resolved one at a time before any code.",
      "Skill Matta Pococka pro práci větší než jedna session: sdílená mapa rozhodovacích tiketů, které se uzavírají jeden po druhém dřív, než vznikne kód.",
    ),
    docs: "https://github.com/mattpocock/skills/blob/main/docs/engineering/wayfinder.md",
    video: "https://www.youtube.com/watch?v=F3lL98Pj90o",
  },
  {
    id: "codegraph",
    name: "CodeGraph",
    url: "https://github.com/colbymchenry/codegraph",
    match: /\bCodeGraph\b/,
    group: "context",
    what: l(
      "A local code graph the agent queries instead of searching the repository; nothing leaves the machine.",
      "Lokální graf kódu, kterého se agent ptá místo prohledávání repozitáře; nic neopustí stroj.",
    ),
  },
  {
    id: "chezmoi",
    name: "chezmoi",
    url: "https://www.chezmoi.io/",
    match: /\bchezmoi\b/,
    group: "fleet",
    what: l(
      "The configuration profile every machine pulls: shell, personal layer, agent settings, hooks, services.",
      "Konfigurační profil, který si stáhne každý stroj: shell, osobní vrstva, nastavení agentů, hooky, služby.",
    ),
    docs: "https://www.chezmoi.io/user-guide/command-overview/",
  },
  {
    id: "tailscale",
    name: "Tailscale",
    url: "https://tailscale.com/",
    match: /\bTailscale\b/,
    group: "fleet",
    what: l(
      "The private network between the machines of the fleet.",
      "Privátní síť mezi stroji flotily.",
    ),
    docs: "https://tailscale.com/kb",
  },
  {
    id: "age",
    name: "age",
    url: "https://age-encryption.org/",
    match: /(?<=encrypted with |šifrovaná přes )age\b/,
    group: "fleet",
    what: l(
      "Encrypts the secrets inside that profile.",
      "Šifruje tajemství uvnitř toho profilu.",
    ),
  },
  {
    id: "git",
    name: "git",
    url: "https://git-scm.com/",
    match: /\bgit(?:u|em)?\b(?![-.])/,
    group: "fleet",
    what: l(
      "Per-ticket worktrees, and the replica that carries the state of the work between machines.",
      "Worktree na tiket a replika, která nese stav práce mezi stroji.",
    ),
    docs: "https://git-scm.com/doc",
  },
  {
    id: "superpowers",
    name: "superpowers",
    url: "https://github.com/obra/superpowers",
    match: /\bsuperpowers\b/,
    group: "skills",
    what: l(
      "A skill set for the craft around the code: brainstorming, written plans, test-first work, review. This site's specs follow it.",
      "Sada skillů pro řemeslo kolem kódu: brainstorming, psané plány, test-first, review. Podle ní vznikají i specy tohoto webu.",
    ),
  },
  {
    id: "humanlayer",
    name: "HumanLayer",
    url: "https://www.humanlayer.dev/",
    match: /\bHumanLayer\b/,
    group: "planning",
    what: l(
      "A popular alternative for the same step: a shared workspace where plans are versioned and annotated inline.",
      "Populární alternativa pro stejný krok: sdílený workspace, kde jsou plány verzované a komentované přímo v textu.",
    ),
  },
  {
    id: "t3code",
    name: "T3 Code",
    url: "https://t3.codes/",
    match: /\bT3 Code\b/,
    group: "workspaces",
    what: l(
      "An orchestrator I evaluate against Paseo, with the gaps tracked and re-checked.",
      "Orchestrátor, který porovnávám s Paseem; mezery mám sepsané a znovu ověřované.",
    ),
  },
  {
    id: "agent-browser",
    name: "agent-browser",
    url: "https://github.com/vercel-labs/agent-browser",
    match: /\bagent-browser\b/,
    group: "context",
    what: l(
      "Browser automation for agents: screenshots of every string in context, UI checks.",
      "Ovládání prohlížeče pro agenty: snímek každého textu v kontextu, kontroly UI.",
    ),
  },
  {
    id: "typescript-go",
    name: "TypeScript 7 native",
    label: l("TypeScript 7 LSP", "TypeScript 7 LSP"),
    url: "https://github.com/microsoft/typescript-go",
    match: /\bTypeScript 7\b/,
    group: "context",
    what: l(
      "The native TypeScript 7 language server: type information fast enough for agents running in parallel.",
      "Nativní language server TypeScriptu 7: typové informace dost rychlé pro paralelní agenty.",
    ),
  },
  {
    id: "agents-md",
    name: "AGENTS.md",
    url: "https://agents.md/",
    match: /\bAGENTS\.md\b/,
    group: "skills",
    what: l(
      "One vendor-neutral instruction file that every agent tool reads.",
      "Jeden soubor instrukcí nezávislý na vendorovi, který čte každý agentní nástroj.",
    ),
  },
  {
    id: "mcp",
    name: "MCP",
    url: "https://modelcontextprotocol.io/",
    match: /\bMCP\b/,
    group: "skills",
    what: l(
      "The protocol that connects agents to trackers, design files and other tools.",
      "Protokol, kterým se agenti napojují na trackery, design a další nástroje.",
    ),
    docs: "https://modelcontextprotocol.io/docs",
  },
  {
    id: "axe",
    name: "axe",
    url: "https://github.com/dequelabs/axe-core",
    match: /\baxe\b/,
    group: "quality",
    what: l(
      "Automated accessibility checks in component tests, end-to-end runs and on this site.",
      "Automatické kontroly přístupnosti v testech komponent, v end-to-end bězích i na tomhle webu.",
    ),
  },
  {
    id: "biome",
    name: "Biome",
    url: "https://biomejs.dev/",
    match: /\bBiome\b/,
    group: "quality",
    what: l(
      "Lint and format in one tool; it replaced ESLint and Prettier across the monorepo.",
      "Lint a formát v jednom nástroji; v monorepu nahradil ESLint a Prettier.",
    ),
    docs: "https://biomejs.dev/guides/getting-started/",
  },
  {
    id: "turborepo",
    name: "Turborepo",
    url: "https://turborepo.com/",
    match: /\bTurborepo\b/,
    group: "quality",
    what: l(
      "Runs the monorepo's tasks and caches them, so a gate only rebuilds what changed.",
      "Spouští úlohy monorepa a cachuje je, takže brána přestaví jen to, co se změnilo.",
    ),
    docs: "https://turborepo.com/docs",
  },
  {
    id: "tailwind",
    name: "Tailwind",
    url: "https://tailwindcss.com/",
    match: /\bTailwind(?: CSS)?\b/,
    group: "quality",
    what: l(
      "Styling with token-only scales after the migration from CSS-in-JS.",
      "Styly s čistě tokenovými škálami po migraci z CSS-in-JS.",
    ),
    docs: "https://tailwindcss.com/docs",
  },
  {
    id: "storybook",
    name: "Storybook",
    url: "https://storybook.js.org/",
    match: /\bStorybook(?:u|em)?\b/,
    group: "quality",
    what: l(
      "A story for every component: the base of visual regression and component accessibility tests.",
      "Story pro každou komponentu: základ vizuálních regresí a testů přístupnosti komponent.",
    ),
    docs: "https://storybook.js.org/docs",
  },
  {
    id: "playwright",
    name: "Playwright",
    url: "https://playwright.dev/",
    match: /\bPlaywright\b/,
    group: "quality",
    what: l(
      "End-to-end tests and the browser behind screenshots and accessibility checks; it also tests this site.",
      "End-to-end testy a prohlížeč za snímky a kontrolami přístupnosti; testuje i tenhle web.",
    ),
    docs: "https://playwright.dev/docs/intro",
  },
  { id: "cypress", name: "Cypress", url: "https://www.cypress.io/", match: /\bCypress\b/, textOnly: true },
  { id: "jest", name: "Jest", url: "https://jestjs.io/", match: /\bJest\b/, textOnly: true },
  {
    id: "figma",
    name: "Figma",
    url: "https://www.figma.com/",
    match: /\bFigm(?:a|ě|u|ou|y)(?!\p{L})/u,
    group: "quality",
    what: l(
      "Design; agents read it through MCP when they implement a screen.",
      "Design; agenti ho čtou přes MCP, když implementují obrazovku.",
    ),
    docs: "https://help.figma.com",
  },
  { id: "eslint", name: "ESLint", url: "https://eslint.org/", match: /\bESLint\b/, textOnly: true },
  { id: "prettier", name: "Prettier", url: "https://prettier.io/", match: /\bPrettier\b/, textOnly: true },
  { id: "react-native", name: "React Native", url: "https://reactnative.dev/", match: /\bReact Native\b/, textOnly: true },
  { id: "react-query", name: "React Query", url: "https://tanstack.com/query", match: /\bReact Query\b/, textOnly: true },
  {
    id: "testing-library",
    name: "React Testing Library",
    url: "https://testing-library.com/docs/react-testing-library/intro/",
    match: /\bReact Testing Library\b/,
    textOnly: true,
  },
  { id: "react", name: "React", url: "https://react.dev/", match: /\bReact(?:u|em)?\b/, textOnly: true },
  { id: "redux", name: "Redux", url: "https://redux.js.org/", match: /\bRedux\b/, textOnly: true },
  { id: "nextjs", name: "Next.js", url: "https://nextjs.org/", match: /\bNext\.js\b/, textOnly: true },
  { id: "nodejs", name: "Node.js", url: "https://nodejs.org/", match: /\bNode\.js\b/, textOnly: true },
  { id: "spring-boot", name: "Spring Boot", url: "https://spring.io/projects/spring-boot", match: /\bSpring Boot(?:u|em)?\b/, textOnly: true },
  { id: "graphql", name: "GraphQL", url: "https://graphql.org/", match: /\bGraphQL\b/, textOnly: true },
  { id: "angularjs", name: "AngularJS", url: "https://docs.angularjs.org/", match: /\bAngularJS\b/, textOnly: true },
  { id: "yii", name: "Yii2", url: "https://www.yiiframework.com/", match: /\bYii2\b/, textOnly: true },
  { id: "dotnet", name: ".NET Core", url: "https://dotnet.microsoft.com/", match: /\.NET Core\b/, textOnly: true },
  { id: "stripe", name: "Stripe", url: "https://stripe.com/", match: /\bStripe\b/, textOnly: true },
  { id: "polygon", name: "Polygon", url: "https://polygon.technology/", match: /\bPolygon(?:em|u)?\b/, textOnly: true },
  { id: "gherkin", name: "Gherkin", url: "https://cucumber.io/docs/gherkin/", match: /\bGherkin(?:u|em)?\b/, textOnly: true },
  { id: "grafana", name: "Grafana", url: "https://grafana.com/", match: /\bGrafan(?:a|ě|u|ou)(?!\p{L})/u, textOnly: true },
  { id: "docker", name: "Docker", url: "https://www.docker.com/", match: /\bDocker\b/, textOnly: true },
  { id: "kubernetes", name: "Kubernetes", url: "https://kubernetes.io/", match: /\bKubernetes\b/, textOnly: true },
  { id: "gitlab", name: "GitLab", url: "https://about.gitlab.com/", match: /\bGitLab\b/, textOnly: true },
  {
    id: "astro",
    name: "Astro",
    url: "https://astro.build/",
    match: /\bAstr(?:o|u)\b/,
    group: "site",
    what: l(
      "This site: static, two languages, light and dark.",
      "Tenhle web: statický, dva jazyky, světlý i tmavý motiv.",
    ),
    docs: "https://docs.astro.build",
  },
  {
    id: "github-pages",
    name: "GitHub Pages",
    url: "https://pages.github.com/",
    match: /\bGitHub Pages\b/,
    group: "site",
    what: l(
      "Hosting for this site, deployed from the main branch.",
      "Hosting tohoto webu, nasazovaný z hlavní větve.",
    ),
    docs: "https://docs.github.com/en/pages",
  },
  { id: "github", name: "GitHub", url: "https://github.com/", match: /\bGitHub\b(?! Pages)/, textOnly: true },
];

const byId = new Map(TOOLS.map((tool) => [tool.id, tool]));

export function tool(id: string): Tool {
  const found = byId.get(id);
  if (!found) throw new Error(`Unknown tool id: ${id}`);

  return found;
}

/** Find the tool whose name a label starts with or equals (for diagram chips). */
export function toolByName(name: string): Tool | undefined {
  return TOOLS.find((x) => x.name === name);
}

export type Piece = string | { text: string; tool: Tool };

/**
 * Split text into plain pieces and tool mentions. With `seen`, a tool is linked only on its first
 * mention across every call that shares the set (one link per chapter, not one per sentence).
 */
export function splitTools(text: string, seen?: Set<string>): Piece[] {
  const out: Piece[] = [];
  let pos = 0;
  for (;;) {
    let best: { index: number; length: number; tool: Tool } | undefined;
    for (const x of TOOLS) {
      if (seen?.has(x.id)) continue;
      // Search the whole text from `pos`, so a lookbehind still sees what came before.
      const re = new RegExp(x.match.source, `${x.match.flags.replace("g", "")}g`);
      re.lastIndex = pos;
      const m = re.exec(text);
      if (m && (!best || m.index < best.index || (m.index === best.index && m[0].length > best.length))) {
        best = { index: m.index, length: m[0].length, tool: x };
      }
    }
    if (!best) break;
    if (best.index > pos) out.push(text.slice(pos, best.index));
    out.push({ text: text.slice(best.index, best.index + best.length), tool: best.tool });
    seen?.add(best.tool.id);
    pos = best.index + best.length;
  }
  if (pos < text.length) out.push(text.slice(pos));

  return out;
}
