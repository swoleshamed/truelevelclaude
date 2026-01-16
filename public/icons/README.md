# App Icons

This directory contains the PWA app icons for TrueLevel.

## Icon Sizes Required

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png
- badge-72x72.png (for notifications)
- shortcut-visit.png (96x96, for app shortcuts)
- shortcut-schedule.png (96x96, for app shortcuts)

## Generating Icons

Use the base SVG (`icon.svg`) to generate PNG icons at all required sizes.

### Using ImageMagick

```bash
# Generate all sizes from SVG
for size in 72 96 128 144 152 192 384 512; do
  convert icon.svg -resize ${size}x${size} icon-${size}x${size}.png
done

# Generate badge
convert icon.svg -resize 72x72 badge-72x72.png

# Generate shortcuts
convert icon.svg -resize 96x96 shortcut-visit.png
convert icon.svg -resize 96x96 shortcut-schedule.png
```

### Using Sharp (Node.js)

```javascript
const sharp = require('sharp');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

for (const size of sizes) {
  await sharp('icon.svg')
    .resize(size, size)
    .png()
    .toFile(`icon-${size}x${size}.png`);
}
```

### Using Online Tools

1. https://realfavicongenerator.net/
2. https://www.pwabuilder.com/imageGenerator

## Design Guidelines

- Use a minimum 512x512 source image for best quality
- Include safe zone padding for maskable icons (minimum 10% padding)
- Test on both light and dark backgrounds
- Ensure the icon is recognizable at small sizes (72x72)
