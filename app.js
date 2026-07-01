/**
 * Personal Dashboard — app.js
 *
 * All application logic lives inside a single top-level IIFE so that no
 * variables are leaked into the global scope.
 *
 * Initialization order (DOMContentLoaded):
 *   1. ThemeManager.init()
 *   2. GreetingWidget.init()
 *   3. TimerWidget.init()
 *   4. TaskListWidget.init()
 *   5. QuickLinksWidget.init()
 *   6. SettingsPanel.init()
 *
 * Requirements: 9.1, 9.2, 9.3, 9.4, 10.3
 */

(function () {
  'use strict';

  /* =========================================================================
     Storage Keys
     ======================================================================= */
  const KEYS = {
    TASKS:    'dashboard_tasks',
    LINKS:    'dashboard_links',
    NAME:     'dashboard_name',
    DURATION: 'dashboard_timer_duration',
    THEME:    'dashboard_theme',
  };

  /* =========================================================================
     Storage Utility
     Requirement 8: wraps every localStorage call in try/catch
     ======================================================================= */
  const Storage = {
    /**
     * Retrieve and JSON-parse a stored value.
     * On failure, logs a descriptive error and returns null.
     * @param {string} key
     * @returns {*} parsed value, or null
     */
    get(key) {
      try {
        const raw = localStorage.getItem(key);
        if (raw === null) return null;
        return JSON.parse(raw);
      } catch (err) {
        console.error(`[Storage] Failed to read key "${key}":`, err);
        return null;
      }
    },

    /**
     * JSON-serialize and store a value.
     * Write failures are silently ignored (Requirement 8.4).
     * @param {string} key
     * @param {*} value
     */
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (_) {
        // Silently ignore write failures per Requirement 8.4
      }
    },

    /**
     * Remove a key from storage.
     * Failures are silently ignored.
     * @param {string} key
     */
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (_) {
        // Silently ignore
      }
    },
  };

  /* =========================================================================
     ThemeManager
     Requirements: 7.1–7.5
     ======================================================================= */
  const ThemeManager = {
    /** Apply a theme by setting the data-theme attribute on <html>.
     *  Also updates the toggle button's aria-label and icon.
     *  Requirements: 7.1, 7.2
     */
    apply(theme) {
      document.documentElement.setAttribute('data-theme', theme);

      var btn  = document.getElementById('theme-toggle');
      var icon = btn && btn.querySelector('.theme-icon');

      if (theme === 'dark') {
        if (btn)  btn.setAttribute('aria-label', 'Switch to light theme');
        if (icon) icon.textContent = '🌙';
      } else {
        if (btn)  btn.setAttribute('aria-label', 'Switch to dark theme');
        if (icon) icon.textContent = '☀️';
      }
    },

    /** Flip the active theme, persist to storage, and re-apply.
     *  Requirements: 7.2, 7.3
     */
    toggle() {
      var current = document.documentElement.getAttribute('data-theme') || 'light';
      var next    = current === 'dark' ? 'light' : 'dark';
      Storage.set(KEYS.THEME, next);
      ThemeManager.apply(next);
    },

    /** Read storage → prefers-color-scheme → "light"; bind toggle button.
     *  Requirements: 7.4, 7.5
     */
    init() {
      var stored = Storage.get(KEYS.THEME);
      var theme;

      if (stored === 'light' || stored === 'dark') {
        theme = stored;
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        theme = 'dark';
      } else {
        theme = 'light';
      }

      ThemeManager.apply(theme);

      var btn = document.getElementById('theme-toggle');
      if (btn) {
        btn.addEventListener('click', function () {
          ThemeManager.toggle();
        });
      }
    },
  };

  /* =========================================================================
     GreetingWidget
     Requirements: 1.1–1.8, 2.3
     ======================================================================= */
  const GreetingWidget = {
    /** Stored display name (empty string = no name). */
    _name: '',

    /**
     * Return the greeting string for the given hour (0–23).
     * 5–11  → "Good morning"
     * 12–17 → "Good afternoon"
     * 18–21 → "Good evening"
     * 22–23 or 0–4 → "Good night"
     * Requirements: 1.3, 1.4, 1.5, 1.6
     * @param {number} hour  integer 0–23
     * @returns {string}
     */
    getGreeting(hour) {
      if (hour >= 5 && hour <= 11)  return 'Good morning';
      if (hour >= 12 && hour <= 17) return 'Good afternoon';
      if (hour >= 18 && hour <= 21) return 'Good evening';
      return 'Good night'; // 22–23 and 0–4
    },

    /**
     * Return a locale-aware time string for the given Date.
     * Uses Intl.DateTimeFormat to detect whether the locale uses 12-hour time.
     * - If true  → 12-hour format with AM/PM
     * - If false → HH:MM:SS in 24-hour format
     * - If indeterminate → default to 24-hour format
     * Requirement: 1.1
     * @param {Date} date
     * @returns {string}
     */
    formatTime(date) {
      var use12Hour;
      try {
        use12Hour = new Intl.DateTimeFormat(undefined, { hour: 'numeric' })
          .resolvedOptions().hour12;
      } catch (_) {
        use12Hour = undefined;
      }

      if (use12Hour === true) {
        // 12-hour with AM/PM
        return new Intl.DateTimeFormat(undefined, {
          hour:   'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }).format(date);
      }

      // 24-hour (use12Hour === false or undefined/indeterminate)
      var hh = String(date.getHours()).padStart(2, '0');
      var mm = String(date.getMinutes()).padStart(2, '0');
      var ss = String(date.getSeconds()).padStart(2, '0');
      return hh + ':' + mm + ':' + ss;
    },

    /**
     * Return "Weekday, Month Day, Year" for the given Date.
     * e.g. "Wednesday, July 1, 2026"
     * Requirement: 1.2
     * @param {Date} date
     * @returns {string}
     */
    formatDate(date) {
      return new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
        year:    'numeric',
        month:   'long',
        day:     'numeric',
      }).format(date);
    },

    /**
     * Update the time, date, and greeting DOM elements with the current time.
     * Requirements: 1.1, 1.2, 1.3–1.8
     */
    tick() {
      var now  = new Date();
      var hour = now.getHours();

      var timeEl     = document.getElementById('greeting-time');
      var dateEl     = document.getElementById('greeting-date');
      var messageEl  = document.getElementById('greeting-message');

      if (timeEl)    timeEl.textContent    = GreetingWidget.formatTime(now);
      if (dateEl)    dateEl.textContent    = GreetingWidget.formatDate(now);

      if (messageEl) {
        var greeting = GreetingWidget.getGreeting(hour);
        var name     = GreetingWidget._name;
        // Append ", Name" only when a non-empty name is stored (Req 1.7, 1.8)
        messageEl.textContent = name ? greeting + ', ' + name : greeting;
      }
    },

    /**
     * Read name from Storage, start the 1 s interval, render immediately,
     * and listen for 'namechange' events dispatched by SettingsPanel.
     * Requirements: 1.1, 2.3
     */
    init() {
      // Read persisted name (Requirement 2.3)
      var stored = Storage.get(KEYS.NAME);
      GreetingWidget._name = (typeof stored === 'string') ? stored : '';

      // Render immediately so the clock is visible before the first tick fires
      GreetingWidget.tick();

      // Update at most every 1000 ms (Requirement 1.1)
      setInterval(function () {
        GreetingWidget.tick();
      }, 1000);

      // React to name changes dispatched by SettingsPanel (Requirement 2.3)
      document.addEventListener('namechange', function (event) {
        var name = event.detail && event.detail.name;
        GreetingWidget._name = (typeof name === 'string') ? name : '';
        GreetingWidget.tick();
      });
    },
  };

  /* =========================================================================
     TimerWidget
     Requirements: 3.1–3.9, 4.3–4.5
     ======================================================================= */
  const TimerWidget = {
    /** Current state: 'stopped' | 'running' | 'paused' */
    _state: 'stopped',

    /** Configured duration in minutes (default 25). */
    _configuredDuration: 25,

    /** Remaining seconds on the clock. */
    _remainingSecs: 25 * 60,

    /** setInterval handle; null when not running. */
    _intervalId: null,

    /**
     * Return "MM:SS" string for the given number of seconds.
     * Clamps secs to a minimum of 0 so the display never goes below "00:00".
     * Requirements: 3.1
     * @param {number} secs
     * @returns {string}
     */
    formatTime(secs) {
      var s  = Math.max(0, Math.floor(secs));
      var mm = String(Math.floor(s / 60)).padStart(2, '0');
      var ss = String(s % 60).padStart(2, '0');
      return mm + ':' + ss;
    },

    /**
     * Enable/disable Start and Stop buttons based on current state.
     * Start disabled when running; Stop disabled when not running.
     * Requirements: 3.8
     */
    renderControls() {
      var startBtn = document.getElementById('timer-start');
      var stopBtn  = document.getElementById('timer-stop');
      var resetBtn = document.getElementById('timer-reset');

      if (startBtn) startBtn.disabled = (TimerWidget._state === 'running');
      if (stopBtn)  stopBtn.disabled  = (TimerWidget._state !== 'running');
      if (resetBtn) resetBtn.disabled = false;
    },

    /**
     * Decrement remaining seconds by 1 and update the display.
     * Calls onComplete() when the countdown reaches 0.
     * Requirements: 3.2, 3.7
     */
    tick() {
      TimerWidget._remainingSecs -= 1;

      var display = document.getElementById('timer-display');
      if (display) {
        display.textContent = TimerWidget.formatTime(TimerWidget._remainingSecs);
      }

      if (TimerWidget._remainingSecs <= 0) {
        TimerWidget.onComplete();
      }
    },

    /**
     * Stop interval, clamp display to 00:00, play beep, fire notification.
     * Requirements: 3.7
     */
    onComplete() {
      clearInterval(TimerWidget._intervalId);
      TimerWidget._intervalId = null;
      TimerWidget._state       = 'stopped';
      TimerWidget._remainingSecs = 0;

      var display = document.getElementById('timer-display');
      if (display) display.textContent = '00:00';

      TimerWidget.renderControls();

      // Play a short beep using Web Audio API (Requirement 3.7)
      try {
        var audioCtx   = new AudioContext();
        var oscillator = audioCtx.createOscillator();
        oscillator.connect(audioCtx.destination);
        oscillator.frequency.value = 880;
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
      } catch (_) {
        // Silently skip if Web Audio API is unavailable
      }

      // Fire browser notification if permission was previously granted (Requirement 3.7)
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('Focus session complete!', {
          body: 'Your Pomodoro timer has finished.',
        });
      }
    },

    /**
     * Transition to running state.
     * - No-op if already running (Req 3.5)
     * - If display is 00:00, resets to configured duration first (Req 3.9)
     * Requirements: 3.2, 3.4, 3.9
     */
    start() {
      if (TimerWidget._state === 'running') return; // no-op (Req 3.5)

      // If remaining time is 0 (display shows 00:00), reset to configured duration (Req 3.9)
      if (TimerWidget._remainingSecs <= 0) {
        TimerWidget._remainingSecs = TimerWidget._configuredDuration * 60;
      }

      TimerWidget._state = 'running';
      TimerWidget._intervalId = setInterval(TimerWidget.tick, 1000);

      var display = document.getElementById('timer-display');
      if (display) {
        display.textContent = TimerWidget.formatTime(TimerWidget._remainingSecs);
      }

      TimerWidget.renderControls();
    },

    /**
     * Transition to paused state.
     * No-op if not currently running.
     * Requirements: 3.3
     */
    stop() {
      if (TimerWidget._state !== 'running') return;

      clearInterval(TimerWidget._intervalId);
      TimerWidget._intervalId = null;
      TimerWidget._state      = 'paused';

      TimerWidget.renderControls();
    },

    /**
     * Stop interval, reset remaining seconds to configured duration, update display.
     * Requirements: 3.6
     */
    reset() {
      clearInterval(TimerWidget._intervalId);
      TimerWidget._intervalId    = null;
      TimerWidget._state         = 'stopped';
      TimerWidget._remainingSecs = TimerWidget._configuredDuration * 60;

      var display = document.getElementById('timer-display');
      if (display) {
        display.textContent = TimerWidget.formatTime(TimerWidget._remainingSecs);
      }

      TimerWidget.renderControls();
    },

    /**
     * Load saved duration from storage, initialise state, bind controls,
     * and listen for durationchange events from SettingsPanel.
     * Requirements: 3.1, 3.8, 4.3, 4.4, 4.5
     */
    init() {
      // Read stored duration; validate integer in 1–120; default to 25 (Req 4.3)
      var stored = Storage.get(KEYS.DURATION);
      var duration = 25;
      if (stored !== null) {
        var parsed = Number(stored);
        if (Number.isFinite(parsed) && Math.floor(parsed) === parsed && parsed >= 1 && parsed <= 120) {
          duration = Math.floor(parsed);
        }
      }
      TimerWidget._configuredDuration = duration;
      TimerWidget._remainingSecs      = duration * 60;

      var display = document.getElementById('timer-display');
      if (display) {
        display.textContent = TimerWidget.formatTime(TimerWidget._remainingSecs);
      }

      TimerWidget.renderControls();

      // Bind control buttons
      var startBtn = document.getElementById('timer-start');
      var stopBtn  = document.getElementById('timer-stop');
      var resetBtn = document.getElementById('timer-reset');

      if (startBtn) startBtn.addEventListener('click', function () { TimerWidget.start(); });
      if (stopBtn)  stopBtn.addEventListener('click',  function () { TimerWidget.stop();  });
      if (resetBtn) resetBtn.addEventListener('click', function () { TimerWidget.reset(); });

      // React to duration changes dispatched by SettingsPanel (Req 4.4, 4.5)
      document.addEventListener('durationchange', function (event) {
        var newDuration = event.detail && event.detail.duration;
        if (typeof newDuration !== 'number') return;

        TimerWidget._configuredDuration = newDuration;

        // Apply immediately only when the timer is not currently running (Req 4.4)
        // When running, the new duration takes effect after the session ends or is reset (Req 4.5)
        if (TimerWidget._state !== 'running') {
          TimerWidget._remainingSecs = newDuration * 60;
          var disp = document.getElementById('timer-display');
          if (disp) disp.textContent = TimerWidget.formatTime(TimerWidget._remainingSecs);
        }
      });
    },
  };

  /* =========================================================================
     TaskListWidget
     Requirements: 5.1–5.13
     ======================================================================= */
  const TaskListWidget = {
    /** In-memory array of Task objects. */
    _tasks: [],

    /**
     * Show an inline error message on an error element.
     * @param {HTMLElement} el  the error <p> element
     * @param {string} msg      the message to display
     */
    _showError(el, msg) {
      if (!el) return;
      el.textContent = msg;
      el.removeAttribute('hidden');
    },

    /**
     * Hide the inline error message on an error element.
     * @param {HTMLElement} el  the error <p> element
     */
    _clearError(el) {
      if (!el) return;
      el.textContent = '';
      el.setAttribute('hidden', '');
    },

    /**
     * Persist the in-memory task array to Storage.
     */
    _persist() {
      Storage.set(KEYS.TASKS, TaskListWidget._tasks);
    },

    /**
     * Validate and add a new task; persist; render.
     * Requirements: 5.1, 5.2, 5.3
     * @param {string} text  raw text from the task input
     */
    addTask(text) {
      var errorEl  = document.getElementById('task-error');
      var inputEl  = document.getElementById('task-input');
      var trimmed  = (typeof text === 'string') ? text.trim() : '';

      if (trimmed.length < 1 || trimmed.length > 200) {
        TaskListWidget._showError(
          errorEl,
          trimmed.length === 0
            ? 'Task text cannot be empty.'
            : 'Task text must be 200 characters or fewer.'
        );
        return;
      }

      var task = {
        id:        Date.now() + '-' + Math.random(),
        text:      trimmed,
        completed: false,
        createdAt: Date.now(),
      };

      TaskListWidget._tasks.push(task);
      TaskListWidget._persist();
      TaskListWidget.render();
      TaskListWidget._clearError(errorEl);
      if (inputEl) inputEl.value = '';
    },

    /**
     * Remove a task by id; persist; render.
     * Requirements: 5.10
     * @param {string} id
     */
    deleteTask(id) {
      TaskListWidget._tasks = TaskListWidget._tasks.filter(function (t) {
        return t.id !== id;
      });
      TaskListWidget._persist();
      TaskListWidget.render();
    },

    /**
     * Flip the completed flag for a task; persist; render.
     * Requirements: 5.5
     * @param {string} id
     */
    toggleComplete(id) {
      var task = TaskListWidget._tasks.find(function (t) { return t.id === id; });
      if (task) {
        task.completed = !task.completed;
        TaskListWidget._persist();
        TaskListWidget.render();
      }
    },

    /**
     * Replace the task's list row with an inline edit form.
     * Requirements: 5.6
     * @param {string} id
     */
    startEdit(id) {
      var task  = TaskListWidget._tasks.find(function (t) { return t.id === id; });
      var list  = document.getElementById('task-list');
      if (!task || !list) return;

      var li = list.querySelector('[data-id="' + id + '"]');
      if (!li) return;

      // Build edit input
      var editInput = document.createElement('input');
      editInput.type      = 'text';
      editInput.className = 'task-edit-input';
      editInput.value     = task.text;
      editInput.maxLength = 200;
      editInput.setAttribute('aria-label', 'Edit task text');

      // Save button
      var saveBtn = document.createElement('button');
      saveBtn.type      = 'button';
      saveBtn.className = 'btn btn--primary';
      saveBtn.textContent = 'Save';
      saveBtn.setAttribute('aria-label', 'Save task');
      saveBtn.addEventListener('click', function () {
        TaskListWidget.saveEdit(id, editInput.value);
      });

      // Cancel button
      var cancelBtn = document.createElement('button');
      cancelBtn.type      = 'button';
      cancelBtn.className = 'btn btn--secondary';
      cancelBtn.textContent = 'Cancel';
      cancelBtn.setAttribute('aria-label', 'Cancel edit');
      cancelBtn.addEventListener('click', function () {
        TaskListWidget.cancelEdit(id);
      });

      // Error element for inline save validation
      var editError = document.createElement('p');
      editError.className = 'error-msg';
      editError.setAttribute('hidden', '');
      editError.setAttribute('aria-live', 'polite');

      // Clear the <li> and inject edit controls
      li.innerHTML = '';
      li.appendChild(editInput);
      li.appendChild(saveBtn);
      li.appendChild(cancelBtn);
      li.appendChild(editError);

      editInput.focus();
    },

    /**
     * Validate and save edited task text; persist; render.
     * Requirements: 5.7, 5.8
     * @param {string} id
     * @param {string} text  raw value from the edit input
     */
    saveEdit(id, text) {
      var trimmed = (typeof text === 'string') ? text.trim() : '';

      if (trimmed.length < 1 || trimmed.length > 200) {
        // Show error in the <li>'s edit error element
        var list = document.getElementById('task-list');
        var li   = list && list.querySelector('[data-id="' + id + '"]');
        if (li) {
          var editError = li.querySelector('.error-msg');
          if (editError) {
            TaskListWidget._showError(
              editError,
              trimmed.length === 0
                ? 'Task text cannot be empty.'
                : 'Task text must be 200 characters or fewer.'
            );
          }
        }
        return;
      }

      var task = TaskListWidget._tasks.find(function (t) { return t.id === id; });
      if (task) {
        task.text = trimmed;
        TaskListWidget._persist();
        TaskListWidget.render();
      }
    },

    /**
     * Exit edit mode by re-rendering (restores original text).
     * Requirements: 5.9
     * @param {string} id
     */
    cancelEdit(id) {
      void id; // id unused — render() rebuilds all rows from in-memory state
      TaskListWidget.render();
    },

    /**
     * Rebuild the task list DOM from the in-memory array.
     * Requirements: 5.4, 5.5, 5.10, 5.11, 5.12
     */
    render() {
      var list = document.getElementById('task-list');
      if (!list) return;

      // Clear the list
      list.innerHTML = '';

      TaskListWidget._tasks.forEach(function (task) {
        var li = document.createElement('li');
        li.className = 'task-list__item';
        li.setAttribute('data-id', task.id);
        if (task.completed) {
          li.classList.add('task-list__item--completed');
        }

        // Completion checkbox
        var checkbox = document.createElement('input');
        checkbox.type      = 'checkbox';
        checkbox.className = 'task-list__checkbox';
        checkbox.checked   = task.completed;
        checkbox.setAttribute('aria-label', 'Mark task complete');
        checkbox.addEventListener('change', (function (taskId) {
          return function () {
            TaskListWidget.toggleComplete(taskId);
          };
        }(task.id)));

        // Task text span
        var textSpan = document.createElement('span');
        textSpan.className   = 'task-list__text';
        textSpan.textContent = task.text;

        // Edit button
        var editBtn = document.createElement('button');
        editBtn.type      = 'button';
        editBtn.className = 'btn btn--secondary';
        editBtn.textContent = 'Edit';
        editBtn.setAttribute('aria-label', 'Edit task');
        editBtn.addEventListener('click', (function (taskId) {
          return function () {
            TaskListWidget.startEdit(taskId);
          };
        }(task.id)));

        // Delete button
        var deleteBtn = document.createElement('button');
        deleteBtn.type      = 'button';
        deleteBtn.className = 'btn btn--danger';
        deleteBtn.textContent = 'Delete';
        deleteBtn.setAttribute('aria-label', 'Delete task');
        deleteBtn.addEventListener('click', (function (taskId) {
          return function () {
            TaskListWidget.deleteTask(taskId);
          };
        }(task.id)));

        li.appendChild(checkbox);
        li.appendChild(textSpan);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        list.appendChild(li);
      });
    },

    /**
     * Load tasks from storage, render, and bind the add-task form.
     * Requirements: 5.11, 5.13
     */
    init() {
      var errorEl = document.getElementById('task-error');
      var stored  = Storage.get(KEYS.TASKS);

      if (Array.isArray(stored)) {
        TaskListWidget._tasks = stored;
      } else {
        TaskListWidget._tasks = [];
        // Storage returned null (no data yet) — that's fine, don't show error.
        // Only show error if Storage.get returned a non-null, non-array value,
        // which indicates a corrupted / unexpected payload (Req 5.13).
        if (stored !== null) {
          TaskListWidget._showError(errorEl, 'Failed to load tasks.');
        }
      }

      TaskListWidget.render();

      // Bind the add-task form submit
      var form     = document.getElementById('task-add-form');
      var taskInput = document.getElementById('task-input');
      if (form) {
        form.addEventListener('submit', function (event) {
          event.preventDefault();
          TaskListWidget.addTask(taskInput ? taskInput.value : '');
        });
      }
    },
  };

  /* =========================================================================
     QuickLinksWidget
     Requirements: 6.1–6.13
     ======================================================================= */
  const QuickLinksWidget = {
    /** In-memory array of Link objects. Max 20 entries. */
    _links: [],

    /**
     * Show an inline error message on an error element.
     * @param {HTMLElement} el  the error <p> element
     * @param {string} msg      the message to display
     */
    _showError(el, msg) {
      if (!el) return;
      el.textContent = msg;
      el.removeAttribute('hidden');
    },

    /**
     * Hide the inline error message on an error element.
     * @param {HTMLElement} el  the error <p> element
     */
    _clearError(el) {
      if (!el) return;
      el.textContent = '';
      el.setAttribute('hidden', '');
    },

    /**
     * Persist the in-memory links array to Storage.
     * Silently continues if the write fails (Requirement 6.13).
     */
    _persist() {
      Storage.set(KEYS.LINKS, QuickLinksWidget._links);
    },

    /**
     * Prepend "https://" if the URL does not already start with
     * "http://" or "https://".
     * Requirement: 6.5
     * @param {string} url
     * @returns {string}
     */
    normaliseUrl(url) {
      if (typeof url !== 'string') return url;
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      return 'https://' + url;
    },

    /**
     * Return true if the URL has a valid scheme (http/https), a non-empty
     * host, and no whitespace characters.
     * Uses new URL() to parse; returns false on any parse error.
     * Requirements: 6.2
     * @param {string} url
     * @returns {boolean}
     */
    validateUrl(url) {
      if (typeof url !== 'string') return false;
      // Reject immediately if whitespace is present anywhere
      if (/\s/.test(url)) return false;
      try {
        var parsed = new URL(url);
        // Must have http or https scheme
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
        // Must have a non-empty hostname
        if (!parsed.hostname) return false;
        return true;
      } catch (_) {
        return false;
      }
    },

    /**
     * Validate label and URL, normalise URL, enforce the 20-link cap,
     * then push, persist, and render.
     * Requirements: 6.1, 6.2, 6.3, 6.4, 6.11
     * @param {string} label  raw value from the label input
     * @param {string} url    raw value from the URL input
     */
    addLink(label, url) {
      var labelErrorEl = document.getElementById('link-label-error');
      var urlErrorEl   = document.getElementById('link-url-error');
      var labelInputEl = document.getElementById('link-label-input');
      var urlInputEl   = document.getElementById('link-url-input');

      var trimmedLabel = (typeof label === 'string') ? label.trim() : '';
      var normalisedUrl = QuickLinksWidget.normaliseUrl(
        (typeof url === 'string') ? url.trim() : ''
      );

      // Validate label: 1–50 chars, non-empty (Req 6.3)
      var labelValid = trimmedLabel.length >= 1 && trimmedLabel.length <= 50;
      if (!labelValid) {
        QuickLinksWidget._showError(
          labelErrorEl,
          trimmedLabel.length === 0
            ? 'Link label cannot be empty.'
            : 'Link label must be 50 characters or fewer.'
        );
      } else {
        QuickLinksWidget._clearError(labelErrorEl);
      }

      // Check cap before URL validation so cap error takes priority on URL error element
      if (QuickLinksWidget._links.length >= 20) {
        QuickLinksWidget._showError(urlErrorEl, 'Quick links limit (20) reached.');
        return;
      }

      // Validate URL (Req 6.2, 6.4)
      var urlValid = QuickLinksWidget.validateUrl(normalisedUrl);
      if (!urlValid) {
        QuickLinksWidget._showError(
          urlErrorEl,
          'Please enter a valid URL (e.g. https://example.com).'
        );
      } else {
        QuickLinksWidget._clearError(urlErrorEl);
      }

      // Abort if either field is invalid
      if (!labelValid || !urlValid) return;

      // Both valid and under cap — create link, persist, render (Req 6.1, 6.2)
      var link = {
        id:    Date.now() + '-' + Math.random(),
        label: trimmedLabel,
        url:   normalisedUrl,
      };

      QuickLinksWidget._links.push(link);
      QuickLinksWidget._persist();
      QuickLinksWidget.render();

      // Clear error messages on success
      QuickLinksWidget._clearError(labelErrorEl);
      QuickLinksWidget._clearError(urlErrorEl);

      // Clear form inputs
      if (labelInputEl) labelInputEl.value = '';
      if (urlInputEl)   urlInputEl.value   = '';
    },

    /**
     * Remove the link with the given id; persist; render.
     * Requirement: 6.8
     * @param {string} id
     */
    deleteLink(id) {
      QuickLinksWidget._links = QuickLinksWidget._links.filter(function (link) {
        return link.id !== id;
      });
      QuickLinksWidget._persist();
      QuickLinksWidget.render();
    },

    /**
     * Rebuild the links panel DOM from the in-memory array.
     * Requirements: 6.6, 6.7, 6.9, 6.10
     */
    render() {
      var container = document.getElementById('links-container');
      if (!container) return;

      // Clear existing content
      container.innerHTML = '';

      // Empty state message (Requirement 6.10)
      if (QuickLinksWidget._links.length === 0) {
        var emptyMsg = document.createElement('p');
        emptyMsg.className   = 'links-empty';
        emptyMsg.textContent = 'No quick links yet. Add your first link above.';
        container.appendChild(emptyMsg);
        return;
      }

      // Render each link (Requirements 6.6, 6.7, 6.9)
      QuickLinksWidget._links.forEach(function (link) {
        var item = document.createElement('div');
        item.className = 'link-item';

        // Anchor that opens in a new tab (Requirement 6.6)
        var anchor = document.createElement('a');
        anchor.href             = link.url;
        anchor.target           = '_blank';
        anchor.rel              = 'noopener noreferrer';
        anchor.className        = 'link-btn';
        anchor.setAttribute('aria-label', 'Open ' + link.label);
        anchor.textContent      = link.label;

        // Delete button (Requirement 6.7)
        var deleteBtn = document.createElement('button');
        deleteBtn.type      = 'button';
        deleteBtn.className = 'btn btn--danger';
        deleteBtn.setAttribute('aria-label', 'Delete link ' + link.label);
        deleteBtn.textContent = '×';
        deleteBtn.addEventListener('click', (function (linkId) {
          return function () {
            QuickLinksWidget.deleteLink(linkId);
          };
        }(link.id)));

        item.appendChild(anchor);
        item.appendChild(deleteBtn);
        container.appendChild(item);
      });
    },

    /**
     * Load links from storage, render, and bind the add-link form submit.
     * Requirements: 6.9, 6.12
     */
    init() {
      var container = document.getElementById('links-container');
      var stored    = Storage.get(KEYS.LINKS);

      if (Array.isArray(stored)) {
        // Valid array from storage (Requirement 6.9)
        QuickLinksWidget._links = stored;
      } else {
        QuickLinksWidget._links = [];
        if (stored !== null) {
          // Non-null, non-array value means corrupted data (Requirement 6.12)
          if (container) {
            var errMsg = document.createElement('p');
            errMsg.className   = 'error-msg';
            errMsg.textContent = 'Failed to load quick links.';
            container.appendChild(errMsg);
          }
        }
        // null means no data yet — no error, just start empty
      }

      QuickLinksWidget.render();

      // Bind the add-link form submit
      var form       = document.getElementById('link-add-form');
      var labelInput = document.getElementById('link-label-input');
      var urlInput   = document.getElementById('link-url-input');
      if (form) {
        form.addEventListener('submit', function (event) {
          event.preventDefault();
          QuickLinksWidget.addLink(
            labelInput ? labelInput.value : '',
            urlInput   ? urlInput.value   : ''
          );
        });
      }
    },
  };

  /* =========================================================================
     SettingsPanel
     Requirements: 2.1–2.6, 4.1–4.2, 4.6
     ======================================================================= */
  const SettingsPanel = {
    /**
     * Show an inline error message on an error element.
     * @param {HTMLElement} el  the error <p> element
     * @param {string} msg      the message to display
     */
    _showError(el, msg) {
      if (!el) return;
      el.textContent = msg;
      el.removeAttribute('hidden');
    },

    /**
     * Hide the inline error message on an error element.
     * @param {HTMLElement} el  the error <p> element
     */
    _clearError(el) {
      if (!el) return;
      el.textContent = '';
      el.setAttribute('hidden', '');
    },

    /**
     * Validate and persist a custom name, then dispatch 'namechange'.
     *
     * - Empty / whitespace-only → remove from storage, dispatch with name:'', clear error
     * - 1–50 chars with ≥1 non-whitespace → trim, persist, dispatch with trimmed name, clear error
     * - > 50 chars → show inline error, do NOT persist
     *
     * Requirements: 2.2, 2.4, 2.5, 2.6
     * @param {string} value  raw value from the name input
     */
    saveName(value) {
      var errorEl = document.getElementById('name-error');
      var trimmed = (typeof value === 'string') ? value.trim() : '';

      // Case 1: exceeds 50 chars (check raw value before trim to catch padding abuse,
      // but the HTML maxlength=50 already prevents this in the UI; we guard here too)
      if (typeof value === 'string' && value.length > 50) {
        SettingsPanel._showError(errorEl, 'Name must be 50 characters or fewer.');
        return;
      }

      // Case 2: empty or whitespace-only → treat as clearing the name
      if (trimmed === '') {
        Storage.remove(KEYS.NAME);
        document.dispatchEvent(new CustomEvent('namechange', { detail: { name: '' } }));
        SettingsPanel._clearError(errorEl);
        return;
      }

      // Case 3: valid name (1–50 chars with at least one non-whitespace)
      Storage.set(KEYS.NAME, trimmed);
      document.dispatchEvent(new CustomEvent('namechange', { detail: { name: trimmed } }));
      SettingsPanel._clearError(errorEl);
    },

    /**
     * Validate and persist a timer duration, then dispatch 'durationchange'.
     *
     * - Valid integer in 1–120 → persist, dispatch with duration:intVal, clear error
     * - Out of range / non-integer / non-numeric → show inline error, do NOT persist
     *
     * Requirements: 4.1, 4.2, 4.6
     * @param {string} value  raw value from the duration input
     */
    saveDuration(value) {
      var errorEl = document.getElementById('duration-error');
      var strVal  = String(value).trim();

      // Must be a non-empty string of digits (optionally preceded by a sign)
      // and must represent a whole number (no decimal point)
      var asNumber = Number(strVal);
      var isInteger = strVal !== '' &&
                      !isNaN(asNumber) &&
                      Number.isFinite(asNumber) &&
                      Math.floor(asNumber) === asNumber;

      if (!isInteger || asNumber < 1 || asNumber > 120) {
        SettingsPanel._showError(errorEl, 'Duration must be a whole number between 1 and 120.');
        return;
      }

      var intVal = Math.floor(asNumber);
      Storage.set(KEYS.DURATION, intVal);
      document.dispatchEvent(new CustomEvent('durationchange', { detail: { duration: intVal } }));
      SettingsPanel._clearError(errorEl);
    },

    /**
     * Bind form submit events and populate inputs from storage.
     * Requirements: 2.1, 4.1
     */
    init() {
      // --- Name form ---
      var nameForm  = document.getElementById('name-form');
      var nameInput = document.getElementById('name-input');

      // Populate name input from storage
      var storedName = Storage.get(KEYS.NAME);
      if (nameInput && typeof storedName === 'string') {
        nameInput.value = storedName;
      }

      if (nameForm) {
        nameForm.addEventListener('submit', function (event) {
          event.preventDefault();
          SettingsPanel.saveName(nameInput ? nameInput.value : '');
        });
      }

      // --- Duration form ---
      var durationForm  = document.getElementById('duration-form');
      var durationInput = document.getElementById('duration-input');

      // Populate duration input from storage
      var storedDuration = Storage.get(KEYS.DURATION);
      if (durationInput && storedDuration !== null) {
        durationInput.value = storedDuration;
      }

      if (durationForm) {
        durationForm.addEventListener('submit', function (event) {
          event.preventDefault();
          SettingsPanel.saveDuration(durationInput ? durationInput.value : '');
        });
      }
    },
  };

  /* =========================================================================
     Bootstrap — DOMContentLoaded
     Initialisation order per design.md:
       ThemeManager → GreetingWidget → TimerWidget →
       TaskListWidget → QuickLinksWidget → SettingsPanel
     ======================================================================= */
  document.addEventListener('DOMContentLoaded', function () {
    ThemeManager.init();
    GreetingWidget.init();
    TimerWidget.init();
    TaskListWidget.init();
    QuickLinksWidget.init();
    SettingsPanel.init();
  });

  /* =========================================================================
     Expose modules for unit / property-based tests running in the same page.
     (Tests can access window.__dashboard to call pure functions directly.)
     ======================================================================= */
  window.__dashboard = {
    KEYS,
    Storage,
    ThemeManager,
    GreetingWidget,
    TimerWidget,
    TaskListWidget,
    QuickLinksWidget,
    SettingsPanel,
  };

}());
