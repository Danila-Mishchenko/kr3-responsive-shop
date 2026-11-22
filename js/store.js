'use strict';

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
