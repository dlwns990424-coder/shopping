# Clothing image generation checkpoint

## Goal

- Replace the original 56 landscape images with portrait product images.
- Add 16 outerwear images.
- Final target: 72 PNG images.
- Required ratio: width 3 : height 4 (`1086x1448`).

## Fixed visual rules

- Use the original warm-white background from the first generated product image.
- One garment per image.
- Front-facing, centered composition with generous responsive-safe margins.
- Realistic Korean fashion ecommerce catalog photography.
- Preserve realistic fabric, stitching, zippers, buttons, pockets, cuffs, and shadows.
- No model, mannequin, hanger, props, text, logo, brand, watermark, border, or extra garment.

## Current state

- The original 56 landscape images remain untouched in their existing category folders.
- Portrait replacements are staged under `_portrait_staging`; they have not replaced the originals.
- Completed and validated portrait images: 8.
  - `men/coats/men-coat-01.png` through `men-coat-04.png`
  - `men/jeans/men-jeans-01.png` through `men-jeans-04.png`
- All eight staged files are `1086x1448` (3:4 portrait).
- Remaining original-image conversions: 48.
- Remaining new outerwear images: 16.
- Remaining total: 64.

## Outerwear folders and plan

- `men/windbreakers`: black, navy, light gray, olive-khaki.
- `men/jackets`: bomber, denim trucker, field jacket, lightweight puffer.
- `women/windbreakers`: cream, black, light blue, beige.
- `women/jackets`: cropped bomber, tweed jacket, denim jacket, lightweight puffer.

## Resume procedure

1. Continue generating portrait replacements into `_portrait_staging`, without overwriting originals.
2. Generate the 16 outerwear images using the same fixed visual rules.
3. Verify every staged image is readable and exactly `1086x1448`.
4. Visually inspect representative images from every category.
5. Only after all 72 pass validation, replace the original 56 files and install the new 16 outerwear files.

## Generation prompt baseline

Use case: product-mockup. Recreate the referenced single garment while preserving its design, color, fabric, construction, warm-white background, lighting, and shadow character. Recompose it on an exact portrait canvas with width 3 to height 4. Keep the full garment centered, front-facing, uncropped, and surrounded by generous safe margins. Include exactly one garment and no person, model, mannequin, hanger, props, text, logo, brand, watermark, border, or extra garment.
