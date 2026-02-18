'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiRequests } from '@/lib/api';
import { User, Role, CreateUserData } from '@/types';
import { Plus, Trash2, AlertCircle, CheckCircle, X, Shield, UserCheck, Edit, Eye } from 'lucide-react';
import RoleBadge from '@/components/ui/RoleBadge';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<Role>('viewer');
  const [password, setPassword] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const { data } = await apiRequests.get<User[]>('/api/users/');
      setUsers(data);
    } catch (error) {
      showToast('Failed to load users', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setEmail('');
    setFirstName('');
    setLastName('');
    setRole('viewer');
    setPassword('');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newUser: CreateUserData = {
        email,
        first_name: firstName,
        last_name: lastName,
        role,
        password,
      };
      await apiRequests.post<User>('/api/users/', newUser);
      showToast('User created successfully', 'success');
      setShowModal(false);
      resetForm();
      loadUsers();
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to create user', 'error');
    }
  };

  const handleUpdateRole = async (userId: number, newRole: Role) => {
    try {
      await apiRequests.patch<User>(`/api/users/${userId}/`, { role: newRole });
      showToast('User role updated', 'success');
      loadUsers();
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to update role', 'error');
    }
  };

  const handleToggleActive = async (userId: number, isActive: boolean) => {
    try {
      await apiRequests.patch<User>(`/api/users/${userId}/`, { is_active: !isActive });
      showToast(`User ${!isActive ? 'activated' : 'deactivated'}`, 'success');
      loadUsers();
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to update user', 'error');
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await apiRequests.delete(`/api/users/${userId}/`);
      showToast('User deleted successfully', 'success');
      loadUsers();
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to delete user', 'error');
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const roleHierarchy = [
    { role: 'admin' as Role, label: 'Admin', description: 'Full system access', icon: Shield, color: 'text-purple-600 dark:text-purple-400' },
    { role: 'approver' as Role, label: 'Approver', description: 'Can approve products', icon: UserCheck, color: 'text-blue-600 dark:text-blue-400' },
    { role: 'editor' as Role, label: 'Editor', description: 'Can create/edit products', icon: Edit, color: 'text-green-600 dark:text-green-400' },
    { role: 'viewer' as Role, label: 'Viewer', description: 'Read-only access', icon: Eye, color: 'text-slate-600 dark:text-slate-400' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-slide-up ${
          toast.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-900 dark:text-green-100'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-100'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            User Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage user access and permissions
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Create User
        </button>
      </div>

      {/* Role Hierarchy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {roleHierarchy.map((item, index) => {
          const Icon = item.icon;
          return (
            <div 
              key={item.role}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Icon className={`w-8 h-8 mb-3 ${item.color}`} />
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                {item.label}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  User
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Email
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Role
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Status
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isCurrentUser = user.id === currentUser?.id;
                return (
                  <tr key={user.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {getInitials(user.first_name, user.last_name)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {user.first_name} {user.last_name}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-brand-600 dark:text-brand-400">
                                (You)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      {isCurrentUser ? (
                        <RoleBadge role={user.role} />
                      ) : (
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value as Role)}
                          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                        >
                          <option value="admin">Admin</option>
                          <option value="approver">Approver</option>
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isCurrentUser ? (
                        <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          Active
                        </span>
                      ) : (
                        <button
                          onClick={() => handleToggleActive(user.id, user.is_active)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            user.is_active
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
                          }`}
                        >
                          {user.is_active ? 'Active' : 'Inactive'}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {!isCurrentUser && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
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
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8 max-w-md w-full animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Create New User
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    required
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    required
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Role *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
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
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-all"
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
