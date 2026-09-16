const $ = selector => document.querySelector(selector);
const kes = value => `KSh ${Number(value).toLocaleString('en-KE')}`;
const state = { categories: [], brands: [], products: [], customers: [], orders: [], entityType: 'category', editingEntityId: null, editingProductId: null };
const ORDER_STATUS_PILL = { paid: 'in', pending: 'low', failed: 'out', cancelled: 'out' };

async function request(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

function renderCategoryOptions() {
  const categoryOptions = state.categories.map(item => `<option value="${item.id}">${item.name}</option>`).join('');
  const brandOptions = state.brands.map(item => `<option value="${item.id}">${item.name}</option>`).join('');
  $('#categoryFilter').innerHTML = '<option value="all">All categories</option>' + categoryOptions;
  $('#brandCategoryField select').innerHTML = '<option value="">Select category</option>' + categoryOptions;
  $('#productForm [name="categoryId"]').innerHTML = '<option value="">Select category</option>' + categoryOptions;
  $('#productForm [name="brandId"]').innerHTML = '<option value="">Select brand</option>' + brandOptions;
}

function renderProducts() {
  const query = ($('#productSearch')?.value || '').toLowerCase();
  const category = $('#categoryFilter')?.value || 'all';
  const stock = $('#stockFilter')?.value || 'all';
  const products = state.products.filter(product => {
    const matchesQuery = [product.name, product.brand, product.category].some(value => (value || '').toLowerCase().includes(query));
    return matchesQuery && (category === 'all' || String(product.category_id) === category) && (stock === 'all' || product.status === stock);
  });
  $('#productRows').innerHTML = products.map(product => `<tr><td class="check"><input type="checkbox" aria-label="Select ${product.name}"></td><td><div class="product-cell"><img class="product-thumb" src="${product.image || ''}" alt=""><div class="product-name"><strong>${product.name}</strong><small>${product.brand}${product.badge ? ` · ${product.badge}` : ''}</small></div></div></td><td><span class="category-pill">${product.category}</span></td><td class="price-cell">${kes(product.price)}</td><td><span class="stock-pill ${product.status}">${product.status === 'out' ? 'Out of stock' : `${product.stock} in stock`}</span></td><td><span class="status-pill">Published</span></td><td><div class="row-actions"><button title="Edit product" data-edit-product="${product.id}">✎</button><button title="Delete product" data-delete-product="${product.id}">×</button></div></td></tr>`).join('');
  $('#productCount').textContent = products.length;
  $('#showingCount').textContent = products.length;
}

function renderEntities() {
  $('#categoryCards').innerHTML = state.categories.map(category => `<article class="entity-card"><div class="entity-top"><div class="entity-symbol">◈</div><div><button class="text-button" data-edit-category="${category.id}">Edit</button><button class="text-button" data-delete-category="${category.id}">Delete</button></div></div><h3>${category.name}</h3><p>Catalog category</p><footer><span>${state.products.filter(product => product.category_id === category.id).length} products</span><span>Active</span></footer></article>`).join('');
  $('#brandCards').innerHTML = state.brands.map(brand => `<article class="entity-card"><div class="entity-top"><div class="entity-symbol">${brand.name.slice(0, 2).toUpperCase()}</div><div><button class="text-button" data-edit-brand="${brand.id}">Edit</button><button class="text-button" data-delete-brand="${brand.id}">Delete</button></div></div><h3>${brand.name}</h3><p>${brand.category_name}</p><footer><span>${state.products.filter(product => product.brand_id === brand.id).length} products</span><span>Published</span></footer></article>`).join('');
}

async function loadCustomers() {
  const data = await request('/api/customers');
  state.customers = data.customers;
  renderCustomers();
}

function renderCustomers() {
  $('#customerRows').innerHTML = state.customers.map(customer => {
    const cartItems = (customer.cart || []).map(entry => {
      const product = state.products.find(item => item.id === Number(entry.productId));
      return product ? { name: product.name, qty: entry.qty, price: Number(product.price) } : null;
    }).filter(Boolean);
    const totalQty = cartItems.reduce((sum, item) => sum + item.qty, 0);
    const cartValue = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const cartSummary = cartItems.length ? `${totalQty} item${totalQty === 1 ? '' : 's'} · ${kes(cartValue)}` : 'Empty';
    const waDigits = (customer.phone || '').replace(/\D/g, '');
    const firstName = (customer.name || '').split(' ')[0];
    const waMessage = cartItems.length
      ? `Hello ${firstName}, this is AudioBullet Kenya — noticed you left ${cartItems.map(item => item.name).join(', ')} in your cart. Want a hand completing your order?`
      : `Hello ${firstName}, this is AudioBullet Kenya reaching out.`;
    const waHref = waDigits ? `https://wa.me/${waDigits}?text=${encodeURIComponent(waMessage)}` : '';
    const lastActivity = customer.cart_updated_at ? new Date(customer.cart_updated_at).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
    return `<tr>
      <td><div class="product-name"><strong>${customer.name}</strong><small>${customer.email}</small></div></td>
      <td>${customer.phone || '—'}</td>
      <td><span class="cart-pill ${cartItems.length ? 'has-items' : 'empty'}">${cartSummary}</span></td>
      <td>${lastActivity}</td>
      <td><div class="row-actions">${waHref ? `<a href="${waHref}" target="_blank" rel="noopener" title="Message on WhatsApp">💬</a>` : ''}</div></td>
    </tr>`;
  }).join('');
  $('#customerCount').textContent = state.customers.length;
}

async function loadOrders() {
  const data = await request('/api/orders');
  state.orders = data.orders;
  $('#metricOrders').textContent = state.orders.filter(order => order.status === 'pending' || order.status === 'paid').length;
  renderOrders();
}

function renderOrders() {
  const query = ($('#orderSearch')?.value || '').toLowerCase();
  const statusFilter = $('#orderStatusFilter')?.value || 'all';
  const orders = state.orders.filter(order => {
    const matchesQuery = [order.customer_name, order.customer_phone, String(order.id)].some(value => String(value || '').toLowerCase().includes(query));
    return matchesQuery && (statusFilter === 'all' || order.status === statusFilter);
  });
  $('#orderRows').innerHTML = orders.map(order => {
    const items = (order.items || []).map(entry => {
      const product = state.products.find(item => item.id === Number(entry.productId));
      return { name: product ? product.name : `Product #${entry.productId}`, qty: entry.qty };
    });
    const itemsSummary = items.map(item => `${item.qty}× ${item.name}`).join(', ');
    const waDigits = (order.customer_phone || '').replace(/\D/g, '');
    const waMessage = `Hello ${(order.customer_name || '').split(' ')[0]}, this is AudioBullet Kenya following up on order #${order.id} (${kes(order.subtotal)}).`;
    const waHref = waDigits ? `https://wa.me/${waDigits}?text=${encodeURIComponent(waMessage)}` : '';
    const date = new Date(order.created_at).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' });
    const payment = order.payment_method === 'card'
      ? `Card${order.card_brand ? ` · ${order.card_brand}` : ''}${order.card_last4 ? ` ••${order.card_last4}` : ''}`
      : 'M-Pesa';
    return `<tr>
      <td><strong>#${order.id}</strong></td>
      <td><div class="product-name"><strong>${order.customer_name}</strong><small>${order.customer_phone}</small></div></td>
      <td><span title="${itemsSummary}">${items.length} item${items.length === 1 ? '' : 's'}</span></td>
      <td class="price-cell">${kes(order.subtotal)}</td>
      <td><span class="category-pill">${payment}</span></td>
      <td><span class="stock-pill ${ORDER_STATUS_PILL[order.status] || 'low'}">${order.status}</span></td>
      <td>${date}</td>
      <td><div class="row-actions">${waHref ? `<a href="${waHref}" target="_blank" rel="noopener" title="Message on WhatsApp">💬</a>` : ''}</div></td>
    </tr>`;
  }).join('');
  $('#orderCount').textContent = orders.length;
}

function setView(view) {
  document.querySelectorAll('.view').forEach(section => section.classList.remove('active'));
  $(`#${view}View`).classList.add('active');
  document.querySelectorAll('.nav-item[data-view]').forEach(item => item.classList.toggle('active', item.dataset.view === view));
  $('#pageCrumb').textContent = view[0].toUpperCase() + view.slice(1);
  $('#sidebar').classList.remove('open');
}

function openEntityModal(type) {
  state.entityType = type;
  state.editingEntityId = null;
  const label = type === 'brand' ? 'brand' : 'category';
  $('#entityModalTitle').textContent = `Add ${label}`;
  $('#entityNameLabel').textContent = `${label[0].toUpperCase()}${label.slice(1)} name`;
  $('#brandCategoryField').style.display = type === 'brand' ? '' : 'none';
  $('#brandCategoryField select').required = type === 'brand';
  $('#entityForm button[type="submit"]').textContent = `Save ${label}`;
  $('#entityModal').classList.add('open');
  $('#entityModal').setAttribute('aria-hidden', 'false');
}

function editEntity(type, id) {
  const item = (type === 'category' ? state.categories : state.brands).find(value => value.id === Number(id));
  if (!item) return;
  state.editingEntityId = item.id;
  state.entityType = type;
  const label = type === 'brand' ? 'brand' : 'category';
  $('#entityModalTitle').textContent = `Edit ${label}`;
  $('#entityNameLabel').textContent = `${label[0].toUpperCase()}${label.slice(1)} name`;
  $('#brandCategoryField').style.display = type === 'brand' ? '' : 'none';
  $('#brandCategoryField select').required = type === 'brand';
  $('#entityForm [name="name"]').value = item.name;
  if (type === 'brand') $('#brandCategoryField select').value = item.category_id;
  $('#entityForm button[type="submit"]').textContent = `Update ${label}`;
  $('#entityModal').classList.add('open');
  $('#entityModal').setAttribute('aria-hidden', 'false');
}

function closeEntityModal() {
  $('#entityModal').classList.remove('open');
  $('#entityModal').setAttribute('aria-hidden', 'true');
  $('#entityForm').reset();
  state.editingEntityId = null;
}

function openProductModal(product = null) {
  state.editingProductId = product ? product.id : null;
  $('#productModal').classList.add('open');
  $('#productModal').setAttribute('aria-hidden', 'false');
  $('#modalTitle').textContent = product ? 'Edit product' : 'Add product';
  $('#productForm button[type="submit"]').textContent = product ? 'Update product' : 'Save product';
  if (product) {
    Object.entries({ name: product.name, categoryId: product.category_id, brandId: product.brand_id, price: product.price, originalPrice: product.originalPrice, stock: product.stock, badge: product.badge, spec: product.spec, description: product.description }).forEach(([name, value]) => {
      const input = $(`#productForm [name="${name}"]`);
      if (input) input.value = value ?? '';
    });
    [['#productImagePreview', product.image], ['#productImagePreview2', product.image2], ['#productImagePreview3', product.image3]].forEach(([selector, src]) => {
      if (src) { $(selector).src = src; $(selector).classList.add('visible'); }
    });
  }
}

function closeProductModal() {
  $('#productModal').classList.remove('open');
  $('#productModal').setAttribute('aria-hidden', 'true');
  $('#productForm').reset();
  ['#productImagePreview', '#productImagePreview2', '#productImagePreview3'].forEach(selector => $(selector).classList.remove('visible'));
  state.editingProductId = null;
}

async function deleteRecord(type, id, label) {
  if (!window.confirm(`Delete ${label}?`)) return;
  try {
    await request(`/api/${type}/${id}`, { method: 'DELETE' });
    await loadCatalog();
  } catch (error) { alert(error.message); }
}

function readImage(input, preview) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener('load', () => { preview.src = reader.result; preview.classList.add('visible'); });
  reader.readAsDataURL(file);
}

