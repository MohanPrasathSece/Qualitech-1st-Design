import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { Product } from "@/data/products";
import { Order, CartItem } from "./ecommerceStore";

export interface QuoteRequestData {
  fullName: string;
  email: string;
  phone: string;
  companyName?: string | undefined;
  gstin?: string | undefined;
  productCategory: string;
  pinCount?: string | undefined;
  wireGauge?: string | undefined;
  connectorType?: string | undefined;
  estimatedQty: number;
  targetDeliveryDate?: string | undefined;
  technicalSpecs?: string | undefined;
  drawingFile?: File | undefined;
}

export interface SupabaseQuoteRecord {
  id: string;
  rfq_number: string;
  full_name: string;
  email: string;
  phone: string;
  company_name?: string | undefined;
  gstin?: string | undefined;
  product_category: string;
  pin_count?: string | undefined;
  wire_gauge?: string | undefined;
  connector_type?: string | undefined;
  estimated_qty: number;
  target_delivery_date?: string | undefined;
  technical_specs?: string | undefined;
  drawing_attachment_url?: string | undefined;
  status: string;
  quoted_amount?: number | undefined;
  created_at: string;
}

// Convert Product to Supabase Row format
export function productToSupabaseRow(p: Product) {
  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    brand: p.brand,
    category: p.category,
    sub_category: p.subCategory || null,
    description: p.description,
    features: p.features || [],
    specs: p.specs || {},
    industries: p.industries || [],
    featured: Boolean(p.featured),
    image: p.image || null,
    in_stock: p.inStock ?? true,
    external_url: p.externalUrl || null,
    is_enquiry: Boolean(p.isEnquiry),
    price: p.price ?? 0,
    sale_price: p.salePrice || null,
    stock_count: p.stockCount ?? 100,
    low_stock_threshold: p.lowStockThreshold ?? 20,
    min_order_qty: p.minOrderQty ?? 1,
    unit: p.unit || "pcs",
    rating: p.rating ?? 4.9,
    review_count: p.reviewCount ?? 0,
    lead_time: p.leadTime || "24-48 Hours",
    tiered_pricing: p.tieredPricing || [],
    datasheet_url: p.datasheetUrl || null,
    updated_at: new Date().toISOString(),
  };
}

// Convert Supabase Row to Product model
export function supabaseRowToProduct(row: any): Product {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    brand: row.brand,
    category: row.category,
    subCategory: row.sub_category || undefined,
    description: row.description,
    features: Array.isArray(row.features) ? row.features : [],
    specs: row.specs && typeof row.specs === "object" ? row.specs : {},
    industries: Array.isArray(row.industries) ? row.industries : [],
    featured: Boolean(row.featured),
    image: row.image || "/logo.png",
    inStock: Boolean(row.in_stock),
    externalUrl: row.external_url || undefined,
    isEnquiry: Boolean(row.is_enquiry),
    price: row.price ? Number(row.price) : 0,
    salePrice: row.sale_price ? Number(row.sale_price) : undefined,
    stockCount: row.stock_count !== undefined ? Number(row.stock_count) : 100,
    lowStockThreshold: row.low_stock_threshold !== undefined ? Number(row.low_stock_threshold) : 20,
    minOrderQty: row.min_order_qty !== undefined ? Number(row.min_order_qty) : 1,
    unit: row.unit || "pcs",
    rating: row.rating ? Number(row.rating) : 4.9,
    reviewCount: row.review_count ? Number(row.review_count) : 0,
    leadTime: row.lead_time || "24-48 Hours",
    tieredPricing: Array.isArray(row.tiered_pricing) ? row.tiered_pricing : [],
    datasheetUrl: row.datasheet_url || undefined,
  };
}

// ==============================================================================
// PRODUCT OPERATIONS
// ==============================================================================

