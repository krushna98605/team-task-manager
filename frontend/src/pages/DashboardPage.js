import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const statCards = [
  {
    key: 'total',
    label: 'Total Tasks',
    icon: '📋',
    bg: 'rgba(99,102,241,0.12)',
    color: '#6366f1',
  },
  {
    key: 'completed',
    label: 'Completed',
    icon: '✅',
    bg: 'rgba(16,185,129,0.12)',
    color: '#10b981',
  },
  {
    key: 'inProgress',
    label: 'In Progress',
    icon: '🔄',
    bg: 'rgba(245,158,11,0.12)',
    color: '#f59e0b',
  },
  {
    key: 'pending',
    label: 'Pending',
    icon: '⏳',
    bg: 'rgba(100,116,139,0.12)',
    color: '#64748b',
  },
  {
    key: 'overdue',
    label: 'Overdue',
    icon: '🔴',
    bg: 'rgba(239,68,68,0.12)',
    color: '#ef4444',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, tasksRes, projectsRes] = await Promise.all([
        api.get('/tasks/stats'),
        api.get('/tasks'),
        api.get('/projects'),
      ]);
      setStats(statsRes.data);
      setRecentTasks(tasksRes.data.slice(0, 5));
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = { pending: 'badge-pending', 'in-progress': 'badge-in-progress', completed: 'badge-completed' };
    return `badge ${map[status] || 'badge-pending'}`;
  };

  if (loading) {
    return (
      <div className="loading-page">
        <span className="loading-spinner" style={{ borderColor: 'rgba(99,102,241,0.3)', borderTopColor: '#6366f1' }}></span>
        Loading dashboard...
      </div>
    );
  }

  const progressPct = stats?.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Good day, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's what's happening with your projects</p>
        </div>
        <Link to="/tasks" className="btn btn-primary">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth="2" strokeLinecap="round" d="M12 5v14M5 12h14"/>
          </svg>
          New Task
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {statCards.map((card) => (
          <div className="stat-card" key={card.key}>
            <div className="stat-icon" style={{ background: card.bg }}>
              <span>{card.icon}</span>
            </div>
            <div className="stat-info">
              <h3 style={{ color: card.color }}>{stats?.[card.key] ?? 0}</h3>
              <p>{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress + Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
            Overall Progress
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 1, background: 'var(--bg-primary)', borderRadius: 100, height: 10, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${progressPct}%`,
                background: 'linear-gradient(90deg, #6366f1, #10b981)',
                borderRadius: 100,
                transition: 'width 0.6s ease',
              }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', minWidth: 40 }}>{progressPct}%</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {stats?.completed} of {stats?.total} tasks completed
          </p>
        </div>

        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
            Projects Overview
          </h3>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#6366f1', fontFamily: 'var(--font-display)' }}>
            {projects.length}
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Active projects</p>
          <Link to="/projects" style={{ fontSize: 13, color: '#6366f1', textDecoration: 'none', fontWeight: 600, marginTop: 12, display: 'inline-block' }}>
            View all →
          </Link>
        </div>
      </div>

      {/* Recent Tasks */}
      <div>
        <div className="page-header" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)' }}>Recent Tasks</h2>
          <Link to="/tasks" style={{ fontSize: 13, color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>
            View all →
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h3>No tasks yet</h3>
            <p>Create your first task to get started</p>
            <Link to="/tasks" className="btn btn-primary">Create Task</Link>
          </div>
        ) : (
          <div className="tasks-list">
            {recentTasks.map((task) => (
              <div className="task-card" key={task._id}>
                <div className="task-card-content">
                  <div className="task-title">{task.title}</div>
                  <div className="task-meta">
                    <span className={getStatusBadge(task.status)}>{task.status.replace('-', ' ')}</span>
                    {task.project && <span>📁 {task.project.name}</span>}
                    {task.assignedTo && <span>👤 {task.assignedTo.name}</span>}
                    {task.dueDate && (
                      <span style={{ color: new Date(task.dueDate) < new Date() && task.status !== 'completed' ? 'var(--danger)' : 'var(--text-muted)' }}>
                        📅 {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
