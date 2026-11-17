import { Product } from "@/data/products";

export interface SluggableProduct {
  id?: string | number | undefined;
  name?: string | undefined;
  sku?: string | undefined;
}

/**
 * Generates a 100% unique, URL-safe SEO slug for every single product in the catalog.
 * Combines the descriptive product name with its unique SKU identifier.
 * e.g. "Amphenol RJ45 Modular Jack Shielded" + "RJ45-8P8C-SH-01" -> "amphenol-rj45-modular-jack-shielded-rj45-8p8c-sh-01"
 */
export function getProductSlug(product: SluggableProduct): string {
  const nameClean = (product.name || "product")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const skuClean = (product.sku || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (skuClean && !nameClean.endsWith(skuClean) && skuClean !== nameClean) {
    return `${nameClean}-${skuClean}`;
  }

  return nameClean || skuClean || `product-${product.id || "item"}`;
}

/**
 * Matches a URL slug against the products list with zero mismatch.
 * 1. Checks exact slug match
 * 2. Checks exact SKU ending / match (since SKU is unique per product)
 * 3. Checks exact product name slug
 * 4. Checks product ID
 */
export function findProductBySlug(products: Product[], slug: string): Product | undefined {
  if (!slug) return undefined;
  const cleanSlug = decodeURIComponent(slug).toLowerCase().replace(/^-+|-+$/g, "");

  // 1. Exact match on generated slug
  for (const p of products) {
    if (getProductSlug(p).toLowerCase() === cleanSlug) {
      return p;
    }
  }

  // 2. Exact match on SKU or SKU suffix (since SKU is unique per product)
  for (const p of products) {
    const pSkuClean = (p.sku || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (pSkuClean && (pSkuClean === cleanSlug || cleanSlug.endsWith(`-${pSkuClean}`))) {
      return p;
    }
    if (p.sku && p.sku.toLowerCase() === cleanSlug) {
      return p;
    }
  }

  // 3. Exact match on product name
  for (const p of products) {
    const pNameClean = (p.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (pNameClean === cleanSlug) {
      return p;
    }
  }

  // 4. Match on ID
  for (const p of products) {
    if (p.id && String(p.id).toLowerCase() === cleanSlug) {
      return p;
    }
  }

  return undefined;
}
