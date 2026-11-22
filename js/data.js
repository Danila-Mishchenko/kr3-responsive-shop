'use strict';

// Создаётся командой npm run build.
const instruments = [
  {
    "id": "acoustic",
    "title": "Акустическая гитара Folk D1",
    "category": "Струнные",
    "description": "Еловая дека и широкий звучный корпус. Подходит для аккордов и перебора.",
    "specs": "6 струн · корпус дредноут",
    "price": 18900,
    "discountPercent": 0,
    "isAvailable": true
  },
  {
    "id": "electric",
    "title": "Электрогитара Studio ST",
    "category": "Струнные",
    "description": "Универсальная электрогитара для репетиций и записи. Три звукоснимателя дают разные оттенки звука.",
    "specs": "6 струн · 3 звукоснимателя",
    "price": 32900,
    "discountPercent": 15,
    "isAvailable": true
  },
  {
    "id": "piano",
    "title": "Цифровое пианино Keys 88",
    "category": "Клавишные",
    "description": "Полноразмерная клавиатура для занятий дома. Есть встроенные динамики и выход для наушников.",
    "specs": "88 клавиш · молоточковая механика",
    "price": 58900,
    "discountPercent": 0,
    "isAvailable": true
  },
  {
    "id": "drums",
    "title": "Электронные барабаны Beat Kit",
    "category": "Ударные",
    "description": "Компактная установка с сетчатыми пэдами и выходом для наушников.",
    "specs": "4 пэда · 3 тарелки",
    "price": 46900,
    "discountPercent": 0,
    "isAvailable": true
  },
  {
    "id": "sax",
    "title": "Альт-саксофон Alto Brass",
    "category": "Духовые",
    "description": "Латунный саксофон для первых уроков и игры в ансамбле.",
    "specs": "Строй ми-бемоль · футляр",
    "price": 51900,
    "discountPercent": 0,
    "isAvailable": true
  },
  {
    "id": "violin",
    "title": "Скрипка Arco 4/4",
    "category": "Струнные",
    "description": "Полноразмерная скрипка со смычком. Подходит для занятий и оркестровой практики.",
    "specs": "Размер 4/4 · смычок в комплекте",
    "price": 15900,
    "discountPercent": 0,
    "isAvailable": true
  },
  {
    "id": "bass",
    "title": "Бас-гитара Lowline JB",
    "category": "Струнные",
    "description": "Плотный низ для репетиций, студии и небольших сцен.",
    "specs": "4 струны · 2 звукоснимателя",
    "price": 29900,
    "discountPercent": 0,
    "isAvailable": true
  },
  {
    "id": "ukulele",
    "title": "Укулеле Soprano U1",
    "category": "Струнные",
    "description": "Лёгкая укулеле для первых аккордов и поездок.",
    "specs": "Сопрано · 4 нейлоновые струны",
    "price": 5900,
    "discountPercent": 0,
    "isAvailable": true
  },
  {
    "id": "flute",
    "title": "Поперечная флейта Air 16",
    "category": "Духовые",
    "description": "Учебная флейта с закрытыми клапанами и удобным футляром.",
    "specs": "Строй до · 16 клапанов",
    "price": 21900,
    "discountPercent": 0,
    "isAvailable": false
  },
  {
    "id": "synth",
    "title": "Синтезатор Pulse Mini",
    "category": "Клавишные",
    "description": "Компактный инструмент для создания тембров и мелодий.",
    "specs": "37 мини-клавиш · USB-MIDI",
    "price": 24900,
    "discountPercent": 10,
    "isAvailable": true
  },
  {
    "id": "cajon",
    "title": "Кахон Rhythm Box",
    "category": "Ударные",
    "description": "Деревянный кахон с сухой атакой для акустических выступлений.",
    "specs": "Берёзовый корпус · струны внутри",
    "price": 10900,
    "discountPercent": 0,
    "isAvailable": true
  },
  {
    "id": "classical",
    "title": "Классическая гитара Nylon C3",
    "category": "Струнные",
    "description": "Мягкое звучание нейлоновых струн для занятий и сольной игры.",
    "specs": "6 струн · корпус 4/4",
    "price": 14900,
    "discountPercent": 0,
    "isAvailable": true
  }
];

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
