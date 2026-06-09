'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { X, User, Loader2 } from 'lucide-react';
import { profileApi } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { user, mutate } = useAuth();
    const router = useRouter();

    const [fullName, setFullName] = useState(user?.fullName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [msgProfile, setMsgProfile] = useState({ type: '', text: '' });

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [msgPassword, setMsgPassword] = useState({ type: '', text: '' });

    if (!user) return <div className="p-10 text-center">Vui lòng đăng nhập...</div>;

    const handleUpdateProfile = async () => {
        setMsgProfile({ type: '', text: '' });
        if (!fullName.trim()) {
            return setMsgProfile({ type: 'error', text: 'Họ và tên không được để trống!' });
        }
        if (!email) {
            return setMsgProfile({ type: 'error', text: 'Email không được để trống!' })
        }
        if (!phoneNumber) {
            return setMsgProfile({ type: 'error', text: 'Số điện thoại không được để trống!' })
        }

        setLoadingProfile(true);
        try {
            await profileApi.updateProfile({ fullName, email, phoneNumber});
            setMsgProfile({ type: 'success', text: 'Cập nhật thông tin thành công!' });
            mutate();
        } catch (error: any) {
            setMsgProfile({ type: 'error', text: error.message || 'Lỗi cập nhật thông tin' });
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleChangePassword = async () => {
        setMsgPassword({ type: '', text: '' });

        if (!currentPassword || !newPassword || !confirmPassword) {
            return setMsgPassword({ type: 'error', text: 'Vui lòng điền đầy đủ các trường mật khẩu!' });
        }

        if (newPassword.length < 6) {
            return setMsgPassword({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
        }

        if (newPassword !== confirmPassword) {
            return setMsgPassword({ type: 'error', text: 'Mật khẩu xác nhận không khớp!' });
        }

        if (currentPassword === newPassword) {
            return setMsgPassword({ type: 'error', text: 'Mật khẩu mới phải khác mật khẩu hiện tại!' });
        }

        setLoadingPassword(true);
        try {
            await profileApi.changePassword({ oldPassword: currentPassword, newPassword });
            setMsgPassword({ type: 'success', text: 'Đổi mật khẩu thành công!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            setMsgPassword({ type: 'error', text: error.message || 'Mật khẩu hiện tại không đúng!' });
        } finally {
            setLoadingPassword(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-gray-100 flex flex-col overflow-hidden">
            <div className="bg-[#1f2937] text-white px-6 py-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border border-gray-500 flex items-center justify-center bg-gray-800 text-xl font-bold">
                        <User size={24} className="text-gray-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold leading-tight">Trang cá nhân</h1>
                        <p className="text-gray-400 text-sm">{user.fullName} - {user.email}</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-6">

                        <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-lg mb-6 border-b pb-4">Thông tin cá nhân</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-bold text-gray-700">Họ và tên</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full mt-1 px-4 py-2 border rounded-lg outline-none focus:border-red-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700">Email</label>
                                    <input
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full mt-1 px-4 py-2 border rounded-lg outline-none focus:border-red-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700">Số điện thoại</label>
                                    <input
                                        type="text"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full mt-1 px-4 py-2 border rounded-lg outline-none focus:border-red-500"
                                    />
                                </div>

                                {msgProfile.text && (
                                    <div className={`p-3 text-sm rounded-lg ${msgProfile.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                        {msgProfile.text}
                                    </div>
                                )}

                                <div className="text-right pt-2">
                                    <button
                                        onClick={handleUpdateProfile}
                                        disabled={loadingProfile}
                                        className="bg-[#aa0000] text-white px-6 py-2 rounded-lg font-bold hover:bg-red-800 disabled:opacity-50 flex items-center gap-2 ml-auto"
                                    >
                                        {loadingProfile && <Loader2 size={16} className="animate-spin" />}
                                        Lưu thông tin
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-lg mb-6 border-b pb-4">Đổi mật khẩu</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-bold text-gray-700">Mật khẩu hiện tại</label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full mt-1 px-4 py-2 border rounded-lg focus:border-red-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700">Mật khẩu mới</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full mt-1 px-4 py-2 border rounded-lg focus:border-red-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700">Xác nhận mật khẩu</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full mt-1 px-4 py-2 border rounded-lg focus:border-red-500 outline-none"
                                    />
                                </div>

                                {msgPassword.text && (
                                    <div className={`p-3 text-sm rounded-lg ${msgPassword.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                        {msgPassword.text}
                                    </div>
                                )}

                                <div className="text-right pt-2">
                                    <button
                                        onClick={handleChangePassword}
                                        disabled={loadingPassword}
                                        className="bg-[#aa0000] text-white px-6 py-2 rounded-lg font-bold hover:bg-red-800 disabled:opacity-50 flex items-center gap-2 ml-auto"
                                    >
                                        {loadingPassword && <Loader2 size={16} className="animate-spin" />}
                                        Đổi mật khẩu
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}