'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { inventoryApi, type StockReport } from '@/lib/inventory';
import { Download, Send, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function StockReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<StockReport | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try { setReport(await inventoryApi.report()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleExportExcel = () => {
    if (!report || report.items.length === 0) return;

    const excelData = report.items.map((item) => ({
      'Mã Đầu Sách': `S-${String(item.bookTitleId).padStart(3, '0')}`,
      'Tên Sách': item.bookTitleName,
      'Tồn Kho Hiện Tại': item.availableCopies,
      'Mức Tối Thiểu': 15,
      'Trạng Thái': item.availableCopies < 15 ? ' Dưới mức tối thiểu' : ' An toàn',
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    const workbook = XLSX.utils.book_new();
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tồn Kho Thực Tế');

    worksheet['!cols'] = [
      { wch: 15 }, 
      { wch: 45 }, 
      { wch: 18 }, 
      { wch: 15 },
      { wch: 22 }, 
    ];

    const currentDate = new Date().toISOString().slice(0, 10);
    const fileName = `Bao_cao_ton_kho_${currentDate}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-500" size={32} /></div>;
  if (!report) return null;

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl font-bold">Báo cáo Tồn Kho</h1>
          <p className="text-sm text-gray-500 mt-1">Xem chi tiết tồn kho và xuất báo cáo</p>
        </div>
        
        <button 
          onClick={handleExportExcel}
          className="bg-[#1e293b] hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <Download size={14} />Xuất File Báo Cáo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500 mb-1">Tổng đầu sách</p>
          <p className="text-3xl font-bold text-gray-800">{report.totalBooks.toLocaleString('vi-VN')}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500 mb-1">Tổng bản sao trong kho</p>
          <p className="text-3xl font-bold text-blue-600">{report.totalCopies.toLocaleString('vi-VN')}</p>
        </div>
        <div className="bg-white rounded-xl border-2 border-red-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Sách dưới mức tối thiểu</p>
          <p className="text-3xl font-bold text-red-600">
            <span>{report.lowStockCount}</span>
            <span className="text-base ml-1 font-normal text-gray-500">đầu sách</span>
          </p>
          <p className="text-xs text-red-500 mt-1">Cần xem xét nhập thêm</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-500 text-xs uppercase border-b bg-gray-50">
              <th className="px-6 py-3 font-bold">Tên sách</th>
              <th className="px-6 py-3 font-bold">Tồn kho hiện tại</th>
              <th className="px-6 py-3 font-bold">Mức tối thiểu</th>
              <th className="px-6 py-3 font-bold">Trạng thái</th>
              <th className="px-6 py-3 font-bold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {report.items.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-500">Không có sách.</td></tr>
            ) : report.items.map((i) => {
              const isLow = i.availableCopies < 15;
              return (
                <tr key={i.bookTitleId} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-bold">{i.bookTitleName}</td>
                  <td className={`px-6 py-4 font-bold ${isLow ? 'text-red-600' : 'text-gray-800'}`}>{i.availableCopies}</td>
                  <td className="px-6 py-4 text-gray-600">15</td>
                  <td className="px-6 py-4">
                    {isLow ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
                        <AlertTriangle size={12} />Dưới mức tối thiểu
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                        <CheckCircle2 size={12} />An toàn
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isLow && (
                      <button onClick={() => router.push('/admin/inventory/import')}
                        className="text-blue-600 border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1">
                        <Send size={12} />Tạo đơn mua
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
