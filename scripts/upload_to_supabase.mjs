import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = "https://xgttkvykqtoppbsfukzr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhndHRrdnlrcXRvcHBic2Z1a3pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNzI3MTcsImV4cCI6MjEwNDg0ODcxN30.J4kcTa3eJ5y1IQh6Lb5yc2kP1IUZwdcJXC3giaJq8zY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const productsFile = fs.readFileSync('src/data/products.ts', 'utf8');

// Extract the 16 photoshoot products from PRODUCTS array
const targetSkus = [
  "QT-MIL-38999",
  "QT-CA-SEALED",
  "QT-HARN-PWR-MB",
  "QT-CA-FRC-MB",
  "QT-CA-FRC-HYB",
  "QT-CA-M12-IP68",
  "QT-CA-DB25-BRD",
  "QT-CA-DSUB-MD",
  "QT-CA-LVDS-DISP",
  "QT-CA-LVDS-HD",
  "QT-CA-PWR-TB",
  "QT-CA-QD-SPADE",
  "QT-HARN-RING",
  "QT-HARN-BRAID-LR",
  "QT-HARN-SIG-FERR",
  "QT-CA-DC-BARREL"
];

// Let's parse each product from products.ts
const productBlocks = productsFile.split(/\{\s*id:/g);
const toUpload = [];

for (const b of productBlocks) {
  for (const sku of targetSkus) {
    if (b.includes(`sku: "${sku}"`)) {
      const idMatch = b.match(/^\s*"([^"]+)"/);
      const nameMatch = b.match(/name:\s*"([^"]+)"/);
      const brandMatch = b.match(/brand:\s*"([^"]+)"/);
      const catMatch = b.match(/category:\s*"([^"]+)"/);
      const subCatMatch = b.match(/subCategory:\s*"([^"]+)"/);
      const descMatch = b.match(/description:\s*"([^"]+)"/);
      const featMatch = b.match(/features:\s*(\[[^\]]+\])/);
      const specsMatch = b.match(/specs:\s*(\{[^\}]+\})/);
      const indMatch = b.match(/industries:\s*(\[[^\]]+\])/);
      const imgMatch = b.match(/image:\s*"([^"]+)"/);
      const priceMatch = b.match(/price:\s*([0-9.]+)/);
      const stockMatch = b.match(/stockCount:\s*([0-9]+)/);

      let features = [];
      try { features = JSON.parse(featMatch ? featMatch[1] : '[]'); } catch(e){}
      let specs = {};
      try { specs = JSON.parse(specsMatch ? specsMatch[1] : '{}'); } catch(e){}
      let industries = [];
      try { industries = JSON.parse(indMatch ? indMatch[1] : '[]'); } catch(e){}

      toUpload.push({
        id: idMatch ? idMatch[1] : `qt-${sku.toLowerCase()}`,
        sku: sku,
        name: nameMatch ? nameMatch[1] : sku,
        brand: brandMatch ? brandMatch[1] : "Qualitech",
        category: catMatch ? catMatch[1] : "Custom Cable Assemblies",
        sub_category: subCatMatch ? subCatMatch[1] : "Custom Wire Harnesses",
        description: descMatch ? descMatch[1] : "",
        features: features,
        specs: specs,
        industries: industries,
        featured: true,
        image: imgMatch ? imgMatch[1] : null,
        in_stock: true,
        price: priceMatch ? parseFloat(priceMatch[1]) : 1000,
        stock_count: stockMatch ? parseInt(stockMatch[1]) : 100,
        is_enquiry: true,
        lead_time: "24-48 Hours",
        unit: "pcs"
      });
    }
  }
}

console.log(`Found ${toUpload.length} products to upload to Supabase`);

async function run() {
  for (const item of toUpload) {
    const { data, error } = await supabase.from('products').upsert(item, { onConflict: 'id' });
    if (error) {
      console.error(`Error uploading ${item.sku}:`, error.message);
    } else {
      console.log(`Successfully upserted to Supabase: ${item.sku} - ${item.name}`);
    }
  }
  console.log('Finished uploading all products to Supabase!');
}

run();
