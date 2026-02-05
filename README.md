# Lead-Generation-Website

A local-first, conversion-optimized lead generation platform built with Node.js, Express, SQLite, and vanilla HTML/CSS/JS.

## Project Overview
- Multi-step lead capture form with progress indicators, validation, conditional logic, and partial draft saving.
- Behavioral tracking: scroll depth, clicks, exit intent, time on page, form abandonment signals.
- Lead scoring and temperature classification (cold/warm/hot).
- Admin dashboard for lead management, CSV export, and funnel analytics.
- Runs 100% locally with no external services.

## Folder Structure
```
.
├── data/                   # Local SQLite storage
├── models/                 # Sequelize models
├── public/                 # Frontend assets
│   ├── index.html
│   ├── admin.html
│   ├── styles.css
│   ├── app.js
│   └── admin.js
├── utils/                  # Scoring utilities
├── server.js               # Express server
├── seed.js                 # Dummy data seeding
├── .env.example            # Environment variables template
└── package.json
```

## Setup Instructions (Windows)
1. Install Node.js (v18+ recommended) from https://nodejs.org.
2. Open PowerShell and navigate to this project folder.
3. Install dependencies:
   ```powershell
   npm install
   ```
4. Create a `.env` file (optional) using `.env.example` as a template.
5. (Optional) Seed dummy data:
   ```powershell
   npm run seed
   ```
6. Start the app:
   ```powershell
   npm start
   ```
7. Open the site at `http://localhost:3000` and the admin dashboard at `http://localhost:3000/admin`.

## Customization
- **Niche switch**: Update copy in `public/index.html` and color variables in `public/styles.css`.
- **Form fields**: Edit the form in `public/index.html` and validation logic in `public/app.js`.
- **Lead scoring**: Adjust rules in `utils/leadScoring.js`.
- **Branding**: Replace text and trust bar metrics in the hero section.

## Adding New Forms
1. Duplicate a `.form-step` block in `public/index.html`.
2. Update the total steps in `public/app.js` (`state.totalSteps`).
3. Add new validation rules if needed in `validateStep()`.

## Export Leads
Use the **Export CSV** button in the admin dashboard or visit `http://localhost:3000/api/admin/export`.

## Security & Performance Notes
- Input sanitization via `validator`.
- CSRF protection for all POST requests.
- Rate limiting per IP.
- Helmet security headers enabled.

## Sample Data
Run `npm run seed` to generate sample leads and events.

## Optimization Tips
- Keep hero copy benefit-driven and focused on outcomes.
- Reduce form friction by asking only the most critical questions.
- Use the exit-intent modal to capture abandoned visitors.
- Monitor hot lead volume daily in the admin dashboard.