async function loadCatalog() {
  const catalog = await request('/api/catalog');
  state.categories = catalog.categories;
  state.brands = catalog.brands;
  state.products = catalog.products;
  const catalogValue = state.products.reduce((total, product) => total + Number(product.price || 0), 0);
  const lowStock = state.products.filter(product => product.status === 'low' || product.status === 'out').length;
  $('#metricProducts').textContent = state.products.length;
  $('#metricValue').textContent = kes(catalogValue);
  $('#metricLowStock').textContent = lowStock;
  $('#totalProductCount').textContent = state.products.length;
  renderCategoryOptions();
  renderProducts();
  renderEntities();
}

document.querySelectorAll('.nav-item[data-view]').forEach(item => item.addEventListener('click', () => setView(item.dataset.view)));
document.querySelectorAll('[data-view-target]').forEach(item => item.addEventListener('click', () => setView(item.dataset.viewTarget)));
document.querySelectorAll('[data-open-product]').forEach(button => button.addEventListener('click', () => openProductModal()));
document.querySelectorAll('[data-close-product]').forEach(button => button.addEventListener('click', closeProductModal));
document.querySelectorAll('[data-open-entity]').forEach(button => button.addEventListener('click', () => openEntityModal(button.dataset.openEntity)));
document.querySelectorAll('[data-close-entity]').forEach(button => button.addEventListener('click', closeEntityModal));
$('#productModal').addEventListener('click', event => { if (event.target.id === 'productModal') closeProductModal(); });
$('#entityModal').addEventListener('click', event => { if (event.target.id === 'entityModal') closeEntityModal(); });
$('#productSearch').addEventListener('input', renderProducts);
$('#categoryFilter').addEventListener('change', renderProducts);
$('#stockFilter').addEventListener('change', renderProducts);
$('#orderSearch').addEventListener('input', renderOrders);
$('#orderStatusFilter').addEventListener('change', renderOrders);
$('#mobileMenu').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
$('#productForm [name="image"]').addEventListener('change', event => readImage(event.target, $('#productImagePreview')));
$('#productForm [name="image2"]').addEventListener('change', event => readImage(event.target, $('#productImagePreview2')));
$('#productForm [name="image3"]').addEventListener('change', event => readImage(event.target, $('#productImagePreview3')));
document.addEventListener('click', event => {
  const button = event.target.closest('[data-edit-category], [data-edit-brand], [data-delete-category], [data-delete-brand], [data-edit-product], [data-delete-product]');
  if (!button) return;
  if (button.dataset.editCategory) editEntity('category', button.dataset.editCategory);
  if (button.dataset.editBrand) editEntity('brand', button.dataset.editBrand);
  if (button.dataset.deleteCategory) deleteRecord('categories', button.dataset.deleteCategory, 'this category');
  if (button.dataset.deleteBrand) deleteRecord('brands', button.dataset.deleteBrand, 'this brand');
  if (button.dataset.editProduct) openProductModal(state.products.find(product => product.id === Number(button.dataset.editProduct)));
  if (button.dataset.deleteProduct) deleteRecord('products', button.dataset.deleteProduct, 'this product');
});

$('#entityForm').addEventListener('submit', async event => {
  event.preventDefault();
  const data = new FormData(event.target);
  try {
    const resource = state.entityType === 'category' ? 'categories' : 'brands';
    const payload = state.entityType === 'category' ? { name: data.get('name') } : { name: data.get('name'), categoryId: data.get('category') };
    await request(`/api/${resource}${state.editingEntityId ? `/${state.editingEntityId}` : ''}`, { method: state.editingEntityId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    closeEntityModal();
    state.editingEntityId = null;
    await loadCatalog();
  } catch (error) { alert(error.message); }
});

$('#productForm').addEventListener('submit', async event => {
  event.preventDefault();
  try {
    await request(`/api/products${state.editingProductId ? `/${state.editingProductId}` : ''}`, { method: state.editingProductId ? 'PUT' : 'POST', body: new FormData(event.target) });
    closeProductModal();
    await loadCatalog();
  } catch (error) { alert(error.message); }
});

loadCatalog()
  .then(() => Promise.all([
    loadCustomers().catch(error => console.error('Could not load customers:', error)),
    loadOrders().catch(error => console.error('Could not load orders:', error)),
  ]))
  .catch(error => alert(`Could not connect to the catalog database: ${error.message}`));