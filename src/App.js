import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import './App.css';

// ── EmailJS config ──────────────────────────────────────────────
// Replace these three values after setting up your EmailJS account
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';
// ────────────────────────────────────────────────────────────────

const LEAD_STORAGE_KEY = 'td_lead_submitted';

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Accessories', 'Footwear', 'Other'];

const SAMPLE_PRODUCTS = [
  {
    id: 1,
    name: 'Classic White Tee',
    category: 'Tops',
    price: 12.99,
    moq: 50,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    details: 'Premium 100% cotton basic tee. Available in sizes XS–3XL. Unisex cut. Perfect for everyday wear and easy to style with any outfit.',
  },
  {
    id: 2,
    name: 'High-Waist Denim Jeans',
    category: 'Bottoms',
    price: 34.50,
    moq: 30,
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop',
    details: 'Stretch denim with high-rise fit. 5-pocket style. Available in light wash, dark wash, and black. Sizes 24–38.',
  },
  {
    id: 3,
    name: 'Floral Midi Dress',
    category: 'Dresses',
    price: 28.00,
    moq: 20,
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop',
    details: 'Lightweight chiffon midi dress with floral print. Adjustable tie waist. V-neckline. Great for spring/summer collections.',
  },
];

const STORAGE_KEY = 'catalog_products';

function loadProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return SAMPLE_PRODUCTS;
}

function getNextId(products) {
  return products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
}

