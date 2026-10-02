import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://xgttkvykqtoppbsfukzr.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhndHRrdnlrcXRvcHBic2Z1a3pyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTI3MjcxNywiZXhwIjoyMTA0ODQ4NzE3fQ.iWnF2ZuGuO439mBXfWtLESKw7sxzTFDQGNkyhKZNFUs";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function check() {
  const { count, error } = await supabase.from("products").select("*", { count: "exact", head: true });
  if (error) {
    console.error("Error querying Supabase:", error.message);
    return;
  }
  console.log("Current total products count in Supabase:", count);

  const { data: sampleData, error: sErr } = await supabase.from("products").select("id, sku, name, brand, category, price, stock_count, image").limit(5);
  if (sErr) {
    console.error("Sample error:", sErr.message);
  } else {
    console.log("Sample records in Supabase:", JSON.stringify(sampleData, null, 2));
  }
}

check();
