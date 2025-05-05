import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UseFormReturn } from "react-hook-form";
import { CheckCircle2 } from "lucide-react";

interface PromoCodeInputProps {
  form: UseFormReturn<any>;
  promoApplied: boolean;
  setPromoApplied: (applied: boolean) => void;
  checkPromoCode: (code: string) => boolean;
}

export function PromoCodeInput({ 
  form, 
  promoApplied, 
  setPromoApplied, 
  checkPromoCode 
}: PromoCodeInputProps) {
  
  const handleApplyPromoCode = () => {
    const promoCode = form.getValues("promoCode");
    if (promoCode && checkPromoCode(promoCode)) {
      setPromoApplied(true);
      toast.success("Código promocional aplicado com sucesso!", {
        description: "Você receberá 5 dias de teste gratuito."
      });
    } else if (promoCode) {
      toast.error("Código promocional inválido");
    }
  };

  return (
    <FormField
      control={form.control}
      name="promoCode"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Código Promocional</FormLabel>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <FormControl>
                <Input 
                  {...field}
                  placeholder="Código promocional (opcional)"
                  className={promoApplied ? "border-green-500 pr-10" : ""}
                  disabled={promoApplied}
                />
              </FormControl>
              {promoApplied && (
                <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 h-5 w-5 animate-in fade-in duration-300" />
              )}
            </div>
            <Button 
              type="button" 
              variant={promoApplied ? "outline" : "secondary"}
              onClick={handleApplyPromoCode}
              disabled={!field.value || promoApplied}
              className={promoApplied ? "border-green-500 text-green-600 bg-green-50 transition-colors duration-300" : ""}
            >
              {promoApplied ? "Aplicado" : "Aplicar"}
            </Button>
          </div>
          {promoApplied && (
            <p className="text-sm text-green-600 mt-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
              Código promocional válido! 5 dias de teste gratuito.
            </p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
