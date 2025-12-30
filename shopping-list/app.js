// Supabase Config
const SUPABASE_URL = 'https://ywbmnkleicpokpnwkija.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Ym1ua2xlaWNwb2twbndraWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNTY2MTQsImV4cCI6MjA3NzYzMjYxNH0.hjchuerJ7OsC8hvkdXzBf9pEuLm5-vbDXWaQV4s8lFc';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Default Categories
const DEFAULT_CATEGORIES = [
    { name: 'Lactate', icon: '🥛' },
    { name: 'Panificație', icon: '🍞' },
    { name: 'Fructe & Legume', icon: '🍎' },
    { name: 'Carne & Mezeluri', icon: '🥩' },
    { name: 'Conserve', icon: '🥫' },
    { name: 'Produse Congelate', icon: '🧊' },
    { name: 'Curățenie', icon: '🧹' },
    { name: 'Igienă Personală', icon: '🧴' },
    { name: 'Dulciuri', icon: '🍬' },
    { name: 'Băuturi', icon: '🥤' },
    { name: 'Altele', icon: '📦' }
];

// State
let currentList = null;
let categories = [];
let items = [];

// DOM Elements
const app = document.getElementById('app');
const toast = document.getElementById('toast');

// Initialize
async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        await loadList(code);
    } else {
        showCreateModal();
    }
}

// Show Toast
function showToast(message, duration = 3000) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
}

// Generate unique code
function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Show Create Modal
function showCreateModal() {
    app.innerHTML = `
<div class="modal-overlay">
  <div class="modal">
    <h2>🛒 Listă Nouă</h2>
    <p>Creează o listă de cumpărături pentru a începe</p>
    <form id="createListForm">
      <div class="form-group">
        <label for="listName">Numele listei</label>
        <input type="text" id="listName" placeholder="ex: Cumpărături weekend" required autofocus>
      </div>
      <button type="submit" class="create-btn">Creează Lista</button>
    </form>
  </div>
</div>
`;

    document.getElementById('createListForm').addEventListener('submit', handleCreateList);
}

// Handle Create List
async function handleCreateList(e) {
    e.preventDefault();
    const name = document.getElementById('listName').value.trim();
    if (!name) return;

    const code = generateCode();

    try {
        // Create list
        const { data: list, error } = await supabaseClient
            .from('shopping_lists')
            .insert({ name, code })
            .select()
            .single();

        if (error) throw error;

        // Create default categories
        const categoryData = DEFAULT_CATEGORIES.map(cat => ({
            list_id: list.id,
            name: cat.name
        }));

        const { error: catError } = await supabaseClient
            .from('categories')
            .insert(categoryData);

        if (catError) throw catError;

        // Update URL
        window.history.pushState({}, '', `?code=${code}`);

        // Load the list
        await loadList(code);

        showToast('Lista a fost creată! 🎉');
    } catch (err) {
        console.error('Error creating list:', err);
        showToast('Eroare la creare. Încearcă din nou.');
    }
}

// Load List
async function loadList(code) {
    app.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;

    try {
        // Get list
        const { data: list, error } = await supabaseClient
            .from('shopping_lists')
            .select('*')
            .eq('code', code)
            .single();

        if (error || !list) {
            showCreateModal();
            showToast('Lista nu a fost găsită');
            return;
        }

        currentList = list;

        // Get categories
        const { data: cats } = await supabaseClient
            .from('categories')
            .select('*')
            .eq('list_id', list.id)
            .order('created_at');

        categories = cats || [];

        // Get items
        const categoryIds = categories.map(c => c.id);
        if (categoryIds.length > 0) {
            const { data: itms } = await supabaseClient
                .from('items')
                .select('*')
                .in('category_id', categoryIds)
                .order('created_at');

            items = itms || [];
        } else {
            items = [];
        }

        render();
        setupRealtimeSubscription();
    } catch (err) {
        console.error('Error loading list:', err);
        showToast('Eroare la încărcare');
    }
}

// Setup Realtime
function setupRealtimeSubscription() {
    const categoryIds = categories.map(c => c.id);

    supabaseClient
        .channel('items-changes')
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'items' },
            async (payload) => {
                // Reload items
                if (categoryIds.length > 0) {
                    const { data } = await supabaseClient
                        .from('items')
                        .select('*')
                        .in('category_id', categoryIds)
                        .order('created_at');

                    items = data || [];
                    render();
                }
            }
        )
        .subscribe();
}

// Get category icon
function getCategoryIcon(name) {
    const cat = DEFAULT_CATEGORIES.find(c => c.name === name);
    return cat ? cat.icon : '📦';
}

