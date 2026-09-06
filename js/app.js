/* ============================================================
   ICONS, PRODUCT_IMAGES, PRODUCT_IMAGE_POOLS, imageForProduct,
   imagesForProduct, storefrontCategoryId, fmt, starsSVG and
   productImage all live in js/catalog-shared.js (loaded before
   this file) so the product detail page can reuse them too.
   ============================================================ */

function renderSkeletonGrid(count = 9){
  const grid = document.getElementById('productGrid');
  if(!grid) return;
  grid.innerHTML = Array.from({length: count}).map(() => `
    <article class="card skeleton-card">
      <div class="card-media skeleton-block"></div>
      <div class="card-body">
        <div class="skeleton-line" style="width:35%;height:8px;"></div>
        <div class="skeleton-line" style="width:90%;"></div>
        <div class="skeleton-line" style="width:50%;"></div>
        <div class="skeleton-line" style="width:40%;height:16px;margin-top:4px;"></div>
      </div>
    </article>`).join('');
}

async function loadStorefrontCatalog(){
  const response = await fetch('/api/catalog');
  if(!response.ok) throw new Error('Could not load the catalog.');
  const catalog = await response.json();
  const categoryMap = new Map(catalog.categories.map(category => [category.id, storefrontCategoryId(category.name)]));
  CATEGORIES = catalog.categories.map(category => ({
    id: categoryMap.get(category.id),
    dbId: category.id,
    name: category.name,
    desc: 'Audio equipment and instruments',
  }));
  BRANDS_BY_CAT = {};
  catalog.brands.forEach(brand => {
    const categoryId = categoryMap.get(brand.category_id);
    if(!BRANDS_BY_CAT[categoryId]) BRANDS_BY_CAT[categoryId] = [];
    BRANDS_BY_CAT[categoryId].push(brand.name);
  });
  const categoryNames = new Map(catalog.categories.map(category => [category.id, category.name]));
  PRODUCTS = catalog.products.map(product => {
    const category = storefrontCategoryId(categoryNames.get(product.category_id) || product.category || 'equipment');
    return {
      id: String(product.id),
      name: product.name,
      category,
      brand: product.brand,
      price: Number(product.price),
      rating: 0,
      reviews: 0,
      spec: product.spec || '',
      originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
      badge: product.badge || null,
      stock: product.status,
      newArrival: false,
      image: product.image || imageForProduct(category, product.name),
      images: imagesForProduct({ category, image: product.image, image2: product.image2, image3: product.image3 }),
      categoryId: product.category_id,
      brandId: product.brand_id,
    };
  });
}

/* ============================================================
   DATA
   ============================================================ */
let CATEGORIES = [
  {id:'speakers', name:'Speakers', desc:'PA, studio monitors & subwoofers'},
  {id:'keyboards', name:'Keyboards', desc:'Synths, stage pianos & workstations'},
  {id:'microphones', name:'Microphones', desc:'Studio, live & broadcast mics'},
  {id:'saxophones', name:'Saxophones', desc:'Alto, tenor & soprano horns'},
  {id:'guitars', name:'Guitars & Bass', desc:'Electric, acoustic & bass'},
  {id:'drums', name:'Drums & Percussion', desc:'Acoustic kits, electronic & hand percussion'},
  {id:'mixers', name:'Mixers & DJ Gear', desc:'Consoles, controllers & interfaces'},
  {id:'headphones', name:'Headphones', desc:'Studio, DJ & reference monitoring'},
];

let BRANDS_BY_CAT = {
  speakers: ['Voltek','Coastline Audio','Ridgeback','Solstice','Aurion'],
  keyboards: ['Ivory & Ash','Northwyn','Halcyon','Ferro','Vantage'],
  microphones: ['Cardinal','Whisperline','TrueVox','Meridian','Solstice'],
  saxophones: ['Brassforge','Aldercroft','Meridian Winds','Solaris Horns','Coppervale'],
  guitars: ['Ridgeline','Copperwood','Vantage','Ironhide','Northwyn'],
  drums: ['Ironhide','Cascade','Thundercraft','Ridgeback','Ferro'],
  mixers: ['Nexlink','Gridtone','Cue & Co','Voltek','Aurion'],
  headphones: ['Aurion','Silentwave','Driftline','Cardinal','Solstice'],
};