/** Fetch all products from Supabase */
export async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetch products error:", error.message);
      return null;
    }

    if (!data || data.length === 0) return null;
    return data.map(supabaseRowToProduct);
  } catch (err) {
    console.warn("Supabase fetch failed:", err);
    return null;
  }
}

/** Save or update a product in Supabase */
export async function saveProductToSupabase(product: Product): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const row = productToSupabaseRow(product);
    const { error } = await supabase.from("products").upsert(row, { onConflict: "id" });
    if (error) {
      console.error("Supabase upsert product error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to save product to Supabase:", err);
    return false;
  }
}

/** Delete a product from Supabase */
export async function deleteProductFromSupabase(productId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) {
      console.error("Supabase delete product error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to delete product from Supabase:", err);
    return false;
  }
}

/** Sync whole catalog array to Supabase */
export async function syncAllProductsToSupabase(products: Product[]): Promise<{
  success: boolean;
  count: number;
  error?: string;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, count: 0, error: "Supabase not configured in .env" };
  }

  try {
    const rows = products.map(productToSupabaseRow);
    const { error } = await supabase.from("products").upsert(rows, { onConflict: "id" });

    if (error) {
      return { success: false, count: 0, error: error.message };
    }
    return { success: true, count: rows.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || "Sync failed" };
  }
}

// ==============================================================================
// STORAGE UPLOADS (Images & Technical CAD Drawings)
// ==============================================================================

/** Upload image to Supabase Storage 'product-images' bucket and return public URL */
export async function uploadImageToSupabase(
  file: File,
  folder: string = "products"
): Promise<{ url: string | null; error?: string | undefined }> {
  if (!isSupabaseConfigured || !supabase) {
    // Return temporary local blob URL if Supabase is offline
    return { url: URL.createObjectURL(file) };
  }

  try {
    const fileExt = file.name.split(".").pop() || "png";
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
    const filePath = `${folder}/${Date.now()}_${cleanFileName}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.warn("Storage upload error:", uploadError.message);
      return { url: URL.createObjectURL(file), error: uploadError.message };
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
    return { url: data.publicUrl };
  } catch (err: any) {
    console.error("Storage upload exception:", err);
    return { url: URL.createObjectURL(file), error: err?.message };
  }
}

export const uploadProductImageToSupabase = uploadImageToSupabase;

/** Upload CAD / Spec drawing to Supabase Storage 'cad-drawings' */
export async function uploadDrawingToSupabase(
  file: File
): Promise<{ url: string | null; error?: string | undefined }> {
  if (!isSupabaseConfigured || !supabase) {
    return { url: URL.createObjectURL(file) };
  }

  try {
    const fileExt = file.name.split(".").pop() || "pdf";
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
    const filePath = `rfq/${Date.now()}_${cleanFileName}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("cad-drawings")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      return { url: URL.createObjectURL(file), error: uploadError.message };
    }

    const { data } = supabase.storage.from("cad-drawings").getPublicUrl(filePath);
    return { url: data.publicUrl };
  } catch (err: any) {
    return { url: URL.createObjectURL(file), error: err?.message };
  }
}

// ==============================================================================
// ORDERS OPERATIONS
// ==============================================================================

/** Fetch all orders from Supabase */
export async function fetchOrdersFromSupabase(): Promise<Order[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetch orders error:", error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    // Fetch associated items
    const orders: Order[] = [];
    for (const row of data) {
      const { data: itemsData } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_number", row.order_number);

      const items: CartItem[] = (itemsData || []).map((item: any) => ({
        id: item.product_id,
        quantity: item.quantity,
        unitPrice: Number(item.unit_price),
        customNote: item.custom_note,
        product: {
          id: item.product_id,
          sku: item.product_sku,
          name: item.product_name,
          brand: item.product_brand,
          category: "",
          description: "",
          features: [],
          specs: {},
          industries: [],
          image: "/logo.png",
          inStock: true,
        },
      }));

      orders.push({
        id: row.id,
        orderNumber: row.order_number,
        createdAt: row.created_at,
        customer: row.customer,
        shippingMethod: row.shipping_method,
        paymentMethod: row.payment_method,
        paymentStatus: row.payment_status,
        orderStatus: row.order_status,
        subtotal: Number(row.subtotal),
        discount: Number(row.discount || 0),
        couponCode: row.coupon_code || undefined,
        tax: Number(row.tax),
        shippingCost: Number(row.shipping_cost || 0),
        total: Number(row.total),
        trackingNumber: row.tracking_number || "QC-" + Math.floor(100000 + Math.random() * 900000),
        estimatedDelivery: row.estimated_delivery || "3-5 Business Days",
        items,
      });
    }

    return orders;
  } catch (err) {
    console.warn("Supabase fetch orders failed:", err);
    return null;
  }
}

