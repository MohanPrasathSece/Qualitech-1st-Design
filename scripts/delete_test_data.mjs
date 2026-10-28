import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://xgttkvykqtoppbsfukzr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhndHRrdnlrcXRvcHBic2Z1a3pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNzI3MTcsImV4cCI6MjEwNDg0ODcxN30.J4kcTa3eJ5y1IQh6Lb5yc2kP1IUZwdcJXC3giaJq8zY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function cleanTestData() {
  console.log("Starting test data purge for live production launch...");

  // 1. Fetch current counts
  const { data: orderItems, error: oiErr } = await supabase.from('order_items').select('id');
  const { data: orders, error: oErr } = await supabase.from('orders').select('id');
  const { data: quotes, error: qErr } = await supabase.from('quote_requests').select('id');

  console.log(`Found:`);
  console.log(`- ${orderItems ? orderItems.length : 0} order items`);
  console.log(`- ${orders ? orders.length : 0} orders`);
  console.log(`- ${quotes ? quotes.length : 0} quote requests / enquiries`);

  // 2. Delete all order_items
  const { error: delOiErr } = await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delOiErr) {
    console.error("Error deleting order_items:", delOiErr.message);
  } else {
    console.log("✓ All order_items purged.");
  }

  // 3. Delete all orders
  const { error: delOErr } = await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delOErr) {
    console.error("Error deleting orders:", delOErr.message);
  } else {
    console.log("✓ All orders purged.");
  }

  // 4. Delete all quote_requests
  const { error: delQErr } = await supabase.from('quote_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delQErr) {
    console.error("Error deleting quote_requests:", delQErr.message);
  } else {
    console.log("✓ All quote_requests / enquiries purged.");
  }

  // Verify counts
  const { data: remOrders } = await supabase.from('orders').select('id');
  const { data: remQuotes } = await supabase.from('quote_requests').select('id');
  console.log(`Remaining in Supabase: ${remOrders ? remOrders.length : 0} orders, ${remQuotes ? remQuotes.length : 0} quotes.`);
}

cleanTestData().catch(console.error);
