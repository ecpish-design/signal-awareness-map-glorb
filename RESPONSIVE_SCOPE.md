# GLORB // Signal Mapper — confirmed responsive scope

| Platform | Responsive changes |
|---|---|
| Phone, 680px and below | Full interface audit across the Mapper; foreground Glorb hidden on the landing cover |
| iPad/tablet, 681–1100px | Landing cover only; Glorb is scaled, positioned and cropped for the viewport |
| Desktop/web, 1101px and above | Landing cover only; Glorb is scaled, positioned and cropped for the viewport |

All iPad and desktop selectors begin with `.is-cover`. That class exists only
while the landing cover is displayed. It is removed when **OPEN MAPPER** is
pressed, preventing those rules from affecting onboarding, questions, modals,
reports or any later screen.

The tablet/desktop Glorb treatment uses the existing `assets/cover.png`. CSS
clips the repeated characters from that foreground layer, leaving the large
Glorb composition while `assets/cover-background.png` continues to supply the
faded character field.

No JavaScript, data, report, export or asset file is replaced.
