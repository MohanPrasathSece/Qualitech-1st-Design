import { PRODUCTS, Product } from "@/data/products";

const STORAGE_KEY = "qualitech_products_catalogue_v1";

// Event for cross-component re-renders
const PRODUCTS_UPDATED_EVENT = "qualitech:products_updated";

export function getStoredProducts(): Product[] {
  if (typeof window === "undefined") return PRODUCTS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Failed to load products from localStorage", err);
  }
  return PRODUCTS;
}

export function saveStoredProducts(products: Product[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent(PRODUCTS_UPDATED_EVENT, { detail: products }));
  } catch (err) {
    console.error("Failed to save products to localStorage", err);
  }
}

export function addStoredProduct(product: Product): Product[] {
  const current = getStoredProducts();
  // Ensure unique ID
  const id = product.id || `prod-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const newProduct: Product = { ...product, id };
  const updated = [newProduct, ...current];
  saveStoredProducts(updated);
  return updated;
}

export function updateStoredProduct(id: string, updates: Partial<Product>): Product[] {
  const current = getStoredProducts();
  const updated = current.map((p) => (p.id === id ? { ...p, ...updates } : p));
  saveStoredProducts(updated);
  return updated;
}

export function deleteStoredProduct(id: string): Product[] {
  const current = getStoredProducts();
  const updated = current.filter((p) => p.id !== id);
  saveStoredProducts(updated);
  return updated;
}

export function resetStoredProductsToDefault(): Product[] {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(PRODUCTS_UPDATED_EVENT, { detail: PRODUCTS }));
  }
  return PRODUCTS;
}

export function exportProductsToJson(): string {
  const products = getStoredProducts();
  return JSON.stringify(products, null, 2);
}

export function exportProductsToCsv(): string {
  const products = getStoredProducts();
  const headers = ["ID", "SKU", "Name", "Brand", "Category", "SubCategory", "InStock", "Featured", "Description"];
  
  const rows = products.map((p) => [
    `"${p.id || ""}"`,
    `"${(p.sku || "").replace(/"/g, '""')}"`,
    `"${(p.name || "").replace(/"/g, '""')}"`,
    `"${p.brand}"`,
    `"${(p.category || "").replace(/"/g, '""')}"`,
    `"${(p.subCategory || "").replace(/"/g, '""')}"`,
    p.inStock ? "Yes" : "No",
    p.featured ? "Yes" : "No",
    `"${(p.description || "").replace(/"/g, '""')}"`,
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export function importProductsFromJson(jsonStr: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) {
      return { success: false, count: 0, error: "Uploaded JSON is not an array of products." };
    }
    // Validate that items have minimal structure
    const valid = parsed.filter((item) => item && item.name && item.brand);
    if (valid.length === 0) {
      return { success: false, count: 0, error: "No valid product entries found in the file." };
    }
    saveStoredProducts(valid as Product[]);
    return { success: true, count: valid.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || "Invalid JSON syntax." };
  }
}
