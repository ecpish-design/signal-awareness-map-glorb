# GLORB // Signal Mapper — Mobile Safari audit

## Scope

This pass targets phone viewports at **680px and below**. It does not change the
desktop, iPad, print or hidden PDF-export layouts. It does not change application
logic, data, copy, reports, timestamps or asset references.

## Files to replace

- `index.html`
- `styles.css`

`index.html` changes only the stylesheet version query so Safari fetches the
new CSS instead of reusing a cached copy.

## Screens audited

1. Branded landing cover
2. Typed welcome screen
3. Glorb introduction
4. Student name entry
5. Pathway selection
6. Save/data-loss warning
7. All-feelings selection
8. Signal-specific feeling selection
9. Custom feeling and custom Signal choice
10. Section transition cards
11. Pattern, action, self-help and adult-help questions
12. Free-text questions
13. Recovery flow
14. Pressure welcome
15. Four pressure-category introductions
16. Reminder yes/sometimes/no/unsure questions
17. Six-choice 0–4/unknown rating questions
18. More Information audience choice
19. Student and adult information content
20. Report actions and on-screen report preview

## Problems found and corrected

### Competing responsive rules

Earlier phone rules appeared before later rebuild and hotfix rules. Later rules
therefore reintroduced desktop dimensions on phones. One final phone-only layer
now resolves those conflicts consistently.

### Header height and horizontal crowding

The former phone header consumed 164px and wrapped text controls. The audited
header stays on one 68px row with compact controls, safe-area padding and
40–44px touch targets.

### Fixed viewport screens

Fixed `100dvh` screens could crop content when Safari's browser controls or the
onscreen keyboard changed the viewport. Phone screens now grow naturally and
scroll vertically where required.

### Desktop grids on narrow screens

Pathways, custom Signal choices, feeling cards, response controls and rating
controls now receive explicit phone grids. Inline desktop grid declarations are
overridden only inside the phone breakpoint.

### Images and text hierarchy

Question images receive bounded mobile heights with `object-fit: contain`.
Headings use phone-specific fluid sizes, and long labels may wrap without
causing horizontal overflow.

### Landing cover

The foreground Glorb layer is removed only on the phone cover. The content is
centred and equivalent spacing is retained. Glorb remains on iPad and desktop.

### Onboarding and transitions

Cards use the full available phone width. Glorb/section visuals stack above
copy, inputs use a Safari-safe font size, and primary/secondary actions become
full-width touch controls.

### Pressure flow

The category visual is retained and stacked above its explanation. The rating
strip and all six answer choices resize without overlapping or producing nested
horizontal scrolling.

### Information modal

The modal respects notches and the bottom home indicator, scrolls smoothly on
iOS and changes two-column information structures to a single readable column.

### Report preview

Only the **on-screen preview inside the app** becomes a responsive single-column
document. The hidden `#reportRoot` used to generate A4 PDFs is deliberately not
targeted, so exported reports retain their approved dimensions.

## Safari-specific safeguards

- `viewport-fit=cover` retained
- `env(safe-area-inset-*)` spacing
- `100vh` fallback followed by `100dvh`
- `100svh` for bounded visual areas
- minimum 16px form typography to prevent focus zoom
- `-webkit-text-size-adjust: 100%`
- `-webkit-overflow-scrolling: touch` where appropriate
- no page-level horizontal overflow
- explicit touch manipulation on primary controls
- stylesheet cache-busting version in `index.html`

## Validation completed

- `app.js` syntax check passed.
- `data.js` syntax check passed.
- CSS opening and closing braces are balanced.
- 183 statically rendered classes were inventoried against 204 CSS class
  selectors; unmatched names are semantic/dynamic report variants rather than
  missing required layout classes.
- The pre-audit stylesheet remains byte-for-byte unchanged before the appended
  phone-only layer.
- The only `index.html` change is the stylesheet cache-busting query.
- The current live build passed a functional smoke test through landing,
  onboarding, name entry and pathway selection with no application JavaScript
  errors. The new visual CSS requires deployment before it can be inspected on
  the public URL.

## Deployment check

After replacing both files, wait for GitHub Pages to finish deploying. Close the
existing Safari tab and open the site in a new tab. Test once in portrait and
once in landscape. Existing in-progress answers should not be used during this
deployment check because the application intentionally warns about unsaved
session data.
