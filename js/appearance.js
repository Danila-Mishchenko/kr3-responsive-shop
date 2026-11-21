'use strict';

// Возврат наверх
const topButton = document.querySelector('.back-to-top');
function showTopButton() {
  if (topButton) topButton.hidden = window.scrollY < 400;
}
window.addEventListener('scroll', showTopButton, { passive: true });
window.addEventListener('pageshow', showTopButton);
showTopButton();

// Появление разделов при прокрутке
if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.06 },
  );
  for (const section of document.querySelectorAll(
    '.category-grid, .sound-story, .start-grid, .editorial, .principles, .visit-banner, .contact-notes, .shop-feature, .shop-panel, .lesson-hero, .contact-route',
  )) {
    section.classList.add('reveal-ready');
    observer.observe(section);
  }
}
