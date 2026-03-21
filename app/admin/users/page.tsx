'use client';

import { useState, useEffect } from 'react';
import { 
  getAllUsers, 
  updateUserRole, 
  toggleUserBlock,
  deleteUser
} from '@/lib/actions/admin.actions';
import { 
  Search, 
  RefreshCw, 
  MoreVertical, 
  Ban, 
  CheckCircle, 
  User as UserIcon,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Lock,
  Unlock,
  UserCog,
  Activity,
  FileText,
  AlertTriangle,
  Loader2,
  Shield,
  Users,
  Filter,
  Download,
  X,
  Moon,
  Sun
} from 'lucide-react';
import { toast } from 'sonner';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  
  const usersPerPage = 5;

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    let filtered = users;
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'blocked' ? user.isBlocked : !user.isBlocked
      );
    }
    
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter, users]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data || []);
      setFilteredUsers(data || []);
      toast.success('Users loaded successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadUsers();
    toast.success('Users list refreshed');
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      const result = await updateUserRole(userId, newRole);
      if (result.success) {
        toast.success(`Role updated to ${newRole}`);
        loadUsers();
      } else {
        toast.error(result.error || 'Failed to update role');
      }
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleBlockToggle = async (userId: string, currentStatus: boolean) => {
    try {
      const result = await toggleUserBlock(userId, !currentStatus);
      if (result.success) {
        toast.success(result.message);
        loadUsers();
      } else {
        toast.error(result.error || 'Failed to update status');
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setDeleting(true);
    try {
      const result = await deleteUser(userId);
      if (result.success) {
        toast.success('User deleted successfully');
        setShowDeleteModal(false);
        loadUsers();
      } else {
        toast.error(result.error || 'Failed to delete user');
      }
    } catch (error) {
      toast.error('An error occurred while deleting user');
    } finally {
      setDeleting(false);
    }
  };

  const handleViewDetails = (user: any) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const getRoleBadgeColor = (role: string) => {
    return role === 'admin' 
      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white' 
      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white';
  };

  const getStatusBadge = (isBlocked: boolean) => {
    return isBlocked ? (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white shadow-sm">
        <Ban className="w-3 h-3" />
        Blocked
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-gradient-to-r from-green-600 to-green-700 text-white shadow-sm">
        <CheckCircle className="w-3 h-3" />
        Active
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Users className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-300 font-medium">Loading users...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Dark Gradient */}
        <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-black rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden border border-gray-700">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-600/20 to-pink-600/20 rounded-full -ml-20 -mb-20 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-400" />
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    User Management
                  </span>
                </h1>
                <p className="text-gray-400">Manage and monitor all registered users in one place</p>
              </div>
              <div className="flex gap-3 mt-4 md:mt-0">
                <button 
                  onClick={handleRefresh}
                  className="px-6 py-3 bg-gray-800/80 backdrop-blur-lg rounded-xl hover:bg-gray-700 transition-all flex items-center gap-2 text-gray-300 border border-gray-700 shadow-lg"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                <button className="px-6 py-3 bg-gray-800/80 backdrop-blur-lg rounded-xl hover:bg-gray-700 transition-all flex items-center gap-2 text-gray-300 border border-gray-700 shadow-lg">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards with Dark Glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-gray-700 hover:shadow-blue-900/20 transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-400">Total Users</p>
              <div className="p-3 bg-blue-900/30 rounded-xl">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{users.length}</p>
            <p className="text-xs text-gray-500 mt-2">Registered users</p>
          </div>

          <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-gray-700 hover:shadow-green-900/20 transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-400">Active Users</p>
              <div className="p-3 bg-green-900/30 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-green-400">
              {users.filter(u => !u.isBlocked).length}
            </p>
            <p className="text-xs text-gray-500 mt-2">Currently active</p>
          </div>

          <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-gray-700 hover:shadow-red-900/20 transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-400">Blocked Users</p>
              <div className="p-3 bg-red-900/30 rounded-xl">
                <Lock className="w-5 h-5 text-red-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-red-400">
              {users.filter(u => u.isBlocked).length}
            </p>
            <p className="text-xs text-gray-500 mt-2">Temporarily blocked</p>
          </div>

          <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-gray-700 hover:shadow-purple-900/20 transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-400">Admins</p>
              <div className="p-3 bg-purple-900/30 rounded-xl">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-purple-400">
              {users.filter(u => u.role === 'admin').length}
            </p>
            <p className="text-xs text-gray-500 mt-2">Administrators</p>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-white placeholder-gray-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 bg-gray-900/50 rounded-xl hover:bg-gray-700 transition flex items-center gap-2 text-gray-300 border border-gray-700"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
                >
                  <option value="all">All Roles</option>
                  <option value="user">Users</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Users Table with Dark Design */}
        <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900/50 border-b border-gray-700">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {currentUsers.map((user, index) => (
                  <tr 
                    key={user._id} 
                    className="hover:bg-gray-700/50 transition-all group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${user.isBlocked ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        </div>
                        <div>
                          <p className="font-semibold text-white">{user.name}</p>
                          <p className="text-xs text-gray-500">ID: {user._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-300">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value as 'user' | 'admin')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg border-none text-white focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${getRoleBadgeColor(user.role)}`}
                      >
                        <option value="user" className="bg-gray-800 text-white">User</option>
                        <option value="admin" className="bg-gray-800 text-white">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(user.isBlocked)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-400">{user.createdAt}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewDetails(user)}
                          className="p-2 hover:bg-blue-900/50 rounded-lg transition-all text-blue-400 hover:scale-110"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 hover:bg-green-900/50 rounded-lg transition-all text-green-400 hover:scale-110"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleBlockToggle(user._id, user.isBlocked)}
                          className={`p-2 rounded-lg transition-all hover:scale-110 ${
                            user.isBlocked 
                              ? 'hover:bg-green-900/50 text-green-400' 
                              : 'hover:bg-yellow-900/50 text-yellow-400'
                          }`}
                          title={user.isBlocked ? 'Unblock User' : 'Block User'}
                        >
                          {user.isBlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 hover:bg-red-900/50 rounded-lg transition-all text-red-400 hover:scale-110"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 hover:bg-gray-700 rounded-lg transition-all text-gray-400 hover:scale-110"
                          title="More Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Enhanced Pagination */}
          <div className="px-6 py-4 border-t border-gray-700 bg-gray-900/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-400">
                Showing <span className="font-semibold text-white">{indexOfFirstUser + 1}</span> to{' '}
                <span className="font-semibold text-white">{Math.min(indexOfLastUser, filteredUsers.length)}</span> of{' '}
                <span className="font-semibold text-white">{filteredUsers.length}</span> users
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 bg-gray-800 text-gray-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg transition-all font-medium ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md scale-110'
                            : 'hover:bg-gray-700 text-gray-400'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && <span className="px-2 text-gray-500">...</span>}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 bg-gray-800 text-gray-300"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal - Dark Theme */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700 transform transition-all animate-slideUp">
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-red-900 to-red-800 text-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/10 rounded-xl">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Delete User</h2>
                  <p className="text-red-300 text-sm mt-1">This action cannot be undone</p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="ml-auto p-2 hover:bg-white/10 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3 bg-yellow-900/20 p-4 rounded-xl border border-yellow-800">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-400">Warning</p>
                  <p className="text-sm text-yellow-500 mt-1">
                    This will permanently delete the user account and all associated data.
                  </p>
                </div>
              </div>

              <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                <p className="text-sm text-gray-400 mb-3">User to delete:</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {selectedUser.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-lg">{selectedUser.name}</p>
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {selectedUser.email}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-center text-gray-400">
                Are you sure you want to delete <span className="font-semibold text-white">{selectedUser.name}</span>?
              </p>
            </div>

            <div className="p-6 border-t border-gray-700 bg-gray-900/50 rounded-b-2xl">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 py-3 px-4 border border-gray-700 rounded-xl hover:bg-gray-700 transition font-medium disabled:opacity-50 text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteUser(selectedUser._id)}
                  disabled={deleting}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-xl transition font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete User
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add these animations to globals.css */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}