'use client';
import { useState, useEffect } from 'react';
import { Users, ArrowLeftRight, Loader2, BookOpen, AlertCircle } from 'lucide-react';
import { statsApi, type DashboardStats } from '@/lib/stats'; 
import { borrowsApi } from '@/lib/borrows'; 
import { bookCopiesApi } from '@/lib/bookCopies'; 

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  
  const [barData, setBarData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [totalCopiesCount, setTotalCopiesCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [statsRes, borrowsRes, copiesRes] = await Promise.all([
          statsApi.dashboard().catch(e => {
            console.warn("Không có quyền lấy Stats:", e);
            return null; 
          }),
          borrowsApi.list().catch(e => {
            console.warn("Không có quyền lấy Lịch sử mượn trả:", e);
            return [];   
          }),
          bookCopiesApi.list().catch(e => {
            console.warn("Không có quyền lấy Kho sách:", e);
            return []; 
          })
        ]);

        if (!statsRes) {
          throw new Error('Bạn không có quyền truy cập dữ liệu tổng quan.');
        }

        setStats(statsRes);

        const last6Months: any[] = [];
        const now = new Date();
        

        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          last6Months.push({
            monthStr: `T${d.getMonth() + 1}`,
            month: d.getMonth(),
            year: d.getFullYear(),
            muonsach: 0,
            trasach: 0
          });
        }

        borrowsRes.forEach(ticket => {
          if (ticket.borrowDate) {
            const bd = new Date(ticket.borrowDate);
            const match = last6Months.find(m => m.month === bd.getMonth() && m.year === bd.getFullYear());
            if (match) match.muonsach++;
          }
          if (ticket.returnDate && ticket.status === 'RETURNED') {
            const rd = new Date(ticket.returnDate);
            const match = last6Months.find(m => m.month === rd.getMonth() && m.year === rd.getFullYear());
            if (match) match.trasach++;
          }
        });

        setBarData(last6Months);

        const statusCounts = {
          available: 0,
          borrowed: 0, 
          broken: 0,   
          maintenance: 0
        };

        copiesRes.forEach(copy => {
          if (copy.status === 'AVAILABLE') statusCounts.available++;
          else if (copy.status === 'BORROWED' || copy.status === 'RESERVED') statusCounts.borrowed++;
          else if (copy.status === 'LOST' || copy.status === 'DAMAGED') statusCounts.broken++;
          else if (copy.status === 'MAINTENANCE') statusCounts.maintenance++;
        });

        const processedPieData = [
          { name: 'Trên kệ', value: statusCounts.available, color: '#10b981' },
          { name: 'Đang mượn/Đặt', value: statusCounts.borrowed, color: '#3b82f6' },
          { name: 'Mất/Hư hỏng', value: statusCounts.broken, color: '#ef4444' },
          { name: 'Bảo trì', value: statusCounts.maintenance, color: '#f59e0b' },
        ].filter(item => item.value > 0);

        setPieData(processedPieData);
        setTotalCopiesCount(copiesRes.length);

      } catch (err: any) {
        console.error("Lỗi tải dữ liệu Dashboard:", err);
        setError(err.message || 'Không thể tải dữ liệu tổng quan');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-blue-600">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 text-center bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium">
        {error || 'Không có dữ liệu.'}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Báo cáo Tổng quan</h2>
        <p className="text-sm text-gray-500">Chỉ số cốt lõi và luồng hoạt động toàn hệ thống Thư viện.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Tổng Độc giả</p>
            <h3 className="text-3xl font-black text-gray-900">{stats.totalReaders.toLocaleString('vi-VN')}</h3>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600"><Users size={28} /></div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400"></div>
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Đầu sách / Bản sao</p>
            <h3 className="text-3xl font-black text-gray-900">
              {stats.totalBooks.toLocaleString('vi-VN')} <span className="text-xl text-gray-400 font-bold">/ {stats.totalCopies.toLocaleString('vi-VN')}</span>
            </h3>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500"><ArrowLeftRight size={28} /></div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Mượn tháng này</p>
            <h3 className="text-3xl font-black text-gray-900">{stats.borrowsThisMonth.toLocaleString('vi-VN')}</h3>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600"><BookOpen size={28} /></div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500"></div>
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Vi phạm (Chờ xử lý)</p>
            <h3 className="text-3xl font-black text-gray-900">
              {stats.violations.toLocaleString('vi-VN')} 
              {stats.pendingViolations > 0 && <span className="text-lg text-red-500 ml-2">({stats.pendingViolations})</span>}
            </h3>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600"><AlertCircle size={28} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Biểu đồ Lượt Mượn - Trả (6 tháng gần nhất)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="monthStr" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 13 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 13 }} />
                <ChartTooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar name="Lượt Mượn" dataKey="muonsach" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar name="Lượt Trả" dataKey="trasach" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Tỉ lệ Trạng thái Kho sách</h3>
          <p className="text-xs text-gray-500 mb-6">Đo lường tính khả dụng của tài nguyên</p>
          
          <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#111827', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-gray-800">{totalCopiesCount}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Tổng bản sao</span>
            </div>
          </div>

          <div className="mt-auto pt-6 space-y-3">
            {pieData.map((item, index) => {
              const percent = totalCopiesCount > 0 ? ((item.value / totalCopiesCount) * 100).toFixed(1) : '0';
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-medium text-gray-600">{item.name} ({item.value})</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{percent}%</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}