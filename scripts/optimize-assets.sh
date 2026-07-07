#!/bin/bash
# Optimize source assets (assets/) into web-ready files (public/).
# GLBs: draco compression + webp textures capped at 1024px.
# Images: resized PNGs.
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p public/models public/img public/draco

opt() { # opt <src> <dst-name>
  echo "── $2"
  npx -y @gltf-transform/cli optimize "assets/models/$1" "public/models/$2" \
    --compress draco --texture-compress webp --texture-size 1024 --simplify false
}

opt "Desk.glb" desk.glb
opt "Monitor.glb" monitor.glb
opt "speaker.glb" speaker.glb
opt "gaming_keyboard.glb" keyboard.glb
opt "pc_mouse_type-r.glb" mouse.glb
opt "Game_console.glb" console.glb
opt "Game_controller.glb" controller.glb
opt "office_chair.glb" chair.glb
opt "whiteboard 3d model.glb" whiteboard.glb
opt "photo_frame.glb" frame.glb
opt "wall_shelf.glb" shelf.glb
opt "usb_pen_drive.glb" usb.glb
opt "sd_card.glb" sdcard.glb
opt "cute_couple.glb" couple.glb

# draco decoder for the client
cp node_modules/three/examples/jsm/libs/draco/gltf/* public/draco/

# images
sips -Z 2172 "assets/images/Mountain-range.png" --out public/img/mountain-range.png >/dev/null
sips -Z 1600 "assets/images/backdrop.png" --out public/img/backdrop.png >/dev/null
sips -Z 1600 "assets/images/World-map desk mat.png" --out public/img/desk-mat.png >/dev/null
sips -Z 1400 "assets/images/Sketch character.png" --out public/img/character.png >/dev/null

echo "done"; du -sh public/models public/img
