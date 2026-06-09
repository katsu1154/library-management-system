import { MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1a233a] text-gray-400 pt-12 pb-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="space-y-4">
          <h3 className="text-red-500 font-bold uppercase tracking-widest">TLULibrary</h3>
          <p className="text-sm leading-relaxed">Hệ thống Thư viện Đại học Thăng Long - Không gian học tập hiện đại và tài nguyên phong phú.</p>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-white font-bold text-sm uppercase">Liên kết</h3>
          <ul className="text-sm space-y-2">
            {['Tra cứu tài liệu', 'Hướng dẫn sử dụng', 'Nội quy', 'Góp ý'].map(i => (
              <li key={i}><a href="#" className="hover:text-red-500">{i}</a></li>
            ))}
          </ul>
        </div>

        <div className="space-y-4 text-sm">
          <h3 className="text-white font-bold uppercase text-sm">Liên hệ</h3>
          <div className="space-y-3">
            <p className="flex gap-2"><MapPin size={16} className="text-red-600" /> Nghiêm Xuân Yêm, Hà Nội</p>
            <p className="flex gap-2"><Phone size={16} className="text-red-600" /> (024) 3858 7346</p>
            <p className="flex gap-2"><Mail size={16} className="text-red-600" /> library@tlu.edu.vn</p>
          </div>
        </div>
      </div>
      <div className="mt-12 pt-6 border-t border-white/5 text-center text-[10px] uppercase tracking-widest">
        © 2026 Thư viện Đại học Thăng Long.
      </div>
    </footer>
  );
}