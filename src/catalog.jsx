import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

const categories = {
  strings: 'Струнные',
  keys: 'Клавишные',
  drums: 'Ударные',
  winds: 'Духовые',
};
const pageSize = 8;
const query = new URLSearchParams(location.search);
const emptyFilters = { category: [], 'price-from': '', 'price-to': '' };

function filtersFromUrl() {
  return {
    category: query
      .getAll('category')
      .filter((code) => Object.hasOwn(categories, code)),
    'price-from': query.get('price-from') ?? '',
    'price-to': query.get('price-to') ?? '',
  };
}

function updateFilterUrl(filters) {
  if (location.protocol === 'file:') return;

  const url = new URL(location.href);
  for (const [key, value] of Object.entries(filters)) {
    url.searchParams.delete(key);
    for (const entry of [value].flat().filter(Boolean))
      url.searchParams.append(key, entry);
  }
  history.replaceState(null, '', url);
}

function CatalogFilters({ draft, setDraft, onApply }) {
  const panel = useRef(null);

  useEffect(() => {
    const desktop = matchMedia('(min-width: 768px)');
    const update = () => {
      panel.current.open = desktop.matches;
    };
    update();
    desktop.addEventListener('change', update);
    return () => desktop.removeEventListener('change', update);
  }, []);

  function changeCategory(event) {
    const { value, checked } = event.target;
    const category = checked
      ? [...draft.category, value]
      : draft.category.filter((code) => code !== value);
    setDraft({ ...draft, category });
  }

  return (
    <aside className="catalog-filters">
      <details className="filter-panel" ref={panel} open>
        <summary className="filter-panel__summary">Фильтры</summary>
        <h2 className="filter-panel__title">Фильтры</h2>
        <form
          className="filters-form"
          onSubmit={(event) => {
            event.preventDefault();
            onApply(draft);
          }}
          onReset={(event) => {
            event.preventDefault();
            setDraft(emptyFilters);
            onApply(emptyFilters);
          }}
        >
          <fieldset className="filters-form__group">
            <legend className="filters-form__legend">Категория</legend>
            {Object.entries(categories).map(([code, label]) => (
              <label className="filters-form__label" key={code}>
                <input
                  type="checkbox"
                  name="category"
                  value={code}
                  checked={draft.category.includes(code)}
                  onChange={changeCategory}
                />{' '}
                {label}
              </label>
            ))}
          </fieldset>

          <fieldset className="filters-form__group">
            <legend className="filters-form__legend">Цена</legend>
            {Object.entries({ 'price-from': 'От', 'price-to': 'До' }).map(
              ([name, label]) => (
                <div key={name}>
                  <label className="filters-form__label" htmlFor={name}>
                    {label}
                  </label>
                  <input
                    className="filters-form__input"
                    id={name}
                    name={name}
                    type="number"
                    min="0"
                    value={draft[name]}
                    onChange={(event) =>
                      setDraft({ ...draft, [name]: event.target.value })
                    }
                  />
                </div>
              ),
            )}
          </fieldset>

          <button className="button button--primary" type="submit">
            Применить
          </button>
          <button className="button button--secondary" type="reset">
            Сбросить
          </button>
        </form>
      </details>
    </aside>
  );
}

function ProductIcon({ name }) {
  return (
    <img
      className="decor-icon"
      src={`images/icons/${name}.svg?v=16`}
      width="24"
      height="24"
      alt=""
    />
  );
}

