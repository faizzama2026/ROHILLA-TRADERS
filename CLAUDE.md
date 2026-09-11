# Rohilla Spices website (rohillatraders.com)

A static D2C shop for **M/S Rohilla Traders**, a spice brand from Bareilly, UP. Plain HTML/CSS/JS with no build step and no framework. Orders go to **WhatsApp**; there is no payment backend yet.

Marketing strategy and brand context live in `F:\ROHILLA MARKETING` (see its CLAUDE.md).

## Hosting and deploy
- **Cloudflare Worker `rohilla-traders`** (static assets) in the **business** Cloudflare account (Faizzamaa@gmail.com). We chose Workers over Pages (same free, unlimited static requests; Workers is Cloudflare's recommended path).
- It auto-builds from GitHub **`faizzama2026/ROHILLA-TRADERS`** (`main`), deploy command `npx wrangler deploy`. Push = live in about 1 minute.
- Domain `rohillatraders.com` + `www`: registered at GoDaddy, nameservers on Cloudflare (`journey` / `olof.ns.cloudflare.com`), attached as Worker custom domains. DNS is managed in Cloudflare, not GoDaddy.
- **Access rule:** open the business Cloudflare and GitHub accounts only through Chrome, where they are logged in. The Cloudflare/GitHub MCP connectors are the user's *personal* accounts: never use or edit them for this site.
- This folder is **not a git repo**; the user uploads changed files to GitHub.
- `wrangler.jsonc` sets `assets.directory: "."`, so **every file here is public** unless listed in `.assetsignore`. Keep notes and secrets out of the folder, or add them to `.assetsignore`.

## File map
| File | What it holds |
|---|---|
| `data.js` | **Edit this first.** `CONFIG` (WhatsApp, email, address, FSSAI, GSTIN, GST rate, shipping, `multiBuy` discount, trust chips, Instagram), `PRODUCTS`, `RECIPES`, `ENGINEERING_FEATURES`, `PINCODES`, helpers (`getUpsellProduct`, `sizeLabel`) |
| `index.html` | Page order (mobile-first): header → hero (real pouches) → **Chef Special Combo** → Shop grid → How to Order → Why Rohilla → Recipes → footer. Plus sticky cart bar, floating WhatsApp button, toast, cart drawer, checkout, confirm and recipe pop-ups |
| `app.js` | `Branding`, `Cart`, `Buy` (Add → − n + stepper everywhere), `Nav`, `Hero`, `ComboSpot`, `Collection`, `Engineering`, `Recipes`, `Toast`, `CartUI` (drawer, cart bar, free-delivery bar), `Checkout` (totals, pincode, WhatsApp message) |
| `styles.css` | All styling, **mobile-first** (phone portrait is default; `min-width` media queries add tablet/desktop). Tokens at top: matte black `#0a0a0a`, gold `#BF953F`/`#FCF6BA`/`#B38728`, Playfair Display + Inter |
| `img/` | Optimised WebP product images (~50–130 KB each), made from `rohilla images/` with Python/Pillow: `<product>-100/-50.webp` (500w), `haldi/dhaniya/lal-mirch.webp` (360w), `chef-combo.webp` + `chef-combo-wide.webp` (composites), `hero-pouches.webp` (transparent fan), `og-image.jpg` (1200×630 share preview) |
| `rohilla images/` | Original ~3 MB label PNGs from the founders. **Not published** (in `.assetsignore`) |
| `legal/*.html` | Privacy, Terms, Shipping, Refund. They read contact/FSSAI/GSTIN from `CONFIG` via `data-*` spans |
| `.assetsignore` | Files kept off the public site |

CDN libraries: lucide icons (unpkg, `defer`), Google Fonts. GSAP and Lenis were removed on 12 Sep 2026 for speed.
**Cache-busting:** `index.html` loads `styles.css?v=N`, `data.js?v=N`, `app.js?v=N`. Bump `N` after every change so phones don't show a stale version.
Lucide replaces `<i data-lucide>` with `<svg class="lucide">`, so size icons with `svg.lucide` selectors (not `i`).

## Catalogue (12 Sep 2026)
| Product | Sizes / price |
|---|---|
| Tandoori Chicken, Nihari, Biryani Masala | 100 g ₹170 · 50 g MRP ₹99, offer ₹88 |
| Kebab Masala | 100 g ₹170 (a 50 g label exists but is not sold) |
| Garam Masala | 100 g MRP ₹150, offer ₹130 (stock photo, no pack image yet) |
| Chaat Masala | 100 g ₹99 (stock photo, no pack image yet) |
| Chef Special Combo (`prod_008`) | Haldi + Dhaniya + Lal Mirch, 3 × 100 g, MRP ₹250, offer ₹220 |
Curry Masala was removed (not in the catalogue). Sizes of one product share a `group` → one card with a size switch. `CONFIG.multiBuy` = 10% off 3+ pouches (template default, still to be confirmed by the founders).

## Business facts (from certificates, verified 11 Sep 2026)
- Legal name **M/S Rohilla Traders**, a **partnership** of Faiz Zama and Mohd Musab (both Partners). Grievance officer: Faiz Zama, Partner.
- Address: 14/15 Masjid Domani, Quilla, Bareilly, Uttar Pradesh 243001
- **FSSAI** State licence `12726009000155`, repacker / general manufacturing, valid to **02-05-2027** (renewal window opens 04-11-2026). Licensed categories: Lal Mirch, Dhaniya, Haldi, Curry Powder, Amchur, Mixed Masala. Don't add products outside these without a licence modification.
- **GSTIN** `09ABNFR2257C1Z3`
- Email `rohillatraders25@gmail.com` · WhatsApp/phone `+91 8218602698` (changed 12 Sep 2026)
- Instagram `@rohillaspices`

## Rules. These matter legally.
1. **No false or unverifiable claims.** They were removed on 11 Sep 2026; never add them back: FDA, "patented", nitrogen flushing, fixed shelf life or "freshness guarantee", recycled %, "master chefs", "hand-pounded/kute hue" (spices are **machine-ground**), "organic" (no NPOP certificate), health or protein claims about a masala.
2. **No fake social proof.** `rating`/`reviewCount` stay 0 until real reviews exist (the UI hides them at 0). `isBestseller` stays false until there is sales data.
3. **Prices are MRP including GST.** `Checkout.totals()` shows the GST *inside* the total; it never adds GST on top. `originalPrice` must be the real printed MRP, or `null`.
4. `nutritional_info` stays `null` unless copied exactly from the printed pouch label.
5. Placeholder values (`XXXX…`) auto-hide in the footer and Terms (`Branding.fillOrHide`). Don't show raw placeholders.
6. Use "FSSAI **Licensed**", never "Certified".
7. Never put personal data from licence PDFs (Aadhaar, personal mobiles, personal emails) on the site.

## Test locally
`.claude/launch.json` in `F:\ROHILLA MARKETING` defines **`rohilla-site`**: `python -m http.server 8765` serving this folder. Start it with the Browser pane's `preview_start`.
For true phone screenshots (375 px, touch, mobile UA) drive headless Edge over DevTools with Node 24's built-in WebSocket (`Emulation.setDeviceMetricsOverride`). Desktop Edge won't lay out below ~500 px, so plain `--window-size` isn't enough. Check:
- console has no errors; `node --check data.js app.js` passes
- checkout math, e.g. 1 × Tandoori 50 g ₹88 + Chef Combo ₹220 → delivery ₹49 → **total ₹357**, GST ₹17 inside
- Add → stepper → sticky cart bar → drawer → checkout → WhatsApp message goes to 918218602698
- footer shows FSSAI + GSTIN; legal pages fill from `CONFIG`

A backup of the pre-11-Sep version was kept in the Claude scratchpad (session-only).

## Open items
- **Pack images:** Garam and Chaat Masala still use stock photos. Recipe photos are Unsplash. The label art says "Trusted by generations" and uses a placeholder barcode `8906123456789`; real GS1 barcodes are needed before marketplaces.
- **Multi-buy 10% off 3+ pouches:** confirm the founders want it (it also stacks on the combo and 50 g offer prices). Set `CONFIG.multiBuy.percent = 0` to turn it off.
- COD availability and the ₹30 COD fee, and free shipping ≥ ₹500: confirm policy (they appear in `legal/shipping.html` and `CONFIG`).
- Online payment: the Razorpay button was removed from checkout (needs a backend). `CONFIG.razorpayKeyId` is a placeholder.
- Orders are only logged to the customer's `localStorage` plus the WhatsApp message. There is no server-side order record.