// Render
function render() {
    const totalItems = items.length;
    const completedItems = items.filter(i => i.completed).length;

    // Group items by category
    const itemsByCategory = {};
    items.forEach(item => {
        if (!itemsByCategory[item.category_id]) {
            itemsByCategory[item.category_id] = [];
        }
        itemsByCategory[item.category_id].push(item);
    });

    // Categories with items
    const categoriesWithItems = categories.filter(cat => itemsByCategory[cat.id]?.length > 0);

    app.innerHTML = `
<header class="header">
  <h1>🛒 Lista de Cumpărături</h1>
  <div class="list-name">${currentList.name}</div>
  <button class="share-btn" id="shareBtn">
    <span>📋</span> Copiază Link
  </button>
</header>

<section class="add-form">
  <h2>➕ Adaugă articol</h2>
  <form id="addItemForm">
    <div class="form-row">
      <input type="text" id="itemText" placeholder="Ce trebuie să cumperi?" required>
    </div>
    <div class="form-row">
      <select id="itemCategory">
        ${categories.map(cat => `
          <option value="${cat.id}">${getCategoryIcon(cat.name)} ${cat.name}</option>
        `).join('')}
      </select>
      <button type="submit" class="add-btn">Adaugă</button>
    </div>
  </form>
</section>

${categoriesWithItems.length === 0 ? `
  <div class="empty-state">
    <div class="icon">🛍️</div>
    <h3>Lista este goală</h3>
    <p>Adaugă primul articol folosind formularul de mai sus</p>
  </div>
` : `
  <section class="categories">
    ${categoriesWithItems.map(cat => {
        const catItems = itemsByCategory[cat.id] || [];
        const completedCount = catItems.filter(i => i.completed).length;
        return `
        <div class="category" data-id="${cat.id}">
          <div class="category-header">
            <div class="category-title">
              <span class="category-icon">${getCategoryIcon(cat.name)}</span>
              <span>${cat.name}</span>
            </div>
            <span class="category-count">${completedCount}/${catItems.length}</span>
          </div>
          <div class="category-items">
            ${catItems.map(item => `
              <div class="item ${item.completed ? 'completed' : ''}" data-id="${item.id}">
                <div class="item-checkbox ${item.completed ? 'checked' : ''}" data-id="${item.id}"></div>
                <span class="item-text">${escapeHtml(item.text)}</span>
                <button class="item-delete" data-id="${item.id}" title="Șterge">🗑️</button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('')}
  </section>
`}

${totalItems > 0 ? `
  <div class="stats">
    <strong>${completedItems}</strong> din <strong>${totalItems}</strong> articole bifate
  </div>
` : ''}
`;

    // Event Listeners
    document.getElementById('shareBtn').addEventListener('click', handleShare);
    document.getElementById('addItemForm').addEventListener('submit', handleAddItem);

    document.querySelectorAll('.item-checkbox').forEach(cb => {
        cb.addEventListener('click', () => handleToggleItem(cb.dataset.id));
    });

    document.querySelectorAll('.item-delete').forEach(btn => {
        btn.addEventListener('click', () => handleDeleteItem(btn.dataset.id));
    });

    document.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', () => {
            header.parentElement.classList.toggle('collapsed');
        });
    });
}

// Handle Share
function handleShare() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        const btn = document.getElementById('shareBtn');
        btn.innerHTML = '<span>✅</span> Copiat!';
        btn.classList.add('copied');
        showToast('Link copiat în clipboard!');

        setTimeout(() => {
            btn.innerHTML = '<span>📋</span> Copiază Link';
            btn.classList.remove('copied');
        }, 2000);
    });
}

// Handle Add Item
async function handleAddItem(e) {
    e.preventDefault();
    const text = document.getElementById('itemText').value.trim();
    const categoryId = document.getElementById('itemCategory').value;

    if (!text) return;

    try {
        const { data, error } = await supabaseClient
            .from('items')
            .insert({ text, category_id: categoryId })
            .select()
            .single();

        if (error) throw error;

        items.push(data);
        document.getElementById('itemText').value = '';
        render();
        showToast('Articol adăugat! ✓');
    } catch (err) {
        console.error('Error adding item:', err);
        showToast('Eroare la adăugare');
    }
}

// Handle Toggle Item
async function handleToggleItem(id) {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const newCompleted = !item.completed;

    try {
        const { error } = await supabaseClient
            .from('items')
            .update({ completed: newCompleted })
            .eq('id', id);

        if (error) throw error;

        item.completed = newCompleted;
        render();
    } catch (err) {
        console.error('Error toggling item:', err);
        showToast('Eroare la actualizare');
    }
}

// Handle Delete Item
async function handleDeleteItem(id) {
    try {
        const { error } = await supabaseClient
            .from('items')
            .delete()
            .eq('id', id);

        if (error) throw error;

        items = items.filter(i => i.id !== id);
        render();
        showToast('Articol șters');
    } catch (err) {
        console.error('Error deleting item:', err);
        showToast('Eroare la ștergere');
    }
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Start
init();
