import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = ['pending', 'in-progress', 'completed'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high'];

function StatusBadge({ status }) {
  const map = {
    pending: 'badge-pending',
    'in-progress': 'badge-in-progress',
    completed: 'badge-completed',
  };
  return <span className={`badge ${map[status] || 'badge-pending'}`}>{status.replace('-', ' ')}</span>;
}

function PriorityBadge({ priority }) {
  const map = { low: 'badge-low', medium: 'badge-medium', high: 'badge-high' };
  return <span className={`badge ${map[priority] || 'badge-medium'}`}>{priority}</span>;
}

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const defaultForm = { title: '', description: '', project: '', assignedTo: '', dueDate: '', priority: 'medium', status: 'pending' };
  const [formData, setFormData] = useState(defaultForm);

  const fetchData = useCallback(async () => {
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterProject) params.projectId = filterProject;

      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        api.get('/tasks', { params }),
        api.get('/projects'),
        api.get('/users'),
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterProject]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditingTask(null);
    setFormData(defaultForm);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      project: task.project?._id || '',
      assignedTo: task.assignedTo?._id || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      priority: task.priority || 'medium',
      status: task.status,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return setFormError('Task title is required');
    if (!formData.project) return setFormError('Please select a project');
    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        project: formData.project,
        assignedTo: formData.assignedTo || null,
        dueDate: formData.dueDate || null,
        priority: formData.priority,
        status: formData.status,
      };

      if (editingTask) {
        const { data } = await api.put(`/tasks/${editingTask._id}`, payload);
        setTasks(tasks.map((t) => (t._id === editingTask._id ? data : t)));
      } else {
        const { data } = await api.post('/tasks', payload);
        setTasks([data, ...tasks]);
      }
      setShowModal(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const { data } = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map((t) => (t._id === taskId ? data : t)));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t._id !== taskId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const isOverdue = (task) =>
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  if (loading) {
    return (
      <div className="loading-page">
        <span className="loading-spinner" style={{ borderColor: 'rgba(99,102,241,0.3)', borderTopColor: '#6366f1' }}></span>
        Loading tasks...
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? 's' : ''} found</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} disabled={projects.length === 0}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth="2" strokeLinecap="round" d="M12 5v14M5 12h14"/>
          </svg>
          New Task
        </button>
      </div>

      {projects.length === 0 && (
        <div className="alert alert-error" style={{ marginBottom: 24 }}>
          You need to create a project before adding tasks. Go to the Projects page first.
        </div>
      )}

      {/* Filters */}
      <div className="filter-bar">
        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>

        {(filterStatus || filterProject) && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => { setFilterStatus(''); setFilterProject(''); }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <h3>No tasks found</h3>
          <p>{filterStatus || filterProject ? 'Try clearing your filters' : 'Create your first task to get started'}</p>
          {!filterStatus && !filterProject && (
            <button className="btn btn-primary" onClick={openCreate} disabled={projects.length === 0}>
              Create Task
            </button>
          )}
        </div>
      ) : (
        <div className="tasks-list">
          {tasks.map((task) => (
            <div className="task-card" key={task._id} style={{ borderLeft: isOverdue(task) ? '3px solid var(--danger)' : '3px solid transparent' }}>
              <div className="task-card-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div className="task-title" style={{ margin: 0 }}>{task.title}</div>
                  {isOverdue(task) && (
                    <span style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 600, background: 'var(--danger-light)', padding: '2px 8px', borderRadius: 100 }}>
                      OVERDUE
                    </span>
                  )}
                </div>
                {task.description && (
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>{task.description}</p>
                )}
                <div className="task-meta">
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                  {task.project && <span>📁 {task.project.name}</span>}
                  {task.assignedTo && <span>👤 {task.assignedTo.name}</span>}
                  {task.dueDate && (
                    <span style={{ color: isOverdue(task) ? 'var(--danger)' : 'var(--text-muted)' }}>
                      📅 {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="task-actions">
                {/* Quick status change */}
                <select
                  className="filter-select"
                  value={task.status}
                  onChange={(e) => handleStatusChange(task._id, e.target.value)}
                  style={{ fontSize: 12 }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                  ))}
                </select>

                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(task)} title="Edit task">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" strokeLinecap="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>

                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task._id)} title="Delete task">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" strokeLinecap="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            {formError && <div className="alert alert-error">{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Design landing page"
                  value={formData.title}
                  onChange={(e) => { setFormData({ ...formData, title: e.target.value }); setFormError(''); }}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  placeholder="Task details..."
                  rows={2}
                  style={{ resize: 'vertical' }}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Project *</label>
                  <select
                    className="form-control"
                    value={formData.project}
                    onChange={(e) => { setFormData({ ...formData, project: e.target.value }); setFormError(''); }}
                    required
                  >
                    <option value="">Select project</option>
                    {projects.map((p) => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Assign To</label>
                  <select
                    className="form-control"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-control"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-control"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <><span className="loading-spinner"></span> Saving...</> : editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
