import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-12 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
      </Link>
      
      <h1 className="text-4xl font-serif mb-8">Privacy Policy</h1>
      
      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-serif text-foreground mb-4">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, including your email address when you create an account and the media (videos, images, audio) you upload to create Memories.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-foreground mb-4">2. How We Use Your Information</h2>
          <p>
            We use your information to provide and improve our services, communicate with you about your account, and ensure the security of our platform. Your uploaded media is only made accessible to those who have the unique link or access to the physical capsule.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-foreground mb-4">3. Data Storage</h2>
          <p>
            We use third-party providers, such as Supabase, to store your data and media. These providers have their own security measures and privacy policies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-foreground mb-4">4. Sharing of Information</h2>
          <p>
            We do not sell your personal information to third parties. We may share information only when required by law or to protect our rights and the safety of our users.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-foreground mb-4">5. Your Rights</h2>
          <p>
            You have the right to access, update, or delete your personal information at any time. Please contact us if you wish to exercise these rights.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-foreground mb-4">6. Security</h2>
          <p>
            We take reasonable measures to protect your information from unauthorized access or disclosure, but no method of transmission over the internet is 100% secure.
          </p>
        </section>

        <p className="text-xs pt-8">Last updated: January 24, 2026</p>
      </div>
    </div>
  );
}
