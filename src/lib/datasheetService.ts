import { Product } from "@/data/products";
import { jsPDF } from "jspdf";

/**
 * Downloads or opens a product's technical datasheet.
 * If the admin has uploaded a custom datasheet (Base64 PDF, blob, or URL),
 * it downloads or opens that exact file.
 * If no custom file is uploaded, it generates an official branded Qualitech PDF datasheet.
 */
export function downloadProductDatasheet(product: Product): boolean {
  const safeSku = (product.sku || product.name || "Product").replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `Qualitech_${safeSku}_Datasheet.pdf`;

  // 1. If admin uploaded a file or URL:
  if (product.datasheetUrl && product.datasheetUrl.trim()) {
    const url = product.datasheetUrl.trim();

    try {
      if (url.startsWith("data:") || url.startsWith("blob:")) {
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return true;
      }

      // External HTTP/HTTPS link
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return true;
    } catch (err) {
      console.error("Failed to trigger custom datasheet download:", err);
      window.open(url, "_blank");
      return true;
    }
  }

  // 2. Generate a branded PDF datasheet on the fly using jsPDF
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // Top Header Banner
    doc.setFillColor(0, 79, 158); // #004f9e
    doc.rect(0, 0, pageWidth, 24, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("QUALITECH CONNECTRONICS PRIVATE LIMITED", 14, 11);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("ISO 9001:2015 Certified | IPC/WHMA-A-620 Workmanship Standard", 14, 18);
    doc.text("TECHNICAL DATASHEET SPECIFICATION", pageWidth - 14, 15, { align: "right" });

    // Product Title Block
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(product.name, 14, 36);

    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Brand: ${product.brand}   |   Category: ${product.category}${product.subCategory ? ` > ${product.subCategory}` : ""}`, 14, 43);

    // Metadata Grid Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, 48, pageWidth - 28, 22, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("PART NUMBER / SKU", 20, 55);
    doc.text("AVAILABILITY", 80, 55);
    doc.text("STANDARD LEAD TIME", 135, 55);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 79, 158);
    doc.text(product.sku || "N/A", 20, 63);

    doc.setTextColor(22, 101, 52);
    doc.text(product.inStock ? "IN STOCK" : "MADE TO ORDER", 80, 63);

    doc.setTextColor(30, 41, 59);
    doc.text(product.leadTime || "Ships in 24-48 Hours", 135, 63);

    // Section: Description
    let cursorY = 78;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 79, 158);
    doc.text("PRODUCT OVERVIEW", 14, cursorY);

    cursorY += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const splitDesc = doc.splitTextToSize(
      product.description || "High-precision electronic component / cable assembly designed for harsh environment industrial, telecom, and defense applications.",
      pageWidth - 28
    );
    doc.text(splitDesc, 14, cursorY);
    cursorY += splitDesc.length * 5 + 4;

    // Section: Key Features
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 79, 158);
    doc.text("KEY TECHNICAL FEATURES", 14, cursorY);
    cursorY += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const featuresList = (product.features && product.features.length > 0)
      ? product.features
      : ["Industrial grade precision contact materials", "100% Quality Inspected & Verified", "Low contact resistance and high insertion durability"];

    for (const feat of featuresList) {
      doc.setFillColor(0, 79, 158);
      doc.circle(16, cursorY - 1, 0.8, "F");
      const splitFeat = doc.splitTextToSize(feat, pageWidth - 34);
      doc.text(splitFeat, 20, cursorY);
      cursorY += splitFeat.length * 4.5 + 1;
    }

    cursorY += 4;

    // Section: Technical Specifications Table
    if (product.specs && Object.keys(product.specs).length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(0, 79, 158);
      doc.text("SPECIFICATIONS", 14, cursorY);
      cursorY += 5;

      const entries = Object.entries(product.specs);
      for (const [key, val] of entries) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, cursorY - 3.5, pageWidth - 28, 6.5, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text(key, 18, cursorY + 1);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(15, 23, 42);
        doc.text(String(val), 90, cursorY + 1);
        cursorY += 7.5;
        if (cursorY > 260) break;
      }
    }

    cursorY = Math.max(cursorY, 210);

    // Quality Standards Callout Box
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(191, 219, 254);
    doc.roundedRect(14, cursorY, pageWidth - 28, 26, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 64, 175);
    doc.text("MANUFACTURING COMPLIANCE & QUALITY GUARANTEE", 18, cursorY + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("• ISO 9001:2015 Certified Manufacturing Facility (Hyderabad Works)", 18, cursorY + 12);
    doc.text("• 100% Quality Inspected, Cirris Tested & Hipot Insulation Verified", 18, cursorY + 17);
    doc.text("• IPC/WHMA-A-620 Class 3 Workmanship standard for mission-critical reliability", 18, cursorY + 22);

    // Footer
    const footerY = 282;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Qualitech Connectronics Pvt Ltd | Plot No. 37/B, Phase-V, IDA, Cherlapally, Hyderabad - 500051", 14, footerY);
    doc.text("Email: info@qualitechindia.in  |  Web: www.qualitechindia.in", pageWidth - 14, footerY, { align: "right" });

    doc.save(fileName);
    return true;
  } catch (err) {
    console.error("Failed to generate PDF datasheet:", err);
    return false;
  }
}

/**
 * Reads a client-side File (PDF, DOC, etc.) and converts to Base64 Data URL
 * for instant storage and 100% offline downloadable access.
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
