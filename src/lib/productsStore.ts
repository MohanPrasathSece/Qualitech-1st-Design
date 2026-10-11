import { PRODUCTS, Product } from "@/data/products";
import { getProductDefaultPrice, getProductTieredPricing } from "./ecommerceStore";

const STORAGE_KEY = "qualitech_products_catalogue_v15";

// Event for cross-component re-renders
export const PRODUCTS_UPDATED_EVENT = "qualitech:products_updated";

function resolveDefaultImage(p: any): string {
  const brand = String(p.brand || "").trim();
  const rawImg = String(p.image || "").trim();

  // If brand is Amphenol, resolve its specific category image (skip generic fallback amp-fci-01.jpg)
  if (brand === "Amphenol" && (!rawImg || rawImg === "/images/products/amphenol/amp-fci-01.jpg" || rawImg.includes("qualitech"))) {
    // proceed to Amphenol specific mapping below
  } else if (rawImg && rawImg !== "/logo.png" && !rawImg.endsWith("/logo.png") && !["p1", "p2", "p3", "p4", "p5", "p6"].includes(rawImg)) {
    return rawImg;
  }

  // Qualitech product image auto-mapping
  if (brand === "Qualitech" && p.sku) {
    const pn = String(p.sku).replace(/\(.*?\)/g, "").trim();
    const safeSku = pn.replace(/[^a-zA-Z0-9_\-\.]/g, "_").replace(/^_+|_+$/g, "");
    return `/images/products/qualitech/${safeSku}.jpg`;
  }

  if (brand === "Amphenol") {
    const text = `${p.sku || ""} ${p.name || ""} ${p.category || ""} ${p.subCategory || ""}`.toLowerCase();
    if (text.includes("gnss") || text.includes("gps")) {
      return "/images/products/amphenol/amp-gnss-antenna.png";
    }
    if (text.includes("cellular") || text.includes("5g") || text.includes("4g") || text.includes("lte") || text.includes("telematics") || text.includes("combo")) {
      return "/images/products/amphenol/amp-cellular-antenna.png";
    }
    if (text.includes("wi-fi") || text.includes("wifi") || text.includes("bluetooth")) {
      return "/images/products/amphenol/amp-wifi-antenna.png";
    }
    if (text.includes("embedded") || text.includes("internal") || text.includes("fpc") || text.includes("nfc")) {
      return "/images/products/amphenol/amp-embedded-antenna.png";
    }
    if (text.includes("backplane") || text.includes("paladin") || text.includes("pcie") || text.includes("high-speed")) {
      return "/images/products/amphenol/amp-paladin-backplane.png";
    }
    if (text.includes("sheerpwr") || text.includes("circular") || text.includes("mil-spec") || text.includes("circ")) {
      return "/images/products/amphenol/amp-sheerpwr-circular.png";
    }
    if (text.includes("ethernet") || text.includes("single pair") || text.includes("spe") || text.includes("m12") || text.includes("m8")) {
      return "/images/products/amphenol/amp-spe-ethernet.png";
    }
    if (text.includes("micro-miniature") || text.includes("micro rf") || text.includes("micro-coax") || text.includes("mcx") || text.includes("mmcx")) {
      return "/images/products/amphenol/amp-micro-rf.png";
    }
    if (text.includes("coaxial") || text.includes("bnc") || text.includes("filter rf") || text.includes("sma") || text.includes("rf ")) {
      return "/images/products/amphenol/amp-rf-bnc.png";
    }
    if (text.includes("usb") || text.includes("modular") || text.includes("rj45") || text.includes("musb")) {
      return "/images/products/amphenol/amp-rugged-usb.png";
    }
    if (text.includes("fiber") || text.includes("optical") || text.includes("transceiver")) {
      return "/images/products/amphenol/amp-fiber-optic.png";
    }
    if (text.includes("power") || text.includes("radsok") || text.includes("hvsl") || text.includes("high-voltage") || text.includes("busbar")) {
      return "/images/products/amphenol/amp-power-ev.png";
    }
    if (text.includes("dac") || text.includes("copper cable") || text.includes("cable assembl")) {
      return "/images/products/amphenol/amp-dac-01.jpg";
    }
    return "/images/products/amphenol/amp-fci-01.jpg";
  }

  if (brand === "Zolex") {
    return "/images/products/qualitech/cat-dsub-connector.jpg";
  }

  return "/images/products/qualitech/cat-wire-to-board.jpg";
}

/**
 * Ensures that all products returned have consistent e-commerce pricing & inventory
 */
