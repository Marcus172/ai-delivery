import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

export const CHAPTER_IDS = ["principle", "flow", "tooling", "guardrails", "enablement", "planning", "offer"] as const;

export type ChapterId = (typeof CHAPTER_IDS)[number];

/** Case subpages under Wins & cases, in reading order. The id is the URL segment in both locales. */
export const CASE_IDS = ["brand-voice", "accessibility", "tailwind"] as const;

export type CaseId = (typeof CASE_IDS)[number];

/**
 * AI Delivery chapters, one MDX file per locale and chapter. Entry id = `<locale>/<NN>-<chapter id>`;
 * the chapter id in frontmatter is identical across locales so anchors survive the language switch.
 */
const aiDelivery = defineCollection({
  loader: glob({ base: "./src/content/ai-delivery", pattern: "**/*.mdx" }),
  schema: z.object({
    id: z.enum(CHAPTER_IDS),
    order: z.number().int().positive(),
    title: z.string().min(1),
    summary: z.string().min(1),
  }),
});

/** Case studies, one MDX file per locale and case: `<locale>/<NN>-<case id>.mdx`. */
const cases = defineCollection({
  loader: glob({ base: "./src/content/cases", pattern: "**/*.mdx" }),
  schema: z.object({
    id: z.enum(CASE_IDS),
    order: z.number().int().positive(),
    /** Metric ids shown on the case card and in the case's at-a-glance header. */
    highlights: z.array(z.string()).min(1),
    title: z.string().min(1),
    summary: z.string().min(1),
  }),
});

/** The measured results that open Wins & cases, one MDX file per locale: `<locale>.mdx`. */
const results = defineCollection({
  loader: glob({ base: "./src/content/results", pattern: "*.mdx" }),
  schema: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
  }),
});

export const collections = { aiDelivery, cases, results };
