import fs from "fs";
import path from "path";

const brainDir = "C:\\Users\\mohan\\.gemini\\antigravity-ide\\brain\\c249e36f-a9c1-4f60-91a7-f01be8d32369";
const targetDir = path.resolve("./public/images/products/amphenol");

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const copyMap = [
  { src: "gnss_product_image_1791711141777.png", dest: "amp-gnss-antenna.png" },
  { src: "amphenol_cellular_1791711371937.png", dest: "amp-cellular-antenna.png" },
  { src: "amphenol_wifi_1791711446938.png", dest: "amp-wifi-antenna.png" },
  { src: "amphenol_embedded_1791711467541.png", dest: "amp-embedded-antenna.png" },
  { src: "amphenol_paladin_1791711488651.png", dest: "amp-paladin-backplane.png" },
  { src: "amphenol_sheerpwr_1791711511244.png", dest: "amp-sheerpwr-circular.png" },
  { src: "amphenol_spe_1791711536605.png", dest: "amp-spe-ethernet.png" },
  { src: "amphenol_filter_rf_1791711565939.png", dest: "amp-rf-bnc.png" },
  { src: "amphenol_rugged_usb_1791712070075.png", dest: "amp-rugged-usb.png" },
  { src: "amphenol_fiber_optic_1791712167719.png", dest: "amp-fiber-optic.png" },
  { src: "amphenol_micro_rf_1791712379419.png", dest: "amp-micro-rf.png" },
  { src: "amphenol_power_ev_1791712832333.png", dest: "amp-power-ev.png" },
];

for (const item of copyMap) {
  const fullSrc = path.join(brainDir, item.src);
  const fullDest = path.join(targetDir, item.dest);
  if (fs.existsSync(fullSrc)) {
    fs.copyFileSync(fullSrc, fullDest);
    console.log(`Copied: ${item.src} -> ${item.dest}`);
  } else {
    console.warn(`File not found: ${fullSrc}`);
  }
}

console.log("Finished copying Amphenol photos!");
