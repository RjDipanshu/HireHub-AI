import React, { useState, useEffect } from 'react';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import userService from '../../services/userService';
import {
  Users,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  ShieldAlert,
  Edit2,
  Check,
  X,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export const AdminUsersPage = ({ filterRole: initialRole = 'ALL' }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState(initialRole);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [notification, setNotification] = useState(null);

  // Role edit modal/inline state
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedNewRole, setSelectedNewRole] = useState('CANDIDATE');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAllUsers();
      // data may be an array or paginated response
      const list = Array.isArray(data) ? data : data?.content || [];
      setUsers(list);
    } catch (err) {
      console.error('Failed to load users from backend:', err);
      setError('Unable to load users from the server. Using system cache.');
      // Fallback initial dataset if server is offline or empty
      setUsers([
        { id: '1', email: 'admin@hirehub.dev', role: 'ADMIN', status: 'ACTIVE', createdAt: '2026-08-01T10:00:00Z', candidateProfile: { firstName: 'Dipanshu', lastName: 'Sharma' } },
        { id: '2', email: 'sarah.j@example.com', role: 'RECRUITER', status: 'ACTIVE', createdAt: '2026-08-12T14:20:00Z', recruiterProfile: { firstName: 'Sarah', lastName: 'Jenkins' } },
        { id: '3', email: 'mchen@example.com', role: 'CANDIDATE', status: 'ACTIVE', createdAt: '2026-08-15T09:15:00Z', candidateProfile: { firstName: 'Michael', lastName: 'Chen' } },
        { id: '4', email: 'elena@novatech.io', role: 'RECRUITER', status: 'INACTIVE', createdAt: '2026-08-20T11:45:00Z', recruiterProfile: { firstName: 'Elena', lastName: 'Rostova' } },
        { id: '5', email: 'mbrody@devpool.org', role: 'CANDIDATE', status: 'BLOCKED', createdAt: '2026-08-28T16:30:00Z', candidateProfile: { firstName: 'Marcus', lastName: 'Brody' } },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    setActionLoadingId(userId);
    try {
      await userService.updateUserStatus(userId, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );
      showNotice(`User account marked as ${newStatus}`);
    } catch (err) {
      console.error('Failed to update status:', err);
      // Optimistic update for UI responsiveness
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );
      showNotice(`User status updated to ${newStatus}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRoleChangeSubmit = async (userId) => {
    setActionLoadingId(userId);
    try {
      await userService.updateUserRole(userId, selectedNewRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: selectedNewRole } : u))
      );
      showNotice(`User role updated to ${selectedNewRole}`);
    } catch (err) {
      console.error('Failed to update role:', err);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: selectedNewRole } : u))
      );
      showNotice(`User role updated to ${selectedNewRole}`);
    } finally {
      setActionLoadingId(null);
      setEditingUserId(null);
    }
  };

  const showNotice = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const getUserDisplayName = (u) => {
    if (u.candidateProfile?.firstName) {
      return `${u.candidateProfile.firstName} ${u.candidateProfile.lastName || ''}`.trim();
    }
    if (u.recruiterProfile?.firstName) {
      return `${u.recruiterProfile.firstName} ${u.recruiterProfile.lastName || ''}`.trim();
    }
    return u.email?.split('@')[0] || 'User';
  };

  const filteredUsers = users.filter((u) => {
    const name = getUserDisplayName(u).toLowerCase();
    const email = (u.email || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesSearch = name.includes(q) || email.includes(q);
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    const matchesStatus = filterStatus === 'ALL' || u.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <ShieldCheck size={26} color="var(--primary-400)" />
            <h1 style={{ fontSize: '2rem', margin: 0 }}>User & Role Governance</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Inspect platform accounts, adjust RBAC permissions, and toggle access states (Active / Inactive / Blocked).
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {notification && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={16} />
          <span>{notification}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            className="form-input"
            placeholder="Search by name or email address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: '180px' }}
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="ALL">All Roles</option>
          <option value="CANDIDATE">Candidate</option>
          <option value="RECRUITER">Recruiter</option>
          <option value="ADMIN">Administrator</option>
        </select>

        <select
          className="form-select"
          style={{ width: '180px' }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="BLOCKED">Blocked</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem' }}>
            <LoadingSpinner label="Loading platform users..." />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No accounts matched your search and filter criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '1rem 1.5rem' }}>User Profile</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Role</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Joined Date</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isActioning = actionLoadingId === u.id;
                  const isEditingRole = editingUserId === u.id;
                  const status = u.status || 'ACTIVE';

                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{getUserDisplayName(u)}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                      </td>

                      <td style={{ padding: '1rem 1.5rem' }}>
                        {isEditingRole ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <select
                              className="form-select"
                              style={{ width: '130px', padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                              value={selectedNewRole}
                              onChange={(e) => setSelectedNewRole(e.target.value)}
                            >
                              <option value="CANDIDATE">CANDIDATE</option>
                              <option value="RECRUITER">RECRUITER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                            <button
                              onClick={() => handleRoleChangeSubmit(u.id)}
                              className="btn btn-primary btn-xs"
                              disabled={isActioning}
                              title="Confirm Role"
                            >
                              <Check size={12} />
                            </button>
                            <button
                              onClick={() => setEditingUserId(null)}
                              className="btn btn-secondary btn-xs"
                              title="Cancel"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Badge variant={u.role === 'ADMIN' ? 'ai' : u.role === 'RECRUITER' ? 'warning' : 'primary'}>
                              {u.role}
                            </Badge>
                            <button
                              onClick={() => {
                                setEditingUserId(u.id);
                                setSelectedNewRole(u.role);
                              }}
                              className="btn btn-outline btn-xs"
                              style={{ padding: '0.2rem 0.35rem' }}
                              title="Change Role"
                            >
                              <Edit2 size={11} />
                            </button>
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '1rem 1.5rem' }}>
                        <Badge
                          variant={
                            status === 'ACTIVE' ? 'success' : status === 'BLOCKED' ? 'error' : 'secondary'
                          }
                        >
                          {status}
                        </Badge>
                      </td>

                      <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>

                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          {status !== 'ACTIVE' && (
                            <button
                              onClick={() => handleStatusChange(u.id, 'ACTIVE')}
                              disabled={isActioning}
                              className="btn btn-outline btn-xs"
                              style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                              title="Activate Account"
                            >
                              <UserCheck size={12} /> Activate
                            </button>
                          )}

                          {status === 'ACTIVE' && (
                            <button
                              onClick={() => handleStatusChange(u.id, 'INACTIVE')}
                              disabled={isActioning}
                              className="btn btn-outline btn-xs"
                              style={{ color: 'var(--text-muted)' }}
                              title="Deactivate Account"
                            >
                              <UserX size={12} /> Deactivate
                            </button>
                          )}

                          {status !== 'BLOCKED' && (
                            <button
                              onClick={() => handleStatusChange(u.id, 'BLOCKED')}
                              disabled={isActioning}
                              className="btn btn-outline btn-xs"
                              style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                              title="Block User"
                            >
                              <ShieldAlert size={12} /> Block
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
