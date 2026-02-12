# Weavy.ai Sections – Pixel-for-Pixel Implementation Plan

This plan matches the three main Weavy.ai landing sections using **real assets** from the live site. It includes steps for you to inspect the page and download assets yourself.

**Reference:** [https://www.weavy.ai](https://www.weavy.ai)  
**CDN base:** `https://cdn.prod.website-files.com/681b040781d5b5e278a69989/`

---

## Phase 0: Inspect the Live Page & Download Assets

### 0.1 Inspect the live page

1. **Open Weavy in a browser**
   - Go to [https://www.weavy.ai](https://www.weavy.ai).
   - Use Chrome or Edge (DevTools work well for copying image URLs).

2. **Section 1 – Professional Tools**
   - Scroll to **“With all the professional tools you rely on”**.
   - **Desktop:** Note the center image (vase on pedestal), the yellow/orange backdrop, and the floating tool labels (left/right). Count and order of tools.
   - **Mobile:** Resize to &lt;1024px and check the carousel: one tool at a time, image + label below, auto-advance.
   - In DevTools → **Network** (filter: Img), refresh and scroll to this section. Right‑click each image → **Copy** → **Copy image address** to get exact CDN URLs.

3. **Section 2 – Control the Outcome**
   - Scroll to **“Control the Outcome”**.
   - Note the 3-panel layout: left (layers), center (canvas with astronaut), right (properties). Check panel widths and content.
   - Copy the main UI screenshot image URL (desktop and mobile if different).
   - Copy URLs for astronaut, spaceship, phone, and any text overlay graphic.

4. **Section 3 – Workflow to App Mode**
   - Scroll to **“From Workflow / to App Mode”**.
   - Note the 7 cards in a row/grid, left (complex) → right (simple). Copy each card image URL.

### 0.2 Download assets from Weavy CDN

Use the URLs you copied, or the list below. For `@` in filenames use `%40` in the URL (e.g. `Default%402x.avif`).

**Suggested local structure:**

```
public/
  weavy/
    section1-tools/     # Professional tools
    section2-control/   # Control the Outcome
    section3-workflow/  # Workflow to App
```

**Section 1 – Professional Tools**

| Purpose | CDN filename | Full URL (encode @ as %40) |
|--------|----------------|----------------------------|
| Center vase (desktop) | `68223c9e9705b88c35e76dec_Default@2x.avif` | `.../68223c9e9705b88c35e76dec_Default%402x.avif` |
| Tool icon – Default | `68223c9e9705b88c35e76dec_Default@2x.avif` | (same as above) |
| Tool icon – Blur | `68224564b78bd840120b7a38_Blur@2x.avif` | `.../68224564b78bd840120b7a38_Blur%402x.avif` |
| Tool icon – Invert | `68224563d93b3ce65b54f07b_Invert@2x.avif` | `.../68224563d93b3ce65b54f07b_Invert%402x.avif` |
| Tool icon – Crop | `68224563af147b5d7c2496ff_Crop@2x.avif` | `.../68224563af147b5d7c2496ff_Crop%402x.avif` |
| Tool icon – Mask | `68224563d5cb54c747f189ae_Mask@2x.avif` | `.../68224563d5cb54c747f189ae_Mask%402x.avif` |
| Tool icon – Inpaint | `682245639e16941f61edcc06_Inpaint@2x.avif` | `.../682245639e16941f61edcc06_Inpaint%402x.avif` |
| Tool icon – Painter | `682245634dee7dac1dc3ac42_Painter@2x.avif` | `.../682245634dee7dac1dc3ac42_Painter%402x.avif` |
| Tool icon – Relight | `68224563b4846eaa2d70f69e_Relight@2x.avif` | `.../68224563b4846eaa2d70f69e_Relight%402x.avif` |
| Tool icon – Upscale | `682245638e6550c59d0bce8f_Upscale@2x.avif` | `.../682245638e6550c59d0bce8f_Upscale%402x.avif` |
| Tool icon – Z depth | `68224563290cc77eba8f086a_z depth@2x.avif` | `.../68224563290cc77eba8f086a_z%20depth%402x.avif` |
| Tool icon – Channels | `682245646909d06ed8a17f4d_Channels@2x.avif` | `.../682245646909d06ed8a17f4d_Channels%402x.avif` |
| Tool icon – Outpaint | `6822456436dd3ce4b39b6372_Outpaint@2x.avif` | `.../6822456436dd3ce4b39b6372_Outpaint%402x.avif` |
| Tool icon – Image describer | `6825ab42a8f361a9518d5a7f_Image describer@2x.avif` | `.../6825ab42a8f361a9518d5a7f_Image%20describer%402x.avif` |
| Mobile – default | `6836e7885ff7357d922037c4_default_mobile.avif` | (append to CDN base) |
| Mobile – describer | `6836e788be2ac396b9541c65_describer_mobile.avif` | |
| Mobile – outpaint | `6836e78866ed64acde74b76f_outpaint_mobile.avif` | |
| Mobile – channels | `6836e788cefffba35a0c82c7_channels_mobile.avif` | |
| Mobile – upscale | `6836e7884430f4f3b0c734c6_upscale_mobile.avif` | |
| Mobile – zdepth | `6836e788ab51aaa475d32e51_zdepth_mobile.avif` | |
| Mobile – relight | `6836e7885d8ba650e91f8316_relight_mobile.avif` | |
| Mobile – paint | `6836e7880866814b85054b1a_paint_mobile.png` | |
| Mobile – crop | `6836e7884f0847f3535d693c_crop_mobile.avif` | |
| Mobile – invert | `6836e7888d228f3f01ac4e1a_invert_mobile.avif` | |
| Mobile – inpaint | `6836e7883a7cdd793a674313_inpaint_mobile.avif` | |

**Section 2 – Control the Outcome**

| Purpose | CDN filename |
|--------|----------------|
| UI screenshot (desktop) | `682ee0eea4106dbd4133065d_Weavy UI.avif` → encode space as `%20` |
| UI screenshot (mobile) | `6832d528427b6216d40fb699_ui_mobile screen s.avif` → encode spaces |
| Astronaut | `682ee1e4018d126165811a7b_Astro.avif` |
| Phone | `682eecb4b45672741cafa0f6_phone.avif` |
| Text overlay (SVG) | `682ee1e3553ccb7b1eac8758_text - in astro.svg` |
| Spaceship | `682ee1e4abc8a6ba31b611d5_spaceship.avif` |

**Section 3 – Workflow to App (7 cards)**

| Order | CDN filename |
|-------|----------------|
| 1 | `68262b7678811e48ff42f7db_Frame 427321160.avif` |
| 2 | `68262b76a834003529b7f5d7_Group 7978.avif` |
| 3 | `68262b761ffbb948a3e6f9e0_Frame 427321155.avif` |
| 4 | `68262b7668cc066c00b3d2a2_Frame 427321159.avif` |
| 5 | `68262b764367eac325e77daa_Frame 427321158.avif` |
| 6 | `68262b76e100d9cf8cc06b34_Frame 427321157.avif` |
| 7 | `68262b763488bd282a6e4f3f_Frame 427321156.avif` |

**Download steps**

1. For each URL: `https://cdn.prod.website-files.com/681b040781d5b5e278a69989/[filename]`  
   Encode: `@` → `%40`, space → `%20`.
2. Paste in browser or use a download script/extension to save into `public/weavy/section1-tools/`, `section2-control/`, `section3-workflow/` with clear names (e.g. `vase-default.avif`, `tool-blur.avif`, `ui-desktop.avif`, `workflow-1.avif` …).
3. Optionally use DevTools → **Elements** → select the section container and **Copy** → **Copy outerHTML** to compare structure/order with your implementation.

---

## Phase 1: Section 1 – Professional Tools

**Layout:** Center vase image on mint pedestal with yellow backdrop; 11 tool labels floating around it (5 left, 6 right). Mobile: horizontal carousel, one tool at a time, auto every 3s.

### 1.1 Structure

- Section wrapper: `padding: 120px 24px`, `min-height` as needed, background `#F5F3EF`.
- Header: title + subtitle, centered.
- Desktop: one container with:
  - Backdrop (yellow blob, right of center).
  - Center: pedestal 280×280px, vase image 240×280px on top (from downloaded asset).
  - 11 tool labels: white cards with icon + text; 5 left, 6 right; positions by % (e.g. left 5–8%, top 15–75% staggered).
- Mobile: carousel; each slide = one tool image (from mobile assets) + tool name below.

### 1.2 Specs

- **Background:** `#F5F3EF`
- **Labels:** `background: rgba(255,255,255,0.95)`, `backdrop-filter: blur(10px)`, `box-shadow: 0 4px 16px rgba(0,0,0,0.08)`, border-radius 8px, padding 12px 20px.
- **Accent:** `#6C63FF` (icon color).
- **Pedestal:** ~280×280px, mint gradient; vase image 240×280px centered on top.
- **Backdrop:** large yellow gradient circle, blurred, right of center.

### 1.3 Assets to use (after download)

- Center: your downloaded vase/Default image (desktop).
- Tool labels: use the 11 labels in **Weavy’s desktop order** (from live site): **Invert, Outpaint, Crop, Inpaint, Mask extractor, Upscale, Z depth extractor, Image describer, Channels, Painter, Relight.** Map each to the matching tool icon image. Left/right: 5 left, 6 right (confirm exact positions by inspecting weavy.ai).
- Mobile carousel order (from live site): **Default, Describer, Outpaint, Channels, Upscale, Z Depth, Relight, Painter, Crop, Invert, Inpaint** — use the 11 mobile images in this order.

### 1.4 Animations (GPU-friendly)

- **Header:** fade up — `opacity: 0` → `1`, `transform: translateY(30px)` → `translateY(0)`; duration **1s**, delay **0s** (start as soon as section triggers).
- **Vase/pedestal:** scale-in with bounce. If the element is centered with `transform: translate(-50%, -50%)`, the keyframe must preserve it:  
  `from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }`  
  `to { opacity: 1; transform: translate(-50%, -50%) scale(1); }`  
  Easing: `cubic-bezier(0.34, 1.56, 0.64, 1)`, duration **1.2s**, delay **0.3s**.
- **Tool labels:** slide in from left (`translateX(-30px)` → `0`) or right (`translateX(30px)` → `0`); stagger **0.1s** per label; first label delay **0.5s**, so last ~1.5s. Use same easing as above, duration ~0.8s.
- **Hover (labels):** `transform: translateY(-4px) scale(1.05)`, `box-shadow: 0 8px 24px rgba(0,0,0,0.12)`; transition **0.3s** `cubic-bezier(0.34, 1.56, 0.64, 1)`.

### 1.5 Scroll trigger

- Use **IntersectionObserver** with **`threshold: 0.2`** (section 20% in view). When triggered, add a class to the section so CSS animations run (delays are relative to that moment). Animate only **`transform`** and **`opacity`** for GPU.

---

## Phase 2: Section 2 – Control the Outcome

**Layout:** One 3-panel UI screenshot (Layers | Canvas | Properties). Desktop: grid `280px 1fr 320px`, height 700px. Mobile: stack vertically, full width.

### 2.1 Structure

- Section: same padding and background as Section 1 (or keep consistent with your page).
- Header: “Control the Outcome” + subtitle.
- One main block: either a single **screenshot image** of the UI (recommended for pixel match) or a built replica.

**Option A – Use screenshot (fastest pixel match)**  
- One `<img>` (or `<picture>` with mobile asset) for the full 3-panel UI.  
- Sizes: desktop ~1400px wide, mobile full width.  
- This matches Weavy exactly if you use their desktop + mobile UI images.

**Option B – Rebuild panels**  
- Grid: `grid-template-columns: 280px 1fr 320px`, height 700px.
- Left: dark panel `#0d0f10`, layer list; active item border `#6C63FF`.
- Center: canvas with astronaut scene; overlay text “Directed by Michael Aber” (or as on site); use downloaded Astro, spaceship, phone, text SVG.
- Right: properties panel, inputs for dimensions (W/H), position (X/Y), rotation, opacity, blend mode. Colors below.

### 2.2 Colors (if building panels)

- Panels: `#0d0f10`, `#1a1d1f`, `#252a2e`
- Text: `#e0e0e0`
- Borders: `#2d3436`
- Active layer: purple border `#6C63FF`

### 2.3 Assets (after download)

- Desktop: `Weavy UI.avif` (full 3-panel).
- Mobile: `ui_mobile screen s.avif`.
- If you composite yourself: Astro.avif, spaceship.avif, phone.avif, text - in astro.svg.

### 2.4 Animations

- **Header:** fade up — `translateY(30px)` → `0`, opacity 0 → 1; duration **1s**, delay **0s**.
- **Interface (screenshot or panel wrapper):** scale-in — `transform: scale(0.95)` → `scale(1)`, opacity 0 → 1; easing `cubic-bezier(0.34, 1.56, 0.64, 1)`, duration **1s**, delay **0.4s**.
- **Text overlay** (if built separately): fade up, duration **0.8s**, delay **1s** (relative to section trigger).
- **Trigger:** IntersectionObserver **threshold 0.2**.

---

## Phase 3: Section 3 – Workflow to App Mode

**Layout:** 7 cards in a responsive grid; each card = image + label. Progression: complex workflow → simpler → simple app UI.

### 3.1 Structure

- Section: same padding, background.
- Header: small top line (“Maximize your team ability…”), then “From Workflow” / “to App Mode”, then subtitle.
- Grid: `display: grid`, `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`, `gap: 24px`.
- 7 cards; each: white background, 12px radius, image on top, label below.

### 3.2 Card spec

- Background white, `border-radius: 12px`, padding 24px.
- Image: use the 7 downloaded workflow frames; preserve aspect ratio (e.g. object-fit contain or cover to match Weavy).
- Label: font weight 500, color `#666`, below image.
- Hover: `transform: translateY(-8px)`, stronger shadow (e.g. `0 12px 32px rgba(0,0,0,0.12)`).

### 3.3 Assets (after download)

- The 7 Frame/Group AVIFs listed in the table above, in order 1–7. Map to labels by inspecting Weavy (e.g. “Complex workflow”, “Streamlining”, “Simple app” style labels).

### 3.4 Animations

- **Cards:** fade up when section is in view. Use **IntersectionObserver with `threshold: 0.7`** so the animation runs when **70% of the section** is visible (matches spec “scroll > 70%”). Alternative: scroll-based `(windowHeight - rect.top) / windowHeight > 0.7` as in existing component.
- **Stagger:** `transition-delay: calc(0.1s * index)` or `animation-delay: calc(0.4s + 0.1s * index)` so cards run 0.4s, 0.5s, … 1s.
- **Fade-up:** `opacity: 0`, `transform: translateY(30px)` → `0`; duration ~0.6–0.8s, same bouncy easing.
- **Hover:** `transform: translateY(-8px)`, `box-shadow: 0 12px 32px rgba(0,0,0,0.12)`; transition **0.3s** bouncy. Animate only `transform` and `box-shadow`.

---

## Global specs (all sections)

- **Font:** Inter (already in project or load from Google Fonts).
- **Headings:** weight 400–500, letter-spacing **-0.02em** to **-0.03em**.
- **Body:** weight 400, color **#666**.
- **Spacing:** section padding **120px 24px**, card padding **24px**, gaps **12–24px**.
- **Shadows:** small **`0 4px 16px rgba(0,0,0,0.08)`**, large **`0 40px 100px rgba(0,0,0,0.3)`**.
- **Transitions:** bouncy **`0.3s cubic-bezier(0.34, 1.56, 0.64, 1)`**, fast **`0.2s ease-out`** (e.g. focus states, inputs).
- **Breakpoints:** desktop **≥1024px**, mobile **&lt;1024px**.
- **Performance:** use AVIF; lazy-load images below the fold; animate only **`transform`** and **`opacity`** (and **`box-shadow`** for hover where needed); use IntersectionObserver for scroll-triggered animations (Section 1 & 2: **threshold 0.2**; Section 3: **threshold 0.7**).

---

## Scroll & animation timeline (reference)

| Section | Trigger | When | Then |
|--------|---------|------|------|
| 1 | IntersectionObserver **threshold 0.2** | Section 20% in view | Header 0s → Vase 0.3s → Labels 0.5s–~1.5s (stagger 0.1s) |
| 2 | IntersectionObserver **threshold 0.2** | Section 20% in view | Header 0s → Interface 0.4s → Text overlay 1s |
| 3 | IntersectionObserver **threshold 0.7** (or scroll progress &gt; 0.7) | Section 70% in view | Header 0s → Cards 0.4s–1s (stagger 0.1s per card) |

**Keyframe reference (use when implementing):**

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes scaleIn {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}
```

**Easing:** `cubic-bezier(0.34, 1.56, 0.64, 1)` for all enter/hover animations.

---

## Implementation checklist

- [ ] **Phase 0:** Open weavy.ai, inspect all three sections (desktop + mobile), copy image URLs from Network/DevTools.
- [ ] **Phase 0:** Download all Section 1 assets (vase, 13 tool icons, 11 mobile images) into `public/weavy/section1-tools/`.
- [ ] **Phase 0:** Download Section 2 assets (UI desktop/mobile, Astro, phone, text SVG, spaceship) into `public/weavy/section2-control/`.
- [ ] **Phase 0:** Download 7 workflow frames into `public/weavy/section3-workflow/`.
- [ ] **Phase 1:** Build Section 1 HTML/CSS structure; plug in downloaded vase + tool icons; implement desktop positions and mobile carousel; add animations and IntersectionObserver.
- [ ] **Phase 2:** Build Section 2 (screenshot image or 3-panel replica); plug in UI/Astro/spaceship/phone/text assets; add animations.
- [ ] **Phase 3:** Build Section 3 grid and 7 cards; plug in workflow images and labels; add staggered fade-up and hover.
- [ ] **Global:** Apply typography, spacing, shadows, breakpoints; ensure lazy loading and accessibility (alt text, focus states, keyboard nav where applicable).

---

## Quick URL builder

Base URL:

```
https://cdn.prod.website-files.com/681b040781d5b5e278a69989/
```

Append the filename with:
- `@` → `%40`
- space → `%20`

Example:  
`68223c9e9705b88c35e76dec_Default@2x.avif`  
→  
`https://cdn.prod.website-files.com/681b040781d5b5e278a69989/68223c9e9705b88c35e76dec_Default%402x.avif`

You can open each built URL in a new tab to confirm and then “Save as” into the correct `public/weavy/` folder.

---

## Verification vs current component

When implementing, align with this plan and fix any gaps:

| Item | Plan / spec | Current `Weavytoolssection.tsx` |
|------|-------------|--------------------------------|
| **Section 1 trigger** | IntersectionObserver **threshold 0.2** | Uses scroll handler (any pixel visible). Prefer IO with 0.2 so animations start at 20% visibility. |
| **Section 3 trigger** | **Threshold 0.7** (or scroll progress > 0.7) | Uses `scrollProgress > 0.7` — correct. If switching to IO, use `threshold: 0.7`. |
| **Section 1 animations** | Only start when section is in view (IO); delays 0s, 0.3s, 0.5s+ stagger | Ensure `isInView` is set from IO (0.2), not "any visible". |
| **Vase** | Real image 240×280 on 280×280 pedestal | CSS-drawn vase; replace with downloaded Default/vase image. |
| **Tool labels** | 11 labels, order Invert → … → Relight; real icons | 12 tools with Lucide icons; reduce to 11 and use downloaded tool icon images in spec order. |
| **Mobile carousel** | Auto-advance every **3s** | Already 3000ms — correct. |
| **Easing** | `cubic-bezier(0.34, 1.56, 0.64, 1)` everywhere | Already used — correct. |
| **Scale-in** | Preserve `translate(-50%, -50%)` in keyframe for centered vase | Current `scaleIn` only does scale; add translate in keyframe so center is kept. |
