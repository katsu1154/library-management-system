'use client';
import { Info } from 'lucide-react';

export default function WithdrawalsPage() {
  return (
    <div className="max-w-xl mx-auto py-16 px-4 text-center">
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-10">
        <Info className="mx-auto mb-4 text-blue-500" size={40} />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Chức năng đã bị xóa</h2>
        <p className="text-gray-600 text-sm">
          Rút tiền của độc giả được xử lý <strong>tự động ngay lập tức</strong> khi độc giả gửi yêu cầu.
          Không còn quy trình duyệt thủ công bởi kế toán.
        </p>
      </div>
    </div>
  );
}
