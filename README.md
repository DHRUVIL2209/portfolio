# Dhruvil Rana - Portfolio

A responsive personal portfolio for showcasing software, game-development and academic projects. The desktop experience uses horizontal storytelling controlled by normal vertical scrolling, while smaller screens switch to a conventional vertical layout.

## Highlights

- Horizontal desktop navigation with smooth wheel/trackpad scrolling
- Vertical mobile layout below 900px
- Light and dark themes with persistent preference storage
- Minimal responsive background artwork designed separately for desktop and mobile
- Animated name introduction and section reveal transitions
- Project galleries with full-size screenshot viewing
- Idle slide settling: after scrolling stops, the most visible panel gently centers itself
- Keyboard navigation with Arrow and Page Up/Page Down keys on desktop
- Reduced-motion support through `prefers-reduced-motion`
- Native horizontal-scroll fallback if GSAP or ScrollTrigger fail to load

## Portfolio Sections

1. Home
2. About / Skills
3. Frolic Waterways
4. Savvy.shop
5. Skroll
6. Stint22
7. Space22
8. Hackathons
9. Contact

## Tech Stack

The portfolio intentionally uses a small static stack:

- HTML5
- CSS3
- Vanilla JavaScript
- GSAP + ScrollTrigger for the desktop horizontal scroll mapping
- Lenis for smooth wheel scrolling
- Google Fonts and Cascadia Code through CDN-hosted stylesheets

There is no framework, package manager, build step or backend.

## Project Structure

```text
.
├── index.html
├── styles.css
├── script.js
├── README.md
└── assets
    ├── screenshots
    │   ├── frolic-*.webp
    │   ├── savvy-*.webp
    │   ├── skroll-*.webp
    │   ├── stint-*.webp
    │   ├── space-*.webp
    │   └── *-cover.webp
    └── ui
        ├── background-desktop.svg
        └── background-mobile.svg
```

### `index.html`

Contains the semantic page structure, project information, navigation controls, gallery containers and theme initialization code.

### `styles.css`

Contains the complete visual system: themes, responsive layout, horizontal/vertical presentation, project cards, galleries, animations and background integration.

### `script.js`

Handles:

- horizontal desktop scrolling
- mobile scroll-state tracking
- slide activation and counters
- idle slide settling
- theme persistence
- project galleries and screenshot viewer
- keyboard navigation
- animated name typing

### `assets/screenshots/`

Stores project cover images and gallery screenshots in WebP format. Gallery filenames follow a predictable numbered structure such as:

```text
savvy-01.webp
savvy-02.webp
...
savvy-26.webp
```

### `assets/ui/`

Contains only the lightweight decorative SVG backgrounds used by the desktop and mobile layouts.

## Running Locally

Because this is a static site, it can be opened directly through `index.html`. Using a local web server is recommended so browser behavior matches production hosting more closely.

With Python installed:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```



## Theme System

The two base colors are:

```text
Light: #f3efe6
Dark:  #282828
```

The selected appearance is stored in the browser using:

```text
dhruvil-portfolio-theme
```

The background SVGs are transparent line artwork, allowing the same assets to adapt to both themes without maintaining duplicate light and dark images.

## Responsive Behavior

Desktop (`> 900px`):

- panels are arranged horizontally
- vertical page scrolling drives horizontal movement
- the dominant panel settles into place after scrolling stops

Mobile (`≤ 900px`):

- panels stack vertically
- navigation follows normal document scrolling
- a dedicated vertical SVG background is used
- project gallery covers move into the normal document flow

## Accessibility

The portfolio includes:

- semantic section and navigation structure
- descriptive `aria-label` attributes on controls
- keyboard navigation for desktop sections
- Escape-key support for closing galleries and image viewers
- visible focus-capable buttons and links
- reduced-motion handling
- alt text for project covers and gallery screenshots

## External Dependencies

The site loads the following libraries and fonts from public CDNs:

- GSAP
- GSAP ScrollTrigger
- Lenis
- Bricolage Grotesque
- IBM Plex Mono
- Syne
- Cascadia Code

The core content remains readable if animation libraries fail to load, but an internet connection is required for the CDN-hosted typography and enhanced scrolling libraries unless they are self-hosted later.

## License

No open-source license is included with this portfolio. Unless a license is added, the source code, project descriptions, branding and visual assets should be treated as all rights reserved.
