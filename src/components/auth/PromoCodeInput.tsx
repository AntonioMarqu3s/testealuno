
import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UseFormReturn } from "react-hook-form";

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
            <FormControl>
              <Input 
                {...field}
                placeholder="Código promocional (opcional)"
                className={promoApplied ? "border-green-500 text-green-600" : ""}
                disabled={promoApplied}
              />
            </FormControl>
            <Button 
              type="button" 
              variant={promoApplied ? "outline" : "secondary"}
              onClick={handleApplyPromoCode}
              disabled={!field.value || promoApplied}
              className={promoApplied ? "border-green-500 text-green-600" : ""}
            >
              {promoApplied ? "Aplicado" : "Aplicar"}
            </Button>
          </div>
          {promoApplied && (
            <p className="text-sm text-green-600 mt-1">
              Código promocional válido! 5 dias de teste gratuito.
            </p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
