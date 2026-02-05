/**
 * MekkawyMedLearn - Theme Toggle
 * Dark/Light mode functionality with localStorage persistence
 */

(function() {
  const THEME_KEY = 'mekkawy-theme';
  const DARK = 'dark';
  const LIGHT = 'light';

  // Get user's preferred theme
  function getPreferredTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored;

    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK : LIGHT;
  }

  // Apply theme to document
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    // Update meta theme-color for mobile browsers
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === DARK ? '#0f172a' : '#ffffff');
    }
  }

  // Toggle between themes
  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
    const next = current === DARK ? LIGHT : DARK;
    applyTheme(next);
  }

  // Initialize on page load
  function init() {
    // Apply saved/preferred theme immediately
    applyTheme(getPreferredTheme());

    // Set up toggle button(s)
    const toggleBtns = document.querySelectorAll('#themeToggle, .theme-toggle');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(THEME_KEY)) {
        applyTheme(e.matches ? DARK : LIGHT);
      }
    });
  }

  // Run init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose toggle function globally
  window.toggleTheme = toggleTheme;
})();
