GLORB Signal Mapper — pathway chart restore

Replace these two files in the repository root:
- app.js
- styles.css

This restores the Low → Rising → Overload → Recovery pathway graphic in the exported full report.
The chart is now drawn with ordinary HTML/CSS line segments and markers rather than inline SVG,
which avoids the export renderer intermittently dropping the line/dots while keeping the existing
report layout and PDF pagination fixes.
