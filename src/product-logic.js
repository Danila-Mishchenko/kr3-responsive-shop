const favoriteKey = 'resonance-favorites';
const instrumentPriceFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 2,
});

// Практическая работа №15
function formatPrice(price) {
  return instrumentPriceFormatter.format(price);
}

function calculateDiscount(product) {
  return Math.round(product.price * product.discountPercent) / 100;
}

function instrumentFinalPrice(product) {
  return product.price - calculateDiscount(product);
}

function formatInstrumentPrice(product) {
  return formatPrice(instrumentFinalPrice(product));
}

function instrumentStatus(product) {
  if (!product.isAvailable) return 'Нет в наличии';
  return product.discountPercent > 0 && product.price > 0
    ? 'В наличии со скидкой'
    : 'В наличии';
}

function describeInstrument(product) {
  return `${product.title}. ${product.specs}. ${formatInstrumentPrice(product)}. ${instrumentStatus(product)}.`;
}

function logProductDemo(product) {
  console.group('Практическая работа №15 — ' + product.title);
  console.log('Объект товара:', product);
  console.log('Исходная цена:', formatPrice(product.price));
  console.log('Сумма скидки:', formatPrice(calculateDiscount(product)));
  console.log('Цена со скидкой:', formatInstrumentPrice(product));
  console.log('Статус:', instrumentStatus(product));
  console.log('Краткое описание:', describeInstrument(product));
  console.groupEnd();
}

// Избранное
function readFavoriteIds(products) {
  try {
    const saved = JSON.parse(localStorage.getItem(favoriteKey));
    if (Array.isArray(saved)) {
      const validIds = new Set(products.map((product) => product.id));
      return new Set(saved.filter((id) => validIds.has(id)));
    }
  } catch {
    // Некоторые браузеры ограничивают доступ к хранилищу.
  }
  return new Set();
}

function saveFavoriteIds(ids) {
  try {
    localStorage.setItem(favoriteKey, JSON.stringify([...ids]));
    return true;
  } catch {
    return false;
  }
}
