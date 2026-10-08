import { MailMessage } from '../../mail/mail.types';
import { escapeHtml, renderLayout } from '../../mail/templates/layout.template';
import { AbandonedCartStage, type AbandonedCart } from '../schemas/abandoned-cart.schema';

export function abandonedCartRecoveryEmailTemplate(
  appName: string,
  clientUrl: string,
  abandonedCart: AbandonedCart,
  currencySymbol = '$',
): MailMessage {
  const customerName = abandonedCart.customerName || 'Valued Shopper';
  const restoreUrl = `${clientUrl}/cart?restore=${abandonedCart.recoveryToken}${
    abandonedCart.discountCouponCode ? `&coupon=${abandonedCart.discountCouponCode}` : ''
  }`;

  let subject = 'You left some great items in your ZYLO shopping cart!';
  let headline = 'Did you leave something behind?';
  let subheadline =
    'Your selected items are still reserved in your shopping cart, but inventory moves quickly!';
  let discountCalloutHtml = '';

  if (abandonedCart.stage === AbandonedCartStage.STAGE_2_DISCOUNT) {
    subject = 'Special 10% OFF your reserved ZYLO cart!';
    headline = 'Take 10% OFF your reserved cart today!';
    subheadline =
      'We noticed you didn’t finish checking out. Here’s an exclusive 10% discount to help you complete your order.';
    discountCalloutHtml = `
      <div style="background:#ecfdf5;border:2px dashed #059669;border-radius:12px;padding:18px;margin:24px 0;text-align:center;">
        <span style="font-size:12px;font-weight:700;color:#047857;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:6px;">Your Exclusive Discount Code</span>
        <div style="font-size:24px;font-weight:900;letter-spacing:3px;color:#065f46;font-family:monospace;background:#ffffff;display:inline-block;padding:8px 24px;border-radius:8px;border:1px solid #a7f3d0;">
          ${escapeHtml(abandonedCart.discountCouponCode || 'COMEBACK10')}
        </div>
        <p style="font-size:12px;color:#047857;margin:8px 0 0;font-weight:500;">
          Discount applied automatically when clicking the button below!
        </p>
      </div>
    `;
  } else if (abandonedCart.stage === AbandonedCartStage.STAGE_3_FINAL) {
    subject = 'Final Call: Your ZYLO shopping cart will expire soon';
    headline = 'Final reminder: Don’t miss out on your items';
    subheadline =
      'This is our last notice before items in your cart are released back to public availability.';
    discountCalloutHtml = `
      <div style="background:#fff7ed;border:2px dashed #ea580c;border-radius:12px;padding:18px;margin:24px 0;text-align:center;">
        <span style="font-size:12px;font-weight:700;color:#c2410c;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:6px;">Last Chance 15% OFF Voucher</span>
        <div style="font-size:24px;font-weight:900;letter-spacing:3px;color:#9a3412;font-family:monospace;background:#ffffff;display:inline-block;padding:8px 24px;border-radius:8px;border:1px solid #fed7aa;">
          ${escapeHtml(abandonedCart.discountCouponCode || 'FINAL15')}
        </div>
        <p style="font-size:12px;color:#c2410c;margin:8px 0 0;font-weight:500;">
          Expires in 24 hours. Valid on items in your cart.
        </p>
      </div>
    `;
  }

  // Items List HTML
  const itemsHtml = abandonedCart.items
    .map(
      (item) => `
      <tr style="border-bottom:1px solid #f1f5f9;">
        <td style="padding:12px 8px;vertical-align:middle;width:64px;">
          ${
            item.imageUrl
              ? `<img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(
                  item.name,
                )}" width="56" height="56" style="border-radius:8px;object-fit:cover;border:1px solid #e2e8f0;display:block;" />`
              : `<div style="width:56px;height:56px;background:#f1f5f9;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:10px;">Item</div>`
          }
        </td>
        <td style="padding:12px 12px;vertical-align:middle;">
          <div style="font-size:14px;font-weight:600;color:#0f172a;line-height:1.3;">
            ${escapeHtml(item.name)}
          </div>
          <div style="font-size:12px;color:#64748b;margin-top:2px;">
            Qty: ${item.quantity} ${
        item.variantSku ? `&bull; SKU: ${escapeHtml(item.variantSku)}` : ''
      }
          </div>
        </td>
        <td style="padding:12px 8px;vertical-align:middle;text-align:right;font-size:14px;font-weight:700;color:#0f172a;">
          ${currencySymbol}${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `,
    )
    .join('');

  const bodyHtml = `
    <div style="max-width:540px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <h2 style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 8px;line-height:1.25;">
        ${escapeHtml(headline)}
      </h2>
      <p style="font-size:14px;color:#475569;margin:0 0 20px;line-height:1.5;">
        Hi ${escapeHtml(customerName)}, ${escapeHtml(subheadline)}
      </p>

      ${discountCalloutHtml}

      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin:20px 0;">
        <div style="background:#f8fafc;padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:12px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.5px;">
          Reserved Items in Your Cart (${abandonedCart.itemCount})
        </div>
        <table style="width:100%;border-collapse:collapse;margin:0;">
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div style="padding:14px 16px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:14px;font-weight:600;color:#334155;">Cart Total:</span>
          <span style="font-size:18px;font-weight:800;color:#0f172a;float:right;">
            ${currencySymbol}${abandonedCart.cartTotal.toFixed(2)}
          </span>
        </div>
      </div>

      <!-- 1-Click Action Button -->
      <div style="text-align:center;margin:32px 0 20px;">
        <a href="${restoreUrl}"
           style="background:#0f172a;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:10px;display:inline-block;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
          Complete My Order in 1 Click &rarr;
        </a>
      </div>

      <div style="text-align:center;margin-top:20px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;line-height:1.5;">
        <span>Free standard shipping on orders over $50 &bull; 30-day hassle-free returns &bull; 256-bit encrypted checkout</span>
      </div>
    </div>
  `;

  const html = renderLayout({
    appName,
    heading: headline,
    contentHtml: bodyHtml,
  });

  return {
    subject: `[${appName}] ${subject}`,
    text: `Hi ${customerName},\n\nYou left ${abandonedCart.itemCount} items in your cart totaling ${currencySymbol}${abandonedCart.cartTotal.toFixed(
      2,
    )}.\n\nComplete your purchase here: ${restoreUrl}`,
    html,
  };
}
