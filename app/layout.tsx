import './globals.css';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { SplashProvider } from '@/components/providers/splash-provider';
import { ConditionalNavigation } from '@/components/layout/conditional-navigation';
import { SiteFooter } from '@/components/layout/site-footer';
import dynamic from 'next/dynamic';
import { RouteGuard } from "@/components/auth/route-guard"

// Import ResetSplash component with no SSR to avoid hydration issues
const ResetSplash = dynamic(() => import('@/components/ResetSplash'), { ssr: false });

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'TrustBuild - Connect with Professional Contractors',
  description: 'Find trusted contractors for your construction and renovation projects',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans min-h-screen flex flex-col`} suppressHydrationWarning>
        <AuthProvider>
          <RouteGuard>
            <ThemeProvider attribute="class" defaultTheme="light">
              <SplashProvider>
                <ConditionalNavigation />
                <main className="flex-1">
                  {children}
                </main>
                <SiteFooter />
                <Toaster />
                {/* Add ResetSplash button for testing */}
                <ResetSplash />
              </SplashProvider>
            </ThemeProvider>
          </RouteGuard>
        </AuthProvider>
      </body>
    </html>
  );
}