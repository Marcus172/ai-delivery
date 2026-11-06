import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, describe, expect, it } from "vitest";
import photo from "../../src/assets/photo.jpg";
import Clip from "../../src/components/media/Clip.astro";
import Figure from "../../src/components/media/Figure.astro";
import YouTube from "../../src/components/media/YouTube.astro";

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

describe("media components", () => {
  it("Figure renders the image with its alt, a caption, and a link to full size", async () => {
    const html = await container.renderToString(Figure, {
      props: { locale: "en", src: photo, alt: "A local visual plan", caption: "The plan as the reviewer sees it." },
    });
    expect(html).toMatch(/<img[^>]+alt="A local visual plan"/);
    expect(html).toContain("<figcaption");
    expect(html).toContain("The plan as the reviewer sees it.");
    expect(html).toMatch(/<a[^>]+aria-label="Open full size: A local visual plan"/);
  });

  it("Figure carries a closed zoom dialog with a named close button and the full-size image", async () => {
    const html = await container.renderToString(Figure, {
      props: { locale: "cs", src: photo, alt: "Lokální vizuální plán", caption: "Plán, jak ho vidí recenzent." },
    });
    expect(html).toMatch(/<dialog[^>]+aria-label="Lokální vizuální plán"[^>]*data-zoom/);
    expect(html).not.toMatch(/<dialog[^>]*\sopen/);
    expect(html).toMatch(/<button[^>]+aria-label="Zavřít"/);
    const link = /<a class="frame"[^>]*href="([^"]+)"/.exec(html)?.[1];
    expect(link).toBeTruthy();
    expect(html).toContain(`<img src="${link}"`);
  });

  it("Clip is muted, looping, has controls and a poster, and never autoplays from markup", async () => {
    const html = await container.renderToString(Clip, {
      props: { src: "/clip.mp4", poster: photo, label: "An agent filling a form", caption: "Recorded on a demo app." },
    });
    const video = /<video[^>]*>/.exec(html)?.[0] ?? "";
    for (const attr of ["muted", "loop", "playsinline", "controls", "poster="]) expect(video).toContain(attr);
    expect(video).toContain('aria-label="An agent filling a form"');
    // Autoplay is switched on by script only when the visitor has not asked for reduced motion.
    expect(video).not.toMatch(/\bautoplay\b/);
  });

  it("YouTube is a facade: a button with a self-hosted thumbnail and no YouTube URL in the markup", async () => {
    const html = await container.renderToString(YouTube, {
      props: { locale: "cs", id: "dQw4w9WgXcQ", title: "Ukázka", thumbnail: photo, transcript: "/prepis/" },
    });
    expect(html).toMatch(/<button[^>]+aria-label="Přehrát video: Ukázka"/);
    expect(html).not.toMatch(/<iframe/);
    // No YouTube host anywhere in the server markup: thumbnail and player come from here until the click.
    expect(html).not.toMatch(/youtube(?:-nocookie)?\.com|ytimg\.com|youtu\.be/i);
    expect(html).toContain('href="/prepis/"');
  });

  it("YouTube rejects a value that is not a video id", async () => {
    await expect(
      container.renderToString(YouTube, { props: { locale: "en", id: "https://evil.example/x", title: "x", thumbnail: photo } }),
    ).rejects.toThrow(/video id/);
  });
});
