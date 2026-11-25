# Express Home Improvement — website redesign

Modern, mobile-first redesign of https://www.xphomeimprovement.com. Plain HTML/CSS/JS — no build step.

```
index.html      single-page site (hero, services, about/process, projects, contact)
css/styles.css  styles
js/main.js      mobile menu, scroll reveals, gallery lightbox, quote form
```

## Notes
- **Logo** lives in `images/` (`logo.png` for light backgrounds, `logo-light.png` with white text for dark ones).
- **Sections**: hero, services, Bathroom Remodels (`#bathrooms`), Decks & Patios (`#decks`), about, more projects, contact.
- **Photos** are stored locally in `images/` (`service-*.jpg`, `project-*.jpg`, `about.jpg`), so the site no longer depends on Wix.
- **Font**: Arial throughout (no web fonts to load).
- **Banner video**: `images/hero-building.mp4` (Pexels video 13094722 "Men Working at Building Construction", free license; 14 s clip, muted loop), poster `hero-building.jpg`, faded into the page with a CSS mask.
- **Quote form** has no backend: it opens a pre-filled text message to 617-778-4403. To receive submissions by email instead, point the form at a service like Formspree.
- Deploy by uploading the folder to any static host (GitHub Pages, Netlify, the existing server).
