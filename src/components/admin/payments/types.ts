export interface Payment {
  id: string;
  user_id?: string;
  email: string;
  plano_id?: number;
  plano_nome: string;
  valor: number;
  data_pagamento: string;
  data_expiracao: string | null;
  status: string;
  is_temp?: boolean;
  notes?: string;
}
