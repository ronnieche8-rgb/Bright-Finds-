// =========================================================
// BRIGHT FINDS — APP.JS
// =========================================================

// Initialize Supabase Client
const SUPABASE_URL =
  'https://qdslzrbnblvyxskicdvm.supabase.co';

const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkc2x6cmJuYmx2eXhraWNkdm0iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczODE2MjA3M30.B5idVL2X08qnjwvqoGqC8HhwsazxpzQPm3KV0U0h07w';

// IMPORTANT:
// Do NOT call this variable "supabase" because the
// Supabase CDN already exposes window.supabase.
const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );


// =========================================================
// GLOBAL STATE
// =========================================================

let currentUser = null;

let cart =
  JSON.parse(
    localStorage.getItem('bf_cart') || '[]'
  );


// =========================================================
// INITIALIZATION
// =========================================================

document.addEventListener(
  'DOMContentLoaded',
  async () => {

    try {

      await checkAuthState();

      setupLoginForm();

      setupAuthModal();

      updateNav();

      // Load products only when the product container
      // exists on the current page.
      if (
        document.getElementById('product-list') ||
        document.getElementById('product-catalog')
      ) {
        await loadProducts();
      }

    } catch (error) {

      console.error(
        'Bright Finds initialization error:',
        error
      );

    }

  }
);


// =========================================================
// AUTH STATE
// =========================================================

async function checkAuthState() {

  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth.getUser();

    if (error) {
      console.error(
        'Auth state error:',
        error
      );

      currentUser = null;

      return;
    }

    currentUser =
      data?.user || null;

    updateNav();

  } catch (error) {

    console.error(
      'Failed to check authentication:',
      error
    );

    currentUser = null;

  }

}


// Listen for login/logout changes
supabaseClient.auth.onAuthStateChange(
  (_event, session) => {

    currentUser =
      session?.user || null;

    setTimeout(() => {
      updateNav();
    }, 0);

  }
);


// =========================================================
// NAVIGATION / LOGIN BUTTON
// =========================================================

function updateNav() {

  const sellerLink =
    document.getElementById(
      'nav-seller'
    );

  const authBtn =
    document.getElementById(
      'auth-btn'
    );

  if (!authBtn) {
    return;
  }


  if (currentUser) {

    // Logged in
    if (sellerLink) {
      sellerLink.style.display =
        'inline';
    }

    authBtn.innerText =
      'Logout';

    authBtn.onclick =
      async () => {

        try {

          const {
            error
          } =
            await supabaseClient.auth.signOut();

          if (error) {
            throw error;
          }

          currentUser = null;

          updateNav();

          window.location.reload();

        } catch (error) {

          console.error(
            'Logout error:',
            error
          );

          alert(
            'Logout failed: ' +
            error.message
          );

        }

      };

  } else {

    // Logged out
    if (sellerLink) {
      sellerLink.style.display =
        'none';
    }

    authBtn.innerText =
      'Login';

    authBtn.onclick =
      () => {

        const modal =
          document.getElementById(
            'auth-modal'
          );

        if (modal) {
          modal.style.display =
            'block';
        }

      };

  }

}


// =========================================================
// LOGIN FORM
// =========================================================

function setupLoginForm() {

  const form =
    document.getElementById(
      'login-form'
    );

  if (!form) {
    return;
  }

  // Prevent duplicate listeners
  if (
    form.dataset.initialized === 'true'
  ) {
    return;
  }

  form.dataset.initialized =
    'true';

  form.addEventListener(
    'submit',
    handleLogin
  );

}


async function handleLogin(event) {

  event.preventDefault();

  const emailInput =
    document.getElementById(
      'login-email'
    );

  const passwordInput =
    document.getElementById(
      'login-password'
    );

  if (
    !emailInput ||
    !passwordInput
  ) {

    alert(
      'Login form is missing.'
    );

    return;
  }

  const email =
    emailInput.value.trim();

  const password =
    passwordInput.value;

  if (!email || !password) {

    alert(
      'Please enter your email and password.'
    );

    return;
  }


  const button =
    event.target.querySelector(
      'button[type="submit"]'
    );

  if (button) {
    button.disabled = true;
    button.textContent =
      'Signing in...';
  }


  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth
        .signInWithPassword({

          email,
          password

        });


    if (error) {

      alert(
        'Login Error: ' +
        error.message
      );

      return;
    }


    currentUser =
      data?.user || null;


    // Close modal
    const modal =
      document.getElementById(
        'auth-modal'
      );

    if (modal) {
      modal.style.display =
        'none';
    }


    updateNav();


    alert(
      'Login successful! Welcome back.'
    );


    // Clear form
    event.target.reset();

  } catch (error) {

    console.error(
      'Login error:',
      error
    );

    alert(
      'Login failed: ' +
      error.message
    );

  } finally {

    if (button) {

      button.disabled =
        false;

      button.textContent =
        'Sign In';

    }

  }

}


