import { l, type L10n } from "./l10n";
import { TOOLS, type Tool, type ToolGroup } from "./tools";

export const TOOL_GROUPS: { id: ToolGroup; title: L10n }[] = [
  { id: "agents", title: l("Agents and models", "Agenti a modely") },
  { id: "skills", title: l("Skills, rules and their distribution", "Skilly, pravidla a jejich distribuce") },
  { id: "workspaces", title: l("Workspaces and orchestration", "Pracoviště a orchestrace") },
  { id: "planning", title: l("Planning and review", "Plánování a review") },
  { id: "context", title: l("Context and code intelligence", "Kontext a znalost kódu") },
  { id: "fleet", title: l("Fleet and state", "Flotila a stav") },
  { id: "quality", title: l("Quality, testing and the front-end stack", "Kvalita, testy a stack aplikace") },
  { id: "site", title: l("This site", "Tento web") },
];

export const toolsIn = (group: ToolGroup): Tool[] => TOOLS.filter((x) => x.group === group);

/** The public X profile picture lives in `src/assets/people/<handle, lowercase, no leading _>.jpg`, so the page makes no request to X. */
export type Person = { name: string; handle: string; known: L10n };

/** People whose work I follow and borrow ideas from. Only what they are publicly known for. */
export const PEOPLE: Person[] = [
  {
    name: "Steve Sewell",
    handle: "Steve8708",
    known: l("CEO of Builder.io, the company behind Agent-Native.", "CEO Builder.io, firmy, za kterou stojí Agent-Native."),
  },
  {
    name: "Dex Horthy",
    handle: "dexhorthy",
    known: l("Founder of HumanLayer and author of 12-Factor Agents.", "Zakladatel HumanLayer a autor 12-Factor Agents."),
  },
  {
    name: "Zack Jackson",
    handle: "ScriptedAlchemy",
    known: l("Creator of Module Federation.", "Autor Module Federation."),
  },
  {
    name: "Cat Wu",
    handle: "_catwu",
    known: l("Head of product for Claude Code at Anthropic.", "Vede produkt Claude Code v Anthropicu."),
  },
  {
    name: "Tanner Linsley",
    handle: "tannerlinsley",
    known: l("Creator of TanStack: Query, Router, Table and more.", "Autor TanStacku: Query, Router, Table a dalších."),
  },
  {
    name: "Matt Pocock",
    handle: "mattpocockuk",
    known: l(
      "TypeScript educator behind Total TypeScript and AI Hero; his agent skills include Wayfinder.",
      "Lektor TypeScriptu za Total TypeScript a AI Hero; mezi jeho skilly pro agenty patří Wayfinder.",
    ),
  },
  {
    name: "Theo Browne",
    handle: "theo",
    known: l("Founder of Ping, creator of the T3 Stack and T3 Code.", "Zakladatel Ping, autor T3 Stacku a T3 Code."),
  },
];
