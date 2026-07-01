# Implementation Plan: Personal Dashboard

## Overview

Implement a zero-dependency, single-page personal dashboard as three files (`index.html`, `css/styles.css`, `js/app.js`). Each task builds incrementally from foundational structure through individual widgets, finishing with integration and cross-cutting concerns.

## Tasks

- [x] 1. Set up project structure and core scaffolding
  - Create `index.html` with semantic HTML skeleton: `<html>`, `<head>`, `<body>`, and one `<section>` placeholder per widget (greeting, timer, task list, quick links, settings)
  - Create `css/styles.css` with CSS custom properties for the light theme colour palette and typography baseline (minimum 14px body font, heading and label size rules)
  - Create `js/app.js` with the top-level IIFE shell and a stubbed `DOMContentLoaded` listener that calls each module's `init()` in the correct order (Theme → Greeting → Timer → TaskList → QuickLinks → Settings)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 10.3_

- [x] 2. Implement Storage utility
  - [x] 2.1 Implement `Storage.get`, `Storage.set`, and `Storage.remove` inside the IIFE, each wrapped in `try/catch`; read failures `console.error` with a descriptive message; write failures are silently ignored
    - Define the five storage key constants: `dashboard_tasks`, `dashboard_links`, `dashboard_name`, `dashboard_timer_duration`, `dashboard_theme`
    - _Requirements: 8.1, 8.3, 8.4_

  - [ ]* 2.2 Write unit tests for Storage utility
    - Test `get` returns `null` on missing key
    - Test `set` then `get` round-trip
    - Test that a simulated `localStorage` error on read triggers `console.error` and returns `null`
    - _Requirements: 8.3, 8.4_

- [x] 3. Implement ThemeManager
  - [x] 3.1 Implement `ThemeManager.apply(theme)`, `ThemeManager.toggle()`, and `ThemeManager.init()`
    - `apply` sets `data-theme` on `<html>` and updates the toggle button's `aria-label` and icon
    - `init` reads storage, falls back to `prefers-color-scheme`, then `"light"`
    - `toggle` flips theme, calls `Storage.set`, calls `apply`
    - Add dark-theme CSS custom properties block in `styles.css` under `[data-theme="dark"]`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 3.2 Write property test for ThemeManager — Property 13: Theme toggle is an involution
    - **Property 13: Theme toggle is an involution**
    - **Validates: Requirements 7.2, 7.3**

  - [ ]* 3.3 Write property test for ThemeManager — Property 14: Theme persistence round-trip
    - **Property 14: Theme persistence round-trip**
    - **Validates: Requirements 7.3, 7.4**

- [x] 4. Checkpoint — Ensure Storage and ThemeManager tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement GreetingWidget
  - [x] 5.1 Implement `GreetingWidget.getGreeting(hour)`, `GreetingWidget.formatTime(date)`, `GreetingWidget.formatDate(date)`, `GreetingWidget.tick()`, and `GreetingWidget.init()`
    - `getGreeting` maps hour ranges to the four greeting strings per the requirements table
    - `formatTime` uses `Intl.DateTimeFormat` with locale-aware 12/24-hour selection, defaulting to 24-hour
    - `formatDate` returns `"Weekday, Month Day, Year"` (e.g., "Wednesday, July 1, 2026")
    - `tick` updates the time/date DOM elements; `init` starts the 1000 ms interval and renders the initial state
    - Listen for the custom `namechange` DOM event and re-render the greeting line
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 2.3_

  - [ ]* 5.2 Write property test for GreetingWidget — Property 1: Greeting reflects current hour
    - **Property 1: Greeting reflects current hour**
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**

  - [ ]* 5.3 Write property test for GreetingWidget — Property 2: Greeting with name appended
    - **Property 2: Greeting with name appended**
    - **Validates: Requirements 1.7, 1.8, 2.3, 2.6**

  - [ ]* 5.4 Write unit tests for GreetingWidget
    - Test `getGreeting` at each boundary hour: 0, 4, 5, 11, 12, 17, 18, 21, 22, 23
    - Test `formatDate` returns correct string for a known `Date` instance
    - _Requirements: 1.3, 1.4, 1.5, 1.6_

