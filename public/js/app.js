// Initialize Supabase Client
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth state management
let currentUser = null;
let cart = JSON.parse(localStorage.getItem('bf_cart')) || [];

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { user } } = await supabase.auth.getUser();
  currentUser = user;
  updateNav();
  if (window.location.pathname.includes('store.html')) loadProducts();
});

function updateNav() {
  const sellerLink = document.getElementById('nav-seller');
  const authBtn = document.getElementById('auth-btn');
  
  if (currentUser) {
    if (sellerLink) sellerLink.style.display = 'inline';
    if (authBtn) {
      authBtn.innerText = 'Logout';
      authBtn.onclick = () => supabase.auth.signOut().then(() => window.location.reload());
    }
  }
}

// Register User with GCash Number
async function registerUser(email, password, fullName, gcashNumber) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return alert(error.message);

  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ id: data.user.id, full_name: fullName, gcash_number: gcashNumber }]);
    
    if (profileError) alert(profileError.message);
    else alert('Registration Successful!');
  }
}

// Add to Cart
function addToCart(id, title, price) {
  cart.push({ id, title, price });
  localStorage.setItem('bf_cart', JSON.stringify(cart));
  alert(`${title} added to cart!`);
}

// Checkout via PayMongo Function
async function checkout() {
  if (!currentUser) return alert('Please login to checkout');
  if (cart.length === 0) return alert('Your cart is empty');

  // Create Order in Supabase
  const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);
  const { data: order, error } = await supabase
    .from('orders')
    .insert([{ buyer_id: currentUser.id, total_amount: totalAmount }])
    .select()
    .single();

  if (error) return alert(error.message);

  // Call Serverless API
  const res = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: cart, buyerId: currentUser.id, orderId: order.id })
  });

  const session = await res.json();
  if (session.data?.attributes?.checkout_url) {
    localStorage.removeItem('bf_cart');
    window.location.href = session.data.attributes.checkout_url;
  }
}
