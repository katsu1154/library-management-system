// src/app/admin/users/page.tsx
'use client';
import { useState, useEffect, useMemo } from 'react';
import { adminUserApi } from '@/lib/admin';
import { Search, UserPlus, Edit, Lock, Unlock, X } from 'lucide-react';
import Pagination from '@/components/categories/Pagination';


export default function AdminUserPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const size = 7;
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [modal, setModal] = useState({ isOpen: false, isEdit: false, accountId: 0 });
  const [formData, setFormData] = useState({
    fullName: '', email: '', phoneNumber: '', password: '', roleName: 'ROLE_EXTERNAL_READER'
  });

  const fetchUsers = async () => {
    try {
      const data = await adminUserApi.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchSearch =
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.phoneNumber && user.phoneNumber.includes(searchTerm));

      const matchRole = filterRole === 'ALL' || user.roleName === filterRole;
      const matchStatus = filterStatus === 'ALL' || user.status === filterStatus;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);
  const totalPages = Math.ceil(filteredUsers.length / size);
  const paginatedUsers = filteredUsers.slice(page * size, (page + 1) * size);

  useEffect(() => {
    setPage(0);
  }, [searchTerm, filterRole, filterStatus]);
  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const isLocking = currentStatus === 'ACTIVE';
    let reason = 'Admin thao tác tay';

    if (isLocking) {
      const inputReason = prompt('Nhập lý do khóa tài khoản này:');
      if (inputReason === null) return;
      if (inputReason.trim() !== '') reason = inputReason;
    } else {
      if (!confirm('Bạn có chắc chắn muốn mở khóa tài khoản này?')) return;
    }

    try {
      await adminUserApi.updateStatus(id, isLocking ? 'LOCKED' : 'ACTIVE', reason);
      fetchUsers();
    } catch (error: any) { alert(error.message); }
  };

  const openCreateModal = () => {
    setFormData({ fullName: '', email: '', phoneNumber: '', password: '', roleName: 'ROLE_EXTERNAL_READER' });
    setModal({ isOpen: true, isEdit: false, accountId: 0 });
  };

  // Mở Form Sửa
  const openEditModal = (user: any) => {
    setFormData({
      fullName: user.fullName === 'N/A' ? '' : user.fullName,
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      password: '', 
      roleName: user.roleName || 'ROLE_EXTERNAL_READER'
    });
    setModal({ isOpen: true, isEdit: true, accountId: user.accountId });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        role: formData.roleName
      };

      if (modal.isEdit) {
        await adminUserApi.updateAccount(modal.accountId, payload);
        alert('Cập nhật tài khoản thành công!');
      } else {
        await adminUserApi.createAccount(payload);
        alert('Tạo tài khoản thành công!');
      }
      setModal({ isOpen: false, isEdit: false, accountId: 0 });
      fetchUsers();
    } catch (error: any) { alert(error.message); }
  };

  const getRoleBadge = (roleName: string) => {
    switch (roleName) {
      case 'ROLE_ADMIN': return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-red-100 text-red-700">Admin</span>;
      case 'ROLE_LIBRARIAN': return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-100 text-blue-700">Thủ thư</span>;
      case 'ROLE_ACCOUNTANT': return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-green-100 text-green-700">Kế toán</span>;
      case 'ROLE_WAREHOUSE_MANAGER': return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-orange-100 text-orange-700">Thủ kho</span>;
      case 'ROLE_HR': return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-pink-100 text-pink-700">Nhân sự</span>;
      case 'ROLE_INTERNAL_READER': return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-purple-100 text-purple-700">Độc giả (Nội bộ)</span>;
      case 'ROLE_EXTERNAL_READER': return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-purple-100 text-purple-700">Độc giả (Ngoài)</span>;
      default: return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-gray-100 text-gray-700">{roleName || 'N/A'}</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative">
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Danh sách Người dùng</h1>
        <button onClick={openCreateModal} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <UserPlus size={16} /> Tạo tài khoản mới
        </button>
      </div>

      <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-50">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
          />
        </div>
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-red-500">
          <option value="ALL">Tất cả Vai trò</option>
          <option value="ROLE_ADMIN">Admin</option>
          <option value="ROLE_LIBRARIAN">Thủ thư</option>
          <option value="ROLE_ACCOUNTANT">Kế toán</option>
          <option value="ROLE_WAREHOUSE_MANAGER">Thủ kho</option>
          <option value="ROLE_INTERNAL_READER">Độc giả (Nội bộ)</option>
          <option value="ROLE_EXTERNAL_READER">Độc giả (Ngoài)</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-red-500">
          <option value="ALL">Tất cả Trạng thái</option>
          <option value="ACTIVE">Hoạt động</option>
          <option value="LOCKED">Bị khóa</option>
        </select>
      </div>

      <div className="overflow-x-auto min-h-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">STT</th>
              <th className="px-6 py-4 font-semibold">Email</th>
              <th className="px-6 py-4 font-semibold">Tên người dùng</th>
              <th className="px-6 py-4 font-semibold">Số điện thoại</th>
              <th className="px-6 py-4 font-semibold">Vai trò</th>
              <th className="px-6 py-4 font-semibold">Trạng thái</th>
              <th className="px-6 py-4 font-semibold text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-500">Đang tải dữ liệu...</td></tr>
            ) : paginatedUsers.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-500">Không tìm thấy người dùng nào.</td></tr>
            ) : (
              paginatedUsers.map((user, index) => (
                <tr key={user.accountId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{user.email}</td>
                  <td className="px-6 py-4 font-bold text-gray-800">{user.fullName || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-600">{user.phoneNumber || '---'}</td>
                  <td className="px-6 py-4">{getRoleBadge(user.roleName)}</td>
                  <td className="px-6 py-4">
                    {user.status === 'ACTIVE'
                      ? <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-600 border border-green-200">Hoạt động</span>
                      : <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-600 border border-red-200">Bị khóa</span>
                    }
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => openEditModal(user)} className="text-blue-500 hover:text-blue-700 transition-colors" title="Chỉnh sửa">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleToggleStatus(user.accountId, user.status)} className={`${user.status === 'ACTIVE' ? 'text-orange-500 hover:text-orange-700' : 'text-green-500 hover:text-green-700'} transition-colors`} title={user.status === 'ACTIVE' ? "Khóa tài khoản" : "Mở khóa"}>
                        {user.status === 'ACTIVE' ? <Lock size={16} /> : <Unlock size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100">
          <Pagination
            current={page}
            totalPages={totalPages}
            onChange={setPage}
          />
        </div>
      )}

      {modal.isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-120 overflow-hidden flex flex-col max-h-[90vh]">

            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h2 className="text-[1.15rem] font-bold text-gray-800">
                {modal.isEdit ? 'Cập nhật tài khoản' : 'Tạo tài khoản mới'}
              </h2>
              <button type="button" onClick={() => setModal({ ...modal, isOpen: false })} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">

              {!modal.isEdit && (
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Email</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all" />
                </div>
              )}

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Họ và tên</label>
                <input required value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all" />
              </div>


              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Số điện thoại</label>
                <input value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Mật khẩu</label>
                <input type="password" required={!modal.isEdit} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder={modal.isEdit ? "Bỏ trống nếu không muốn đổi mật khẩu" : "••••••••"} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Vai trò (Phân quyền)</label>
                <select value={formData.roleName} onChange={e => {
                  const val = e.target.value;
                  setFormData({ ...formData, roleName: val });
                }} className="w-full px-4 py-2.5 border border-red-500 rounded-lg text-sm outline-none focus:ring-1 focus:ring-red-500 transition-all text-gray-800 bg-white">
                  <option value="ROLE_ADMIN">Admin</option>
                  <option value="ROLE_LIBRARIAN">Thủ thư</option>
                  <option value="ROLE_ACCOUNTANT">Kế toán</option>
                  <option value="ROLE_WAREHOUSE_MANAGER">Thủ kho</option>
                  <option value="ROLE_EXTERNAL_READER">Độc giả (Ngoài trường)</option>
                  <option value="ROLE_INTERNAL_READER">Độc giả (Trong trường - TLU)</option>
                </select>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setModal({ ...modal, isOpen: false })} className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">
                  Hủy
                </button>
                <button type="submit" className="px-6 py-2.5 text-sm font-semibold text-white bg-[#dc2626] hover:bg-red-700 rounded-lg shadow-sm transition-colors">
                  {modal.isEdit ? 'Lưu thay đổi' : 'Tạo tài khoản'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}