function p(name,category,brand,price,rating,reviews,spec,opts={}){
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-'+brand.toLowerCase().replace(/[^a-z0-9]+/g,''),
    name, category, brand, price, rating, reviews, spec: spec.replace(/\u00c2\u00b7/g, ' - '),
    originalPrice: opts.originalPrice || null,
    badge: opts.badge || null,
    stock: opts.stock || 'in',
    newArrival: opts.newArrival || false,
    image: opts.image || imageForProduct(category, name),
    images: imagesForProduct({ category, image: opts.image }),
  };
}

let PRODUCTS = [
  // SPEAKERS
  p('Summit 12 Powered PA Speaker','speakers','Voltek',449,4.6,312,'1200W Â· 12in'),
  p('Coastline M5 Studio Monitor (Pair)','speakers','Coastline Audio',329,4.8,540,'5in Â· Bi-amp',{badge:'Best Seller'}),
  p('Ridgeback Sub-18 Powered Subwoofer','speakers','Ridgeback',699,4.5,98,'2000W Â· 18in'),
  p('Solstice Array Line Column PA','speakers','Solstice',1290,4.7,64,'2400W Â· Line Array',{originalPrice:1490}),
  p('Aurion Compact Bookshelf Monitor','speakers','Aurion',159,4.3,221,'2-way Â· 4in',{newArrival:true}),
  p('Voltek Stage 15 Active Speaker','speakers','Voltek',579,4.6,145,'1500W Â· 15in'),
  p('Coastline Nearfield Monitor Pair','speakers','Coastline Audio',449,4.7,238,'7in Â· Bi-amp'),

  // KEYBOARDS
  p('Ivory & Ash 88 Stage Piano','keyboards','Ivory & Ash',899,4.8,412,'88-key Hammer',{badge:'Best Seller'}),
  p('Northwyn Poly-6 Analog Synth','keyboards','Northwyn',749,4.6,187,'6-voice Analog'),
  p('Halcyon Workstation X1','keyboards','Halcyon',1199,4.7,96,'76-key Â· 256 Voice'),
  p('Ferro Mini Groove Synth','keyboards','Ferro',329,4.4,268,'37-key Â· Sequencer',{originalPrice:379}),
  p('Vantage 61 Controller Keyboard','keyboards','Vantage',219,4.5,341,'61-key MIDI',{newArrival:true}),
  p('Halcyon Compact Stage Piano','keyboards','Halcyon',599,4.6,173,'88-key Â· Weighted'),
  p('Northwyn Desktop FM Synth','keyboards','Northwyn',289,4.4,204,'8-voice Â· FM Engine'),

  // MICROPHONES
  p('Cardinal C414 Studio Condenser','microphones','Cardinal',389,4.9,678,'Large Diaphragm',{badge:'Top Rated'}),
  p('Whisperline Dynamic Vocal Mic','microphones','Whisperline',129,4.6,894,'Cardioid Dynamic'),
  p('TrueVox Broadcast Ribbon Mic','microphones','TrueVox',549,4.7,132,'Ribbon Â· XLR'),
  p('Meridian Lavalier Wireless Set','microphones','Meridian',179,4.4,410,'UHF Wireless',{originalPrice:219}),
  p('Solstice USB Podcast Mic','microphones','Solstice',99,4.5,1023,'USB Â· Cardioid',{newArrival:true}),
  p('Cardinal C220 Large Diaphragm Mic','microphones','Cardinal',249,4.7,356,'Condenser Â· Shockmount'),
  p('TrueVox Stage Drum Mic Pack','microphones','TrueVox',329,4.6,119,'7-piece Â· Dynamic'),

  // SAXOPHONES
  p('Brassforge Pro Tenor Saxophone','saxophones','Brassforge',1899,4.8,84,'Bb Tenor Â· Lacquer',{badge:'Best Seller'}),
  p('Aldercroft Student Alto Sax','saxophones','Aldercroft',799,4.5,156,'Eb Alto Â· Beginner'),
  p('Meridian Winds Soprano Saxophone','saxophones','Meridian Winds',1299,4.6,47,'Bb Soprano Â· Straight'),
  p('Solaris Horns Vintage Alto Sax','saxophones','Solaris Horns',2199,4.9,29,'Eb Alto Â· Vintage Finish',{originalPrice:2499}),
  p('Coppervale Baritone Saxophone','saxophones','Coppervale',3199,4.7,18,'Eb Baritone Â· Pro'),
  p('Brassforge Classic Alto Saxophone','saxophones','Brassforge',1099,4.7,72,'Eb Alto Â· Lacquer'),
  p('Aldercroft Student Tenor Sax','saxophones','Aldercroft',999,4.4,91,'Bb Tenor Â· Beginner'),

  // GUITARS
  p('Ridgeline Custom Tele-Style Electric','guitars','Ridgeline',649,4.7,203,'Solid Body Â· Maple Neck'),
  p('Copperwood Dreadnought Acoustic','guitars','Copperwood',429,4.6,318,'Spruce Top Acoustic',{badge:'Best Seller'}),
  p('Vantage 5-String Bass Guitar','guitars','Vantage',589,4.5,142,'5-String Â· Active EQ'),
  p('Ironhide Metal Series Electric','guitars','Ironhide',749,4.6,166,'Humbucker Â· Fast Neck',{newArrival:true}),
  p('Northwyn Travel Acoustic Guitar','guitars','Northwyn',249,4.3,271,'3/4 Size Â· Mahogany',{originalPrice:289}),
  p('Ridgeline Semi-Hollow Electric','guitars','Ridgeline',829,4.7,117,'Semi-Hollow Â· P90'),
  p('Copperwood Auditorium Acoustic','guitars','Copperwood',699,4.8,83,'Solid Spruce Â· Rosewood'),

  // DRUMS
  p('Ironhide 5-Piece Acoustic Kit','drums','Ironhide',999,4.7,88,'5-Piece Â· Birch Shell',{badge:'Best Seller'}),
  p('Cascade Electronic Drum Kit','drums','Cascade',779,4.6,214,'Mesh Head Â· 40 Kits'),
  p('Thundercraft Cajon Box Drum','drums','Thundercraft',129,4.5,367,'Solid Wood Cajon'),
  p('Ridgeback 22in Ride Cymbal','drums','Ridgeback',189,4.6,92,'Bronze B20',{newArrival:true}),
  p('Ferro Hand Percussion Bundle','drums','Ferro',89,4.4,198,'Shaker + Tambourine + Block'),
  p('Cascade 10in Electronic Pad','drums','Cascade',149,4.5,143,'USB Â· 30 Sounds'),
  p('Thundercraft Brass Cymbal Pack','drums','Thundercraft',399,4.6,62,'14in + 16in + 18in'),

  // MIXERS / DJ
  p('Nexlink 16-Channel Analog Mixer','mixers','Nexlink',459,4.5,121,'16-Ch Â· 4-Bus'),
  p('Gridtone 2-Deck DJ Controller','mixers','Gridtone',599,4.7,276,'2-Deck Â· Serato Ready',{badge:'Best Seller'}),
  p('Cue & Co 4-Channel Club Mixer','mixers','Cue & Co',899,4.8,74,'4-Ch Â· Rotary'),
  p('Voltek USB Audio Interface 2i2','mixers','Voltek',159,4.6,512,'2-in 2-out Â· 24-bit',{originalPrice:189}),
  p('Aurion Digital 32-Ch Live Console','mixers','Aurion',2499,4.7,31,'32-Ch Digital',{newArrival:true}),
  p('Nexlink 8-Channel USB Mixer','mixers','Nexlink',229,4.5,287,'8-Ch Â· Bluetooth'),
  p('Gridtone Performance DJ Pad','mixers','Gridtone',349,4.6,154,'16 Pads Â· USB-C'),

  // HEADPHONES
  p('Aurion Studio Reference Headphones','headphones','Aurion',219,4.8,432,'Closed-Back Â· 40mm',{badge:'Top Rated'}),
  p('Silentwave ANC Wireless Headphones','headphones','Silentwave',179,4.5,650,'ANC Â· Bluetooth 5.3'),
  p('Driftline Open-Back Mixing Cans','headphones','Driftline',249,4.7,198,'Open-Back Â· 300ohm'),
  p('Cardinal DJ Fold-Flat Headphones','headphones','Cardinal',139,4.4,287,'Fold-Flat Â· Swivel',{originalPrice:159}),
  p('Solstice Broadcast Headset w/ Mic','headphones','Solstice',129,4.3,164,'Boom Mic Â· Single Ear',{newArrival:true}),
  p('Aurion Wireless Studio Headphones','headphones','Aurion',299,4.7,218,'Wireless Â· 40mm'),
  p('Silentwave Kids Hearing Protectors','headphones','Silentwave',39,4.4,506,'Passive Â· Adjustable'),
];

