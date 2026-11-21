'use strict';

// Избранное
const favoriteKey = 'resonance-favorites';
const favoriteButtons = document.querySelectorAll('[data-favorite]');
const favoritesGrid = document.getElementById('favorites-grid');
if (favoriteButtons.length || favoritesGrid) {
  const availableIds = new Set(instruments.map((instrument) => instrument.id));
  let favoriteIds = new Set();
  try {
    const saved = JSON.parse(localStorage.getItem(favoriteKey));
    if (Array.isArray(saved)) {
      favoriteIds = new Set(saved.filter((id) => availableIds.has(id)));
    }
  } catch {
    // Вкладка может ограничивать доступ к хранилищу.
  }

  function saveFavorites() {
    try {
      localStorage.setItem(favoriteKey, JSON.stringify([...favoriteIds]));
      return true;
    } catch {
      return false;
    }
  }

  function updateFavoriteButton(button) {
    const selected = favoriteIds.has(button.dataset.favorite);
    button.setAttribute('aria-pressed', String(selected));
    const label = button.querySelector('[data-favorite-label]') || button;
    label.textContent = selected ? 'В избранном' : 'В избранное';
  }

  for (const button of favoriteButtons) {
    updateFavoriteButton(button);
    button.addEventListener('click', () => {
      const id = button.dataset.favorite;
      if (favoriteIds.has(id)) favoriteIds.delete(id);
      else favoriteIds.add(id);
      const saved = saveFavorites();
      updateFavoriteButton(button);
      if (!saved) {
        document.getElementById('favorite-status').textContent =
          'Браузер не разрешил сохранить изменения между страницами.';
      }
    });
  }

  if (favoritesGrid) {
    const template = document.getElementById('favorite-template');
    const count = document.getElementById('favorites-count');
    const empty = document.getElementById('favorites-empty');

    for (const instrument of instruments) {
      if (!favoriteIds.has(instrument.id)) continue;
      const card = template.content.firstElementChild.cloneNode(true);
      const image = card.querySelector('img');
      image.src = 'images/' + instrument.id + '-320.webp';
      image.alt = instrument.title;
      card.querySelector('.product-card__title').textContent = instrument.title;
      card.querySelector('.product-card__description').textContent = instrument.specs;
      card.querySelector('.product-card__price').textContent = formatInstrumentPrice(instrument);

      const link = card.querySelector('.saved-product-link');
      link.href = 'product.html?item=' + instrument.id;
      link.setAttribute('aria-label', 'Подробнее: ' + instrument.title);

      const removeButton = card.querySelector('[data-remove-favorite]');
      removeButton.setAttribute('aria-label', 'Убрать из избранного: ' + instrument.title);
      removeButton.addEventListener('click', () => {
        const nextCard = card.nextElementSibling || card.previousElementSibling;
        favoriteIds.delete(instrument.id);
        const saved = saveFavorites();
        card.remove();
        updateCount();
        if (!saved) count.textContent += ' Браузер не разрешил сохранить изменения.';
        const nextControl =
          nextCard?.querySelector('[data-remove-favorite]') ||
          document.querySelector('main a[href="catalog.html"]');
        nextControl.focus();
      });
      favoritesGrid.append(card);
    }

    function updateCount() {
      empty.hidden = favoriteIds.size > 0;
      count.textContent = favoriteIds.size ? 'Сохранено: ' + favoriteIds.size : 'Избранное пусто.';
    }

    updateCount();
  }
}

// Сравнение
const firstSelect = document.getElementById('compare-first');
const secondSelect = document.getElementById('compare-second');
if (firstSelect && secondSelect) {
  const output = document.getElementById('compare-results');
  const status = document.getElementById('compare-status');
  const byId = new Map(instruments.map((instrument) => [instrument.id, instrument]));
  for (const instrument of instruments) {
    firstSelect.add(new Option(instrument.title, instrument.id));
    secondSelect.add(new Option(instrument.title, instrument.id));
  }

  const firstId = new URLSearchParams(location.search).get('first');
  if (byId.has(firstId)) firstSelect.value = firstId;

  function renderComparison() {
    const first = byId.get(firstSelect.value);
    const second = byId.get(secondSelect.value);
    output.hidden = !first || !second || first === second;
    if (output.hidden) {
      status.textContent =
        first && first === second
          ? 'Для сравнения выберите две разные модели.'
          : 'Выберите обе модели, чтобы увидеть таблицу.';
      return;
    }

    [first, second].forEach((instrument, index) => {
      const link = output.querySelectorAll('[data-model] a')[index];
      link.textContent = instrument.title;
      link.href = 'product.html?item=' + instrument.id;
      const values = {
        category: instrument.category,
        price: formatInstrumentPrice(instrument),
        specs: instrument.specs,
        availability: instrument.isAvailable ? 'В наличии' : 'Нет в наличии',
        description: instrument.description,
      };
      for (const [field, value] of Object.entries(values)) {
        output.querySelectorAll('[data-compare="' + field + '"]')[index].textContent = value;
      }
    });
    status.textContent = 'Таблица сравнения обновлена.';
  }

  firstSelect.addEventListener('change', renderComparison);
  secondSelect.addEventListener('change', renderComparison);
  renderComparison();
}
