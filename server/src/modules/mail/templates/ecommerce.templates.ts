import { MailMessage } from '../mail.types';
import { escapeHtml, renderLayout } from './layout.template';

function formatMoney(amount: number | undefined | null, symbol = '$'): string {
  const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `${symbol}${val.toFixed(2)}`;
}

function formatDate(date: Date | string | undefined | null): string {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return String(date);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Order Confirmation Template
// ─────────────────────────────────────────────────────────────────────────────
export function orderConfirmationTemplate(
  appName: string,
  clientUrl: string,
  order: any,
  currencySymbol = '$',
): MailMessage {
  const orderNumber = order.orderNumber || 'N/A';
  const customerName = order.customerName || 'Valued Customer';
  const trackingLink = `${clientUrl}/account/orders/${orderNumber}`;
  const formattedDate = formatDate(order.createdAt || new Date());
  const estDate = formatDate(order.estimatedDeliveryDate);

  const address = order.shippingAddress || {};
  const addressHtml = `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:16px;margin:20px 0;font-size:13px;color:#334155;line-height:1.5">
      <strong style="display:block;margin-bottom:6px;color:#0f172a;font-size:14px">Shipping Address</strong>
      <div>${escapeHtml(customerName)}</div>
      <div>${escapeHtml(address.street || '')}</div>
      <div>${escapeHtml(address.city || '')}${address.state ? `, ${escapeHtml(address.state)}` : ''} ${escapeHtml(address.postalCode || '')}</div>
      <div>${escapeHtml(address.country || 'US')}</div>
      ${address.phone ? `<div>Phone: ${escapeHtml(address.phone)}</div>` : ''}
    </div>
  `;

  // Items rows
  const items = Array.isArray(order.items) ? order.items : [];
  const itemsRows = items
    .map((item: any) => {
      const img = item.image
        ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" width="44" height="44" style="border-radius:4px;object-fit:cover;display:block;border:1px solid #e2e8f0" />`
        : `<div style="width:44px;height:44px;background:#f1f5f9;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#94a3b8;font-weight:600">ITEM</div>`;

      const variantLine = item.variantTitle
        ? `<div style="font-size:11px;color:#64748b;margin-top:2px">${escapeHtml(item.variantTitle)}</div>`
        : '';
      const skuLine = item.variantSku
        ? `<div style="font-size:10px;color:#94a3b8;margin-top:1px">SKU: ${escapeHtml(item.variantSku)}</div>`
        : '';

      return `
        <tr>
          <td style="padding:12px 8px;vertical-align:middle;border-bottom:1px solid #f1f5f9;width:52px">
            ${img}
          </td>
          <td style="padding:12px 8px;vertical-align:middle;border-bottom:1px solid #f1f5f9">
            <div style="font-weight:600;color:#0f172a;font-size:13px">${escapeHtml(item.name || 'Product')}</div>
            ${variantLine}
            ${skuLine}
          </td>
          <td style="padding:12px 8px;vertical-align:middle;border-bottom:1px solid #f1f5f9;text-align:center;font-size:13px;color:#475569">
            ${item.quantity}
          </td>
          <td style="padding:12px 8px;vertical-align:middle;border-bottom:1px solid #f1f5f9;text-align:right;font-size:13px;font-weight:600;color:#0f172a">
            ${formatMoney(item.lineTotal, currencySymbol)}
          </td>
        </tr>
      `;
    })
    .join('');

  const itemsTable = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-collapse:collapse">
      <thead>
        <tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0">
          <th style="padding:8px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;font-weight:700" colspan="2">Item</th>
          <th style="padding:8px;text-align:center;font-size:11px;color:#64748b;text-transform:uppercase;font-weight:700;width:50px">Qty</th>
          <th style="padding:8px;text-align:right;font-size:11px;color:#64748b;text-transform:uppercase;font-weight:700;width:70px">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>
  `;

  // Financial summary
  const subtotal = formatMoney(order.subtotal, currencySymbol);
  const shipping = order.shippingFee === 0 ? '<span style="color:#16a34a;font-weight:600">FREE</span>' : formatMoney(order.shippingFee, currencySymbol);
  const tax = formatMoney(order.tax, currencySymbol);
  const total = formatMoney(order.grandTotal, currencySymbol);
  const discountRow = order.discount && order.discount > 0
    ? `<tr>
        <td style="padding:4px 0;font-size:13px;color:#16a34a">Discount ${order.appliedCoupon ? `(${escapeHtml(order.appliedCoupon)})` : ''}</td>
        <td style="padding:4px 0;font-size:13px;color:#16a34a;text-align:right;font-weight:600">-${formatMoney(order.discount, currencySymbol)}</td>
       </tr>`
    : '';

  const summaryHtml = `
    <div style="margin-top:16px;border-top:1px solid #e2e8f0;padding-top:16px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#64748b">Subtotal</td>
          <td style="padding:4px 0;font-size:13px;color:#0f172a;text-align:right">${subtotal}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#64748b">Shipping (${order.deliveryMethod || 'STANDARD'})</td>
          <td style="padding:4px 0;font-size:13px;color:#0f172a;text-align:right">${shipping}</td>
        </tr>
        ${discountRow}
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#64748b">Estimated Tax</td>
          <td style="padding:4px 0;font-size:13px;color:#0f172a;text-align:right">${tax}</td>
        </tr>
        <tr style="border-top:1px solid #e2e8f0">
          <td style="padding:10px 0 4px;font-size:15px;font-weight:700;color:#0f172a">Grand Total</td>
          <td style="padding:10px 0 4px;font-size:16px;font-weight:800;color:#2A3B5C;text-align:right">${total}</td>
        </tr>
      </table>
    </div>
  `;

  // Payment badge
  const paymentBadge = `
    <div style="margin:16px 0;padding:12px;background:#f1f5f9;border-radius:6px;font-size:12px;color:#475569">
      <strong>Payment Method:</strong> ${order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Credit / Debit Card (Online)'} 
      &bull; <strong>Status:</strong> ${order.paymentStatus || 'CONFIRMED'}
      ${order.estimatedDeliveryDate ? `&bull; <strong>Est. Delivery:</strong> ${estDate}` : ''}
    </div>
  `;

  const contentHtml = `
    <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:6px;padding:12px 16px;margin-bottom:20px;color:#065f46;font-size:14px">
      <strong>Order Confirmed!</strong> We are processing order <strong>#${escapeHtml(orderNumber)}</strong>.
    </div>
    ${paymentBadge}
    ${addressHtml}
    ${itemsTable}
    ${summaryHtml}
  `;

  const html = renderLayout({
    appName,
    heading: `Order Confirmation #${orderNumber}`,
    paragraphs: [
      `Hi ${customerName},`,
      `Thank you for shopping with ${appName}! We have received your order and are currently preparing it for shipment.`,
    ],
    contentHtml,
    action: { label: 'View Order Details', url: trackingLink },
    footnote: `Questions about your order? Reply to this email or visit our Help Center at ${clientUrl}/contact.`,
    maxWidth: 580,
  });

  // Plain-text fallback
  const textItems = items
    .map((item: any) => `- ${item.name} x${item.quantity}: ${formatMoney(item.lineTotal, currencySymbol)}`)
    .join('\n');

  const text = [
    `${appName} - Order Confirmation`,
    `Order Number: #${orderNumber}`,
    `Order Date: ${formattedDate}`,
    '',
    `Hi ${customerName},`,
    `Thank you for your order! We have received it and are preparing it for shipment.`,
    '',
    'Order Items:',
    textItems,
    '',
    `Subtotal: ${subtotal}`,
    `Shipping: ${order.shippingFee === 0 ? 'FREE' : formatMoney(order.shippingFee, currencySymbol)}`,
    order.discount ? `Discount: -${formatMoney(order.discount, currencySymbol)}` : '',
    `Tax: ${tax}`,
    `Grand Total: ${total}`,
    '',
    `Shipping Address:`,
    `${customerName}`,
    `${address.street || ''}`,
    `${address.city || ''}, ${address.state || ''} ${address.postalCode || ''}`,
    `${address.country || 'US'}`,
    '',
    `Track your order here: ${trackingLink}`,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    subject: `Order Confirmed: #${orderNumber} - ${appName}`,
    html,
    text,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Order Status Changed Notification Template
// ─────────────────────────────────────────────────────────────────────────────
export function orderStatusChangedTemplate(
  appName: string,
  clientUrl: string,
  order: any,
  newStatus: string,
  currencySymbol = '$',
): MailMessage {
  const orderNumber = order.orderNumber || 'N/A';
  const customerName = order.customerName || 'Valued Customer';
  const trackingLink = `${clientUrl}/account/orders/${orderNumber}`;

  let statusTitle = newStatus;
  let statusBannerBg = '#f1f5f9';
  let statusTextColor = '#334155';
  let messageDetail = `Your order status has been updated to ${newStatus}.`;

  switch (newStatus) {
    case 'SHIPPED':
      statusTitle = 'Order Shipped';
      statusBannerBg = '#eff6ff';
      statusTextColor = '#1e40af';
      messageDetail = 'Great news! Your package is on its way to you.';
      break;
    case 'OUT_FOR_DELIVERY':
      statusTitle = 'Out for Delivery';
      statusBannerBg = '#faf5ff';
      statusTextColor = '#6b21a8';
      messageDetail = 'Your order is out for delivery and will arrive shortly today.';
      break;
    case 'DELIVERED':
      statusTitle = 'Order Delivered';
      statusBannerBg = '#ecfdf5';
      statusTextColor = '#065f46';
      messageDetail = 'Your order has been safely delivered. We hope you love your purchase!';
      break;
    case 'PROCESSING':
      statusTitle = 'Order in Processing';
      statusBannerBg = '#f8fafc';
      statusTextColor = '#0f172a';
      messageDetail = 'Our fulfillment warehouse is currently picking and packing your items.';
      break;
    case 'CANCELLED':
      statusTitle = 'Order Cancelled';
      statusBannerBg = '#fff1f2';
      statusTextColor = '#9f1239';
      messageDetail = 'Your order has been cancelled. If any payment was captured, a refund has been issued.';
      break;
  }

  // Tracking section if shipped / tracking exists
  let trackingSection = '';
  if (order.trackingNumber || order.courierName) {
    const courier = order.courierName ? `<strong>Courier:</strong> ${escapeHtml(order.courierName)}<br/>` : '';
    const trackingNo = order.trackingNumber
      ? `<strong>Tracking Number:</strong> ${escapeHtml(order.trackingNumber)}<br/>`
      : '';
    const carrierButton = order.trackingUrl
      ? `<div style="margin-top:12px"><a href="${escapeHtml(order.trackingUrl)}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;font-size:12px;font-weight:600;padding:8px 14px;border-radius:4px">Track with Carrier &rarr;</a></div>`
      : '';

    trackingSection = `
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:16px;margin:20px 0;font-size:13px;line-height:1.6;color:#334155">
        <strong style="display:block;margin-bottom:8px;color:#0f172a;font-size:14px">Carrier Tracking Details</strong>
        ${courier}
        ${trackingNo}
        ${carrierButton}
      </div>
    `;
  }

  const itemsList = Array.isArray(order.items)
    ? order.items
        .map(
          (i: any) =>
            `<li style="margin-bottom:6px;font-size:13px;color:#334155">${escapeHtml(i.name)} &times; ${i.quantity}</li>`,
        )
        .join('')
    : '';

  const contentHtml = `
    <div style="background:${statusBannerBg};border:1px solid #cbd5e1;border-radius:6px;padding:16px;margin-bottom:20px;color:${statusTextColor};font-size:14px">
      <strong style="font-size:16px;display:block;margin-bottom:4px">${escapeHtml(statusTitle)}</strong>
      <span>${escapeHtml(messageDetail)}</span>
    </div>
    ${trackingSection}
    <div style="margin:20px 0;font-size:13px;color:#475569">
      <strong style="display:block;margin-bottom:8px;color:#0f172a">Package Items:</strong>
      <ul style="padding-left:20px;margin:0">
        ${itemsList}
      </ul>
    </div>
  `;

  const html = renderLayout({
    appName,
    heading: `Update on Order #${orderNumber}`,
    paragraphs: [`Hi ${customerName},`, `Here is an update on your order #${orderNumber}:`],
    contentHtml,
    action: { label: 'Track Order', url: trackingLink },
    footnote: `You can view complete fulfillment and shipment history anytime in your account.`,
    maxWidth: 580,
  });

  const text = [
    `${appName} - Order Status Update`,
    `Order Number: #${orderNumber}`,
    `New Status: ${statusTitle}`,
    '',
    `Hi ${customerName},`,
    messageDetail,
    '',
    order.courierName ? `Courier: ${order.courierName}` : '',
    order.trackingNumber ? `Tracking Number: ${order.trackingNumber}` : '',
    order.trackingUrl ? `Tracking Link: ${order.trackingUrl}` : '',
    '',
    `View complete order status: ${trackingLink}`,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    subject: `Order #${orderNumber} is ${statusTitle} - ${appName}`,
    html,
    text,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Low-Stock Alert Template (Sent to Store Admin)
// ─────────────────────────────────────────────────────────────────────────────
export function lowStockAlertTemplate(
  appName: string,
  adminUrl: string,
  product: any,
  remainingStock: number,
  variantTitle?: string | null,
): MailMessage {
  const productName = product.name || 'Product';
  const sku = product.sku || (product.variants && product.variants[0]?.sku) || 'N/A';
  const threshold = product.lowStockThreshold ?? 5;
  const isOutOfStock = remainingStock <= 0;
  const adminProductsLink = `${adminUrl}/products`;

  const statusBg = isOutOfStock ? '#fef2f2' : '#fffbeb';
  const statusBorder = isOutOfStock ? '#fecaca' : '#fde68a';
  const statusText = isOutOfStock ? '#991b1b' : '#92400e';
  const alertTitle = isOutOfStock ? 'OUT OF STOCK ALERT' : 'LOW STOCK ALERT';

  const contentHtml = `
    <div style="background:${statusBg};border:1px solid ${statusBorder};border-radius:6px;padding:16px;margin-bottom:20px;color:${statusText}">
      <strong style="font-size:15px;display:block;margin-bottom:4px">⚠️ ${alertTitle}</strong>
      <span>${escapeHtml(productName)} has reached critically low inventory.</span>
    </div>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:16px;margin:20px 0;font-size:13px;line-height:1.6;color:#334155">
      <strong style="display:block;margin-bottom:8px;color:#0f172a;font-size:14px">Product Inventory Snapshot</strong>
      <div><strong>Product:</strong> ${escapeHtml(productName)}</div>
      <div><strong>Base SKU:</strong> ${escapeHtml(sku)}</div>
      ${variantTitle ? `<div><strong>Variant:</strong> ${escapeHtml(variantTitle)}</div>` : ''}
      <div><strong>Current Remaining Stock:</strong> <span style="font-weight:700;color:${statusText};font-size:14px">${remainingStock} units</span></div>
      <div><strong>Configured Alert Threshold:</strong> ${threshold} units</div>
    </div>

    <p style="font-size:13px;color:#64748b;line-height:1.5">
      Please review product quantities and initiate purchase orders or restock manually to avoid stockouts for incoming orders.
    </p>
  `;

  const html = renderLayout({
    appName,
    heading: `Inventory Warning: ${productName}`,
    paragraphs: [
      `Hello Store Administrator,`,
      `This is an automated inventory alert from ${appName}.`,
    ],
    contentHtml,
    action: { label: 'Manage Products in Admin Console', url: adminProductsLink },
    footnote: `This notification was triggered automatically after an order decremented inventory below threshold.`,
    maxWidth: 560,
  });

  const text = [
    `[ACTION REQUIRED] ${appName} Inventory Alert`,
    `${alertTitle}: ${productName}`,
    '',
    `Product: ${productName}`,
    `SKU: ${sku}`,
    variantTitle ? `Variant: ${variantTitle}` : '',
    `Remaining Stock: ${remainingStock} units`,
    `Threshold: ${threshold} units`,
    '',
    `Please replenish inventory at: ${adminProductsLink}`,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    subject: `[Inventory Alert] ${isOutOfStock ? 'OUT OF STOCK' : 'Low Stock'}: ${productName} (${remainingStock} units left) - ${appName}`,
    html,
    text,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Return Request Status Update Template
// ─────────────────────────────────────────────────────────────────────────────
export function returnStatusChangedTemplate(
  appName: string,
  clientUrl: string,
  returnReq: any,
  currencySymbol = '$',
): MailMessage {
  const returnNumber = returnReq.returnNumber || 'N/A';
  const orderNumber = returnReq.orderNumber || 'N/A';
  const customerName = returnReq.customerName || 'Valued Customer';
  const status = returnReq.status || 'UPDATED';
  const refundAmount = formatMoney(returnReq.totalRefundAmount, currencySymbol);
  const portalLink = `${clientUrl}/account/orders/${orderNumber}`;

  let statusLabel = status;
  let bannerBg = '#f1f5f9';
  let bannerText = '#334155';
  let headline = `Your return request #${returnNumber} has been updated.`;
  let nextSteps = 'You can track status updates in your account.';

  if (status === 'APPROVED') {
    statusLabel = 'Approved';
    bannerBg = '#ecfdf5';
    bannerText = '#065f46';
    headline = `Good news! Your return request for order #${orderNumber} has been APPROVED.`;
    nextSteps =
      'Please pack the returned items securely. Our courier will contact you for pickup or you can follow the drop-off instructions in your account.';
  } else if (status === 'REFUNDED') {
    statusLabel = 'Refund Processed';
    bannerBg = '#eff6ff';
    bannerText = '#1e40af';
    headline = `Refund of ${refundAmount} has been processed for return #${returnNumber}!`;
    nextSteps = `The refund has been credited back to your original payment method${returnReq.refundTransactionId ? ` (Reference ID: ${returnReq.refundTransactionId})` : ''}. Depending on your bank, it may take 3-5 business days to appear on your statement.`;
  } else if (status === 'REJECTED') {
    statusLabel = 'Request Rejected';
    bannerBg = '#fff1f2';
    bannerText = '#9f1239';
    headline = `Your return request #${returnNumber} was not approved.`;
    nextSteps = returnReq.rejectionReason
      ? `Reason: "${returnReq.rejectionReason}". Please contact customer support if you need further assistance.`
      : 'Please contact our support team for further clarification.';
  }

  const itemsList = Array.isArray(returnReq.items)
    ? returnReq.items
        .map((i: any) => {
          const varText = i.variantTitle ? ` (${escapeHtml(i.variantTitle)})` : '';
          return `<li style="margin-bottom:6px;font-size:13px;color:#334155">
            ${escapeHtml(i.name)}${varText} &times; ${i.quantity} &mdash; <strong>${formatMoney(i.refundAmount, currencySymbol)}</strong>
          </li>`;
        })
        .join('')
    : '';

  const contentHtml = `
    <div style="background:${bannerBg};border:1px solid #cbd5e1;border-radius:6px;padding:16px;margin-bottom:20px;color:${bannerText};font-size:14px">
      <strong style="font-size:16px;display:block;margin-bottom:4px">Return Request Status: ${escapeHtml(statusLabel)}</strong>
      <span>${escapeHtml(headline)}</span>
    </div>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:16px;margin:20px 0;font-size:13px;line-height:1.6;color:#334155">
      <strong style="display:block;margin-bottom:8px;color:#0f172a;font-size:14px">Return Summary</strong>
      <div><strong>Return Request ID:</strong> #${escapeHtml(returnNumber)}</div>
      <div><strong>Original Order:</strong> #${escapeHtml(orderNumber)}</div>
      <div><strong>Total Refund Amount:</strong> <strong style="color:#0f172a">${refundAmount}</strong></div>
      ${returnReq.refundTransactionId ? `<div><strong>Refund Transaction ID:</strong> ${escapeHtml(returnReq.refundTransactionId)}</div>` : ''}
    </div>

    <div style="margin:20px 0;font-size:13px;color:#475569">
      <strong style="display:block;margin-bottom:8px;color:#0f172a">Returned Items:</strong>
      <ul style="padding-left:20px;margin:0">
        ${itemsList}
      </ul>
    </div>

    <div style="background:#f1f5f9;border-radius:6px;padding:12px;margin:16px 0;font-size:13px;color:#475569">
      <strong>Next Steps:</strong> ${escapeHtml(nextSteps)}
    </div>
  `;

  const html = renderLayout({
    appName,
    heading: `Return #${returnNumber} Update`,
    paragraphs: [
      `Hi ${customerName},`,
      `Here is an update regarding your return request for order #${orderNumber}.`,
    ],
    contentHtml,
    action: { label: 'View Order Details', url: portalLink },
    footnote: `Questions about returns or refunds? Reply to this email or visit our contact page at ${clientUrl}/contact.`,
    maxWidth: 580,
  });

  const text = [
    `${appName} - Return Request Update`,
    `Return Number: #${returnNumber}`,
    `Order Number: #${orderNumber}`,
    `Status: ${statusLabel}`,
    `Refund Amount: ${refundAmount}`,
    '',
    `Hi ${customerName},`,
    headline,
    '',
    nextSteps,
    '',
    `View order details: ${portalLink}`,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    subject: `Return Request #${returnNumber}: ${statusLabel} - ${appName}`,
    html,
    text,
  };
}
