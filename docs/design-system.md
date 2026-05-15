# Design System

Visual specification for the "15 segundos" game UI.

## Philosophy

Every element has a purpose. If it does not communicate game state, it does not exist. No decoration. No embellishment.

## Palette

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#000000` | Page background |
| Text Primary | `#ffffff` | Main text, active elements |
| Text Secondary | `#666666` | Inactive, disabled, labels |
| Text Tertiary | `#333333` | Pending states, separators |
| Accent | `#00ff88` | Active timer, valid answers, current turn, success |
| Error | `#ff2d00` | Invalid answers, timer critical, errors |

No gradients. No transparency for decoration.

## Typography

| Role | Font | Size | Weight |
|------|------|------|--------|
| Timer | IBM Plex Mono | 48px | 700 |
| Score | IBM Plex Mono | 24px | 500 |
| Category | Space Grotesk | 18px | 500 |
| Body | Space Grotesk | 14px | 400 |
| Label | Space Grotesk | 12px | 400 |

Lowercase preferred for all text: "ronda 3", "15 segundos", "tu turno", "esperando jugadores".

## Spacing

Base unit: `8px`

| Context | Value |
|---------|-------|
| Page padding | `16px` |
| Section gap | `24px` |
| Element gap | `8px` |
| Input padding | `8px 0` |

## Borders

| Context | Value |
|---------|-------|
| Separators | `1px solid #333333` |
| Input underline (default) | `2px solid #ffffff` |
| Input underline (focus) | `2px solid #00ff88` |
| Container border-radius | `0px` |
| Button border-radius | `4px` (maximum) |

No `box-shadow`. No `backdrop-filter`.

## Components

### TimerDisplay

Props:
- `remainingSeconds: number`
- `totalSeconds: number`
- `isActive: boolean`

Visual states:
- `isActive && remainingSeconds > 3`: `#ffffff`, `48px`, subtle pulse (`transform: scale(1.02)` every 1s)
- `isActive && remainingSeconds <= 3`: `#00ff88`, `48px`, aggressive pulse (`transform: scale(1.05)` every 0.5s)
- `!isActive`: `#666666`, `48px`, static

Forbidden: circular progress bar, clock icon, gradient background.

### CategoryDisplay

Props:
- `name: string`
- `examples?: string[]`

Render:
- Category name in `Space Grotesk 18px`, lowercase
- Examples in `IBM Plex Mono 12px #666666`, comma-separated, below the name

Forbidden: illustration icon, colored background card, decorative badge.

### AnswerInput

Props:
- `onSubmit: (text: string) => void`
- `disabled: boolean`

Render:
- `<input type="text">` with no side borders, only `border-bottom: 2px solid #ffffff`
- Background: transparent
- Text: `#ffffff`, `Space Grotesk 14px`
- Placeholder: `#666666`

States:
- Focus: border-bottom changes to `#00ff88`
- Disabled: `opacity: 0.3`, no border color change

Forbidden: submit button with arrow icon, inline validation checkmark/cross, autocomplete dropdown, rounded corners.

### AnswerList

Props:
- `answers: { text: string; isValid: boolean | null }[]`

Render: vertical list, one item per answer.

States per item:
- `isValid === null`: text `#ffffff`, prefix `•` in `#666666`
- `isValid === true`: text `#00ff88`, no prefix
- `isValid === false`: text `#ff2d00`, `text-decoration: line-through`

Font: `Space Grotesk 14px`

Forbidden: checkboxes, check/X icons, row background colors, badges, pills.

### PlayerRow

Props:
- `name: string`
- `score: number`
- `isHost: boolean`
- `isCurrentTurn: boolean`

Render: single row, flex, space-between.

States:
- `isCurrentTurn`: name in `#00ff88`
- `!isCurrentTurn`: name in `#ffffff`
- `isHost`: append " (host)" in `#666666 12px`
- Score: `IBM Plex Mono 14px #ffffff`, right-aligned

Forbidden: avatar, initials circle, progress bar, crown icon, score badge.

### RoundIndicator

Props:
- `currentRound: number` (1-5)

Render: 5 numbers in a horizontal row: `1  2  3  4  5`

States per number:
- `< currentRound`: `#666666` (completed)
- `=== currentRound`: `#00ff88` (active)
- `> currentRound`: `#333333` (pending)

Font: `IBM Plex Mono 14px`

Forbidden: connected step circles, animated progress bars, checkmarks on completed rounds.

### GameCode

Props:
- `code: string`

Render:
- Code in `IBM Plex Mono 24px #ffffff`, letter-spacing `0.1em`
- On click: copy to clipboard, briefly show "copiado" in `#00ff88 12px` below

Forbidden: copy icon button, QR code, tooltip, decorative border.

## Explicitly Forbidden

The following must never appear in the UI:

- Cards with shadow (`box-shadow`)
- Decorative icons (FontAwesome, Lucide, emojis as UI elements)
- Classic progress bars (horizontal fill bars)
- Avatars or user initials in circles
- Pill buttons (`border-radius: 999px`)
- Gradient backgrounds or text
- Glassmorphism (`backdrop-filter`, translucent overlays)
- Slide-in animations (fade-in is acceptable)
- Decorative toasts or snackbars
- Modals or overlays (use full-screen states instead)
- Decorative borders or frames around content
