import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatBoxWrapper from '@/components/ChatBoxWrapper';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white">{children}</main>
      <ChatBoxWrapper />
      <Footer />
    </>
  );
}