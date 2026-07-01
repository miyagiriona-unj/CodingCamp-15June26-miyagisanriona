# Requirements Document

## Introduction

A personal dashboard web application built with HTML, CSS, and Vanilla JavaScript (no frameworks, no backend). All data is stored client-side using the Browser Local Storage API. The dashboard provides a greeting with live clock, a Pomodoro focus timer, a to-do list, and a quick links panel. It supports light/dark mode and user-configurable settings.

## Glossary

- **Dashboard**: The single-page web application serving as the user's personal home screen.
- **Greeting_Widget**: The UI component that displays the current time, date, and a personalized greeting message.
- **Timer**: The Pomodoro focus timer component with configurable duration.
- **TaskList**: The to-do list component for managing personal tasks.
- **QuickLinks**: The component that displays user-defined shortcut buttons to favorite websites.
- **Storage**: The Browser Local Storage API used to persist user data client-side.
- **User**: The person interacting with the Dashboard in a modern web browser.
- **Theme**: The visual color scheme of the Dashboard, either light or dark.
- **Session**: A single Pomodoro timer countdown from the configured duration to zero.

---

## Requirements

### Requirement 1: Live Greeting and Clock

**User Story:** As a User, I want to see the current time, date, and a personalized greeting, so that I have an at-a-glance sense of when it is and feel welcomed by the Dashboard.

#### Acceptance Criteria

1. WHEN the page is loaded or running, THE Greeting_Widget SHALL display the current time updated at most every 1000ms (±100ms tolerance), formatted in 12-hour format (with AM/PM suffix) if the browser locale uses 12-hour time, or 24-hour format (HH:MM:SS) otherwise; if the locale preference cannot be determined, THE Greeting_Widget SHALL default to 24-hour format.
2. THE Greeting_Widget SHALL display the current date in the order: full day name, full month name, numeric day, 4-digit year (e.g., "Wednesday, July 1, 2026").
3. IF the current local hour is between 5 and 11 (inclusive), THEN THE Greeting_Widget SHALL display the greeting "Good morning".
4. IF the current local hour is between 12 and 17 (inclusive), THEN THE Greeting_Widget SHALL display the greeting "Good afternoon".
5. IF the current local hour is between 18 and 21 (inclusive), THEN THE Greeting_Widget SHALL display the greeting "Good evening".
6. IF the current local hour is between 22 and 23 or between 0 and 4 (inclusive), THEN THE Greeting_Widget SHALL display the greeting "Good night".
7. WHEN the User has saved a custom name of 1–50 characters, THE Greeting_Widget SHALL append the custom name to the greeting separated by a comma and a space (e.g., "Good morning, Alex").
8. WHEN no custom name is saved, THE Greeting_Widget SHALL display the greeting without a name suffix.

---

### Requirement 2: Custom Name Setting

**User Story:** As a User, I want to set and update my name in the Dashboard, so that the greeting feels personal.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a visible text input field for the User to enter a custom name.
2. WHEN the User submits a custom name that is between 1 and 50 characters and contains at least one non-whitespace character, THE Storage SHALL persist the name under a defined key so it survives page reloads.
3. WHEN the page loads, THE Greeting_Widget SHALL retrieve the custom name from Storage and display it in the greeting.
4. WHEN the User clears or removes the custom name, THE Storage SHALL remove the name entry and THE Greeting_Widget SHALL revert to the nameless greeting as a coordinated response to that single user action.
5. IF the User submits a name exceeding 50 characters, THEN THE Dashboard SHALL display a validation message and SHALL NOT persist the value.
6. IF the User submits a name consisting entirely of whitespace characters, THEN THE Dashboard SHALL treat it as empty, SHALL NOT persist the value, and THE Greeting_Widget SHALL display the nameless greeting.

---

### Requirement 3: Focus Timer (Pomodoro)

**User Story:** As a User, I want a Pomodoro-style countdown timer with Start, Stop, and Reset controls, so that I can manage focused work sessions.

#### Acceptance Criteria

