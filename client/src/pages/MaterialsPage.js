import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { createMaterial, deleteMaterial, getMaterials, updateMaterial } from '../api';

const box = { background: '#fff', padding: 20, borderRadius: 8, marginBottom: 16, boxShadow: '0 2px 8px #0001' };
const input = { display: 'block', width: '100%', boxSizing: 'border-box', padding: 10, margin: '8px 0', border: '1px solid #ccd1d8', borderRadius: 5 };

function MaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [form, setForm] = useState({ title: '', subject: '', content: '' });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function refresh() {
    setLoading(true);
    try { const result = await getMaterials(); setMaterials(result.materials || []); setError(''); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);
  function edit(item) { setEditing(item._id); setForm({ title: item.title, subject: item.subject, content: item.content }); window.scrollTo(0, 0); }
  function reset() { setEditing(null); setForm({ title: '', subject: '', content: '' }); }
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      if (editing) await updateMaterial(editing, form); else await createMaterial(form);
      reset(); await refresh();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function remove(id) {
    if (!window.confirm('Delete this study material?')) return;
    try { await deleteMaterial(id); await refresh(); } catch (e) { setError(e.message); }
  }
  return <div style={{ minHeight: '100vh', background: '#f5f7fa' }}><Navbar /><main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
    <h1>Study Materials</h1><p>Add notes and open a material to generate AI study resources.</p>
    {error && <p role="alert" style={{ color: '#b42318' }}>{error}</p>}
    <form onSubmit={submit} style={box}><h2>{editing ? 'Edit material' : 'Add material'}</h2>
      <input style={input} aria-label="Title" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
      <input style={input} aria-label="Subject" placeholder="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
      <textarea style={{ ...input, minHeight: 150 }} aria-label="Study material content" placeholder="Paste or type your study notes" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required />
      <button disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Create material'}</button>{editing && <> <button type="button" onClick={reset}>Cancel</button></>}
    </form>
    {loading ? <p>Loading materials…</p> : materials.length === 0 ? <div style={box}>No materials yet. Add your first study material above.</div> : materials.map(item => <article key={item._id} style={box}>
      <h2 style={{ marginTop: 0 }}><Link to={`/materials/${item._id}`}>{item.title}</Link></h2><p>{item.subject}</p><p>{(item.content || '').slice(0, 180)}{item.content?.length > 180 ? '…' : ''}</p>
      <Link to={`/materials/${item._id}`}>Open study resources</Link>{' · '}<button type="button" onClick={() => edit(item)}>Edit</button>{' '}<button type="button" onClick={() => remove(item._id)}>Delete</button>
    </article>)}
  </main></div>;
}
export default MaterialsPage;
