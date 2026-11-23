
'use strict';
 
// Подробные описания (alt) для фотографий. Сами тексты лежат в js/alt-text.js.
const altScript = document.createElement('script');
altScript.src = 'js/alt-text.js?v=1';
document.head.append(altScript);
 
// Мобильное меню («бургер»). На телефоне шапка остаётся в одну строку,
// а все ссылки и кнопка входа открываются по кнопке с тремя полосками.
const siteHeader = document.querySelector('.site-header');
const headerInner = siteHeader?.querySelector('.site-header__inner');
const headerNav = headerInner?.querySelector('.site-nav');
 
if (headerInner && headerNav) {
  headerNav.id = headerNav.id || 'site-menu';
 
  const menuButton = document.createElement('button');
  menuButton.type = 'button';
  menuButton.className = 'menu-toggle';
  menuButton.setAttribute('aria-controls', headerNav.id);
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Открыть меню');
  menuButton.innerHTML =
    '<span class="menu-toggle__bar"></span>'.repeat(3);
  headerNav.before(menuButton);
  siteHeader.classList.add('has-menu');
 
  const desktopQuery = matchMedia('(min-width: 768px)');
 
  function setMenu(open) {
    siteHeader.classList.toggle('menu-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  }
 
  menuButton.addEventListener('click', () => {
    setMenu(!siteHeader.classList.contains('menu-open'));
  });
 
  // Закрытие: Esc, клик вне шапки, переход по ссылке, кнопка входа, широкий экран.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && siteHeader.classList.contains('menu-open')) {
      setMenu(false);
      menuButton.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (!siteHeader.contains(event.target)) setMenu(false);
  });
  headerNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });
  headerInner.querySelector('#open-account')?.addEventListener('click', () => {
    setMenu(false);
  });
  desktopQuery.addEventListener('change', (event) => {
    if (event.matches) setMenu(false);
  });
}
 
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
    '.category-grid, .sound-story, .editorial, .principles, .visit-banner, .contact-notes, .shop-feature, .shop-panel, .lesson-hero, .contact-route',
  )) {
    section.classList.add('reveal-ready');
    observer.observe(section);
  }
}
 