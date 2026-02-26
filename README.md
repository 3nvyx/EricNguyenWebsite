# Eric Nguyen — Personal Site

Personal portfolio and landing page built with Next.js.

## Preview

<!-- Add a screenshot of your landing page here for a clearer README on GitHub:
  1. Take a screenshot of the landing page (e.g. http://localhost:3000)
  2. Save it in the repo (e.g. docs/landing.png or .github/landing.png)
  3. Replace the line below with: ![Landing page](docs/landing.png)
-->
*Screenshot coming soon — run the app locally or add an image to this section.*

## Tech stack

- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS 4**
- **TypeScript**
- **IBM Plex Sans Condensed** (Google Fonts via `next/font`)

## What’s included

- **Home:** About section, headshot (click to toggle photo/drawing), resume / email / LinkedIn links
- **Nav:** eric nguyen · projects · work (active page is bold, hover underline)
- **Projects & Work:** Placeholder “Work in progress” pages at `/projects` and `/work`
- **Responsive:** Layout and typography tuned for mobile and desktop

## Getting started

The app lives in the `my-app` directory:

```bash
cd my-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Other commands

- `npm run build` — production build
- `npm run start` — run production server
- `npm run lint` — run ESLint

## Project structure

```
EricNguyenWebsite/
├── README.md           ← you are here
└── my-app/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx    ← home
    │   ├── projects/page.tsx
    │   └── work/page.tsx
    ├── public/         ← images, resume PDF
    └── package.json
```

## Adding a screenshot to this README

1. Run the app and open the landing page in your browser.
2. Take a screenshot (e.g. full page or hero section).
3. Save it in the repo, e.g. `docs/landing.png` or `.github/landing.png`.
4. In this README, replace the *Screenshot coming soon* line with:

   ```markdown
   ![Landing page](docs/landing.png)
   ```

Commit and push; the image will show on GitHub.
