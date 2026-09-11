/* =====================================================================
   ===========  EDIT THIS BLOCK FIRST — BUSINESS CONFIG  ===============
   These are the values your brother MUST change before going live.
   ===================================================================== */
window.CONFIG = {
  // The number that receives WhatsApp orders. International format, no "+", no spaces.
  // Example for an Indian mobile: '918218602698' (91 = India, then 10 digits).
  whatsappNumber: '918218602698',

  // Email shown in footer and used as fallback if WhatsApp is unavailable.
  contactEmail: 'rohillatraders25@gmail.com',
  contactPhone: '+91 8218602698',
  contactAddress: '14/15 Masjid Domani, Quilla, Bareilly, Uttar Pradesh 243001',

  // Required for selling packaged food in India. Get from fssai.gov.in.
  // Displayed on legal pages and in the footer. While a value is still
  // 'XXXX…', the website hides it instead of showing the placeholder.
  fssaiLicense: '12726009000155',          // State licence, valid till 02-05-2027 — renew from 04-11-2026 (180 days before)
  gstin: '09ABNFR2257C1Z3',                // GST registration from 18-02-2026
  companyLegalName: 'M/S Rohilla Traders', // partnership firm
  grievanceOfficer: 'Faiz Zama, Partner',

  // Tax & shipping rules.
  // Prices in PRODUCTS are MRP INCLUSIVE of GST (required by Legal Metrology
  // rules in India). Checkout only shows how much of the total is GST — it
  // never adds GST on top of the price.
  gstRate: 0.05,                           // 5% GST on branded packaged spices (HSN 0904-0910)
  freeShippingThreshold: 500,              // free shipping above this cart total (in ₹)
  shippingCost: 49,                        // flat shipping fee below threshold (in ₹)

  // Razorpay key (LIVE) — leave as 'rzp_test_your_key_here' until you have a real
  // backend that creates the order. The browser-only flow currently in app.js is
  // for demo only and will NOT charge real money.
  razorpayKeyId: 'rzp_test_your_key_here',

  // Trust badges shown in the hero. Keep them HONEST — replace as you grow.
  trustIndicators: [
    { value: 'FSSAI',         label: 'Licensed' },
    { value: 'Zero',          label: 'Added Colour' },
    { value: 'Bareilly',      label: 'Blended & Packed' }
  ],

  // Social links shown in the footer. Leave '' to hide an icon.
  instagramUrl: 'https://www.instagram.com/rohillaspices/'
};

/* =====================================================================
   DATA FILE — Edit your products and recipes here.
   This is the ONLY file you need to change to add/remove a product,
   update a price, change a photo, or edit a recipe.

   FIELD GUIDE (Products):
     id              unique identifier (must start with "prod_")
     name            displayed product name
     sku             stock-keeping code shown under the name
     price           selling price in INR (integer, no decimals)
     originalPrice   the "strike-through" price (set null to hide)
     stock_quantity  inventory count (display only)
     description     long description (used on detail/modal screens)
     shortDescription   one-liner under product name on cards
     nutritional_info   { servingSize, calories, protein, carbohydrates, fat, sodium, ingredients[] }
                       — or null. Only fill this from the printed pouch label, never estimate.
     images          array of image URLs (first one shows on the card)
     weight_g        weight in grams (shown on the card)
     sizeLabel       optional text shown instead of "100g" (e.g. '3 × 100g')
     group           entries with the same group become ONE card with a size switch
     inComboBuilder  false → not offered in the "Build Your Box" section
     category        slug like "kebab-masala" — used for upsell logic
     tags            array of marketing tags
     rating          0–5
     reviewCount     integer
     isBestseller    true → shows "Bestseller" badge
     isNew           true → shows "New" badge

   FIELD GUIDE (Recipes):
     id, title, description, image
     prepTime / cookTime  (minutes)
     servings
     difficulty           "Easy" | "Medium" | "Hard"
     ingredients          array of strings
     instructions         array of strings (numbered automatically)
     relatedProductIds    array of product IDs this recipe uses
   ===================================================================== */

