import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import './App.css';

const EMAILJS_SERVICE_ID  = 'service_r4ky2a';
const EMAILJS_TEMPLATE_ID = 'template_tf7c2v4';
const EMAILJS_PUBLIC_KEY  = 'vjckp7pkqU64Ma_fv';

const LEAD_STORAGE_KEY = 'td_lead_submitted';
const STORAGE_KEY = 'catalog_products';
const ADMIN_PASSWORD = 'totaldeals2024';
const MAX_IMAGES = 5;

const CATEGORIES = ['Todos', 'Ropa Niños', 'Ropa Adultos', 'Calzado', 'Accesorios', 'Mercancía General'];

// Normalize old single-image products to images array
function normalizeProduct(p) {
  if (p.images && p.images.length > 0) return p;
  return { ...p, images: p.image ? [p.image] : [] };
}

const SAMPLE_PRODUCTS = [
  {
    id: 1,
    name: 'Camiseta Blanca Clásica',
    category: 'Ropa Adultos',
    price: 12.99,
    moq: 50,
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop'],
    details: 'Camiseta básica de algodón 100% premium. Disponible en tallas XS–3XL. Corte unisex. Perfecta para uso diario y fácil de combinar con cualquier outfit.',
  },
  {
    id: 2,
    name: 'Jeans Tiro Alto',
    category: 'Ropa Adultos',
    price: 34.50,
    moq: 30,
    images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop'],
    details: 'Mezclilla stretch con tiro alto. Estilo 5 bolsillos. Disponible en lavado claro, oscuro y negro. Tallas 24–38.',
  },
  {
    id: 3,
    name: 'Vestido Midi Floral',
    category: 'Ropa Adultos',
    price: 28.00,
    moq: 20,
    images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop'],
    details: 'Vestido midi de gasa ligera con estampado floral. Cintura ajustable con lazo. Escote en V. Ideal para colecciones primavera/verano.',
  },
];

function loadProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved).map(normalizeProduct);
  } catch {}
  return SAMPLE_PRODUCTS;
}

function getNextId(products) {
  return products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
}

