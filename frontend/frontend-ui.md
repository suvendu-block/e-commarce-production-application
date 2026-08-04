# The Stockroom — Frontend UI Design

Design lead's brief for the storefront. The store sells everything (Electronics, Clothing, Home & Kitchen, Books, Sports), so the identity must belong to a **general-merchandise shop**, not a boutique. This document is the single source of truth for every color, typeface, and layout decision in the frontend build. If a page in `system-design.md`/`FRONTEND-STEPS.md` conflicts with this doc, this doc wins for visual decisions; the backend API contract in `FRONTEND-STEPS.md` wins for behavior.

---

## 1. The subject, the audience, the job

| | |
|---|---|
| **Store name** | **The Stockroom** — placeholder, renameable, but it names the thesis: *everything here is real stock, priced on the tag.* |
| **Audience** | Everyday shoppers. Mixed ages, buying everything from phones to air fryers. Not connoisseurs — people who want to see what a thing costs and get it. |
| **The page's single job** | Get shoppers to the tag: find goods, know the price, add to cart, check out. The price and the stock count are the two facts that close the sale. |
| **Why "stock"** | The backend already treats these facts as first-class data: `countInStock`, server-computed `totalPrice`, `isPaid`/`isDelivered` states, an admin back office. The UI metaphor is not decoration on top of the data model — it *is* the data model, rendered as the store's own instruments. |

**The idea, in one paragraph.** The Stockroom is designed as if the physical shop itself leaked into the browser. On the shop floor: prices are **swing tags** hanging from the goods, stock status is a **rubber stamp**, SKUs and stock counts are **inventory labels** set in monospace. At the till: the checkout summary and order page are a **thermal receipt**. In the back office: the admin area is a **ledger** — ruled tables, no decoration. One material language, three rooms. No gradients, no glass, no hero statistics — the loudest thing on any page is a tomato-red tag with a price on it, because in a shop the price is the loudest thing.

---

## 2. Design tokens

### 2.1 Palette

| Token | Hex | Job |
|---|---|---|
| `paper` | `#F5F2EA` | Page ground. Warm but not yellow — it's stock paper, not parchment. |
| `ink` | `#1B1916` | Text, rules, the header band. Warm near-black. |
| `tag` | `#E03E2D` | Tomato red. **Only ever on the price-tag artifact** (and destructive actions). Never used as a decorative accent, never on gradients. |
| `stamp` | `#2F5D3A` | Moss green. In-stock, paid, delivered stamps; success messages. |
| `cardboard` | `#7A7467` | Muted text: captions, metadata, empty-state hints. |
| `tape` | `#E0DBCB` | Hairline rules, borders, dividers, table grid lines. |

Use rules:
- `paper` and `ink` carry ~95% of every screen. The other four tokens are punctuation.
- `tag` appears on: product cards, the front window, product page price, cart rows, subtotal line, the primary "Add to cart"/"Place order" button.
- Status color comes from the **stamp**, never from `tag`. "In stock" is green. "Out of stock" is cardboard ink. "Paid" / "Delivered" are green stamps.
- Dark surface = `ink` band (header/awning, footer rule). White is not in the palette — pure `#FFFFFF` is reserved for nothing; the paper is always `paper`.

### 2.2 Typography

Three faces, three jobs. All from Google Fonts (weights listed per role).

| Role | Face | Weights | Job |
|---|---|---|---|
| **Display** | **Bricolage Grotesque** | 500/700/800 | Store name, section titles, product names, big totals. Quirky storefront-sign energy; used with restraint — headings and product names only. |
| **Body** | **Figtree** | 400/500 | Paragraphs, descriptions, form text, everything readable. |
| **Data** | **IBM Plex Mono** | 400/500/600 | **Every price**, every stock count, every SKU, labels, buttons, table cells, receipts, stamps, form labels. The register speaks in mono. |

Why three: the display face gives the storefront its voice; the body face stays invisible and legible; the mono face makes **price and stock read as data** — which is exactly what they are. Prices in a shop are facts, not decoration.

Type scale (px, mobile → desktop):

| Token | Mobile | Desktop | Face |
|---|---|---|---|
| `display-xl` | 32 | 56 | Bricolage 800, -0.02em |
| `display-l` | 24 | 40 | Bricolage 700, -0.015em |
| `display-m` | 20 | 24 | Bricolage 700 |
| `product` | 16 | 18 | Bricolage 600 |
| `body` | 15 | 16 | Figtree 400, line-height 1.55 |
| `body-s` | 13 | 14 | Figtree 400 |
| `data` | 13 | 14 | Plex Mono 500 |
| `data-s` | 11 | 12 | Plex Mono 500, uppercase, +0.08em tracking — the label-maker voice |

