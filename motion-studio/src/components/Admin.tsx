import { useEffect, useState } from 'react';
import {
  apiBase, approveFeedback, checkAdminKey, createProduct, deleteFeedback,
  deleteProduct, fetchAllFeedback, fetchEnquiries, fetchProducts,
  updateProduct,
  type ApiEnquiry, type ApiFeedback, type ApiProduct, type ProductInput,
} from '../lib/api';

// Admin page — shown only when the URL has ?admin=1, and NOT
// linked in the main nav (only a small footer link). This is a
// management UI, not a security boundary: the backend checks
// the admin key on every request, and a wrong key gets 401
// no matter what this page does. The key lives in
// sessionStorage, so it disappears when the tab closes —
// never in localStorage, never in code, never in a URL.
// Without VITE_API_URL set, admin cannot work at all (there
// is no real database to manage, only the public sample
// fallback), so the page says that plainly instead of
// showing sample data as if it were real.
const KEY_STORAGE = 'shreeji-admin-key';
const MATERIALS = ['Crystal', 'Metal', 'Wood', 'Acrylic'];
const IMAGES = [
  '/trophies/crystal-globe-hd.jpg',
  '/trophies/championship-cup-hd.jpg',
  '/trophies/acrylic-star-hd.jpg',
  '/trophies/crystal-tower-hd.jpg',
  '/trophies/trophy-featured.jpg',
  '/trophies/championship-cup-real.jpg',
  '/trophies/championship-cup.svg',
  '/trophies/crystal-tower.svg',
  '/trophies/wooden-shield.svg',
  '/trophies/acrylic-star.svg',
  '/trophies/silver-salver.svg',
  '/trophies/crystal-globe.svg',
];
const EMPTY_PRODUCT: ProductInput = { name: '', material: 'Metal', category: 'Metal', badge: '', image_url: IMAGES[0] };

function replyLink(contact: string, productName: string): string | null {
  const digits = contact.replace(/[^0-9]/g, '');
  if (digits.length >= 10) {
    // NOTE: whatsappUrl() always chats with Shreeji's own number,
    // so it is the WRONG helper here — replying must open a chat
    // with the CUSTOMER's number, not with ourselves.
    const num = digits.length === 10 ? `91${digits}` : digits;
    const msg = `Hi, thanks for your enquiry${productName ? ` about ${productName}` : ''}. We would like to help — could you share a few more details?`;
    return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  }
  if (contact.includes('@')) return `mailto:${contact}?subject=${encodeURIComponent('Re: Your Shreeji Corporates enquiry')}`;
  return null;
}