1. THE Timer SHALL display a countdown in MM:SS format initialized to the configured duration (a whole number of minutes between 1 and 120, defaulting to 25 if no value is stored).
2. WHEN the User activates the Start control, THE Timer SHALL begin counting down one second per real-world second.
3. WHEN the User activates the Stop control while the Timer is running, THE Timer SHALL pause the countdown and retain the remaining time.
4. WHEN the User activates the Start control while the Timer is paused, THE Timer SHALL resume counting down from the retained remaining time.
5. WHEN the User activates the Start control while the Timer is already running, THE Timer SHALL ignore the activation and continue running unchanged.
6. WHEN the User activates the Reset control, THE Timer SHALL stop counting down and reset the display to the configured duration.
7. WHEN the Timer countdown reaches 00:00, THE Timer SHALL stop automatically; an audible beep SHALL always play, and a browser notification SHALL fire if and only if the User has previously granted notification permission.
8. WHILE the Timer widget is displayed, THE Timer SHALL show the Start, Stop, and Reset controls; the Start control SHALL be enabled when the Timer is paused or stopped, and disabled when the Timer is running; the Stop control SHALL be enabled when the Timer is running, and disabled otherwise.
9. WHEN the User activates the Start control while the Timer displays 00:00, THE Timer SHALL reset to the configured duration and begin counting down immediately.

---

### Requirement 4: Configurable Timer Duration

**User Story:** As a User, I want to change the Pomodoro timer duration, so that I can adjust session length to my preferred work rhythm.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a numeric input for the User to set the Timer duration in whole minutes, with a minimum value of 1 and a maximum value of 120.
2. WHEN the User saves a new duration within the valid range, THE Storage SHALL persist the duration value.
3. WHEN the page loads, THE Timer SHALL read the persisted duration from Storage; if no value is stored, THE Timer SHALL default to 25 minutes.
4. WHEN the User saves a new duration while the Timer is not running, THE Timer SHALL immediately reset its display to the new duration.
5. WHEN the User saves a new duration while the Timer is running, THE Timer SHALL continue the current session and apply the new duration only after the current session ends or the Timer is reset.
6. IF the User enters a duration outside the range of 1–120 minutes or a non-integer value, THEN THE Dashboard SHALL display a validation message and SHALL NOT persist the invalid value.

---

### Requirement 5: To-Do List

**User Story:** As a User, I want to add, edit, complete, and delete tasks in a to-do list, so that I can track my work directly from the Dashboard.

#### Acceptance Criteria

1. THE TaskList SHALL provide a text input (max 200 characters) and an Add button for creating new tasks.
2. WHEN the User submits a non-empty task name (1–200 characters), THE TaskList SHALL add the task to the list and persist all tasks to Storage.
3. IF the User submits an empty task name or a name exceeding 200 characters, THEN THE TaskList SHALL display a validation message and SHALL NOT add the task.
4. THE TaskList SHALL display each task with a completion checkbox, the task text, an Edit control, and a Delete control.
5. WHEN the User toggles the completion checkbox of a task, THE TaskList SHALL update the task's completed state and persist the change to Storage.
6. WHEN the User activates the Edit control for a task, THE TaskList SHALL render the task text as an editable field pre-filled with the current text, and SHALL display Save and Cancel controls.
7. WHEN the User saves an edited task with non-empty text (1–200 characters), THE TaskList SHALL update the task text in the list and persist the change to Storage.
8. IF the User saves an edited task with empty text or text exceeding 200 characters, THEN THE TaskList SHALL display a validation message and SHALL NOT update the task.
9. WHEN the User activates the Cancel control during editing, THE TaskList SHALL discard changes, restore the original task text, and exit edit mode.
10. WHEN the User activates the Delete control for a task, THE TaskList SHALL remove the task from the list and persist the updated list to Storage.
11. WHEN the page loads, THE TaskList SHALL retrieve all persisted tasks from Storage and render them in the order they were saved.
12. THE TaskList SHALL visually distinguish completed tasks from incomplete tasks using strikethrough text on the task name.
13. IF the Storage read operation fails on page load, THEN THE TaskList SHALL render an empty list and display an error indication to the User.

---

### Requirement 6: Quick Links

**User Story:** As a User, I want to save and access shortcut buttons to my favorite websites, so that I can navigate quickly from the Dashboard.

#### Acceptance Criteria

