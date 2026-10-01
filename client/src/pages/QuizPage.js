import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getAllQuizzes } from '../api';

function QuizPage() {
  const [quizzes, setQuizzes] = useState([]); const [answers, setAnswers] = useState({}); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  useEffect(() => { getAllQuizzes().then(data => setQuizzes(data.quizzes || [])).catch(e => setError(e.message)).finally(() => setLoading(false)); }, []);
  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <Navbar />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
        <h1>Quizzes</h1>
        <p>Answer each question to check your understanding.</p>
        {error && <p role="alert">{error}</p>}
        {loading ? <p>Loading…</p> : quizzes.length === 0 ? (
          <p>No quizzes yet. Generate one from a <Link to="/materials">study material</Link>.</p>
        ) : quizzes.map(quiz => (
          <section key={quiz._id} style={{ background: '#fff', padding: 20, margin: '16px 0', borderRadius: 8, boxShadow: '0 2px 8px #0001' }}>
            <h2>{quiz.materialId?.title || 'Study quiz'}</h2>
            <p>{quiz.materialId?.subject}</p>
            {quiz.questions.map((q, i) => {
              const key = `${quiz._id}-${i}`;
              return (
                <fieldset key={key} style={{ margin: '16px 0' }}>
                  <legend>{i + 1}. {q.question}</legend>
                  {q.options.map(option => (
                    <label key={option} style={{ display: 'block', padding: 4 }}>
                      <input type="radio" name={key} value={option} checked={answers[key] === option} onChange={() => setAnswers({ ...answers, [key]: option })} /> {option}
                    </label>
                  ))}
                  {answers[key] && <p>{answers[key] === q.correctAnswer ? 'Correct' : `Correct answer: ${q.correctAnswer}`}</p>}
                </fieldset>
              );
            })}
            {quiz.materialId?._id && <Link to={`/materials/${quiz.materialId._id}`}>Open material and regenerate quiz</Link>}
          </section>
        ))}
      </main>
    </div>
  );
}
export default QuizPage;
