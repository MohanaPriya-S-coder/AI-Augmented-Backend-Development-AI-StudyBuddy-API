import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getMaterials, getAllFlashcards, getAllQuizzes, getStudyPlans } from '../api';

const styles = {
  page: { minHeight: '100vh', background: '#f5f7fa' },
  content: { maxWidth: '1000px', margin: '0 auto', padding: '32px 20px' },
  welcome: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: '6px',
  },
  role: {
    color: '#7f8c8d',
    fontSize: '14px',
    marginBottom: '32px',
    textTransform: 'capitalize',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: '16px',
    marginBottom: '36px',
  },
  statCard: {
    background: '#fff',
    borderRadius: '10px',
    padding: '24px 20px',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
    transition: 'transform 0.15s',
    cursor: 'default',
  },
  statNumber: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#4a90e2',
    display: 'block',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '13px',
    color: '#7f8c8d',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: '16px',
  },
  quickLinks: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '14px',
  },
  quickLink: {
    background: '#fff',
    borderRadius: '10px',
    padding: '20px',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
    color: '#2c3e50',
    textDecoration: 'none',
    display: 'block',
    fontWeight: '600',
    fontSize: '15px',
    transition: 'background 0.2s',
  },
  linkIcon: {
    fontSize: '28px',
    display: 'block',
    marginBottom: '8px',
  },
};

function DashboardPage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [stats, setStats] = useState({
    materials: 0, flashcards: 0, quizzes: 0, studyPlans: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [materials, flashcards, quizzes, plans] = await Promise.allSettled([
          getMaterials(),
          getAllFlashcards(),
          getAllQuizzes(),
          getStudyPlans(),
        ]);
        setStats({
          materials: materials.status === 'fulfilled' ? (Array.isArray(materials.value) ? materials.value.length : materials.value?.data?.length || 0) : 0,
          flashcards: flashcards.status === 'fulfilled' ? (Array.isArray(flashcards.value) ? flashcards.value.length : flashcards.value?.data?.length || 0) : 0,
          quizzes: quizzes.status === 'fulfilled' ? (Array.isArray(quizzes.value) ? quizzes.value.length : quizzes.value?.data?.length || 0) : 0,
          studyPlans: plans.status === 'fulfilled' ? (Array.isArray(plans.value) ? plans.value.length : plans.value?.data?.length || 0) : 0,
        });
      } catch (e) {
        console.error('Stats error:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statItems = [
    { label: 'Materials', value: stats.materials, color: '#4a90e2' },
    { label: 'Flashcard Sets', value: stats.flashcards, color: '#27ae60' },
    { label: 'Quizzes', value: stats.quizzes, color: '#e67e22' },
    { label: 'Study Plans', value: stats.studyPlans, color: '#9b59b6' },
  ];

  const quickLinks = [
    { to: '/materials', icon: '📄', label: 'My Materials' },
    { to: '/flashcards', icon: '🃏', label: 'Flashcards' },
    { to: '/quiz', icon: '❓', label: 'Take a Quiz' },
    { to: '/study-plans', icon: '📅', label: 'Study Plans' },
  ];

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.content}>
        <div style={styles.welcome}>
          Welcome back, {user.name || 'Student'}! 🎓
        </div>
        <div style={styles.role}>Role: {user.role || 'student'}</div>

        <div style={styles.statsGrid}>
          {statItems.map(item => (
            <div key={item.label} style={styles.statCard}>
              <span style={{ ...styles.statNumber, color: item.color }}>
                {loading ? '—' : item.value}
              </span>
              <span style={styles.statLabel}>{item.label}</span>
            </div>
          ))}
        </div>

        <div style={styles.sectionTitle}>Quick Access</div>
        <div style={styles.quickLinks}>
          {quickLinks.map(({ to, icon, label }) => (
            <Link key={to} to={to} style={styles.quickLink}>
              <span style={styles.linkIcon}>{icon}</span>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
