/* =====================================================================
   ROHILLA — main behaviour file
   Organised in the same top-to-bottom order as the page. You should
   rarely need to edit this file: prices, products and recipes live in
   data.js; colours and spacing live in styles.css.
   ===================================================================== */

/* ----------------------- Small DOM helpers ------------------------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const icons = () => { if (window.lucide) lucide.createIcons(); };


/* Page scroll lock used by the cart, checkout and recipe pop-ups */
const ScrollLock = {
  lock()   { document.body.style.overflow = 'hidden'; },
  unlock() {
    const anyOpen = !$('#cart-drawer').hidden || !$('#checkout-modal').hidden ||
                    !$('#order-confirm-modal').hidden || !$('#recipe-modal').hidden;
    if (!anyOpen) document.body.style.overflow = '';
  }
};


/* =====================================================================
   BRANDING — trust chips, footer contacts, links from CONFIG
   ===================================================================== */
const Branding = {
  init() {
    const cfg = window.CONFIG;
    if (!cfg) return;
    const whatsappUrl = 'https://wa.me/' + cfg.whatsappNumber;

    // Hero trust chips
    const chips = $('#hero-stats');
    if (chips && cfg.trustIndicators) {
      chips.innerHTML = cfg.trustIndicators
        .map(t => `<li class="trust-chip"><strong>${t.value}</strong> ${t.label}</li>`)
        .join('');
    }

    // Footer contacts
    const fc = $('#footer-contacts');
    if (fc) {
      fc.innerHTML = `
        <div><i data-lucide="map-pin"></i><span>${cfg.contactAddress}</span></div>
        <div><i data-lucide="phone"></i><a href="tel:${cfg.contactPhone.replace(/\s/g, '')}">${cfg.contactPhone}</a></div>
        <div><i data-lucide="mail"></i><a href="mailto:${cfg.contactEmail}">${cfg.contactEmail}</a></div>
      `;
    }

    // Links that live in several places
    $$('[data-email-link]').forEach(a => { a.href = 'mailto:' + cfg.contactEmail; });
    $$('[data-whatsapp-link]').forEach(a => { a.href = whatsappUrl; });
    $$('[data-instagram-link]').forEach(a => {
      if (cfg.instagramUrl) a.href = cfg.instagramUrl;
      else (a.closest('li') || a).remove();
    });
    $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
    $$('[data-free-ship]').forEach(el => { el.textContent = window.formatPrice(cfg.freeShippingThreshold); });
    $$('[data-phone-text]').forEach(el => { el.textContent = cfg.contactPhone; });

    // FSSAI + GSTIN in the footer — hidden until real numbers are set
    Branding.fillOrHide('#footer-fssai', '[data-fssai-row]', cfg.fssaiLicense);
    Branding.fillOrHide('#footer-gstin', '[data-gstin-row]', cfg.gstin);
  },

  isPlaceholder(value) {
    return !value || /^X+$/i.test(value);
  },

  fillOrHide(valueSel, rowSel, value) {
    const el = $(valueSel);
    if (!el) return;
    if (Branding.isPlaceholder(value)) $$(rowSel).forEach(r => r.setAttribute('hidden', ''));
    else el.textContent = value;
  }
};


/* =====================================================================
   NAV LINKS — edit here to change menu items
   ===================================================================== */
const NAV_LINKS = [
  { label: 'Shop',         href: '#collection' },
  { label: 'Chef Combo',   href: '#chef-combo' },
  { label: 'How to Order', href: '#how-to-order' },
  { label: 'Recipes',      href: '#recipes' },
];


/* =====================================================================
   CART — single source of truth
   ===================================================================== */
