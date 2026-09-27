# Dhruvil Rana Portfolio — Cleaned Version 43 with v39 Scrolling

Upload the contents of this folder to the same GitHub Pages location as before.
There is no build step. To preview locally, run `python -m http.server 8000`
and open http://localhost:8000.

## Scrolling

- The bundled Lenis smoother now handles vertical wheel input and touch input
  in the mobile layout, as well as the existing desktop horizontal experience.
- Scrolling uses the smoother v39 Lenis configuration: `lerp: 0.18`,
  `wheelMultiplier: 1.22`, `touchMultiplier: 1` and `syncTouch: false`.
  Phones therefore retain native touch movement and momentum.
- Touch movement follows the finger with a gentle glide after release. A new
  touch interrupts the glide. Mobile sections never snap to a fixed height.
- The mobile layout stacks text, skills, cards and covers in normal document
  flow. Sections expand to fit their content and remain vertical in landscape.
- Sections reveal at approximately 15% viewport entry and fade near 85% exit.
- Galleries keep their own native scrolling. Opening a gallery pauses page
  inertia; closing it resumes the page at the same position.
- Reduced-motion preferences disable the smoother and decorative animation.
  Native scrolling also remains available if the Lenis file cannot load.
- Section geometry is cached on layout changes. The progress bar uses a
  transform, and mobile decoration updates wait until scrolling settles.

## Background and content

- Off-white (#f3efe6) and dark (#282828) base colors are retained.
- Theme-matched outlines have cyan, lavender, mint, amber and coral glows,
  with softer colors for the light theme and brighter colors for dark mode.
- Added a debugging bug, joystick and a path-with-nodes icon. There are 13
  SVG accents on desktop and 9 on mobile, with no WebGL or canvas rendering.
- Icons dim near readable content. Mobile icons stay still during a swipe,
  then gently rotate to their new angles once scrolling settles.
- Frolison Waterways naming, the centered Stint22 cover and all Savvy.shop
  screenshot privacy blurs are preserved. Image files are unchanged in v43.

## Cleanup

- Audited all 83 source, asset and vendor files. Every screenshot is referenced,
  so no portfolio images were removed. GSAP, ScrollTrigger and Lenis are all
  required by the desktop and mobile scrolling paths.
- Removed unused HTML classes, CSS selectors and declarations, a duplicate
  counter update, unused JavaScript state, unused webfont weights, an empty
  image request and redundant markup.
- Preserved the native desktop fallback, native reduced-motion behavior,
  gallery scroll isolation and the Lenis licence.

## Files

- index.html: content and structure
- styles.css: layout, themes, responsive states and SVG styling
- script.js: navigation, scrolling, mobile reveals, galleries and theme toggle
- ambient.js: decorative SVG icons, color palette and scroll response
- assets/screenshots: portfolio images, including baked-in privacy edits
- assets/vendor: bundled GSAP, ScrollTrigger and Lenis dependencies

Existing fonts load from their CDNs. Verified in Chromium browser emulation:
the restored v39 scroll behavior, vertical wheel easing, all 69 gallery
images and the full-size viewer, both themes, reduced motion, native desktop
fallback, horizontal navigation and responsive layouts. Layout checks cover
320×568, 390×844, 430×932, 768×1024, 932×430 and 1440×900 viewports.
The cleaned desktop render was also compared pixel for pixel with the source.