1. THE QuickLinks SHALL provide a form with a label input (max 50 characters) and a URL input (max 2048 characters) for the User to add a new quick link.
2. WHEN the User submits a link with a non-empty label (1–50 chars) and a valid URL (a string with a scheme, a non-empty host, and no whitespace), THE QuickLinks SHALL add a button to the panel and persist all links to Storage.
3. IF the User submits a link with an empty label, THEN THE QuickLinks SHALL display an inline validation message indicating the label field is missing, and SHALL NOT add the link.
4. IF the User submits a link with an empty URL, THEN THE QuickLinks SHALL display an inline validation message indicating the URL field is missing, and SHALL NOT add the link.
5. IF the User submits a URL that does not begin with "http://" or "https://", THEN THE QuickLinks SHALL prepend "https://" to the URL before saving.
6. WHEN the User activates a quick link button, THE Dashboard SHALL open the associated URL in a new browser tab.
7. THE QuickLinks SHALL display a Delete control beside each link button.
8. WHEN the User activates the Delete control for a quick link, THE QuickLinks SHALL remove the link from the panel and persist the updated list to Storage.
9. WHEN the page loads and persisted links exist, THE QuickLinks SHALL retrieve all persisted links from Storage and render them as buttons.
10. WHEN the page loads and no persisted links exist, THE QuickLinks SHALL display an empty-state message prompting the User to add their first link.
11. IF the User attempts to add a link when 20 quick links are already saved, THEN THE QuickLinks SHALL display a validation message indicating the limit has been reached, and SHALL NOT add the new link.
12. IF the Storage read operation fails on page load, THEN THE QuickLinks SHALL render an empty panel and display an error message to the User.
13. IF a Storage write operation fails, THEN THE QuickLinks SHALL continue operating without crashing and SHALL NOT remove the link from the displayed panel.

---

### Requirement 7: Light / Dark Mode Toggle

**User Story:** As a User, I want to toggle between light and dark visual themes, so that I can choose a comfortable viewing experience.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a toggle control that is always rendered and accessible, and that visually reflects the currently active Theme (e.g., a sun icon for light, a moon icon for dark).
2. WHEN the User activates the toggle, THE Dashboard SHALL switch the active Theme and apply the new color scheme to all visible components without a page reload.
3. WHEN the User activates the toggle, THE Storage SHALL persist the newly active Theme value.
4. WHEN the page loads, THE Dashboard SHALL retrieve the persisted Theme from Storage and apply it before rendering content, to avoid a flash of the wrong theme.
5. WHEN no Theme preference is stored at page load, THE Dashboard SHALL apply the Theme that matches the browser's `prefers-color-scheme` media query value; if the media query is also indeterminate, THE Dashboard SHALL apply the light Theme.

---

### Requirement 8: Data Persistence and Storage Integrity

**User Story:** As a User, I want all my settings and data to be automatically saved, so that my Dashboard is fully restored on every page load without manual re-entry.

#### Acceptance Criteria

1. THE Storage SHALL persist tasks, quick links, custom name, timer duration, and theme preference as separate, identifiable keys (e.g., `dashboard_tasks`, `dashboard_links`, `dashboard_name`, `dashboard_timer_duration`, `dashboard_theme`).
2. WHEN the page loads, THE Dashboard SHALL read all persisted values from Storage before rendering any widget, so widgets initialize with the correct saved state.
3. IF Storage is unavailable or a read operation fails, THEN THE Dashboard SHALL log a descriptive error message to the browser console and SHALL render the affected widget with its documented default values.
4. IF Storage is unavailable or a write operation fails, THEN THE Dashboard SHALL continue operating without crashing; write failures SHALL be silently ignored (no error logged to the console for write failures).

---

### Requirement 9: Responsive Layout and Visual Design

**User Story:** As a User, I want the Dashboard to look clean, readable, and work well on different screen sizes, so that I can use it on a desktop or a laptop without any visual issues.

#### Acceptance Criteria

1. THE Dashboard SHALL use a single CSS file located at `css/styles.css` for all styling.
2. THE Dashboard SHALL use a single JavaScript file located at `js/app.js` for all scripting logic.
3. THE Dashboard SHALL apply a clear visual hierarchy: heading elements SHALL have a font size at least 4px larger than body text, and label elements SHALL have a font size at least 2px larger than body text.
4. THE Dashboard SHALL use readable typography with a minimum body font size of 14px.
5. WHEN the viewport width is 768px or wider, THE Dashboard SHALL display widgets in a grid layout with at least 2 columns.
6. WHEN the viewport width is below 768px, THE Dashboard SHALL display widgets in a single-column stacked layout.
7. THE Dashboard SHALL load and render all content within 2 seconds when opened as a local HTML file with all assets stored locally, measured from navigation start to the DOMContentLoaded event.

---

### Requirement 10: Browser Compatibility

**User Story:** As a User, I want the Dashboard to work correctly in modern browsers, so that I am not restricted to a specific browser.

#### Acceptance Criteria

1. THE Dashboard SHALL render all UI elements visibly and interactively in the latest stable release of Chrome, Firefox, Edge, and Safari, with no uncaught JavaScript errors reported in the browser console.
2. THE Dashboard SHALL use only Web APIs defined in WHATWG or W3C specifications, without requiring polyfills, transpilation, or vendor-prefixed APIs.
3. THE Dashboard SHALL operate as a standalone HTML file opened directly in a browser without requiring a web server or build tool.