/* NOTE on ratings / reviewCount:
   Default `rating: 0` and `reviewCount: 0` for a brand-new shop. The UI hides the
   rating row when reviewCount is 0, so cards look clean. As real customers buy
   and review, update these honestly. DO NOT seed fake reviews — it's against
   ASCI guidelines in India and customers always notice. */

/* Each entry below is ONE sellable pouch (one size = one entry).
   Entries with the same `group` show as ONE card on the website with a
   size switch (e.g. 100g / 50g). The first entry of a group is the size
   selected by default. */

// Shared text for products that come in two sizes
const TANDOORI = {
  name: 'Tandoori Chicken Masala',
  description: 'A smoky, full-flavoured tandoori blend for chicken, paneer, soya chunks and fish. Works in a tandoor, oven, pan or air fryer. The red colour comes from the spices themselves: no added colour, no preservatives. A free scoop comes inside every pouch.',
  shortDescription: 'Smoky tandoori blend — great in the air fryer too',
  images: [
    'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80',
    'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&q=80'
  ],
  group: 'tandoori', category: 'tandoori-masala',
  tags: ['tandoor','grilling','air-fryer','meal-prep']
};
const BIRYANI = {
  name: 'Biryani Masala',
  description: 'An aromatic blend for chicken and mutton dum biryani, made the Rohilkhand way. Blended and packed in Bareilly with 100% natural ingredients, no added colour and no preservatives. A free scoop comes inside every pouch.',
  shortDescription: 'Aromatic blend for chicken & mutton dum biryani',
  images: [
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
    'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80'
  ],
  group: 'biryani', category: 'biryani-masala',
  tags: ['biryani','dum','rohilkhand','fragrant']
};
const NIHARI = {
  name: 'Nihari Masala',
  description: 'For rich, slow-cooked nihari the way Bareilly makes it: a weekend breakfast and a winter favourite. Blended and packed in Bareilly with 100% natural ingredients, no added colour and no preservatives. A free scoop comes inside every pouch.',
  shortDescription: 'For slow-cooked, Bareilly-style nihari',
  images: [
    'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&q=80',
    'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80'
  ],
  group: 'nihari', category: 'nihari-masala',
  tags: ['nihari','bareilly','slow-cooked','authentic']
};

// Defaults every pouch shares
const POUCH = { stock_quantity: 0, nutritional_info: null, rating: 0, reviewCount: 0, isBestseller: false, isNew: false, inComboBuilder: true };