const Cart = {
  items: [],                  // { product, quantity }[]
  isOpen: false,
  upsellProduct: null,

  load() {
    try {
      const raw = localStorage.getItem('rohilla-cart');
      const saved = raw ? (JSON.parse(raw).items || []) : [];
      // Re-read every product from PRODUCTS so a saved cart always uses today's
      // prices, and silently drop products that are no longer sold.
      this.items = saved
        .map(i => ({ product: window.getProductById(i.product && i.product.id), quantity: i.quantity }))
        .filter(i => i.product && i.quantity > 0);
    } catch (e) { this.items = []; }
  },
  save() {
    try { localStorage.setItem('rohilla-cart', JSON.stringify({ items: this.items })); }
    catch (e) { /* ignore quota errors */ }
  },

  qty(productId) {
    const item = this.items.find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  },

  totals() {
    const totalItems = this.items.reduce((s, i) => s + i.quantity, 0);
    const subtotal   = this.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const mb = window.CONFIG.multiBuy || { minItems: 0, percent: 0 };
    const discount   = (mb.percent > 0 && totalItems >= mb.minItems) ? Math.round(subtotal * mb.percent / 100) : 0;
    return { totalItems, subtotal, discount, total: subtotal - discount };
  },

  // Adding never pops the drawer open (annoying on phones) — a toast confirms it instead.
  add(product) {
    const existing = this.items.find(i => i.product.id === product.id);
    if (existing) existing.quantity += 1;
    else this.items.push({ product, quantity: 1 });
    this.upsellProduct = window.getUpsellProduct(product.id);
    if (this.upsellProduct && this.qty(this.upsellProduct.id) > 0) this.upsellProduct = null;
    this.save(); CartUI.render();
    Toast.show(`Added ${product.name} (${window.sizeLabel(product)})`);
  },
  remove(productId) {
    this.items = this.items.filter(i => i.product.id !== productId);
    this.upsellProduct = null;
    this.save(); CartUI.render();
  },
  updateQuantity(productId, qty) {
    if (qty <= 0) return this.remove(productId);
    const item = this.items.find(i => i.product.id === productId);
    if (item) item.quantity = qty;
    this.save(); CartUI.render();
  },
  clear() {
    this.items = [];
    this.upsellProduct = null;
    this.save(); CartUI.render();
  },
  open()  { this.isOpen = true;  $('#toast').hidden = true; CartUI.render(); },
  close() { this.isOpen = false; CartUI.render(); },
  dismissUpsell() { this.upsellProduct = null; CartUI.render(); }
};


/* =====================================================================
   ADD / STEPPER — the "Add" button that turns into  −  1  +
   Used by product cards and the Chef Special Combo section.
   ===================================================================== */
const Buy = {
  html(productId, addLabel = 'Add') {
    const q = Cart.qty(productId);
    if (q === 0) {
      return `<button type="button" class="buy-add" data-buy-add="${productId}">
                <i data-lucide="plus"></i><span>${addLabel}</span>
              </button>`;
    }
    return `<div class="buy-stepper" role="group" aria-label="Quantity in cart">
              <button type="button" data-buy-dec="${productId}" aria-label="Remove one"><i data-lucide="minus"></i></button>
              <span aria-live="polite">${q} in cart</span>
              <button type="button" data-buy-inc="${productId}" aria-label="Add one more"><i data-lucide="plus"></i></button>
            </div>`;
  },

  // One click handler for the whole page
  init() {
    document.addEventListener('click', (e) => {
      const add = e.target.closest('[data-buy-add]');
      const inc = e.target.closest('[data-buy-inc]');
      const dec = e.target.closest('[data-buy-dec]');
      if (add) Cart.add(window.getProductById(add.dataset.buyAdd));
      else if (inc) Cart.updateQuantity(inc.dataset.buyInc, Cart.qty(inc.dataset.buyInc) + 1);
      else if (dec) Cart.updateQuantity(dec.dataset.buyDec, Cart.qty(dec.dataset.buyDec) - 1);
    });
  },

  // Refresh every Add/stepper area on the page (called after each cart change)
  refresh() {
    $$('[data-buy-for]').forEach(el => {
      el.innerHTML = Buy.html(el.dataset.buyFor, el.dataset.buyLabel || 'Add');
    });
  }
};


/* =====================================================================
   NAVIGATION + mobile menu
   ===================================================================== */
const Nav = {
  init() {
    const desktop = $('#nav-links');
    const mobile  = $('#mobile-nav-links');
    NAV_LINKS.forEach((link, i) => {
      const a = document.createElement('a');
      a.className = 'nav-link';
      a.href = link.href;
      a.textContent = link.label;
      desktop.appendChild(a);

      const m = document.createElement('a');
      m.href = link.href;
      m.textContent = link.label;
      m.style.animationDelay = (0.05 + i * 0.05) + 's';
      m.addEventListener('click', () => Nav.closeMobile());
      mobile.appendChild(m);
    });

    // Solid header once the page scrolls
    const header = $('#site-header');
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    $('#mobile-menu-toggle').addEventListener('click', () => {
      if ($('#mobile-menu').hidden) Nav.openMobile(); else Nav.closeMobile();
    });
    $('#cart-button').addEventListener('click', () => Cart.open());
  },

  openMobile() {
    $('#mobile-menu').hidden = false;
    $('#menu-open-icon').setAttribute('hidden', '');
    $('#menu-close-icon').removeAttribute('hidden');
    $('#mobile-menu-toggle').setAttribute('aria-expanded', 'true');
  },
  closeMobile() {
    $('#mobile-menu').hidden = true;
    $('#menu-open-icon').removeAttribute('hidden');
    $('#menu-close-icon').setAttribute('hidden', '');
    $('#mobile-menu-toggle').setAttribute('aria-expanded', 'false');
  }
};


