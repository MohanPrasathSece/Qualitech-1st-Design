import fs from "fs";
import path from "path";

const sourceDir = "C:\\My Drive\\Freelance\\Projects\\qualitech-landing-page\\QUALITECH SHOOT PHOTOS BACKGROUND CHANGE -20260922T160148Z-1-001\\QUALITECH SHOOT PHOTOS BACKGROUND CHANGE";
const targetSrcDir = path.resolve("./src/assets/products/qualitech");
const targetPublicDir = path.resolve("./public/images/products/qualitech");

if (!fs.existsSync(targetSrcDir)) fs.mkdirSync(targetSrcDir, { recursive: true });
if (!fs.existsSync(targetPublicDir)) fs.mkdirSync(targetPublicDir, { recursive: true });

const fileMapping = {
  "00829c48-300f-42fb-aab5-ed2de119961b.png": "qt-harn-multibranch-power.png",
  "092a6ad9-b4a8-4d79-bac2-83b2c0181a99.png": "qt-harn-control-ring.png",
  "0aeba736-c0fa-432f-b778-05084c0a88e5.png": "qt-ca-lvds-highdensity.png",
  "1099acf6-91a6-429d-93b2-b16671638171.png": "qt-ca-m12-ip68-sensor.png",
  "2650dd98-aa1c-486f-9e34-937678df5cc7.png": "qt-ca-mil-conduit-38999.png",
  "3f52afcf-a259-4abb-ae4d-77e464b798b2.png": "qt-ca-dsub-multidrop.png",
  "42f4315b-bf90-43bc-b5b6-caf3c6617f61.png": "qt-ca-quickdisconnect-spade.png",
  "48e938af-19a4-41eb-aeb0-be57fb91c485.png": "qt-ca-dsub-multidrop-alt.png",
  "645b858a-56ed-4aed-99d8-57b41cd47e7b.png": "qt-ca-dsub-db25-braided.png",
  "654c2400-1d04-4368-809a-6ae40f63b9f7.png": "qt-ca-dc-barrel-power.png",
  "6fc5472d-a31d-4d5f-9f4d-39684cc693de.png": "qt-harn-control-ring-alt.png",
  "707cd713-c531-49d4-9291-9335f2039d1c.png": "qt-ca-lvds-display.png",
  "7778ea56-989d-404a-b00a-b7aa97deae16.png": "qt-ca-dc-barrel-power-alt.png",
  "82e0f4d1-a8e7-47df-af49-223a7b91b050.png": "qt-harn-braided-longrun.png",
  "8516d60c-f4ba-4573-9b56-f98801ce1259.png": "qt-ca-pwr-terminal-block.png",
  "86e3403d-cf17-497f-8861-cee34b2453c0.png": "qt-ca-ribbon-multibranch.png",
  "963da26b-c393-468f-90e9-cb0f71fa67e8.png": "qt-ca-pwr-terminal-block-detail.png",
  "992c5a48-166e-45c9-9298-5cc6f3443409.png": "qt-ca-ribbon-wago-hybrid.png",
  "a6707a33-e80f-4390-a101-15273ca6f0ed.png": "qt-ca-pwr-terminal-block-alt.png",
  "a9676d0f-7b85-4073-af1d-f476177a84fc.png": "qt-ca-dsub-multidrop-coiled.png",
  "abb6deef-21a3-41e2-977a-4386b4d0dcd5.png": "qt-harn-signal-twisted-ferrule.png",
  "c3fb00f2-eceb-4a1a-a4bd-2575ac42a671.png": "qt-harn-multibranch-power-alt.png",
  "dac0e577-aaf4-4aaa-a0f3-1bbe57884f7d.png": "qt-ca-quickdisconnect-spade-alt.png",
  "db47121c-d46d-4f97-aa60-00833ef80788.png": "qt-harn-signal-twisted-ferrule-alt.png",
  "e34201c5-1f81-4681-95fd-1614cb1889ad.png": "qt-ca-ribbon-multibranch-alt.png",
  "e9fbc527-9040-4df6-8e98-a25a7141d124.png": "qt-ca-auto-weatherproof-sealed.png",
  "f2cac881-d34d-475a-ad65-9b8e89c563b8.png": "qt-ca-ribbon-wago-hybrid-alt.png",
  "f4084f21-6621-49a3-aebc-0c09668af52b.png": "qt-ca-dsub-db25-braided-alt.png",
  "fd06be63-fec9-4c5b-8068-10f60cc9ef3d.png": "qt-ca-m12-ip68-sensor-alt.png",
};

let count = 0;
for (const [rawFile, newName] of Object.entries(fileMapping)) {
  const srcFile = path.join(sourceDir, rawFile);
  if (fs.existsSync(srcFile)) {
    const destSrc = path.join(targetSrcDir, newName);
    const destPub = path.join(targetPublicDir, newName);
    fs.copyFileSync(srcFile, destSrc);
    fs.copyFileSync(srcFile, destPub);
    console.log(`Copied ${rawFile} -> ${newName}`);
    count++;
  } else {
    console.warn(`File not found: ${srcFile}`);
  }
}

console.log(`Successfully mapped and copied ${count} images!`);