// =========================================================
// AUTH MODAL
// =========================================================

function setupAuthModal() {

  const modal =
    document.getElementById(
      'auth-modal'
    );

  if (!modal) {
    return;
  }

  // Close when clicking outside modal content
  modal.addEventListener(
    'click',
    event => {

      if (
        event.target === modal
      ) {

        modal.style.display =
          'none';

      }

    }
  );

}


// =========================================================
// REGISTER SUPPORT
// =========================================================

// This function is available if another page has
// registration fields.
window.registerUser =
  async function registerUser(
    email,
    password,
    fullName,
    gcash
  ) {

    try {

      const {
        data,
        error
      } =
        await supabaseClient.auth
          .signUp({

            email,
            password,

            options: {

              data: {

                full_name:
                  fullName,

                gcash_number:
                  gcash

              }

            }

          });


      if (error) {

        alert(
          'Registration Error: ' +
          error.message
        );

        return null;

      }


      alert(
        'Registration successful! Check your email if confirmation is required.'
      );


      return data;

    } catch (error) {

      console.error(
        'Registration error:',
        error
      );

      alert(
        'Registration failed: ' +
        error.message
      );

      return null;

    }

  };


// =========================================================
// PRODUCTS
// =========================================================

async function loadProducts() {

  try {

    const {
      data: products,
      error
    } =
      await supabaseClient
        .from('products')
        .select(`
          *,
          reviews(rating)
        `);


    if (error) {

      console.error(
        'Error fetching products:',
        error
      );

      return;

    }


    const list =
      document.getElementById(
        'product-list'
      );

    const catalog =
      document.getElementById(
        'product-catalog'
      );


    // Store page uses product-list
    if (list) {

      list.innerHTML =
        (products || [])
          .map(
            product => {

              const title =
                product.title ||
                product.name ||
                'Untitled item';

              const description =
                product.description ||
                '';

              const price =
                Number(
                  product.price || 0
                );


              return `

                <div class="card">

                  <span
                    class="star-decoration"
                  >
                    ★
                  </span>

                  <img
                    src="${
                      product.image_url ||
                      'https://via.placeholder.com/200'
                    }"
                    alt="${escapeHtml(title)}"
                  >

                  <h3>
                    ${escapeHtml(title)}
                  </h3>

                  <p>
                    ${escapeHtml(description)}
                  </p>

                  <p>
                    <strong>
                      ₱${price.toFixed(2)}
                    </strong>
                  </p>

                  <button
                    class="cta-btn"
                    onclick="addToCart(
                      '${product.id}',
                      ${JSON.stringify(title)},
                      ${price}
                    )"
                  >
                    Add to Cart
                  </button>

                </div>

              `;

            }
          )
          .join('');

    }


    // Product-catalog compatibility
    if (catalog) {

      catalog.innerHTML =
        (products || [])
          .map(
            product => {

              const title =
                product.title ||
                product.name ||
                'Untitled item';

              const description =
                product.description ||
                '';

              const price =
                Number(
                  product.price || 0
                );

              const reviews =
                product.reviews || [];

              const avgRating =
                reviews.length
                  ? (
                      reviews.reduce(
                        (
                          total,
                          review
                        ) =>
                          total +
                          Number(
                            review.rating || 0
                          ),
                        0
                      ) /
                      reviews.length
                    ).toFixed(1)
                  : 'No ratings';


              return `

                <div
                  class="product-card"
                >

                  <img
                    src="${
                      product.image_url ||
                      'https://via.placeholder.com/300'
                    }"
                    class="product-image"
                    alt="${escapeHtml(title)}"
                  >

                  <h3>
                    ${escapeHtml(title)}
                  </h3>

                  <p>
                    ${escapeHtml(description)}
                  </p>

                  <div
                    class="star-rating"
                  >
                    ★ ${avgRating}
                  </div>

                  <p>
                    <strong>
                      PHP ${price.toFixed(2)}
                    </strong>
                  </p>

                  <button
                    class="cta-button"
                    onclick="initiatePayment(
                      '${product.id}',
                      ${price},
                      ${JSON.stringify(title)}
                    )"
                  >
                    Buy via GCash
                  </button>

                  <button
                    class="secondary-button"
                    onclick="openReviewModal(
                      '${product.id}'
                    )"
                  >
                    Review
                  </button>

                </div>

              `;

            }
          )
          .join('');

    }

  } catch (error) {

    console.error(
      'Product loading error:',
      error
    );

  }

}


