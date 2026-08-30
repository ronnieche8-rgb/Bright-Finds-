// =========================================================
// BRIGHT FINDS - APP.JS
// =========================================================

// Initialize Supabase Client
const SUPABASE_URL =
  'https://qdslzrbnblvyxskicdvm.supabase.co';

const SUPABASE_ANON_KEY =
  'sb_publishable_kDlVEfvz_vZOkUdyn--n3w_0ZL3JrI5';

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );


// =========================================================
// GLOBAL VARIABLES
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

    await checkAuthState();

    setupAuthForm();

    // Load products if store page
    if (
      document.getElementById('product-list')
    ) {
      await loadProducts();
    }

    // Listen for login/logout changes
    supabaseClient.auth.onAuthStateChange(
      async (event, session) => {

        currentUser =
          session?.user || null;

        updateNav();
      }
    );

  }
);


// =========================================================
// AUTH STATE
// =========================================================

async function checkAuthState() {

  try {

    // getSession() safely returns null
    // when nobody is logged in.
    const {
      data,
      error
    } =
      await supabaseClient.auth.getSession();

    if (error) {
      console.error(
        'Auth session error:',
        error
      );

      currentUser = null;

    } else {

      currentUser =
        data?.session?.user || null;

    }

    updateNav();

  } catch (error) {

    console.error(
      'Auth state error:',
      error
    );

    currentUser = null;

    updateNav();
  }
}


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

        const {
          error
        } =
          await supabaseClient.auth.signOut();

        if (error) {

          console.error(
            'Logout error:',
            error
          );

          alert(
            'Logout failed: ' +
            error.message
          );

          return;
        }

        currentUser = null;

        updateNav();

        window.location.reload();
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
            'flex';
        }

      };

  }

}


// =========================================================
// LOGIN FORM
// =========================================================

function setupAuthForm() {

  const loginForm =
    document.getElementById('login-form');

  const registerForm =
    document.getElementById('register-form');


  // =========================
  // LOGIN
  // =========================

  if (loginForm) {

    loginForm.addEventListener(
      'submit',
      async (event) => {

        event.preventDefault();

        const email =
          document.getElementById('login-email')
            ?.value
            ?.trim();

        const password =
          document.getElementById('login-password')
            ?.value;


        if (!email || !password) {

          alert(
            'Please enter your email and password.'
          );

          return;
        }


        const submitButton =
          loginForm.querySelector(
            'button[type="submit"]'
          );


        if (submitButton) {

          submitButton.disabled = true;

          submitButton.innerText =
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
              'Login failed: ' +
              error.message
            );

            return;
          }


          currentUser =
  data?.user || null;


// =====================================================
// CREATE PROFILE IF IT DOESN'T EXIST
// =====================================================

if (currentUser) {

  const {
    data: existingProfile,
    error: profileCheckError
  } =
    await supabaseClient
      .from('profiles')
      .select('id')
      .eq('id', currentUser.id)
      .maybeSingle();

  if (profileCheckError) {

    console.error(
      'Profile check error:',
      profileCheckError
    );

  }

  if (!existingProfile) {

    const {
      error: profileError
    } =
      await supabaseClient
        .from('profiles')
        .insert({
          id: currentUser.id,
          full_name:
            currentUser.user_metadata?.full_name || '',
          role:
            currentUser.user_metadata?.role || 'buyer',
          gcash_number:
            currentUser.user_metadata?.gcash_number || ''
        });

    if (profileError) {

      console.error(
        'Profile creation error:',
        profileError
      );

      alert(
        'Logged in, but your profile could not be created: ' +
        profileError.message
      );

      return;

    }

  }

}


updateNav();

closeAuthModal();

          loginForm.reset();


          window.location.reload();


        } catch (error) {

          console.error(
            'Login error:',
            error
          );

          alert(
            'Something went wrong while logging in.'
          );

        } finally {

          if (submitButton) {

            submitButton.disabled =
              false;

            submitButton.innerText =
              'Sign In';

          }

        }

      }
    );

  }


  // =========================
  // REGISTER
  // =========================

  if (registerForm) {

    registerForm.addEventListener(
      'submit',
      async (event) => {

        event.preventDefault();


        const name =
          document.getElementById(
            'register-name'
          )?.value
          ?.trim();

        const email =
          document.getElementById(
            'register-email'
          )?.value
          ?.trim();

        const password =
          document.getElementById(
            'register-password'
          )?.value;

        const role =
          document.getElementById(
            'register-role'
          )?.value;

        const gcash =
          document.getElementById(
            'register-gcash'
          )?.value
          ?.trim();


        if (
          !name ||
          !email ||
          !password ||
          !role ||
          !gcash
        ) {

          alert(
            'Please complete all fields.'
          );

          return;
        }


        if (password.length < 6) {

          alert(
            'Password must be at least 6 characters.'
          );

          return;
        }


        const submitButton =
          registerForm.querySelector(
            'button[type="submit"]'
          );


        if (submitButton) {

          submitButton.disabled =
            true;

          submitButton.innerText =
            'Creating account...';

        }


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
                      name,

                    role:
                      role,

                    gcash_number:
                      gcash

                  }

                }

              });


          if (error) {

            console.error(
              'Registration error:',
              error
            );

            alert(
              'Registration failed: ' +
              error.message
            );

            return;
          }
// =====================================================
// CREATE PROFILE ROW
// =====================================================

