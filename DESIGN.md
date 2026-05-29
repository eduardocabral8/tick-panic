# Design

Visual specification for tickpanic — a real-time multiplayer word game.

Brutalist minimal with a pulse: off-black field, a heavy display wordmark, a monospaced timer, and a hot magenta that signals pressure. The clock carries the tension on its own — it pulses faster and changes color as it drops; the field never tints. Every pixel earns its place; the only decoration is static atmosphere you feel more than see.

## Register

**Product.** The UI serves the game — fast reads, no friction. Restraint everywhere except the two moments that carry the brand: the wordmark and the running clock. Those are allowed to have attitude.

## Color

Off-black field, one brand/signal color (magenta), one positive color (green), one alarm color (red), three neutral steps.

| Token              | Hex       | Role                                                       |
|--------------------|-----------|------------------------------------------------------------|
| `background`       | `#0B0B0D` | Page field. Off-black for depth. Never inverted.           |
| `surface`          | `#16161A` | Subtle elevation (reserved / atmosphere base).             |
| `text-primary`     | `#F4F2EC` | Warm off-white. Active text, default input, timer at rest. |
| `text-secondary`   | `#87867E` | Inactive, labels, hosts, placeholder, completed.           |
| `text-tertiary`    | `#3C3C40` | Pending states, hairline separators.                       |
| `accent`           | `#FF2E7E` | Brand. Your turn. Active. Critical timer. Focus. Copied.   |
| `valid`            | `#34D9A0` | Valid answer only (text and the `btn-valid` action).       |
| `error`            | `#FF3B30` | Invalid answer. Timer expired. Error state.                |

**Color strategy:** *One dominant brand color.* Magenta carries identity and "something is happening to you" (turn, focus, critical clock). Green appears only to confirm a valid answer; red only to deny or alarm. Off-black + magenta is the recognizable pair; green and red are momentary.

The accent never decorates as a flat fill — it signals (your turn, focus, the critical timer digit). The page field itself stays neutral; time pressure is carried by the timer, never by tinting the screen.

## Theme

Dark, not as a preference but as a constraint: the game is timed, attention-critical, often played in shared physical space (phones around a table, projected on a screen). Off-black maximizes contrast for the timer and minimizes ambient distraction. The screen disappears; only the state shows.

## Atmosphere

A single fixed, `pointer-events-none` layer behind all content (`PressureBackdrop`), present on every screen and fully static:

- **Depth vignette** — a static radial darkening at the edges so the off-black field has dimension instead of reading flat.
- **Grain** — a faint `feTurbulence` SVG at ~4% opacity, `mix-blend-soft-light`. Static, no animation.

No color tint and no time-based reaction: the field never warms or shifts hue as the clock runs. Time pressure lives entirely in the timer (see **TimerDisplay** and **Motion**).

## Typography

Three families, sharp scale jumps, lowercase everything.

| Family             | Stack                                  | Used for                                      |
|--------------------|----------------------------------------|-----------------------------------------------|
| Display            | `"Anton", sans-serif`                  | Wordmark and large state headings only.       |
| Sans               | `"Space Grotesk", sans-serif`          | All UI text, body, labels, buttons.           |
| Mono               | `"IBM Plex Mono", monospace`           | Timer, score, game code, round index.         |

**Scale (Tailwind):** `text-xs` (12) · `text-sm` (14) · `text-lg` (18) · `text-2xl` (24) · `text-3xl` (30) · `text-4xl` (36) · `text-[80px]`+ (timer / wordmark).

**Weight contrast:** body `400`, medium `500`, timer/display `700`. No flat scales.

**Case:** lowercase by default for all UI copy — `ronda 3`, `tu turno`, `volver al lobby`, `copiado`. The brand `tickpanic` stays lowercase, and categories are forced lowercase at render time. **Player names are the exception:** they render in the exact case the player typed. UI copy is authored in lowercase rather than forced, so a name dropped into a sentence keeps its own case; where a name lives inside a span that also carries a forced-lowercase parent it gets `normal-case`. We never override someone's name.

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
| Hairline separator            | `1px solid #3C3C40`            |
| Input underline (default)     | `2px solid #F4F2EC`            |
| Input underline (focus)       | `2px solid #FF2E7E`            |
| Outline button border         | `1px solid #F4F2EC` → accent on hover |
| Container radius              | `0`                            |
| Button radius                 | `4px` (`rounded-button`)       |