/* =====================================================================
   HERO — soft gold spotlight that follows the mouse (desktop only)
   ===================================================================== */
const Hero = {
  init() {
    const el = $('#hero-spotlight');
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let last = 0;
    window.addEventListener('mousemove', (e) => {
      const now = performance.now();
      if (now - last < 32) return;
      last = now;
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      el.style.transform = `translateX(calc(-50% + ${nx * 80}px)) translateY(${ny * 40}px)`;
    }, { passive: true });
  }
};


/* =====================================================================
   CHEF SPECIAL COMBO — spotlight section built from data.js (prod_008)
   ===================================================================== */
const ComboSpot = {
  init() {
    const box = $('#combo-spot');
    if (!box) return;
    const p = window.getProductById(box.dataset.product);
    if (!p) { $('#chef-combo').remove(); return; }

    const save = p.originalPrice ? p.originalPrice - p.price : 0;
    box.innerHTML = `
      <div class="combo-spot-media">
        <img src="${p.wideImage || p.images[0]}" alt="${p.name}: Haldi, Dhaniya and Lal Mirch pouches" loading="lazy" width="800" height="600" />
        ${save ? `<span class="combo-spot-save">Save ${window.formatPrice(save)}</span>` : ''}
      </div>
      <div class="combo-spot-body">
        <span class="eyebrow">Best Value</span>
        <h2 id="combo-spot-title">${p.name}</h2>
        <p class="combo-spot-desc">The three everyday essentials in one pack. Pure single spices, no added colour.</p>

        <ul class="combo-spot-items">
          ${(p.contents || []).map(c => `
            <li>
              <img src="${c.image}" alt="${c.name} pouch" loading="lazy" width="360" height="480" />
              <span class="combo-spot-item-name">${c.name}</span>
              <span class="combo-spot-item-sub">${c.weight}</span>
            </li>`).join('')}
        </ul>

        <div class="combo-spot-buy">
          <div class="combo-spot-price">
            <span class="product-price gold-gradient">${window.formatPrice(p.price)}</span>
            ${p.originalPrice ? `<span class="product-strike">MRP ${window.formatPrice(p.originalPrice)}</span>` : ''}
            <span class="combo-spot-weight">${window.sizeLabel(p)} = ${p.weight_g}g</span>
          </div>
          <div class="buy-slot buy-slot-lg" data-buy-for="${p.id}" data-buy-label="Add Combo to Cart"></div>
        </div>
      </div>
    `;
  }
};


/* =====================================================================
   SHOP — product cards (one card per product, size switch for 100g/50g)
   ===================================================================== */
