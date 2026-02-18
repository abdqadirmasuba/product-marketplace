import AuthGuard from '@/components/auth/AuthGuard';
import ChatWidget from '@/components/chat/ChatWidget';
import Sidebar from '@/components/layout/Sidebar';
import { ToastProvider } from '@/components/ui/Toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <ToastProvider>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-x-hidden">
            {children}
             <ChatWidget />
          </main>
        </div>
      </ToastProvider>
    </AuthGuard>
  );
}
