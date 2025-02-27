import Navbar from '@/components/Navbar';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
