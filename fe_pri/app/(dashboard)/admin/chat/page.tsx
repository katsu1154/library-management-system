'use client';
import { useState, useEffect, useRef } from 'react';
import { tokenStore } from '@/lib/api';
import { Send, MessageSquare, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

type Conversation = { id: number; reader: { fullName: string; identityNumber: string; email: string }; status: string; createdAt: string };
type Message = { id: number; sender: { fullName: string; role: string }; content: string; sentAt: string };

const authHdr = () => ({ Authorization: `Bearer ${tokenStore.get()}` });

export default function LibrarianChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_URL}/api/chat/sessions`, { headers: authHdr() });
      if (res.ok) {
        const rawData: Conversation[] = await res.json();
        
        const uniqueMap = new Map<string, Conversation>();
        
        rawData.forEach((c) => {
          const userKey = c.reader?.email || String(c.id);
          const existing = uniqueMap.get(userKey);
          
          if (!existing || new Date(c.createdAt).getTime() > new Date(existing.createdAt).getTime()) {
            uniqueMap.set(userKey, c);
          }
        });

        const sortedConversations = Array.from(uniqueMap.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setConversations(sortedConversations);
      }
    } catch {}
  };

  const fetchMessages = async (sessionId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/chat/sessions/${sessionId}/messages`, { headers: authHdr() });
      if (res.ok) {
        const rawMessages: Message[] = await res.json();
        
        const uniqueMessages = Array.from(
          new Map(rawMessages.map(m => [m.id, m])).values()
        );
        
        setMessages(uniqueMessages);
      }
    } catch {}
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selected) return;
    fetchMessages(selected);
    const interval = setInterval(() => fetchMessages(selected), 3000);
    return () => clearInterval(interval);
  }, [selected]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selected) return;
    setSending(true);
    try {
      await fetch(`${API_URL}/api/chat/sessions/${selected}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHdr() },
        body: JSON.stringify({ content: input.trim() }),
      });
      setInput('');
      fetchMessages(selected);
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  return (
    <div className="bg-white rounded-xl border h-[80vh] flex overflow-hidden">
      <div className="w-72 border-r flex flex-col">
        <div className="px-4 py-3 border-b">
          <h2 className="font-bold flex items-center gap-2"><MessageSquare size={18} className="text-red-600" />Hộp thoại</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">Chưa có hội thoại</div>
          ) : conversations.map((c) => (
            <button key={c.id} onClick={() => setSelected(c.id)}
              className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 ${selected === c.id ? 'bg-red-50' : ''}`}>
              <div className="font-bold text-sm">{c.reader?.fullName}</div>
              <div className="text-xs text-gray-500 truncate">{c.status === 'OPEN' ? 'Đang mở' : 'Đã đóng'}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{new Date(c.createdAt).toLocaleString('vi-VN')}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">Chọn cuộc hội thoại để xem tin</div>
        ) : (
          <>
            <div className="px-4 py-3 border-b">
              <h3 className="font-bold">{conversations.find(c => c.id === selected)?.reader?.fullName}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((m) => ['LIBRARIAN', 'ADMIN'].includes(m.sender?.role) ? (
                <div key={m.id} className="flex justify-end">
                  <div className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm max-w-[70%]">{m.content}</div>
                </div>
              ) : (
                <div key={m.id} className="flex gap-2">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">{m.sender?.fullName?.[0] || 'U'}</div>
                  <div className="bg-white border px-3 py-2 rounded-lg text-sm max-w-[70%]">{m.content}</div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={handleSend} className="border-t p-3 flex gap-2">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Nhập tin nhắn..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm outline-none" />
              <button type="submit" disabled={sending || !input.trim()}
                className="w-10 h-10 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-full flex items-center justify-center">
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}