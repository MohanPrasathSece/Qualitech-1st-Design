import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const SUPABASE_URL = "https://xgttkvykqtoppbsfukzr.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhndHRrdnlrcXRvcHBic2Z1a3pyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTI3MjcxNywiZXhwIjoyMTA0ODQ4NzE3fQ.iWnF2ZuGuO439mBXfWtLESKw7sxzTFDQGNkyhKZNFUs";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

function cleanPn(raw) {
  return raw.replace(/\(.*?\)/g, "").trim();
}

function safeFilename(pn) {
  return pn.replace(/[^a-zA-Z0-9_\-\.]/g, "_").replace(/^_+|_+$/g, "");
}

async function syncAll() {
  console.log("Loading products from qualitech_image_catalog_report.json...");
  const reportPath = path.resolve("./scripts/qualitech_image_catalog_report.json");
  const report = JSON.parse(fs.readFileSync(reportPath, "utf-8"));

  const catalog = report.catalog;
  console.log(`Loaded ${catalog.length} products to sync into Supabase!`);

  let updatedCount = 0;
  let batch = [];
  const BATCH_SIZE = 50;

  for (let i = 0; i < catalog.length; i++) {
    const item = catalog[i];
    const sku = item.sku;
    const pn = cleanPn(sku);
    const fname = item.file || (safeFilename(pn) + ".jpg");
    const imgUrl = `/images/products/qualitech/${fname}`;

    batch.push({ sku, image: imgUrl });

    if (batch.length >= BATCH_SIZE || i === catalog.length - 1) {
      // Update each in batch
      await Promise.all(
        batch.map(async (entry) => {
          const { error } = await supabase
            .from("products")
            .update({ image: entry.image })
            .eq("sku", entry.sku);
          if (error) {
            console.error(`Error updating SKU ${entry.sku}:`, error.message);
          } else {
            updatedCount++;
          }
        })
      );
      process.stdout.write(`\r  Updated ${updatedCount}/${catalog.length} products in Supabase...`);
      batch = [];
    }
  }

  console.log(`\n\n[SUCCESS] Successfully synced ${updatedCount} Qualitech product images to Supabase!`);

  // Verify remaining /logo.png in Qualitech
  const { data: remainingLogo } = await supabase
    .from("products")
    .select("sku")
    .eq("brand", "Qualitech")
    .eq("image", "/logo.png");

  console.log(`Remaining Qualitech products with /logo.png in Supabase: ${remainingLogo ? remainingLogo.length : 0}`);
}

syncAll().catch(console.error);