// Small carousel used on both the card and the detail modal
function ImageCarousel({ images, alt, height, borderRadius }) {
  const [idx, setIdx] = useState(0);
  const imgs = images && images.length > 0 ? images : [];

  const prev = e => { e.stopPropagation(); setIdx(i => (i - 1 + imgs.length) % imgs.length); };
  const next = e => { e.stopPropagation(); setIdx(i => (i + 1) % imgs.length); };

  if (imgs.length === 0) {
    return (
      <div className="carousel-empty" style={{ height, borderRadius }}>👕</div>
    );
  }

  return (
    <div className="carousel" style={{ height, borderRadius }}>
      <img src={imgs[idx]} alt={`${alt} ${idx + 1}`} className="carousel-img" />
      {imgs.length > 1 && (
        <>
          <button className="carousel-btn carousel-prev" onClick={prev}>‹</button>
          <button className="carousel-btn carousel-next" onClick={next}>›</button>
          <div className="carousel-dots">
            {imgs.map((_, i) => (
              <span
                key={i}
                className={`carousel-dot ${i === idx ? 'active' : ''}`}
                onClick={e => { e.stopPropagation(); setIdx(i); }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
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
        { nombre: form.nombre, apellido: form.apellido, email: form.email, telefono: form.telefono, tipo: form.tipo, to_email: 'totaldeals.ventas@gmail.com' },
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
          <div><img src="/logo.svg" alt="Total Deals" style={{ height: 44 }} /></div>
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
  const initImages = initial ? (initial.images || (initial.image ? [initial.image] : [])) : [];
  const [form, setForm] = useState(
    initial
      ? { ...initial, images: initImages }
      : { name: '', category: 'Tops', price: '', moq: '', images: [], details: '', videoUrl: '' }
  );
  const [draggingIdx, setDraggingIdx] = useState(null);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const readFiles = files => {
    const remaining = MAX_IMAGES - form.images.length;
    const toRead = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, remaining);
    if (toRead.length === 0) {
      if (form.images.length >= MAX_IMAGES) alert(`Máximo ${MAX_IMAGES} imágenes por producto.`);
      else alert('Por favor selecciona archivos de imagen.');
      return;
    }
    toRead.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => setForm(f => ({ ...f, images: [...f.images, e.target.result] }));
      reader.readAsDataURL(file);
    });
  };

  const removeImage = idx => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  const handleDrop = e => {
    e.preventDefault();
    setDraggingIdx(null);
    readFiles(e.dataTransfer.files);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name.trim()) return alert('El nombre del producto es obligatorio.');
    if (!form.price || isNaN(form.price)) return alert('Ingresa un precio válido.');
    if (!form.moq || isNaN(form.moq)) return alert('Ingresa una cantidad mínima válida.');
    onSave({ ...form, price: parseFloat(form.price), moq: parseInt(form.moq) });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form">
        <div className="form-group">
          <label>Nombre del Producto *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ej. Camiseta Blanca Clásica" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Categoría</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.filter(c => c !== 'Todos').map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Precio (USD) *</label>
            <input type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" />
          </div>
        </div>
        <div className="form-group">
          <label>MOQ (Cantidad Mínima de Pedido) *</label>
          <input type="number" min="1" value={form.moq} onChange={e => set('moq', e.target.value)} placeholder="Ej. 50" />
        </div>

        <div className="form-group">
          <label>Imágenes del Producto ({form.images.length}/{MAX_IMAGES})</label>

          {/* Thumbnail strip */}
          {form.images.length > 0 && (
            <div className="img-strip">
              {form.images.map((src, i) => (
                <div key={i} className="img-thumb">
                  <img src={src} alt={`foto ${i + 1}`} />
                  <button type="button" className="img-thumb-remove" onClick={() => removeImage(i)}>×</button>
                </div>
              ))}
            </div>
          )}

          {/* Upload zone — hidden when max reached */}
          {form.images.length < MAX_IMAGES && (
            <>
              <div
                className={`upload-zone ${draggingIdx === 0 ? 'dragging' : ''}`}
                onDragOver={e => { e.preventDefault(); setDraggingIdx(0); }}
                onDragLeave={() => setDraggingIdx(null)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input-multi').click()}
              >
                <div className="upload-placeholder">
                  <span className="upload-icon">📷</span>
                  <span className="upload-text">Clic para subir o arrastra aquí</span>
                  <span className="upload-hint">
                    JPG, PNG, WEBP · Puedes subir hasta {MAX_IMAGES - form.images.length} imagen{MAX_IMAGES - form.images.length !== 1 ? 'es' : ''} más
                  </span>
                </div>
              </div>
              <input
                id="file-input-multi"
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={e => readFiles(e.target.files)}
              />
            </>
          )}
        </div>

        <div className="form-group">
          <label>Video de YouTube (URL)</label>
          <input value={form.videoUrl || ''} onChange={e => set('videoUrl', e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
        </div>
        <div className="form-group">
          <label>Detalles / Descripción</label>
          <textarea value={form.details} onChange={e => set('details', e.target.value)} placeholder="Materiales, tallas, colores, características especiales..." rows={4} />
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn-save">{initial ? 'Guardar Cambios' : 'Agregar Producto'}</button>
      </div>
    </form>
  );
}

function ProductDetail({ product, onClose, onEdit }) {
  return (
    <>
      <ImageCarousel images={product.images} alt={product.name} height={280} borderRadius="14px 14px 0 0" />
      <div className="detail-body">
        <div>
          <div className="detail-category">{product.category}</div>
          <div className="detail-name">{product.name}</div>
        </div>
        <div className="detail-stats">
          <div className="stat">
            <span className="stat-label">Precio</span>
            <span className="stat-value price">${Number(product.price).toFixed(2)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">MOQ</span>
            <span className="stat-value moq">{product.moq} unidades</span>
          </div>
        </div>
        {product.details && (
          <>
            <hr className="detail-divider" />
            <div className="detail-section-title">Detalles</div>
            <div className="detail-description">{product.details}</div>
          </>
        )}
        {product.videoUrl && (
          <>
            <hr className="detail-divider" />
            <a href={product.videoUrl} target="_blank" rel="noopener noreferrer" className="btn-ver-mas">
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
  const [category, setCategory] = useState('Todos');
  const [modal, setModal] = useState(null);
  const [showLead, setShowLead] = useState(!localStorage.getItem(LEAD_STORAGE_KEY));
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  const filtered = products.filter(p => {
    const matchCat = category === 'Todos' || p.category === category;
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
    if (window.confirm('¿Eliminar este producto?')) {
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
        <div className="header-contact">
          <a href="https://wa.me/15628337556" target="_blank" rel="noopener noreferrer" className="whatsapp-link">
            <svg className="whatsapp-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.862L.054 23.5a.5.5 0 0 0 .609.61l5.802-1.522A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.68-.524-5.198-1.433l-.374-.222-3.878 1.017 1.034-3.77-.245-.389A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            <span className="contact-label">Informes:</span>
            <span className="contact-phones">
              +1 (562) 833-7556<br/>+1 (661) 310-8631
            </span>
          </a>
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
          placeholder="Buscar productos..."
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
          <h3>No se encontraron productos</h3>
          <p>Intenta una búsqueda diferente o agrega un nuevo producto.</p>
        </div>
      ) : (
        <div className="catalog-grid">
          {filtered.map(p => (
            <div className="product-card" key={p.id}>
              <div onClick={() => setModal({ type: 'view', product: p })}>
                <ImageCarousel images={p.images} alt={p.name} height={220} borderRadius="12px 12px 0 0" />
              </div>
              <div className="card-body" onClick={() => setModal({ type: 'view', product: p })}>
                <div className="card-category">{p.category}</div>
                <div className="card-name">{p.name}</div>
                <div className="card-price">${Number(p.price).toFixed(2)}</div>
                <div className="card-moq">MOQ: <span>{p.moq} unidades</span></div>
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
                  <h2>Detalles del Producto</h2>
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
                  <h2>Agregar Nuevo Producto</h2>
                  <button className="btn-close" onClick={() => setModal(null)}>×</button>
                </div>
                <ProductForm onSave={handleAdd} onClose={() => setModal(null)} />
              </>
            )}
            {modal.type === 'edit' && (
              <>
                <div className="modal-header">
                  <h2>Editar Producto</h2>
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
