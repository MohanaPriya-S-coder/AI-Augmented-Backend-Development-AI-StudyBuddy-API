import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { generateStudyPlan, getStudyPlans } from '../api';

const field = { display: 'block', width: '100%', boxSizing: 'border-box', padding: 10, margin: '8px 0 16px', border: '1px solid #ccd1d8', borderRadius: 5 };
function StudyPlansPage() {
  const today = new Date(); const [form, setForm] = useState({ subject: '', examDate: '', availableHoursPerDay: 2, learningGoal: '' });
  const [plans, setPlans] = useState([]); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [loading, setLoading] = useState(true);
  async function refresh() { try { const data = await getStudyPlans(); setPlans(data.studyPlans || []); } catch (e) { setError(e.message); } finally { setLoading(false); } }
  useEffect(() => { refresh(); }, []);
  async function submit(e) { e.preventDefault(); setBusy(true); setError(''); try { const data = await generateStudyPlan({ ...form, availableHoursPerDay: Number(form.availableHoursPerDay) }); setPlans(current => [data.studyPlan, ...current]); } catch (e) { setError(e.message); } finally { setBusy(false); } }
  return <div style={{ minHeight: '100vh', background: '#f5f7fa' }}><Navbar/><main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}><h1>Personalized Study Plans</h1>{error && <p role="alert" style={{ color: '#b42318' }}>{error}</p>}
    <form onSubmit={submit} style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 8px #0001' }}><h2>Create a study plan</h2>
      <label>Subject<input style={field} value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required /></label>
      <label>Exam date<input style={field} type="date" min={today.toISOString().slice(0, 10)} value={form.examDate} onChange={e => setForm({ ...form, examDate: e.target.value })} required /></label>
      <label>Available hours per day<input style={field} type="number" min="1" max="24" value={form.availableHoursPerDay} onChange={e => setForm({ ...form, availableHoursPerDay: e.target.value })} /></label>
      <label>Learning goal<textarea style={{ ...field, minHeight: 80 }} value={form.learningGoal} onChange={e => setForm({ ...form, learningGoal: e.target.value })} placeholder="What do you want to achieve?" /></label>
      <button disabled={busy}>{busy ? 'Generating plan…' : 'Generate study plan'}</button>
    </form>
    <h2>Your plans</h2>{loading ? <p>Loading…</p> : !plans.length ? <p>Your generated plans will appear here.</p> : plans.map(plan => <article key={plan._id} style={{ background: '#fff', padding: 20, margin: '16px 0', borderRadius: 8, boxShadow: '0 2px 8px #0001' }}><h3>{plan.subject}</h3><p>Exam date: {plan.examDate ? new Date(plan.examDate).toLocaleDateString() : '—'} · {plan.availableHoursPerDay || 2} hours per day</p>{plan.learningGoal && <p>Goal: {plan.learningGoal}</p>}<div style={{ whiteSpace: 'pre-wrap' }}>{plan.studyPlan}</div></article>)}</main></div>;
}
export default StudyPlansPage;