No `box-shadow`. No `backdrop-filter`. No side-stripe borders. Containers are square. Only buttons get a small radius — just enough to read as tappable, not enough to look soft. The one sanctioned gradient is the static `PressureBackdrop` depth vignette (radial, structural), never a decorative fill on a component.

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
- Timer critical (≤3s): color flips to accent and a heartbeat thump *accelerates* each second — `timer-beat-3` (0.72s, +7%) → `timer-beat-2` (0.48s, +11%) → `timer-beat-1` (0.36s, +12%). This is the sole carrier of time pressure now that the field stays neutral.
- Input on submit: 300ms border-bottom flash to accent.
- `GameCode` on copy: text swaps to `copiado` in accent for 1500ms.
- Wordmark entrance (home only, once): `tick:` rises (`word-rise`, 360ms) then `panic` jolts in with a nervous shake (`panic-shake`, 620ms after a 240ms delay).

`prefers-reduced-motion`: all keyframe animations off (including `word-rise` and `panic-shake`); transitions clamped to `0.01ms`.

## Components

All under `apps/frontend/src/components/`. Each component has co-located `.stories.tsx` and `.test.tsx`. Components are pure — no business logic, no API calls.

### Wordmark

`tick:panic` in the display face (Anton), lowercase, with a static magenta colon (a nod to a digital clock). Decorative colon; accessible name stays `tickpanic`. With `animate` (home screen only) it plays the one-shot entrance described in **Motion**. Used in `LoginPage`, `LobbyPage`, and the local-mode setup.

### PressureBackdrop

The fixed, static atmosphere layer (depth vignette + grain). No props, no state. See **Atmosphere**. Rendered once at the app root, behind a `relative z-10` content wrapper.

### RulesOverlay

Self-contained `?` trigger (fixed top-right) plus a full-screen rules dialog (`role="dialog"`, `aria-modal`). Manages its own open state. Heading in the display face. Replaces the markup formerly duplicated across `LoginPage` and `LobbyPage`.

### TimerDisplay

Center-stacked: small lowercase round label (`ronda 3 de 5`) above an 80px tabular-num countdown.

States by color & motion:
- Active, >3s: white, gentle pulse.
- Active, ≤3s, >0: accent, accelerating heartbeat (`timer-beat-3/2/1` by second).
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

Five variants. All share `font-medium`, `py-element`, `rounded-button`, and the 150ms ease-out transition on transform/opacity/filter/color.

| Class         | Surface                | Hover (pointer-fine)         | Active        | Focus                          |
|---------------|------------------------|------------------------------|---------------|--------------------------------|
| `btn-primary` | accent bg, dark text   | `brightness(1.08)`           | `scale(0.97)` | 2px accent outline, 2px offset |
| `btn-valid`   | valid bg, dark text    | `brightness(1.08)`           | `scale(0.97)` | 2px valid outline, 2px offset  |
| `btn-danger`  | error bg, dark text    | `brightness(1.08)`           | `scale(0.97)` | 2px error outline, 2px offset  |
| `btn-outline` | transparent, 1px white | border + text → accent       | `scale(0.97)` | 2px accent outline, 2px offset |
| `btn-ghost`   | text-secondary, sm     | text → text-primary          | `opacity 0.7` | 2px accent outline, 2px radius |

`btn-valid` / `btn-danger` are the paired validation actions (green "válido" vs red "inválido"), giving a clear positive/negative opposition the brand magenta can't.

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
- Gradient text (`background-clip: text`) and decorative gradient *fills* on components. The fixed `PressureBackdrop` radial vignette is the single sanctioned gradient (structural depth + heat), never on a component surface.
- Glassmorphism (`backdrop-filter`, translucent overlays).
- Slide-in animations (opacity/scale only).
- Toasts, snackbars — use full-screen state changes instead. The rules dialog (`RulesOverlay`) is a deliberate full-screen overlay, not a floating modal card.
- Side-stripe colored borders on cards/list items.
- Nested cards (don't even start).

## Token reference (Tailwind)

Colors and spacing are exposed as semantic tokens in `tailwind.config.js`. Use them by name — never hardcode hex or pixel values in components.

```js
colors:   { background, surface, 'text-primary', 'text-secondary', 'text-tertiary', accent, valid, error }
spacing:  { page: '16px', section: '24px', element: '8px' }
fontFamily: { display: 'Anton', sans: '"Space Grotesk"', mono: '"IBM Plex Mono"' }
borderRadius: { container: '0px', button: '4px' }
```

The timer's 80px size is the one documented exception — it lives as `text-[80px]` on `TimerDisplay` itself because it's the only place that size is ever used. The wordmark sizes are passed per-usage via `className` on `Wordmark`.