function LeadModal({ onClose }) {
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', telefono: '', tipo: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.nombre || !form.apellido || !form.email || !form.telefono || !form.tipo) {
      setError('Por favor completa todos los campos.');
      return;
    }
    setSending(true);
    setError('');
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          nombre:    form.nombre,
          apellido:  form.apellido,
          email:     form.email,
          telefono:  form.telefono,
          tipo:      form.tipo,
          to_email:  'totaldeals.ventas@gmail.com',
        },
        EMAILJS_PUBLIC_KEY
      );
      setSent(true);
      localStorage.setItem(LEAD_STORAGE_KEY, '1');
    } catch {
      setError('Error al enviar. Por favor intenta de nuevo.');
    }
    setSending(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal lead-modal">
        <div className="modal-header lead-header">
          <div>
            <img src="/logo.svg" alt="Total Deals" style={{ height: 44 }} />
          </div>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        {sent ? (
          <div className="lead-success">
            <div className="lead-success-icon">✅</div>
            <h3>¡Gracias por tu interés!</h3>
            <p>Nos pondremos en contacto contigo pronto.</p>
            <button className="btn-save" style={{ marginTop: 16 }} onClick={onClose}>Ver Catálogo</button>
          </div>
        ) : (
          <>
            <div className="lead-intro">
              <h2>¡Bienvenido a TD Liquidations!</h2>
              <p>Déjanos tus datos y un asesor te contactará.</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre *</label>
                    <input value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Tu nombre" />
                  </div>
                  <div className="form-group">
                    <label>Apellido *</label>
                    <input value={form.apellido} onChange={e => set('apellido', e.target.value)} placeholder="Tu apellido" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="tucorreo@email.com" />
                </div>
                <div className="form-group">
                  <label>Teléfono con Lada *</label>
                  <input value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="+52 55 1234 5678" />
                </div>
                <div className="form-group">
                  <label>¿Cuál es tu situación? *</label>
                  <div className="lead-options">
                    <label className={`lead-option ${form.tipo === 'negocio' ? 'selected' : ''}`}>
                      <input type="radio" name="tipo" value="negocio" checked={form.tipo === 'negocio'} onChange={() => set('tipo', 'negocio')} />
                      <span className="option-icon">🏪</span>
                      <span>Ya tengo un Negocio</span>
                    </label>
                    <label className={`lead-option ${form.tipo === 'empezando' ? 'selected' : ''}`}>
                      <input type="radio" name="tipo" value="empezando" checked={form.tipo === 'empezando'} onChange={() => set('tipo', 'empezando')} />
                      <span className="option-icon">🚀</span>
                      <span>Estoy empezando</span>
                    </label>
                  </div>
                </div>
                {error && <div className="lead-error">{error}</div>}
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={onClose}>Omitir por ahora</button>
                <button type="submit" className="btn-save" disabled={sending}>
                  {sending ? 'Enviando...' : 'Enviar información'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const ADMIN_PASSWORD = 'totaldeals2024';

function AdminLoginModal({ onLogin, onClose }) {
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if (pwd === ADMIN_PASSWORD) { onLogin(); }
    else { setError('Contraseña incorrecta.'); setPwd(''); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 360 }}>
        <div className="modal-header">
          <h2>Acceso Administrador</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form">
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="Ingresa la contraseña" autoFocus />
            </div>
            {error && <div className="lead-error">{error}</div>}
          </div>
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-save">Entrar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProductForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(
    initial || { name: '', category: 'Tops', price: '', moq: '', image: '', details: '', videoUrl: '' }
  );
  const [dragging, setDragging] = useState(false);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const readFile = file => {
    if (!file || !file.type.startsWith('image/')) return alert('Please select an image file.');
    const reader = new FileReader();
    reader.onload = e => set('image', e.target.result);
    reader.readAsDataURL(file);
  };

  const handleFileInput = e => readFile(e.target.files[0]);

  const handleDrop = e => {
    e.preventDefault();
    setDragging(false);
    readFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name.trim()) return alert('Product name is required.');
    if (!form.price || isNaN(form.price)) return alert('Enter a valid price.');
    if (!form.moq || isNaN(form.moq)) return alert('Enter a valid MOQ.');
    onSave({ ...form, price: parseFloat(form.price), moq: parseInt(form.moq) });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form">
        <div className="form-group">
          <label>Product Name *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Classic White Tee" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Price (USD) *</label>
            <input type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" />
          </div>
        </div>
        <div className="form-group">
          <label>MOQ (Minimum Order Quantity) *</label>
          <input type="number" min="1" value={form.moq} onChange={e => set('moq', e.target.value)} placeholder="e.g. 50" />
        </div>
        <div className="form-group">
          <label>Product Image</label>
          <div
            className={`upload-zone ${dragging ? 'dragging' : ''} ${form.image ? 'has-image' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
          >
            {form.image ? (
              <>
                <img src={form.image} alt="preview" />
                <div className="upload-overlay">
                  <span>Click or drop to replace</span>
                </div>
              </>
            ) : (
              <div className="upload-placeholder">
                <span className="upload-icon">📷</span>
                <span className="upload-text">Click to upload or drag & drop</span>
                <span className="upload-hint">JPG, PNG, WEBP supported</span>
              </div>
            )}
          </div>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileInput}
          />
          {form.image && (
            <button type="button" className="btn-remove-image" onClick={() => set('image', '')}>
              Remove image
            </button>
          )}
        </div>
        <div className="form-group">
          <label>Video de YouTube (URL)</label>
          <input value={form.videoUrl} onChange={e => set('videoUrl', e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
        </div>
        <div className="form-group">
          <label>Details / Description</label>
          <textarea value={form.details} onChange={e => set('details', e.target.value)} placeholder="Materials, sizes, colors, special features..." rows={4} />
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-save">{initial ? 'Save Changes' : 'Add Product'}</button>
      </div>
    </form>
  );
}

function ProductDetail({ product, onClose, onEdit }) {
  return (
    <>
      <div className="detail-image">
        {product.image ? <img src={product.image} alt={product.name} /> : '👕'}
      </div>
      <div className="detail-body">
        <div>
          <div className="detail-category">{product.category}</div>
          <div className="detail-name">{product.name}</div>
        </div>
        <div className="detail-stats">
          <div className="stat">
            <span className="stat-label">Price</span>
            <span className="stat-value price">${Number(product.price).toFixed(2)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">MOQ</span>
            <span className="stat-value moq">{product.moq} units</span>
          </div>
        </div>
        {product.details && (
          <>
            <hr className="detail-divider" />
            <div className="detail-section-title">Details</div>
            <div className="detail-description">{product.details}</div>
          </>
        )}
        {product.videoUrl && (
          <>
            <hr className="detail-divider" />
            <a
              href={product.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ver-mas"
            >
              ▶ VER MAS
            </a>
          </>
        )}
      </div>
      <div className="form-actions">
        <button className="btn-cancel" onClick={onClose}>Cerrar</button>
        {onEdit && <button className="btn-save" onClick={onEdit}>Editar</button>}
      </div>
    </>
  );
}

export default function App() {
  const [products, setProducts] = useState(loadProducts);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [modal, setModal] = useState(null);
  const [showLead, setShowLead] = useState(!localStorage.getItem(LEAD_STORAGE_KEY));
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  const filtered = products.filter(p => {
    const matchCat = category === 'All' || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAdd = data => {
    setProducts(ps => [...ps, { ...data, id: getNextId(ps) }]);
    setModal(null);
  };

  const handleEdit = data => {
    setProducts(ps => ps.map(p => p.id === data.id ? data : p));
    setModal(null);
  };

  const handleDelete = id => {
    if (window.confirm('Delete this product?')) {
      setProducts(ps => ps.filter(p => p.id !== id));
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-logo">
          <img src="/logo.svg" alt="Total Deals" className="logo-img" />
          <span className="header-title">CATÁLOGO TD LIQUIDATIONS</span>
        </div>
        <div className="header-actions">
          <span className="count-badge">{products.length} productos</span>
          {isAdmin ? (
            <>
              <button className="btn-add" onClick={() => setModal({ type: 'add' })}>+ Agregar</button>
              <button className="btn-admin-logout" onClick={() => setIsAdmin(false)}>🔓 Salir</button>
            </>
          ) : (
            <button className="btn-admin-login" onClick={() => setShowAdminLogin(true)}>🔐</button>
          )}
        </div>
      </header>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="filter-select" value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👗</div>
          <h3>No products found</h3>
          <p>Try a different search or add a new product.</p>
        </div>
      ) : (
        <div className="catalog-grid">
          {filtered.map(p => (
            <div className="product-card" key={p.id}>
              <div className="card-image" onClick={() => setModal({ type: 'view', product: p })}>
                {p.image ? <img src={p.image} alt={p.name} /> : '👕'}
              </div>
              <div className="card-body" onClick={() => setModal({ type: 'view', product: p })}>
                <div className="card-category">{p.category}</div>
                <div className="card-name">{p.name}</div>
                <div className="card-price">${Number(p.price).toFixed(2)}</div>
                <div className="card-moq">MOQ: <span>{p.moq} units</span></div>
              </div>
              <div className="card-footer">
                <button className="btn-view" onClick={() => setModal({ type: 'view', product: p })}>Ver Detalles</button>
                {isAdmin && <>
                  <button className="btn-edit" onClick={() => setModal({ type: 'edit', product: p })}>✏️</button>
                  <button className="btn-delete" onClick={() => handleDelete(p.id)}>🗑️</button>
                </>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showLead && <LeadModal onClose={() => setShowLead(false)} />}
      {showAdminLogin && (
        <AdminLoginModal
          onLogin={() => { setIsAdmin(true); setShowAdminLogin(false); }}
          onClose={() => setShowAdminLogin(false)}
        />
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            {modal.type === 'view' && (
              <>
                <div className="modal-header">
                  <h2>Product Details</h2>
                  <button className="btn-close" onClick={() => setModal(null)}>×</button>
                </div>
                <ProductDetail
                  product={modal.product}
                  onClose={() => setModal(null)}
                  onEdit={isAdmin ? () => setModal({ type: 'edit', product: modal.product }) : null}
                />
              </>
            )}
            {modal.type === 'add' && (
              <>
                <div className="modal-header">
                  <h2>Add New Product</h2>
                  <button className="btn-close" onClick={() => setModal(null)}>×</button>
                </div>
                <ProductForm onSave={handleAdd} onClose={() => setModal(null)} />
              </>
            )}
            {modal.type === 'edit' && (
              <>
                <div className="modal-header">
                  <h2>Edit Product</h2>
                  <button className="btn-close" onClick={() => setModal(null)}>×</button>
                </div>
                <ProductForm
                  initial={modal.product}
                  onSave={data => handleEdit({ ...modal.product, ...data })}
                  onClose={() => setModal(null)}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
