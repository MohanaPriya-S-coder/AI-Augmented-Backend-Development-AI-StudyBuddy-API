import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { generateSummary, generateFlashcards, generateQuiz, getSummary, getFlashcardsForMaterial, getQuizForMaterial, getMaterial } from '../api';

const panel = { background: '#fff', padding: 20, margin: '16px 0', borderRadius: 8, boxShadow: '0 2px 8px #0001' };
function MaterialDetailPage() {
  const { id } = useParams();
  const [material, setMaterial] = useState(null);
  const [summary, setSummary] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  async function load() {
    try {
      const m = await getMaterial(id); setMaterial(m.material);
      const [s, f, q] = await Promise.allSettled([getSummary(id), getFlashcardsForMaterial(id), getQuizForMaterial(id)]);
      setSummary(s.status === 'fulfilled' ? s.value.summary : null);
      setFlashcards(f.status === 'fulfilled' ? f.value.flashcards || [] : []);
      setQuiz(q.status === 'fulfilled' ? q.value.quiz : null);
    } catch (e) { setError(e.message); }
  }
  useEffect(() => { load(); }, [id]);
  async function generate(kind, fn) {
    setBusy(kind); setError('');
    try { const data = await fn(id); if (kind === 'summary') setSummary(data.summary); if (kind === 'flashcards') setFlashcards(data.flashcards || []); if (kind === 'quiz') { setQuiz(data.quiz); setAnswers({}); } }
    catch (e) { setError(e.message); }
    finally { setBusy(''); }
  }
  const action = (kind, fn) => <button disabled={!!busy} onClick={() => generate(kind, fn)}>{busy === kind ? 'Generating…' : `${kind === 'summary' ? 'Generate' : 'Generate new'} ${kind}`}</button>;
  return <div style={{ minHeight: '100vh', background: '#f5f7fa' }}><Navbar/><main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
    <p><Link to="/materials">← Materials</Link></p>{error && <p role="alert" style={{ color: '#b42318' }}>{error}</p>}
    {!material ? <p>Loading material…</p> : <><h1>{material.title}</h1><p>{material.subject}</p><section style={panel}><h2>Study content</h2><div style={{ whiteSpace: 'pre-wrap' }}>{material.content}</div></section>
      <section style={panel}><h2>AI Summary</h2>{action('summary', generateSummary)}{summary ? <p style={{ whiteSpace: 'pre-wrap' }}>{summary.summary}</p> : <p>No summary generated yet.</p>}</section>
      <section style={panel}><h2>Flashcards</h2>{action('flashcards', generateFlashcards)}{flashcards.length ? flashcards.map(card => <article key={card._id} style={{ borderTop: '1px solid #eee', padding: '12px 0' }}><strong>{card.question}</strong><p>{card.answer}</p></article>) : <p>No flashcards generated yet.</p>}</section>
      <section style={panel}><h2>Quiz</h2>{action('quiz', generateQuiz)}{quiz?.questions?.length ? <>{quiz.questions.map((q, i) => <fieldset key={i} style={{ margin: '16px 0' }}><legend>{i + 1}. {q.question}</legend>{q.options.map(option => <label key={option} style={{ display: 'block', padding: 4 }}><input type="radio" name={`question-${i}`} value={option} checked={answers[i] === option} onChange={() => setAnswers({ ...answers, [i]: option })}/> {option}</label>)}{answers[i] && <p>{answers[i] === q.correctAnswer ? 'Correct' : `Answer: ${q.correctAnswer}`}</p>}</fieldset>)}</> : <p>No quiz generated yet.</p>}</section>
    </>}
  </main></div>;
}
export default MaterialDetailPage;
