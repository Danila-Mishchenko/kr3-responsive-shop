'use strict';

function formatPrice(price) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(price);
}

function calculateDiscount(price, percent) {
  return price * percent / 100;
}

function calculateFinalPrice(price, percent) {
  return price - calculateDiscount(price, percent);
}

function getProductStatus(product) {
  if (!product.isAvailable) return 'Нет в наличии';
  if (product.price > 0 && product.discountPercent > 0) return 'В наличии со скидкой';
  return 'В наличии';
}

function createProductSummary(product) {
  const finalPrice = calculateFinalPrice(product.price, product.discountPercent);
  return `${product.title} — ${formatPrice(finalPrice)}. ${getProductStatus(product)}.`;
}

console.log('Исходная цена', formatPrice(demoProduct.price));
console.log('Сумма скидки', formatPrice(calculateDiscount(demoProduct.price, demoProduct.discountPercent)));
console.log('Цена со скидкой', formatPrice(calculateFinalPrice(demoProduct.price, demoProduct.discountPercent)));
console.log('Статус', getProductStatus(demoProduct));
console.log('Краткое описание', createProductSummary(demoProduct));
