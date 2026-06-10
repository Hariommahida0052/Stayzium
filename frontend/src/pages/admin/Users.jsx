import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, Shield, User, X, Edit, Trash2, Power, ChevronLeft, ChevronRight } from 'lucide-react';
import userService from '../../services/userService';
import toast from 'react-hot-toast';
import { showConfirm } from '../../utils/toastUtils';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user' });

  // Fetch Users from DB
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, roleFilter, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (roleFilter !== 'All Roles') params.role = roleFilter.toLowerCase();
      if (searchTerm) params.search = searchTerm;

      const res = await userService.getAllUsers(params);
      if (res.data.success) {
        setUsers(res.data.data);
        setTotalPages(res.data.pagination.pages);
        setTotalUsers(res.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    // Assuming we don't have an admin-create-user endpoint yet, you might want to build one.
    // For now, let's just close modal or call a generic auth register if needed.
    toast.error('Add user functionality requires auth registration endpoint.');
    setIsAddUserModalOpen(false);
  };

  const toggleUserStatus = async (id, currentStatus) => {
    showConfirm(`Are you sure you want to ${currentStatus === 'Active' ? 'suspend' : 'activate'} this user?`, async () => {
      try {
        const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
        const res = await userService.updateUserStatus(id, newStatus);
        if (res.data.success) {
          toast.success(`User ${newStatus === 'Active' ? 'activated' : 'suspended'} successfully`);
          setUsers(users.map(u => u._id === id ? { ...u, status: newStatus } : u));
        }
      } catch (error) {
        console.error('Error updating status:', error);
        toast.error('Failed to update status');
      }
      setOpenDropdownId(null);
    });
  };

  const deleteUser = async (id) => {
    showConfirm('Are you sure you want to delete this user completely?', async () => {
      try {
        await userService.deleteUser(id);
        toast.success('User deleted successfully');
        fetchUsers(); // Refresh list to handle pagination correctly
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
      setOpenDropdownId(null);
    });
  };

  const getRoleIcon = (role) => {
    switch(role?.toLowerCase()) {
      case 'admin': return <Shield className="w-4 h-4 text-indigo-500" />;
      case 'owner': return <User className="w-4 h-4 text-emerald-500" />;
      default: return <User className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Suspended': return 'bg-red-100 text-red-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage customers, owners, and admin accounts. ({totalUsers} total)</p>
        </div>
        <button onClick={() => setIsAddUserModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center">
          + Add New User
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4 bg-gray-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, email..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white text-gray-700 capitalize"
            >
              <option value="All Roles">All Roles</option>
              <option value="user">Customer</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-500">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">No users found.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="p-4 pl-6">User</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center">
                        {user.profilePicture ? (
                          <img src={user.profilePicture} alt={user.name} className="w-10 h-10 rounded-full object-cover mr-3" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mr-3 uppercase">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">ID: {user._id.substring(user._id.length - 6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{user.email}</td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <div className="flex items-center font-medium text-gray-700 capitalize">
                          {getRoleIcon(user.role)}
                          <span className="ml-2">{user.role}</span>
                        </div>
                        {user.role === 'owner' && (
                          <span className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded w-fit uppercase ${user.isVerified ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                            {user.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusStyle(user.status || 'Active')}`}>
                        {user.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 pr-6 text-right relative">
                      <button 
                        onClick={() => setOpenDropdownId(openDropdownId === user._id ? null : user._id)} 
                        className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      {openDropdownId === user._id && (
                        <div className="absolute right-6 top-10 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-2 text-left">
                          <button 
                            onClick={() => toggleUserStatus(user._id, user.status || 'Active')}
                            className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                          >
                            <Power className={`w-4 h-4 mr-2 ${user.status === 'Active' ? 'text-amber-500' : 'text-green-500'}`} /> 
                            {(!user.status || user.status === 'Active') ? 'Suspend User' : 'Activate User'}
                          </button>
                          {user.role === 'owner' && (
                            <button 
                              onClick={async () => {
                                try {
                                  const res = await userService.toggleUserVerification(user._id);
                                  if (res.data.success) {
                                    setUsers(users.map(u => u._id === user._id ? { ...u, isVerified: !u.isVerified } : u));
                                    toast.success(user.isVerified ? 'Owner Unverified' : 'Owner Verified');
                                  }
                                } catch(err) { toast.error('Failed to update verification status'); }
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center"
                            >
                              <Shield className="w-4 h-4 mr-2" /> 
                              {user.isVerified ? 'Unverify Owner' : 'Verify Owner'}
                            </button>
                          )}
                          <button 
                            onClick={() => deleteUser(user._id)}
                            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete User
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-sm text-gray-500">
              Showing Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
              <button onClick={() => setIsAddUserModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Role</label>
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white"
                >
                  <option value="user">Customer</option>
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsAddUserModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
