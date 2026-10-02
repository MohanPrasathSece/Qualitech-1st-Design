import fs from "fs";
import path from "path";

const filePath = path.resolve("./src/data/products.ts");
const content = fs.readFileSync(filePath, "utf-8");

const productsStart = content.indexOf("export const PRODUCTS: Product[] = [");
const rawArray = content.slice(productsStart + "export const PRODUCTS: Product[] = [".length);
const closingIdx = rawArray.lastIndexOf("];");
const rawProductsStr = rawArray.slice(0, closingIdx);

const sanitized = rawProductsStr
  .replace(/image:\s*([a-zA-Z0-9_]+)/g, 'image: "$1"')
  .replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '');

const fn = new Function(`return [ ${sanitized} ];`);
const products = fn();

console.log(`Total products: ${products.length}`);
products.forEach((p, i) => {
  console.log(`[${i+1}] ID: ${p.id} | Brand: ${p.brand} | Cat: ${p.category} | Sub: ${p.subCategory || ''} | Name: ${p.name} | Img: ${p.image}`);
});
