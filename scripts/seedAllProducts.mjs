import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const SUPABASE_URL = "https://xgttkvykqtoppbsfukzr.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhndHRrdnlrcXRvcHBic2Z1a3pyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTI3MjcxNywiZXhwIjoyMTA0ODQ4NzE3fQ.iWnF2ZuGuO439mBXfWtLESKw7sxzTFDQGNkyhKZNFUs";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function seed() {
  console.log("Reading products from data file...");
  const filePath = path.resolve("./src/data/products.ts");
  const content = fs.readFileSync(filePath, "utf-8");

  // Extract products array using regex / JSON pattern
  const productsStart = content.indexOf("export const PRODUCTS: Product[] = [");
  if (productsStart === -1) {
    console.error("Could not find PRODUCTS in src/data/products.ts");
    return;
  }

  // Evaluate the TS array or extract objects
  const rawArray = content.slice(productsStart + "export const PRODUCTS: Product[] = [".length);
  const closingIdx = rawArray.lastIndexOf("];");
  const rawProductsStr = rawArray.slice(0, closingIdx);

  // Clean and transform TS object syntax into standard objects
  // We can use Function constructor in a sandbox to parse the array safely
  const sanitized = rawProductsStr
    .replace(/image:\s*[a-zA-Z0-9_]+/g, 'image: "/logo.png"') // Replace imported image symbols with string path
    .replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, ''); // Strip comments

  let products = [];
  try {
    const fn = new Function(`return [ ${sanitized} ];`);
    products = fn();
    console.log(`Parsed ${products.length} products from products.ts!`);
  } catch (err) {
    console.error("Failed to parse products via sandbox:", err.message);
    return;
  }

  // Format for Supabase
  const rows = products.map((p, idx) => ({
    id: p.id || `prod_${idx + 1}`,
    sku: p.sku || `QT-SKU-${idx + 100}`,
    name: p.name,
    brand: p.brand || "Qualitech",
    category: p.category || "Connectors",
    sub_category: p.subCategory || null,
    description: p.description || "",
    features: p.features || [],
    specs: p.specs || {},
    industries: p.industries || [],
    featured: Boolean(p.featured),
    image: p.image || "/logo.png",
    in_stock: p.inStock ?? true,
    external_url: p.externalUrl || null,
    is_enquiry: Boolean(p.isEnquiry),
    price: p.price || (p.brand === "Amphenol" ? 2850 : p.brand === "Zolex" ? 650 : 4500) + (idx % 12) * 50,
    sale_price: p.salePrice || null,
    stock_count: p.stockCount || 100,
    low_stock_threshold: p.lowStockThreshold || 15,
    min_order_qty: p.minOrderQty || 1,
    unit: p.unit || "pcs",
    rating: p.rating || 4.8,
    review_count: p.reviewCount || 12,
    lead_time: p.leadTime || "24-48 Hours",
    tiered_pricing: p.tieredPricing || [],
    datasheet_url: p.datasheetUrl || null,
  }));

  console.log(`Upserting ${rows.length} products into Supabase 'products' table...`);

  // Upsert in batches of 50
  const batchSize = 50;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from("products").upsert(batch, { onConflict: "id" });
    if (error) {
      console.error(`Batch ${Math.floor(i / batchSize) + 1} error:`, error.message);
    } else {
      console.log(`Batch ${Math.floor(i / batchSize) + 1} (${batch.length} products) uploaded successfully!`);
    }
  }

  console.log("Supabase seeding completed successfully!");
}

seed();
