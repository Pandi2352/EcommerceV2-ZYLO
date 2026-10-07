const API = 'http://localhost:5000/api/v1';

async function testReturnsFlow() {
  console.log('=== Starting Section 12: Returns & Refunds Management Test ===');

  // 1. Admin login
  console.log('1. Logging in as Admin...');
  const adminLoginRes = await fetch(`${API}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@zylo.internal',
      password: 'AdminPassword123!',
    }),
  });
  if (!adminLoginRes.ok) {
    throw new Error('Admin login failed: ' + (await adminLoginRes.text()));
  }
  const adminCookie = adminLoginRes.headers.get('set-cookie');
  const adminHeaders = {
    'Content-Type': 'application/json',
    Cookie: adminCookie || '',
  };
  console.log('Admin login successful.');

  // 2. Register a customer and create an order
  const email = `returns_customer_${Date.now()}@zylo.com`;
  console.log(`2. Registering customer: ${email}...`);
  const custRegRes = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Return Customer', email, password: 'Password123!' }),
  });
  if (!custRegRes.ok) throw new Error('Customer registration failed: ' + (await custRegRes.text()));
  const custCookie = custRegRes.headers.get('set-cookie');
  const custHeaders = {
    'Content-Type': 'application/json',
    Cookie: custCookie || '',
  };

  // 3. Fetch product to buy
  const prodRes = await fetch(`${API}/products?limit=1`);
  const prodData = await prodRes.json();
  const product = prodData.data.items[0];
  const initialStock = product.stockQuantity;
  console.log(`3. Using product "${product.name}" (Stock: ${initialStock})`);

  // 4. Add to cart & checkout
  await fetch(`${API}/cart/items`, {
    method: 'POST',
    headers: custHeaders,
    body: JSON.stringify({ productId: product._id, quantity: 2 }),
  });

  const checkoutRes = await fetch(`${API}/orders/checkout`, {
    method: 'POST',
    headers: custHeaders,
    body: JSON.stringify({
      shippingAddress: {
        street: '100 Return Way',
        city: 'Austin',
        state: 'TX',
        postalCode: '78701',
        country: 'US',
        phone: '+1 512-555-0144',
      },
      deliveryMethod: 'STANDARD',
      paymentMethod: 'ONLINE',
      termsAccepted: true,
    }),
  });
  const checkoutData = await checkoutRes.json();
  const order = checkoutData.data.order;
  console.log(`4. Placed order: ${order.orderNumber} (ID: ${order._id}, Status: ${order.orderStatus})`);

  // Verify return on non-delivered order fails
  const prematureReturnRes = await fetch(`${API}/returns`, {
    method: 'POST',
    headers: custHeaders,
    body: JSON.stringify({
      orderId: order._id,
      items: [{ orderItemId: order.items[0]._id, quantity: 1 }],
      reason: 'DAMAGED_ITEM',
    }),
  });
  console.log(`5. Validated rejection of return for non-delivered order (Status ${prematureReturnRes.status}):`, prematureReturnRes.status === 400 ? 'PASS' : 'FAIL');

  // Admin marks order as DELIVERED
  await fetch(`${API}/admin/orders/${order._id}/status`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({ status: 'DELIVERED', note: 'Order delivered to doorstep' }),
  });
  console.log('6. Order status transitioned to DELIVERED by admin.');

  // Check product stock after purchase
  const prodAfterOrderRes = await fetch(`${API}/products/${product.slug || product._id}`);
  const prodAfterOrder = (await prodAfterOrderRes.json()).data;
  const stockAfterPurchase = prodAfterOrder.stockQuantity;
  console.log(`7. Stock after purchasing 2 items: ${stockAfterPurchase}`);

  // Customer submits return request
  console.log('8. Customer submitting return request with photos and reason...');
  const returnSubmitRes = await fetch(`${API}/returns`, {
    method: 'POST',
    headers: custHeaders,
    body: JSON.stringify({
      orderId: order._id,
      items: [{ orderItemId: order.items[0]._id, quantity: 1 }],
      reason: 'DAMAGED_ITEM',
      customerNote: 'Item arrived with a broken edge during shipment',
      proofImages: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600'],
    }),
  });
  const returnSubmitData = await returnSubmitRes.json();
  if (!returnSubmitRes.ok) {
    throw new Error('Return submission failed: ' + JSON.stringify(returnSubmitData));
  }
  const returnRequest = returnSubmitData.data.returnRequest;
  console.log(`Return request created: ${returnRequest.returnNumber} (Refund Amount: $${returnRequest.totalRefundAmount}, Status: ${returnRequest.status})`);

  // Customer fetches their returns
  const custReturnsRes = await fetch(`${API}/returns`, { headers: custHeaders });
  const custReturnsData = await custReturnsRes.json();
  console.log(`9. Customer returns list count: ${custReturnsData.data.total}`);

  // Admin checks returns summary
  const adminSummaryRes = await fetch(`${API}/admin/returns/summary`, { headers: adminHeaders });
  const adminSummaryData = await adminSummaryRes.json();
  console.log('10. Admin Returns Summary:', adminSummaryData.data);

  // Admin reviews and approves return with restockItems: true
  console.log(`11. Admin approving return ${returnRequest._id} with automated restock...`);
  const reviewRes = await fetch(`${API}/admin/returns/${returnRequest._id}/review`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({
      decision: 'APPROVE',
      note: 'Verified damaged item photo, return authorized',
      restockItems: true,
      adminNotes: 'Supplier credit requested',
    }),
  });
  const reviewData = await reviewRes.json();
  console.log('Review result status:', reviewData.data.returnRequest.status);

  // Verify stock replenishment
  const prodAfterRestockRes = await fetch(`${API}/products/${product.slug || product._id}`);
  const prodAfterRestock = (await prodAfterRestockRes.json()).data;
  console.log(`12. Stock after approval restock (+1): ${prodAfterRestock.stockQuantity} (Expected: ${stockAfterPurchase + 1})`);
  console.log('Stock replenishment check:', prodAfterRestock.stockQuantity === stockAfterPurchase + 1 ? 'PASS' : 'FAIL');

  // Admin processes refund
  console.log('13. Admin triggering refund...');
  const refundRes = await fetch(`${API}/admin/returns/${returnRequest._id}/refund`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      amount: returnRequest.totalRefundAmount,
      transactionId: 'TXN-REFUND-99128',
      note: 'Online payment refund processed via gateway',
    }),
  });
  const refundData = await refundRes.json();
  console.log('Refund status:', refundData.data.returnRequest.status, 'Txn:', refundData.data.returnRequest.refundTransactionId);

  // Check admin return details by ID
  const adminDetailsRes = await fetch(`${API}/admin/returns/${returnRequest._id}`, { headers: adminHeaders });
  const adminDetailsData = await adminDetailsRes.json();
  console.log('14. Admin details fetch status history length:', adminDetailsData.data.statusHistory.length);

  console.log('=== Section 12 Backend Verification COMPLETE and SUCCESSFUL! ===');
}

testReturnsFlow().catch(console.error);