/** Save an Order to Supabase */
export async function saveOrderToSupabase(order: Order): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const { error: orderError } = await supabase.from("orders").insert({
      order_number: order.orderNumber,
      customer: order.customer,
      shipping_method: order.shippingMethod,
      payment_method: order.paymentMethod,
      payment_status: order.paymentStatus,
      order_status: order.orderStatus,
      subtotal: order.subtotal,
      discount: order.discount,
      coupon_code: order.couponCode || null,
      tax: order.tax,
      shipping_cost: order.shippingCost,
      total: order.total,
      tracking_number: order.trackingNumber,
      estimated_delivery: order.estimatedDelivery,
      created_at: order.createdAt || new Date().toISOString(),
    });

    if (orderError) {
      console.error("Supabase insert order error:", orderError.message);
      return false;
    }

    // Insert order items
    if (order.items && order.items.length > 0) {
      const itemsRows = order.items.map((item) => ({
        order_number: order.orderNumber,
        product_id: item.product.id,
        product_sku: item.product.sku,
        product_name: item.product.name,
        product_brand: item.product.brand,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.unitPrice * item.quantity,
        custom_note: item.customNote || null,
      }));

      await supabase.from("order_items").insert(itemsRows);
    }

    return true;
  } catch (err) {
    console.error("Failed to save order to Supabase:", err);
    return false;
  }
}

/** Update Order in Supabase */
export async function updateOrderInSupabase(
  orderNumber: string,
  updates: Partial<Order>
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };
    if (updates.orderStatus) updatePayload.order_status = updates.orderStatus;
    if (updates.paymentStatus) updatePayload.payment_status = updates.paymentStatus;
    if (updates.trackingNumber) updatePayload.tracking_number = updates.trackingNumber;
    if (updates.estimatedDelivery) updatePayload.estimated_delivery = updates.estimatedDelivery;

    const { error } = await supabase
      .from("orders")
      .update(updatePayload)
      .eq("order_number", orderNumber);

    if (error) {
      console.error("Supabase update order error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to update order in Supabase:", err);
    return false;
  }
}

/** Update Order Status in Supabase */
export async function updateOrderStatusInSupabase(
  orderNumber: string,
  orderStatus: Order["orderStatus"],
  paymentStatus?: Order["paymentStatus"]
): Promise<boolean> {
  return updateOrderInSupabase(orderNumber, {
    orderStatus,
    ...(paymentStatus ? { paymentStatus } : {}),
  });
}

/** Delete Orders from Supabase (for 30-day retention cleanup or admin deletions) */
export async function deleteOrdersFromSupabase(orderNumbers: string[]): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || orderNumbers.length === 0) return false;

  try {
    await supabase.from("order_items").delete().in("order_number", orderNumbers);
    const { error } = await supabase.from("orders").delete().in("order_number", orderNumbers);
    if (error) {
      console.error("Supabase delete orders error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to delete orders from Supabase:", err);
    return false;
  }
}

// ==============================================================================
// QUOTE / CUSTOM CABLE RFQ BACKEND
// ==============================================================================

