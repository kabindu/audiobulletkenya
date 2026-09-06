/* ============================================================
  SHARED CATALOG HELPERS — used by the storefront (app.js) and the
  product detail page (product.js). Kept in one place so icons,
  fallback image pools, and formatting stay consistent everywhere.
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

/* Up to 3 images for a product: real uploaded images first (image, image2,
   image3 from the DB), padded out with the category's fallback pool so the
   gallery still has something to show for demo/legacy single-image products. */
function imagesForProduct(product){
  const real = [product.image, product.image2, product.image3].filter(Boolean);
  if(real.length) return real.slice(0, 3);
  const pool = PRODUCT_IMAGE_POOLS[product.category] || [PRODUCT_IMAGES.speakers];
  return pool.slice(0, 3);
}

function storefrontCategoryId(name){
  const normalized = name.toLowerCase();
  if(normalized.includes('guitar')) return 'guitars';
  if(normalized.includes('drum')) return 'drums';
  if(normalized.includes('mixer') || normalized.includes('dj')) return 'mixers';
  return normalized.replace(/[^a-z0-9]+/g, '');
}

const fmt = n => 'KSh ' + Math.round(Number(n || 0)).toLocaleString('en-KE');

function starsSVG(rating, size=14){
  let out = '';
  for(let i=1;i<=5;i++){
    const fill = rating >= i ? 'currentColor' : (rating >= i-0.5 ? 'url(#half)' : 'none');
    out += `<svg width="${size}" height="${size}" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="${fill}"><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9"/></svg>`;
  }
  return out;
}

function productImage(category, alt, src = PRODUCT_IMAGES[category]){
  const imageSource = src || imageForProduct(category, alt);
  const icon = ICONS[category] || ICONS.speakers;
  return `<img src="${imageSource}" alt="${alt}" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false;"><span class="image-fallback" hidden>${icon}</span>`;
}

const CART_STORAGE_KEY = 'audiobullet_cart';
