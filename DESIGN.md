# Design

Visual specification for tickpanic — a real-time multiplayer word game.

Brutalist minimal: black field, monospaced timer, two accent colors carrying all meaning. Every pixel earns its place. No decoration, no chrome.

## Register

**Product.** The UI serves the game — fast reads, no friction, no aesthetic flourish. The brand identity *is* the restraint itself.

## Color

OKLCH-equivalent palette. Pure black field, one signal color, one alarm color, three neutral steps.

| Token              | Hex       | Role                                              |
|--------------------|-----------|---------------------------------------------------|
| `background`       | `#000000` | Page field. Never inverted.                       |
| `text-primary`     | `#ffffff` | Active text, default input, timer at rest.        |
| `text-secondary`   | `#666666` | Inactive, labels, hosts, placeholder, completed.  |
| `text-tertiary`    | `#333333` | Pending states, hairline separators.              |
| `accent`           | `#00ff88` | Your turn. Valid answer. Critical timer. Copied.  |
| `error`            | `#ff2d00` | Invalid answer. Timer expired. Error state.       |

**Color strategy:** *Restrained.* Two semantic colors (green/red) on a five-step neutral ramp. No tertiary palette. No gradients. No transparency for decoration.

The accent never decorates — it always signals. If it appears, something is *happening to you*.

## Theme

Dark, not as a preference but as a constraint: the game is timed, attention-critical, often played in shared physical space (phones around a table, projected on a screen). Pure black maximizes contrast for the timer and minimizes ambient distraction. The screen disappears; only the state shows.

## Typography

Two families, sharp scale jumps, lowercase everything.

| Family             | Stack                                  | Used for                              |
|--------------------|----------------------------------------|---------------------------------------|
| Sans               | `"Space Grotesk", sans-serif`          | All UI text, body, labels, buttons.   |
| Mono               | `"IBM Plex Mono", monospace`           | Timer, score, game code, round index. |

**Scale (Tailwind):** `text-xs` (12) · `text-sm` (14) · `text-lg` (18) · `text-2xl` (24) · `text-3xl` (30) · `text-4xl` (36) · `text-[80px]` (timer only).

**Weight contrast:** body `400`, medium `500`, timer `700`. No flat scales.

**Case:** lowercase by default — `ronda 3`, `tu turno`, `volver al lobby`, `copiado`. Proper nouns and the brand `tickpanic` stay lowercase too. Categories are forced lowercase at render time.

**Numerics:** `tabular-nums` everywhere a number could change in place (timer, score, code). Timer additionally uses `tracking-[-0.04em]` and `leading-none` to keep the 80px digits compact.

## Spacing

8px base unit, exposed as semantic tokens — not raw numbers.

| Token       | px    | Used for                                  |
|-------------|-------|-------------------------------------------|
| `element`   | `8`   | Inline gaps, vertical padding on inputs, list items. |
| `page`      | `16`  | Page edge padding.                        |
| `section`   | `24`  | Major vertical rhythm between blocks.     |

Spacing varies on purpose. Don't pad everything to `section` — the rhythm dies. Tight stacks use `element`, breathing stacks use `section`.

## Borders & radii

| Context                       | Value                          |
|-------------------------------|--------------------------------|
| Hairline separator            | `1px solid #333333`            |
| Input underline (default)     | `2px solid #ffffff`            |
| Input underline (focus)       | `2px solid #00ff88`            |
| Outline button border         | `1px solid #ffffff` → accent on hover |
| Container radius              | `0`                            |
| Button radius                 | `4px` (`rounded-button`)       |

No `box-shadow`. No `backdrop-filter`. No side-stripe borders. Containers are square. Only buttons get a small radius — just enough to read as tappable, not enough to look soft.

## Motion

