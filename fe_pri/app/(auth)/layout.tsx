import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      
      <div className="hidden md:flex md:w-1/2 relative bg-gray-900">
        <img 
          src="/images/kesach.jpg" 
          alt="Bookshelf" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 flex items-end p-16 bg-linear-to-t from-blue-950/90 to-transparent">
            <div className= "flex flex-col gap-2 ">
                <h1 className="text-white text-5xl font-bold leading-tight">
                    Khám phá tri thức
                </h1>
                <p className="text-white text-xl  leading-tight">
                    Truy cập hàng ngàn đầu sách và tài liệu nghiên cứu ngay hôm nay
                </p>
            </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

    </div>
  );
}