/* ============================================================
   STATE
   ============================================================ */
const state = {
  search: '',
  category: 'all',
  brands: new Set(),
  priceMin: null,
  priceMax: null,
  minRating: 0,
  sort: 'featured',
};
let cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '{}'); // id -> qty

/* ============================================================
   HELPERS
   ============================================================ */
const USD_TO_KES = 1;
const catName = id => (CATEGORIES.find(c=>c.id===id)||{}).name || id;

/* ============================================================
   INIT STATIC UI (category strip, tiles, filter category list, search select)
   ============================================================ */
function initStaticUI(){
  // category strip
  const strip = document.getElementById('catStrip');
  strip.innerHTML = `<button data-cat="all" class="active">All Categories</button>` +
    CATEGORIES.map(c=>`<button data-cat="${c.id}">${c.name}</button>`).join('');
  strip.addEventListener('click', e=>{
    const btn = e.target.closest('button[data-cat]');
    if(!btn) return;
    setCategory(btn.dataset.cat);
    document.getElementById('shop').scrollIntoView({behavior:'smooth'});
  });

  // search category select
  document.getElementById('searchCategorySelect').innerHTML =
    `<option value="all">All categories</option>` +
    CATEGORIES.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');

  // filter: category checkboxes
  renderCategoryFilter();

}