window.PRODUCTS = [
  // ---------------- Tandoori Chicken Masala: 100g + 50g ----------------
  { ...POUCH, ...TANDOORI, id: 'prod_002',    sku: 'TAND-100', weight_g: 100, price: 170, originalPrice: null },
  { ...POUCH, ...TANDOORI, id: 'prod_002_50', sku: 'TAND-50',  weight_g: 50,  price: 88,  originalPrice: 99, inComboBuilder: false },

  // ---------------- Kebab Masala: 100g ----------------
  {
    ...POUCH,
    id: 'prod_001',
    name: 'Kebab Masala',
    sku: 'KEBAB-100',
    weight_g: 100,
    price: 170,
    originalPrice: null,
    description: 'Our Kebab Masala is blended and packed in Bareilly for seekh, shami and galouti kebabs, the way they are made across Rohilkhand. 100% natural ingredients, with no added colour and no preservatives. A free scoop comes inside every pouch.',
    shortDescription: 'Rohilkhand-style blend for seekh & shami kebabs',
    images: [
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
      'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80'
    ],
    group: 'kebab', category: 'kebab-masala',
    tags: ['grilling','bbq','kebab','rohilkhand']
  },

  // ---------------- Nihari Masala: 100g + 50g ----------------
  { ...POUCH, ...NIHARI, id: 'prod_004',    sku: 'NIHA-100', weight_g: 100, price: 170, originalPrice: null },
  { ...POUCH, ...NIHARI, id: 'prod_004_50', sku: 'NIHA-50',  weight_g: 50,  price: 88,  originalPrice: 99, inComboBuilder: false },

  // ---------------- Biryani Masala: 100g + 50g ----------------
  { ...POUCH, ...BIRYANI, id: 'prod_003',    sku: 'BIRY-100', weight_g: 100, price: 170, originalPrice: null },
  { ...POUCH, ...BIRYANI, id: 'prod_003_50', sku: 'BIRY-50',  weight_g: 50,  price: 88,  originalPrice: 99, inComboBuilder: false },

  // ---------------- Garam Masala: 100g ----------------
  {
    ...POUCH,
    id: 'prod_005',
    name: 'Garam Masala',
    sku: 'GARA-100',
    weight_g: 100,
    price: 130,
    originalPrice: 150,
    description: 'An aromatic everyday blend to finish dals, sabzis and meat curries. Blended and packed in Bareilly with 100% natural ingredients, no added colour and no preservatives.',
    shortDescription: 'Aromatic finishing blend for everyday cooking',
    images: [
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80',
      'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=800&q=80'
    ],
    group: 'garam', category: 'garam-masala',
    tags: ['everyday','aromatic','classic']
  },

  // ---------------- Chaat Masala: 100g ----------------
  {
    ...POUCH,
    id: 'prod_007',
    name: 'Chaat Masala',
    sku: 'CHAT-100',
    weight_g: 100,
    price: 99,
    originalPrice: null,
    description: 'Tangy chaat masala for fruit chaat, aloo chaat, raita, salads, chaas and fries. Blended and packed in Bareilly with no added colour and no preservatives.',
    shortDescription: 'Tangy sprinkle for chaat, fruits, raita & fries',
    images: [
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80',
      'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80'
    ],
    group: 'chaat', category: 'chaat-masala',
    tags: ['chaat','tangy','snacks'],
    isNew: true
  },

  // ---------------- Chef Special Combo: Haldi + Dhaniya + Lal Mirch ----------------
  {
    ...POUCH,
    id: 'prod_008',
    name: 'Chef Special Combo',
    sku: 'COMBO-HDM-300',
    weight_g: 300,
    sizeLabel: '3 × 100g',
    price: 220,
    originalPrice: 250,
    description: 'The three everyday essentials in one pack: Haldi (turmeric), Dhaniya (coriander) and Lal Mirch (red chilli) powder, 100g each (300g total). Pure single spices with no added colour and no preservatives.',
    shortDescription: 'Haldi + Dhaniya + Lal Mirch, 100g each',
    images: [
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80'
    ],
    group: 'chef-combo', category: 'pure-spices',
    tags: ['haldi','dhaniya','lal-mirch','combo'],
    isNew: true,
    inComboBuilder: false   // already a combo, so it isn't offered inside "Build Your Box"
  }
];