/** Submit a custom RFQ quotation request */
export async function submitQuoteRequestToSupabase(
  quoteData: QuoteRequestData
): Promise<{ success: boolean; rfqNumber: string; error?: string }> {
  const rfqNumber = "RFQ-" + Math.floor(100000 + Math.random() * 900000);

  let attachmentUrl: string | undefined = undefined;
  if (quoteData.drawingFile) {
    const uploadRes = await uploadDrawingToSupabase(quoteData.drawingFile);
    if (uploadRes.url) {
      attachmentUrl = uploadRes.url;
    }
  }

  if (!isSupabaseConfigured || !supabase) {
    // Store in local storage quote requests
    const stored = JSON.parse(localStorage.getItem("qualitech_rfq_quotes_v1") || "[]");
    stored.unshift({
      id: "local_" + Date.now(),
      rfq_number: rfqNumber,
      full_name: quoteData.fullName,
      email: quoteData.email,
      phone: quoteData.phone,
      company_name: quoteData.companyName,
      gstin: quoteData.gstin,
      product_category: quoteData.productCategory,
      pin_count: quoteData.pinCount,
      wire_gauge: quoteData.wireGauge,
      connector_type: quoteData.connectorType,
      estimated_qty: quoteData.estimatedQty,
      target_delivery_date: quoteData.targetDeliveryDate,
      technical_specs: quoteData.technicalSpecs,
      drawing_attachment_url: attachmentUrl,
      status: "New Enquiry",
      created_at: new Date().toISOString(),
    });
    localStorage.setItem("qualitech_rfq_quotes_v1", JSON.stringify(stored));
    return { success: true, rfqNumber };
  }

  try {
    const { error } = await supabase.from("quote_requests").insert({
      rfq_number: rfqNumber,
      full_name: quoteData.fullName,
      email: quoteData.email,
      phone: quoteData.phone,
      company_name: quoteData.companyName || null,
      gstin: quoteData.gstin || null,
      product_category: quoteData.productCategory,
      pin_count: quoteData.pinCount || null,
      wire_gauge: quoteData.wireGauge || null,
      connector_type: quoteData.connectorType || null,
      estimated_qty: quoteData.estimatedQty || 100,
      target_delivery_date: quoteData.targetDeliveryDate || null,
      technical_specs: quoteData.technicalSpecs || null,
      drawing_attachment_url: attachmentUrl || null,
      status: "New Enquiry",
    });

    if (error) {
      return { success: false, rfqNumber, error: error.message };
    }
    return { success: true, rfqNumber };
  } catch (err: any) {
    return { success: false, rfqNumber, error: err?.message || "Failed to submit RFQ" };
  }
}

/** Fetch all RFQ quote requests for admin */
export async function fetchQuoteRequestsFromSupabase(): Promise<SupabaseQuoteRecord[]> {
  if (!isSupabaseConfigured || !supabase) {
    return JSON.parse(localStorage.getItem("qualitech_rfq_quotes_v1") || "[]");
  }

  try {
    const { data, error } = await supabase
      .from("quote_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) {
      return JSON.parse(localStorage.getItem("qualitech_rfq_quotes_v1") || "[]");
    }
    return data;
  } catch (err) {
    return JSON.parse(localStorage.getItem("qualitech_rfq_quotes_v1") || "[]");
  }
}

/** Delete an RFQ quote enquiry by ID or RFQ Number */
export async function deleteQuoteRequestFromSupabase(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("quote_requests").delete().or(`id.eq.${id},rfq_number.eq.${id}`);
    } catch (err) {
      console.warn("Supabase delete quote error:", err);
    }
  }
  const stored: any[] = JSON.parse(localStorage.getItem("qualitech_rfq_quotes_v1") || "[]");
  const filtered = stored.filter((q) => q.id !== id && q.rfq_number !== id);
  localStorage.setItem("qualitech_rfq_quotes_v1", JSON.stringify(filtered));
  return true;
}
