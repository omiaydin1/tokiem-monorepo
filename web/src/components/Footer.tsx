import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-secondary/95 backdrop-blur-md mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <Heart className="h-4 w-4 text-primary fill-primary/10 group-hover:fill-primary/20 transition-colors" />
              <span className="text-xl font-serif tracking-tight">Tokiem</span>
            </Link>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              © {currentYear} Tokiem. Anchoring memories in time.
            </p>
          </div>
          
          <div className="flex items-center gap-8">
            <Link 
              to="/terms" 
              className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <Link 
              to="/privacy" 
              className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
