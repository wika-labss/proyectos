const COLOR_HEX = {
	'blanco': '#ffffff', 'azul marino': '#1f2a4a', 'beige': '#e8dcc0', 'gris': '#9a978d',
	'beige oscuro': '#b89a67', 'beige claro': '#e6d7ab', 'pistacho': '#adbb7e', 'negro': '#242322',
	'café moro': '#5b4230', 'gris perla': '#a9adae'
};

function escapeHtml(value) {
	return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

const DIACRITICS_PATTERN = new RegExp(String.fromCharCode(91, 92, 117, 48, 51, 48, 48, 45, 92, 117, 48, 51, 54, 102, 93), 'g');

function slugifyCategory(text) {
	return (text || '')
		.toString()
		.normalize('NFD')
		.replace(DIACRITICS_PATTERN, '')
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');
}

function priceFrom(product) {
	const values = [];
	(product.tables || []).forEach(table => (table.rows || []).forEach(row => {
		const last = row[row.length - 1] || '';
		const num = parseInt(String(last).replace(/[^0-9]/g, ''), 10);
		if (!Number.isNaN(num)) values.push(num);
	}));
	if (!values.length) return '';
	return `Desde $${Math.min(...values).toLocaleString('es-CL')}`;
}

function renderSpecTable(table) {
	const headers = table.headers || [];
	const rows = table.rows || [];
	return `<table class="spec-table">${table.title ? `<caption>${escapeHtml(table.title)}</caption>` : ''}<thead><tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map((cell, i) => `<td${i === row.length - 1 ? ' class="price"' : ''}>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

function renderProductCard(product) {
	const price = priceFrom(product);
	const colorsHtml = (product.colors || []).length
		? `<div class="card-colors">${product.colors.map(c => `<span class="color-dot" title="${escapeHtml(c)}" style="--dot:${COLOR_HEX[c.toLowerCase()] || '#ccc'}"></span>`).join('')}</div>`
		: '';
	const tablesHtml = (product.tables || []).filter(t => (t.rows || []).length).map(renderSpecTable).join('');
	const specsHtml = tablesHtml ? `<details class="card-specs"><summary>Ver medidas y precios</summary>${tablesHtml}</details>` : '';
	const hasImage = Boolean(product.imagen);
	const mediaHtml = hasImage ? `<div class="catalog-card-media"><img src="${escapeHtml(product.imagen)}" alt="${escapeHtml(product.title)}" loading="lazy"></div>` : '';
	return `<figure class="catalog-card${hasImage ? '' : ' no-media'}">${mediaHtml}<figcaption>` +
		`<span class="card-eyebrow">${escapeHtml(product.category)}</span>` +
		`<h2>${escapeHtml(product.title)}</h2>` +
		(product.description ? `<p>${escapeHtml(product.description)}</p>` : '') +
		colorsHtml +
		(price ? `<p class="card-price">${price}</p>` : '') +
		specsHtml +
		`</figcaption></figure>`;
}

const catalog = document.querySelector('[data-catalog]');
if (catalog) {
	const grid = catalog.querySelector('.catalog-grid');
	const count = catalog.querySelector('.product-count');
	const filtersWrap = catalog.querySelector('.filters');
	let allProducts = [];
	let categories = [];

	const render = category => {
		const visible = category === 'todos' ? allProducts : allProducts.filter(p => slugifyCategory(p.category) === category);
		grid.innerHTML = visible.length
			? visible.map(renderProductCard).join('')
			: '<p class="catalog-empty">No hay productos en esta categoría por ahora.</p>';
		count.textContent = `${visible.length} ${visible.length === 1 ? 'producto' : 'productos'}`;
		filtersWrap.querySelectorAll('.filter-button').forEach(button => button.classList.toggle('is-active', button.dataset.category === category));
	};

	const buildFilters = initial => {
		const entries = [{ label: 'Todos', slug: 'todos' }, ...categories.map(c => ({ label: c, slug: slugifyCategory(c) }))];
		filtersWrap.innerHTML = entries.map(entry => `<button class="filter-button${entry.slug === initial ? ' is-active' : ''}" data-category="${entry.slug}">${escapeHtml(entry.label)}</button>`).join('');
		filtersWrap.querySelectorAll('.filter-button').forEach(button => button.addEventListener('click', () => render(button.dataset.category)));
	};

	grid.innerHTML = '<p class="catalog-empty">Cargando catálogo…</p>';
	fetch('/api/products')
		.then(response => response.json())
		.then(data => {
			allProducts = data.products || [];
			categories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
			const requested = new URLSearchParams(window.location.search).get('categoria');
			const initial = requested && categories.some(c => slugifyCategory(c) === requested) ? requested : 'todos';
			buildFilters(initial);
			render(initial);
		})
		.catch(() => {
			grid.innerHTML = '<p class="catalog-empty">No pudimos cargar el catálogo. Intenta nuevamente más tarde.</p>';
			count.textContent = '';
		});
}

const contactForm = document.querySelector('.contact-form');
if (contactForm) contactForm.addEventListener('submit', event => {
	event.preventDefault();
	const status = contactForm.querySelector('.form-status');
	status.textContent = 'Gracias. Recibimos tu mensaje y te contactaremos pronto.';
	contactForm.reset();
});
