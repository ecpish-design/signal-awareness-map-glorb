# GLORB // Signal Mapper — approved edit build

This build implements the consolidated rebuild specifications supplied on 13 August 2026.

## Main implementation changes

- Sequential onboarding: typed welcome → Glorb → name → pathway choice → data-loss warning.
- First-name/initials field and pathway time estimates.
- Global readability pass: left-aligned transition/instructional text and readable question typography.
- Compact Signal orientation headers and iPad-focused one-question-per-screen interaction.
- Simplified Steady Signal flow; no Steady self-help, adult-help or harder-factor sections.
- Removed harder-factor questions from individual feelings.
- Separate `Explore What Can Make Things Harder` flow with item-specific question wording and button-like 0–4 ratings.
- Two-stage Reminder logic: identify an upsetting reminder first, then rate its impact only when relevant.
- Removed activation/arousal terminology from GLORB-facing language.
- Revised More Information / adult explanation language and retained the Signal System visual.
- Reworked report information design: compact Signal columns, Low → Rising → Overload → Recovery pathway, Adult Quick Guide, pressure summaries and exact response record.
- Preserved Yes / Sometimes / No / Unsure / Not tried distinctions in reporting.
- Download now creates a ZIP containing five separate PDFs:
  1. `00_READ_ME_Adult_Guide.pdf`
  2. `01_<Name>_Full_Signal_Report.pdf`
  3. `02_Things_That_Help_<Name>_Cards.pdf`
  4. `03_<Name>_My_Answers.pdf`
  5. `04_<Name>_My_Signal_Map.pdf`

## Files changed

- `index.html`
- `app.js`
- `data.js`
- `styles.css`
- `README.md`

No high-value image assets were changed.

## 2026-08-13 PDF/export formatting fix

- Fixed the Explore What Can Make Things Harder intro so the rating-scale image cannot overlap the copy.
- PDF export now uses true A4 dimensions with the page padding acting as the margin.
- Adult guide exports in portrait rather than being rendered through a landscape PDF canvas.
- Full report landscape typography and spacing were tightened so logical report pages remain intact.
- Detailed Signal Map keeps the preferred boxed/column layout but uses compact report-only spacing.
- Student Signal Map now separates the large framework visual from the detailed signal columns so neither is sliced across pages.
- Highest-rated pressure items are intentionally paginated rather than being cut mid-table.
- Research context and references are separated into deliberate pages.
- Printable help cards now use 6 cards per portrait page, preventing cards from being cut across page boundaries.
- Raw-answer PDFs use deliberate continuation pages for longer feeling sections so headings/tables are not split unpredictably.
- Print styles now match the A4 landscape full-report export.
