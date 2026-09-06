/* ============================================================
   PRODUCT DETAIL PAGE — image gallery (up to 3 images) + bigger
   description, Jumia-style. Shares icons/format helpers with the
   storefront via js/catalog-shared.js.
   ============================================================ */
let product = null;
let galleryImages = [];
let activeImageIndex = 0;
let qty = 1;

const cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '{}');

function saveCart(){
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  document.getElementById('cartCount').textContent = Object.values(cart).reduce((s,q)=>s+q,0);
}

function renderGallery(){
  const media = document.getElementById('pdMainMedia');
  const icon = ICONS[product.category] || ICONS.speakers;
  const existingArrows = media.querySelectorAll('.pd-nav-arrow');
  media.querySelectorAll('img, .image-fallback').forEach(el=>el.remove());
  media.insertAdjacentHTML('afterbegin', `<img src="${galleryImages[activeImageIndex]}" alt="${product.name}" onerror="this.hidden=true;this.nextElementSibling.hidden=false;"><span class="image-fallback" hidden>${icon}</span>`);
  existingArrows.forEach(arrow => arrow.hidden = galleryImages.length < 2);

  document.getElementById('pdThumbs').innerHTML = galleryImages.length < 2 ? '' : galleryImages.map((src,i)=>`
    <button class="pd-thumb ${i===activeImageIndex?'active':''}" data-i="${i}">
      <img src="${src}" alt="${product.name} view ${i+1}" onerror="this.style.display='none'">
    </button>`).join('');
  document.querySelectorAll('.pd-thumb').forEach(btn=>{
    btn.addEventListener('click', ()=>{ activeImageIndex = Number(btn.dataset.i); renderGallery(); });
  });
}

function goToImage(delta){
  activeImageIndex = (activeImageIndex + delta + galleryImages.length) % galleryImages.length;
  renderGallery();
}

function renderProduct(){
  const discount = product.originalPrice ? Math.round(100 * (1 - product.price / product.originalPrice)) : null;
  document.title = `${product.name} — AudioBullet Kenya`;
  document.getElementById('pdCrumb').innerHTML = `<a href="home.html">Shop</a> &rsaquo; <span>${product.category_name || product.category}</span> &rsaquo; <span>${product.name}</span>`;
  document.getElementById('pdBrand').textContent = product.brand;
  document.getElementById('pdTitle').textContent = product.name;
  document.getElementById('pdRating').innerHTML = `<span class="stars">${starsSVG(product.rating || 0, 16)}</span> <span>${product.rating || 0}</span> <span style="color:var(--text-faint)">(${product.reviews || 0} reviews)</span>`;
  document.getElementById('pdPriceRow').innerHTML = `
    <span class="pd-price">${fmt(product.price)}</span>
    ${product.originalPrice ? `<span class="pd-price-old">${fmt(product.originalPrice)}</span>` : ''}
    ${discount ? `<span class="pd-discount-tag">-${discount}%</span>` : ''}
  `;
  document.getElementById('pdSpec').textContent = product.spec || '';
  document.getElementById('pdSpec').hidden = !product.spec;
  const stockOut = product.status === 'out';
  document.getElementById('pdStock').innerHTML = stockOut
    ? `<span class="card-stock low">Out of stock</span>`
    : `<span class="card-stock">In stock &middot; ships in 2&ndash;4 days</span>`;
  document.getElementById('pdAddBtn').disabled = stockOut;
  document.getElementById('pdMobileAddBtn').disabled = stockOut;
  document.getElementById('pdMobilePrice').textContent = fmt(product.price);
  document.getElementById('pdDescription').innerHTML = (product.description || 'No description provided for this product yet.')
    .split(/\n+/).filter(Boolean).map(paragraph => `<p>${paragraph}</p>`).join('');

  galleryImages = imagesForProduct(product);
  activeImageIndex = 0;
  renderGallery();
}

function setQty(next){
  qty = Math.max(1, next);
  document.getElementById('pdQtyNum').textContent = qty;
}

function flashAdded(){
  const note = document.getElementById('pdAddedNote');
  note.hidden = false;
  clearTimeout(flashAdded._t);
  flashAdded._t = setTimeout(()=> note.hidden = true, 2200);
}

function addCurrentToCart(){
  cart[product.id] = (cart[product.id] || 0) + qty;
  saveCart();
  flashAdded();
}

async function boot(){
  const id = new URLSearchParams(window.location.search).get('id');
  saveCart();
  try {
    const response = await fetch('/api/catalog');
    const catalog = await response.json();
    const categoryNames = new Map(catalog.categories.map(c => [c.id, c.name]));
    const found = catalog.products.find(p => String(p.id) === String(id));
    if(found){
      const category = storefrontCategoryId(categoryNames.get(found.category_id) || found.category || 'equipment');
      product = {
        id: found.id,
        name: found.name,
        brand: found.brand,
        category,
        category_name: categoryNames.get(found.category_id) || found.category,
        price: Number(found.price),
        originalPrice: found.originalPrice ? Number(found.originalPrice) : null,
        spec: found.spec || '',
        description: found.description || '',
        status: found.status,
        rating: 0,
        reviews: 0,
        image: found.image,
        image2: found.image2,
        image3: found.image3,
      };
    }
  } catch(error){
    console.error(error);
  }

  if(!product){
    document.getElementById('pdNotFound').hidden = false;
    return;
  }

  document.getElementById('pdWrap').hidden = false;
  document.getElementById('pdMobileBar').hidden = false;
  renderProduct();

  document.getElementById('pdPrev').addEventListener('click', ()=> goToImage(-1));
  document.getElementById('pdNext').addEventListener('click', ()=> goToImage(1));
  document.getElementById('pdQtyDec').addEventListener('click', ()=> setQty(qty - 1));
  document.getElementById('pdQtyInc').addEventListener('click', ()=> setQty(qty + 1));
  document.getElementById('pdAddBtn').addEventListener('click', addCurrentToCart);
  document.getElementById('pdMobileAddBtn').addEventListener('click', addCurrentToCart);
  document.getElementById('pdQuoteBtn').addEventListener('click', ()=> alert('Bulk quote requests are coming soon — reach us via WhatsApp for now.'));

  let touchStartX = null;
  const media = document.getElementById('pdMainMedia');
  media.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  media.addEventListener('touchend', e => {
    if(touchStartX == null || galleryImages.length < 2) return;
    const delta = e.changedTouches[0].clientX - touchStartX;
    if(Math.abs(delta) > 40) goToImage(delta < 0 ? 1 : -1);
    touchStartX = null;
  });
}

boot();
