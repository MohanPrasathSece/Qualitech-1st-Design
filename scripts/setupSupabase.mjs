import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://xgttkvykqtoppbsfukzr.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhndHRrdnlrcXRvcHBic2Z1a3pyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTI3MjcxNywiZXhwIjoyMTA0ODQ4NzE3fQ.iWnF2ZuGuO439mBXfWtLESKw7sxzTFDQGNkyhKZNFUs";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function test() {
  console.log("Testing Supabase connection to:", SUPABASE_URL);
  
  // Test storage buckets
  const { data: buckets, error: bError } = await supabase.storage.listBuckets();
  if (bError) {
    console.log("Storage buckets check error:", bError.message);
  } else {
    console.log("Existing Storage buckets:", buckets.map(b => b.name));
  }

  // Create product-images, cad-drawings, invoices buckets if not existing
  const requiredBuckets = ['product-images', 'cad-drawings', 'invoices'];
  for (const bName of requiredBuckets) {
    if (!buckets || !buckets.some(b => b.name === bName)) {
      console.log(`Creating public storage bucket: ${bName}...`);
      const { data, error } = await supabase.storage.createBucket(bName, { public: true });
      if (error) {
        console.log(`Failed to create bucket ${bName}:`, error.message);
      } else {
        console.log(`Bucket ${bName} created successfully!`);
      }
    }
  }

  // Test products table
  const { data: prodData, error: pError } = await supabase.from('products').select('count', { count: 'exact', head: true });
  if (pError) {
    console.log("Products table query:", pError.message, "(Make sure to run supabase_schema.sql in Supabase SQL editor)");
  } else {
    console.log("Products table ready! Count:", prodData);
  }
}

test();
