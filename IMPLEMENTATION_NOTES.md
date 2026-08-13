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