function renderCategoryFilter(){
  const wrap = document.getElementById('filterCategory');
  wrap.innerHTML = CATEGORIES.map(c=>{
    const count = PRODUCTS.filter(p=>p.category===c.id).length;
    return `<label class="check-row">
      <input type="radio" name="catFilter" value="${c.id}" ${state.category===c.id?'checked':''}>
      ${c.name} <span class="cnt">${count}</span>
    </label>`;
  }).join('') + `<label class="check-row">
      <input type="radio" name="catFilter" value="all" ${state.category==='all'?'checked':''}>
      All categories <span class="cnt">${PRODUCTS.length}</span>
    </label>`;
  wrap.querySelectorAll('input').forEach(inp=>{
    inp.addEventListener('change', ()=> setCategory(inp.value));
  });
}

function renderBrandFilter(){
  const wrap = document.getElementById('filterBrand');
  const pool = state.category==='all'
    ? [...new Set(PRODUCTS.map(p=>p.brand))].sort()
    : (BRANDS_BY_CAT[state.category]||[]).slice().sort();

  wrap.innerHTML = pool.map(b=>{
    const count = PRODUCTS.filter(p=> p.brand===b && (state.category==='all'||p.category===state.category)).length;
    const checked = state.brands.has(b) ? 'checked' : '';
    return `<label class="check-row">
      <input type="checkbox" value="${b}" ${checked}> ${b} <span class="cnt">${count}</span>
    </label>`;
  }).join('');

  wrap.querySelectorAll('input').forEach(inp=>{
    inp.addEventListener('change', ()=>{
      if(inp.checked) state.brands.add(inp.value); else state.brands.delete(inp.value);
      renderAll();
    });
  });
}

