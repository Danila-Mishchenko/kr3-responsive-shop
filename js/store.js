'use strict';

// Фильтры каталога
const filtersForm = document.querySelector('.filters-form');
if (filtersForm) {
  const cards = document.querySelectorAll('#catalog-grid .instrument-card');
  const count = document.getElementById('catalog-count');
  const fromInput = document.getElementById('price-from');
  const toInput = document.getElementById('price-to');

  function filterCards() {
    const categories = new FormData(filtersForm).getAll('category');
    const from = fromInput.value === '' ? 0 : Number(fromInput.value);
    const to = toInput.value === '' ? Infinity : Number(toInput.value);
    let matches = 0;

    for (const card of cards) {
      const price = Number(card.dataset.price);
      const categoryMatches = categories.length === 0 || categories.includes(card.dataset.category);
      card.hidden = !categoryMatches || price < from || price > to;
      if (!card.hidden) matches += 1;
    }

    count.textContent = matches > 0 ? 'Найдено: ' + matches : 'Подходящих инструментов нет.';
  }

  filtersForm.addEventListener('submit', (event) => {
    event.preventDefault();
    filterCards();
  });
  filtersForm.addEventListener('reset', () => setTimeout(filterCards, 0));
}

// Карточка инструмента и заявка
const itemId = new URLSearchParams(location.search).get('item');
const selectedInstrument = instruments.find((item) => item.id === itemId);
const instrumentTitle = document.getElementById('product-title');

if (instrumentTitle) {
  const product = selectedInstrument || instruments[0];
  const finalPrice = product.price * (1 - product.discountPercent / 100);
  const price = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(finalPrice);
  const image = document.querySelector('.product .instrument-picture img');
  image.srcset = `images/${product.id}-320.webp 320w, images/${product.id}-512.webp 512w`;
  image.src = `images/${product.id}-320.webp`;
  image.alt = product.title;

  document.title = product.title + ' — Резонанс';
  instrumentTitle.textContent = product.title;
  document.getElementById('product-description').textContent = product.description;
  document.getElementById('product-category').textContent = product.category;
  document.getElementById('product-price').textContent = price;
  document.getElementById('product-availability').textContent =
    product.isAvailable ? 'В наличии' : 'Нет в наличии';
  document.getElementById('spec-category').textContent = product.category;
  document.getElementById('spec-details').textContent = product.specs;
  document.getElementById('spec-price').textContent = price;

  const orderLink = document.getElementById('product-order');
  orderLink.href = 'order.html?item=' + product.id;
  orderLink.hidden = !product.isAvailable;
}

const instrumentSelect = document.getElementById('order-product-select');
if (instrumentSelect && selectedInstrument?.isAvailable) {
  instrumentSelect.value = selectedInstrument.id;
}
