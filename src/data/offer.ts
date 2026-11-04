import { l, type L10n } from "./l10n";

export type OfferCard = { id: string; title: L10n; body: L10n };

// Spec §5.1: three consulting cards — assessment, shared flow with guardrails, enablement beyond developers.
export const OFFER: OfferCard[] = [
  {
    id: "assessment",
    title: l("AI-SDLC assessment", "Posouzení dodávání s AI"),
    body: l(
      "I look at how your team and codebase deliver today: where work waits, which rules live only in people's heads, and what is ready for AI assistance. You get a prioritized plan and the measurements to judge it by, taken before anything changes.",
      "Projdu, jak váš tým a kód dnes dodávají: kde práce čeká, která pravidla existují jen v hlavách lidí a co je připravené na pomoc AI. Dostanete plán seřazený podle priorit a výchozí měření, podle kterých ho půjde posoudit, pořízená dřív, než se cokoli změní.",
    ),
  },
  {
    id: "delivery-flow",
    title: l("A shared delivery flow with guardrails", "Sdílený delivery flow s mantinely"),
    body: l(
      "I set up the flow your team works in: agent context and rules, quality gates that hold with or without AI, behavioural tests for the agent setup, and a personal tooling layer, so each developer can change tools without changing the process.",
      "Nastavím flow, ve kterém váš tým pracuje: kontext a pravidla pro agenty, kvalitativní brány, které platí s AI i bez ní, behaviorální testy AI setupu a osobní vrstvu nástrojů, aby si každý vývojář mohl vyměnit nástroj, aniž by se měnil proces.",
    ),
  },
  {
    id: "enablement",
    title: l("Enablement beyond developers", "AI i pro analytiky, testery a PM"),
    body: l(
      "Analysts, testers and PMs get AI into their own work: analysis lookups, test planning and coverage, incident triage, always with a person approving the result. Shared standards then make the common way the easy way, including for those who would rather not.",
      "Analytici, testeři a PM dostanou AI do vlastní práce: dohledávání v analýzách, plánování testů a pokrytí, triáž incidentů, vždy se schválením výsledku člověkem. Sdílené standardy pak udělají ze společné cesty tu nejsnazší, i pro ty, kdo se do změn nehrnou.",
    ),
  },
];
