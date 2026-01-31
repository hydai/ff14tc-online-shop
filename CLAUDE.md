## UI Components

Interactive UI primitives use [`@base-ui/react`](https://base-ui.com/) — an unstyled, accessible component library styled with Tailwind CSS.

### Component mapping

| Base UI Component | Used in | Purpose |
|---|---|---|
| `Progress.Root/Track/Indicator` | `ProgressBar.tsx` | Purchase progress bar |
| `Field.Root` + `Field.Label` + `Input` | `SearchBar.tsx` | Search input with sr-only label |
| `Checkbox.Root/Indicator` | `FilterCheckbox.tsx` | Toggle filters (hide purchased, wishlist, price drop) |
| `ToggleGroup` + `Toggle` | `CategoryFilter.tsx` | Category pill selectors |
| `Toggle` | `ItemCard.tsx` | Heart (wishlist) and checkmark (purchased) buttons |
| `Popover.Root/Trigger/Portal/Positioner/Popup` | `ProfileManager.tsx` | Profile dropdown with auto outside-click dismissal |

### Conventions

- Import from deep paths: `import { Progress } from '@base-ui/react/progress'`
- Style active states via data attributes: `data-[pressed]:`, `data-[checked]:`
- Use `Popover` for any dropdown/panel that needs outside-click dismissal — do not write manual `useEffect` click handlers
- Wrap portaled components in a stacking context (`isolate relative` on `layout.tsx` body child)

## Browser Automation

Use `agent-browser` for web automation. Run `agent-browser --help` for all commands.

Core workflow:
1. `agent-browser open <url>` - Navigate to page
2. `agent-browser snapshot -i` - Get interactive elements with refs (@e1, @e2)
3. `agent-browser click @e1` / `fill @e2 "text"` - Interact using refs
4. Re-snapshot after page changes
