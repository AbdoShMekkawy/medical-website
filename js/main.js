/**
 * MekkawyMedLearn - Main JavaScript
 * Core site functionality
 */

// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initMobileMenu();
  initAnimations();
  initSmoothScroll();
});

/**
 * Header scroll effects
 */
function initHeader() {
  const header = document.getElementById("header");
  if (!header) return;

  let lastScroll = 0;

  window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY;

    // Add scrolled class for background effect
    if (currentScroll > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    lastScroll = currentScroll;
  });
}

/**
 * Mobile menu toggle
 */
function initMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.getElementById("nav");

  if (!menuToggle || !nav) return;

  menuToggle.addEventListener("click", () => {
    menuToggle.classList.toggle("active");
    nav.classList.toggle("active");
    document.body.style.overflow = nav.classList.contains("active")
      ? "hidden"
      : "";
  });

  // Close menu when clicking on a link
  nav.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.classList.remove("active");
      nav.classList.remove("active");
      document.body.style.overflow = "";
    });
  });

  // Close menu on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("active")) {
      menuToggle.classList.remove("active");
      nav.classList.remove("active");
      document.body.style.overflow = "";
    }
  });
}

/**
 * Scroll-triggered animations
 */
function initAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-fade-in");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe elements that should animate
  const animateElements = document.querySelectorAll(
    ".feature-card, .course-card, .testimonial-card, .course-card-enhanced",
  );
  animateElements.forEach((el) => {
    el.style.opacity = "0";
    observer.observe(el);
  });
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#") return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerHeight =
          document.getElementById("header")?.offsetHeight || 80;
        const targetPosition =
          target.getBoundingClientRect().top + window.scrollY - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });
}

/**
 * Filter functionality for courses page
 */
function initFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const courseCards = document.querySelectorAll(".course-card-enhanced");

  if (!filterBtns.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Update active state
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;

      // Filter cards
      courseCards.forEach((card) => {
        const category = card
          .querySelector(".course-category-tag")
          ?.textContent.toLowerCase();

        if (filter === "all" || category === filter) {
          card.style.display = "";
          card.classList.add("animate-fade-in");
        } else {
          card.style.display = "none";
        }
      });

      // Update results count
      const visibleCards = document.querySelectorAll(
        '.course-card-enhanced:not([style*="display: none"])',
      );
      const resultsCount = document.querySelector(".results-count");
      if (resultsCount) {
        resultsCount.textContent = `Showing ${visibleCards.length} courses`;
      }
    });
  });
}

// Initialize filters on page load
document.addEventListener("DOMContentLoaded", initFilters);

/**
 * Utility: Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Form validation helper
 */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Contact form handling
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Show success message (in a real app, this would send data to server)
    alert("Thank you for your message! We will get back to you soon.");
    contactForm.reset();
  });
}

console.log("🏥 MekkawyMedLearn - Loaded successfully!");
