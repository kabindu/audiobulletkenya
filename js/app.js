/* ============================================================
  ICONS - abstract line-art per category (original, not brand marks)
   ============================================================ */
const ICONS = {
  speakers: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="16" y="4" width="32" height="56" rx="6"/><circle cx="32" cy="20" r="7"/><circle cx="32" cy="20" r="2.5" fill="currentColor"/><circle cx="32" cy="42" r="11"/><circle cx="32" cy="42" r="3.5" fill="currentColor"/></svg>`,
  keyboards: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="4" y="18" width="56" height="30" rx="3"/><line x1="4" y1="18" x2="4" y2="48"/><rect x="10" y="18" width="6" height="18" fill="currentColor" stroke="none"/><rect x="22" y="18" width="6" height="18" fill="currentColor" stroke="none"/><rect x="36" y="18" width="6" height="18" fill="currentColor" stroke="none"/><rect x="48" y="18" width="6" height="18" fill="currentColor" stroke="none"/></svg>`,
  microphones: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="24" y="6" width="16" height="28" rx="8"/><path d="M16 28a16 16 0 0 0 32 0"/><line x1="32" y1="44" x2="32" y2="56"/><line x1="20" y1="58" x2="44" y2="58"/></svg>`,
  saxophones: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 6l6 6v20a12 12 0 1 0 12 12c0-6-4-9-9-11l-9-4V12"/><circle cx="24" cy="8" r="3"/><circle cx="24" cy="26" r="1.6" fill="currentColor"/><circle cx="30" cy="30" r="1.6" fill="currentColor"/></svg>`,
  guitars: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2"><ellipse cx="24" cy="44" rx="14" ry="12"/><ellipse cx="24" cy="44" rx="5" ry="4.3"/><path d="M30 34l14-26"/><line x1="41" y1="10" x2="46" y2="4"/><line x1="35" y1="20" x2="38" y2="21.5"/></svg>`,
  drums: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2"><ellipse cx="32" cy="16" rx="22" ry="8"/><path d="M10 16v24c0 4.4 9.85 8 22 8s22-3.6 22-8V16"/><ellipse cx="32" cy="40" rx="22" ry="8"/></svg>`,
  mixers: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="6" y="8" width="52" height="48" rx="4"/><line x1="18" y1="16" x2="18" y2="48"/><circle cx="18" cy="34" r="4" fill="currentColor" stroke="none"/><line x1="32" y1="16" x2="32" y2="48"/><circle cx="32" cy="24" r="4" fill="currentColor" stroke="none"/><line x1="46" y1="16" x2="46" y2="48"/><circle cx="46" cy="40" r="4" fill="currentColor" stroke="none"/></svg>`,
  headphones: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M8 40V32a24 24 0 0 1 48 0v8"/><rect x="4" y="36" width="12" height="18" rx="4"/><rect x="48" y="36" width="12" height="18" rx="4"/></svg>`,
};

const PRODUCT_IMAGES = {
  speakers: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
  keyboards: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=800&q=80',
  microphones: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80',
  saxophones: 'https://images.unsplash.com/photo-1573871669414-010dbf73ca84?auto=format&fit=crop&w=800&q=80',
  guitars: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=800&q=80',
  drums: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=800&q=80',
  mixers: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80',
  headphones: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
};

const PRODUCT_IMAGE_POOLS = {
  speakers: [
    PRODUCT_IMAGES.speakers,
    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=75',
  ],
  keyboards: [
    PRODUCT_IMAGES.keyboards,
    'https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1552422535-c45813c61732?auto=format&fit=crop&w=800&q=80',
  ],
  microphones: [
    PRODUCT_IMAGES.microphones,
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
  ],
  saxophones: [
    PRODUCT_IMAGES.saxophones,
    'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=800&q=80',
  ],
  guitars: [
    PRODUCT_IMAGES.guitars,
    'https://images.unsplash.com/photo-1556449895-a33c9dba33dd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?auto=format&fit=crop&w=800&q=80',
  ],
  drums: [
    PRODUCT_IMAGES.drums,
    'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=800&q=75',
  ],
  mixers: [
    PRODUCT_IMAGES.mixers,
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=75',
    'https://images.unsplash.com/photo-1619983081563-430f63602796?auto=format&fit=crop&w=800&q=80',
  ],
  headphones: [
    PRODUCT_IMAGES.headphones,
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
  ],
};

function imageForProduct(category, name){
  const pool = PRODUCT_IMAGE_POOLS[category] || [PRODUCT_IMAGES.speakers];
  const hash = [...name].reduce((total, character) => total + character.charCodeAt(0), 0);
  return pool[hash % pool.length];
}

