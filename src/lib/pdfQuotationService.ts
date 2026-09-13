import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { CartItem, Order } from "./ecommerceStore";
import { RFQFormData } from "./emailService";

export interface QuoteCustomerInfo {
  fullName?: string | undefined;
  companyName?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
  address?: string | undefined;
  city?: string | undefined;
  state?: string | undefined;
  pincode?: string | undefined;
  gstin?: string | undefined;
}

export interface QuoteLineItem {
  sku: string;
  name: string;
  specs?: string | undefined;
  brand?: string | undefined;
  quantity: number;
  unitPrice: number;
  hsn?: string | undefined;
}

/**
 * Convert numbers to Indian Rupees in words
 */
function numberToWordsINR(amount: number): string {
  const units: string[] = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens: string[] = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens: string[] = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertTwoDigits(n: number): string {
    if (n < 10) return units[n] || "";
    if (n < 20) return teens[n - 10] || "";
    const tensStr = tens[Math.floor(n / 10)] || "";
    const unitStr = n % 10 !== 0 ? " " + (units[n % 10] || "") : "";
    return tensStr + unitStr;
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;
    let str = "";
    if (hundred > 0) {
      str += (units[hundred] || "") + " Hundred";
      if (remainder > 0) str += " and ";
    }
    if (remainder > 0) {
      str += convertTwoDigits(remainder);
    }
    return str;
  }

  const rounded = Math.round(amount);
  if (rounded === 0) return "Zero Rupees Only";

  const crore = Math.floor(rounded / 10000000);
  const lakh = Math.floor((rounded % 10000000) / 100000);
  const thousand = Math.floor((rounded % 100000) / 1000);
  const remainder = rounded % 1000;

  let result = "";
  if (crore > 0) result += convertTwoDigits(crore) + " Crore ";
  if (lakh > 0) result += convertTwoDigits(lakh) + " Lakh ";
  if (thousand > 0) result += convertTwoDigits(thousand) + " Thousand ";
  if (remainder > 0) result += convertThreeDigits(remainder) + " ";

  return result.trim() + " Rupees Only";
}

/**
 * Generate and download a branded, print-ready Proforma PDF Quotation
 */
