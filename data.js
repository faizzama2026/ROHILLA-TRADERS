/* =====================================================================
   ===========  EDIT THIS BLOCK FIRST — BUSINESS CONFIG  ===============
   These are the values your brother MUST change before going live.
   ===================================================================== */
window.CONFIG = {
  // The number that receives WhatsApp orders. International format, no "+", no spaces.
  // Example for an Indian mobile: '919997055377' (91 = India, then 10 digits).
  whatsappNumber: '919997055377',

  // Email shown in footer and used as fallback if WhatsApp is unavailable.
  contactEmail: 'hello@rohilla.com',
  contactPhone: '+91 9997055377',
  contactAddress: '123 Spice Market, Bareilly, UP 243003',

  // Required for selling packaged food in India. Get from fssai.gov.in.
  // Displayed on legal pages and order confirmations.
  fssaiLicense: 'XXXXXXXXXXXXXX',          // 14-digit number
  gstin: 'XXXXXXXXXXXXXXX',                // 15-character GSTIN; leave as XXX if not registered yet
  companyLegalName: 'ROHILLA Traders',     // legal entity name (proprietorship/pvt ltd etc.)

  // Tax & shipping rules.
  gstRate: 0.05,                           // 5% GST on branded packaged spices (HSN 0904-0910)
  freeShippingThreshold: 500,              // free shipping above this cart total (in ₹)
  shippingCost: 49,                        // flat shipping fee below threshold (in ₹)

  // Razorpay key (LIVE) — leave as 'rzp_test_your_key_here' until you have a real
  // backend that creates the order. The browser-only flow currently in app.js is
  // for demo only and will NOT charge real money.
  razorpayKeyId: 'rzp_test_your_key_here',

  // Trust badges shown in the hero. Keep them HONEST — replace as you grow.
  trustIndicators: [
    { value: 'FSSAI',         label: 'Certified Food' },
    { value: '100%',          label: 'Natural Spices' },
    { value: 'Bareilly',      label: 'Made in India' }
  ]
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
     images          array of image URLs (first one shows on the card)
     weight_g        weight in grams (shown on the card)
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

window.PRODUCTS = [
  {
    id: 'prod_001',
    name: 'Kebab Masala',
    sku: 'KEBAB-100',
    price: 249,
    originalPrice: 299,
    stock_quantity: 500,
    description: 'An artisanal blend of 18 premium spices, meticulously roasted and ground to perfection. Our Kebab Masala delivers an authentic Lucknowi flavor profile with notes of mace, nutmeg, and hand-picked Kashmiri chillies. Each pouch contains our patented integrated dosing scoop for precise 5g measurements.',
    shortDescription: 'Authentic Lucknowi blend with 18 premium spices',
    nutritional_info: {
      servingSize: '5g', calories: 15, protein: 0.5, carbohydrates: 2.5, fat: 0.3, sodium: 180,
      ingredients: ['Coriander','Cumin','Kashmiri Red Chilli','Black Cardamom','Green Cardamom','Cinnamon','Cloves','Mace','Nutmeg','Black Pepper','Bay Leaf','Stone Flower','Dried Ginger','Turmeric','Fennel','Star Anise','Shahi Jeera','Salt']
    },
    images: [
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
      'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
      'https://images.unsplash.com/photo-1606843047913-8b5a0f7e4e6a?w=800&q=80'
    ],
    weight_g: 100,
    category: 'kebab-masala',
    tags: ['grilling','bbq','mughlai','premium'],
    rating: 0,
    reviewCount: 0,
    isBestseller: true,
    isNew: false
  },
  {
    id: 'prod_002',
    name: 'Tandoori Masala',
    sku: 'TAND-100',
    price: 229,
    originalPrice: 279,
    stock_quantity: 450,
    description: 'The crown jewel of Punjabi cuisine. Our Tandoori Masala combines the smoky intensity of charred spices with the vibrant hue of Kashmiri chillies. Perfect for tandoori chicken, paneer tikka, and oven-roasted vegetables.',
    shortDescription: 'Smoky Punjabi blend for authentic tandoori flavor',
    nutritional_info: {
      servingSize: '5g', calories: 12, protein: 0.4, carbohydrates: 2.0, fat: 0.2, sodium: 200,
      ingredients: ['Kashmiri Red Chilli','Coriander','Cumin','Black Salt','Dried Mango Powder','Ginger','Garlic','Kasuri Methi','Turmeric','Black Pepper','Cinnamon','Cloves','Nutmeg','Mace','Salt']
    },
    images: [
      'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80',
      'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&q=80',
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80'
    ],
    weight_g: 100,
    category: 'tandoori-masala',
    tags: ['tandoor','grilling','punjabi','smoky'],
    rating: 0,
    reviewCount: 0,
    isBestseller: true,
    isNew: false
  },
  {
    id: 'prod_003',
    name: 'Biryani Masala',
    sku: 'BIRY-100',
    price: 269,
    originalPrice: 329,
    stock_quantity: 380,
    description: 'A royal blend that transforms ordinary rice into a fragrant masterpiece. Our Biryani Masala features saffron-infused notes, rose petals, and the rare kewra water essence. Each grain tells a story of Hyderabad\'s culinary heritage.',
    shortDescription: 'Royal Hyderabadi blend with saffron and rose',
    nutritional_info: {
      servingSize: '5g', calories: 18, protein: 0.6, carbohydrates: 3.0, fat: 0.4, sodium: 160,
      ingredients: ['Shahi Jeera','Black Cumin','Mace','Nutmeg','Green Cardamom','Black Cardamom','Cloves','Cinnamon','Bay Leaf','Saffron','Dried Rose Petals','Kewra','Star Anise','Stone Flower','Coriander','Salt']
    },
    images: [
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
      'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80',
      'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800&q=80'
    ],
    weight_g: 100,
    category: 'biryani-masala',
    tags: ['biryani','hyderabadi','royal','fragrant'],
    rating: 0,
    reviewCount: 0,
    isBestseller: true,
    isNew: false
  },
  {
    id: 'prod_004',
    name: 'Nihari Masala',
    sku: 'NIHA-100',
    price: 289,
    originalPrice: 349,
    stock_quantity: 320,
    description: 'The secret behind Delhi\'s legendary morning delicacy. Our Nihari Masala is a complex blend of 24 spices, including the rare paan ki jad and sandalwood powder. Slow-cooked perfection in every spoonful.',
    shortDescription: 'Delhi-style blend with 24 rare spices',
    nutritional_info: {
      servingSize: '5g', calories: 20, protein: 0.7, carbohydrates: 3.2, fat: 0.5, sodium: 220,
      ingredients: ['Wheat Flour','Coriander','Cumin','Fennel','Ginger','Turmeric','Red Chilli','Black Pepper','Cloves','Cinnamon','Cardamom','Mace','Nutmeg','Bay Leaf','Paan Ki Jad','Sandalwood Powder','Dried Mint','Salt']
    },
    images: [
      'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&q=80',
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80',
      'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80'
    ],
    weight_g: 100,
    category: 'nihari-masala',
    tags: ['nihari','delhi','slow-cooked','authentic'],
    rating: 0,
    reviewCount: 0,
    isBestseller: false,
    isNew: true
  },
  {
    id: 'prod_005',
    name: 'Garam Masala',
    sku: 'GARA-100',
    price: 199,
    originalPrice: 249,
    stock_quantity: 600,
    description: 'The foundation of Indian cooking. Our Garam Masala is hand-blended in small batches using whole spices roasted at precise temperatures. A universal seasoning that elevates any dish.',
    shortDescription: 'Hand-blended universal Indian seasoning',
    nutritional_info: {
      servingSize: '3g', calories: 10, protein: 0.3, carbohydrates: 1.8, fat: 0.2, sodium: 140,
      ingredients: ['Black Cardamom','Green Cardamom','Cinnamon','Cloves','Black Pepper','Cumin','Coriander','Bay Leaf','Nutmeg','Mace']
    },
    images: [
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80',
      'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=800&q=80'
    ],
    weight_g: 100,
    category: 'garam-masala',
    tags: ['universal','essential','aromatic','classic'],
    rating: 0,
    reviewCount: 0,
    isBestseller: true,
    isNew: false
  },
  {
    id: 'prod_006',
    name: 'Curry Masala',
    sku: 'CURR-100',
    price: 219,
    originalPrice: 269,
    stock_quantity: 420,
    description: 'Your everyday curry companion. A balanced blend that delivers consistent, restaurant-quality results. From butter chicken to vegetable korma, this is your secret weapon.',
    shortDescription: 'Everyday curry blend for restaurant-quality results',
    nutritional_info: {
      servingSize: '5g', calories: 16, protein: 0.5, carbohydrates: 2.8, fat: 0.3, sodium: 190,
      ingredients: ['Coriander','Turmeric','Cumin','Red Chilli','Fenugreek','Mustard Seeds','Curry Leaves','Black Pepper','Ginger','Garlic','Onion Powder','Tomato Powder','Salt']
    },
    images: [
      'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80',
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
      'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80'
    ],
    weight_g: 100,
    category: 'curry-masala',
    tags: ['curry','everyday','versatile','essential'],
    rating: 0,
    reviewCount: 0,
    isBestseller: false,
    isNew: false
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
    ingredients: ['1 kg chicken, cut into pieces','4 tbsp ROHILLA Tandoori Masala','1 cup hung curd','2 tbsp lemon juice','2 tbsp mustard oil','Butter for basting'],
    instructions: ['Make deep cuts in the chicken pieces','Mix Tandoori Masala with curd, lemon juice, and mustard oil','Marinate chicken for at least 4 hours, preferably overnight','Cook in a preheated oven at 220°C for 35-40 minutes','Baste with butter halfway through','Serve hot with mint chutney and onion rings'],
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
    ingredients: ['1 kg beef shanks','5 tbsp ROHILLA Nihari Masala','1/2 cup wheat flour','1 cup fried onions','Ginger juliennes','Fresh coriander','Green chillies'],
    instructions: ['Brown the beef shanks in a large pot','Add Nihari Masala and fry for 2 minutes','Add water and simmer on low heat for 5-6 hours','Mix wheat flour with water to make a slurry','Add slurry to thicken the gravy','Garnish with ginger, coriander, and green chillies'],
    relatedProductIds: ['prod_004']
  },
  {
    id: 'rec_005',
    title: 'Butter Chicken',
    description: 'The crown jewel of Punjabi cuisine. Creamy, tomatoey perfection.',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80',
    prepTime: 40, cookTime: 45, servings: 4, difficulty: 'Medium',
    ingredients: ['800g chicken, boneless','3 tbsp ROHILLA Curry Masala','2 cups tomato puree','1 cup fresh cream','4 tbsp butter','2 tbsp honey','Kasuri methi'],
    instructions: ['Marinate chicken with half the Curry Masala and yogurt','Grill or pan-fry the chicken until cooked','In a separate pan, melt butter and add tomato puree','Add remaining Curry Masala and simmer for 20 minutes','Add cream, honey, and grilled chicken','Finish with kasuri methi and a dollop of butter'],
    relatedProductIds: ['prod_006']
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
window.ENGINEERING_FEATURES = [
  { icon: 'ruler',    title: 'Precision Dosing', description: 'Integrated 5g scoop ensures perfect measurements every time. No guesswork, just consistency.', spec: '±0.1g Accuracy' },
  { icon: 'droplets', title: 'Aroma Lock',       description: 'Triple-layer barrier technology preserves volatile oils and maintains freshness for 24 months.', spec: '99.9% Sealed' },
  { icon: 'shield',   title: 'Food Safe',        description: 'BPA-free, food-grade materials. FDA approved and rigorously tested for safety.',                spec: 'FDA Certified' },
  { icon: 'package',  title: 'Sustainable',      description: 'Recyclable packaging made from 70% post-consumer materials. Good for you, better for Earth.',   spec: '70% Recycled' }
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

// Smart upsell mapping — what to suggest when a product is added to cart
window.getUpsellProduct = function (productId) {
  const product = window.getProductById(productId);
  if (!product) return null;
  if (product.category === 'kebab-masala')     return window.PRODUCTS.find(p => p.category === 'tandoori-masala');
  if (product.category === 'tandoori-masala')  return window.PRODUCTS.find(p => p.category === 'kebab-masala');
  if (product.category === 'biryani-masala')   return window.PRODUCTS.find(p => p.category === 'garam-masala');
  return window.PRODUCTS.find(p => p.isBestseller && p.id !== productId) || null;
};
