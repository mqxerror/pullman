# AI 360° Panorama Generation Prompts

**Tool:** Blockade Labs Skybox AI (https://skybox.blockadelabs.com/)
**Output:** Equirectangular panoramas (8192x4096 recommended)
**Style:** "realistic_interior_room" or "photorealistic"

---

## How to Use

1. Go to https://skybox.blockadelabs.com/
2. Select style: **"Interior Views"** or **"Realistic"**
3. Copy/paste the prompt below
4. Enable **"Enhance prompt"** for better results
5. Generate and download
6. Save as `suite-type-XX-room.jpg`

---

## Suite Type 07 - Living Room (City View)

```
Luxury hotel executive suite living room, panoramic floor-to-ceiling windows overlooking Panama City skyline at golden hour, modern minimalist interior design, warm oak wood wall paneling, cream colored leather sectional sofa, white marble oval coffee table, contemporary pendant lighting, light oak flooring, neutral warm color palette with tan and beige accents, 4K photorealistic architectural visualization, soft natural lighting, high-end hotel atmosphere, Pullman Hotels style
```

**Negative prompt (if available):**
```
cartoon, illustration, painting, blurry, low quality, distorted, people, humans
```

---

## Suite Type 07 - Bedroom

```
Luxury hotel executive suite master bedroom, king size bed with premium white linens and beige throw pillows, floor-to-ceiling windows with sheer curtains and Panama City view, warm oak wood headboard wall, ambient recessed lighting with soft glow, modern minimalist design, neutral color palette cream and tan, bedside tables with designer lamps, plush carpet flooring, 4K photorealistic architectural visualization, evening mood lighting, Pullman Hotels premium style
```

---

## Suite Type 07 - Kitchen/Dining

```
Luxury hotel executive suite open kitchen and dining area, modern minimalist galley kitchen with light oak cabinets, integrated stainless steel appliances, white marble countertops, round marble dining table with four tan leather dining chairs, floor-to-ceiling windows with city view, warm ambient lighting, neutral color palette, 4K photorealistic architectural visualization, daytime natural lighting, high-end hotel residence style
```

---

## Suite Type 08 - Living Room (Alternative Layout)

```
Luxury hotel executive suite living room, open concept layout, curved cream colored sofa facing large windows with Panama City panorama, warm oak wood accent wall with built-in TV unit, floating media console, modern abstract art on wall, oval marble coffee table, contemporary floor lamp, soft neutral color palette with terracotta and cream accents, light oak flooring, 4K photorealistic architectural visualization, soft afternoon lighting, Pullman Hotels premium interior
```

---

## Suite Type 08 - Bedroom with En-Suite View

```
Luxury hotel executive suite bedroom looking toward bathroom entrance, king bed with white premium linens, en-suite bathroom visible through open doorway, warm oak wood finishes throughout, floor-to-ceiling windows on side, modern minimalist design, soft ambient lighting, neutral warm color palette, plush neutral carpet, contemporary pendant lights, 4K photorealistic architectural visualization, relaxing evening atmosphere
```

---

## Hotel Lobby (Bonus)

```
Luxury hotel lobby interior, grand double-height space, warm wood slat ceiling with ambient lighting, marble reception desk with brass accents, contemporary lounge seating area with curved sofas, indoor tropical plants, modern chandeliers, floor-to-ceiling windows, neutral color palette with warm wood and brass accents, 4K photorealistic architectural visualization, welcoming atmosphere, Pullman Hotels brand style
```

---

## Rooftop Pool Area (Bonus)

```
Luxury hotel rooftop infinity pool deck at sunset, Panama City skyline in background, modern lounge seating with premium cushions, tropical plants in planters, wooden deck flooring, pool bar with marble counter, warm golden hour lighting, contemporary design, 4K photorealistic architectural visualization, resort atmosphere, panoramic city views
```

---

## Tips for Best Results

1. **Consistency:** Use similar prompts to maintain visual consistency across rooms
2. **Lighting:** Specify time of day (golden hour, afternoon, evening) for mood
3. **Color Palette:** Keep referencing "warm oak", "cream", "neutral" for brand consistency
4. **View:** Always mention "Panama City" and "floor-to-ceiling windows"
5. **Quality:** Add "4K photorealistic architectural visualization" for best quality

---

## Post-Processing Steps

1. **Download** at highest resolution available
2. **Upscale** with Real-ESRGAN if needed (target 8192x4096)
3. **Color correct** to match existing renders if needed
4. **Compress** to WebP format (quality 85) for web
5. **Upload** to Supabase Storage: `/tours/suite-type-XX/room-name.webp`

---

## Integration with Pannellum

Once generated, add to the tours table:

```sql
-- Example: Add Suite Type 07 Living Room tour
INSERT INTO tours (suite_type, name, source)
VALUES ('type-07', 'Executive Suite Type 07', 'ai');

INSERT INTO tour_scenes (tour_id, name, panorama_url, initial_yaw)
VALUES
  ((SELECT id FROM tours WHERE suite_type = 'type-07'),
   'living',
   '/tours/suite-type-07/living.webp',
   180);
```

---

## Alternative: LeiaPix for Depth Effect

If you want a "2.5D" effect from existing renders instead of full 360°:

1. Go to https://convert.leiapix.com/
2. Upload your existing render (e.g., EXECUTIVE SUITE_TYPE 07.jpg)
3. Generate depth map
4. Export as "Lightfield" or animated
5. Use for hero sections or gallery with parallax effect

This creates a subtle 3D parallax effect that works great for static images.

---

**Created:** 2026-01-13
**Purpose:** AI-generated 360° content for Pullman Hotel virtual tours