function renderRatingFilter(){
  const wrap = document.getElementById('filterRating');
  const options = [4,3,2];
  wrap.innerHTML = options.map(r=>`
    <div class="rating-row ${state.minRating===r?'active':''}" data-r="${r}">
      <span class="stars">${starsSVG(r)}</span> &amp; up
    </div>`).join('') + `<div class="rating-row ${state.minRating===0?'active':''}" data-r="0">Any rating</div>`;
  wrap.querySelectorAll('.rating-row').forEach(row=>{
    row.addEventListener('click', ()=>{
      state.minRating = Number(row.dataset.r);
      renderAll();
    });
  });
}

function setCategory(cat){
  state.category = cat;
  state.brands.clear(); // reset brand filter when switching category context
  renderAll();
}

/* ============================================================
   ACTIVE CHIPS
   ============================================================ */
function renderChips(){
  const chips = [];
  if(state.category!=='all') chips.push({label:catName(state.category), clear:()=>setCategory('all')});
  state.brands.forEach(b=> chips.push({label:b, clear:()=>{state.brands.delete(b); renderAll();}}));
  if(state.priceMin || state.priceMax) chips.push({label:`${fmt(state.priceMin||0)} &ndash; ${state.priceMax ? fmt(state.priceMax) : 'No limit'}`, clear:()=>{state.priceMin=null;state.priceMax=null;document.getElementById('priceMin').value='';document.getElementById('priceMax').value='';renderAll();}});
  if(state.minRating>0) chips.push({label:`${state.minRating}&#9733; & up`, clear:()=>{state.minRating=0;renderAll();}});
  if(state.search) chips.push({label:`"${state.search}"`, clear:()=>{state.search='';document.getElementById('searchInput').value='';renderAll();}});

  const wrap = document.getElementById('activeChips');
  wrap.innerHTML = chips.map((c,i)=>`<span class="chip" data-i="${i}">${c.label}<button aria-label="Remove filter">&times;</button></span>`).join('');
  wrap.querySelectorAll('.chip button').forEach((btn,i)=> btn.addEventListener('click', ()=> chips[i].clear()));
}

/* ============================================================
   FILTER + SORT + RENDER PRODUCTS
   ============================================================ */
function getFiltered(){
  let list = PRODUCTS.filter(p=>{
    if(state.category!=='all' && p.category!==state.category) return false;
    if(state.brands.size && !state.brands.has(p.brand)) return false;
    if(state.priceMin!=null && p.price < state.priceMin) return false;
    if(state.priceMax!=null && p.price > state.priceMax) return false;
    if(state.minRating>0 && p.rating < state.minRating) return false;
    if(state.search){
      const q = state.search.toLowerCase();
      if(!(p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || catName(p.category).toLowerCase().includes(q))) return false;
    }
    return true;
  });

  switch(state.sort){
    case 'price-asc': list.sort((a,b)=>a.price-b.price); break;
    case 'price-desc': list.sort((a,b)=>b.price-a.price); break;
    case 'rating': list.sort((a,b)=>b.rating-a.rating); break;
    case 'newest': list.sort((a,b)=>(b.newArrival===true)-(a.newArrival===true)); break;
    default: break;
  }
  return list;
}