function storefrontCategoryId(name){
  const normalized = name.toLowerCase();
  if(normalized.includes('guitar')) return 'guitars';
  if(normalized.includes('drum')) return 'drums';
  if(normalized.includes('mixer') || normalized.includes('dj')) return 'mixers';
  return normalized.replace(/[^a-z0-9]+/g, '');
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
      categoryId: product.category_id,
      brandId: product.brand_id,
    };
  });
}

function productImage(category, alt, src = PRODUCT_IMAGES[category]){
  const imageSource = src || imageForProduct(category, alt);
  const icon = ICONS[category] || ICONS.speakers;
  return `<img src="${imageSource}" alt="${alt}" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false;"><span class="image-fallback" hidden>${icon}</span>`;
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
let cart = {}; // id -> qty

/* ============================================================
   HELPERS
   ============================================================ */
const USD_TO_KES = 1;
const fmt = n => 'KSh ' + Math.round(Number(n || 0)).toLocaleString('en-KE');
const catName = id => (CATEGORIES.find(c=>c.id===id)||{}).name || id;

function starsSVG(rating, size=14){
  let out = '';
  for(let i=1;i<=5;i++){
    const fill = rating >= i ? 'currentColor' : (rating >= i-0.5 ? 'url(#half)' : 'none');
    out += `<svg width="${size}" height="${size}" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="${fill}"><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9"/></svg>`;
  }
  return out;
}

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

  // category tiles
  document.getElementById('catGrid').innerHTML = CATEGORIES.map(c=>{
    const count = PRODUCTS.filter(p=>p.category===c.id).length;
    return `<div class="cat-tile" data-cat="${c.id}">
      <div class="icon-wrap">${productImage(c.id, c.name)}</div>
      <div><h4>${c.name}</h4><span>${c.desc} &middot; ${count} listings</span></div>
    </div>`;
  }).join('');
  document.getElementById('catGrid').addEventListener('click', e=>{
    const tile = e.target.closest('.cat-tile');
    if(!tile) return;
    setCategory(tile.dataset.cat);
    document.getElementById('shop').scrollIntoView({behavior:'smooth'});
  });

  document.getElementById('catalogEntry').addEventListener('click', e=>{
    if(e.target.closest('.cat-tile')) return;
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
  return `<article class="card">
    <div class="card-media">
      ${pr.badge ? `<span class="card-badge ${pr.badge==='Best Seller'?'':''}">${pr.badge}</span>` : (pr.newArrival ? `<span class="card-badge sale">New</span>` : '')}
      ${discount ? `<span class="card-discount">-${discount}%</span>` : ''}
      ${productImage(pr.category, pr.name, pr.image)}
    </div>
    <div class="card-body">
      <div class="card-brand">${pr.brand}</div>
      <div class="card-title">${pr.name}</div>
      <div class="card-spec mono">${pr.spec}</div>
      <div class="card-rating"><span class="stars">${starsSVG(pr.rating,13)}</span> ${pr.rating} <span style="color:var(--text-faint)">(${pr.reviews})</span></div>
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
    grid.innerHTML = `<div class="empty-state"><h3>No gear matches those filters</h3><p>Try clearing a filter or searching a different term.</p></div>`;
    return;
  }
  grid.innerHTML = list.map(productCard).join('');
  grid.querySelectorAll('.add-btn').forEach(btn=>{
    btn.addEventListener('click', ()=> addToCart(btn.dataset.id));
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
function addToCart(id){
  cart[id] = (cart[id]||0) + 1;
  updateCartUI();
  renderProducts();
  openCart();
}
function changeQty(id, delta){
  if(!cart[id]) return;
  cart[id] += delta;
  if(cart[id] <= 0) delete cart[id];
  updateCartUI();
  renderProducts();
}
function removeFromCart(id){
  delete cart[id];
  updateCartUI();
  renderProducts();
}
function updateCartUI(){
  const ids = Object.keys(cart);
  const totalQty = ids.reduce((s,id)=>s+cart[id],0);
  document.getElementById('cartCount').textContent = totalQty;

  const itemsWrap = document.getElementById('cartItems');
  if(!ids.length){
    itemsWrap.innerHTML = `<div class="cart-empty">Your cart is empty.<br>Browse the catalog to add gear.</div>`;
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

/* "All" menu + Today's Deals quick actions */
document.getElementById('allMenuBtn').addEventListener('click', ()=>{
  document.getElementById('catGrid').scrollIntoView({behavior:'smooth'});
});
document.getElementById('dealsLink').addEventListener('click', ()=>{
  state.category='all'; state.brands.clear(); state.sort='price-asc';
  document.getElementById('sortSelect').value='price-asc';
  renderAll();
  document.getElementById('shop').scrollIntoView({behavior:'smooth'});
});

/* ============================================================
   BOOT
   ============================================================ */
async function bootStorefront(){
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
