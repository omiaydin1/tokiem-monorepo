import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { CheckCircle2, AlertCircle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const Icon = variant === "destructive" ? XCircle : CheckCircle2;
        const iconColor = variant === "destructive" ? "text-destructive" : "text-primary";
        
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex gap-3">
              <div className="mt-0.5">
                <Icon className={cn("h-5 w-5 shrink-0", iconColor)} />
              </div>
              <div className="grid gap-0.5 sm:gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