// =========================================================
// CART
// =========================================================

window.addToCart =
  function addToCart(
    productId,
    title,
    price
  ) {

    const existing =
      cart.find(
        item =>
          item.id === productId
      );


    if (existing) {

      existing.quantity += 1;

    } else {

      cart.push({

        id:
          productId,

        title:
          title,

        price:
          Number(price),

        quantity:
          1

      });

    }


    localStorage.setItem(
      'bf_cart',
      JSON.stringify(cart)
    );


    alert(
      'Item added to cart!'
    );

  };


// =========================================================
// PAYMONGO CHECKOUT
// =========================================================

window.initiatePayment =
  async function initiatePayment(
    productId,
    price,
    title
  ) {

    if (!currentUser) {

      alert(
        'Please login to purchase items.'
      );

      const modal =
        document.getElementById(
          'auth-modal'
        );

      if (modal) {
        modal.style.display =
          'block';
      }

      return;

    }


    try {

      const response =
        await fetch(
          '/api/create-checkout',
          {

            method:
              'POST',

            headers: {

              'Content-Type':
                'application/json'

            },

            body:
              JSON.stringify({

                items: [

                  {

                    productId,

                    price:
                      Number(price),

                    title,

                    description:
                      title,

                    quantity:
                      1

                  }

                ],

                buyerId:
                  currentUser.id

              })

          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.error ||
          'Checkout initialization failed.'
        );

      }


      // Different PayMongo response formats
      // are supported.
      const checkoutUrl =
        data.checkoutUrl ||
        data.data?.attributes
          ?.checkout_url;


      if (checkoutUrl) {

        window.location.href =
          checkoutUrl;

      } else {

        console.error(
          'PayMongo response:',
          data
        );

        alert(
          'Checkout initialization failed.'
        );

      }

    } catch (error) {

      console.error(
        'Checkout error:',
        error
      );

      alert(
        'Checkout error: ' +
        error.message
      );

    }

  };


// =========================================================
// SELLER — CREATE PRODUCT
// =========================================================

async function handleCreateProduct(event) {

  event.preventDefault();

  if (!currentUser) {

    alert(
      'Please login first.'
    );

    return;

  }


  const title =
    document.getElementById(
      'prod-title'
    )?.value;


  const description =
    document.getElementById(
      'prod-desc'
    )?.value;


  const price =
    parseFloat(
      document.getElementById(
        'prod-price'
      )?.value
    );


  const category =
    document.getElementById(
      'prod-category'
    )?.value;


  const imageUrl =
    document.getElementById(
      'prod-image'
    )?.value;


  const {
    error
  } =
    await supabaseClient
      .from('products')
      .insert([{

        seller_id:
          currentUser.id,

        title,

        description,

        price,

        category,

        image_url:
          imageUrl

      }]);


  if (error) {

    alert(
      'Error publishing product: ' +
      error.message
    );

    return;

  }


  alert(
    'Product listed successfully!'
  );


  closeModal(
    'sell-modal'
  );


  loadProducts();

}


// =========================================================
// DASHBOARD
// =========================================================

window.loadDashboardData =
  async function loadDashboardData() {

    if (!currentUser) {
      return;
    }


    // -----------------------------------------------------
    // PURCHASES
    // -----------------------------------------------------

    const {
      data: purchases,
      error: purchaseError
    } =
      await supabaseClient
        .from('orders')
        .select(
          `*,
           products(title)`
        )
        .eq(
          'buyer_id',
          currentUser.id
        );


    if (purchaseError) {

      console.error(
        'Purchase history error:',
        purchaseError
      );

    }


    const boughtContainer =
      document.getElementById(
        'bought-history'
      );


    if (boughtContainer) {

      boughtContainer.innerHTML =
        purchases?.map(
          purchase => `

            <p>

              Product:
              ${escapeHtml(
                purchase.products?.title ||
                'Item'
              )}

              -

              Amount:
              PHP ${
                Number(
                  purchase.amount || 0
                ).toFixed(2)
              }

              -

              Status:
              ${escapeHtml(
                purchase.status ||
                'Unknown'
              )}

            </p>

          `
        ).join('')
        ||
        '<p>No purchase history found.</p>';

    }


    // -----------------------------------------------------
    // SALES
    // -----------------------------------------------------

    const {
      data: sales,
      error: salesError
    } =
      await supabaseClient
        .from('orders')
        .select(
          `*,
           products!inner(
             title,
             seller_id
           )`
        )
        .eq(
          'products.seller_id',
          currentUser.id
        );


    if (salesError) {

      console.error(
        'Sales history error:',
        salesError
      );

    }


    const salesContainer =
      document.getElementById(
        'sales-history'
      );


    if (salesContainer) {

      salesContainer.innerHTML =
        sales?.map(
          sale => `

            <p>

              Item Sold:
              ${escapeHtml(
                sale.products?.title ||
                'Item'
              )}

              -

              Amount:
              PHP ${
                Number(
                  sale.amount || 0
                ).toFixed(2)
              }

              -

              Date:
              ${
                sale.created_at
                  ? new Date(
                      sale.created_at
                    ).toLocaleDateString()
                  : 'Unknown'
              }

            </p>

          `
        ).join('')
        ||
        '<p>No sales history recorded yet.</p>';

    }

  };


