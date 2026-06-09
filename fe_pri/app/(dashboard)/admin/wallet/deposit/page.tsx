'use client';
import { Info } from 'lucide-react';

export default function DepositPage() {
  return (
    <div className="max-w-xl mx-auto py-16 px-4 text-center">
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-10">
        <Info className="mx-auto mb-4 text-blue-500" size={40} />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Chức năng đã được thay thế</h2>
        <p className="text-gray-600 text-sm">
          Độc giả tự nạp tiền vào ví qua cổng thanh toán <strong>VNPay</strong> tại trang Ví điện tử.
          Không còn chức năng nạp tiền mặt tại quầy.
        </p>
      </div>
    </div>
  );
}
