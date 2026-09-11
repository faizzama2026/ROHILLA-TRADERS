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
| `data.js` | **Edit this first.** `CONFIG` (WhatsApp, email, address, FSSAI, GSTIN, GST rate, shipping, trust badges, Instagram), `PRODUCTS`, `RECIPES`, `GALLERY`, `ENGINEERING_FEATURES`, `PINCODES`, helpers |
| `index.html` | Page layout: nav, hero, engineering x-ray, collection, gallery, combo builder, recipes, footer, cart drawer, checkout + confirm + recipe modals |
| `app.js` | Behaviour: `Branding`, `Nav`, `Hero`, `Engineering`, `Collection`, `Gallery`, `ComboUI`, `Recipes`, `CartUI`, `Checkout` (totals, pincode, WhatsApp message), `Reveal`, `Smooth` |
| `styles.css` | All styling. Tokens at top: matte black `#0a0a0a`, gold `#BF953F`/`#FCF6BA`/`#B38728`, Playfair Display + Inter |
| `legal/*.html` | Privacy, Terms, Shipping, Refund. They read contact/FSSAI/GSTIN from `CONFIG` via `data-*` spans |
| `.assetsignore` | Files kept off the public site |

CDN libraries: lucide (unpkg), GSAP + ScrollTrigger, Lenis (jsdelivr), Google Fonts.

## Business facts (from certificates, verified 11 Sep 2026)
- Legal name **M/S Rohilla Traders**, a **partnership** of Faiz Zama and Mohd Musab (both Partners). Grievance officer: Faiz Zama, Partner.
- Address: 14/15 Masjid Domani, Quilla, Bareilly, Uttar Pradesh 243001
- **FSSAI** State licence `12726009000155`, repacker / general manufacturing, valid to **02-05-2027** (renewal window opens 04-11-2026). Licensed categories: Lal Mirch, Dhaniya, Haldi, Curry Powder, Amchur, Mixed Masala. Don't add products outside these without a licence modification.
- **GSTIN** `09ABNFR2257C1Z3`
- Email `rohillatraders25@gmail.com` · WhatsApp/phone `+91 9997055377`
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
`.claude/launch.json` in `F:\ROHILLA MARKETING` defines **`rohilla-site`**: `python -m http.server 8765` serving this folder. Start it with the Browser pane's `preview_start`, then check:
- console has no errors; `node --check data.js app.js` passes
- checkout math, e.g. 1 × Kebab ₹249 → shipping ₹49 → **total ₹298**, of which GST ₹14
- footer shows FSSAI + GSTIN; legal pages fill from `CONFIG`

A backup of the pre-11-Sep version was kept in the Claude scratchpad (session-only).

## Open items
- **Real photos:** every image is Unsplash stock, including the hero "pouch". Replace with real photos of the black pouch.
- **Product list and prices:** the site lists Kebab ₹249, Tandoori ₹229, Biryani ₹269, Nihari ₹289, Garam ₹199, Curry ₹219 (100 g). The Instagram pouch art shows a **50 g Tandoori at MRP ₹99 / ₹88**. Confirm the real sizes and MRPs, and consider adding Haldi, Lal Mirch and Dhaniya.
- COD availability and the ₹30 COD fee, and free shipping ≥ ₹500: confirm policy (they appear in `legal/shipping.html` and `CONFIG`).
- Razorpay button is disabled ("coming soon") and needs a backend. `CONFIG.razorpayKeyId` is a placeholder.
- Orders are only logged to the customer's `localStorage` plus the WhatsApp message. There is no server-side order record.
