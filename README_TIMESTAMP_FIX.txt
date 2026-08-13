GLORB // SIGNAL MAPPER — DATE/TIME DOWNLOAD UPDATE

Replace app.js and styles.css in the current repository with these files.

This update adds one shared generation timestamp to each export session:
- visible on every generated PDF page as “Generated <date>, <time>”
- added to every PDF filename in the ZIP
- added to the ZIP filename itself
- used for shared/downloaded full reports as well

Example filename:
01_Emma_Full_Signal_Report_2026-08-13_1432.pdf

The timestamp uses the device/browser's local date and time when the export is generated.
