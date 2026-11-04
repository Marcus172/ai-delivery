import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

export const CHAPTER_IDS = [
  "principle",
  "flow",
  "tooling",
  "guardrails",
  "enablement",
  "planning",
  "case-persona",
  "case-a11y",
  "case-tailwind",
  "results",
  "offer",
] as const;

export type ChapterId = (typeof CHAPTER_IDS)[number];

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

export const collections = { aiDelivery };
