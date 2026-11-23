'use strict';

// Меню с тремя полосками (на телефоне и на компьютере). Шапка остаётся
// в одну строку, а все ссылки и кнопка входа открываются по этой кнопке.
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
  for (let i = 0; i < 3; i += 1) {
    const bar = document.createElement('span');
    bar.className = 'menu-toggle__bar';
    bar.setAttribute('aria-hidden', 'true');
    menuButton.append(bar);
  }
  headerNav.before(menuButton);
  siteHeader.classList.add('has-menu');

  // Кнопка входа переезжает внутрь меню (обработчики кнопки сохраняются).
  const accountButton = headerInner.querySelector('#open-account');
  if (accountButton) headerNav.append(accountButton);

  function setMenu(open) {
    siteHeader.classList.toggle('menu-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  }

  menuButton.addEventListener('click', () => {
    setMenu(!siteHeader.classList.contains('menu-open'));
  });

  // Закрытие: Esc, клик вне шапки, переход по ссылке, кнопка входа.
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
  accountButton?.addEventListener('click', () => {
    menuButton.focus();
    setMenu(false);
  }, { capture: true });
  document.getElementById('account-dialog')?.addEventListener('close', () => {
    if (!siteHeader.classList.contains('menu-open') && document.activeElement === document.body) {
      menuButton.focus();
    }
  });
}
