export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { items, buyerId, orderId } = req.body;

  const lineItems = items.map(item => ({
    currency: 'PHP',
    amount: Math.round(item.price * 100), // Convert to centavos
    description: item.description || 'Craft item from Bright Finds',
    name: item.title,
    quantity: item.quantity || 1,
  }));

  try {
    const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY).toString('base64')}`
      },
      body: JSON.stringify({
        data: {
          attributes: {
            billing: { name: 'Bright Finds Customer' },
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            payment_method_types: ['gcash', 'paymaya', 'card'],
            line_items: lineItems,
            metadata: {
              order_id: orderId,
              buyer_id: buyerId
            },
            success_url: `${process.env.PUBLIC_URL}/history.html?status=success`,
            cancel_url: `${process.env.PUBLIC_URL}/store.html?status=cancelled`
          }
        }
      })
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
