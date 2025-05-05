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
  // Retorna um container vazio para remover a seção de código promocional
  return (
    <></>
  );
}