if (data?.user) {

  const { error: profileError } =
    await supabaseClient
      .from('profiles')
      .insert({
        id: data.user.id,
        full_name: name,
        role: role,
        gcash_number: gcash
      });

  if (profileError) {

    console.error(
      'Profile creation error:',
      profileError
    );

    alert(
      'Account was created, but your profile could not be created: ' +
      profileError.message
    );

    return;
  }

}

          /*
           * If email confirmation is enabled,
           * Supabase may not immediately give
           * us a logged-in session.
           */

          if (data?.session) {

            currentUser =
              data.user;

            alert(
              'Account created successfully!'
            );

            closeAuthModal();

            registerForm.reset();

            updateNav();

            window.location.reload();

          } else {

            alert(
              'Account created! Please check your email to confirm your account before logging in.'
            );

            showLogin();

          }


        } catch (error) {

          console.error(
            'Registration crash:',
            error
          );

          alert(
            'Something went wrong while creating your account.'
          );

        } finally {

          if (submitButton) {

            submitButton.disabled =
              false;

            submitButton.innerText =
              'Create Account';

          }

        }

      }
    );

  }

}

window.showRegister = function () {

  const loginSection =
    document.getElementById(
      'login-section'
    );

  const registerSection =
    document.getElementById(
      'register-section'
    );

  if (loginSection) {
    loginSection.style.display =
      'none';
  }

  if (registerSection) {
    registerSection.style.display =
      'block';
  }

};
window.showLogin = function () {

  const loginSection =
    document.getElementById(
      'login-section'
    );

  const registerSection =
    document.getElementById(
      'register-section'
    );

  if (registerSection) {
    registerSection.style.display =
      'none';
  }

  if (loginSection) {
    loginSection.style.display =
      'block';
  }

};
// =========================================================
// PRODUCTS
// =========================================================

async function loadProducts() {

  const list =
    document.getElementById(
      'product-list'
    );

  if (!list) {
    return;
  }


  try {

   const {
  data: products,
  error
} =
  await supabaseClient
    .from('products')
    .select('*')
    .order(
      'created_at',
      {
        ascending: false
      }
    );

console.log('STORE PRODUCTS:', products);
    
    if (error) {

      console.error(
        'Products error:',
        error
      );

      list.innerHTML =
        '<p>Unable to load products.</p>';

      return;
    }


    if (!products?.length) {

      list.innerHTML =
        '<p>No products available yet.</p>';

      return;
    }


    list.innerHTML =
      products
        .map(product => {

          const title =
            product.title ||
            product.name ||
            'Untitled Product';

          const image =
            product.image_url ||
            'https://via.placeholder.com/200';

          const price =
            Number(product.price || 0)
              .toFixed(2);


          return `
            <div class="card">

              <span class="star-decoration">
                ★
              </span>

              <img
                src="${image}"
                alt="${title}"
              >

              <h3>
                ${title}
              </h3>

              <p>
                ${product.description || ''}
              </p>

              <p>
                <strong>
                  ₱${price}
                </strong>
              </p>

              <button
                onclick="addToCart(
                  '${product.id}',
                  ${JSON.stringify(title)},
                  ${Number(product.price || 0)}
                )"
                class="cta-btn"
              >
                Add to Cart
              </button>

            </div>
          `;

        })
        .join('');


  } catch (error) {

    console.error(
      'Products loading crash:',
      error
    );

    list.innerHTML =
      '<p>Unable to load products.</p>';

  }

}


// =========================================================
// CART
// =========================================================

window.addToCart =
  function (
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
        id: productId,
        title,
        price: Number(price),
        quantity: 1
      });

    }


    localStorage.setItem(
      'bf_cart',
      JSON.stringify(cart)
    );


    alert(
      `${title} added to cart!`
    );

  };


// =========================================================
// CHECKOUT BUTTON
// =========================================================

window.checkout =
  async function () {

    if (!currentUser) {

      alert(
        'Please login before checking out.'
      );

      const modal =
        document.getElementById(
          'auth-modal'
        );

      if (modal) {
        modal.style.display =
          'flex';
      }

      return;
    }


    if (!cart.length) {

      alert(
        'Your cart is empty.'
      );

      return;
    }


    try {

      const response =
        await fetch(
          '/api/create-checkout.js',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body:
              JSON.stringify({
                items: cart.map(
                  item => ({
                    title:
                      item.title,

                    price:
                      item.price,

                    quantity:
                      item.quantity,

                    description:
                      item.title
                  })
                ),

                buyerId:
                  currentUser.id
              })

          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data?.error ||
          'Checkout failed.'
        );

      }


      if (data.checkoutUrl) {

        window.location.href =
          data.checkoutUrl;

      } else {

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
        'Checkout failed: ' +
        error.message
      );

    }

  };


// =========================================================
// MODALS
// =========================================================

window.closeAuthModal =
  function () {

    const modal =
      document.getElementById(
        'auth-modal'
      );

    if (modal) {
      modal.style.display =
        'none';
    }

  };


// =========================================================
// EXPOSE SUPABASE FOR store.html
// =========================================================
//
// IMPORTANT:
// We use "supabaseClient" internally so
// there is NO duplicate "const supabase"
// declaration problem.
//
// store.html can still access:
// window.supabaseClient
//

window.supabaseClient =
  supabaseClient;


// =========================================================
// FINISHED
// =========================================================
