'use client';
import { useState, useEffect } from 'react';
import { financeApi, type FinanceReport } from '@/lib/finance';
import { Loader2 } from 'lucide-react';

const formatMoney = (n: number) => n.toLocaleString('vi-VN') + 'đ';
const formatDate = (iso: string) => new Date(iso).toLocaleDateString('vi-VN');

export default function FinanceReportPage() {
  const [report, setReport] = useState<FinanceReport | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      setReport(await financeApi.report());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Báo cáo Thu Chi (Tổng hợp)</h1>

      <div className="bg-white rounded-xl border p-4 mb-6 flex justify-between items-center">
        <p className="text-sm text-gray-500">Tổng hợp toàn bộ giao dịch trong hệ thống</p>
        <button onClick={fetchData} className="bg-[#1e293b] text-white px-6 py-2 rounded-lg text-sm font-bold">
          Làm mới
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-500" size={32} /></div>
      ) : !report ? null : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border-l-4 border-green-500 p-5">
              <p className="text-sm text-gray-500 mb-1">Tổng Thu</p>
              <p className="text-3xl font-bold text-gray-800">{formatMoney(Number(report.totalIncome))}</p>
            </div>
            <div className="bg-white rounded-xl border-l-4 border-red-500 p-5">
              <p className="text-sm text-gray-500 mb-1">Tổng Chi</p>
              <p className="text-3xl font-bold text-gray-800">{formatMoney(Number(report.totalExpense))}</p>
            </div>
            <div className={`bg-white rounded-xl border-l-4 ${Number(report.profit) >= 0 ? 'border-blue-500' : 'border-orange-500'} p-5`}>
              <p className="text-sm text-gray-500 mb-1">Lợi Nhuận (Thực)</p>
              <p className={`text-3xl font-bold ${Number(report.profit) >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {formatMoney(Number(report.profit))}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="font-bold">Sổ chi tiết</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 uppercase border-b">
                <tr>
                  <th className="px-6 py-3 font-bold text-left">Ngày GD</th>
                  <th className="px-6 py-3 font-bold text-left">Nội dung</th>
                  <th className="px-6 py-3 font-bold text-center">Loại</th>
                  <th className="px-6 py-3 font-bold text-right">Số tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(!report.transactions || report.transactions.length === 0) ? (
                  <tr><td colSpan={4} className="text-center py-10 text-gray-500">Tháng này chưa có giao dịch.</td></tr>
                ) : report.transactions.map((t, i) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-gray-600">{formatDate(t.date)}</td>
                    <td className="px-6 py-4 text-gray-700">{t.description}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${t.type === 'INCOME' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {t.type === 'INCOME' ? 'THU' : 'CHI'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'INCOME' ? '+ ' : '- '}{formatMoney(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}