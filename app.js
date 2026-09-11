/* =====================================================================
   ROHILLA — main behaviour file
   Organised in the same top-to-bottom order as the HTML sections.
   You should rarely need to edit this file. To change prices/products/
   recipes, edit data.js. To change colours/spacing, edit styles.css.
   ===================================================================== */

/* ----------------------- Small DOM helpers ------------------------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* Render hero trust indicators + footer contacts from CONFIG */
const Branding = {
  init() {
    // Hero trust indicators
    const stats = $('#hero-stats');
    if (stats && window.CONFIG && window.CONFIG.trustIndicators) {
      const html = window.CONFIG.trustIndicators.map((t, i) => `
        ${i > 0 ? '<div class="stat-divider"></div>' : ''}
        <div class="stat">
          <div class="stat-num gold-gradient">${t.value}</div>
          <div class="stat-label">${t.label}</div>
        </div>
      `).join('');
      stats.innerHTML = html;
    }

    const cfg = window.CONFIG;
    if (!cfg) return;
    const whatsappUrl = 'https://wa.me/' + cfg.whatsappNumber;

    // Footer contacts
    const fc = $('#footer-contacts');
    if (fc) {
      fc.innerHTML = `
        <div><i data-lucide="map-pin"></i><span>${cfg.contactAddress}</span></div>
        <div><i data-lucide="phone"></i><a href="tel:${cfg.contactPhone.replace(/\s/g, '')}">${cfg.contactPhone}</a></div>
        <div><i data-lucide="mail"></i><a href="mailto:${cfg.contactEmail}">${cfg.contactEmail}</a></div>
      `;
    }

    // Links that live in several places in the footer
    $$('[data-email-link]').forEach(a => { a.href = 'mailto:' + cfg.contactEmail; });
    $$('[data-whatsapp-link]').forEach(a => { a.href = whatsappUrl; });
    $$('[data-instagram-link]').forEach(a => {
      if (cfg.instagramUrl) a.href = cfg.instagramUrl;
      else a.closest('li') ? a.closest('li').remove() : a.remove();
    });
    $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

    // FSSAI + GSTIN badges in footer-india — hidden until real numbers are set
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


/* ============================================================
   NAV LINKS — edit here to change menu items
   ============================================================ */
const NAV_LINKS = [
  { label: 'Collection',     href: '#collection' },
  { label: 'Engineering',    href: '#engineering' },
  { label: 'Recipes',        href: '#recipes' },
  { label: 'Build Your Box', href: '#combo-builder' },
];

/* ============================================================
   CART — single source of truth for the cart drawer
   ============================================================ */
const Cart = {
  items: [],                  // { product, quantity }[]
  isOpen: false,
  upsellProduct: null,

  load() {
    try {
      const raw = localStorage.getItem('rohilla-cart');
      if (raw) this.items = JSON.parse(raw).items || [];
    } catch (e) { this.items = []; }
  },
  save() {
    try { localStorage.setItem('rohilla-cart', JSON.stringify({ items: this.items })); }
    catch (e) { /* ignore quota errors */ }
  },

  totals() {
    const totalItems = this.items.reduce((s, i) => s + i.quantity, 0);
    const subtotal   = this.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const discount   = totalItems >= 3 ? Math.round(subtotal * 0.1) : 0;
    return { totalItems, subtotal, discount, total: subtotal - discount };
  },

  add(product) {
    const existing = this.items.find(i => i.product.id === product.id);
    if (existing) existing.quantity += 1;
    else this.items.push({ product, quantity: 1 });
    this.upsellProduct = window.getUpsellProduct(product.id);
    this.isOpen = true;
    this.save(); CartUI.render();
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
  open()   { this.isOpen = true;  CartUI.render(); },
  close()  { this.isOpen = false; CartUI.render(); },
  toggle() { this.isOpen = !this.isOpen; CartUI.render(); },
  dismissUpsell() { this.upsellProduct = null; CartUI.render(); }
};

/* ============================================================
   COMBO BUILDER STATE
   ============================================================ */
const Combo = {
  items: [],       // products in the box
  maxItems: 3,
  discount: 0.10,

  add(product) {
    if (this.items.length >= this.maxItems) return false;
    if (this.items.some(p => p.id === product.id)) return false;
    this.items.push(product);
    ComboUI.render();
    return true;
  },
  remove(productId) {
    this.items = this.items.filter(p => p.id !== productId);
    ComboUI.render();
  },
  clear() { this.items = []; ComboUI.render(); },
  total() { return this.items.reduce((s, p) => s + p.price, 0); },
  discountedTotal() {
    const total = this.total();
    return this.items.length >= 3 ? Math.round(total * (1 - this.discount)) : total;
  },
  isFull() { return this.items.length >= this.maxItems; },
  canAddMore() { return this.items.length < this.maxItems; }
};


/* =====================================================================
   SECTION 1 — NAVIGATION
   ===================================================================== */
const Nav = {
  init() {
    // Desktop links
    const desktop = $('#nav-links');
    NAV_LINKS.forEach(link => {
      const btn = document.createElement('button');
      btn.className = 'nav-link';
      btn.textContent = link.label;
      btn.addEventListener('click', () => Nav.scrollTo(link.href));
      desktop.appendChild(btn);
    });

    // Mobile links
    const mobile = $('#mobile-nav-links');
    NAV_LINKS.forEach((link, i) => {
      const btn = document.createElement('button');
      btn.textContent = link.label;
      btn.style.animationDelay = (0.1 + i * 0.05) + 's';
      btn.addEventListener('click', () => {
        Nav.scrollTo(link.href);
        Nav.closeMobile();
      });
      mobile.appendChild(btn);
    });

    // Scroll → toggle "scrolled" class on header
    window.addEventListener('scroll', () => {
      $('#site-header').classList.toggle('scrolled', window.scrollY > 100);
    }, { passive: true });

    // Mobile menu toggle
    $('#mobile-menu-toggle').addEventListener('click', () => {
      const menu = $('#mobile-menu');
      const isHidden = menu.hasAttribute('hidden');
      if (isHidden) Nav.openMobile(); else Nav.closeMobile();
    });

    // Generic [data-scroll-to] buttons (Hero CTAs etc.)
    $$('[data-scroll-to]').forEach(el => {
      el.addEventListener('click', () => Nav.scrollTo(el.dataset.scrollTo));
    });

    // Cart button
    $('#cart-button').addEventListener('click', () => Cart.toggle());
  },

  scrollTo(href) {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  },

  openMobile() {
    $('#mobile-menu').removeAttribute('hidden');
    $('#menu-open-icon').setAttribute('hidden', '');
    $('#menu-close-icon').removeAttribute('hidden');
  },
  closeMobile() {
    $('#mobile-menu').setAttribute('hidden', '');
    $('#menu-open-icon').removeAttribute('hidden');
    $('#menu-close-icon').setAttribute('hidden', '');
  }
};


/* =====================================================================
   SECTION 2 — HERO (mouse spotlight + gyroscope tilt on pouch)
   ===================================================================== */
const Hero = {
  init() {
    this.initSpotlight();
    this.initGyroscope();
  },

  initSpotlight() {
    const el = $('#hero-spotlight');
    if (!el) return;
    let nx = 0, ny = 0, lastUpdate = 0;

    window.addEventListener('mousemove', (e) => {
      const now = performance.now();
      if (now - lastUpdate < 16) return;   // ~60fps throttle
      lastUpdate = now;
      nx = (e.clientX / window.innerWidth - 0.5) * 2;
      ny = (e.clientY / window.innerHeight - 0.5) * 2;

      if (window.gsap) {
        gsap.to(el, {
          x: nx * 100,
          y: ny * 50,
          duration: 0.8,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      } else {
        el.style.transform = `translateX(calc(-50% + ${nx * 100}px)) translateY(${ny * 50}px)`;
      }
    }, { passive: true });
  },

  initGyroscope() {
    const el = $('#hero-pouch');
    if (!el) return;

    const intensity = 12;
    const smoothness = 0.08;
    let cur = { x: 0, y: 0 };
    let tgt = { x: 0, y: 0 };

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      tgt.x = -Math.max(-1, Math.min(1, dy)) * intensity;
      tgt.y =  Math.max(-1, Math.min(1, dx)) * intensity;
    }, { passive: true });

    el.addEventListener('mouseleave', () => { tgt = { x: 0, y: 0 }; }, { passive: true });

    const animate = () => {
      cur.x += (tgt.x - cur.x) * smoothness;
      cur.y += (tgt.y - cur.y) * smoothness;
      el.style.transform = `perspective(1000px) rotateX(${cur.x}deg) rotateY(${cur.y}deg)`;
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }
};


/* =====================================================================
   SECTION 3 — ENGINEERING (X-ray reveal, GSAP ScrollTrigger)
   ===================================================================== */
const Engineering = {
  init() {
    this.renderFeatures();
    this.renderXrayParticles();
    this.initXrayScroll();
  },

  renderFeatures() {
    const grid = $('#engineering-features');
    window.ENGINEERING_FEATURES.forEach((f, i) => {
      const card = document.createElement('div');
      card.className = 'feature-card';
      card.style.transitionDelay = (i * 0.1) + 's';
      card.innerHTML = `
        <div class="feature-card-inner">
          <div class="feature-icon"><i data-lucide="${f.icon}"></i></div>
          <div>
            <h3>${f.title}</h3>
            <p>${f.description}</p>
            <span class="feature-spec">${f.spec}</span>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  },

  // SVG sprinkle of "spice particles" inside the wireframe
  renderXrayParticles() {
    const g = $('#xray-particles');
    if (!g) return;
    for (let i = 0; i < 20; i++) {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', 40 + Math.random() * 200);
      c.setAttribute('cy', 60 + Math.random() * 200);
      c.setAttribute('r',  1 + Math.random() * 2);
      c.setAttribute('fill', 'rgba(191, 149, 63, 0.4)');
      g.appendChild(c);
    }
  },

  initXrayScroll() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    const section   = $('#engineering');
    const pouch     = $('#xray-pouch');
    const wireframe = $('#xray-wireframe');
    const barFill   = $('#xray-bar-fill');
    const labels    = $$('.xray-label');

    ScrollTrigger.create({
      trigger: section,
      start: 'top 60%',
      end: 'center center',
      scrub: 0.5,
      onUpdate: (self) => {
        const p = self.progress;
        pouch.style.opacity     = 1 - p * 0.7;
        wireframe.style.opacity = p;
        barFill.style.width     = (p * 100) + '%';

        labels.forEach(label => {
          const threshold = parseFloat(label.dataset.reveal);
          label.classList.toggle('is-revealed', p > threshold);
        });
      }
    });
  }
};


/* =====================================================================
   SECTION 4 — PRODUCT COLLECTION
   ===================================================================== */
const Collection = {
  init() {
    const grid = $('#product-grid');
    window.PRODUCTS.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.style.transitionDelay = (i * 0.1) + 's';

      const badges = [];
      if (p.isBestseller)   badges.push(`<span class="badge badge-bestseller"><i data-lucide="trending-up"></i>Bestseller</span>`);
      if (p.isNew)          badges.push(`<span class="badge badge-new"><i data-lucide="sparkles"></i>New</span>`);
      if (p.originalPrice)  badges.push(`<span class="badge badge-discount">${window.formatDiscount(p.price, p.originalPrice)}</span>`);

      // Only show rating row when there are real reviews (no fake stars on day 1)
      const ratingHtml = p.reviewCount > 0 ? `
        <div class="product-rating">
          <div class="product-rating-stars"><i data-lucide="star"></i><span class="product-rating-num">${p.rating}</span></div>
          <span class="product-rating-count">(${p.reviewCount.toLocaleString()})</span>
        </div>` : '';

      card.innerHTML = `
        <div class="product-image">
          <img src="${p.images[0]}" alt="${p.name}" loading="lazy" />
          <div class="product-image-overlay"></div>
          <div class="product-badges">${badges.join('')}</div>
          <button class="product-quick-add" data-add="${p.id}" aria-label="Quick add ${p.name}">
            <i data-lucide="shopping-bag"></i>
          </button>
        </div>
        <div class="product-body">
          ${ratingHtml}
          <h3 class="product-name">${p.name}</h3>
          <p class="product-sku">${p.sku}</p>
          <p class="product-short">${p.shortDescription}</p>
          <div class="product-price-row">
            <span class="product-weight">${p.weight_g}g</span>
            <div class="product-prices">
              ${p.originalPrice ? `<span class="product-strike">${window.formatPrice(p.originalPrice)}</span>` : ''}
              <span class="product-price gold-gradient">${window.formatPrice(p.price)}</span>
            </div>
          </div>
          <button class="product-add-btn" data-add="${p.id}">Add to Cart</button>
        </div>
      `;
      grid.appendChild(card);
    });

    // Delegate all "add to cart" clicks
    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-add]');
      if (!btn) return;
      const product = window.getProductById(btn.dataset.add);
      if (product) Cart.add(product);
    });
  }
};


/* =====================================================================
   SECTION 5 — GALLERY
   ===================================================================== */
const Gallery = {
  init() {
    const grid = $('#gallery-grid');
    window.GALLERY.forEach((img, i) => {
      const tile = document.createElement('div');
      tile.className = 'gallery-item ' + img.span;
      tile.style.transitionDelay = (i * 0.1) + 's';
      tile.innerHTML = `
        <img src="${img.src}" alt="${img.alt}" loading="lazy" />
        <div class="gallery-item-overlay"></div>
        <div class="gallery-item-content">
          <span class="gallery-item-eyebrow">${img.alt}</span>
          <h3 class="gallery-item-title">${img.title}</h3>
        </div>
      `;
      grid.appendChild(tile);
    });
  }
};


/* =====================================================================
   SECTION 6 — COMBO BUILDER
   ===================================================================== */
const ComboUI = {
  init() {
    // Render selectable products (left column)
    const list = $('#combo-products');
    window.PRODUCTS.forEach(p => {
      const div = document.createElement('div');
      div.className = 'combo-product';
      div.dataset.productId = p.id;
      div.innerHTML = `
        <div class="combo-product-inner">
          <div class="combo-product-img"><img src="${p.images[0]}" alt="${p.name}" loading="lazy" /></div>
          <div class="combo-product-info">
            <h4>${p.name}</h4>
            <p>${window.formatPrice(p.price)}</p>
          </div>
          <button class="combo-product-btn" data-combo-toggle="${p.id}" aria-label="Toggle ${p.name}">
            <i data-lucide="plus"></i>
          </button>
        </div>
      `;
      list.appendChild(div);
    });

    list.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-combo-toggle]');
      if (!btn) return;
      const id = btn.dataset.comboToggle;
      const product = window.getProductById(id);
      if (Combo.items.some(p => p.id === id)) Combo.remove(id);
      else Combo.add(product);
    });

    // Add-to-cart and clear buttons
    $('#combo-add-btn').addEventListener('click', () => {
      if (Combo.items.length === 0) return;
      Combo.items.forEach(p => Cart.add(p));
      const btn = $('#combo-add-btn');
      const original = btn.textContent;
      btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:.5rem"><i data-lucide="check"></i> Added to Cart!</span>';
      if (window.lucide) lucide.createIcons();
      setTimeout(() => {
        Combo.clear();
        btn.textContent = original;
      }, 2000);
    });

    $('#combo-clear-btn').addEventListener('click', () => Combo.clear());

    ComboUI.render();
  },

  render() {
    const items = Combo.items;
    const count = items.length;

    // Header count
    $('#combo-count').textContent = count + '/3 items';

    // Product selection state (highlighting + button state)
    $$('.combo-product').forEach(card => {
      const id = card.dataset.productId;
      const inBox = items.some(p => p.id === id);
      const btn = card.querySelector('.combo-product-btn');
      card.classList.toggle('selected', inBox);
      btn.classList.toggle('checked', inBox);
      btn.classList.toggle('disabled', !inBox && !Combo.canAddMore());
      btn.innerHTML = `<i data-lucide="${inBox ? 'check' : 'plus'}"></i>`;
    });

    // Box: empty state vs items
    $('#combo-empty').style.display = count === 0 ? 'flex' : 'none';
    const itemsBox = $('#combo-items');
    itemsBox.innerHTML = '';
    items.forEach(p => {
      const row = document.createElement('div');
      row.className = 'combo-item';
      row.innerHTML = `
        <img src="${p.images[0]}" alt="${p.name}" />
        <div class="combo-item-info">
          <h4>${p.name}</h4>
          <p>${window.formatPrice(p.price)}</p>
        </div>
        <button class="combo-item-remove" data-combo-remove="${p.id}" aria-label="Remove ${p.name}">
          <i data-lucide="x"></i>
        </button>
      `;
      itemsBox.appendChild(row);
    });
    itemsBox.querySelectorAll('[data-combo-remove]').forEach(btn => {
      btn.addEventListener('click', () => Combo.remove(btn.dataset.comboRemove));
    });

    // Progress bar
    const full = Combo.isFull();
    const fill = $('#combo-progress-fill');
    fill.style.width = ((count / 3) * 100) + '%';
    fill.classList.toggle('full', full);
    const progressText = $('#combo-progress-text');
    progressText.textContent = full ? 'Box Full!' : (3 - count) + ' more needed';
    progressText.classList.toggle('full', full);

    // Price summary
    const summary = $('#combo-summary');
    if (count > 0) {
      const total = Combo.total();
      const discounted = Combo.discountedTotal();
      const savings = total - discounted;
      summary.removeAttribute('hidden');
      summary.innerHTML = `
        <div class="combo-summary-row"><span>Subtotal</span><span>${window.formatPrice(total)}</span></div>
        ${full ? `<div class="combo-summary-row discount"><span>Combo Discount (10%)</span><span>-${window.formatPrice(savings)}</span></div>` : ''}
        <div class="combo-summary-total"><span>Total</span><span class="gold-gradient">${window.formatPrice(discounted)}</span></div>
      `;
    } else {
      summary.setAttribute('hidden', '');
      summary.innerHTML = '';
    }

    // Add-to-cart button
    const addBtn = $('#combo-add-btn');
    addBtn.textContent = 'Add ' + count + ' Item' + (count !== 1 ? 's' : '') + ' to Cart';
    addBtn.classList.toggle('disabled', count === 0);
    addBtn.disabled = count === 0;

    // Clear button
    $('#combo-clear-btn').toggleAttribute('hidden', count === 0);

    if (window.lucide) lucide.createIcons();
  }
};


/* =====================================================================
   SECTION 7 — RECIPES (cards + modal)
   ===================================================================== */
const Recipes = {
  init() {
    const grid = $('#recipe-grid');
    window.RECIPES.forEach((r, i) => {
      const diffClass = r.difficulty.toLowerCase();
      const card = document.createElement('div');
      card.className = 'recipe-card';
      card.style.transitionDelay = (i * 0.1) + 's';
      card.innerHTML = `
        <div class="recipe-card-inner">
          <div class="recipe-card-image">
            <img src="${r.image}" alt="${r.title}" loading="lazy" />
            <span class="recipe-difficulty ${diffClass}">${r.difficulty}</span>
            <div class="recipe-card-hover">
              <span class="recipe-card-hover-pill">View Recipe <i data-lucide="arrow-right"></i></span>
            </div>
          </div>
          <div class="recipe-card-body">
            <h3 class="recipe-card-title">${r.title}</h3>
            <p class="recipe-card-desc">${r.description}</p>
            <div class="recipe-card-meta">
              <div><i data-lucide="clock"></i><span>${r.prepTime + r.cookTime} min</span></div>
              <div><i data-lucide="users"></i><span>${r.servings} servings</span></div>
            </div>
          </div>
        </div>
      `;
      card.addEventListener('click', () => Recipes.openModal(r));
      grid.appendChild(card);
    });

    // Close modal on backdrop click / Esc
    $('#recipe-modal').addEventListener('click', (e) => {
      if (e.target.classList.contains('recipe-modal-backdrop') || e.target.id === 'recipe-modal') {
        Recipes.closeModal();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') Recipes.closeModal();
    });
  },

  openModal(r) {
    const diffClass = r.difficulty.toLowerCase();
    const content = $('#recipe-modal-content');
    content.innerHTML = `
      <button class="recipe-modal-close" aria-label="Close"><i data-lucide="x"></i></button>
      <div class="recipe-modal-image">
        <img src="${r.image}" alt="${r.title}" />
        <div class="recipe-modal-title-wrap">
          <span class="recipe-difficulty ${diffClass}">${r.difficulty}</span>
          <h2>${r.title}</h2>
        </div>
      </div>
      <div class="recipe-modal-body">
        <p class="recipe-modal-desc">${r.description}</p>
        <div class="recipe-modal-meta">
          <div class="recipe-meta-item">
            <div class="icon-box"><i data-lucide="clock"></i></div>
            <div><div class="recipe-meta-label">Prep Time</div><div class="recipe-meta-value">${r.prepTime} min</div></div>
          </div>
          <div class="recipe-meta-item">
            <div class="icon-box"><i data-lucide="chef-hat"></i></div>
            <div><div class="recipe-meta-label">Cook Time</div><div class="recipe-meta-value">${r.cookTime} min</div></div>
          </div>
          <div class="recipe-meta-item">
            <div class="icon-box"><i data-lucide="users"></i></div>
            <div><div class="recipe-meta-label">Servings</div><div class="recipe-meta-value">${r.servings} people</div></div>
          </div>
        </div>
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
    $('#recipe-modal').removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    if (window.lucide) lucide.createIcons();
  },

  closeModal() {
    $('#recipe-modal').setAttribute('hidden', '');
    document.body.style.overflow = '';
  }
};


/* =====================================================================
   CART DRAWER UI
   ===================================================================== */
const CartUI = {
  init() {
    $('#cart-close').addEventListener('click', () => Cart.close());
    $('#cart-backdrop').addEventListener('click', () => Cart.close());
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') Cart.close(); });

    $('#checkout-btn').addEventListener('click', () => CartUI.checkout());

    CartUI.render();
  },

  render() {
    const totals = Cart.totals();

    // Header badge (in nav)
    const badge = $('#cart-badge');
    if (totals.totalItems > 0) {
      badge.textContent = totals.totalItems;
      badge.removeAttribute('hidden');
    } else {
      badge.setAttribute('hidden', '');
    }
    $('#cart-count-pill').textContent = totals.totalItems;

    // Drawer open/close
    const drawer   = $('#cart-drawer');
    const backdrop = $('#cart-backdrop');
    if (Cart.isOpen) {
      drawer.removeAttribute('hidden');
      backdrop.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
    } else {
      drawer.setAttribute('hidden', '');
      backdrop.setAttribute('hidden', '');
      document.body.style.overflow = '';
    }

    // Empty state vs items
    const isEmpty = Cart.items.length === 0;
    $('#cart-empty').style.display = isEmpty ? 'flex' : 'none';

    // Upsell banner
    const upsellEl = $('#cart-upsell');
    if (!isEmpty && Cart.upsellProduct) {
      const u = Cart.upsellProduct;
      upsellEl.innerHTML = `
        <div class="cart-upsell-inner">
          <i data-lucide="sparkles"></i>
          <div class="cart-upsell-body">
            <p class="cart-upsell-title">Pairs well with</p>
            <div class="cart-upsell-row">
              <img src="${u.images[0]}" alt="${u.name}" />
              <div class="info">
                <p>${u.name}</p>
                <p>${window.formatPrice(u.price)}</p>
              </div>
              <button class="cart-upsell-add" data-upsell-add="${u.id}">Add</button>
            </div>
          </div>
          <button class="cart-upsell-dismiss" data-upsell-dismiss aria-label="Dismiss"><i data-lucide="x"></i></button>
        </div>
      `;
      upsellEl.removeAttribute('hidden');
      upsellEl.querySelector('[data-upsell-add]').addEventListener('click', () => {
        Cart.add(u);
        Cart.dismissUpsell();
      });
      upsellEl.querySelector('[data-upsell-dismiss]').addEventListener('click', () => Cart.dismissUpsell());
    } else {
      upsellEl.setAttribute('hidden', '');
      upsellEl.innerHTML = '';
    }

    // Items
    const itemsEl = $('#cart-items');
    itemsEl.innerHTML = '';
    Cart.items.forEach(({ product, quantity }) => {
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <img src="${product.images[0]}" alt="${product.name}" />
        <div class="cart-item-body">
          <h4>${product.name}</h4>
          <p class="cart-item-sku">${product.sku}</p>
          <p class="cart-item-price">${window.formatPrice(product.price)}</p>
          <div class="cart-qty">
            <button data-qty-dec="${product.id}" aria-label="Decrease"><i data-lucide="minus"></i></button>
            <span>${quantity}</span>
            <button data-qty-inc="${product.id}" aria-label="Increase"><i data-lucide="plus"></i></button>
          </div>
        </div>
        <button class="cart-item-remove" data-cart-remove="${product.id}" aria-label="Remove"><i data-lucide="x"></i></button>
      `;
      itemsEl.appendChild(row);
    });

    // Bind quantity & remove buttons via delegation (replace listener)
    itemsEl.querySelectorAll('[data-qty-inc]').forEach(b =>
      b.addEventListener('click', () => {
        const id = b.dataset.qtyInc;
        const item = Cart.items.find(i => i.product.id === id);
        if (item) Cart.updateQuantity(id, item.quantity + 1);
      })
    );
    itemsEl.querySelectorAll('[data-qty-dec]').forEach(b =>
      b.addEventListener('click', () => {
        const id = b.dataset.qtyDec;
        const item = Cart.items.find(i => i.product.id === id);
        if (item) Cart.updateQuantity(id, item.quantity - 1);
      })
    );
    itemsEl.querySelectorAll('[data-cart-remove]').forEach(b =>
      b.addEventListener('click', () => Cart.remove(b.dataset.cartRemove))
    );

    // Footer (summary + checkout)
    const footer = $('#cart-footer');
    if (isEmpty) {
      footer.setAttribute('hidden', '');
    } else {
      footer.removeAttribute('hidden');
      $('#cart-subtotal').textContent = window.formatPrice(totals.subtotal);
      $('#cart-total').textContent    = window.formatPrice(totals.total);
      if (totals.discount > 0) {
        $('#cart-discount-row').removeAttribute('hidden');
        $('#cart-discount').textContent = '-' + window.formatPrice(totals.discount);
        const badge = $('#cart-discount-badge');
        badge.removeAttribute('hidden');
        badge.innerHTML = `<i data-lucide="tag"></i><span>Combo discount applied! You saved ${window.formatPrice(totals.discount)}</span>`;
      } else {
        $('#cart-discount-row').setAttribute('hidden', '');
        $('#cart-discount-badge').setAttribute('hidden', '');
      }
    }

    if (window.lucide) lucide.createIcons();
  },

  // The cart's "Proceed to Checkout" button just opens the checkout modal.
  checkout() {
    if (Cart.items.length === 0) return;
    Cart.close();
    Checkout.open();
  }
};


/* =====================================================================
   CHECKOUT — form, pincode lookup, tax + shipping, WhatsApp order
   ===================================================================== */
const Checkout = {
  init() {
    $('#checkout-modal-close').addEventListener('click', () => Checkout.close());
    $('.checkout-backdrop', $('#checkout-modal')).addEventListener('click', () => Checkout.close());
    $('#checkout-form').addEventListener('submit', (e) => Checkout.submit(e));
    $('#co-pincode').addEventListener('input', () => Checkout.onPincodeChange());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !$('#checkout-modal').hasAttribute('hidden')) Checkout.close();
    });

    // Order confirmation modal close
    $('#confirm-done').addEventListener('click', () => {
      $('#order-confirm-modal').setAttribute('hidden', '');
      document.body.style.overflow = '';
    });
    $('.checkout-backdrop', $('#order-confirm-modal')).addEventListener('click', () => {
      $('#order-confirm-modal').setAttribute('hidden', '');
      document.body.style.overflow = '';
    });
  },

  open() {
    Checkout.render();
    $('#checkout-modal').removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  },
  close() {
    $('#checkout-modal').setAttribute('hidden', '');
    document.body.style.overflow = '';
  },

  // Returns totals broken down: subtotal, comboDiscount, shipping, gst, total.
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
    // List the items
    const itemsEl = $('#checkout-items');
    itemsEl.innerHTML = Cart.items.map(({ product, quantity }) => `
      <div class="checkout-item">
        <img src="${product.images[0]}" alt="${product.name}" />
        <div class="checkout-item-info">
          <div class="checkout-item-name">${product.name}</div>
          <div class="checkout-item-qty">Qty ${quantity} × ${window.formatPrice(product.price)}</div>
        </div>
        <div class="checkout-item-price">${window.formatPrice(product.price * quantity)}</div>
      </div>
    `).join('');

    Checkout.recalc();
  },

  recalc() {
    const t = Checkout.totals();
    $('#co-subtotal').textContent = window.formatPrice(t.subtotal);
    $('#co-gst').textContent      = window.formatPrice(t.gst);
    $('#co-total').textContent    = window.formatPrice(t.total);

    if (t.comboDiscount > 0) {
      $('#co-discount-row').removeAttribute('hidden');
      $('#co-discount').textContent = '-' + window.formatPrice(t.comboDiscount);
    } else {
      $('#co-discount-row').setAttribute('hidden', '');
    }

    if (t.shipping === 0) {
      $('#co-shipping').textContent = 'FREE';
      $('#co-shipping-label').textContent = 'Shipping (free over ₹' + window.CONFIG.freeShippingThreshold + ')';
    } else {
      $('#co-shipping').textContent = window.formatPrice(t.shipping);
      $('#co-shipping-label').textContent = 'Shipping';
    }
  },

  onPincodeChange() {
    const pin = $('#co-pincode').value.trim();
    const status = $('#co-pincode-status');

    if (pin.length === 0) { status.textContent = ''; status.className = 'checkout-pincode-status'; return; }
    if (!/^[1-9][0-9]{5}$/.test(pin)) { status.textContent = 'Enter a valid 6-digit pincode'; status.className = 'checkout-pincode-status err'; return; }

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
    if (!form.checkValidity()) { form.reportValidity(); return; }

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
        id: product.id, name: product.name, sku: product.sku, price: product.price, quantity
      })),
      customer,
      totals: t,
      status: 'placed_via_whatsapp'
    };

    // Save to localStorage as a poor-man's order log (so you have a record on
    // this device even before a real backend exists). Real production should
    // POST this to a server.
    try {
      const all = JSON.parse(localStorage.getItem('rohilla-orders') || '[]');
      all.push(order);
      localStorage.setItem('rohilla-orders', JSON.stringify(all));
    } catch (e) { /* ignore quota */ }

    // Build the WhatsApp message
    const msg = Checkout.buildWhatsappMessage(order);
    const url = 'https://wa.me/' + window.CONFIG.whatsappNumber + '?text=' + encodeURIComponent(msg);

    // Open WhatsApp in a new tab. Popup blockers may stop this — that's why we
    // also show a confirmation modal with a copy-paste fallback.
    window.open(url, '_blank');

    // Show the confirmation modal (with fallback text)
    $('#confirm-order-id').textContent = orderId;
    $('#confirm-fallback-text').value = msg;
    Checkout.close();
    Cart.clear();
    $('#order-confirm-modal').removeAttribute('hidden');
    document.body.style.overflow = 'hidden';

    if (window.lucide) lucide.createIcons();
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
      lines.push('• ' + it.name + ' (' + it.sku + ')  ×' + it.quantity + '  — ' + window.formatPrice(it.price * it.quantity));
    });
    lines.push('');
    lines.push('*Bill:*');
    lines.push('Subtotal: ' + window.formatPrice(t.subtotal));
    if (t.comboDiscount > 0) lines.push('Combo discount: -' + window.formatPrice(t.comboDiscount));
    lines.push('Shipping: ' + (t.shipping === 0 ? 'FREE' : window.formatPrice(t.shipping)));
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
   GENERIC "REVEAL ON SCROLL" — uses IntersectionObserver
   Applies to any element with the .reveal class (and the auto-built
   product/recipe/gallery cards, since they have their own classes).
   ===================================================================== */
const Reveal = {
  init() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -100px 0px', threshold: 0.05 });

    $$('.reveal, .feature-card, .product-card, .gallery-item, .recipe-card').forEach(el => io.observe(el));
  }
};


/* =====================================================================
   LENIS — buttery smooth scrolling (optional; degrades gracefully)
   ===================================================================== */
const Smooth = {
  init() {
    // Lenis exposes itself a couple of different ways depending on bundle version
    const LenisCtor = window.Lenis || (window.lenis && window.lenis.Lenis);
    if (!LenisCtor) return;
    const lenis = new LenisCtor({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2
    });

    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    // Keep GSAP ScrollTrigger in sync
    if (window.ScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
  }
};


/* =====================================================================
   BOOT — run everything once the DOM is ready
   ===================================================================== */
function preloadCriticalImages() {
  const urls = [
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
    'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80',
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80'
  ];
  urls.forEach(u => { const i = new Image(); i.src = u; });
}

document.addEventListener('DOMContentLoaded', () => {
  preloadCriticalImages();

  Cart.load();

  Branding.init();
  Nav.init();
  Hero.init();
  Engineering.init();
  Collection.init();
  Gallery.init();
  ComboUI.init();
  Recipes.init();
  CartUI.init();
  Checkout.init();
  Reveal.init();
  Smooth.init();

  // Render all the lucide icons we inserted as <i data-lucide="..."></i>
  if (window.lucide) lucide.createIcons();
});
