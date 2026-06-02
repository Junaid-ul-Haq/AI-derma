'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { motion } from 'framer-motion';
import { useAlert } from '@/components/AlertProvider';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  profileImage?: string;
  createdAt: string;
}

interface UserDetails extends User {
  consultationsCount: number;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showAlert } = useAlert();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      const userRole = (session?.user as any)?.role;
      if (userRole !== 'ADMIN') {
        router.push('/upload');
      } else {
        fetchUsers();
      }
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      } else {
        console.error('Failed to fetch users:', await res.json());
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedUser(data.user);
        setShowUserModal(true);
      } else {
        await showAlert({
          type: 'error',
          title: 'Error',
          message: 'Failed to fetch user details',
        });
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      await showAlert({
        type: 'error',
        title: 'Error',
        message: 'Error fetching user details',
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    const confirmed = await showAlert({
      type: 'warning',
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete ${selectedUser.name} permanently? This action cannot be undone and will delete all associated data including consultations.`,
      showCancel: true,
      confirmText: 'Delete Permanently',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await showAlert({
          type: 'success',
          title: 'Success',
          message: 'User deleted permanently',
        });
        setShowUserModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        const data = await res.json();
        await showAlert({
          type: 'error',
          title: 'Error',
          message: data.error || 'Failed to delete user',
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      await showAlert({
        type: 'error',
        title: 'Error',
        message: 'Error deleting user',
      });
    } finally {
      setDeleting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const regularUsers = filteredUsers.filter(u => u.role === 'USER');
  const adminUsers = filteredUsers.filter(u => u.role === 'ADMIN');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-50">
      <DashboardSidebar role="ADMIN" />
      
      <main className="md:ml-64 p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-7xl mx-auto">
        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm font-medium text-gray-600">Total Users</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm font-medium text-gray-600">Regular Users</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{regularUsers.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm font-medium text-gray-600">Admin Users</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{adminUsers.length}</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Users ({filteredUsers.length})
            </h2>
          </div>
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? 'No users found matching your search.' : 'No users registered yet.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registered
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr 
                      key={user._id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleViewUser(user._id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
          </div>
        </motion.div>
      </main>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">User Details</h3>
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  {selectedUser.profileImage ? (
                    <img
                      src={selectedUser.profileImage}
                      alt={selectedUser.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{selectedUser.name}</h4>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Role</p>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedUser.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {selectedUser.role}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Member Since</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Consultations</p>
                    <p className="text-sm font-medium text-gray-900">{selectedUser.consultationsCount}</p>
                  </div>
                </div>

                {selectedUser.role !== 'ADMIN' && (
                  <button
                    onClick={handleDeleteUser}
                    disabled={deleting}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Delete User Permanently'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}