- [x] 6. Implement SettingsPanel
  - [x] 6.1 Implement `SettingsPanel.saveName(value)`, `SettingsPanel.saveDuration(value)`, and `SettingsPanel.init()`
    - `saveName`: validate 1–50 chars with at least one non-whitespace character; persist via `Storage.set`; dispatch `namechange` custom event; show inline error if invalid
    - `saveDuration`: validate integer in 1–120; persist via `Storage.set`; dispatch `durationchange` custom event; show inline error if invalid
    - `init`: bind input and submit events for both fields; populate fields with stored values on load
    - Add the settings form markup in `index.html` (name input, duration input, submit buttons)
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6, 4.1, 4.2, 4.6_

  - [ ]* 6.2 Write property test for SettingsPanel — Property 3: Name validation and persistence round-trip
    - **Property 3: Name validation and persistence round-trip**
    - **Validates: Requirements 2.2, 2.5, 2.6**

  - [ ]* 6.3 Write property test for SettingsPanel — Property 6: Timer duration persistence round-trip
    - **Property 6: Timer duration persistence round-trip**
    - **Validates: Requirements 4.2, 4.6**

  - [ ]* 6.4 Write unit tests for SettingsPanel validation
    - Test name: exactly 50 chars (valid), 51 chars (invalid), whitespace-only (invalid), empty (invalid)
    - Test duration: 1 (valid), 120 (valid), 0 (invalid), 121 (invalid), 25.5 (invalid), non-numeric (invalid)
    - _Requirements: 2.2, 2.5, 2.6, 4.2, 4.6_

- [x] 7. Checkpoint — Ensure Greeting and Settings tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement TimerWidget
  - [x] 8.1 Implement `TimerWidget.formatTime(secs)`, `TimerWidget.renderControls()`, `TimerWidget.tick()`, `TimerWidget.onComplete()`, `TimerWidget.start()`, `TimerWidget.stop()`, `TimerWidget.reset()`, and `TimerWidget.init()`
    - `formatTime(secs)` returns `"MM:SS"` with zero-padding; never returns a value below `"00:00"`
    - State machine: `stopped → running` on `start()`; `running → paused` on `stop()`; any state → `stopped` on `reset()`; `running → stopped` when `tick()` reaches 0
    - `renderControls` enables Start when not running; enables Stop when running
    - `onComplete` clears the interval, synthesises a beep via `AudioContext` + `OscillatorNode` (skip silently if unavailable), and fires a browser notification if `Notification.permission === "granted"`
    - Listen for `durationchange` event: if timer is not running, reset display to new duration; otherwise apply after current session ends
    - Add timer markup in `index.html` (display, Start/Stop/Reset buttons)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.3, 4.4, 4.5_

  - [ ]* 8.2 Write property test for TimerWidget — Property 4: Timer countdown correctness
    - **Property 4: Timer countdown correctness**
    - **Validates: Requirements 3.2, 3.7**

  - [ ]* 8.3 Write property test for TimerWidget — Property 5: Timer controls enabled/disabled state invariant
    - **Property 5: Timer controls enabled/disabled state invariant**
    - **Validates: Requirements 3.8**

  - [ ]* 8.4 Write property test for TimerWidget — Property 15: `formatTime` correctness
    - **Property 15: `formatTime` MM:SS correctness**
    - **Validates: Requirements 3.1**

  - [ ]* 8.5 Write unit tests for TimerWidget
    - Test `formatTime` at boundary values: 0, 59, 60, 3599, 7200
    - Test state transitions: stopped → running → paused → running → stopped (via reset)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 3.8_

- [x] 9. Checkpoint — Ensure Timer tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement TaskListWidget
  - [x] 10.1 Implement `TaskListWidget.addTask(text)`, `TaskListWidget.deleteTask(id)`, `TaskListWidget.toggleComplete(id)`, `TaskListWidget.startEdit(id)`, `TaskListWidget.saveEdit(id, text)`, `TaskListWidget.cancelEdit(id)`, `TaskListWidget.render()`, and `TaskListWidget.init()`
    - Task model: `{ id, text, completed, createdAt }` — generate `id` as `${Date.now()}-${Math.random()}`
    - `addTask`: validate 1–200 chars with at least one non-whitespace character; push to array; persist; render; show inline error otherwise
    - `deleteTask` / `toggleComplete`: mutate array; persist; render
    - `startEdit`: replace task row with editable field pre-filled with current text; show Save and Cancel
    - `saveEdit`: validate same rules as add; update text; persist; render; show inline error otherwise
    - `cancelEdit`: re-render row with original text; exit edit mode
    - `render`: rebuild task list DOM; visually distinguish completed tasks with strikethrough
    - `init`: load from storage (show empty list + error indication on failure); render
    - Add task list markup in `index.html` (text input, Add button, task list container)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 5.12, 5.13_

  - [ ]* 10.2 Write property test for TaskListWidget — Property 7: Task addition grows the list
    - **Property 7: Task addition grows the list**
    - **Validates: Requirements 5.2**

  - [ ]* 10.3 Write property test for TaskListWidget — Property 8: Invalid task text is rejected
    - **Property 8: Invalid task text is rejected**
    - **Validates: Requirements 5.3, 5.8**

  - [ ]* 10.4 Write property test for TaskListWidget — Property 9: Task persistence round-trip
    - **Property 9: Task persistence round-trip**
    - **Validates: Requirements 5.2, 5.5, 5.7, 5.10, 5.11**

  - [ ]* 10.5 Write unit tests for TaskListWidget
    - Test add valid task, add empty string (rejected), add 201-char string (rejected)
    - Test toggle completion updates `completed` flag and persists
    - Test delete removes task and persists
    - Test edit-save with valid text updates task; edit-save with empty text shows error
    - _Requirements: 5.2, 5.3, 5.5, 5.7, 5.8, 5.10_

