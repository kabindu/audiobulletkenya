/* ============================================================
   CHECKOUT PAGE — order summary + M-Pesa STK Push payment
   ============================================================ */
const CART_STORAGE_KEY = 'audiobullet_cart';
const fmt = n => 'KSh ' + Math.round(Number(n || 0)).toLocaleString('en-KE');

let cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '{}');
let products = [];
let currentSubtotal = 0;
let paymentMethod = 'mpesa';

function productImage(product){
  return product.image
    ? `<img src="${product.image}" alt="${product.name}" loading="lazy">`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/></svg>`;
}

function renderItems(){
  const wrap = document.getElementById('checkoutItems');
  const ids = Object.keys(cart);
  if(!ids.length){
    wrap.innerHTML = `<div class="cart-empty">Your cart is empty.</div>`;
    return 0;
  }
  let subtotal = 0;
  wrap.innerHTML = ids.map(id=>{
    const product = products.find(p=>String(p.id)===String(id));
    if(!product) return '';
    const qty = cart[id];
    subtotal += product.price * qty;
    return `<div class="checkout-item-row">
      <div class="checkout-item-media">${productImage(product)}</div>
      <div class="checkout-item-info">
        <span class="ti">${product.name}</span>
        <span class="tb">${product.brand} &middot; Qty ${qty}</span>
      </div>
      <div class="checkout-item-price">${fmt(product.price * qty)}</div>
    </div>`;
  }).join('');
  return subtotal;
}

function updateSummary(){
  const subtotal = renderItems();
  currentSubtotal = subtotal;
  document.getElementById('sumSubtotal').textContent = fmt(subtotal);
  document.getElementById('sumTotal').textContent = fmt(subtotal);
  document.getElementById('cardSubmitAmount').textContent = fmt(subtotal);
  document.getElementById('mpesaSubmitAmount').textContent = fmt(subtotal);
  return subtotal;
}

function setStatus(message, type){
  const el = document.getElementById('payStatus');
  el.hidden = !message;
  el.textContent = message;
  el.className = `pay-status ${type || 'info'}`;
}

function markFieldError(id, hasError){
  document.getElementById(id).closest('.field').classList.toggle('field-error', hasError);
}

function setModalStatus(modalId, message, type){
  const el = document.getElementById(modalId);
  el.hidden = !message;
  el.textContent = message;
  el.className = `pay-status ${type || 'info'}`;
}

function openModal(overlayId){
  document.getElementById(overlayId).hidden = false;
}
function closeModal(overlayId){
  document.getElementById(overlayId).hidden = true;
}

function luhnCheck(digits){
  let sum = 0, alternate = false;
  for(let i = digits.length - 1; i >= 0; i -= 1){
    let digit = Number(digits[i]);
    if(alternate){ digit *= 2; if(digit > 9) digit -= 9; }
    sum += digit;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

function validateCardForm(){
  const number = document.getElementById('cardNumber').value.replace(/\s+/g,'');
  const name = document.getElementById('cardName').value.trim();
  const expiry = document.getElementById('cardExpiry').value.trim();
  const cvv = document.getElementById('cardCvv').value.trim();
  const expiryMatch = /^(\d{2})\/(\d{2})$/.exec(expiry);
  const numberValid = /^\d{12,19}$/.test(number) && luhnCheck(number);
  let expiryValid = !!expiryMatch;
  if(expiryMatch){
    const month = Number(expiryMatch[1]);
    const expiryDate = new Date(2000 + Number(expiryMatch[2]), month);
    expiryValid = month >= 1 && month <= 12 && expiryDate >= new Date();
  }
  const cvvValid = /^\d{3,4}$/.test(cvv);
  markFieldError('cardNumber', !numberValid);
  markFieldError('cardName', !name);
  markFieldError('cardExpiry', !expiryValid);
  markFieldError('cardCvv', !cvvValid);
  return numberValid && name && expiryValid && cvvValid;
}

async function handleCardSubmit(event){
  event.preventDefault();
  if(!validateCardForm()){
    setModalStatus('cardModalStatus', 'Please check your card details.', 'error');
    return;
  }
  const submitBtn = document.getElementById('cardSubmitBtn');
  submitBtn.disabled = true;
  setModalStatus('cardModalStatus', 'Processing your payment...', 'info');

  const customer = {
    name: document.getElementById('custName').value.trim(),
    phone: document.getElementById('custPhone').value.trim(),
    email: document.getElementById('custEmail').value.trim(),
    address: document.getElementById('custAddress').value.trim(),
  };
  const items = Object.entries(cart).map(([id, qty]) => ({ productId: Number(id), qty }));
  const card = {
    number: document.getElementById('cardNumber').value.replace(/\s+/g,''),
    name: document.getElementById('cardName').value.trim(),
    expiry: document.getElementById('cardExpiry').value.trim(),
    cvv: document.getElementById('cardCvv').value.trim(),
  };

  try {
    const response = await fetch('/api/card/charge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer, items, card }),
    });
    const data = await response.json();
    if(!response.ok) throw new Error(data.error || 'Could not process the card payment.');
    setModalStatus('cardModalStatus', 'Payment successful. Redirecting...', 'success');
    localStorage.removeItem(CART_STORAGE_KEY);
    setTimeout(()=> window.location.href = 'home.html', 2000);
  } catch(error){
    setModalStatus('cardModalStatus', error.message, 'error');
    submitBtn.disabled = false;
  }
}

function setPaymentMethod(method){
  paymentMethod = method;
  document.querySelectorAll('.pay-method-tab').forEach(tab=> tab.classList.toggle('active', tab.dataset.method === method));
  const label = document.getElementById('payBtnLabel');
  const hint = document.getElementById('payHint');
  if(method === 'card'){
    label.textContent = 'Pay with Card';
    hint.textContent = 'A secure popup will ask for your card details to complete this payment.';
  } else {
    label.textContent = 'Pay with M-Pesa';
    hint.textContent = 'You will receive an M-Pesa prompt (STK Push) on your phone to enter your PIN and complete payment.';
  }
}

function validateForm(){
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  const phoneValid = /^(0|\+?254)7\d{8}$|^(0|\+?254)1\d{8}$/.test(phone.replace(/[\s-]+/g,''));
  markFieldError('custName', !name);
  markFieldError('custPhone', !phoneValid);
  markFieldError('custAddress', !address);
  return name && phoneValid && address;
}

async function pollPaymentStatus(checkoutRequestId){
  for(let attempt = 0; attempt < 20; attempt += 1){
    await new Promise(resolve => setTimeout(resolve, 3000));
    try {
      const response = await fetch(`/api/mpesa/status/${checkoutRequestId}`);
      if(!response.ok) continue;
      const data = await response.json();
      if(data.status === 'paid'){
        setModalStatus('mpesaModalStatus', `Payment received${data.mpesaReceipt ? ' · Receipt: ' + data.mpesaReceipt : ''}. Redirecting...`, 'success');
        localStorage.removeItem(CART_STORAGE_KEY);
        setTimeout(()=> window.location.href = 'home.html', 2500);
        return;
      }
      if(data.status === 'failed'){
        setModalStatus('mpesaModalStatus', data.message || 'Payment was not completed. Please try again.', 'error');
        document.getElementById('mpesaSubmitBtn').disabled = false;
        return;
      }
    } catch(error){ /* keep polling */ }
  }
  setModalStatus('mpesaModalStatus', 'Still waiting for confirmation. If you completed the M-Pesa prompt, this page will update shortly.', 'info');
  document.getElementById('mpesaSubmitBtn').disabled = false;
}

async function handleMpesaSubmit(event){
  event.preventDefault();
  const phone = document.getElementById('mpesaPhone').value.trim();
  const phoneValid = /^(0|\+?254)7\d{8}$|^(0|\+?254)1\d{8}$/.test(phone.replace(/[\s-]+/g,''));
  markFieldError('mpesaPhone', !phoneValid);
  if(!phoneValid){
    setModalStatus('mpesaModalStatus', 'Enter a valid M-Pesa phone number.', 'error');
    return;
  }
  const submitBtn = document.getElementById('mpesaSubmitBtn');
  submitBtn.disabled = true;
  setModalStatus('mpesaModalStatus', 'Sending payment request to your phone...', 'info');

  const customer = {
    name: document.getElementById('custName').value.trim(),
    phone,
    email: document.getElementById('custEmail').value.trim(),
    address: document.getElementById('custAddress').value.trim(),
  };
  const items = Object.entries(cart).map(([id, qty]) => ({ productId: Number(id), qty }));

  try {
    const response = await fetch('/api/mpesa/stkpush', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer, items }),
    });
    const data = await response.json();
    if(!response.ok) throw new Error(data.error || 'Could not start the M-Pesa payment.');
    setModalStatus('mpesaModalStatus', 'Check your phone and enter your M-Pesa PIN to complete payment.', 'info');
    pollPaymentStatus(data.checkoutRequestId);
  } catch(error){
    setModalStatus('mpesaModalStatus', error.message, 'error');
    submitBtn.disabled = false;
  }
}

async function handlePay(){
  if(!Object.keys(cart).length) return;
  if(!validateForm()){
    setStatus('Please fill in all required fields correctly.', 'error');
    const firstInvalid = document.querySelector('.field-error input, .field-error textarea');
    if(firstInvalid){ firstInvalid.scrollIntoView({ behavior:'smooth', block:'center' }); firstInvalid.focus(); }
    return;
  }
  setStatus('');
  if(paymentMethod === 'card'){
    openModal('cardModalOverlay');
    setModalStatus('cardModalStatus', '');
    return;
  }
  document.getElementById('mpesaPhone').value = document.getElementById('custPhone').value.trim();
  openModal('mpesaModalOverlay');
  setModalStatus('mpesaModalStatus', '');
}

async function boot(){
  if(!Object.keys(cart).length){
    window.location.href = 'home.html';
    return;
  }
  try {
    const response = await fetch('/api/catalog');
    const catalog = await response.json();
    products = catalog.products.map(product => ({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: Number(product.price),
      image: product.image,
    }));
  } catch(error){
    console.error(error);
  }
  updateSummary();
  document.getElementById('payBtn').addEventListener('click', handlePay);
  document.querySelectorAll('.pay-method-tab').forEach(tab=>{
    tab.addEventListener('click', ()=> setPaymentMethod(tab.dataset.method));
  });
  document.getElementById('cardModalClose').addEventListener('click', ()=> closeModal('cardModalOverlay'));
  document.getElementById('cardModalOverlay').addEventListener('click', e=>{ if(e.target.id === 'cardModalOverlay') closeModal('cardModalOverlay'); });
  document.getElementById('cardForm').addEventListener('submit', handleCardSubmit);
  document.getElementById('cardExpiry').addEventListener('input', e=>{
    let v = e.target.value.replace(/\D/g,'').slice(0,4);
    if(v.length > 2) v = `${v.slice(0,2)}/${v.slice(2)}`;
    e.target.value = v;
  });
  document.getElementById('cardNumber').addEventListener('input', e=>{
    e.target.value = e.target.value.replace(/\D/g,'').slice(0,19).replace(/(\d{4})(?=\d)/g,'$1 ');
  });
  document.getElementById('mpesaModalClose').addEventListener('click', ()=> closeModal('mpesaModalOverlay'));
  document.getElementById('mpesaModalOverlay').addEventListener('click', e=>{ if(e.target.id === 'mpesaModalOverlay') closeModal('mpesaModalOverlay'); });
  document.getElementById('mpesaForm').addEventListener('submit', handleMpesaSubmit);
}

boot();
