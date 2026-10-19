# Asset Specs — character:ninja

Source: user overnight production brief; design/gdd/game-concept.md. Art Bible: ../art/art-bible.md. Date: 2026-10-18. Studio asset-spec body executed in delegated art-director + sequential technical-art pass; not an external Studio editor session. Confirmed asset list comes directly from explicit user scope. New visual master remains candidate.

## ASSET-001 — Three-color ink ninja

Sprite / 2D Art. 576×576 RGBA PNG. 42 individual frames: three colors × (air3 + patrol3 + throw_air3 + throw_ground3 + death2). 15 sheets. Anchor [288,376], 2 px per old Canvas unit. Half-width mirrors at runtime, never generate separate opposite-facing masters. Death local waist seam 5 units; lower crop shifts to the old corpse origin. Export per-half alpha outline coordinates for contact computation.

One dark irregular calligraphic mass, short compact limbs mostly implied by sleeve and trouser brush shapes, ragged dry edges, tiny eye reserves. No neat tunic collar or rectangular abdomen. Head locked between living frames; legs folded in air, short support poses on ground. Arm reach is semantic and compact. Death changes only pose/expression and split; preserves each clothing pigment.

Art Bible anchors: §3 irregular organic mass; §4 muted pigment variants; §5 compact combat silhouette; §8 exact formats/anchors. Recommended generation prompt is persisted in qa/art/production-log.json and work/studio_v1/art/ninja-prompt.txt before execution. Use original elder as actual image input. Negative constraints: no paper background, no blue glow, no geometric joints, no vector outlines, no muscle detail, no neck V, no weapons or decor.

## ASSET-002 — Ink moon slash

Owned by VFX integration pass. Real source brush imagery, time-resolved local reveal and tail-first dry erosion. Preserve radius, angle, collision and duration. Require actual normal and slow playback. Do not animate the whole raster with only a global alpha.

## ASSET-003 — Lightness motion strokes

Owned by VFX integration pass. Two/three short directional real-brush strokes during ascent and gentler fall airflow. Follow world velocity, preserve readability, no long black tail.

## ASSET-004 — Environment and UI

Owned by main integration/UI pass. Blank warm field, minimal lateral mountain, physical-height ground. Typography/seal UI per Bible §6–7. No mechanic changes.

## Validation Contract

Measure RGBA, full transparent corners, border clipping, finite anchors, same alpha structure across color variants, sheet reconstruction and live/dead crop bounds. Visually review contact sheet on warm and dark backgrounds at both source and game scale. Emit MANUAL_REQUIRED for style acceptance, final animation feel and mobile Game View until actual observation occurs.