function productCard(pr){
  const discount = pr.originalPrice ? Math.round(100*(1-pr.price/pr.originalPrice)) : null;
  const inCart = !!cart[pr.id];
  return `<article class="card" data-id="${pr.id}">
    <div class="card-media">
      ${pr.badge ? `<span class="card-badge ${pr.badge==='Best Seller'?'':''}">${pr.badge}</span>` : (pr.newArrival ? `<span class="card-badge sale">New</span>` : '')}
      ${discount ? `<span class="card-discount">-${discount}%</span>` : ''}
      ${productImage(pr.category, pr.name, pr.image)}
    </div>
    <div class="card-body">
      <div class="card-brand">${pr.brand}</div>
      <div class="card-title">${pr.name}</div>
      <div class="card-spec mono">${pr.spec}</div>
      <div class="card-rating"><span class="stars">${starsSVG(pr.rating,13)}</span> ${pr.rating} <span class="review-count" style="color:var(--text-faint)">(${pr.reviews})</span></div>
      <div class="card-price-row">
        <span class="card-price">${fmt(pr.price)}</span>
        ${pr.originalPrice ? `<span class="card-price-old">${fmt(pr.originalPrice)}</span>` : ''}
      </div>
      <span class="card-stock">In stock &middot; ships in 2&ndash;4 days</span>
      <div class="card-actions">
        <button class="add-btn ${inCart?'added':''}" data-id="${pr.id}">${inCart? 'Added &#10003;' : 'Add to Cart'}</button>
        <button class="quote-btn" title="Request bulk quote">Quote</button>
      </div>
    </div>
  </article>`;
}

function renderProducts(){
  const list = getFiltered();
  document.getElementById('resultsNum').textContent = list.length;
  const grid = document.getElementById('productGrid');
  if(!list.length){
    grid.innerHTML = `<div class="empty-state">
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <h3>No gear matches those filters</h3><p>Try clearing a filter or searching a different term.</p>
    </div>`;
    return;
  }
  grid.innerHTML = list.map(productCard).join('');
  grid.querySelectorAll('.add-btn').forEach(btn=>{
    btn.addEventListener('click', e=>{ e.stopPropagation(); addToCart(btn.dataset.id); });
  });
  grid.querySelectorAll('.quote-btn').forEach(btn=>{
    btn.addEventListener('click', e=> e.stopPropagation());
  });
  grid.querySelectorAll('.card').forEach(card=>{
    card.addEventListener('click', ()=>{ window.location.href = `product.html?id=${encodeURIComponent(card.dataset.id)}`; });
  });
}

function renderAll(){
  renderCategoryFilter();
  renderBrandFilter();
  renderRatingFilter();
  renderChips();
  renderProducts();
}

/* ============================================================
   CART
   ============================================================ */
function bumpCartBadge(){
  const badge = document.getElementById('cartCount');
  badge.classList.remove('bump');
  void badge.offsetWidth; // restart the animation even if it's already mid-bump
  badge.classList.add('bump');
}
function addToCart(id){
  cart[id] = (cart[id]||0) + 1;
  updateCartUI();
  bumpCartBadge();
  renderProducts();
  openCart();
}
function changeQty(id, delta){
  if(!cart[id]) return;
  cart[id] += delta;
  if(cart[id] <= 0) delete cart[id];
  updateCartUI();
  if(delta > 0) bumpCartBadge();
  renderProducts();
}
function removeFromCart(id){
  delete cart[id];
  updateCartUI();
  renderProducts();
}
function updateCartUI(){
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  const ids = Object.keys(cart);
  const totalQty = ids.reduce((s,id)=>s+cart[id],0);
  document.getElementById('cartCount').textContent = totalQty;

  const itemsWrap = document.getElementById('cartItems');
  if(!ids.length){
    itemsWrap.innerHTML = `<div class="cart-empty">
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
      <p>Your cart is empty.<br>Browse the catalog to add gear.</p>
    </div>`;
    document.getElementById('cartSubtotal').textContent = fmt(0);
    return;
  }
  let subtotal = 0;
  itemsWrap.innerHTML = ids.map(id=>{
    const pr = PRODUCTS.find(x=>x.id===id);
    const qty = cart[id];
    subtotal += pr.price*qty;
    return `<div class="cart-item">
      <div class="cart-item-media">${productImage(pr.category, pr.name, pr.image)}</div>
      <div class="cart-item-info">
        <span class="ti">${pr.name}</span>
        <span class="tb">${pr.brand}</span>
        <div class="qty-row">
          <button class="qty-btn" data-act="dec" data-id="${id}">&minus;</button>
          <span class="qty-num">${qty}</span>
          <button class="qty-btn" data-act="inc" data-id="${id}">+</button>
          <span class="remove-btn" data-act="rm" data-id="${id}" style="margin-left:auto;cursor:pointer;">Remove</span>
        </div>
      </div>
      <div class="cart-item-price">${fmt(pr.price*qty)}</div>
    </div>`;
  }).join('');
  document.getElementById('cartSubtotal').textContent = fmt(subtotal);

  itemsWrap.querySelectorAll('[data-act]').forEach(el=>{
    el.addEventListener('click', ()=>{
      const id = el.dataset.id;
      if(el.dataset.act==='inc') changeQty(id,1);
      if(el.dataset.act==='dec') changeQty(id,-1);
      if(el.dataset.act==='rm') removeFromCart(id);
    });
  });
}