Two custom easings, exposed as CSS variables in `:root`:

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);     /* ease-out-quint */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1); /* ease-in-out-quart */
```

**Durations:** `150ms` for button feedback, `200–300ms` for color transitions, `500ms / 1000ms` for timer pulses.

**Allowed:** opacity, color, `transform: scale()`, `filter: brightness()`. Never animate layout properties.

**Patterns:**
- Button press: `scale(0.97)` on `:active`, `brightness(1.08)` on hover (pointer-fine only).
- Timer at rest (active, >3s): `scale(1.02)` pulse every 1s.
- Timer critical (≤3s): `scale(1.05)` pulse every 0.5s, color flips to accent.
- Input on submit: 300ms border-bottom flash to accent.
- `GameCode` on copy: text swaps to `copiado` in accent for 1500ms.

`prefers-reduced-motion`: all keyframe animations off; transitions clamped to `0.01ms`.

## Components

All under `apps/frontend/src/components/`. Each component has co-located `.stories.tsx` and `.test.tsx`. Components are pure — no business logic, no API calls.

### TimerDisplay

Center-stacked: small lowercase round label (`ronda 3 de 5`) above an 80px tabular-num countdown.

States by color & motion:
- Active, >3s: white, gentle pulse.
- Active, ≤3s, >0: accent, aggressive pulse.
- Active, expired: error red, static.
- Inactive: text-secondary, static.

Calls `onExpired()` exactly when `safeRemaining <= 0` while active. Forbidden: ring/circular progress, clock icon, digit-by-digit flip.

### CategoryDisplay

Center-stacked: small `ronda N` label over a 30px medium-weight lowercase category name. No card, no icon, no illustration.

### AnswerInput

Transparent underlined `<input>` + primary submit button (`enviar`) in a flex row.

- Border-bottom 2px white → accent on focus.
- 300ms accent flash on successful submit, then back to white.
- Disabled state: 30% opacity, no color change.
- Auto-submits the current input on `timerExpired` if non-empty (timer is server-authoritative; this is a UX safety net, not enforcement).

Forbidden: inline checkmark/cross, autocomplete dropdown, side borders, rounded corners on the input itself.

### AnswerList

Bare `<ul>` with `space-y-element`. Each item is `text-sm`:
- Pending (`isValid === null`): white text, leading `•` bullet in text-secondary.
- Valid (`true`): accent text, no prefix.
- Invalid (`false`): error red with `line-through`.

No checkboxes, pills, badges, row backgrounds.

### PlayerRow

Flex row, `justify-between`, `py-element`.
- Name in accent when `isCurrentTurn`, white otherwise.
- ` (host)` suffix in text-secondary 12px.
- Score on the right, mono, tabular-nums.

No avatars, no initials, no crowns, no score bars.

### RoundIndicator

Five mono numerals in a row, `gap-section`.
- `< current`: text-secondary (completed).
- `=== current`: accent (active).
- `> current`: text-tertiary (pending).

No connecting lines, no fill bars, no checkmarks.

### GameCode

A single mono 4xl line with wide letter-spacing. Click to copy → text swaps to `copiado` in accent for 1500ms. No copy icon, no tooltip, no QR.

### BackToLobbyButton

Full-width `btn-outline` reading `volver al lobby`. Navigates to `/lobby`.

## Button system (`index.css`)

Four variants. All share `font-medium`, `py-element`, `rounded-button`, and the 150ms ease-out transition on transform/opacity/filter/color.

| Class         | Surface                | Hover (pointer-fine)         | Active        | Focus                          |
|---------------|------------------------|------------------------------|---------------|--------------------------------|
| `btn-primary` | accent bg, black text  | `brightness(1.08)`           | `scale(0.97)` | 2px accent outline, 2px offset |
| `btn-danger`  | error bg, black text   | `brightness(1.08)`           | `scale(0.97)` | 2px error outline, 2px offset  |
| `btn-outline` | transparent, 1px white | border + text → accent       | `scale(0.97)` | 2px accent outline, 2px offset |
| `btn-ghost`   | text-secondary, sm     | text → text-primary          | `opacity 0.7` | 2px accent outline, 2px radius |

Disabled: `opacity-30` on primary; no hover/active on any variant.

## Copy

- All-lowercase Spanish, terse: `crear`, `unirse`, `entrar`, `volver al lobby`, `escribe tu respuesta...`, `ronda 3 de 5`.
- No em dashes. No exclamation marks. No restated headings.
- Errors are short and human: `no se pudo crear el juego`, not `Error 500: Internal Server Error`.

## Absolute bans

Pulled forward from `docs/design-system.md` and enforced today:

- Card shadows (`box-shadow`).
- Decorative icons (FontAwesome, Lucide, emoji as UI).
- Horizontal progress fill bars.
- Avatars / initials circles.
- Pill buttons (`border-radius: 999px`).
- Gradient backgrounds. Gradient text (`background-clip: text`).
- Glassmorphism (`backdrop-filter`, translucent overlays).
- Slide-in animations (opacity/scale only).
- Toasts, snackbars, modals — use full-screen state changes instead.
- Side-stripe colored borders on cards/list items.
- Nested cards (don't even start).

## Token reference (Tailwind)

Colors and spacing are exposed as semantic tokens in `tailwind.config.js`. Use them by name — never hardcode hex or pixel values in components.

```js
colors:   { background, 'text-primary', 'text-secondary', 'text-tertiary', accent, error }
spacing:  { page: '16px', section: '24px', element: '8px' }
fontFamily: { sans: '"Space Grotesk"', mono: '"IBM Plex Mono"' }
borderRadius: { container: '0px', button: '4px' }
```

The timer's 80px size is the one documented exception — it lives as `text-[80px]` on `TimerDisplay` itself because it's the only place that size is ever used.
