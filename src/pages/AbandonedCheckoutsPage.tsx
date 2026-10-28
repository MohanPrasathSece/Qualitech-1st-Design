import React, { useState, useMemo } from "react";
import { useECommerce } from "@/context/ECommerceContext";
import { formatINR, Order } from "@/lib/ecommerceStore";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

interface AbandonedCheckoutsPageProps {
  onNavigateHome: (target: string, isPage?: boolean) => void;
}

export function AbandonedCheckoutsPage({ onNavigateHome }: AbandonedCheckoutsPageProps) {
  const {
    orders,
    updateLeadStatus,
    deleteAbandonedOrder,
    exportAbandonedOrdersCsv,
  } = useECommerce();

  // Filter incomplete / abandoned orders
  const incompleteOrders = useMemo(() => {
    const seen = new Set<string>();
    return orders
      .filter((o) => {
        const key = (o.orderNumber || o.id || "").trim().toLowerCase();
        if (key && seen.has(key)) return false;
        if (key) seen.add(key);
        return (
          o.orderStatus === "Payment Incomplete" ||
          o.orderStatus === "Payment Failed" ||
          o.paymentStatus === "Failed" ||
          o.paymentStatus === "Incomplete"
        );
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime() || 0;
        const timeB = new Date(b.createdAt || 0).getTime() || 0;
        return timeB - timeA;
      });
  }, [orders]);

  // Filtering & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [reasonFilter, setReasonFilter] = useState<string>("All");
  const [viewingLead, setViewingLead] = useState<Order | null>(null);
  const [editingNotesLead, setEditingNotesLead] = useState<Order | null>(null);
  const [tempNotes, setTempNotes] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return incompleteOrders.filter((lead) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (lead.orderNumber || "").toLowerCase().includes(q) ||
        (lead.customer?.fullName || "").toLowerCase().includes(q) ||
        (lead.customer?.phone || "").toLowerCase().includes(q) ||
        (lead.customer?.email || "").toLowerCase().includes(q) ||
        (lead.customer?.companyName || "").toLowerCase().includes(q) ||
        (lead.customer?.gstin || "").toLowerCase().includes(q) ||
        (lead.customer?.city || "").toLowerCase().includes(q);

      const leadStatus = lead.followUpStatus || "New Lead";
      const matchesStatus = statusFilter === "All" || leadStatus === statusFilter;

      const orderNotes = (lead.customer?.orderNotes || lead.orderStatus || "").toLowerCase();
      let matchesReason = true;
      if (reasonFilter === "Dismissed") {
        matchesReason = orderNotes.includes("dismissed");
      } else if (reasonFilter === "Failed") {
        matchesReason = orderNotes.includes("failed");
      } else if (reasonFilter === "Step2") {
        matchesReason = orderNotes.includes("step 2") || orderNotes.includes("reached");
      }

      return matchesSearch && matchesStatus && matchesReason;
    });
  }, [incompleteOrders, searchQuery, statusFilter, reasonFilter]);

  // Metrics
  const totalLeads = incompleteOrders.length;
  const totalPipelineValue = incompleteOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const uncontactedCount = incompleteOrders.filter((o) => (o.followUpStatus || "New Lead") === "New Lead").length;
  const recoveredCount = incompleteOrders.filter((o) => o.followUpStatus === "Recovered").length;

  const handleExportCsv = () => {
    const csv = exportAbandonedOrdersCsv();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qualitech-incomplete-payments-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Leads exported to CSV successfully!");
  };

  const handleSaveNotes = () => {
    if (!editingNotesLead) return;
    updateLeadStatus(
      editingNotesLead.orderNumber,
      editingNotesLead.followUpStatus || "New Lead",
      tempNotes
    );
    showToast("Follow-up note updated!");
    setEditingNotesLead(null);
  };

  const handleWhatsAppContact = (lead: Order) => {
    const cleanPhone = (lead.customer?.phone || "").replace(/\D/g, "");
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const itemsList = (lead.items || []).map((i) => `${i.product?.name || "Item"} (x${i.quantity})`).join(", ");
    const message = encodeURIComponent(
      `Hello ${lead.customer?.fullName || "Sir/Madam"},\n\nGreetings from Qualitech Connectronics! We noticed you initiated an order for industrial components: ${itemsList} (Total: ${formatINR(lead.total)}).\n\nWould you like our engineering team to assist you with order processing, custom cable drawings, or payment via NEFT/UPI/Corporate PO?\n\nLooking forward to assisting you!`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-foreground flex flex-col justify-between">
      <Header onNavigate={onNavigateHome} currentPage="admin" />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-1">
              <button
                onClick={() => onNavigateHome("#admin")}
                className="hover:text-brand-blue transition-colors cursor-pointer"
              >
                Admin Portal
              </button>
              <span>/</span>
              <span className="text-graphite font-bold">Incomplete Payments &amp; Leads</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-graphite tracking-tight flex items-center gap-3">
              <span>Customer Leads &amp; Incomplete Payments</span>
              <span className="rounded-full bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 font-bold border border-amber-300">
                {totalLeads} Records
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Customer coordinates and cart items captured when users advance to payment without completing the transaction.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateHome("#admin")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
            >
              <span>← Back to Admin</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 rounded-xl bg-[#004f9e] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-900 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export Leads (CSV)</span>
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 px-5 py-3.5 text-xs font-bold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200 border border-slate-700">
            {toastMessage}
          </div>
        )}

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Leads</p>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-graphite">{totalLeads}</p>
            <p className="mt-1 text-[0.7rem] text-slate-400">Total abandoned checkouts saved</p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-[#004f9e]">Pipeline Cart Value</p>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#004f9e]">{formatINR(totalPipelineValue)}</p>
            <p className="mt-1 text-[0.7rem] text-blue-600/70">Potential recoverable revenue</p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Action Required</p>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-amber-700">{uncontactedCount}</p>
            <p className="mt-1 text-[0.7rem] text-amber-600/80">Uncontacted fresh customer leads</p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Recovered Leads</p>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-700">{recoveredCount}</p>
            <p className="mt-1 text-[0.7rem] text-emerald-600/80">Successfully converted into orders</p>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
            {/* Search Box */}
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer name, phone, email, company, GSTIN, or order ref..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-4 text-xs text-graphite placeholder:text-slate-400 focus:bg-white focus:border-[#004f9e] focus:outline-hidden transition-all"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by follow-up status"
                className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-semibold text-slate-700 focus:bg-white focus:border-[#004f9e] focus:outline-hidden cursor-pointer"
              >
                <option value="All">All Follow-up Status</option>
                <option value="New Lead">New Lead</option>
                <option value="Contacted">Contacted</option>
                <option value="Followed Up">Followed Up</option>
                <option value="Recovered">Recovered</option>
                <option value="Lost">Lost</option>
              </select>

              <select
                value={reasonFilter}
                onChange={(e) => setReasonFilter(e.target.value)}
                aria-label="Filter by drop-off stage or reason"
                className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-semibold text-slate-700 focus:bg-white focus:border-[#004f9e] focus:outline-hidden cursor-pointer"
              >
                <option value="All">All Drop-off Reasons</option>
                <option value="Step2">Reached Payment Screen</option>
                <option value="Dismissed">Razorpay Dismissed</option>
                <option value="Failed">Payment Failed</option>
              </select>

              {(searchQuery || statusFilter !== "All" || reasonFilter !== "All") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("All");
                    setReasonFilter("All");
                  }}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Leads Table Container */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          {filteredLeads.length === 0 ? (
            <div className="py-20 text-center px-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-display text-base font-bold text-graphite">No Incomplete Payments Found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                {searchQuery || statusFilter !== "All"
                  ? "No records match your active search filters. Try clearing your filters."
                  : "All customers who visited checkout have either completed orders or no checkouts have been abandoned yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold uppercase tracking-wider text-[0.68rem]">
                    <th className="py-3.5 px-4">Lead / Reference</th>
                    <th className="py-3.5 px-4">Customer &amp; Company</th>
                    <th className="py-3.5 px-4">Contact Info</th>
                    <th className="py-3.5 px-4">Cart Total &amp; Items</th>
                    <th className="py-3.5 px-4">Drop-Off Reason</th>
                    <th className="py-3.5 px-4">Follow-Up Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.map((lead) => {
                    const leadStatus = lead.followUpStatus || "New Lead";
                    const isNew = leadStatus === "New Lead";
                    const isRecovered = leadStatus === "Recovered";

                    return (
                      <tr key={lead.orderNumber || lead.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Reference & Date */}
                        <td className="py-3.5 px-4 align-top">
                          <span className="font-mono font-bold text-[#004f9e]">{lead.orderNumber}</span>
                          <p className="text-[0.68rem] text-slate-400 mt-0.5">
                            {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </td>

                        {/* Customer & Company */}
                        <td className="py-3.5 px-4 align-top">
                          <p className="font-bold text-slate-900">{lead.customer?.fullName || "Unspecified Buyer"}</p>
                          {lead.customer?.companyName && (
                            <p className="text-[0.7rem] font-semibold text-slate-600 mt-0.5">
                              {lead.customer.companyName}
                            </p>
                          )}
                          {lead.customer?.city && (
                            <p className="text-[0.68rem] text-slate-400">
                              {lead.customer.city}, {lead.customer.state || "India"}
                            </p>
                          )}
                        </td>

                        {/* Contact Details with Quick Links */}
                        <td className="py-3.5 px-4 align-top space-y-1">
                          {lead.customer?.phone ? (
                            <div className="flex items-center gap-2">
                              <a
                                href={`tel:${lead.customer.phone}`}
                                className="font-mono text-xs font-semibold text-slate-800 hover:text-[#004f9e] transition-colors"
                              >
                                {lead.customer.phone}
                              </a>
                              <button
                                onClick={() => handleWhatsAppContact(lead)}
                                title="Chat on WhatsApp"
                                className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[0.65rem] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer border border-emerald-200"
                              >
                                <span>WhatsApp</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No phone</span>
                          )}

                          {lead.customer?.email ? (
                            <a
                              href={`mailto:${lead.customer.email}?subject=Qualitech Connectronics Order Inquiry - ${lead.orderNumber}`}
                              className="block text-[0.7rem] text-slate-500 hover:text-[#004f9e] transition-colors truncate max-w-[180px]"
                            >
                              {lead.customer.email}
                            </a>
                          ) : (
                            <span className="block text-slate-400 italic text-[0.7rem]">No email</span>
                          )}
                        </td>

                        {/* Cart Summary */}
                        <td className="py-3.5 px-4 align-top">
                          <p className="font-bold text-slate-900">{formatINR(lead.total)}</p>
                          <p className="text-[0.68rem] text-slate-500 mt-0.5">
                            {(lead.items || []).reduce((acc, i) => acc + i.quantity, 0)} Units across {(lead.items || []).length} items
                          </p>
                        </td>

                        {/* Reason / Notes */}
                        <td className="py-3.5 px-4 align-top max-w-[200px]">
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-[0.65rem] font-bold uppercase border ${
                              (lead.customer?.orderNotes || "").includes("Dismissed")
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : (lead.customer?.orderNotes || "").includes("Failed")
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {(lead.customer?.orderNotes || "").includes("Dismissed")
                              ? "Razorpay Dismissed"
                              : (lead.customer?.orderNotes || "").includes("Failed")
                              ? "Payment Failed"
                              : "Reached Payment Step"}
                          </span>

                          {lead.adminNotes && (
                            <p className="mt-1 text-[0.68rem] text-slate-600 bg-slate-50 p-1.5 rounded-md border border-slate-200 line-clamp-2">
                              <span className="font-bold text-slate-700">Staff Note:</span> {lead.adminNotes}
                            </p>
                          )}
                        </td>

                        {/* Status Select */}
                        <td className="py-3.5 px-4 align-top">
                          <select
                            value={leadStatus}
                            onChange={(e) =>
                              updateLeadStatus(
                                lead.orderNumber,
                                e.target.value as any,
                                lead.adminNotes
                              )
                            }
                            aria-label={`Update follow-up status for lead ${lead.orderNumber}`}
                            className={`rounded-lg px-2.5 py-1 text-[0.7rem] font-bold border cursor-pointer focus:outline-hidden ${
                              isNew
                                ? "bg-amber-50 text-amber-800 border-amber-300"
                                : isRecovered
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : leadStatus === "Contacted"
                                ? "bg-blue-50 text-blue-800 border-blue-300"
                                : leadStatus === "Followed Up"
                                ? "bg-purple-50 text-purple-800 border-purple-300"
                                : "bg-slate-100 text-slate-700 border-slate-300"
                            }`}
                          >
                            <option value="New Lead">New Lead</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Followed Up">Followed Up</option>
                            <option value="Recovered">Recovered</option>
                            <option value="Lost">Lost</option>
                          </select>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 align-top text-right space-x-1">
                          <button
                            onClick={() => setViewingLead(lead)}
                            title="View Full Lead Details"
                            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-[#004f9e] hover:text-white transition-colors cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          <button
                            onClick={() => {
                              setEditingNotesLead(lead);
                              setTempNotes(lead.adminNotes || "");
                            }}
                            title="Add / Edit Internal Note"
                            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Remove lead ${lead.orderNumber} from database?`)) {
                                deleteAbandonedOrder(lead.orderNumber);
                                showToast(`Lead ${lead.orderNumber} deleted.`);
                              }
                            }}
                            title="Delete Lead"
                            className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Internal Staff Notes Modal */}
      {editingNotesLead && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-display font-bold text-base text-graphite">
                  Follow-up Notes • {editingNotesLead.orderNumber}
                </h3>
                <p className="text-xs text-muted-foreground">{editingNotesLead.customer?.fullName || "Customer Lead"}</p>
              </div>
              <button
                onClick={() => setEditingNotesLead(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="py-4 space-y-3">
              <label className="block text-xs font-bold text-slate-700">Internal Sales Team Remark</label>
              <textarea
                rows={4}
                value={tempNotes}
                onChange={(e) => setTempNotes(e.target.value)}
                placeholder="e.g. Called customer on 28th Oct. Requested formal quotation with NEFT details. Follow up on Monday..."
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-graphite focus:border-[#004f9e] focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingNotesLead(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                className="rounded-xl bg-[#004f9e] px-5 py-2 text-xs font-bold text-white hover:bg-slate-900 cursor-pointer"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Viewing Lead Drawer / Modal */}
      {viewingLead && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-[#004f9e]">{viewingLead.orderNumber}</span>
                <h3 className="font-display font-bold text-lg text-graphite mt-0.5">
                  Lead Profile: {viewingLead.customer?.fullName || "Prospective Client"}
                </h3>
              </div>
              <button
                onClick={() => setViewingLead(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="py-6 space-y-6 text-xs">
              {/* Customer Coordinates */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[0.68rem]">
                  Consignee &amp; Company Coordinates
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[0.68rem]">Contact Person</span>
                    <span className="font-semibold text-slate-800">{viewingLead.customer?.fullName || "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[0.68rem]">Phone Number</span>
                    <span className="font-mono font-semibold text-slate-800">{viewingLead.customer?.phone || "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[0.68rem]">Email Address</span>
                    <span className="font-semibold text-slate-800">{viewingLead.customer?.email || "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[0.68rem]">Company Name</span>
                    <span className="font-semibold text-slate-800">{viewingLead.customer?.companyName || "Individual / Not specified"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[0.68rem]">GSTIN</span>
                    <span className="font-mono font-semibold text-slate-800">{viewingLead.customer?.gstin || "Not provided"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[0.68rem]">Dispatch Address</span>
                    <span className="font-semibold text-slate-800">
                      {viewingLead.customer?.address || "—"}, {viewingLead.customer?.city || "—"}, {viewingLead.customer?.state || "—"} - {viewingLead.customer?.pincode || "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cart Items */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[0.68rem]">
                  Intended Purchase Line Items
                </h4>
                <div className="divide-y divide-slate-100">
                  {(viewingLead.items || []).map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-slate-800">{item.product?.name}</p>
                        <p className="text-[0.68rem] text-slate-400">
                          SKU: {item.product?.sku} • {item.product?.brand} • Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        {formatINR((item.unitPrice || 0) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[0.72rem]">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>{formatINR(viewingLead.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>18% GST</span>
                    <span>{formatINR(viewingLead.tax)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Logistics Freight</span>
                    <span>{formatINR(viewingLead.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 text-sm pt-1 border-t border-slate-100">
                    <span>Total Cart Value</span>
                    <span className="text-[#004f9e]">{formatINR(viewingLead.total)}</span>
                  </div>
                </div>
              </div>

              {/* Quick WhatsApp Action inside modal */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleWhatsAppContact(viewingLead)}
                  className="flex-1 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Chat with Customer on WhatsApp</span>
                </button>
                <button
                  onClick={() => setViewingLead(null)}
                  className="rounded-xl border border-slate-200 px-6 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer onNavigate={onNavigateHome} />
    </div>
  );
}