const Collection = {
  init() {
    const grid = $('#product-grid');

    // One card per `group`; each size of that product is a variant on the card
    const groups = [];
    window.PRODUCTS.forEach(p => {
      const key = p.group || p.id;
      let g = groups.find(x => x.key === key);
      if (!g) groups.push(g = { key, variants: [] });
      g.variants.push(p);
    });

    groups.forEach(g => {
      const card = document.createElement('article');
      card.className = 'product-card';
      card._variants = g.variants;
      Collection.renderCard(card, g.variants[0]);
      grid.appendChild(card);
    });

    grid.addEventListener('click', (e) => {
      const sizeBtn = e.target.closest('[data-size]');
      if (!sizeBtn) return;
      Collection.renderCard(sizeBtn.closest('.product-card'), window.getProductById(sizeBtn.dataset.size));
      icons();
    });
  },

  renderCard(card, p) {
    const variants = card._variants;
    const badges = [];
    if (p.originalPrice) badges.push(`<span class="badge badge-discount">${window.formatDiscount(p.price, p.originalPrice)}</span>`);
    if (p.isNew)         badges.push(`<span class="badge badge-new">New</span>`);
    if (p.isBestseller)  badges.push(`<span class="badge badge-bestseller">Bestseller</span>`);

    // Only show ratings when there are real reviews (no fake stars)
    const ratingHtml = p.reviewCount > 0 ? `
      <div class="product-rating">
        <i data-lucide="star"></i><span>${p.rating}</span>
        <span class="product-rating-count">(${p.reviewCount.toLocaleString()})</span>
      </div>` : '';

    card.innerHTML = `
      <div class="product-image">
        <img src="${p.images[0]}" alt="${p.name} ${window.sizeLabel(p)} pouch" loading="lazy" width="500" height="750" />
        <div class="product-badges">${badges.join('')}</div>
      </div>
      <div class="product-body">
        ${ratingHtml}
        <h3 class="product-name">${p.name}</h3>
        <p class="product-short">${p.shortDescription}</p>
        ${variants.length > 1 ? `
          <div class="product-sizes" role="group" aria-label="Pack size">
            ${variants.map(v => `<button type="button" class="product-size${v.id === p.id ? ' is-active' : ''}" data-size="${v.id}" aria-pressed="${v.id === p.id}">${window.sizeLabel(v)}</button>`).join('')}
          </div>` : `<div class="product-sizes"><span class="product-size is-static">${window.sizeLabel(p)}</span></div>`}
        <div class="product-prices">
          <span class="product-price gold-gradient">${window.formatPrice(p.price)}</span>
          ${p.originalPrice ? `<span class="product-strike">${window.formatPrice(p.originalPrice)}</span>` : ''}
        </div>
        <div class="buy-slot" data-buy-for="${p.id}"></div>
      </div>
    `;
    card.querySelector('[data-buy-for]').innerHTML = Buy.html(p.id);
  }
};


/* =====================================================================
   WHY ROHILLA — feature cards
   ===================================================================== */
const Engineering = {
  init() {
    const grid = $('#engineering-features');
    grid.innerHTML = window.ENGINEERING_FEATURES.map(f => `
      <div class="feature-card">
        <div class="feature-icon"><i data-lucide="${f.icon}"></i></div>
        <div>
          <h3>${f.title}</h3>
          <p>${f.description}</p>
          <span class="feature-spec">${f.spec}</span>
        </div>
      </div>
    `).join('');
  }
};


/* =====================================================================
   RECIPES — cards + pop-up
   ===================================================================== */
const Recipes = {
  init() {
    const grid = $('#recipe-grid');
    window.RECIPES.forEach(r => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'recipe-card';
      card.innerHTML = `
        <div class="recipe-card-image">
          <img src="${r.image}" alt="${r.title}" loading="lazy" />
          <span class="recipe-difficulty ${r.difficulty.toLowerCase()}">${r.difficulty}</span>
        </div>
        <div class="recipe-card-body">
          <h3 class="recipe-card-title">${r.title}</h3>
          <p class="recipe-card-desc">${r.description}</p>
          <div class="recipe-card-meta">
            <span><i data-lucide="clock"></i>${r.prepTime + r.cookTime} min</span>
            <span><i data-lucide="users"></i>Serves ${r.servings}</span>
          </div>
        </div>
      `;
      card.addEventListener('click', () => Recipes.openModal(r));
      grid.appendChild(card);
    });

    $('#recipe-modal').addEventListener('click', (e) => {
      if (e.target.classList.contains('recipe-modal-backdrop') || e.target.id === 'recipe-modal') Recipes.closeModal();
    });
  },

  openModal(r) {
    const products = (r.relatedProductIds || []).map(id => window.getProductById(id)).filter(Boolean);
    const content = $('#recipe-modal-content');
    content.innerHTML = `
      <button class="recipe-modal-close" aria-label="Close"><i data-lucide="x"></i></button>
      <div class="recipe-modal-image">
        <img src="${r.image}" alt="${r.title}" />
        <div class="recipe-modal-title-wrap">
          <span class="recipe-difficulty ${r.difficulty.toLowerCase()}">${r.difficulty}</span>
          <h2>${r.title}</h2>
        </div>
      </div>
      <div class="recipe-modal-body">
        <p class="recipe-modal-desc">${r.description}</p>
        <div class="recipe-modal-meta">
          <div class="recipe-meta-item"><div class="icon-box"><i data-lucide="clock"></i></div>
            <div><div class="recipe-meta-label">Prep</div><div class="recipe-meta-value">${r.prepTime} min</div></div></div>
          <div class="recipe-meta-item"><div class="icon-box"><i data-lucide="chef-hat"></i></div>
            <div><div class="recipe-meta-label">Cook</div><div class="recipe-meta-value">${r.cookTime} min</div></div></div>
          <div class="recipe-meta-item"><div class="icon-box"><i data-lucide="users"></i></div>
            <div><div class="recipe-meta-label">Serves</div><div class="recipe-meta-value">${r.servings}</div></div></div>
        </div>
        ${products.length ? `
          <div class="recipe-buy">
            <p class="recipe-buy-title">You'll need</p>
            ${products.map(p => `
              <div class="recipe-buy-row">
                <img src="${p.images[0]}" alt="" width="48" height="72" />
                <div class="recipe-buy-info"><span>${p.name}</span><span>${window.sizeLabel(p)} · ${window.formatPrice(p.price)}</span></div>
                <div class="buy-slot buy-slot-sm" data-buy-for="${p.id}"></div>
              </div>`).join('')}
          </div>` : ''}
        <div class="recipe-modal-grid">
          <div>
            <h3>Ingredients</h3>
            <ul class="recipe-ingredients">
              ${r.ingredients.map(ing => `<li><span></span><span>${ing}</span></li>`).join('')}
            </ul>
          </div>
          <div>
            <h3>Instructions</h3>
            <ol class="recipe-instructions">
              ${r.instructions.map((step, i) => `<li><span>${i + 1}</span><span>${step}</span></li>`).join('')}
            </ol>
          </div>
        </div>
      </div>
    `;
    content.querySelector('.recipe-modal-close').addEventListener('click', Recipes.closeModal);
    $('#recipe-modal').hidden = false;
    ScrollLock.lock();
    Buy.refresh();
    icons();
  },

  closeModal() {
    $('#recipe-modal').hidden = true;
    ScrollLock.unlock();
  }
};