export function generateBrandedPDFQuotation(options: {
  quoteNumber?: string | undefined;
  customer?: QuoteCustomerInfo | undefined;
  items: QuoteLineItem[];
  shippingFee?: number | undefined;
  notes?: string | undefined;
  isRFQ?: boolean | undefined;
}): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const quoteRef = options.quoteNumber || `QT-QUO-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const customer = options.customer || {
    fullName: "Valued Industrial Client",
    companyName: "Industrial Procurement Dept.",
    email: "procurement@client.com",
    phone: "+91 -",
    address: "Registered Industrial Facility",
  };

  // 1. Top Decorative Brand Bar
  doc.setFillColor(0, 79, 158); // Qualitech Blue (#004f9e)
  doc.rect(0, 0, pageWidth, 8, "F");

  doc.setFillColor(245, 158, 11); // Gold Accent (#f59e0b)
  doc.rect(0, 8, pageWidth, 2, "F");

  // 2. Company Header
  doc.setTextColor(0, 79, 158);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("QUALITECH CONNECTORICS PRIVATE LIMITED", 14, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Electronic Components Distribution & Custom Cable Assembly Manufacturing", 14, 25);
  doc.text("Plot No. 84, Phase-II, IDA Cherlapally, Hyderabad - 500051, Telangana, India", 14, 29);
  doc.text("Phone: +91 98490 01484  |  Email: zyradigitalsofficial@gmail.com  |  Web: qualitechconnectronics.com", 14, 33);
  doc.text("GSTIN: 36AAPFQ2748F1ZT  |  State Code: 36 (Telangana)  |  ISO 9001:2015 & IPC-WHMA-A-620", 14, 37);

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 40, pageWidth - 14, 40);

  // 3. Document Title Badge
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 44, pageWidth - 28, 12, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  const docTitle = options.isRFQ ? "FORMAL RFQ TECHNICAL QUOTATION & ESTIMATE" : "FORMAL PROFORMA QUOTATION";
  doc.text(docTitle, 18, 51.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(0, 79, 158);
  doc.text(`Ref: ${quoteRef}`, pageWidth - 18, 51.5, { align: "right" });

  // 4. Two-Column Metadata Box: Customer Info & Quotation Details
  const metaY = 60;
  
  // Left: Bill To / Quote For
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("QUOTATION ISSUED TO:", 14, metaY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(customer.companyName || customer.fullName || "Valued Enterprise Client", 14, metaY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  let curY = metaY + 9;
  if (customer.fullName && customer.fullName !== customer.companyName) {
    doc.text(`Attn: ${customer.fullName}`, 14, curY);
    curY += 4;
  }
  if (customer.address) {
    doc.text(`${customer.address}${customer.city ? `, ${customer.city}` : ""}${customer.state ? `, ${customer.state}` : ""}${customer.pincode ? ` - ${customer.pincode}` : ""}`, 14, curY);
    curY += 4;
  }
  if (customer.gstin) {
    doc.text(`Customer GSTIN: ${customer.gstin}`, 14, curY);
    curY += 4;
  }
  doc.text(`Phone: ${customer.phone || "+91 -"}  |  Email: ${customer.email || "-"}`, 14, curY);

  // Right: Quote Meta Details
  const rightX = pageWidth - 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("QUOTATION PARTICULARS:", rightX - 60, metaY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Quotation Date:`, rightX - 60, metaY + 5);
  doc.setFont("helvetica", "bold");
  doc.text(dateStr, rightX, metaY + 5, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.text(`Validity Period:`, rightX - 60, metaY + 9);
  doc.setFont("helvetica", "bold");
  doc.text(`${validUntil} (30 Days)`, rightX, metaY + 9, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.text(`Payment Terms:`, rightX - 60, metaY + 13);
  doc.setFont("helvetica", "bold");
  doc.text(`100% Against PI / Advance`, rightX, metaY + 13, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.text(`Dispatch Origin:`, rightX - 60, metaY + 17);
  doc.setFont("helvetica", "bold");
  doc.text(`Hyderabad (Telangana)`, rightX, metaY + 17, { align: "right" });

  // 5. Itemized Table
  const tableStartY = Math.max(curY + 6, metaY + 24);

  const tableBody = options.items.map((item, index) => {
    const lineTotal = item.unitPrice * item.quantity;
    const descText = `${item.name}\n[SKU: ${item.sku}] ${item.brand ? `Brand: ${item.brand}` : ""} ${item.specs ? `\nSpecs: ${item.specs}` : ""}`;
    return [
      (index + 1).toString(),
      descText,
      item.hsn || "8536.90",
      item.quantity.toString(),
      `₹${item.unitPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      "18% GST",
      `₹${lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    ];
  });

  autoTable(doc, {
    startY: tableStartY,
    head: [["#", "Item Description & Technical Specs", "HSN/SAC", "Qty", "Unit Rate (INR)", "Tax Rate", "Amount (INR)"]],
    body: tableBody,
    theme: "grid",
    headStyles: {
      fillColor: [0, 79, 158],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
      cellPadding: 2.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { cellWidth: 70 },
      2: { halign: "center", cellWidth: 20 },
      3: { halign: "center", cellWidth: 15, fontStyle: "bold" },
      4: { halign: "right", cellWidth: 24 },
      5: { halign: "center", cellWidth: 18 },
      6: { halign: "right", cellWidth: 25, fontStyle: "bold" },
    },
    styles: {
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      overflow: "linebreak",
    },
  });

  // Calculate Totals
  const subtotal = options.items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
  const gstAmount = Math.round(subtotal * 0.18);
  const shippingFee = options.shippingFee || 0;
  const grandTotal = subtotal + gstAmount + shippingFee;

  // @ts-ignore (jspdf-autotable adds lastAutoTable)
  let finalY = doc.lastAutoTable.finalY + 5;

  // If table went too close to bottom, add a new page
  if (finalY > 230) {
    doc.addPage();
    finalY = 20;
  }

  // 6. Summary Box & Tax Breakdown
  const summaryBoxWidth = 80;
  const summaryBoxX = pageWidth - 14 - summaryBoxWidth;

  // Financial Breakdown Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(summaryBoxX, finalY, summaryBoxWidth, 40, 2, 2, "FD");

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);

  let sumRowY = finalY + 6;
  doc.text("Subtotal (Excl. Tax):", summaryBoxX + 4, sumRowY);
  doc.text(`₹${subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, summaryBoxX + summaryBoxWidth - 4, sumRowY, { align: "right" });

  sumRowY += 5.5;
  doc.text("CGST @ 9%:", summaryBoxX + 4, sumRowY);
  doc.text(`₹${(gstAmount / 2).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, summaryBoxX + summaryBoxWidth - 4, sumRowY, { align: "right" });

  sumRowY += 5;
  doc.text("SGST @ 9%:", summaryBoxX + 4, sumRowY);
  doc.text(`₹${(gstAmount / 2).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, summaryBoxX + summaryBoxWidth - 4, sumRowY, { align: "right" });

  sumRowY += 5;
  doc.text("Freight & Logistics:", summaryBoxX + 4, sumRowY);
  doc.text(shippingFee > 0 ? `₹${shippingFee.toLocaleString("en-IN")}` : "Complimentary", summaryBoxX + summaryBoxWidth - 4, sumRowY, { align: "right" });

  doc.setDrawColor(203, 213, 225);
  doc.line(summaryBoxX + 4, sumRowY + 2.5, summaryBoxX + summaryBoxWidth - 4, sumRowY + 2.5);

  sumRowY += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(0, 79, 158);
  doc.text("Grand Total (INR):", summaryBoxX + 4, sumRowY);
  doc.text(`₹${grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, summaryBoxX + summaryBoxWidth - 4, sumRowY, { align: "right" });

  // Left side: Amount in Words & Bank Details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("Amount in Words:", 14, finalY + 6);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(51, 65, 85);
  doc.text(numberToWordsINR(grandTotal), 14, finalY + 11);

  // Bank NEFT/RTGS Info Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, finalY + 16, summaryBoxX - 18, 24, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(0, 79, 158);
  doc.text("DIRECT NEFT / RTGS PAYMENT DETAILS:", 17, finalY + 21);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text("Account Name: QUALITECH CONNECTORICS PVT LTD", 17, finalY + 26);
  doc.text("Bank: HDFC Bank Ltd | Branch: Cherlapally Industrial Area", 17, finalY + 30);
  doc.text("Account No: 50200062819401 | IFSC: HDFC0001632", 17, finalY + 34);

  // 7. Terms & Conditions and Signature Section
  const termsY = finalY + 45;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("COMMERCIAL TERMS & CONDITIONS:", 14, termsY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  const terms = [
    "1. Validity: This formal quote remains valid for 30 calendar days from the date of issuance.",
    "2. Quality Assurance: 100% electrical continuity, pinout mapping & high-voltage insulation tested (IPC-WHMA-A-620).",
    "3. Taxes & Duties: GST is charged @ 18% as per Indian taxation standards. Input Tax Credit (ITC) available on invoice.",
    "4. Dispatch & Logistics: In-stock standard components dispatch within 24-48 hours. Custom harnesses 7-10 working days.",
    "5. Warranty: 12 months comprehensive warranty against manufacturing defects.",
  ];
  terms.forEach((t, i) => {
    doc.text(t, 14, termsY + 4 + i * 3.6);
  });

  // Authorized Signatory Block
  const sigX = pageWidth - 14 - 60;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("For QUALITECH CONNECTORICS PVT LTD", sigX, termsY + 2, { align: "left" });

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("[Digitally Certified Commercial Document]", sigX, termsY + 16, { align: "left" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(0, 79, 158);
  doc.text("Authorized Signatory / Accounts Desk", sigX, termsY + 21, { align: "left" });

  // 8. Footer Page Marker
  doc.setFillColor(0, 79, 158);
  doc.rect(0, 287, pageWidth, 10, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("Qualitech Connectronics Pvt. Ltd. • Quality Connections Engineered for Performance", pageWidth / 2, 293, { align: "center" });

  return doc;
}

/**
 * Helper: Download quotation directly from Cart Items
 */
export function downloadQuotationFromCart(items: CartItem[], customer?: QuoteCustomerInfo): void {
  if (!items || items.length === 0) return;

  const quoteItems: QuoteLineItem[] = items.map((it) => ({
    sku: it.product.sku,
    name: it.product.name,
    brand: it.product.brand,
    specs: it.customNote || undefined,
    quantity: it.quantity,
    unitPrice: typeof it.unitPrice === "number" ? it.unitPrice : (it.product.salePrice ?? it.product.price ?? 100),
    hsn: "8536.90",
  }));

  const quoteRef = `QT-QUO-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const doc = generateBrandedPDFQuotation({
    quoteNumber: quoteRef,
    ...(customer ? { customer } : {}),
    items: quoteItems,
    shippingFee: 0,
  });

  doc.save(`Qualitech_Quotation_${quoteRef}.pdf`);
}

/**
 * Helper: Download formal quotation from completed Order
 */
export function downloadQuotationFromOrder(order: Order): void {
  const quoteItems: QuoteLineItem[] = order.items.map((it) => ({
    sku: it.product.sku,
    name: it.product.name,
    brand: it.product.brand,
    specs: it.customNote || undefined,
    quantity: it.quantity,
    unitPrice: it.unitPrice,
    hsn: "8536.90",
  }));

  const customer: QuoteCustomerInfo = {
    fullName: order.customer.fullName,
    companyName: order.customer.companyName || undefined,
    email: order.customer.email,
    phone: order.customer.phone,
    address: order.customer.address,
    city: order.customer.city,
    state: order.customer.state,
    pincode: order.customer.pincode,
    gstin: order.customer.gstin || undefined,
  };

  const doc = generateBrandedPDFQuotation({
    quoteNumber: `QT-INV-${order.orderNumber}`,
    customer,
    items: quoteItems,
    shippingFee: order.shippingCost || 0,
  });

  doc.save(`Qualitech_Proforma_Invoice_${order.orderNumber}.pdf`);
}

/**
 * Helper: Download formal quotation from RFQ Form Submission
 */
export function downloadQuotationFromRFQ(rfq: RFQFormData, estimatedUnitPrice: number = 3500): void {
  const quoteItems: QuoteLineItem[] = [
    {
      sku: `QT-RFQ-${rfq.rfqNumber || Math.floor(1000 + Math.random() * 9000)}`,
      name: `Custom Engineered Cable Harness - ${rfq.productCategory}`,
      brand: "Qualitech Custom Assemblies",
      specs: [
        rfq.pinCount ? `Pin Count: ${rfq.pinCount}` : "",
        rfq.wireGauge ? `Wire Gauge: ${rfq.wireGauge}` : "",
        rfq.connectorType ? `Connector: ${rfq.connectorType}` : "",
        rfq.targetDeliveryDate ? `Target Lead Time: ${rfq.targetDeliveryDate}` : "",
        rfq.technicalSpecs ? `Specs: ${rfq.technicalSpecs}` : "",
      ]
        .filter(Boolean)
        .join(" | ") || undefined,
      quantity: rfq.estimatedQty || 100,
      unitPrice: estimatedUnitPrice,
      hsn: "8544.42",
    },
  ];

  const customer: QuoteCustomerInfo = {
    fullName: rfq.fullName,
    companyName: rfq.companyName || undefined,
    email: rfq.email,
    phone: rfq.phone,
    gstin: rfq.gstin || undefined,
  };

  const doc = generateBrandedPDFQuotation({
    quoteNumber: `QT-RFQ-EST-${rfq.rfqNumber || Date.now().toString().slice(-6)}`,
    customer,
    items: quoteItems,
    isRFQ: true,
  });

  doc.save(`Qualitech_RFQ_Quotation_${rfq.rfqNumber || "Estimate"}.pdf`);
}
