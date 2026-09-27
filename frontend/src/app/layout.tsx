import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { AppShell } from '@/components/layout/app-shell';

export const metadata: Metadata = {
  title: 'Nexus HRIS - Enterprise Human Resources & Statutory Payroll Platform',
  description:
    'Sistem Informasi SDM & Penggajian Statuter Kepatuhan Pajak PMK 168/2023 TER dan BPJS Terintegrasi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="font-sans bg-canvas text-charcoal min-h-screen antialiased flex">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
