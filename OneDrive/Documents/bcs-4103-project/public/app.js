document.addEventListener('DOMContentLoaded', () => {
  const API_URL = '/api/products';
  const grid = document.getElementById('product-grid');
  const modal = document.getElementById('product-modal');
  const addBtn = document.getElementById('add-product-btn');
  const closeBtn = document.getElementById('close-modal-btn');
  const cancelBtn = document.getElementById('cancel-modal-btn');
  const form = document.getElementById('add-product-form');
  const exportBtn = document.getElementById('export-csv-btn');

  // Application State
  let currentPage = 1;
  let currentLimit = 100;
  let currentSearch = '';
  let currentCategory = 'ALL';
  let currentSortBy = 'created_at';
  let currentSortOrder = 'desc';
  let totalPages = 1;
  let totalFilteredProducts = 0;

  let searchDebounceTimer = null;

  const formatKES = (val) => {
    const num = parseFloat(val) || 0;
    return `KSh ${num.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');
    const toastIcon = document.getElementById('toast-icon');

    toastMsg.innerText = message;
    toastIcon.className = isError 
      ? 'fa-solid fa-circle-xmark text-red-400 text-lg' 
      : 'fa-solid fa-circle-check text-emerald-400 text-lg';

    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0'), 3000);
  }

  const openModal = (isEdit = false) => {
    document.getElementById('modal-title').innerHTML = isEdit 
      ? '<i class="fa-solid fa-pen-to-square text-indigo-400 mr-2"></i> Edit Offering'
      : '<i class="fa-solid fa-plus-circle text-indigo-400 mr-2"></i> Add New Offering';
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  };

  const closeModal = () => {
    form.reset();
    document.getElementById('form-id').value = '';
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  };

  addBtn.addEventListener('click', () => openModal(false));
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  // Fetch Global DB Summary Statistics
  async function loadGlobalStats() {
    try {
      const res = await fetch('/api/products/stats');
      const stats = await res.json();

      document.getElementById('stat-total-db').innerText = parseInt(stats.total_records).toLocaleString();
      document.getElementById('stat-avg-price-db').innerText = formatKES(stats.avg_balance);
      document.getElementById('stat-sum-value').innerText = formatKES(stats.total_portfolio_value);
    } catch (err) {
      console.error('Error fetching global stats:', err);
    }
  }

  // Load Paginated Records from Backend
  async function loadProducts(page = 1) {
    try {
      grid.innerHTML = `
        <div class="col-span-full text-center py-16">
          <i class="fa-solid fa-circle-notch fa-spin text-4xl text-indigo-500 mb-3"></i>
          <p class="text-slate-400 text-sm">Searching database...</p>
        </div>
      `;

      const queryParams = new URLSearchParams({
        page,
        limit: currentLimit,
        search: currentSearch,
        category: currentCategory,
        sortBy: currentSortBy,
        sortOrder: currentSortOrder
      });

      const response = await fetch(`${API_URL}?${queryParams.toString()}`);
      const data = await response.json();

      currentPage = data.currentPage;
      totalPages = data.totalPages;
      totalFilteredProducts = data.totalProducts;

      document.getElementById('stat-filtered-count').innerText = totalFilteredProducts.toLocaleString();

      renderProducts(data.products || []);
      renderPaginationControls();
    } catch (err) {
      grid.innerHTML = `
        <div class="col-span-full text-center text-red-400 py-12">
          <i class="fa-solid fa-triangle-exclamation text-3xl mb-2"></i>
          <p>Failed to retrieve data: ${err.message}</p>
        </div>
      `;
    }
  }

  function renderProducts(products) {
    if (products.length === 0) {
      grid.innerHTML = `<div class="col-span-full text-center text-slate-400 py-12">No items match your search filter across the entire database.</div>`;
      return;
    }

    grid.innerHTML = products.map(product => {
      const id = product.product_id;
      const attrs = typeof product.attributes === 'string' ? JSON.parse(product.attributes) : (product.attributes || {});

      return `
        <div id="product-card-${id}" class="glass-card rounded-2xl p-5 hover:border-indigo-500/40 transition flex flex-col justify-between shadow-lg">
          <div>
            <div class="flex justify-between items-start mb-3">
              <span class="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-mono rounded-lg">
                ${product.sku || 'N/A'}
              </span>
              <span class="text-emerald-400 font-bold text-base">${formatKES(product.price)}</span>
            </div>
            
            <h4 class="font-bold text-sm text-white mb-3 leading-snug">${product.name}</h4>
            
            <div class="grid grid-cols-2 gap-2 text-xs text-slate-300 my-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <div><span class="text-slate-500 block">Age Group:</span> <strong>${attrs.age || 'N/A'} yrs</strong></div>
              <div><span class="text-slate-500 block">Education:</span> <strong class="capitalize">${attrs.education || 'N/A'}</strong></div>
              <div><span class="text-slate-500 block">Marital Status:</span> <strong class="capitalize">${attrs.marital || 'N/A'}</strong></div>
              <div><span class="text-slate-500 block">Housing Loan:</span> <strong class="capitalize">${attrs.housing_loan || 'No'}</strong></div>
              <div><span class="text-slate-500 block">Personal Loan:</span> <strong class="capitalize">${attrs.personal_loan || 'No'}</strong></div>
              <div><span class="text-slate-500 block">Target Term:</span> <strong>${product.stock_quantity || 1} mos</strong></div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-700/50 grid grid-cols-2 gap-2">
            <button onclick="editProduct('${id}')" class="py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1">
              <i class="fa-solid fa-pen-to-square"></i>
              <span>Edit</span>
            </button>
            <button onclick="deleteProduct('${id}')" class="py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1">
              <i class="fa-solid fa-trash"></i>
              <span>Remove</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderPaginationControls() {
    document.getElementById('page-info').innerText = `Page ${currentPage} of ${totalPages} (${totalFilteredProducts.toLocaleString()} records)`;

    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');

    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;

    prevBtn.onclick = () => { if (currentPage > 1) loadProducts(currentPage - 1); };
    nextBtn.onclick = () => { if (currentPage < totalPages) loadProducts(currentPage + 1); };

    const numContainer = document.getElementById('page-numbers');
    let pageBtns = '';

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let p = startPage; p <= endPage; p++) {
      pageBtns += `
        <button onclick="jumpToPage(${p})" class="px-3 py-1.5 rounded-lg text-xs font-semibold ${
          p === currentPage ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
        } transition border border-slate-700">
          ${p}
        </button>
      `;
    }
    numContainer.innerHTML = pageBtns;
  }

  window.jumpToPage = (p) => loadProducts(p);

  // Real-Time Debounced Search Input Across DB
  document.getElementById('search-input').addEventListener('input', (e) => {
    clearTimeout(searchDebounceTimer);
    currentSearch = e.target.value;
    searchDebounceTimer = setTimeout(() => {
      loadProducts(1);
    }, 350);
  });

  // Sorting Dropdown
  document.getElementById('sort-select').addEventListener('change', (e) => {
    const [field, order] = e.target.value.split('-');
    currentSortBy = field;
    currentSortOrder = order;
    loadProducts(1);
  });

  // Items Per Page Selection
  document.getElementById('limit-select').addEventListener('change', (e) => {
    currentLimit = parseInt(e.target.value);
    loadProducts(1);
  });

  // Category Filtering Buttons
  document.querySelectorAll('.category-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-cat');
      loadProducts(1);
    });
  });

  // CSV File Download Trigger
  exportBtn.addEventListener('click', () => {
    const params = new URLSearchParams({ search: currentSearch, category: currentCategory });
    window.location.href = `/api/products/export?${params.toString()}`;
  });

  // Delete Record
  window.deleteProduct = async (id) => {
    if (!confirm(`Confirm deletion of product #${id}?`)) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Product successfully removed');
        loadGlobalStats();
        loadProducts(currentPage);
      } else {
        showToast('Failed to delete product', true);
      }
    } catch (err) {
      showToast('Network error during deletion', true);
    }
  };

  // Edit Record
  window.editProduct = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`);
      const target = await res.json();
      const attrs = typeof target.attributes === 'string' ? JSON.parse(target.attributes) : (target.attributes || {});

      document.getElementById('form-id').value = id;
      document.getElementById('form-sku').value = target.sku || '';
      document.getElementById('form-name').value = target.name || '';
      document.getElementById('form-price').value = target.price || 0;
      document.getElementById('form-stock').value = target.stock_quantity || 1;
      document.getElementById('form-education').value = attrs.education || 'tertiary';
      document.getElementById('form-marital').value = attrs.marital || 'married';

      openModal(true);
    } catch (err) {
      showToast('Error loading record details: ' + err.message, true);
    }
  };

  // Save/Update Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('form-id').value;
    const isEdit = Boolean(id);

    const payload = {
      sku: document.getElementById('form-sku').value,
      name: document.getElementById('form-name').value,
      price: parseFloat(document.getElementById('form-price').value),
      stock_quantity: parseInt(document.getElementById('form-stock').value),
      attributes: {
        education: document.getElementById('form-education').value,
        marital: document.getElementById('form-marital').value,
        housing_loan: 'no',
        personal_loan: 'no',
        age: 30
      }
    };

    try {
      const response = await fetch(isEdit ? `${API_URL}/${id}` : API_URL, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        closeModal();
        showToast(isEdit ? 'Product updated successfully!' : 'New product created successfully!');
        loadGlobalStats();
        loadProducts(currentPage);
      } else {
        showToast('Error saving record', true);
      }
    } catch (err) {
      showToast('API error: ' + err.message, true);
    }
  });

  // Initial Load
  loadGlobalStats();
  loadProducts(1);
});