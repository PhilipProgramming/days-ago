# Days Ago

Days Ago is a single-page calendar experiment. The interface is typographic, full-viewport, and quiet. These rules govern every later milestone.

## Design principles

- Background `#FCFCFC`, text `#000000`, accent `#009DFF`.
- ABC Areal Semi Mono Medium, weight 500, normal style, for the whole interface. Yesterday and tomorrow use the Medium Italic file, not a synthetic italic. Fallback is `Arial, sans-serif`. `font-synthesis: none`.
- The font package in `public/fonts/` stays uncommitted. Its embedded notice excludes public hosting and redistribution until Dinamo confirms a web license. Production builds omit `dist/fonts`.
- Preserve the mockups' proportions, alignment, and generous negative space. They are spatial references, not a dashboard.
- Keep compositions full-viewport. Do not add cards, gradients, shadows, decorative icons, navigation bars, rounded buttons, or generic dashboard styling.
- Date language is lowercase English. Hyphens belong only inside compound numbers (`twenty-six`). Major groups are separated by spaces (`twenty twenty-six`, `nineteen oh five`).

## Architecture

- React, TypeScript, and Vite. Motion, when it arrives, uses native CSS and SVG.
- Production dependencies stay at React and React DOM. Vitest is the test dependency. Do not add a router, date library, animation library, backend, database, authentication, or external API.
- The URL stays `/`. Screens will switch in React state. The custom and result screens are not mounted yet.
- Pure date functions take an explicit civil date `{ year, month, day }`. The clock is read only in the UI.
- Calendar offsets use local `setDate`, so month length, leap day, and daylight saving change the calendar date rather than a 24-hour span.
- Supported results are years 1000 through 9999.

## Year spelling

Apply the same words on every screen:

- Before 2000, pair the century and the year: `nineteen oh five`, `nineteen ninety-nine`.
- 2000 is `two thousand`.
- 2001–2009 are `two thousand and` plus the number.
- 2010–2012 are `two thousand` plus the number, without "and".
- 2013 onward uses paired pronunciation: `twenty thirteen`, `twenty twenty-six`.
- Other century years use `hundred`: `nineteen hundred`, `twenty-one hundred`. This includes `ten hundred` for 1000 and `eighteen hundred` for 1800.
- Weekdays and months are full names. The `/number` value is cardinal (`twenty-four`). Prose lines use ordinals (`twenty-fourth`).

## Implementation restrictions

- The split-flap, when built, moves the characters like a vintage departure board. Do not put rectangular tiles, dark backgrounds, or visible containers behind the characters. Labels stay still.
- Marquee lines sit in two tracks between three stationary 1px `#171717` rails. Yesterday is the upper line and will move left. Tomorrow is the lower line and will move right. Both lines use ABC Areal Semi Mono Medium Italic. Animate the text only. The rails stay fixed, full width, with no vertical borders or track background. Each line must leave the viewport completely before its loop restarts.
- Presets are visible and inactive. They always measure from today. Selecting the active preset later returns the calendar to today.
- After the result lines leave the viewport, keep `that day would be ...` and the back control. Do not redirect automatically.
- Custom calculation and the result sequence are not part of the current build.
- Respect `prefers-reduced-motion` when animation is added: show the resting text and skip travel, flaps, typewriter, blinking, and automatic departure.

## Current build

Milestones 1–3 only: the Vite application, the date engine and unit tests, and the static main calendar. Do not commit unless the reviewer asks.