- [x] 11. Implement QuickLinksWidget
  - [x] 11.1 Implement `QuickLinksWidget.normaliseUrl(url)`, `QuickLinksWidget.validateUrl(url)`, `QuickLinksWidget.addLink(label, url)`, `QuickLinksWidget.deleteLink(id)`, `QuickLinksWidget.render()`, and `QuickLinksWidget.init()`
    - `normaliseUrl`: prepend `"https://"` if URL does not start with `"http://"` or `"https://"`
    - `validateUrl`: require a scheme, non-empty host, and no whitespace
    - `addLink`: validate label (1–50 chars) and URL; normalise URL; enforce 20-link cap; push; persist; render; show inline error for each invalid field or cap exceeded
    - `deleteLink`: filter array; persist; render
    - `render`: rebuild panel DOM with one button per link (opens in new tab) and a Delete control beside each; show empty-state message when list is empty; continue operating without crash if a write fails
    - `init`: load from storage (show empty panel + error message on read failure); render
    - Add quick links markup in `index.html` (label input, URL input, Add button, links container)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11, 6.12, 6.13_

  - [ ]* 11.2 Write property test for QuickLinksWidget — Property 10: Quick link URL normalisation
    - **Property 10: Quick link URL normalisation**
    - **Validates: Requirements 6.5**

  - [ ]* 11.3 Write property test for QuickLinksWidget — Property 11: Quick links persistence round-trip
    - **Property 11: Quick links persistence round-trip**
    - **Validates: Requirements 6.2, 6.8, 6.9**

  - [ ]* 11.4 Write property test for QuickLinksWidget — Property 12: Quick links maximum enforced
    - **Property 12: Quick links maximum enforced**
    - **Validates: Requirements 6.11**

  - [ ]* 11.5 Write unit tests for QuickLinksWidget
    - Test `normaliseUrl` with already-prefixed `http://`, `https://`, and bare domain
    - Test `validateUrl` with valid URL, missing scheme (after normalisation), whitespace, empty string
    - Test `addLink` at 19 links (succeeds), 20 links (rejected with validation message)
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.11_

- [x] 12. Checkpoint — Ensure TaskList and QuickLinks tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Implement responsive layout and accessibility
  - [x] 13.1 Add CSS grid layout rules in `styles.css`: ≥768 px → at least 2-column grid; <768 px → single-column stacked layout via media query
    - Apply visual hierarchy rules: headings ≥ body + 4 px; labels ≥ body + 2 px; body min 14 px
    - _Requirements: 9.3, 9.4, 9.5, 9.6_

  - [x] 13.2 Add accessible labels to all interactive controls in `index.html`
    - Every button, input, and toggle must have an `aria-label` or associated `<label>` element
    - Theme toggle must reflect active theme in its `aria-label`
    - _Requirements: 10.1_

- [x] 14. Wire all modules together and validate initialization order
  - [x] 14.1 Confirm the `DOMContentLoaded` handler calls all six `init()` functions in the correct order (ThemeManager → GreetingWidget → TimerWidget → TaskListWidget → QuickLinksWidget → SettingsPanel) and that no widget references a DOM element before it has been inserted by the HTML
    - Verify `dashboard_name`, `dashboard_timer_duration`, and `dashboard_theme` are read from storage before the first render call in each respective widget
    - _Requirements: 7.4, 8.2, 4.3_

  - [ ]* 14.2 Write integration smoke test
    - Instantiate all modules against a jsdom-like environment (or open `index.html` in a browser automation context), interact with each widget, and assert that all five `localStorage` keys are written with valid values
    - _Requirements: 8.1, 8.2_

- [x] 15. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests (using fast-check, loadable from CDN without a build step) validate universal correctness properties; each test must run a minimum of 100 iterations and include the comment `// Feature: personal-dashboard, Property N: <property_text>`
- Unit tests validate specific examples, edge cases, and boundary conditions
- The entire app ships as three files (`index.html`, `css/styles.css`, `js/app.js`) — no build tools, no external runtime dependencies

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1"] },
    { "id": 1, "tasks": ["3.1", "2.2"] },
    { "id": 2, "tasks": ["5.1", "6.1", "3.2", "3.3"] },
    { "id": 3, "tasks": ["8.1", "5.2", "5.3", "5.4", "6.2", "6.3", "6.4"] },
    { "id": 4, "tasks": ["10.1", "11.1", "8.2", "8.3", "8.4", "8.5"] },
    { "id": 5, "tasks": ["13.1", "13.2", "10.2", "10.3", "10.4", "10.5", "11.2", "11.3", "11.4", "11.5"] },
    { "id": 6, "tasks": ["14.1"] },
    { "id": 7, "tasks": ["14.2"] }
  ]
}
```
