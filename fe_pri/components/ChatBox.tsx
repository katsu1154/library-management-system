'use client';
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';
import { tokenStore } from '@/lib/api';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

type AIMsg = { role: 'user' | 'model'; content: string };
type ChatSession = { id: number; status: string };
type ChatMessage = {
  id?: number;
  content: string;
  sender?: { id: number; email: string; fullName: string } | null;
  senderName?: string;
  isAiMessage?: boolean;
  aiMessage: boolean;
  sentAt?: string;
};

const authHdr = () => ({ Authorization: `Bearer ${tokenStore.get()}` });

const TABS = [
  { id: 'ai',   label: 'Trợ lý AI',  color: '#4285f4' },
  { id: 'chat', label: 'Thủ thư',    color: '#2563eb' },
  { id: 'game', label: 'Mini Game',  color: '#dc2626' },
] as const;
type TabId = typeof TABS[number]['id'];

const CW = 362, CH = 310;
const BIRD_X = 72, BIRD_R = 13;
const PIPE_W = 38, GAP_H = 148;
const GRAVITY = 0.42, JUMP_V = -7.4, PIPE_SPD = 2.4, PIPE_INT = 95;

function MiniAvatar({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div style={{
      width: 30, height: 30, borderRadius: '50%', backgroundColor: color, color: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, fontSize: 10, fontWeight: 'bold',
    }}>
      {children}
    </div>
  );
}

function BubbleLeft({ color = '#1a3561', bg = '#e8f0fe', border = '#c5d8f9', children }: {
  color?: string; bg?: string; border?: string; children: React.ReactNode;
}) {
  return (
    <div style={{
      backgroundColor: bg, border: `1px solid ${border}`, color,
      padding: '8px 12px', borderRadius: '2px 12px 12px 12px',
      fontSize: 13, maxWidth: '78%', whiteSpace: 'pre-wrap', lineHeight: 1.5,
    }}>
      {children}
    </div>
  );
}

function BubbleRight({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: '#dc2626', color: 'white',
      padding: '8px 12px', borderRadius: '12px 12px 2px 12px',
      fontSize: 13, maxWidth: '75%', whiteSpace: 'pre-wrap', lineHeight: 1.5,
    }}>
      {children}
    </div>
  );
}

