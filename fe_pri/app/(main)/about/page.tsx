import Image from 'next/image';

export const metadata = {
  title: 'Giới thiệu — TLU Library',
  description: 'Thư viện Đại học Thăng Long — Trung tâm thông tin học liệu hàng đầu',
};

export default function AboutPage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-8">
        Về Thư viện TLU
      </h1>

      <div className="relative aspect-video rounded-2xl overflow-hidden mb-8 shadow-md">
        <Image
          src="/images/about.jpg"
          alt="Thư viện Đại học Thăng Long"
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
          priority
        />
      </div>

      {/* Intro */}
      <p className="text-gray-600 leading-relaxed mb-10">
        Thư viện Đại học Thăng Long (TLU Library) là trung tâm thông tin học liệu
        hàng đầu, phục vụ công tác giảng dạy, học tập và nghiên cứu khoa học của
        cán bộ, giảng viên và sinh viên nhà trường cũng như độc giả ngoài trường.
      </p>

      {/* Sứ mệnh */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-red-600 mb-3">Sứ mệnh</h2>
        <p className="text-gray-600 leading-relaxed">
          Cung cấp môi trường học tập hiện đại, nguồn tài nguyên tri thức phong phú
          và các dịch vụ hỗ trợ học thuật chuyên nghiệp, góp phần nâng cao chất
          lượng đào tạo của trường Đại học Thăng Long.
        </p>
      </section>

      {/* Cơ sở vật chất */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-red-600 mb-3">Cơ sở vật chất</h2>
        <ul className="space-y-2 text-gray-600 leading-relaxed">
          <li className="flex gap-3">
            <span className="text-red-600 mt-1.5">•</span>
            <span>Hàng ngàn đầu sách in bao gồm giáo trình, tài liệu tham khảo, luận văn, đồ án.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-red-600 mt-1.5">•</span>
            <span>Hệ thống cơ sở dữ liệu điện tử liên kết quốc tế.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-red-600 mt-1.5">•</span>
            <span>Không gian tự học yên tĩnh, phòng thảo luận nhóm hiện đại trang bị màn hình chiếu.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-red-600 mt-1.5">•</span>
            <span>Hệ thống máy tính tra cứu và wifi tốc độ cao phủ sóng toàn khu vực.</span>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-red-600 mb-3">Thời gian mở cửa</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4">
          <p className="text-gray-700 text-sm leading-relaxed">
            <strong>Thứ 2 – Thứ 6:</strong> 07:30 – 21:00
          </p>
          <p className="text-gray-700 text-sm leading-relaxed mt-1">
            <strong>Thứ 7 – Chủ nhật:</strong> 08:00 – 17:00
          </p>
          <p className="text-red-600 text-sm leading-relaxed mt-3">
            * Nghỉ các ngày Lễ, Tết theo quy định của Nhà nước.
          </p>
        </div>
      </section>
    </article>
  );
}