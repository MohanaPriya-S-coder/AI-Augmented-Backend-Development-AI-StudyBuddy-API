import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getAllFlashcards } from '../api';

function FlashcardsPage() {
  const [cards, setCards] = useState([]); const [shown, setShown] = useState({}); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  useEffect(() => { getAllFlashcards().then(data => setCards(data.flashcards || [])).catch(e => setError(e.message)).finally(() => setLoading(false)); }, []);
  return <div style={{ minHeight: '100vh', background: '#f5f7fa' }}><Navbar/><main style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}><h1>Flashcards</h1><p>Review your generated cards. Select a card to reveal its answer.</p>{error && <p role="alert">{error}</p>}{loading ? <p>Loading…</p> : !cards.length ? <p>No flashcards yet. Generate them from a <Link to="/materials">study material</Link>.</p> : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>{cards.map(card => <button key={card._id} onClick={() => setShown({ ...shown, [card._id]: !shown[card._id] })} style={{ textAlign: 'left', minHeight: 140, border: 0, borderRadius: 8, padding: 20, background: '#fff', boxShadow: '0 2px 8px #0001', cursor: 'pointer' }}><small>{card.materialId?.title || 'Study material'}{card.materialId?.subject ? ` · ${card.materialId.subject}` : ''}</small><p><strong>{shown[card._id] ? 'Answer' : 'Question'}</strong></p><div>{shown[card._id] ? card.answer : card.question}</div></button>)}</div>}</main></div>;
}
export default FlashcardsPage;