function openCart(){
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('overlay').classList.add('open');
  document.body.classList.add('cart-open');
}
function closeCart(){
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
  document.body.classList.remove('cart-open');
}

/* ============================================================
   EVENT WIRING
   ============================================================ */
document.getElementById('cartOpenBtn').addEventListener('click', openCart);
document.getElementById('cartCloseBtn').addEventListener('click', closeCart);
document.getElementById('overlay').addEventListener('click', ()=>{ closeCart(); closeMobileFilters(); });
document.querySelector('.checkout-btn').addEventListener('click', ()=>{
  if(Object.keys(cart).length) window.location.href = 'checkout.html';
});

document.getElementById('searchBtn').addEventListener('click', doSearch);
document.getElementById('searchInput').addEventListener('keydown', e=>{ if(e.key==='Enter') doSearch(); });
function doSearch(){
  state.search = document.getElementById('searchInput').value.trim();
  const catSel = document.getElementById('searchCategorySelect').value;
  if(catSel !== 'all') state.category = catSel;
  renderAll();
  document.getElementById('shop').scrollIntoView({behavior:'smooth'});
}

document.getElementById('sortSelect').addEventListener('change', e=>{ state.sort = e.target.value; renderProducts(); });

document.getElementById('priceMin').addEventListener('change', e=>{ state.priceMin = e.target.value ? Number(e.target.value) / USD_TO_KES : null; renderAll(); });
document.getElementById('priceMax').addEventListener('change', e=>{ state.priceMax = e.target.value ? Number(e.target.value) / USD_TO_KES : null; renderAll(); });

document.getElementById('clearFiltersBtn').addEventListener('click', ()=>{
  state.category='all'; state.brands.clear(); state.priceMin=null; state.priceMax=null; state.minRating=0; state.search='';
  document.getElementById('priceMin').value=''; document.getElementById('priceMax').value=''; document.getElementById('searchInput').value='';
  renderAll();
});

// mobile filter drawer
const filtersPanel = document.getElementById('filtersPanel');
document.getElementById('mobileFilterBtn').addEventListener('click', ()=>{
  filtersPanel.classList.add('open');
  document.getElementById('overlay').classList.add('open');
});
function closeMobileFilters(){ filtersPanel.classList.remove('open'); }

/* "All" menu quick action */
document.getElementById('allMenuBtn').addEventListener('click', ()=>{
  document.getElementById('shop').scrollIntoView({behavior:'smooth'});
});

/* ============================================================
   BOOT
   ============================================================ */
async function bootStorefront(){
  renderSkeletonGrid();
  try {
    await loadStorefrontCatalog();
  } catch(error) {
    console.error(error);
  }
  initStaticUI();
  renderAll();
  updateCartUI();
}

bootStorefront();
