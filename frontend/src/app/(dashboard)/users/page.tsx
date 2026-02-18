'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { User, Role } from '@/types';
import RoleBadge from '@/components/ui/RoleBadge';
import { useToast } from '@/components/ui/Toast';
import { apiRequests } from '@/lib/api';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'viewer' as Role,
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiRequests.get<User[]>('/api/users/');

      setUsers(data.data);
    } catch (error) {
      showToast('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = 'Valid email is required';
    }
    
    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }
    
    if (!formData.password || formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setActionLoading(-1);
      await apiRequests.post('/api/users/', formData);
      showToast('User created successfully', 'success');
      setShowCreateModal(false);
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        role: 'viewer',
        password: '',
      });
      setFormErrors({});
      fetchUsers();
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to create user', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (userId: number, newRole: Role) => {
    try {
      setActionLoading(userId);
      await apiRequests.put(`/api/users/${userId}/`, { role: newRole });
      
      showToast('User role updated', 'success');
      fetchUsers();
    } catch (error) {
      showToast('Failed to update role', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async (userId: number, isActive: boolean) => {
    try {
      setActionLoading(userId);
      await apiRequests.put(`/api/users/${userId}/`, { is_active: isActive });
      
      showToast(`User ${isActive ? 'activated' : 'deactivated'}`, 'success');
      fetchUsers();
    } catch (error) {
      showToast('Failed to update user status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
    
    try {
      setActionLoading(userId);
      await apiRequests.delete(`/api/users/${userId}/`);
      showToast('User deleted', 'success');
      fetchUsers();
    } catch (error) {
      showToast('Failed to delete user', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const roleHierarchyInfo = [
    { role: 'admin', description: 'Full system access, manage all users and products' },
    { role: 'approver', description: 'Create products and approve/reject submissions' },
    { role: 'editor', description: 'Create and edit products, submit for approval' },
    { role: 'viewer', description: 'Read-only access to products' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">User Management</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage users and their permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition-all"
        >
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {/* Role Hierarchy Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {roleHierarchyInfo.map((info, index) => (
          <div
            key={info.role}
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <RoleBadge role={info.role as Role} />
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{info.description}</p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: '200ms' }}>
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {users.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  
                  return (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                            {getInitials(user.first_name, user.last_name)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {user.first_name} {user.last_name}
                              {isSelf && <span className="ml-2 text-xs text-brand-600 dark:text-brand-400">(You)</span>}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                          disabled={isSelf || actionLoading === user.id}
                          className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="admin">Admin</option>
                          <option value="approver">Approver</option>
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={user.is_active}
                            onChange={(e) => handleToggleActive(user.id, e.target.checked)}
                            disabled={isSelf || actionLoading === user.id}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-500 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-green-500 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                        </label>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end">
                          {!isSelf && (
                            <button
                              onClick={() => handleDeleteUser(user.id, `${user.first_name} ${user.last_name}`)}
                              disabled={actionLoading === user.id}
                              className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all disabled:opacity-50"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
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

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New User</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border ${
                      formErrors.first_name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                    } focus:ring-2 focus:ring-brand-500 transition-all`}
                  />
                  {formErrors.first_name && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.first_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border ${
                      formErrors.last_name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                    } focus:ring-2 focus:ring-brand-500 transition-all`}
                  />
                  {formErrors.last_name && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.last_name}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border ${
                    formErrors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  } focus:ring-2 focus:ring-brand-500 transition-all`}
                />
                {formErrors.email && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-500 transition-all"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="approver">Approver</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border ${
                      formErrors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                    } focus:ring-2 focus:ring-brand-500 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.password}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={actionLoading === -1}
                  className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold transition-all disabled:cursor-not-allowed"
                >
                  {actionLoading === -1 ? 'Creating...' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
