/**
 * MekkawyMedLearn - Search & Filter Functionality
 */

(function() {
  const searchInput = document.querySelector('.search-box input');
  const coursesGrid = document.getElementById('coursesGrid');
  const sortSelect = document.getElementById('sortSelect');

  // Search courses
  function searchCourses(query) {
    if (!coursesGrid) return;

    const cards = coursesGrid.querySelectorAll('.course-card-enhanced');
    const normalizedQuery = query.toLowerCase().trim();

    cards.forEach(card => {
      const title = card.querySelector('.course-card-title')?.textContent.toLowerCase() || '';
      const category = card.querySelector('.course-category-tag')?.textContent.toLowerCase() || '';
      const instructor = card.querySelector('.instructor-name')?.textContent.toLowerCase() || '';

      const matches = title.includes(normalizedQuery) || 
                     category.includes(normalizedQuery) || 
                     instructor.includes(normalizedQuery);

      card.style.display = matches || !normalizedQuery ? '' : 'none';
    });

    updateResultsCount();
  }

  // Update visible results count
  function updateResultsCount() {
    const visibleCards = document.querySelectorAll('.course-card-enhanced:not([style*="display: none"])');
    const resultsEl = document.querySelector('.results-count');
    if (resultsEl) {
      resultsEl.textContent = `Showing ${visibleCards.length} courses`;
    }
  }

  // Sort courses
  function sortCourses(sortBy) {
    if (!coursesGrid) return;

    const cards = Array.from(coursesGrid.querySelectorAll('.course-card-enhanced'));

    cards.sort((a, b) => {
      switch(sortBy) {
        case 'rating':
          const ratingA = parseFloat(a.querySelector('.rating-value')?.textContent || '0');
          const ratingB = parseFloat(b.querySelector('.rating-value')?.textContent || '0');
          return ratingB - ratingA;
        case 'newest':
          // In a real app, we'd sort by date
          return 0;
        default: // popular - by duration as proxy
          return 0;
      }
    });

    cards.forEach(card => coursesGrid.appendChild(card));
  }

  // Initialize
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchCourses(e.target.value);
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortCourses(e.target.value);
    });
  }

  // Expose globally
  window.searchCourses = searchCourses;
})();
