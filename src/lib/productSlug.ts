import { Product } from "@/data/products";

export interface SluggableProduct {
  id?: string | number | undefined;
  name?: string | undefined;
  sku?: string | undefined;
}

/**
 * Generates a clean, unique, URL-safe SEO slug for a product based on its name.
 * e.g. "Amphenol RJ45 Modular Jack" -> "amphenol-rj45-modular-jack"
 * If duplicate product names exist in the catalogue, appends SKU identifier to guarantee uniqueness.
 */
export function getProductSlug(product: SluggableProduct): string {
  const rawName = product.name || product.sku || "product";
  const baseNameSlug = rawName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Known duplicate names across the catalogue that require SKU suffix for 100% uniqueness
  const duplicateNames = [
    "crimp-terminals",
    "zolex-copper-tube-crimping-lugs-two-hole",
    "zolex-copper-tube-crimping-through-connectors",
    "zolex-bimetallic-crimping-lugs-al-cu",
    "zolex-roller-ball-lock-type-steel-cable-ties-coated",
    "zolex-pure-copper-earth-rod-internally-threaded",
  ];

  if (duplicateNames.includes(baseNameSlug) && product.sku) {
    const skuSuffix = product.sku
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return `${baseNameSlug}-${skuSuffix}`;
  }

  return baseNameSlug || `product-${product.id || "item"}`;
}

/**
 * Matches a URL slug against a product list.
 * Supports exact slug match, name slug, SKU slug, raw SKU, and ID.
 */
export function findProductBySlug(products: Product[], slug: string): Product | undefined {
  if (!slug) return undefined;
  const cleanSlug = decodeURIComponent(slug).toLowerCase().replace(/^-+|-+$/g, "");

  return products.find((p) => {
    const slugCalculated = getProductSlug(p).toLowerCase();
    if (slugCalculated === cleanSlug) return true;

    const nameSlug = (p.name || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (nameSlug === cleanSlug) return true;

    const skuSlug = (p.sku || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (skuSlug === cleanSlug || (p.sku && p.sku.toLowerCase() === cleanSlug)) return true;

    if (p.id && String(p.id).toLowerCase() === cleanSlug) return true;

    // Partial slug matching fallback
    if (cleanSlug.length > 5 && (nameSlug.includes(cleanSlug) || cleanSlug.includes(nameSlug))) {
      return true;
    }

    return false;
  });
}