/* =====================================================================
   TOAST — small "Added to cart" message
   ===================================================================== */
const Toast = {
  timer: null,
  show(text) {
    const el = $('#toast');
    el.innerHTML = `<i data-lucide="circle-check"></i><span>${text}</span>`;
    el.hidden = false;
    el.classList.remove('is-leaving');
    icons();
    clearTimeout(Toast.timer);
    Toast.timer = setTimeout(() => {
      el.classList.add('is-leaving');
      setTimeout(() => { el.hidden = true; }, 250);
    }, 1800);
  }
};


/* =====================================================================
   CART DRAWER + sticky cart bar
   ===================================================================== */
const CartUI = {
  init() {
    $('#cart-close').addEventListener('click', () => Cart.close());
    $('#cart-backdrop').addEventListener('click', () => Cart.close());
    $('#checkout-btn').addEventListener('click', () => CartUI.checkout());
    $('#cart-empty-shop').addEventListener('click', () => {
      Cart.close();
      $('#collection').scrollIntoView({ behavior: 'smooth' });
    });
    $('#cart-bar-open').addEventListener('click', () => Cart.open());
    $('#cart-bar-checkout').addEventListener('click', () => CartUI.checkout());

    // Quantity + remove buttons inside the drawer (one delegated listener)
    $('#cart-items').addEventListener('click', (e) => {
      const inc = e.target.closest('[data-qty-inc]');
      const dec = e.target.closest('[data-qty-dec]');
      const rem = e.target.closest('[data-cart-remove]');
      if (inc) Cart.updateQuantity(inc.dataset.qtyInc, Cart.qty(inc.dataset.qtyInc) + 1);
      if (dec) Cart.updateQuantity(dec.dataset.qtyDec, Cart.qty(dec.dataset.qtyDec) - 1);
      if (rem) Cart.remove(rem.dataset.cartRemove);
    });
    $('#cart-upsell').addEventListener('click', (e) => {
      const add = e.target.closest('[data-upsell-add]');
      if (add) { Cart.add(window.getProductById(add.dataset.upsellAdd)); Cart.dismissUpsell(); }
      if (e.target.closest('[data-upsell-dismiss]')) Cart.dismissUpsell();
    });

    CartUI.render();
  },

  render() {
    const totals = Cart.totals();
    const cfg = window.CONFIG;
    const isEmpty = Cart.items.length === 0;
    const itemsText = totals.totalItems + ' item' + (totals.totalItems === 1 ? '' : 's');

    // Header badge
    const badge = $('#cart-badge');
    badge.textContent = totals.totalItems;
    badge.hidden = totals.totalItems === 0;
    $('#cart-count-pill').textContent = totals.totalItems;

    // Drawer open/close
    $('#cart-drawer').hidden   = !Cart.isOpen;
    $('#cart-backdrop').hidden = !Cart.isOpen;
    if (Cart.isOpen) ScrollLock.lock(); else ScrollLock.unlock();

    // Sticky bottom bar (cart has items) vs floating WhatsApp button (empty cart)
    $('#cart-bar').hidden = isEmpty;
    $('#wa-float').hidden = !isEmpty;
    document.body.classList.toggle('has-cart-bar', !isEmpty);
    $('#cart-bar-count').textContent = itemsText;
    $('#cart-bar-total').textContent = window.formatPrice(totals.total);

    // Empty state
    $('#cart-empty').hidden = !isEmpty;

    // Items
    $('#cart-items').innerHTML = Cart.items.map(({ product, quantity }) => `
      <div class="cart-item">
        <img src="${product.images[0]}" alt="" width="60" height="90" />
        <div class="cart-item-body">
          <h4>${product.name}</h4>
          <p class="cart-item-sku">${window.sizeLabel(product)} · ${window.formatPrice(product.price)} each</p>
          <div class="cart-qty">
            <button type="button" data-qty-dec="${product.id}" aria-label="Remove one ${product.name}"><i data-lucide="minus"></i></button>
            <span>${quantity}</span>
            <button type="button" data-qty-inc="${product.id}" aria-label="Add one more ${product.name}"><i data-lucide="plus"></i></button>
          </div>
        </div>
        <div class="cart-item-right">
          <span class="cart-item-price">${window.formatPrice(product.price * quantity)}</span>
          <button type="button" class="cart-item-remove" data-cart-remove="${product.id}" aria-label="Remove ${product.name}"><i data-lucide="trash-2"></i></button>
        </div>
      </div>
    `).join('');

    // "Pairs well with" suggestion
    const upsellEl = $('#cart-upsell');
    const u = Cart.upsellProduct;
    if (!isEmpty && u) {
      upsellEl.innerHTML = `
        <div class="cart-upsell-inner">
          <div class="cart-upsell-body">
            <p class="cart-upsell-title">Pairs well with</p>
            <div class="cart-upsell-row">
              <img src="${u.images[0]}" alt="" width="40" height="60" />
              <div class="info"><p>${u.name}</p><p>${window.sizeLabel(u)} · ${window.formatPrice(u.price)}</p></div>
              <button type="button" class="cart-upsell-add" data-upsell-add="${u.id}">Add</button>
            </div>
          </div>
          <button type="button" class="cart-upsell-dismiss" data-upsell-dismiss aria-label="Hide suggestion"><i data-lucide="x"></i></button>
        </div>`;
      upsellEl.hidden = false;
    } else {
      upsellEl.hidden = true;
      upsellEl.innerHTML = '';
    }

    // Footer: free-delivery progress, discount, totals
    $('#cart-footer').hidden = isEmpty;
    if (!isEmpty) {
      const afterDiscount = totals.total;
      const need = cfg.freeShippingThreshold - afterDiscount;
      $('#ship-progress-text').innerHTML = need > 0
        ? `Add <strong>${window.formatPrice(need)}</strong> more for <strong>FREE delivery</strong>`
        : `🎉 You get <strong>FREE delivery</strong>`;
      $('#ship-bar-fill').style.width = Math.min(100, (afterDiscount / cfg.freeShippingThreshold) * 100) + '%';

      $('#cart-subtotal').textContent = window.formatPrice(totals.subtotal);
      $('#cart-total').textContent    = window.formatPrice(totals.total);
      const hasDiscount = totals.discount > 0;
      $('#cart-discount-row').hidden = !hasDiscount;
      $('#cart-discount-badge').hidden = !hasDiscount;
      if (hasDiscount) {
        const mb = cfg.multiBuy;
        $('#cart-discount').textContent = '-' + window.formatPrice(totals.discount);
        $('#cart-discount-badge').innerHTML = `<i data-lucide="tag"></i><span>${mb.percent}% off for ${mb.minItems}+ pouches — you saved ${window.formatPrice(totals.discount)}</span>`;
      }
    }

    Buy.refresh();
    icons();
  },

  checkout() {
    if (Cart.items.length === 0) return;
    Cart.close();
    Checkout.open();
  }
};