Copy rules: sentence case everywhere, including buttons and stamps ("In stock", not "IN STOCK" as a shout — though stamps may use capitals *sparingly* for state words like PAID/DELIVERED because that's how rubber stamps actually read).

### 2.3 Space, rule, radius

| Token | Value | Notes |
|---|---|---|
| `space-1` | 4px | Baseline |
| `space-2` | 8px | Tight gaps |
| `space-3` | 12px | Inner card padding small |
| `space-4` | 16px | Default padding, field gutters |
| `space-6` | 24px | Card padding, section rhythm |
| `space-8` | 32px | Between sections |
| `space-12` | 48px | Major section breaks |
| `rule` | 1px | All borders are 1px `tape` or `ink` |
| `radius-sm` | 4px | Stamps, inputs, small controls |
| `radius-md` | 10px | **The tag radius** — price tags, cards, buttons, receipts |
| `radius-full` | 999px | Badges, pill filters |

Why radius-md everywhere: every component in the material system is a paper artifact — paper tears/rounds at the corner. No component exceeds 10px radius; nothing is glassy or floating.

---

## 3. The signature: the price tag

**One memorable element.** Every price in the storefront hangs from a swing tag: a tomato-red rounded tag with a punched hole, a thread, and the price in mono paper-white.

```
        │  ← thread (1px ink line)
        ●  ← punched hole (paper circle, 6px)
  ┌──────────┐
  │  $1,299  │  ← paper white, Plex Mono 600
  └──────────┘
```

Anatomy and rules:
- Fill: `tag`; text: `paper`; hole: `paper` circle; thread: 1px `ink` line above the hole. Radius 10px, padding 4px 10px.
- Price format: `$1,299.00` → always two decimals, `formatPrice()` in `utils/helpers.js`. Tabular figures align naturally in Plex Mono.
- Sizes: large on the front window (16px mono), medium on product cards (15px), small in cart rows and receipts (12px).
- The tag is the **only** element allowed to use the `tag` color. If a price appears, it appears as a tag.
- The tag's sibling artifact is the **receipt**: the place-order summary and the order page print a thermal-style card — mono rows, dashed roller lines between groups, right-aligned figures, a big mono total. The receipt is deliberately *quiet* (paper on paper, no tomato except on the total), because the tag is the loud one.

Everywhere else stays disciplined: paper ground, ink rules, quiet type. The tag is where the boldness lives.

---

## 4. Layout system

Three rooms of the same store. All layouts ride a 12-column grid with `space-6` page gutters, max width 1200px, centered.

### 4.1 Shop floor — storefront pages

```
┌─────────────────────────────────────────────────────┐
│ INK BAND  The Stockroom   [search]  [Cart (2) ◆]   │  awning
├─────────────────────────────────────────────────────┤
│ FRONT WINDOW — top 5 products, carousel             │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│ │ image    │  │ image    │  │ image    │            │
│ │  └─tag─┘ │  │  └─tag─┘ │  │  └─tag─┘ │            │
│ └──────────┘  └──────────┘  └──────────┘            │
├─────────────────────────────────────────────────────┤
│ AISLES  All · Electronics · Clothing · Home & ...   │
├─────────────────────────────────────────────────────┤
│ CATALOG p.1 of 2                                    │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                     │
│ │ img │ │ img │ │ img │ │ img │                     │
│ │name │ │name │ │name │ │name │                     │
│ │└tag┘│ │└tag┘│ │└tag┘│ │└tag┘│                     │
│ │[stock]│ │     │ │     │ │     │                   │
│ └─────┘ └─────┘ └─────┘ └─────┘                     │
│ ◀ 1 2 ▶                                             │
├─────────────────────────────────────────────────────┤
│ FOOTER (paper, ink rules)                           │
└─────────────────────────────────────────────────────┘
```

- **Header (the awning):** `ink` band. Left: store name in Bricolage 800 with a small tag-shaped `◆` mark in `tag`. Center: SearchBox (paper field on ink, mono placeholder "Search the shelves…"). Right: cart link with a tag-shaped badge showing the count. Mobile: hamburger → ink dropdown panel.
- **Front window (hero = thesis):** the top-5 carousel, framed like a store window with an ink rule border and a "FRONT WINDOW" label in mono. Each slide is an image with a large hanging tag. No headline statistics, no gradient — the window *is* the pitch: real goods, real tags.
- **Aisle bar:** category pills as shelf labels — mono, uppercase-small, bordered `tape`, active pill fills `ink`. Filters encode the real aisle structure of the seed data (Electronics, Clothing, Home & Kitchen, Books, Sports).
- **Catalog grid:** product cards, 1 / 2 / 4 columns (mobile / tablet / desktop). Pagination reads "Page 1 of 2" in mono with ◀ ▶ buttons — real catalog pagination, not fake numbering.
- **Footer:** paper, `tape` top rule, mono small text, three columns of links.

### 4.2 The till — checkout & orders

- **CheckoutSteps** = a tear-off ticket: four mono steps (`Sign in → Shipping → Payment → Place order`) joined by dashed lines on one `tape` rule; the current step is `ink`, completed steps get a small green ✓ stamp. A real queue, in order, because it is one.
- **Shipping / Payment pages:** centered `FormContainer` (max 480px) as a paper card with `tape` border and a mono top label ("SHIPPING" / "PAYMENT").
- **PlaceOrder / Order pages:** the receipt card (see §3). Left: items, shipping address, payment method. Right: receipt with dashed rules, mono figures, big mono total. "Place order" is the tag button.

```
┌─ RECEIPT · ORDER 67b3…────────────────┐
│ THE STOCKROOM        THE STOCKROOM    │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─     │
│ 2× iPhone 15 Pro            2,598.00  │
│ 1× Kindle Paperwhite          149.99  │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─     │
│ Subtotal                    2,747.99  │
│ Tax (8%)                       219.84 │
│ Shipping                          0   │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─     │
│ TOTAL                     $2,967.83   │  ← tag total
│ [✓ PAID] [✓ DELIVERED]                │  ← green stamps
└───────────────────────────────────────┘
```

### 4.3 Back office — admin

The admin is the stockroom office: **no cards, no tags, no stamps** (except status columns). Ledger tables on `paper`, hairline `tape` rows, mono cells, mono uppercase column headers, row hover = slight paper darkening, edit/delete as quiet ink links with an icon. Forms are the same paper-card pattern but denser. The only `tag` element allowed is the destructive delete button. This room is deliberately utilitarian — the boss reads ledgers, shoppers see tags.

---

## 5. Component recipes

All components: `paper` on `paper`, 1px rules, radius ≤10px, mono for data, focus ring = 2px `ink` outline with 2px `paper` offset (never removed).

| Component | Spec |
|---|---|
| **PriceTag** | §3 anatomy. Sizes: large/md/small. Hover on cards: tag lifts 2px + rotates 2°, thread follows (transform-origin top center). |
| **StockStamp** | Uppercase mono 11px, border 1.5px, radius 4px, rotated -2°. `In stock` → `stamp` green; `Low stock` (≤5) → `cardboard`; `Out of stock` → ink border, no fill. |
| **Button** | Tag-shaped (radius 10px). Primary: `ink` fill, `paper` text, mono 500 uppercase. Tag-color: `tag` fill (Add to cart, Place order). Secondary: paper, `ink` 1px border. Danger: `tag` outline. Pressed state: translateY(1px) — a stamp pressed into paper. |
| **ProductCard** | Paper card, `tape` border, image 4:3 on a `paper`-darkened plate (`#EDE9DD`), name in `product` Bricolage 600 (2-line clamp), PriceTag hanging at top-right overlapping the image, StockStamp under the price, rating in mono (`★ 4.2 (5)`), brand + category as mono data-s. |
| **Form** | Fields = underline style: `paper` field, bottom `ink` 1px rule, mono uppercase label, placeholder in `cardboard`. Focus: bottom rule thickens to 2px `ink`. Errors: `tag` text under field, mono small. |
| **Message** | Ruled paper note: 1px border, left rule 3px — `tag` for error, `stamp` for success, `ink` for info. Mono small text. |
| **Loader** | A swinging mini PriceTag pendulum (thread + tag rotating ±8°, transform-origin top center, 1.2s ease-in-out infinite). Reduced motion: static tag. |
| **Toast** | Paper card, `tape` top rule, mono small; success → `stamp` left rule, error → `tag`. Copy follows §6. |
| **Pagination** | "Page 1 of 2" mono data + ◀ ▶ `ink` square buttons (radius 4px). |
| **Rating** | Stars in Bricolage (`★` filled `ink`, empty `tape`), count in mono cardboard. Interactive mode: larger hit area, hover fills `tag`. |
| **EmptyState** | Centered: mono label "The shelf is empty", one line of direction copy (§6), one action button. |
| **CartRow** | Image thumb, name, qty dropdown (mono), small PriceTag, remove as ✕ ink link. Subtotal line = mono data with a medium tag total. |
| **SearchBox** | Rounded-rule field with mono placeholder, magnifier icon, Enter submits. |
| **AdminTable** | §4.3. Also used (densified) for "My orders" on the profile page. |

---

## 6. Copy & states

Voice: plain verbs, sentence case, no filler, from the shopper's side of the counter. Actions keep their name through the whole flow: "Add to cart" → toast "Added to cart"; "Place order" → toast "Order placed".

| Situation | Copy | Where |
|---|---|---|
| 429 rate limit | "One login a minute, please — try again shortly." | Login/Register error Message |
| 401 | Interceptor clears token, redirects to /login. | global |
| 403 non-admin | "Admin only — your account can't open this page." | AdminRoute fallback |
| 403 foreign order | "This order isn't yours." | OrderPage |
| Out of stock | "This one's sold out — check the shelf for something similar." | ProductPage + card stamp |
| Insufficient stock | "Only {countInStock} left. Pick a lower quantity." | Cart/Product qty |
| Empty cart | "Your cart is empty. The shelves are stocked — start here." | CartPage + button to home |
| Empty catalog/search | "Nothing on this shelf. Try a different word or aisle." | HomePage |
| Order placed | "Order placed. Check your inbox for the receipt." | Toast |
| Review added | "Review added." | Toast |
| Product saved | "Product saved." | Admin toast |
| Delete confirm | "Delete {name}? This can't be undone." | Admin dialogs |
| Place order button | "Place order" — not "Submit". | PlaceOrderPage |

Errors never apologize and never get vague: they say what happened and what to do next, in the store's voice.

---

## 7. Motion

One orchestrated moment, everything else quiet:
- **Page load:** when the front window renders, its tags swing in one after another (staggered 120ms, one 60° swing settling, 500ms, ease-out). This is the signature moment — the tags announce the prices.
- **Card hover:** tag lifts 2px, image plate darkens 1 step.
- **Buttons:** stamp press (translateY 1px). Active nav/aisle pill fills `ink`.
- **Everything else:** no entrance animations, no parallax, no marquee.
- **`prefers-reduced-motion: reduce`:** all swings become 150ms fades or static; no infinite loader animation (static tag).

---

## 8. Responsive

| Breakpoint | Layout |
|---|---|
| < 640px | 1 product per row, tags scale down, awning collapses to hamburger, front window = 1 slide |
| 640–1024px | 2–3 per row, aisle bar wraps |
| > 1024px | 4 per row, full awning, receipt becomes a fixed-width right column |

Grid columns use CSS grid `repeat(auto-fill, minmax(240px, 1fr))` so any product count degrades gracefully. Touch targets ≥ 44px for qty dropdowns, remove links, pagination.

---

## 9. Rationale (what was rejected, and why)

- **Warm cream + serif + terracotta:** the default "artisanal" look. This store sells air fryers; it is not a bakery. Differentiated by: no serif at all, tomato used only on the tag artifact, and the moss-green stamp voice.
- **Near-black + acid green:** the default "tech" look. Nothing about general merchandise is acid green.
- **Broadsheet hairlines:** the default "editorial" look. A catalogue is not a newspaper — but the admin ledger *borrows* the ruled discipline, which is honest to the subject.
- **Gradient hero with stats:** the template hero. The front window is the thesis instead: goods with hanging tags.
- **Numbered 01/02/03 markers:** rejected — the content isn't a sequence. Real ordering lives in catalog pagination ("Page 1 of 2") and the checkout ticket, where order genuinely matters.
- **CRT/point-of-sale green-on-black theme:** fun but unreadable for a full storefront and reads as "terminal template".

The risk, taken once: **a tomato price tag hanging from every product** — playful in a category where serious stores use timid gray prices. It's justified because the tag is the store's single honest instrument: the price is the fact shoppers came for, so the fact gets the loudest voice on the page. Everything else was cut back to keep that one moment loud.

---

## 10. Build notes for the frontend dev

- Tailwind: register the six tokens in `tailwind.config.js` (`paper`, `ink`, `tag`, `stamp`, `cardboard`, `tape`) plus the type scale and radii above. Fonts: `@import` Bricolage Grotesque (500/700/800), Figtree (400/500), IBM Plex Mono (400/500/600).
- `formatPrice` → `$2,967.83` (en-US, 2 decimals). Prices render via `PriceTag` everywhere; never raw text.
- Product `_id`'s last 4 chars = the SKU on tags/labels ("SKU 67b3").
- Stock stamp logic: `countInStock === 0` → Out of stock; `≤ 5` → Low stock; else In stock.
- Backend contract reminders that shape UI copy: prices are server-computed (never trust client), `paymentResult` camelCase, 429 on auth endpoints, `upload` accepts field `image` ≤5MB jpeg/png/webp/gif.
- Admin pages = §4.3 ledger pattern; profile order history = densified `AdminTable`.