function normalizeProduct(p: any): Product {
  const rawBrand = String(p.brand || "").trim();
  const brand: Product["brand"] = (rawBrand === "Zolex" || rawBrand === "Qualitech" ? rawBrand : "Amphenol") as Product["brand"];

  const tempProd: Product = {
    id: p.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    sku: p.sku || `QT-${Math.floor(1000 + Math.random() * 9000)}`,
    name: p.name || "Precision Industrial Component",
    brand,
    category: p.category || "General Interconnects",
    subCategory: p.subCategory || "",
    description: p.description || "",
    features: Array.isArray(p.features) && p.features.length > 0 ? p.features : ["High reliability industrial grade", "100% Quality Tested"],
    specs: typeof p.specs === "object" && p.specs !== null ? p.specs : { Manufacturer: brand },
    industries: Array.isArray(p.industries) && p.industries.length > 0 ? p.industries : ["Industrial Automation", "Telecommunications"],
    featured: Boolean(p.featured),
    image: resolveDefaultImage({ ...p, brand }),
    inStock: p.inStock !== undefined ? Boolean(p.inStock) : true,
    externalUrl: p.externalUrl || "",
    isEnquiry: Boolean(p.isEnquiry),
    stockCount: typeof p.stockCount === "number" ? p.stockCount : 120,
    lowStockThreshold: typeof p.lowStockThreshold === "number" ? p.lowStockThreshold : 15,
    minOrderQty: typeof p.minOrderQty === "number" ? p.minOrderQty : 1,
    unit: p.unit || "pcs",
    rating: typeof p.rating === "number" ? p.rating : 4.8,
    reviewCount: typeof p.reviewCount === "number" ? p.reviewCount : 24,
    leadTime: p.leadTime || "Ships in 24-48 Hours",
    price: typeof p.price === "number" && p.price > 0 ? p.price : undefined,
    salePrice: typeof p.salePrice === "number" && p.salePrice > 0 ? p.salePrice : undefined,
    datasheetUrl: p.datasheetUrl || "",
  };

  if (!tempProd.price) {
    tempProd.price = getProductDefaultPrice(tempProd);
  }
  if (!tempProd.tieredPricing) {
    tempProd.tieredPricing = getProductTieredPricing(tempProd);
  }

  return tempProd;
}

export function getStoredProducts(): Product[] {
  if (typeof window === "undefined") return PRODUCTS.map(normalizeProduct);
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= PRODUCTS.length) {
        return parsed.map(normalizeProduct);
      }
    }
  } catch (err) {
    console.error("Failed to load products from localStorage", err);
  }
  const defaultList = PRODUCTS.map(normalizeProduct);
  saveStoredProducts(defaultList);
  return defaultList;
}

export function saveStoredProducts(products: Product[]): void {
  if (typeof window === "undefined") return;
  try {
    const normalized = products.map(normalizeProduct);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent(PRODUCTS_UPDATED_EVENT, { detail: normalized }));
  } catch (err) {
    console.error("Failed to save products to localStorage", err);
  }
}

export function addStoredProduct(product: Partial<Product>): Product[] {
  const current = getStoredProducts();
  const id = product.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const normalized = normalizeProduct({ ...product, id });
  const updated = [normalized, ...current];
  saveStoredProducts(updated);
  return updated;
}

export function updateStoredProduct(id: string, updates: Partial<Product>): Product[] {
  const current = getStoredProducts();
  const updated = current.map((p) => (p.id === id || p.sku === id ? normalizeProduct({ ...p, ...updates }) : p));
  saveStoredProducts(updated);
  return updated;
}

export function deleteStoredProduct(id: string): Product[] {
  const current = getStoredProducts();
  const updated = current.filter((p) => p.id !== id && p.sku !== id);
  saveStoredProducts(updated);
  return updated;
}

export function resetStoredProductsToDefault(): Product[] {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
    const defaults = PRODUCTS.map(normalizeProduct);
    window.dispatchEvent(new CustomEvent(PRODUCTS_UPDATED_EVENT, { detail: defaults }));
    return defaults;
  }
  return PRODUCTS.map(normalizeProduct);
}

export function exportProductsToJson(): string {
  const products = getStoredProducts();
  return JSON.stringify(products, null, 2);
}

export function exportProductsToCsv(): string {
  const products = getStoredProducts();
  const headers = [
    "ID",
    "SKU",
    "Name",
    "Brand",
    "Category",
    "SubCategory",
    "Price",
    "SalePrice",
    "StockCount",
    "InStock",
    "Featured",
    "Unit",
    "Description",
    "Industries",
  ];

  const rows = products.map((p) => [
    `"${p.id || ""}"`,
    `"${(p.sku || "").replace(/"/g, '""')}"`,
    `"${(p.name || "").replace(/"/g, '""')}"`,
    `"${p.brand}"`,
    `"${(p.category || "").replace(/"/g, '""')}"`,
    `"${(p.subCategory || "").replace(/"/g, '""')}"`,
    p.price || 0,
    p.salePrice || "",
    p.stockCount || 100,
    p.inStock ? "1" : "0",
    p.featured ? "1" : "0",
    `"${p.unit || "pcs"}"`,
    `"${(p.description || "").replace(/"/g, '""')}"`,
    `"${(p.industries || []).join(", ")}"`,
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

/**
 * Robust CSV parser that handles quotes, multiline values, and both WooCommerce & Custom formats
 */
export function parseCsvContent(csvText: string): Record<string, string>[] {
  const clean = csvText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let insideQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const nextChar = clean[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      currentRow.push(currentField);
      currentField = "";
    } else if (char === "\n" && !insideQuotes) {
      currentRow.push(currentField);
      if (currentRow.some((f) => f.trim() !== "")) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = "";
    } else {
      currentField += char;
    }
  }
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some((f) => f.trim() !== "")) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2 || !rows[0]) return [];

  const firstRow = rows[0];
  const headers = firstRow.map((h) => h.trim().replace(/^"|"$/g, ""));
  const records: Record<string, string>[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;
    const record: Record<string, string> = {};
    headers.forEach((header, colIndex) => {
      const val = row[colIndex];
      record[header] = val !== undefined ? val.trim() : "";
    });
    records.push(record);
  }

  return records;
}

