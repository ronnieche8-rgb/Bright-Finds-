// Initialize Supabase Client
const SUPABASE_URL = 'https://qdslzrbnblvyxskicdvm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkc2x6cmJuYmx2eXhraWNkdm0iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczODE2MjA3M30.B5idVL2X08qnjwvqoGqC8HhwsazxpzQPm3KV0U0h07w';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

  if (authBtn) {
    if (currentUser) {
      if (sellerLink) sellerLink.style.display = 'inline';
      authBtn.innerText = 'Logout';
      authBtn.onclick = () => supabase.auth.signOut().then(() => window.location.reload());
    } else {
      if (sellerLink) sellerLink.style.display = 'none';
      authBtn.innerText = 'Login';
      authBtn.onclick = () => {
        const modal = document.getElementById('auth-modal');
        if (modal) modal.style.display = 'block';
      };
    }
  }
}