/* =====================================================================
   CHECKOUT — form, pincode lookup, totals, WhatsApp order
   ===================================================================== */
const Checkout = {
  lastUrl: '',

  init() {
    $('#checkout-modal-close').addEventListener('click', () => Checkout.close());
    $('.checkout-backdrop', $('#checkout-modal')).addEventListener('click', () => Checkout.close());
    $('#checkout-form').addEventListener('submit', (e) => Checkout.submit(e));
    $('#co-pincode').addEventListener('input', () => Checkout.onPincodeChange());
    // Keep only digits in the phone + pincode boxes
    ['#co-phone', '#co-pincode'].forEach(sel => $(sel).addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '');
    }));

    const closeConfirm = () => {
      $('#order-confirm-modal').hidden = true;
      Cart.clear();              // the order was handed to WhatsApp, so start fresh
      ScrollLock.unlock();
    };
    $('#confirm-done').addEventListener('click', closeConfirm);
    $('.checkout-backdrop', $('#order-confirm-modal')).addEventListener('click', closeConfirm);
  },

  open() {
    Checkout.render();
    $('#checkout-modal').hidden = false;
    ScrollLock.lock();
  },
  close() {
    $('#checkout-modal').hidden = true;
    ScrollLock.unlock();
  },

  // Returns totals: subtotal, comboDiscount, shipping, gst, total.
  // Product prices are MRP, which by law already INCLUDES GST — so `gst` is
  // the portion of the total that is tax, shown for information only.
  totals() {
    const cartTotals = Cart.totals();
    const subtotal = cartTotals.subtotal;
    const comboDiscount = cartTotals.discount;
    const afterDiscount = subtotal - comboDiscount;

    const cfg = window.CONFIG;
    const shipping = (afterDiscount >= cfg.freeShippingThreshold) ? 0 : cfg.shippingCost;
    const total = afterDiscount + shipping;
    const gst = Math.round(total - total / (1 + cfg.gstRate));

    return { subtotal, comboDiscount, shipping, gst, total };
  },

  render() {
    $('#checkout-items').innerHTML = Cart.items.map(({ product, quantity }) => `
      <div class="checkout-item">
        <img src="${product.images[0]}" alt="" width="40" height="60" />
        <div class="checkout-item-info">
          <div class="checkout-item-name">${product.name} (${window.sizeLabel(product)})</div>
          <div class="checkout-item-qty">Qty ${quantity} × ${window.formatPrice(product.price)}</div>
        </div>
        <div class="checkout-item-price">${window.formatPrice(product.price * quantity)}</div>
      </div>
    `).join('');
    Checkout.recalc();
  },

  recalc() {
    const t = Checkout.totals();
    const cfg = window.CONFIG;
    $('#co-subtotal').textContent = window.formatPrice(t.subtotal);
    $('#co-gst').textContent      = window.formatPrice(t.gst);
    $('#co-total').textContent    = window.formatPrice(t.total);

    $('#co-discount-row').hidden = !(t.comboDiscount > 0);
    if (t.comboDiscount > 0) {
      $('#co-discount-label').textContent = `${cfg.multiBuy.percent}% off (${cfg.multiBuy.minItems}+ pouches)`;
      $('#co-discount').textContent = '-' + window.formatPrice(t.comboDiscount);
    }

    if (t.shipping === 0) {
      $('#co-shipping').textContent = 'FREE';
      $('#co-shipping-label').textContent = 'Delivery';
    } else {
      $('#co-shipping').textContent = window.formatPrice(t.shipping);
      $('#co-shipping-label').textContent = 'Delivery (free over ' + window.formatPrice(cfg.freeShippingThreshold) + ')';
    }
  },

  onPincodeChange() {
    const pin = $('#co-pincode').value.trim();
    const status = $('#co-pincode-status');

    if (pin.length === 0) { status.textContent = ''; status.className = 'checkout-pincode-status'; return; }
    if (!/^[1-9][0-9]{5}$/.test(pin)) {
      status.textContent = pin.length < 6 ? '' : 'Enter a valid 6-digit pincode';
      status.className = 'checkout-pincode-status err';
      return;
    }

    const match = window.PINCODES[pin];
    if (match) {
      status.textContent = '✓ Delivers to ' + match.city + ', ' + match.state + ' in ~' + match.days + ' day' + (match.days > 1 ? 's' : '');
      status.className = 'checkout-pincode-status ok';
      $('#co-city').value = match.city;
      $('#co-state').value = match.state;
    } else {
      status.textContent = 'We deliver across India — we\'ll confirm the delivery date on WhatsApp';
      status.className = 'checkout-pincode-status warn';
    }
  },

  submit(e) {
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity()) {
      form.reportValidity();
      const bad = form.querySelector(':invalid');
      if (bad) bad.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const fd = new FormData(form);
    const customer = {
      name:    fd.get('name').trim(),
      phone:   fd.get('phone').trim(),
      email:   (fd.get('email') || '').trim(),
      pincode: fd.get('pincode').trim(),
      address: fd.get('address').trim(),
      city:    (fd.get('city') || '').trim(),
      state:   (fd.get('state') || '').trim(),
      notes:   (fd.get('notes') || '').trim()
    };

    const t = Checkout.totals();
    const orderId = 'ROH' + Date.now().toString(36).toUpperCase();
    const order = {
      orderId,
      placedAt: new Date().toISOString(),
      items: Cart.items.map(({ product, quantity }) => ({
        id: product.id, name: product.name, size: window.sizeLabel(product), sku: product.sku, price: product.price, quantity
      })),
      customer,
      totals: t,
      status: 'placed_via_whatsapp'
    };

    // Keep a copy on this device (there is no server-side order log yet)
    try {
      const all = JSON.parse(localStorage.getItem('rohilla-orders') || '[]');
      all.push(order);
      localStorage.setItem('rohilla-orders', JSON.stringify(all));
    } catch (e) { /* ignore quota */ }

    const msg = Checkout.buildWhatsappMessage(order);
    const url = 'https://wa.me/' + window.CONFIG.whatsappNumber + '?text=' + encodeURIComponent(msg);
    Checkout.lastUrl = url;

    // Open WhatsApp. The confirmation screen also has a button + copy-paste
    // fallback in case the phone blocks the pop-up.
    window.open(url, '_blank');

    $('#confirm-order-id').textContent = orderId;
    $('#confirm-fallback-text').value = msg;
    $('#confirm-open-wa').href = url;
    Checkout.close();
    $('#order-confirm-modal').hidden = false;
    ScrollLock.lock();
  },

  buildWhatsappMessage(order) {
    const cfg = window.CONFIG;
    const t = order.totals;
    const c = order.customer;
    const lines = [];
    lines.push('*New Order — ' + order.orderId + '*');
    lines.push('');
    lines.push('*Items:*');
    order.items.forEach(it => {
      lines.push('• ' + it.name + ' ' + it.size + ' (' + it.sku + ')  ×' + it.quantity + '  — ' + window.formatPrice(it.price * it.quantity));
    });
    lines.push('');
    lines.push('*Bill:*');
    lines.push('Subtotal: ' + window.formatPrice(t.subtotal));
    if (t.comboDiscount > 0) lines.push('Discount (' + cfg.multiBuy.percent + '% off ' + cfg.multiBuy.minItems + '+ pouches): -' + window.formatPrice(t.comboDiscount));
    lines.push('Delivery: ' + (t.shipping === 0 ? 'FREE' : window.formatPrice(t.shipping)));
    lines.push('*TOTAL: ' + window.formatPrice(t.total) + '*');
    lines.push('(includes GST ' + Math.round(cfg.gstRate * 100) + '%: ' + window.formatPrice(t.gst) + ')');
    lines.push('');
    lines.push('*Deliver to:*');
    lines.push(c.name);
    lines.push(c.phone);
    if (c.email) lines.push(c.email);
    lines.push(c.address);
    lines.push((c.city ? c.city + ', ' : '') + (c.state ? c.state + ' - ' : '') + c.pincode);
    if (c.notes) { lines.push(''); lines.push('*Notes:* ' + c.notes); }
    lines.push('');
    lines.push('Placed via rohillatraders.com');
    return lines.join('\n');
  }
};


/* =====================================================================
   ESC key closes whatever is open (top-most first)
   ===================================================================== */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!$('#recipe-modal').hidden) return Recipes.closeModal();
  if (!$('#checkout-modal').hidden) return Checkout.close();
  if (Cart.isOpen) return Cart.close();
  if (!$('#mobile-menu').hidden) return Nav.closeMobile();
});


/* =====================================================================
   BOOT
   ===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  Cart.load();

  Branding.init();
  Nav.init();
  Hero.init();
  ComboSpot.init();
  Collection.init();
  Engineering.init();
  Recipes.init();
  Buy.init();
  CartUI.init();
  Checkout.init();

  icons();
});
