import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Use | TrustBuild",
  description: "Terms of Use for TrustBuild platform",
};

export default function TermsPage() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <Link
        href="/"
        className="inline-flex items-center text-primary hover:text-primary/80 mb-8 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Home
      </Link>
      
      <h1 className="text-3xl font-bold mb-6">TrustBuild – Terms of Use</h1>
      <p className="text-sm text-muted-foreground mb-8">Effective Date: April 15, 2023</p>
      
      <p className="mb-6">Welcome to TrustBuild. By accessing or using our platform, you agree to be bound by these Terms of Use. Please read them carefully.</p>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Use of the Platform</h2>
          <p>You must be at least 18 years old to use TrustBuild. By using our services, you represent that you meet this requirement.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">2. Account Registration</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">3. Services Provided</h2>
          <p>TrustBuild connects customers with contractors for renovation and construction projects. TrustBuild is not a party to any agreement between customers and contractors.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">4. Payments</h2>
          <p>Contractors are required to subscribe and/or purchase credits to apply for jobs. Customers use the platform free of charge to request jobs.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">5. Contractor Responsibilities</h2>
          <p>Contractors must provide accurate information and honor agreements with customers.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">6. Customer Responsibilities</h2>
          <p>Customers must provide clear job descriptions and communicate honestly with contractors.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">7. Prohibited Activities</h2>
          <p>You agree not to misuse the platform, including but not limited to spamming, fraud, harassment, or violating any applicable laws.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">8. Intellectual Property</h2>
          <p>All content, trademarks, and materials on TrustBuild are owned by TrustBuild or its licensors and are protected by law.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">9. Limitation of Liability</h2>
          <p>TrustBuild is not liable for any disputes, losses, or damages resulting from interactions between customers and contractors.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">10. Changes to the Terms</h2>
          <p>We may update these Terms from time to time. Continued use of the platform means you accept the updated Terms.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">11. Contact</h2>
          <p>If you have any questions, please contact us at: <a href="mailto:support@trustbuild.com" className="text-primary hover:underline">support@trustbuild.com</a></p>
        </section>
      </div>
    </div>
  );
} 