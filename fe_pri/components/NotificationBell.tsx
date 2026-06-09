'use client';
import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';
import { notificationsApi, type MyNotification } from '@/lib/notifications';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MyNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [selectedNotification, setSelectedNotification] = useState<MyNotification | null>(null);
  
  const ref = useRef<HTMLDivElement>(null);

  const fetchUnread = async () => {
    try { setUnread(await notificationsApi.unreadCount()); }
    catch (e) { /* silent */ }
  };

  useEffect(() => {
    fetchUnread();
    const id = setInterval(fetchUnread, 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetchUnread();
    const id = setInterval(fetchUnread, 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = async () => {
    if (open) return setOpen(false);
    setOpen(true);
    setLoading(true);
    try { setItems(await notificationsApi.myList()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleReadAndShowPopup = async (notification: MyNotification) => {
    setSelectedNotification(notification);
    setOpen(false); 

    if (!notification.read) {
      try {
        await notificationsApi.markAsRead(notification.id);
        setItems(items.map(i => i.id === notification.id ? { ...i, read: true } : i));
        fetchUnread();
      } catch (e) { console.error(e); }
    }
  };

  const handleReadAll = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setItems(items.map(i => ({ ...i, read: true })));
      setUnread(0);
    } catch (e) { console.error(e); }
  };

  return (
    <>
      <div ref={ref} className="relative">
        <button onClick={handleOpen} className="relative text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100">
          <Bell size={20} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 px-1.5 min-w-4.5 h-4.5 text-[10px] font-bold bg-red-600 text-white rounded-full flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border z-50 max-h-125 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-sm">🔔 Thông báo</h3>
                {unread > 0 && <p className="text-xs text-red-600 mt-0.5">{unread} thông báo chưa đọc</p>}
              </div>
              {unread > 0 && (
                <button onClick={handleReadAll} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  <CheckCheck size={12} />Đọc tất cả
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="text-center py-8 text-gray-500 text-sm">Đang tải...</div>
              ) : items.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">📭 Chưa có thông báo nào</div>
              ) : items.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => handleReadAndShowPopup(n)} // Gọi hàm mới
                  className={`px-4 py-3 border-b last:border-b-0 cursor-pointer transition-colors ${
                    !n.read ? 'bg-red-50/40 hover:bg-red-50/60' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h4 className={`text-sm flex-1 ${!n.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{n.title}</h4>
                    {!n.read && <span className="w-2 h-2 bg-red-500 rounded-full shrink-0 mt-1.5"></span>}
                  </div>
                  <p className="text-xs text-gray-600 mb-1.5 line-clamp-2 whitespace-pre-wrap">{n.message}</p>
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>👤 {n.senderName || 'Hệ thống'}</span>
                    <span>{new Date(n.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedNotification && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">Chi tiết thông báo</h3>
              <button 
                onClick={() => setSelectedNotification(null)} 
                className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <h4 className="font-bold text-xl text-gray-900 mb-3 leading-tight">
                {selectedNotification.title}
              </h4>
              
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 mb-6 pb-4 border-b border-gray-100">
                <span className="flex items-center gap-1">
                  👤 Người gửi: <span className="font-medium text-gray-700">{selectedNotification.senderName || 'Hệ thống'}</span>
                </span>
                <span className="flex items-center gap-1">
                  🕒 Thời gian: <span className="font-medium text-gray-700">
                    {new Date(selectedNotification.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </span>
                </span>
              </div>
              
              <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed max-h-[50vh] overflow-y-auto custom-scrollbar">
                {selectedNotification.message}
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedNotification(null)} 
                className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg text-sm font-bold hover:bg-gray-300 transition-colors"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}