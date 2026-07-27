document.addEventListener('DOMContentLoaded', () => {
  const API_URL = '/api/products';
  const grid = document.getElementById('product-grid');
  let productsCache = [];

  // 1. Fetch products from PostgreSQL API
  async function loadProducts() {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      productsCache = Array.isArray(data) ? data : (data.products || []);

      renderProducts(productsCache);
      updateStats(productsCache);
    } catch (err) {
      grid.innerHTML = `
        <div class="col-span-full text-center text-red-400 py-12">
          <i class="fa-solid fa-triangle-exclamation text-3xl mb-2"></i>
          <p>Failed to connect to PostgreSQL API: ${err.message}</p>
        </div>
      `;
    }
  }

  // 2. Render Cards in Grid
  function renderProducts(products) {
    if (products.length === 0) {
      grid.innerHTML = `<div class="col-span-full text-center text-slate-400 py-12">No products found.</div>`;
      return;
    }

    grid.innerHTML = products.slice(0, 30).map(product => {
      const attrs = typeof product.attributes === 'string' ? JSON.parse(product.attributes) : (product.attributes || {});
      const price = parseFloat(product.price) || 0;

      return `
        <div class="glass-card rounded-2xl p-5 hover:border-indigo-500/50 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-start mb-3">
              <span class="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-mono rounded-lg">
                ${product.sku || 'NO-SKU'}
              </span>
              <span class="text-emerald-400 font-bold text-lg">$${price.toFixed(2)}</span>
            </div>
            
            <h4 class="font-bold text-lg text-white mb-2 leading-snug">${product.name}</h4>
            
            <!-- Metadata badges parsed from JSONB -->
            <div class="space-y-1.5 text-xs text-slate-400 my-4 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
              <div class="flex justify-between"><span>Education Level:</span> <strong class="text-slate-200">${attrs.education || 'N/A'}</strong></div>
              <div class="flex justify-between"><span>Housing Loan:</span> <strong class="text-slate-200">${attrs.housing_loan || 'N/A'}</strong></div>
              <div class="flex justify-between"><span>Age / Capacity:</span> <strong class="text-slate-200">${product.stock_quantity || 'N/A'}</strong></div>
            </div>
          </div>

          <div class="flex space-x-2 mt-4 pt-3 border-t border-slate-700/50">
            <button onclick="deleteProduct(${product.product_id})" class="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs font-medium transition">
              <i class="fa-solid fa-trash mr-1"></i> Delete
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // 3. Update Stat Summary Cards
  function updateStats(products) {
    document.getElementById('stat-total').innerText = products.length.toLocaleString();
    const avg = products.reduce((acc, p) => acc + (parseFloat(p.price) || 0), 0) / (products.length || 1);
    document.getElementById('stat-avg-price').innerText = `$${avg.toFixed(2)}`;
  }

  // 4. Search Filter
  document.getElementById('search-input').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = productsCache.filter(p => 
      (p.name && p.name.toLowerCase().includes(query)) || 
      (p.sku && p.sku.toLowerCase().includes(query))
    );
    renderProducts(filtered);
  });

  // Global Delete Function
  window.deleteProduct = async (id) => {
    if (!confirm(`Delete product ID #${id}?`)) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      loadProducts();
    } catch (err) {
      alert("Error deleting product: " + err.message);
    }
  };

  loadProducts();
});