export function importProductsFromCsv(csvText: string): { success: boolean; count: number; error?: string | undefined } {
  try {
    const records = parseCsvContent(csvText);
    if (records.length === 0) {
      return { success: false, count: 0, error: "No data rows found in the CSV." };
    }

    const newProducts: Product[] = [];

    for (const row of records) {
      // Check for either WooCommerce export format or simple CSV format
      const name = row["Name"] || row["name"] || row["Title"] || row["title"];
      if (!name) continue;

      const sku = row["SKU"] || row["sku"] || `QT-${Math.floor(1000 + Math.random() * 9000)}`;
      const rawBrand = row["Brands"] || row["Brand"] || row["brand"] || "Qualitech";
      let brand: Product["brand"] = "Qualitech";
      if (rawBrand.toLowerCase().includes("amphenol")) brand = "Amphenol";
      else if (rawBrand.toLowerCase().includes("zolex")) brand = "Zolex";

      // Category parsing
      let category = row["Category"] || row["category"] || row["Categories"] || "Electronics Components";
      let subCategory = row["SubCategory"] || row["subCategory"] || "";

      if (row["Categories"] && row["Categories"].includes(">")) {
        const parts = row["Categories"].split(">").map((s) => s.trim());
        category = parts[0] || category;
        subCategory = parts[1] || subCategory;
      }

      // Industries / Tags
      const tags = row["Tags"] || row["Industries"] || "";
      const industries = tags
        ? tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0 && t !== brand)
        : ["Telecommunications", "Industrial Automation"];

      // Price
      const rawPrice = row["Regular price"] || row["Price"] || row["price"] || "0";
      const rawSalePrice = row["Sale price"] || row["sale_price"] || row["SalePrice"];
      const price = parseFloat(rawPrice) > 0 ? parseFloat(rawPrice) : undefined;
      const salePrice = rawSalePrice && parseFloat(rawSalePrice) > 0 ? parseFloat(rawSalePrice) : undefined;

      // Stock
      const inStock = row["In stock?"] === "1" || row["InStock"] === "Yes" || row["InStock"] === "1" || row["InStock"] === "true";
      const stockCount = parseInt(row["Stock"] || row["StockCount"] || "100", 10) || 100;
      const featured = row["Is featured?"] === "1" || row["Featured"] === "1" || row["Featured"] === "Yes";

      const description = row["Description"] || row["Short description"] || row["description"] || "";
      const image = row["Images"] || row["Image"] || "";
      const externalUrl = row["External URL"] || row["external_url"] || "";

      const newProd = normalizeProduct({
        id: `csv-${sku.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        sku,
        name,
        brand,
        category,
        subCategory,
        description,
        features: ["Precision industrial quality", "Conforms to industry standards"],
        specs: { Manufacturer: brand, SKU: sku },
        industries,
        featured,
        image,
        inStock,
        price,
        salePrice,
        stockCount,
        externalUrl,
      });

      newProducts.push(newProd);
    }

    if (newProducts.length === 0) {
      return { success: false, count: 0, error: "No valid product entries could be parsed from the CSV." };
    }

    const current = getStoredProducts();
    // Merge without duplicates by SKU
    const existingSkus = new Set(current.map((p) => p.sku.toLowerCase()));
    const merged = [...newProducts.filter((p) => !existingSkus.has(p.sku.toLowerCase())), ...current];

    saveStoredProducts(merged);
    return { success: true, count: newProducts.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || "Failed to parse CSV file." };
  }
}

export function importProductsFromJson(jsonStr: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) {
      return { success: false, count: 0, error: "Uploaded JSON is not an array of products." };
    }
    const valid = parsed.filter((item) => item && item.name);
    if (valid.length === 0) {
      return { success: false, count: 0, error: "No valid product entries found in the file." };
    }
    const normalized = valid.map(normalizeProduct);
    saveStoredProducts(normalized);
    return { success: true, count: normalized.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || "Invalid JSON syntax." };
  }
}