window.RECIPES = [
  {
    id: 'rec_001',
    title: 'Galouti Kebab',
    description: 'The legendary melt-in-your-mouth kebabs from Lucknow, perfected with our signature blend.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80',
    prepTime: 45, cookTime: 20, servings: 4, difficulty: 'Medium',
    ingredients: ['500g finely minced lamb','3 tbsp ROHILLA Kebab Masala','2 tbsp raw papaya paste','1/4 cup fried onion paste','2 tbsp ghee','Saffron strands (optional)','Rose petals for garnish'],
    instructions: ['Marinate minced lamb with papaya paste for 2 hours','Add Kebab Masala and fried onion paste, mix thoroughly','Let it rest for another hour in the refrigerator','Shape into flat patties','Cook on a hot griddle with ghee until golden brown','Garnish with saffron and rose petals'],
    relatedProductIds: ['prod_001']
  },
  {
    id: 'rec_002',
    title: 'Tandoori Chicken',
    description: 'The classic Punjabi dish that needs no introduction. Smoky, spicy, and utterly delicious.',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80',
    prepTime: 30, cookTime: 40, servings: 4, difficulty: 'Easy',
    ingredients: ['1 kg chicken, cut into pieces','4 tbsp ROHILLA Tandoori Chicken Masala','1 cup hung curd','2 tbsp lemon juice','2 tbsp mustard oil','Butter for basting'],
    instructions: ['Make deep cuts in the chicken pieces','Mix Tandoori Masala with curd, lemon juice, and mustard oil','Marinate chicken for at least 4 hours, preferably overnight','Cook in a preheated oven at 220°C for 35-40 minutes (or air-fry at 200°C for 18-20 minutes, turning once)','Baste with butter halfway through (skip it for a lighter meal-prep version)','Serve hot with mint chutney and onion rings'],
    relatedProductIds: ['prod_002']
  },
  {
    id: 'rec_003',
    title: 'Hyderabadi Biryani',
    description: 'A royal feast of fragrant rice and tender meat, layered with love and saffron.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
    prepTime: 60, cookTime: 90, servings: 6, difficulty: 'Hard',
    ingredients: ['1 kg basmati rice','800g lamb or chicken','4 tbsp ROHILLA Biryani Masala','2 cups fried onions','1 cup yogurt','Saffron milk','Ghee and oil','Fresh mint and coriander'],
    instructions: ['Marinate meat with Biryani Masala and yogurt for 4 hours','Parboil rice with whole spices','Layer marinated meat and rice in a heavy-bottomed pot','Sprinkle fried onions, saffron milk, and herbs between layers','Seal the pot with dough and cook on dum for 45 minutes','Let it rest for 10 minutes before serving'],
    relatedProductIds: ['prod_003']
  },
  {
    id: 'rec_004',
    title: 'Nihari',
    description: 'The breakfast of champions. A slow-cooked stew that warms the soul.',
    image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&q=80',
    prepTime: 20, cookTime: 360, servings: 6, difficulty: 'Medium',
    ingredients: ['1 kg beef or mutton shanks (nalli)','5 tbsp ROHILLA Nihari Masala','1/2 cup wheat flour','1 cup fried onions','Ginger juliennes','Fresh coriander','Green chillies'],
    instructions: ['Brown the beef shanks in a large pot','Add Nihari Masala and fry for 2 minutes','Add water and simmer on low heat for 5-6 hours','Mix wheat flour with water to make a slurry','Add slurry to thicken the gravy','Garnish with ginger, coriander, and green chillies'],
    relatedProductIds: ['prod_004']
  },
  {
    id: 'rec_005',
    title: 'Aloo Chaat',
    description: 'Crispy, tangy street-style aloo chaat, ready in 20 minutes.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80',
    prepTime: 10, cookTime: 15, servings: 2, difficulty: 'Easy',
    ingredients: ['4 boiled potatoes, cubed','1 tsp ROHILLA Chaat Masala (plus extra to sprinkle)','1/2 tsp ROHILLA Lal Mirch','1 tbsp oil','1 small onion, finely chopped','Green chutney and tamarind chutney','Lemon juice and fresh coriander'],
    instructions: ['Pan-fry or air-fry the potato cubes until golden and crisp','Toss the hot potatoes with Chaat Masala and Lal Mirch','Add onion, both chutneys and a squeeze of lemon','Sprinkle more Chaat Masala and coriander on top','Serve immediately while crisp'],
    relatedProductIds: ['prod_007', 'prod_008']
  }
];

/* =====================================================================
   GALLERY IMAGES — edit the photos in the "Gallery" section here.
   Set "span" to "row-span-2" to make a tile twice as tall.
   ===================================================================== */
