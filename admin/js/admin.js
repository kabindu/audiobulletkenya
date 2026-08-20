const $ = selector => document.querySelector(selector);
const kes = value => `KSh ${Number(value).toLocaleString('en-KE')}`;
const state = { categories: [], brands: [], products: [], entityType: 'category', editingEntityId: null, editingProductId: null };

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
    if (product.image) { $('#productImagePreview').src = product.image; $('#productImagePreview').classList.add('visible'); }
  }
}

function closeProductModal() {
  $('#productModal').classList.remove('open');
  $('#productModal').setAttribute('aria-hidden', 'true');
  $('#productForm').reset();
  $('#productImagePreview').classList.remove('visible');
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
document.querySelectorAll('[data-open-product]').forEach(button => button.addEventListener('click', openProductModal));
document.querySelectorAll('[data-close-product]').forEach(button => button.addEventListener('click', closeProductModal));
document.querySelectorAll('[data-open-entity]').forEach(button => button.addEventListener('click', () => openEntityModal(button.dataset.openEntity)));
document.querySelectorAll('[data-close-entity]').forEach(button => button.addEventListener('click', closeEntityModal));
$('#productModal').addEventListener('click', event => { if (event.target.id === 'productModal') closeProductModal(); });
$('#entityModal').addEventListener('click', event => { if (event.target.id === 'entityModal') closeEntityModal(); });
$('#productSearch').addEventListener('input', renderProducts);
$('#categoryFilter').addEventListener('change', renderProducts);
$('#stockFilter').addEventListener('change', renderProducts);
$('#mobileMenu').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
$('#productForm [name="image"]').addEventListener('change', event => readImage(event.target, $('#productImagePreview')));
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

loadCatalog().catch(error => alert(`Could not connect to the catalog database: ${error.message}`));