import { tokenStore } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${tokenStore.get()}`,
});

export const adminUserApi = {
  getAllUsers: async () => {
    const res = await fetch(`${API_URL}/api/admin/users`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Không thể tải danh sách người dùng');
    return res.json();
  },

  createAccount: async (data: any) => {
    const res = await fetch(`${API_URL}/api/admin/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || 'Lỗi tạo tài khoản');
    }
    return res.json();
  },
  updateAccount: async (id: number, data: any) => {
    const fd = new FormData();
    if (data.fullName)    fd.append('fullName',    data.fullName);
    if (data.email)       fd.append('email',       data.email);
    if (data.phoneNumber) fd.append('phoneNumber', data.phoneNumber);
    if (data.password)    fd.append('password',    data.password);
    if (data.role)        fd.append('role',        data.role);

    const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenStore.get()}` },
      body: fd,
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || 'Lỗi cập nhật tài khoản');
    }
    return res.json();
  },

  updateStatus: async (id: number, status: string, _reason: string = '') => {
    const isBan = status === 'LOCKED';
    const res = await fetch(`${API_URL}/api/admin/users/${id}/ban?ban=${isBan}`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Lỗi cập nhật trạng thái');
    return res.json();
  },

  updateRole: async (_id: number, _roleId: number) => {
    throw new Error('Vui lòng sử dụng tính năng Sửa tài khoản để thay đổi Chức vụ.');
  },

  getViolationsByUser: async (id: number) => {
    const res = await fetch(`${API_URL}/api/violations/user/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Lỗi tải lịch sử vi phạm');
    return res.json();
  },
};