import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const SUPABASE_URL = "https://xgttkvykqtoppbsfukzr.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhndHRrdnlrcXRvcHBic2Z1a3pyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTI3MjcxNywiZXhwIjoyMTA0ODQ4NzE3fQ.iWnF2ZuGuO439mBXfWtLESKw7sxzTFDQGNkyhKZNFUs";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Check if products table exists and insert schema if needed
async function checkTable() {
  console.log("Checking if products table exists...");
  const { error } = await supabase.from("products").select("id").limit(1);
  if (error) {
    console.log("Table check status:", error.message);
    console.log("Please make sure to execute supabase_schema.sql in the Supabase SQL Editor if tables are not yet created.");
    return false;
  }
  console.log("Products table is present and accessible!");
  return true;
}

checkTable();
