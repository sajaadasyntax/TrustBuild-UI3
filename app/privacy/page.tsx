import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | TrustBuild",
  description: "Privacy Policy for TrustBuild platform",
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <Link
        href="/"
        className="inline-flex items-center text-primary hover:text-primary/80 mb-8 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Home
      </Link>
      
      <h1 className="text-3xl font-bold mb-6">TrustBuild – Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Effective Date: April 15, 2023</p>
      
      <p className="mb-6">At TrustBuild, we value your privacy. This Privacy Policy explains how we collect, use, and protect your information.</p>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Personal Information:</strong> Name, Email Address, Phone Number, Address.</li>
            <li><strong>Account Information:</strong> Login credentials.</li>
            <li><strong>Transaction Information:</strong> Payments and subscription history.</li>
            <li><strong>Communications:</strong> Messages between users.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>To provide and improve our services.</li>
            <li>To facilitate job connections between customers and contractors.</li>
            <li>To communicate with you regarding your account and services.</li>
            <li>To process payments and subscriptions.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">3. Sharing of Information</h2>
          <p>We do not sell or rent your personal information. We only share information with service providers (such as payment processors) necessary to operate the platform.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">4. Data Security</h2>
          <p>We use reasonable technical and organizational measures to protect your personal information.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">5. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal information. Please contact us to make a request.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">6. Cookies</h2>
          <p>Our platform uses cookies to enhance user experience. By using TrustBuild, you consent to our use of cookies.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">7. Changes to the Policy</h2>
          <p>We may update this Privacy Policy periodically. We will notify users of significant changes.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">8. Contact</h2>
          <p>For questions regarding this Privacy Policy, please contact us at: <a href="mailto:privacy@trustbuild.com" className="text-primary hover:underline">privacy@trustbuild.com</a></p>
        </section>
      </div>
    </div>
  );
} 