function AITab() {
  const [msgs, setMsgs] = useState<AIMsg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, loading]);

  const send = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const next: AIMsg[] = [...msgs, { role: 'user', content: text }];
    setMsgs(next);
    setLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMsgs([...next, {
        role: 'model',
        content: res.ok ? data.reply : `⚠️ Lỗi: ${data.error || 'Không xác định'}`,
      }]);
    } catch {
      setMsgs([...next, { role: 'model', content: '⚠️ Không thể kết nối đến AI.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`@keyframes dot-bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 6px', display: 'flex', flexDirection: 'column', gap: 10, backgroundColor: '#f8fafc' }}>
        {msgs.length === 0 && (
          <div style={{ display: 'flex', gap: 8 }}>
            <MiniAvatar color="#4285f4">AI</MiniAvatar>
            <BubbleLeft>
              Xin chào! Tôi là Trợ lý AI Thư viện TLU. Tôi có thể tóm tắt sách, đề xuất tài liệu hoặc giải đáp câu hỏi học thuật. Bạn cần hỗ trợ gì?
            </BubbleLeft>
          </div>
        )}
        {msgs.map((m, i) =>
          m.role === 'user' ? (
            <div key={i} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <BubbleRight>{m.content}</BubbleRight>
            </div>
          ) : (
            <div key={i} style={{ display: 'flex', gap: 8 }}>
              <MiniAvatar color="#4285f4">AI</MiniAvatar>
              <BubbleLeft>{m.content}</BubbleLeft>
            </div>
          )
        )}
        {loading && (
          <div style={{ display: 'flex', gap: 8 }}>
            <MiniAvatar color="#4285f4">AI</MiniAvatar>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '10px 14px', backgroundColor: '#e8f0fe', borderRadius: '2px 12px 12px 12px', border: '1px solid #c5d8f9' }}>
              {[0, 1, 2].map(j => (
                <div key={j} style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#4285f4', animation: `dot-bounce 1.2s ${j * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} style={{ borderTop: '1px solid #e5e7eb', padding: '10px 12px', display: 'flex', gap: 8, backgroundColor: 'white', flexShrink: 0 }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          placeholder="Hỏi AI về sách, tài liệu..." disabled={loading}
          style={{ flex: 1, border: '1px solid #d1d5db', borderRadius: 9999, padding: '8px 14px', fontSize: 13, outline: 'none' }}
        />
        <button type="submit" disabled={loading || !input.trim()}
          style={{ width: 38, height: 38, borderRadius: '50%', backgroundColor: '#4285f4', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (loading || !input.trim()) ? 0.5 : 1, flexShrink: 0 }}>
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        </button>
      </form>
    </>
  );
}

function LibrarianTab() {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const stompRef = useRef<Client | null>(null);
  const sessionIdRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const fetchMessages = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/chat/sessions/${id}/messages`, { headers: authHdr() });
      if (res.ok && mountedRef.current) setMessages(await res.json());
    } catch {}
  };

  useEffect(() => {
    mountedRef.current = true;
    setConnecting(true);
    fetch(`${API_URL}/api/chat/start`, { method: 'POST', headers: authHdr() })
      .then(r => r.json())
      .then(data => {
        if (!mountedRef.current) return;
        setSession(data);
        sessionIdRef.current = data.id;
        fetchMessages(data.id);

        const socket = new SockJS(`${API_URL}/ws`);
        const client = new Client({
          webSocketFactory: () => socket,
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });
        client.onConnect = () => {
          client.subscribe(`/topic/chat/${data.id}`, (msg: IMessage) => {
            if (!msg.body || !mountedRef.current) return;
            const newMsg: ChatMessage = JSON.parse(msg.body);
            setMessages(prev => (newMsg.id && prev.some(m => m.id === newMsg.id)) ? prev : [...prev, newMsg]);
          });
        };
        client.activate();
        stompRef.current = client;
      })
      .catch(console.error)
      .finally(() => { if (mountedRef.current) setConnecting(false); });

    return () => {
      mountedRef.current = false;
      stompRef.current?.deactivate();
      stompRef.current = null;
    };
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      if (sessionIdRef.current && mountedRef.current) fetchMessages(sessionIdRef.current);
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || sending || !session) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    try {
      await fetch(`${API_URL}/api/chat/sessions/${session.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHdr() },
        body: JSON.stringify({ content: text }),
      });
      fetchMessages(session.id);
    } catch {}
    finally { setSending(false); }
  };

  return (
    <>
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 6px', display: 'flex', flexDirection: 'column', gap: 10, backgroundColor: '#f8fafc' }}>
        {connecting && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20, color: '#6b7280', fontSize: 13, gap: 8 }}>
            <Loader2 size={16} className="animate-spin" /> Đang kết nối...
          </div>
        )}
        {messages.length === 0 && !connecting && (
          <div style={{ display: 'flex', gap: 8 }}>
            <MiniAvatar color="#2563eb"><User size={14} /></MiniAvatar>
            <BubbleLeft color="#1e3a5f" bg="#eff6ff" border="#bfdbfe">
              Xin chào! Tôi là Thủ thư TLU. Hãy đặt câu hỏi, tôi sẽ hỗ trợ bạn ngay!
            </BubbleLeft>
          </div>
        )}
        {messages.map((msg, idx) => {
          const isAi = msg.aiMessage || msg.isAiMessage || false;
          let currentUserId: number | null = null;
          try {
            const stored = localStorage.getItem('lms_user');
            if (stored) {
              const parsed = JSON.parse(stored);
              currentUserId = parsed?.accountId ?? parsed?.id ?? null;
            }
          } catch {}
          const isMe = !isAi && msg.sender != null && currentUserId != null && msg.sender.id === currentUserId;

          if (isMe) return (
            <div key={msg.id ?? idx} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: 6 }}>
              <div style={{ fontSize: 10, color: '#9ca3af' }}>Bạn</div>
              <BubbleRight>{msg.content}</BubbleRight>
            </div>
          );

          if (isAi) return (
            <div key={msg.id ?? idx} style={{ display: 'flex', gap: 8 }}>
              <MiniAvatar color="#7c3aed"><Bot size={14} /></MiniAvatar>
              <div>
                <div style={{ fontSize: 10, color: '#7c3aed', fontWeight: 600, marginBottom: 3 }}>Trợ lý AI</div>
                <BubbleLeft color="#4c1d95" bg="#f3e8ff" border="#e9d5ff">{msg.content}</BubbleLeft>
              </div>
            </div>
          );

          const displayName = msg.sender?.fullName ?? msg.senderName ?? 'Thủ thư';
          return (
            <div key={msg.id ?? idx} style={{ display: 'flex', gap: 8 }}>
              <MiniAvatar color="#2563eb"><User size={14} /></MiniAvatar>
              <div>
                <div style={{ fontSize: 10, color: '#2563eb', fontWeight: 600, marginBottom: 3 }}>{displayName}</div>
                <BubbleLeft color="#1e3a5f" bg="#eff6ff" border="#bfdbfe">{msg.content}</BubbleLeft>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} style={{ borderTop: '1px solid #e5e7eb', padding: '10px 12px', display: 'flex', gap: 8, backgroundColor: 'white', flexShrink: 0 }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          placeholder="Nhập tin nhắn cho Thủ thư..." disabled={sending || connecting}
          style={{ flex: 1, border: '1px solid #d1d5db', borderRadius: 9999, padding: '8px 14px', fontSize: 13, outline: 'none' }}
        />
        <button type="submit" disabled={sending || !input.trim() || connecting}
          style={{ width: 38, height: 38, borderRadius: '50%', backgroundColor: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (sending || !input.trim() || connecting) ? 0.5 : 1, flexShrink: 0 }}>
          {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        </button>
      </form>
    </>
  );
}

function FlappyBirdTab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef({
    birdY: CH / 2, velY: 0,
    pipes: [] as { x: number; gapY: number }[],
    score: 0, frame: 0,
    alive: false, started: false, hover: 0,
  });
  const rafRef = useRef<number | null>(null);
  const jumpRef = useRef<() => void>(() => {});

  jumpRef.current = () => {
    const g = gameRef.current;
    if (!g.alive) {
      g.birdY = CH / 2; g.velY = 0; g.pipes = [];
      g.score = 0; g.frame = 0; g.hover = 0;
      g.alive = true; g.started = true;
    }
    g.velY = JUMP_V;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tick = () => {
      const g = gameRef.current;

      if (!g.started) {
        g.birdY = CH / 2 + Math.sin(g.hover * 0.05) * 8;
        g.hover++;
      } else if (g.alive) {
        g.velY += GRAVITY;
        g.birdY += g.velY;
        g.frame++;

        if (g.frame % PIPE_INT === 0) {
          g.pipes.push({ x: CW + PIPE_W, gapY: 80 + Math.random() * (CH - 180) });
        }
        g.pipes = g.pipes.filter(p => { p.x -= PIPE_SPD; return p.x > -PIPE_W; });
        g.pipes.forEach(p => {
          if (Math.round(p.x + PIPE_SPD) === BIRD_X) g.score++;
        });

        const dead =
          g.birdY + BIRD_R >= CH - 20 ||
          g.birdY - BIRD_R <= 0 ||
          g.pipes.some(p =>
            BIRD_X + BIRD_R > p.x && BIRD_X - BIRD_R < p.x + PIPE_W &&
            (g.birdY - BIRD_R < p.gapY - GAP_H / 2 || g.birdY + BIRD_R > p.gapY + GAP_H / 2)
          );
        if (dead) g.alive = false;
      }

      ctx.fillStyle = '#dbeafe'; ctx.fillRect(0, 0, CW, CH);
      ctx.fillStyle = '#86efac'; ctx.fillRect(0, CH - 20, CW, 20);
      ctx.fillStyle = '#4ade80'; ctx.fillRect(0, CH - 20, CW, 4);
      g.pipes.forEach(p => {
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(p.x, 0, PIPE_W, p.gapY - GAP_H / 2);
        ctx.fillRect(p.x, p.gapY + GAP_H / 2, PIPE_W, CH - 20 - (p.gapY + GAP_H / 2));
        ctx.fillStyle = '#15803d';
        ctx.fillRect(p.x - 3, p.gapY - GAP_H / 2 - 10, PIPE_W + 6, 10);
        ctx.fillRect(p.x - 3, p.gapY + GAP_H / 2, PIPE_W + 6, 10);
      });
      // Bird
      const angle = Math.min(Math.max(g.velY * 3, -30), 70) * (Math.PI / 180);
      ctx.save();
      ctx.translate(BIRD_X, g.birdY);
      ctx.rotate(angle);
      ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(0, 0, BIRD_R, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.ellipse(-4, 4, 8, 5, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(5, -4, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.arc(6, -4, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.moveTo(BIRD_R, -1); ctx.lineTo(BIRD_R + 7, 1); ctx.lineTo(BIRD_R, 3); ctx.closePath(); ctx.fill();
      ctx.restore();
      // Score
      ctx.fillStyle = 'white'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(String(g.score), CW / 2, 34);
      // Overlays
      if (!g.started) {
        ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, 0, CW, CH);
        ctx.fillStyle = 'white'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('Flappy Bird', CW / 2, CH / 2 - 14);
        ctx.font = '13px sans-serif'; ctx.fillStyle = '#fbbf24';
        ctx.fillText('Nhấn Space / Click để bắt đầu', CW / 2, CH / 2 + 14);
      } else if (!g.alive) {
        ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0, 0, CW, CH);
        ctx.fillStyle = 'white'; ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('Game Over', CW / 2, CH / 2 - 22);
        ctx.font = '16px sans-serif'; ctx.fillText(`Điểm: ${g.score}`, CW / 2, CH / 2 + 8);
        ctx.font = '13px sans-serif'; ctx.fillStyle = '#fbbf24';
        ctx.fillText('Nhấn Space / Click để chơi lại', CW / 2, CH / 2 + 36);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.code === 'Space' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        jumpRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f9ff', padding: 12, gap: 8 }}>
      <canvas
        ref={canvasRef}
        width={CW}
        height={CH}
        onClick={() => jumpRef.current()}
        style={{ borderRadius: 12, border: '2px solid #93c5fd', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      />
      <div style={{ fontSize: 12, color: '#64748b' }}>Space hoặc Click để điều khiển</div>
    </div>
  );
}

// ── Main ChatBox ──────────────────────────────────────────────────────────────
export default function ChatBox() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabId>('ai');

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="Hỗ trợ trực tuyến"
        style={{
          position: 'fixed', bottom: 24, right: 24, width: 56, height: 56,
          backgroundColor: '#dc2626', color: 'white', borderRadius: '50%', border: 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)', zIndex: 9999,
        }}
      >
        <MessageCircle size={26} />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, width: 420, height: 560,
      backgroundColor: 'white', borderRadius: 16, boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
      display: 'flex', flexDirection: 'column', zIndex: 9999, border: '1px solid #e5e7eb', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(to right, #dc2626, #b91c1c)', color: 'white', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, backgroundColor: 'white', color: '#dc2626', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 11 }}>TLU</div>
          <div>
            <h3 style={{ fontWeight: 'bold', fontSize: 14, margin: 0 }}>TLU Library Assistant</h3>
            <p style={{ fontSize: 11, opacity: 0.85, margin: 0 }}>AI · Thủ thư · Mini Game</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 4 }}>
          <X size={18} />
        </button>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb', flexShrink: 0 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '8px 4px', fontSize: 12,
              fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? t.color : '#6b7280',
              backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
              borderBottom: tab === t.id ? `2.5px solid ${t.color}` : '2.5px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {tab === 'ai'   && <AITab />}
        {tab === 'chat' && <LibrarianTab />}
        {tab === 'game' && <FlappyBirdTab />}
      </div>
    </div>
  );
}