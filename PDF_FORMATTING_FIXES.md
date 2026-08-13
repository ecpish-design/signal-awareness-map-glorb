# PDF formatting fixes

This patch is for the current GLORB // Signal Mapper build.

Replace these files in the repository:
- `app.js`
- `styles.css`

The other included files are unchanged/current copies for convenience.

Key fixes:
- prevents the What Can Make Things Harder intro scale image from overlapping text
- uses correct A4 portrait/landscape export dimensions
- fixes Adult Guide orientation
- deliberately paginates long report sections
- limits printable card sheets to six complete cards per page
- separates the student framework visual from the detailed map
- chunks highest-rated item tables
- separates research and reference pages
- gives raw-answer continuations their own titled page
