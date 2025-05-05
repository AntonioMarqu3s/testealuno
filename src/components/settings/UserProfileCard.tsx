import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface UserProfileCardProps {
  userId: string;
}

export function UserProfileCard({ userId }: UserProfileCardProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) {
        toast.error('Erro ao buscar dados do usuário: ' + error.message);
      } else {
        setUser(data);
      }
      setLoading(false);
    }
    if (userId) fetchUser();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('users')
      .update({
        nome: user.nome,
        telefone: user.telefone,
        empresa_nome: user.empresa_nome,
        instancia_nome: user.instancia_nome,
        instancia_telefone: user.instancia_telefone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
    if (error) {
      toast.error('Erro ao salvar dados: ' + error.message);
    } else {
      toast.success('Dados atualizados com sucesso!');
    }
    setSaving(false);
  };

  if (loading || !user) return <div>Carregando...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil do Usuário</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email (Somente leitura)</Label>
            <Input 
              id="email"
              value={user.email}
              readOnly
              disabled
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input 
              id="nome"
              name="nome"
              value={user.nome || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input 
              id="telefone"
              name="telefone"
              value={user.telefone || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="empresa_nome">Empresa</Label>
            <Input 
              id="empresa_nome"
              name="empresa_nome"
              value={user.empresa_nome || ''}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instancia_nome">Nome da Instância</Label>
            <Input 
              id="instancia_nome"
              name="instancia_nome"
              value={user.instancia_nome || ''}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instancia_telefone">Telefone da Instância</Label>
            <Input 
              id="instancia_telefone"
              name="instancia_telefone"
              value={user.instancia_telefone || ''}
              onChange={handleChange}
            />
          </div>
        </div>
        <Button className="mt-4 w-full" onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </CardContent>
    </Card>
  );
}
