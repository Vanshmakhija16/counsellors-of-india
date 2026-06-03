"use client";

import { useEffect } from "react";

/**
 * Controls when the fixed HangingWordmark strip is visible.
 *
 * The wordmark is a `position: fixed` strip pinned to the bottom 25vh of the
 * viewport, sitting BEHIND the FAQ "curtain". It must be shown ONLY while that
 * bottom strip is actually uncovered by the curtain — i.e. between the moment
 * the curtain's bottom edge scrolls above the strip, and the moment the FAQ
 * section itself leaves the bottom of the screen. Toggling on the whole tall
 * section being "in view" (the previous approach) made the wordmark bleed into
 * the pricing/CTA content above, because the section is intersecting long
 * before its bottom is reached.
 *
 * We measure two reference points each frame:
 *   - the curtain end sentinel  -> top edge of where the strip gets uncovered
 *   - the FAQ section bottom     -> when the next section starts covering it
 * and add `.faq-pinned` only while the strip band is genuinely exposed.
 */
export default function FaqRevealEffect() {
  useEffect(() => {
    const faq = document.querySelector<HTMLElement>(".faq-section");
    const sentinel = document.querySelector<HTMLElement>(".faq-curtain-end");
    if (!faq || !sentinel) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const strip = vh * 0.4; // must match .faq-wordmark-reveal height (40vh)

      const curtainBottom = sentinel.getBoundingClientRect().top;
      const sectionBottom = faq.getBoundingClientRect().bottom;

      // Uncovered once the curtain's bottom has scrolled above the strip's top,
      // and still covered-from-below until the section's bottom rises into the
      // strip band (then the next section takes over).
      const uncovered = curtainBottom <= vh - strip && sectionBottom > strip;

      faq.classList.toggle("faq-pinned", uncovered);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