function ProductCard({ product, selected, onFavorite }) {
  const { id, title, category, price, specs, discountPercent, isAvailable } =
    product;
  const image = `images/${id}`;
  const categoryCode = Object.keys(categories).find(
    (code) => categories[code] === category,
  );

  return (
    <article
      className="product-card instrument-card"
      data-category={categoryCode}
      data-price={instrumentFinalPrice(product)}
    >
      <picture className="instrument-picture">
        <img
          src={`${image}-320.webp`}
          srcSet={`${image}-320.webp 320w, ${image}-512.webp 512w`}
          sizes="(min-width: 1024px) 250px, (min-width: 768px) 33vw, calc(100vw - 32px)"
          alt={title}
          width="320"
          height="320"
          loading="lazy"
          decoding="async"
        />
      </picture>
      <div className="instrument-card__body">
        <p className="instrument-card__category">
          {category} · {instrumentStatus(product)}
        </p>
        <h3 className="product-card__title">{title}</h3>
        <p className="product-card__description">{specs}</p>
        <p className="product-card__price">
          {formatInstrumentPrice(product)}
          {discountPercent > 0 && (
            <>
              {' '}
              <s>{formatPrice(price)}</s>
            </>
          )}
        </p>
        <div className="instrument-card__actions">
          <a
            className="button button--secondary product-card__button"
            href={`product.html?item=${id}`}
            aria-label={`Подробнее: ${title}`}
          >
            <ProductIcon name="loupe" />
            Подробнее
          </a>
          {isAvailable && (
            <button
              className="button button--secondary"
              type="button"
              data-product={title}
            >
              <ProductIcon name="order-mark" />
              Быстрая заявка
            </button>
          )}
          <button
            className="button button--secondary favorite-toggle"
            type="button"
            data-favorite={id}
            aria-pressed={selected}
            onClick={() => onFavorite(id)}
          >
            <ProductIcon name="heart" />
            <span data-favorite-label>
              {selected ? 'В избранном' : 'В избранное'}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}

function Catalog() {
  const [products, setProducts] = useState(instruments);
  const [draft, setDraft] = useState(filtersFromUrl);
  const [filters, setFilters] = useState(filtersFromUrl);
  const [catalogPage, setCatalogPage] = useState(1);
  const [favorites, setFavorites] = useState(() =>
    readFavoriteIds(instruments),
  );
  const [favoriteMessage, setFavoriteMessage] = useState('');
  const [serverMessage, setServerMessage] = useState('');
  const count = useRef(null);

  useEffect(() => {
    if (query.get('source') !== 'go') return;

    const controller = new AbortController();
    async function loadProducts() {
      try {
        const response = await fetch('api/products', {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Каталог недоступен');
        const loaded = await response.json();
        setProducts(loaded);
        setCatalogPage(1);
        setServerMessage('Данные каталога получены с Go-сервера.');
      } catch (error) {
        if (error.name !== 'AbortError')
          setServerMessage('Go-сервер недоступен. Показан локальный каталог.');
      }
    }

    loadProducts();
    return () => controller.abort();
  }, []);

  function applyFilters(next) {
    setFilters(next);
    setCatalogPage(1);
    updateFilterUrl(next);
  }

  function toggleFavorite(id) {
    const next = new Set(favorites);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setFavorites(next);
    setFavoriteMessage(
      saveFavoriteIds(next)
        ? ''
        : 'Браузер не разрешил сохранить изменения между страницами.',
    );
  }

  const from = Number(filters['price-from']) || 0;
  const to =
    filters['price-to'] === '' ? Infinity : Number(filters['price-to']);
  const matches = products.filter((product) => {
    const price = instrumentFinalPrice(product);
    const categoryMatches =
      !filters.category.length ||
      filters.category.some((code) => categories[code] === product.category);
    return categoryMatches && price >= from && price <= to;
  });
  const totalPages = Math.max(1, Math.ceil(matches.length / pageSize));
  const first = (catalogPage - 1) * pageSize;

  function changePage(step) {
    setCatalogPage(catalogPage + step);
    count.current.focus({ preventScroll: true });
    count.current.scrollIntoView({ block: 'center' });
  }

  return (
    <section className="catalog-layout">
      <CatalogFilters
        draft={draft}
        setDraft={setDraft}
        onApply={applyFilters}
      />
      <section className="catalog-products">
        <h2 className="catalog-products__title">Все инструменты</h2>
        <p id="favorite-status" role="status">
          {favoriteMessage}
        </p>
        {serverMessage && <p role="status">{serverMessage}</p>}
        <p id="catalog-count" role="status" ref={count} tabIndex={-1}>
          {matches.length
            ? `Найдено: ${matches.length}`
            : 'Подходящих инструментов нет.'}
        </p>
        <div className="products-grid" id="catalog-grid">
          {matches.slice(first, first + pageSize).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              selected={favorites.has(product.id)}
              onFavorite={toggleFavorite}
            />
          ))}
        </div>
        <div className="catalog-pagination">
          <button
            className="button button--secondary"
            id="catalog-prev"
            type="button"
            disabled={catalogPage === 1}
            onClick={() => changePage(-1)}
          >
            Назад
          </button>
          <span id="catalog-page" role="status">
            {catalogPage} / {totalPages}
          </span>
          <button
            className="button button--secondary"
            id="catalog-next"
            type="button"
            disabled={catalogPage === totalPages}
            onClick={() => changePage(1)}
          >
            Далее
          </button>
        </div>
      </section>
    </section>
  );
}

logProductDemo(
  instruments.find((product) => product.discountPercent > 0) || instruments[0],
);
createRoot(document.getElementById('catalog-app')).render(<Catalog />);
