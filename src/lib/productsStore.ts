import { PRODUCTS, Product } from "@/data/products";
import { getProductDefaultPrice, getProductTieredPricing } from "./ecommerceStore";
import * as XLSX from "xlsx";

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

/**
 * Imports products from an Excel (.xlsx or .xls) file binary buffer or string.
 * Automatically maps standard industrial product columns and synchronizes with localStorage and the catalog.
 */
export function importProductsFromExcel(
  data: ArrayBuffer | Uint8Array | string
): { success: boolean; count: number; added: number; updated: number; error?: string } {
  try {
    const workbook =
      typeof data === "string"
        ? XLSX.read(data, { type: "binary" })
        : XLSX.read(data, { type: "array" });

    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return { success: false, count: 0, added: 0, updated: 0, error: "Excel spreadsheet has no worksheets." };
    }

    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: "" });

    if (rawRows.length === 0) {
      return { success: false, count: 0, added: 0, updated: 0, error: "The selected Excel sheet contains no product rows." };
    }

    const current = getStoredProducts();
    const existingSkuMap = new Map(current.map((p, idx) => [p.sku.toLowerCase(), idx]));
    let addedCount = 0;
    let updatedCount = 0;
    const workingList = [...current];

    for (const row of rawRows) {
      const keys = Object.keys(row);
      const getKey = (possibleNames: string[]) => {
        const found = keys.find((k) =>
          possibleNames.some((pn) => k.trim().toLowerCase() === pn.toLowerCase())
        );
        return found ? String(row[found]).trim() : "";
      };

      const name = getKey(["Name", "Product Name", "Title", "Part Name", "Item Name"]);
      if (!name) continue;

      const sku =
        getKey(["SKU", "Part Number", "Part No", "Model", "P/N", "Code"]) ||
        `QT-${Math.floor(1000 + Math.random() * 9000)}`;

      const rawBrand = getKey(["Brand", "Manufacturer", "Make", "Brands"]) || "Qualitech";
      let brand: Product["brand"] = "Qualitech";
      if (rawBrand.toLowerCase().includes("amphenol")) brand = "Amphenol";
      else if (rawBrand.toLowerCase().includes("zolex")) brand = "Zolex";

      const category = getKey(["Category", "Categories", "Type", "Product Category"]) || "Electronic Components";
      const subCategory = getKey(["SubCategory", "Sub Category", "Series"]) || "";
      const rawPrice = getKey(["Price", "Regular Price", "Unit Price", "Rate", "Price (INR)"]);
      const rawSalePrice = getKey(["Sale Price", "SalePrice", "Discount Price"]);
      const price = parseFloat(rawPrice) > 0 ? parseFloat(rawPrice) : undefined;
      const salePrice = parseFloat(rawSalePrice) > 0 ? parseFloat(rawSalePrice) : undefined;

      const rawStock = getKey(["Stock", "Stock Count", "StockCount", "Qty", "Quantity"]);
      const stockCount = parseInt(rawStock, 10) || 120;
      const rawInStock = getKey(["In Stock", "InStock", "In stock?", "Availability"]);
      const inStock = rawInStock ? ["yes", "true", "1", "available"].includes(rawInStock.toLowerCase()) : stockCount > 0;

      const unit = getKey(["Unit", "UOM", "Unit of Measure"]) || "pcs";
      const leadTime = getKey(["Lead Time", "LeadTime", "Delivery", "Dispatch"]) || "Ships in 24-48 Hours";
      const description = getKey(["Description", "Short Description", "Details"]) || `${brand} industrial precision component.`;
      const datasheetUrl = getKey(["Datasheet", "Datasheet URL", "DatasheetURL", "PDF", "PDF URL", "Spec Sheet"]);
      const image = getKey(["Image", "Image URL", "ImageURL", "Photo"]);
      const externalUrl = getKey(["External URL", "Link", "URL"]);

      const rawFeatures = getKey(["Features", "Key Features"]);
      const features = rawFeatures
        ? rawFeatures.split(/[;|,]/).map((s) => s.trim()).filter(Boolean)
        : ["Precision industrial quality", "100% Quality Inspected"];

      const rawIndustries = getKey(["Industries", "Industry", "Applications", "Tags"]);
      const industries = rawIndustries
        ? rawIndustries.split(/[;|,]/).map((s) => s.trim()).filter(Boolean)
        : ["Industrial Automation", "Telecommunications"];

      const productPayload: Product = normalizeProduct({
        id: `xl-${sku.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        sku,
        name,
        brand,
        category,
        subCategory,
        price,
        salePrice,
        stockCount,
        inStock,
        unit,
        leadTime,
        description,
        datasheetUrl,
        image,
        externalUrl,
        features,
        industries,
        specs: { Manufacturer: brand, SKU: sku },
      });

      const existingIdx = existingSkuMap.get(sku.toLowerCase());
      if (existingIdx !== undefined) {
        workingList[existingIdx] = { ...workingList[existingIdx], ...productPayload, id: workingList[existingIdx].id };
        updatedCount++;
      } else {
        workingList.unshift(productPayload);
        existingSkuMap.set(sku.toLowerCase(), 0);
        addedCount++;
      }
    }

    if (addedCount === 0 && updatedCount === 0) {
      return { success: false, count: 0, added: 0, updated: 0, error: "No valid product entries could be parsed from the Excel file." };
    }

    saveStoredProducts(workingList);
    return { success: true, count: addedCount + updatedCount, added: addedCount, updated: updatedCount };
  } catch (err: any) {
    return { success: false, count: 0, added: 0, updated: 0, error: err?.message || "Failed to parse Excel spreadsheet." };
  }
}

/**
 * Generates an Excel template (.xlsx) with pre-filled sample products
 * for admin to download, edit, and re-upload.
 */
export function generateProductExcelTemplate(): Uint8Array {
  const headers = [
    "SKU",
    "Name",
    "Brand",
    "Category",
    "SubCategory",
    "Price",
    "SalePrice",
    "Stock",
    "Unit",
    "InStock",
    "DatasheetURL",
    "LeadTime",
    "Description",
    "Features",
    "Industries",
  ];

  const sampleRows = [
    [
      "QT-HDR-254",
      "2.54mm Dual Row Pin Header 40-Pin",
      "Qualitech",
      "PCB Connectors",
      "Pin Headers",
      "45.00",
      "39.00",
      "500",
      "pcs",
      "Yes",
      "https://example.com/datasheets/QT-HDR-254.pdf",
      "Ships in 24 Hours",
      "High temperature nylon pin header with gold plated contacts.",
      "Gold plated contacts; UL94V-0 rated; High mating cycles",
      "Industrial Automation; Telecommunications",
    ],
    [
      "AMP-BNC-75R",
      "Amphenol 75 Ohm BNC Straight Plug",
      "Amphenol",
      "RF & Coaxial Connectors",
      "BNC Connectors",
      "185.00",
      "",
      "250",
      "pcs",
      "Yes",
      "https://www.amphenol-cs.com/datasheet/bnc75.pdf",
      "Ships in 24-48 Hours",
      "Precision RF coaxial connector engineered for broadcast and high-speed video signals.",
      "75 Ohm impedance; 3 GHz bandwidth; Bayonet coupling",
      "Broadcasting; Defense; Telecom",
    ],
    [
      "ZLX-LUG-35",
      "Zolex Heavy-Duty Copper Cable Lug 35 sq mm",
      "Zolex",
      "Cable Lugs & Terminals",
      "Copper Lugs",
      "72.00",
      "",
      "1000",
      "pcs",
      "Yes",
      "",
      "Ships in 24 Hours",
      "Pure electrolytic copper tube lug with tin plating for optimal conductivity and corrosion resistance.",
      "Electrolytic copper; Electro-tinned; Inspection hole",
      "Power Distribution; Switchgear; Railways",
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
  ws["!cols"] = [
    { wch: 16 },
    { wch: 38 },
    { wch: 14 },
    { wch: 24 },
    { wch: 18 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
    { wch: 8 },
    { wch: 10 },
    { wch: 35 },
    { wch: 20 },
    { wch: 45 },
    { wch: 35 },
    { wch: 30 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Products_Template");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Uint8Array(wbout);
}

/**
 * Exports all active catalogue products to an Excel (.xlsx) file.
 */
export function exportProductsToExcel(): Uint8Array {
  const products = getStoredProducts();
  const rows = products.map((p) => ({
    SKU: p.sku,
    Name: p.name,
    Brand: p.brand,
    Category: p.category,
    SubCategory: p.subCategory || "",
    Price: p.price || 0,
    SalePrice: p.salePrice || "",
    Stock: p.stockCount || 100,
    Unit: p.unit || "pcs",
    InStock: p.inStock ? "Yes" : "No",
    DatasheetURL: p.datasheetUrl || "",
    LeadTime: p.leadTime || "",
    Description: p.description,
    Features: (p.features || []).join("; "),
    Industries: (p.industries || []).join("; "),
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Catalogue");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Uint8Array(wbout);
}