// =========================================================
// MODALS
// =========================================================

window.openModal =
  function openModal(id) {

    const modal =
      document.getElementById(id);

    if (modal) {
      modal.style.display =
        'flex';
    }

  };


window.closeModal =
  function closeModal(id) {

    const modal =
      document.getElementById(id);

    if (modal) {
      modal.style.display =
        'none';
    }

  };


// =========================================================
// REVIEWS
// =========================================================

window.openReviewModal =
  function openReviewModal(
    productId
  ) {

    const input =
      document.getElementById(
        'review-product-id'
      );

    if (input) {
      input.value =
        productId;
    }

    openModal(
      'review-modal'
    );

  };


async function handleCreateReview(event) {

  event.preventDefault();

  if (!currentUser) {

    alert(
      'Please login first.'
    );

    return;

  }


  const productId =
    document.getElementById(
      'review-product-id'
    )?.value;


  const rating =
    parseInt(
      document.getElementById(
        'review-rating'
      )?.value
    );


  const comment =
    document.getElementById(
      'review-comment'
    )?.value;


  const {
    error
  } =
    await supabaseClient
      .from('reviews')
      .insert([{

        product_id:
          productId,

        user_id:
          currentUser.id,

        rating,

        comment

      }]);


  if (error) {

    alert(
      'Error submitting review: ' +
      error.message
    );

    return;

  }


  alert(
    'Review added!'
  );


  closeModal(
    'review-modal'
  );


  loadProducts();

}


// =========================================================
// FORM SETUP
// =========================================================

function setupEventListeners() {

  const authForm =
    document.getElementById(
      'auth-form'
    );

  if (authForm) {

    authForm.addEventListener(
      'submit',
      handleAuth
    );

  }


  const sellForm =
    document.getElementById(
      'sell-form'
    );

  if (sellForm) {

    sellForm.addEventListener(
      'submit',
      handleCreateProduct
    );

  }


  const reviewForm =
    document.getElementById(
      'review-form'
    );

  if (reviewForm) {

    reviewForm.addEventListener(
      'submit',
      handleCreateReview
    );

  }

}


// Compatibility for older registration form
async function handleAuth(event) {

  event.preventDefault();

  const email =
    document.getElementById(
      'auth-email'
    )?.value;

  const password =
    document.getElementById(
      'auth-password'
    )?.value;

  const fullName =
    document.getElementById(
      'auth-name'
    )?.value;

  const gcash =
    document.getElementById(
      'auth-gcash'
    )?.value;

  const isRegister =
    document.getElementById(
      'auth-is-register'
    )?.checked;


  if (isRegister) {

    await window.registerUser(
      email,
      password,
      fullName,
      gcash
    );

  } else {

    const {
      data,
      error
    } =
      await supabaseClient.auth
        .signInWithPassword({

          email,
          password

        });


    if (error) {

      alert(
        'Login Error: ' +
        error.message
      );

      return;

    }


    currentUser =
      data?.user || null;

    updateNav();

    window.location.reload();

  }

}


// =========================================================
// SECURITY / HTML ESCAPING
// =========================================================

function escapeHtml(value) {

  return String(
    value ?? ''
  ).replace(
    /[&<>"']/g,
    character => ({

      '&':
        '&amp;',

      '<':
        '&lt;',

      '>':
        '&gt;',

      '"':
        '&quot;',

      "'":
        '&#39;'

    }[character])
  );

}


// =========================================================
// START
// =========================================================

setupEventListeners();
