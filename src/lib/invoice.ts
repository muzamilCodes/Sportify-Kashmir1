export interface InvoiceOrder {
  _id: string;
  orderValue?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  orderStatus?: string;
  createdAt?: string;
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    mobile?: string;
  };
  guestAddress?: {
    fullName?: string;
    mobileNumber?: string;
    email?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  products?: Array<{
    productId?: {
      name?: string;
      price?: number;
    } | string;
    quantity?: number;
    price?: number;
  }>;
}

export function generateAndDownloadInvoice(order: InvoiceOrder) {
  const orderIdShort = order._id ? order._id.slice(-8).toUpperCase() : "INV";
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-IN");

  const customerName =
    order.shippingAddress?.firstName
      ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName || ""}`.trim()
      : order.guestAddress?.fullName || "Valued Customer";

  const customerPhone =
    order.shippingAddress?.mobile || order.guestAddress?.mobileNumber || "N/A";

  const customerAddress =
    order.shippingAddress?.street
      ? `${order.shippingAddress.street}, ${order.shippingAddress.city || ""}, ${order.shippingAddress.state || ""} - ${order.shippingAddress.pincode || ""}`
      : order.guestAddress?.street
      ? `${order.guestAddress.street}, ${order.guestAddress.city || ""}, ${order.guestAddress.state || ""} - ${order.guestAddress.postalCode || ""}`
      : "Standard Shipping";

  const items = order.products || [];
  const itemsRows = items
    .map((item, idx) => {
      const name =
        typeof item.productId === "object" && item.productId?.name
          ? item.productId.name
          : "Sportify Gear Item";
      const qty = item.quantity || 1;
      const unitPrice =
        item.price ||
        (typeof item.productId === "object" && item.productId?.price) ||
        Math.round((order.orderValue || 0) / Math.max(1, items.length));
      const lineTotal = unitPrice * qty;

      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${idx + 1}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>${name}</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${qty}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${Number(unitPrice).toLocaleString("en-IN")}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">₹${Number(lineTotal).toLocaleString("en-IN")}</td>
        </tr>
      `;
    })
    .join("");

  const totalAmount = Number(order.orderValue || 0);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice - Sportify Kashmir #${orderIdShort}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1f2937;
      background: #fff;
      padding: 30px;
      margin: 0 auto;
      max-width: 800px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #ea580c;
      padding-bottom: 20px;
      margin-bottom: 25px;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 800;
      color: #ea580c;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .brand-subtitle {
      font-size: 13px;
      color: #6b7280;
      margin-top: 4px;
    }
    .invoice-badge {
      text-align: right;
    }
    .badge {
      display: inline-block;
      background: #ea580c;
      color: white;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 25px;
      background: #f9fafb;
      padding: 16px;
      border-radius: 8px;
    }
    .info-block h4 {
      margin: 0 0 6px 0;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6b7280;
    }
    .info-block p {
      margin: 0;
      font-size: 13px;
      line-height: 1.5;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
    }
    th {
      background: #f3f4f6;
      color: #374151;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 10px;
      border-bottom: 2px solid #e5e7eb;
    }
    .totals-table {
      width: 280px;
      margin-left: auto;
      margin-bottom: 30px;
    }
    .totals-table td {
      padding: 6px 10px;
      font-size: 14px;
    }
    .grand-total {
      border-top: 2px solid #ea580c;
      font-size: 16px;
      font-weight: 800;
      color: #ea580c;
    }
    .footer {
      border-top: 1px dashed #d1d5db;
      padding-top: 15px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="brand-title">SPORTIFY KASHMIR</h1>
      <div class="brand-subtitle">Sports Excellence Delivered Across Kashmir & India</div>
      <div class="brand-subtitle">support@sportifykashmir.com | +91 96826 45127</div>
    </div>
    <div class="invoice-badge">
      <span class="badge">TAX INVOICE</span>
      <p style="margin: 8px 0 0 0; font-size: 13px;"><strong>Invoice #:</strong> ${orderIdShort}</p>
      <p style="margin: 3px 0 0 0; font-size: 13px; color: #6b7280;"><strong>Date:</strong> ${orderDate}</p>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-block">
      <h4>Billed / Shipped To:</h4>
      <p><strong>${customerName}</strong></p>
      <p>${customerAddress}</p>
      <p>Phone: ${customerPhone}</p>
    </div>
    <div class="info-block">
      <h4>Order & Payment Info:</h4>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Payment Method:</strong> ${order.paymentMethod === "cod" ? "Cash on Delivery (COD)" : "Online / Razorpay"}</p>
      <p><strong>Status:</strong> ${order.orderStatus ? order.orderStatus.toUpperCase() : "CONFIRMED"}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 40px; text-align: center;">#</th>
        <th style="text-align: left;">Item Description</th>
        <th style="width: 60px; text-align: center;">Qty</th>
        <th style="width: 100px; text-align: right;">Unit Price</th>
        <th style="width: 110px; text-align: right;">Total Amount</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRows || `<tr><td colspan="5" style="padding: 15px; text-align: center; color: #9ca3af;">Standard Order Package</td></tr>`}
    </tbody>
  </table>

  <table class="totals-table">
    <tr>
      <td style="color: #6b7280;">Subtotal:</td>
      <td style="text-align: right; font-weight: 600;">₹${totalAmount.toLocaleString("en-IN")}</td>
    </tr>
    <tr>
      <td style="color: #6b7280;">Shipping & Handling:</td>
      <td style="text-align: right; color: #16a34a; font-weight: 600;">FREE</td>
    </tr>
    <tr class="grand-total">
      <td>Grand Total:</td>
      <td style="text-align: right;">₹${totalAmount.toLocaleString("en-IN")}</td>
    </tr>
  </table>

  <div class="footer">
    <p>Thank you for shopping with <strong>Sportify Kashmir</strong>!</p>
    <p>For return or exchange support within 7 days, visit <strong>sportifykashmir.com/return-policy</strong> or contact support.</p>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
  `;

  const printWindow = window.open("", "_blank", "width=850,height=950");
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }
}
