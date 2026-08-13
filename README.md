# GLORB // Signal Mapper

A static, iPad-first web build for mapping student-identified feelings, what can change them, and things that help.

## New repository setup

This package is already arranged for a brand-new GitHub repository. Upload the **contents of this folder to the repository root**:

- `index.html`
- `styles.css`
- `data.js`
- `app.js`
- `assets/`

There is no build step, package manager or server-side application.

### Turn on GitHub Pages

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and `/ (root)` folder.
5. Save, then open the Pages URL when GitHub finishes deploying.

## Important behaviour

- Student responses are held in JavaScript memory for the current open page only.
- The app does not use `localStorage`, cookies or an account to persist student response content.
- Refreshing, starting over or leaving the page removes the current in-page responses.
- The interface therefore warns users to **Download ZIP**, **Print**, or **Share Report** before leaving.
- Web Share is used only when the browser supports sharing a generated PDF file. There is no email-address field.
- The PDF is generated in the browser using `html2pdf.js` loaded from cdnjs with Subresource Integrity. If that library cannot load, **Print → Save as PDF** remains the fallback.

## Asset handling

The supplied high-value artwork is already included in `assets/` as transparent PNG files numbered `1.png` through `205.png`.

Do not rename the numbered assets unless you also update the paths in `data.js`.

Transparent illustrations are intentionally displayed on white/light cards so the artwork stays visible against the navy interface.

See `ASSET_MAP.md` for the current mapping.

## Main pathways

1. **Map One Feeling**
2. **Map My Whole Signal System**
3. **Explore What Can Make Things Harder**

All pathways can generate one combined PDF report from the information completed so far.

## More Information

The persistent **MORE INFORMATION** button opens without changing or clearing the current map. It first offers:

- **FOR STUDENTS** — a short explanation of what the mapper is, why it is being used, what happens to answers and what the bother scale means.
- **FOR ADULTS** — framework rationale, rating calculations, interpretation rules, limitations, data information, research links and full references.

External research links open in a new tab so the current unsaved map is not replaced.

## Research and scope

The adult information page links to ACARA, AERO, ABS, W3C, NCTSN and peer-reviewed research. See `RESEARCH.md` for the reference list.

GLORB // Signal Mapper is presented as a student self-identification and communication resource. Its Signal Framework, percentage calculations and display bands are custom GLORB structures. They are not standardised health measures or published cut-offs.


## Download package

The main download action creates a ZIP package so one document does not have to serve every audience at once. The ZIP contains:

- `00_READ_ME_Adult_Guide.pdf` — how to understand and use the Signal Mapper information, research context, maths, limits and disclaimers.
- `01_<Name>_Full_Signal_Report.pdf` — the comprehensive adult-facing synthesis.
- `02_Things_That_Help_<Name>_Cards.pdf` — printable cards generated only from mapped things that help.
- `03_<Name>_My_Answers.pdf` — the exact questions and student responses, plus student-written text, without interpretation.
- `04_<Name>_My_Signal_Map.pdf` — the shorter, visual student-facing summary.

The current response data stays in page memory only. If the user leaves, refreshes or starts over, they need to generate a copy first if they want to keep their work.