window.GALLERY = [
  { src: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80', alt: 'Red Chilli Powder Macro', title: 'The Fire',        span: 'row-span-2' },
  { src: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80', alt: 'Tandoori Chicken',         title: 'The Creation',    span: '' },
  { src: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80', alt: 'Biryani',                  title: 'The Feast',       span: 'row-span-2' },
  { src: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80', alt: 'Spice Collection',         title: 'The Arsenal',     span: '' },
  { src: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80', alt: 'Kebab Platter',            title: 'The Masterpiece', span: '' },
  { src: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80', alt: 'Curry Bowl',               title: 'The Comfort',     span: 'row-span-2' }
];

/* =====================================================================
   ENGINEERING FEATURES — the four cards in the "Engineered for Excellence"
   section. `icon` matches a lucide icon name (https://lucide.dev/icons).
   ===================================================================== */
/* Only list things that are TRUE about how you make and pack the spices. */
window.ENGINEERING_FEATURES = [
  { icon: 'blend',    title: 'Uniform Blending', description: 'Every masala is mixed in a ribbon blender, so each spoonful tastes the same as the last.',                spec: 'Ribbon Blender' },
  { icon: 'scale',    title: 'Weighed, Not Guessed', description: 'Each pouch is filled on a digital scale, so you get the full net weight printed on the pack.',         spec: 'Digital Weighing' },
  { icon: 'lock',     title: 'Heat-Sealed Pouch', description: 'Matte, heat-sealed stand-up pouches keep out moisture and hold in aroma. A free scoop is packed inside.', spec: 'Band-Sealed' },
  { icon: 'scan-line', title: 'Batch Coded',     description: 'Batch number, packing date and best-before are printed on every pouch, so every pack can be traced.',  spec: 'Traceable' }
];

/* =====================================================================
   SERVICEABLE PINCODES — used at checkout to estimate delivery.
   For each pincode listed, the customer sees "Delivers in X days".
   Pincodes NOT in this map will see "Pan-India COD delivery — your
   courier partner will contact you within 24 hours."
   Tip: most small Indian D2C brands start by listing only metros and
   their home state, then expand as Shiprocket / Delhivery confirm
   serviceability. Add more as you onboard couriers.
   ===================================================================== */
window.PINCODES = {
  // Bareilly (home base)
  '243001': { city: 'Bareilly',   state: 'Uttar Pradesh', days: 1 },
  '243003': { city: 'Bareilly',   state: 'Uttar Pradesh', days: 1 },
  '243005': { city: 'Bareilly',   state: 'Uttar Pradesh', days: 1 },
  // Major metros
  '110001': { city: 'New Delhi',  state: 'Delhi',         days: 3 },
  '400001': { city: 'Mumbai',     state: 'Maharashtra',   days: 4 },
  '560001': { city: 'Bangalore',  state: 'Karnataka',     days: 5 },
  '600001': { city: 'Chennai',    state: 'Tamil Nadu',    days: 5 },
  '700001': { city: 'Kolkata',    state: 'West Bengal',   days: 5 },
  '500001': { city: 'Hyderabad',  state: 'Telangana',     days: 5 },
  '380001': { city: 'Ahmedabad',  state: 'Gujarat',       days: 4 },
  '411001': { city: 'Pune',       state: 'Maharashtra',   days: 4 },
  '302001': { city: 'Jaipur',     state: 'Rajasthan',     days: 3 },
  '226001': { city: 'Lucknow',    state: 'Uttar Pradesh', days: 2 },
  '141001': { city: 'Ludhiana',   state: 'Punjab',        days: 3 },
  '160001': { city: 'Chandigarh', state: 'Chandigarh',    days: 3 },
  '682001': { city: 'Kochi',      state: 'Kerala',        days: 6 }
};

/* =====================================================================
   HELPERS — used by app.js. Normally no need to touch these.
   ===================================================================== */
window.formatPrice = function (n) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(n);
};

window.formatDiscount = function (price, originalPrice) {
  const d = Math.round(((originalPrice - price) / originalPrice) * 100);
  return d + '% OFF';
};

window.getProductById = function (id) {
  return window.PRODUCTS.find(p => p.id === id);
};

// Smart upsell mapping — what to suggest when a product is added to cart.
// Suggests the first (default-size) pouch of the paired category.
const UPSELL_PAIRS = {
  'kebab-masala':    'tandoori-masala',
  'tandoori-masala': 'kebab-masala',
  'biryani-masala':  'garam-masala',
  'nihari-masala':   'garam-masala',
  'garam-masala':    'pure-spices',
  'chaat-masala':    'pure-spices',
  'pure-spices':     'chaat-masala'
};
window.getUpsellProduct = function (productId) {
  const product = window.getProductById(productId);
  if (!product) return null;
  const pair = UPSELL_PAIRS[product.category];
  return (pair && window.PRODUCTS.find(p => p.category === pair)) || null;
};

// Size label shown on cards, cart and orders ("100g", "3 × 100g")
window.sizeLabel = function (product) {
  return product.sizeLabel || (product.weight_g + 'g');
};
