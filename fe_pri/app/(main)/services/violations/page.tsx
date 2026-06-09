'use client';
import { useState, useEffect } from 'react';
import { violationsApi, type Violation } from '@/lib/violations';
import { AlertTriangle, CheckCircle2, X, CreditCard, Loader2 } from 'lucide-react';

const formatViolationId = (id: number) => `VP-${String(id).padStart(4, '0')}`;
const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('vi-VN') : '---';
const formatMoney = (n: number) => n.toLocaleString('vi-VN') + 'đ';

export default function MyViolationsPage() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingViolation, setPayingViolation] = useState<Violation | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      setViolations(await violationsApi.myViolations());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const unpaid = violations.filter((v) => v.status === 'UNPAID');
  const paid = violations.filter((v) => v.status === 'PAID');

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <AlertTriangle className="text-red-600" /> Vi phạm & Phạt
      </h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-red-500" size={32} />
        </div>
      ) : (
        <>
          <section className="bg-white rounded-xl shadow-sm border border-red-100 mb-6">
            <div className="px-6 py-4 border-b border-red-100 bg-red-50/30">
              <h2 className="font-bold text-gray-800">Vi phạm chưa thanh toán</h2>
              <p className="text-sm text-gray-500 mt-1">
                Thanh toán ngay qua Ví điện tử để tiếp tục sử dụng dịch vụ thư viện.
              </p>
            </div>

            {unpaid.length === 0 ? (
              <div className="p-10 text-center text-gray-500 text-sm">
                Bạn không có vi phạm chưa xử lý. 🎉
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase border-b bg-red-50/50">
                    <tr>
                      <th className="px-6 py-3 font-bold">Mã VP</th>
                      <th className="px-6 py-3 font-bold">Ngày tạo</th>
                      <th className="px-6 py-3 font-bold">Loại vi phạm</th>
                      <th className="px-6 py-3 font-bold">Ghi chú</th>
                      <th className="px-6 py-3 font-bold">Phí phạt</th>
                      <th className="px-6 py-3 font-bold text-right">Thanh toán</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {unpaid.map((v) => (
                      <tr key={v.id} className="hover:bg-red-50/30">
                        <td className="px-6 py-4 text-gray-700">{formatViolationId(v.id)}</td>
                        <td className="px-6 py-4 text-gray-600">{formatDate(v.createdAt)}</td>
                        <td className="px-6 py-4 text-red-600 font-medium">{v.violationType}</td>
                        <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                          {v.description ?? '---'}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">
                          {formatMoney(v.fineAmount)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setPayingViolation(v)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-2"
                          >
                            <CreditCard size={14} />Thanh toán qua Ví
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="bg-white rounded-xl shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-500" />
                Lịch sử vi phạm (Đã xử lý)
              </h2>
            </div>

            {paid.length === 0 ? (
              <div className="p-10 text-center text-gray-500 text-sm">
                Chưa có vi phạm nào được xử lý.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase border-b">
                    <tr>
                      <th className="px-6 py-3 font-bold">Mã VP</th>
                      <th className="px-6 py-3 font-bold">Ngày xử lý</th>
                      <th className="px-6 py-3 font-bold">Loại vi phạm</th>
                      <th className="px-6 py-3 font-bold text-right">Đã nộp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paid.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 text-gray-700">{formatViolationId(v.id)}</td>
                        <td className="px-6 py-4 text-gray-600">{formatDate(v.paidAt)}</td>
                        <td className="px-6 py-4 text-gray-700">{v.violationType}</td>
                        <td className="px-6 py-4 text-right font-bold text-green-600">
                          {formatMoney(v.fineAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {payingViolation && (
        <PaymentModal
          violation={payingViolation}
          onClose={() => setPayingViolation(null)}
          onSuccess={() => {
            setPayingViolation(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

function PaymentModal({
  violation,
  onClose,
  onSuccess,
}: {
  violation: Violation;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    setSubmitting(true);
    setError('');
    try {
      await violationsApi.pay(violation.id);
      alert(`Thanh toán thành công ${formatMoney(violation.fineAmount)} từ Ví điện tử!`);
      onSuccess();
    } catch (e: any) {
      setError(e.message || 'Lỗi thanh toán');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <CreditCard size={18} className="text-red-600" />Thanh toán vi phạm
          </h3>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-red-50/40 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Mã VP:</span>
              <span className="font-bold">{formatViolationId(violation.id)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Loại vi phạm:</span>
              <span className="text-red-600 font-medium">{violation.violationType}</span>
            </div>
            {violation.description && (
              <div className="flex justify-between">
                <span className="text-gray-500">Ghi chú:</span>
                <span className="text-gray-700 text-right max-w-xs">{violation.description}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="text-gray-700 font-bold">Số tiền phạt:</span>
              <span className="text-red-600 font-bold text-base">
                {formatMoney(violation.fineAmount)}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Số tiền phạt sẽ được trừ trực tiếp từ <strong>Ví điện tử</strong> của bạn.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={submitting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Xác nhận thanh toán
          </button>
        </div>
      </div>
    </div>
  );
}
