/**
 * Comprehensive integration test for Section 20: Transactional Notifications & Emails
 */
const http = require('http');

async function testEmailTemplates() {
  console.log('--- Testing Transactional Email Templates & MailService ---');

  // Let's import the compiled mail service & templates from dist
  const { orderConfirmationTemplate, orderStatusChangedTemplate, lowStockAlertTemplate, returnStatusChangedTemplate } = require('../server/dist/modules/mail/templates/ecommerce.templates');

  const appName = 'ZYLO';
  const clientUrl = 'http://localhost:5176';
  const adminUrl = 'http://127.0.0.1:5175';

  // 1. Test Order Confirmation Template
  console.log('\n[1] Testing Order Confirmation Template...');
  const sampleOrder = {
    orderNumber: 'ZYLO-2026-981245',
    customerName: 'Alex Customer',
    customerEmail: 'alex.customer@example.com',
    shippingAddress: {
      street: '123 Market Street, Apt 4B',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'United States',
      phone: '+1 415-555-0199',
    },
    items: [
      {
        name: 'Apple MacBook Pro 16"',
        variantTitle: 'Space Gray, 32GB RAM, 1TB SSD',
        variantSku: 'MBP16-SG-32-1TB',
        quantity: 1,
        lineTotal: 2499.00,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100',
      },
      {
        name: 'Logitech MX Master 3S',
        variantTitle: 'Pale Gray',
        variantSku: 'LOGI-MX3S-GRY',
        quantity: 2,
        lineTotal: 198.00,
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100',
      },
    ],
    deliveryMethod: 'EXPRESS',
    subtotal: 2697.00,
    shippingFee: 12.99,
    discount: 50.00,
    appliedCoupon: 'SAVE50',
    tax: 215.76,
    grandTotal: 2875.75,
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    orderStatus: 'CONFIRMED',
    estimatedDeliveryDate: new Date(Date.now() + 3 * 86400000),
    createdAt: new Date(),
  };

  const orderConfMail = orderConfirmationTemplate(appName, clientUrl, sampleOrder, '$');
  console.log('Subject:', orderConfMail.subject);
  if (!orderConfMail.subject.includes('ZYLO-2026-981245')) throw new Error('Subject missing order number');
  if (!orderConfMail.html.includes('Apple MacBook Pro 16')) throw new Error('HTML missing product name');
  if (!orderConfMail.html.includes('Logitech MX Master 3S')) throw new Error('HTML missing second product');
  if (!orderConfMail.html.includes('123 Market Street')) throw new Error('HTML missing shipping address');
  if (!orderConfMail.html.includes('$2875.75')) throw new Error('HTML missing grand total');
  if (!orderConfMail.text.includes('ZYLO-2026-981245')) throw new Error('Text fallback missing order number');
  console.log('✓ Order Confirmation Template verified (HTML length: ' + orderConfMail.html.length + ' chars, Text length: ' + orderConfMail.text.length + ' chars)');

  // 2. Test Order Status Change Template (SHIPPED & DELIVERED)
  console.log('\n[2] Testing Order Status Change Template...');
  const shippedOrder = {
    ...sampleOrder,
    orderStatus: 'SHIPPED',
    courierName: 'FedEx Express',
    trackingNumber: 'FX-88910293847',
    trackingUrl: 'https://www.fedex.com/tracking?tracknumbers=FX-88910293847',
  };

  const shippedMail = orderStatusChangedTemplate(appName, clientUrl, shippedOrder, 'SHIPPED', '$');
  console.log('Subject (SHIPPED):', shippedMail.subject);
  if (!shippedMail.subject.includes('Shipped')) throw new Error('Subject missing Shipped label');
  if (!shippedMail.html.includes('FedEx Express')) throw new Error('HTML missing courier name');
  if (!shippedMail.html.includes('FX-88910293847')) throw new Error('HTML missing tracking number');
  if (!shippedMail.html.includes('https://www.fedex.com/tracking')) throw new Error('HTML missing tracking URL');
  console.log('✓ Shipped Status Template verified');

  const deliveredMail = orderStatusChangedTemplate(appName, clientUrl, sampleOrder, 'DELIVERED', '$');
  console.log('Subject (DELIVERED):', deliveredMail.subject);
  if (!deliveredMail.subject.includes('Delivered')) throw new Error('Subject missing Delivered label');
  console.log('✓ Delivered Status Template verified');

  // 3. Test Low-Stock Alert Template
  console.log('\n[3] Testing Low-Stock Alert Template...');
  const sampleProduct = {
    name: 'Sony WH-1000XM5 Noise Canceling Headphones',
    sku: 'SONY-WH1000XM5-BLK',
    lowStockThreshold: 5,
  };

  const lowStockMail = lowStockAlertTemplate(appName, adminUrl, sampleProduct, 2, 'Midnight Black');
  console.log('Subject (Low Stock):', lowStockMail.subject);
  if (!lowStockMail.subject.includes('Low Stock')) throw new Error('Subject missing Low Stock');
  if (!lowStockMail.html.includes('2 units')) throw new Error('HTML missing remaining stock');
  if (!lowStockMail.html.includes('SONY-WH1000XM5-BLK')) throw new Error('HTML missing SKU');
  if (!lowStockMail.html.includes(adminUrl + '/products')) throw new Error('HTML missing admin link');
  console.log('✓ Low-Stock Alert Template verified');

  const outOfStockMail = lowStockAlertTemplate(appName, adminUrl, sampleProduct, 0, null);
  console.log('Subject (Out of Stock):', outOfStockMail.subject);
  if (!outOfStockMail.subject.includes('OUT OF STOCK')) throw new Error('Subject missing OUT OF STOCK');
  console.log('✓ Out of Stock Alert Template verified');

  // 4. Test Return Request Status Update Template
  console.log('\n[4] Testing Return Request Status Update Template...');
  const sampleReturn = {
    returnNumber: 'RET-2026-441209',
    orderNumber: 'ZYLO-2026-981245',
    customerName: 'Alex Customer',
    customerEmail: 'alex.customer@example.com',
    status: 'APPROVED',
    totalRefundAmount: 198.00,
    items: [
      {
        name: 'Logitech MX Master 3S',
        variantTitle: 'Pale Gray',
        quantity: 2,
        refundAmount: 198.00,
      },
    ],
  };

  const approvedReturnMail = returnStatusChangedTemplate(appName, clientUrl, sampleReturn, '$');
  console.log('Subject (APPROVED):', approvedReturnMail.subject);
  if (!approvedReturnMail.subject.includes('Approved')) throw new Error('Subject missing Approved label');
  if (!approvedReturnMail.html.includes('$198.00')) throw new Error('HTML missing refund amount');
  if (!approvedReturnMail.html.includes('RET-2026-441209')) throw new Error('HTML missing return number');
  console.log('✓ Return Approved Template verified');

  const refundedReturn = {
    ...sampleReturn,
    status: 'REFUNDED',
    refundTransactionId: 'STRIPE-REF-992144',
  };
  const refundedMail = returnStatusChangedTemplate(appName, clientUrl, refundedReturn, '$');
  console.log('Subject (REFUNDED):', refundedMail.subject);
  if (!refundedMail.subject.includes('Refund Processed')) throw new Error('Subject missing Refund label');
  if (!refundedMail.html.includes('STRIPE-REF-992144')) throw new Error('HTML missing refund txn id');
  console.log('✓ Return Refunded Template verified');

  console.log('\n========================================');
  console.log('ALL TRANSACTIONAL EMAIL TEMPLATES PASSED!');
  console.log('========================================');
}

testEmailTemplates().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