export default function Admin() {
  const [key, setKey] = useState(() => sessionStorage.getItem(KEY_STORAGE) || '');
  const [authed, setAuthed] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState<'products' | 'reviews' | 'enquiries'>('reviews');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [reviews, setReviews] = useState<ApiFeedback[]>([]);
  const [enquiries, setEnquiries] = useState<ApiEnquiry[]>([]);
  const [editing, setEditing] = useState<{ id: number | null } & ProductInput>({ id: null, ...EMPTY_PRODUCT });

  const load = async (k: string) => {
    try {
      const [ps, rs, es] = await Promise.all([
        fetchProducts(),
        fetchAllFeedback(k),
        fetchEnquiries(k),
      ]);
      setProducts(ps || []);
      setReviews(rs);
      setEnquiries(es);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load admin data.');
    }
  };

  useEffect(() => {
    if (authed && key) load(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      await checkAdminKey(key.trim());
      sessionStorage.setItem(KEY_STORAGE, key.trim());
      setKey(key.trim());
      setAuthed(true);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed.');
    }
  };

  const logout = () => {
    sessionStorage.removeItem(KEY_STORAGE);
    setKey('');
    setAuthed(false);
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(''); setError('');
    try {
      if (editing.id === null) await createProduct(editing, key);
      else await updateProduct(editing.id, editing, key);
      setEditing({ id: null, ...EMPTY_PRODUCT });
      setNotice('Product saved.');
      await load(key);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save product.');
    }
  };

  const removeProduct = async (p: ApiProduct) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try { await deleteProduct(p.id, key); await load(key); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not delete product.'); }
  };

  const actReview = async (id: number, fn: (id: number, k: string) => Promise<unknown>, label: string) => {
    try { await fn(id, key); setNotice(`Review ${label}.`); await load(key); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not update review.'); }
  };

  if (!apiBase()) {
    return (
      <main className="section"><div className="wrap">
        <p className="label">Admin — Shreeji Corporates</p>
        <h2 className="display" style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}>Admin needs the backend.</h2>
        <p className="lead">
          The admin page manages the real database through the API, so it cannot work
          without it. Set <code>VITE_API_URL</code> to your API URL (locally
          http://localhost:8000), rebuild the frontend, and come back here.
          Showing sample catalogue data as if it were editable would be misleading,
          so this page shows nothing until the API is connected.
        </p>
        <p><a href={window.location.pathname}>← Back to the site</a></p>
      </div></main>
    );
  }

  if (!authed) {
    return (
      <main className="section"><div className="wrap">
        <p className="label">Admin — Shreeji Corporates</p>
        <h2 className="display" style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}>Admin login</h2>
        <p className="lead">Enter the admin key from the backend&apos;s <code>ADMIN_KEY</code>. It is checked by the backend on every request — this page alone never grants access.</p>
        <form className="admin-form" onSubmit={login}>
          <label>
            Admin key
            <input type="password" value={key} onChange={(e) => setKey(e.target.value)} required autoComplete="off" placeholder="Admin key" />
          </label>
          <button type="submit" className="btn btn-primary">Enter admin</button>
          {loginError && <p className="review-form-msg err">{loginError}</p>}
        </form>
        <p><a href={window.location.pathname}>← Back to the site</a></p>
      </div></main>
    );
  }

  const pending = reviews.filter((r) => !r.approved);
  const approved = reviews.filter((r) => r.approved);

  return (
    <main className="section"><div className="wrap">
      <div className="admin-head">
        <div>
          <p className="label">Admin — Shreeji Corporates</p>
          <h2 className="display" style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}>Manage the site</h2>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn btn-ghost" onClick={() => load(key)}>Refresh</button>
          <button type="button" className="btn btn-ghost" onClick={logout}>Log out</button>
          <a className="btn btn-ghost" href={window.location.pathname}>Back to site</a>
        </div>
      </div>
      {error && <p className="review-form-msg err">{error}</p>}
      {notice && <p className="review-form-msg ok">{notice}</p>}
      <div className="trophy-filters">
        {(['reviews', 'products', 'enquiries'] as const).map((t) => (
          <button key={t} type="button" className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
            {t === 'reviews' ? `Reviews (${pending.length} pending)` : t === 'products' ? `Products (${products.length})` : `Enquiries (${enquiries.length})`}
          </button>
        ))}
      </div>

      {tab === 'reviews' && (
        <div>
          <h3>Pending approval ({pending.length})</h3>
          {pending.length === 0 && <p className="lead">No pending reviews. New submissions from the review form will appear here.</p>}
          {pending.map((r) => (
            <article key={r.id} className="admin-row">
              <div>
                <strong>{r.name}</strong> · {r.role} · {r.sector} · {r.rating}★
                <p>&ldquo;{r.quote}&rdquo;</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-primary" onClick={() => actReview(r.id, approveFeedback, 'approved')}>Approve</button>
                <button type="button" className="btn btn-ghost" onClick={() => { if (window.confirm('Delete this review?')) actReview(r.id, deleteFeedback, 'deleted'); }}>Delete</button>
              </div>
            </article>
          ))}
          <h3 style={{ marginTop: 32 }}>Approved ({approved.length})</h3>
          {approved.map((r) => (
            <article key={r.id} className="admin-row">
              <div><strong>{r.name}</strong> · {r.sector} · {r.rating}★<p>&ldquo;{r.quote}&rdquo;</p></div>
              <button type="button" className="btn btn-ghost" onClick={() => { if (window.confirm('Delete this approved review?')) actReview(r.id, deleteFeedback, 'deleted'); }}>Delete</button>
            </article>
          ))}
        </div>
      )}

      {tab === 'products' && (
        <div>
          <form className="admin-form" onSubmit={saveProduct}>
            <h3>{editing.id === null ? 'Add product' : 'Edit product'}</h3>
            <p className="review-form-note">
              Photo note: pick an existing photo from the list. A brand-new photo first goes
              into <code>motion-studio/public/trophies/</code> via git, then it appears here
              by its path. There is no photo upload in v1 on purpose.
            </p>
            <div className="review-form-row">
              <label>Name *<input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required maxLength={120} /></label>
              <label>Badge (optional)<input value={editing.badge} onChange={(e) => setEditing({ ...editing, badge: e.target.value })} maxLength={60} placeholder="e.g. Bestseller, New" /></label>
            </div>
            <div className="review-form-row">
              <label>Material
                <select value={editing.material} onChange={(e) => setEditing({ ...editing, material: e.target.value, category: e.target.value })}>
                  {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </label>
              <label>Photo
                <select value={editing.image_url} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}>
                  {IMAGES.map((im) => <option key={im} value={im}>{im}</option>)}
                </select>
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary">{editing.id === null ? 'Add product' : 'Save changes'}</button>
              {editing.id !== null && <button type="button" className="btn btn-ghost" onClick={() => setEditing({ id: null, ...EMPTY_PRODUCT })}>Cancel edit</button>}
            </div>
          </form>
          <div style={{ marginTop: 24 }}>
            {products.map((p) => (
              <article key={p.id} className="admin-row">
                <div><strong>{p.name}</strong> · {p.material} · {p.badge || 'no badge'}<br /><span style={{ color: 'var(--muted)' }}>{p.image_url}</span></div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setEditing({ id: p.id, name: p.name, material: p.material, category: p.category, badge: p.badge, image_url: p.image_url })}>Edit</button>
                  <button type="button" className="btn btn-ghost" onClick={() => removeProduct(p)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {tab === 'enquiries' && (
        <div>
          <p className="lead">Newest first. Reply on WhatsApp if the contact is a phone number, or by email if it is an email address.</p>
          {enquiries.length === 0 && <p className="lead">No enquiries yet.</p>}
          {enquiries.map((en) => {
            const link = replyLink(en.contact, en.product_name);
            return (
              <article key={en.id} className="admin-row">
                <div>
                  <strong>{en.name || 'No name given'}</strong> · {en.contact} · {en.product_name || 'general enquiry'} · {en.source}
                  {en.created_at && <span style={{ color: 'var(--muted)' }}> · {new Date(en.created_at).toLocaleString()}</span>}
                  <p>{en.message}</p>
                </div>
                {link && <a className="btn btn-primary" href={link} target="_blank" rel="noreferrer">Reply</a>}
              </article>
            );
          })}
        </div>
      )}
    </div></main>
  );
}
