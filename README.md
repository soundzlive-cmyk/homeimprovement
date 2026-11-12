# Express Home Improvement — website redesign

Modern, mobile-first redesign of https://www.xphomeimprovement.com. Plain HTML/CSS/JS — no build step.

```
index.html      single-page site (hero, services, about/process, projects, contact)
css/styles.css  styles
js/main.js      nav, scroll reveals, gallery lightbox, quote form
```

## Notes
- **Photos** are currently loaded from the existing Wix media URLs. Before cancelling Wix, download them into an `images/` folder and update the `src`/`url()` paths.
- **Quote form** has no backend: it opens a pre-filled text message to 617-778-4403. To receive submissions by email instead, point the form at a service like Formspree.
- Deploy by uploading the folder to any static host (GitHub Pages, Netlify, the existing server).
