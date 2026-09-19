const $ = selector => document.querySelector(selector);
const kes = value => `KSh ${Number(value).toLocaleString('en-KE')}`;
const state = { categories: [], brands: [], products: [], editingProductId: null };

async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (response.status === 401) { window.location.href = '/seller/login.html'; throw new Error('Not signed in.'); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

/* ---------- lightweight toast + confirm (no browser alert/confirm) ---------- */
function ensureNotifyStyles() {
  if (document.getElementById('notifyStyles')) return;
  const style = document.createElement('style');
  style.id = 'notifyStyles';
  style.textContent = `#toastStack{position:fixed;top:20px;right:20px;z-index:300;display:flex;flex-direction:column;gap:8px;pointer-events:none;}.toast{pointer-events:auto;min-width:220px;max-width:340px;padding:12px 16px;border-radius:8px;font-size:13px;font-weight:600;color:#fff;box-shadow:0 8px 24px rgba(0,0,0,.18);opacity:0;transform:translateX(16px);transition:opacity .2s ease,transform .2s ease;}.toast.show{opacity:1;transform:translateX(0);}.toast.success{background:#16845b;}.toast.error{background:#c24135;}.toast.info{background:#142333;}.confirm-backdrop{position:fixed;inset:0;background:rgba(19,25,33,.55);display:flex;align-items:center;justify-content:center;z-index:310;}.confirm-box{background:#fff;border-radius:10px;padding:22px 24px;max-width:340px;box-shadow:0 24px 60px rgba(0,0,0,.25);}.confirm-box p{margin:0 0 18px;font-size:14px;color:#17212b;line-height:1.5;}.confirm-actions{display:flex;justify-content:flex-end;gap:8px;}`;
  document.head.appendChild(style);
}

function showToast(message, type = 'success') {
  ensureNotifyStyles();
  let stack = document.getElementById('toastStack');
  if (!stack) {
    stack = document.createElement('div');
    stack.id = 'toastStack';
    document.body.appendChild(stack);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  stack.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

function confirmAction(message) {
  ensureNotifyStyles();
  return new Promise(resolve => {
    const backdrop = document.createElement('div');
    backdrop.className = 'confirm-backdrop';
    backdrop.innerHTML = `<div class="confirm-box"><p>${message}</p><div class="confirm-actions"><button type="button" class="secondary-button" data-confirm="cancel">Cancel</button><button type="button" class="primary-button" data-confirm="ok">Confirm</button></div></div>`;
    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', event => {
      if (event.target === backdrop) { backdrop.remove(); resolve(false); return; }
      const action = event.target.closest('[data-confirm]');
      if (!action) return;
      backdrop.remove();
      resolve(action.dataset.confirm === 'ok');
    });
  });
}

function renderCategoryOptions() {
  $('#productForm [name="categoryId"]').innerHTML = '<option value="">Select category</option>' + state.categories.map(item => `<option value="${item.id}">${item.name}</option>`).join('');
  $('#productForm [name="brandId"]').innerHTML = '<option value="">Select brand</option>' + state.brands.map(item => `<option value="${item.id}">${item.name}</option>`).join('');
}

function renderProducts() {
  const query = ($('#productSearch')?.value || '').toLowerCase();
  const products = state.products.filter(product => [product.name, product.brand, product.category].some(value => (value || '').toLowerCase().includes(query)));
  $('#productRows').innerHTML = products.map(product => `<tr><td><div class="product-cell"><img class="product-thumb" src="${product.image || ''}" alt=""><div class="product-name"><strong>${product.name}</strong><small>${product.brand}${product.badge ? ` · ${product.badge}` : ''}</small></div></div></td><td><span class="category-pill">${product.category}</span></td><td class="price-cell">${kes(product.price)}</td><td><span class="stock-pill ${product.status}">${product.status === 'out' ? 'Out of stock' : `${product.stock} in stock`}</span></td><td><div class="row-actions"><button title="Edit product" data-edit-product="${product.id}">&#9998;</button><button title="Delete product" data-delete-product="${product.id}">&times;</button></div></td></tr>`).join('');
  $('#productCount').textContent = products.length;
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

async function deleteProduct(id) {
  if (!(await confirmAction('Delete this product?'))) return;
  try {
    await request(`/api/seller/products/${id}`, { method: 'DELETE' });
    showToast('Product deleted.');
    await loadProducts();
  } catch (error) { showToast(error.message, 'error'); }
}

function readImage(input, preview) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener('load', () => { preview.src = reader.result; preview.classList.add('visible'); });
  reader.readAsDataURL(file);
}

async function loadCatalogOptions() {
  const catalog = await request('/api/taxonomy');
  state.categories = catalog.categories;
  state.brands = catalog.brands;
  renderCategoryOptions();
}

async function loadProducts() {
  const data = await request('/api/seller/products');
  state.products = data.products;
  renderProducts();
}

async function loadSellerProfile() {
  const seller = await request('/api/seller/me');
  $('#sellerBusinessName').textContent = seller.business_name;
  $('#sellerContactName').textContent = seller.contact_name;
  $('#sellerEmail').textContent = seller.email;
  $('#sellerAvatar').textContent = seller.business_name.slice(0, 2).toUpperCase();
}

document.querySelectorAll('[data-open-product]').forEach(button => button.addEventListener('click', () => openProductModal()));
document.querySelectorAll('[data-close-product]').forEach(button => button.addEventListener('click', closeProductModal));
$('#productModal').addEventListener('click', event => { if (event.target.id === 'productModal') closeProductModal(); });
$('#productSearch').addEventListener('input', renderProducts);
$('#mobileMenu').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
$('#productForm [name="image"]').addEventListener('change', event => readImage(event.target, $('#productImagePreview')));
$('#productForm [name="image2"]').addEventListener('change', event => readImage(event.target, $('#productImagePreview2')));
$('#productForm [name="image3"]').addEventListener('change', event => readImage(event.target, $('#productImagePreview3')));
$('#sellerLogoutBtn').addEventListener('click', async () => {
  await request('/api/seller/logout', { method: 'POST' }).catch(() => {});
  window.location.href = '/seller/login.html';
});
document.addEventListener('click', event => {
  const button = event.target.closest('[data-edit-product], [data-delete-product]');
  if (!button) return;
  if (button.dataset.editProduct) openProductModal(state.products.find(product => product.id === Number(button.dataset.editProduct)));
  if (button.dataset.deleteProduct) deleteProduct(button.dataset.deleteProduct);
});

$('#productForm').addEventListener('submit', async event => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const editingId = state.editingProductId;
  closeProductModal(); // close immediately so a second click can't submit the same form twice
  try {
    await request(`/api/seller/products${editingId ? `/${editingId}` : ''}`, { method: editingId ? 'PUT' : 'POST', body: formData });
    showToast(editingId ? 'Product updated.' : 'Product added.');
    await loadProducts();
  } catch (error) { showToast(error.message, 'error'); }
});

Promise.all([loadSellerProfile(), loadCatalogOptions(), loadProducts()])
  .catch(error => { if (error.message !== 'Not signed in.') showToast(`Could not load your dashboard: ${error.message}`, 'error'); });
