import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-12 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
      </Link>
      
      <h1 className="text-4xl font-serif mb-8">Terms of Service</h1>
      
      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-serif text-foreground mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Tokiem, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-foreground mb-4">2. Description of Service</h2>
          <p>
            Tokiem provides a platform for users to create, store, and share digital memories ("Memories") anchored to physical vessels. 
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-foreground mb-4">3. User Conduct</h2>
          <p>
            You are solely responsible for the content you upload to Tokiem. You agree not to upload any content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-foreground mb-4">4. Intellectual Property</h2>
          <p>
            You retain all rights to the media you upload. By uploading content, you grant Tokiem a non-exclusive, worldwide, royalty-free license to host and store your content for the sole purpose of providing the service to you and your designated recipients.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-foreground mb-4">5. Limitation of Liability</h2>
          <p>
            Tokiem is provided "as is" without any warranties. We are not liable for any loss of data or any direct, indirect, or consequential damages resulting from your use of the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-foreground mb-4">6. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Your continued use of Tokiem after any changes constitutes acceptance of the new terms.
          </p>
        </section>

        <p className="text-xs pt-8">Last updated: January 24, 2026</p>
      </div>
    </div>
  );
}
