# Express Home Improvement — website redesign

Modern, mobile-first redesign of https://www.xphomeimprovement.com. Plain HTML/CSS/JS — no build step.

```
index.html      single-page site (hero, services, about/process, projects, contact)
css/styles.css  styles
js/main.js      nav, scroll progress/parallax, rotating headline, services preview, drag gallery + lightbox, 2-step quote form
```

## Notes
- **Logo** lives in `images/` (`logo.png` for light backgrounds, `logo-light.png` with white text for dark ones).
- **Photos** are stored locally in `images/` (`service-*.jpg`, `project-*.jpg`, `about.jpg`), so the site no longer depends on Wix.
- **Fonts**: Geist (UI/body) and Instrument Serif (italic accents) from Google Fonts.
- **Quote form** has no backend: it opens a pre-filled text message to 617-778-4403. To receive submissions by email instead, point the form at a service like Formspree.
- Deploy by uploading the folder to any static host (GitHub Pages, Netlify, the existing server).
