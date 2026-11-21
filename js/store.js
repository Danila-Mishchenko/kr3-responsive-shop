'use strict';

// Фильтры каталога
const filtersForm = document.querySelector('.filters-form');
if (filtersForm) {
  const cards = document.querySelectorAll('#catalog-grid .instrument-card');
  const count = document.getElementById('catalog-count');
  const fromInput = document.getElementById('price-from');
  const toInput = document.getElementById('price-to');
  const panel = document.querySelector('.filter-panel');
  const desktop = matchMedia('(min-width: 768px)');
  const query = new URLSearchParams(location.search);

  panel.open = desktop.matches;
  desktop.addEventListener('change', (event) => {
    panel.open = event.matches;
  });

  const selectedCategories = query.getAll('category');
  for (const checkbox of filtersForm.querySelectorAll('[name="category"]')) {
    checkbox.checked = selectedCategories.includes(checkbox.value);
  }
  fromInput.value = query.get('price-from') || '';
  toInput.value = query.get('price-to') || '';

  let catalogPage = 1;
  const pageSize = 8;

  function filterCards() {
    const categories = new FormData(filtersForm).getAll('category');
    const from = fromInput.value === '' ? 0 : Number(fromInput.value);
    const to = toInput.value === '' ? Infinity : Number(toInput.value);
    const matches = [];

    for (const card of cards) {
      const price = Number(card.dataset.price);
      const categoryMatches = categories.length === 0 || categories.includes(card.dataset.category);
      card.hidden = true;
      if (categoryMatches && price >= from && price <= to) matches.push(card);
    }

    const totalPages = Math.max(1, Math.ceil(matches.length / pageSize));
    catalogPage = Math.min(catalogPage, totalPages);
    for (const card of matches.slice((catalogPage - 1) * pageSize, catalogPage * pageSize)) {
      card.hidden = false;
    }
    count.textContent = matches.length
      ? 'Найдено: ' + matches.length
      : 'Подходящих инструментов нет.';
    document.getElementById('catalog-page').textContent = catalogPage + ' / ' + totalPages;
    document.getElementById('catalog-prev').disabled = catalogPage === 1;
    document.getElementById('catalog-next').disabled = catalogPage === totalPages;
  }

  function applyFilters() {
    catalogPage = 1;
    filterCards();
    if (location.protocol === 'file:') return;

    const url = new URL(location.href);
    const values = new FormData(filtersForm);
    for (const key of ['category', 'price-from', 'price-to']) url.searchParams.delete(key);
    for (const [key, value] of values) {
      if (value !== '') url.searchParams.append(key, value);
    }
    history.replaceState(null, '', url);
  }

  filtersForm.addEventListener('submit', (event) => {
    event.preventDefault();
    applyFilters();
  });
  filtersForm.addEventListener('reset', () => setTimeout(applyFilters, 0));
  for (const [id, step] of [
    ['catalog-prev', -1],
    ['catalog-next', 1],
  ]) {
    document.getElementById(id).addEventListener('click', () => {
      catalogPage += step;
      filterCards();
      document.getElementById('catalog-count').scrollIntoView({ block: 'center' });
    });
  }
  filterCards();
}

// Карточка инструмента и заявка
const itemId = new URLSearchParams(location.search).get('item');
const selectedInstrument = instruments.find((item) => item.id === itemId);
const instrumentTitle = document.getElementById('product-title');

if (instrumentTitle) {
  const product = selectedInstrument || instruments[0];
  const price = formatInstrumentPrice(product);
  const image = document.querySelector('.product .instrument-picture img');
  image.srcset = `images/${product.id}-320.webp 320w, images/${product.id}-512.webp 512w`;
  image.src = `images/${product.id}-320.webp`;
  image.alt = product.title;

  document.title = product.title + ' — Резонанс';
  instrumentTitle.textContent = product.title;
  document.getElementById('product-description').textContent = product.description;
  document.getElementById('product-category').textContent = product.category;
  document.getElementById('product-price').textContent = price;
  document.getElementById('product-availability').textContent = product.isAvailable
    ? 'В наличии'
    : 'Нет в наличии';
  document.getElementById('spec-category').textContent = product.category;
  document.getElementById('spec-details').textContent = product.specs;
  document.getElementById('spec-price').textContent = price;

  const orderLink = document.getElementById('product-order');
  orderLink.href = 'order.html?item=' + product.id;
  orderLink.hidden = !product.isAvailable;
  document.getElementById('product-compare').href = 'compare.html?first=' + product.id;
}

const instrumentSelect = document.getElementById('order-product-select');
if (instrumentSelect && selectedInstrument?.isAvailable) {
  instrumentSelect.value = selectedInstrument.id;
}
