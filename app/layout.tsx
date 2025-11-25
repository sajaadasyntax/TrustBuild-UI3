'use client'

import './globals.css';
import { Poppins } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { SplashProvider } from '@/components/providers/splash-provider';
import { ConditionalNavigation } from '@/components/layout/conditional-navigation';
import { SiteFooter } from '@/components/layout/site-footer';
import { ServiceWorkerRegistration } from '@/components/notifications/ServiceWorkerRegistration';
import dynamic from 'next/dynamic';
import { RouteGuard } from "@/components/auth/route-guard"
import { usePathname } from 'next/navigation'


const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className={`${poppins.variable} font-sans min-h-screen flex flex-col`} suppressHydrationWarning>
        <AuthProvider>
          <NotificationProvider>
            <RouteGuard>
              <ThemeProvider attribute="class" defaultTheme="light">
                <SplashProvider>
                  <ServiceWorkerRegistration />
                  <ConditionalNavigation />
                  <main className="flex-1">
                    {children}
                  </main>
                  {!isAdminRoute && <SiteFooter />}
                  <Toaster />
                </SplashProvider>
              </ThemeProvider>
            </RouteGuard>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}