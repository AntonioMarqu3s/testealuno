import React, { useState } from "react";
import { format, addDays, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader, Search, Calendar as CalendarIcon, Filter, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { supabase } from '@/lib/supabase';
import { Payment } from './types';

// Status para seleção
const PAYMENT_STATUS = [
  { value: "all", label: "Todos" },
  { value: "completed", label: "Pago" },
  { value: "pending", label: "Pendente" },
  { value: "pending_user_creation", label: "Pendente (Sem Usuário)" },
  { value: "error_inserting", label: "Erro ao Inserir" },
  { value: "failed", label: "Falhou" }
];

export const PaymentHistorySearch: React.FC = () => {
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<Payment[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Filtros avançados
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(startOfMonth(new Date()));
  const [dateTo, setDateTo] = useState<Date | undefined>(endOfMonth(new Date()));
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [includeTemp, setIncludeTemp] = useState(true);
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Format date display
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
  };

  // Redefinir paginação
  const resetPagination = () => {
    setOffset(0);
  };

  // Ir para a próxima página
  const nextPage = () => {
    if (offset + limit < totalCount) {
      setOffset(offset + limit);
      handleSearch(offset + limit);
    }
  };

  // Ir para a página anterior  
  const prevPage = () => {
    if (offset - limit >= 0) {
      setOffset(offset - limit);
      handleSearch(offset - limit);
    }
  };

  // Handle search for user payment history
  const handleSearch = async (newOffset?: number) => {
    const currentOffset = newOffset !== undefined ? newOffset : offset;
    
    if (!searchEmail.trim() && !showAdvancedFilters) {
      toast.error("Digite um email para pesquisar ou use filtros avançados");
      return;
    }
    
    setSearching(true);
    setSearchError(null);
    setSearchPerformed(true);
    
    try {
      console.log('Buscando pagamentos com os filtros:');
      if (searchEmail) console.log('- Email:', searchEmail);
      if (dateFrom) console.log('- Data de:', format(dateFrom, 'yyyy-MM-dd'));
      if (dateTo) console.log('- Data até:', format(dateTo, 'yyyy-MM-dd'));
      console.log('- Status:', statusFilter);
      console.log('- Incluir temporários:', includeTemp);
      console.log('- Limite:', limit, 'Offset:', currentOffset);
      
      // Resultados combinados
      let combinedResults: Payment[] = [];
      let totalItems = 0;
      let userId: string | null = null;
      
      // Se tiver email, buscar o ID do usuário
      if (searchEmail.trim()) {
        // Busca user_id diretamente na tabela de usuários
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', searchEmail)
          .single();
          
        if (!userError && userData) {
          userId = userData.id;
          console.log('ID do usuário encontrado em users:', userId);
        } else {
          console.log('Usuário não encontrado na tabela users, tentando auth.users');
          
          // Tenta buscar na tabela auth.users (segunda opção)
          const { data: authUserData, error: authUserError } = await supabase
            .from('auth.users')
            .select('id')
            .eq('email', searchEmail)
            .single();
            
          if (!authUserError && authUserData) {
            userId = authUserData.id;
            console.log('ID do usuário encontrado em auth.users:', userId);
          } else {
            console.log('Email não encontrado em nenhuma tabela de usuários:', searchEmail);
          }
        }
      }
      
      // Verificar se as tabelas existem e têm dados
      const { count: pagamentosCount, error: countError } = await supabase
        .from('pagamentos')
        .select('*', { count: 'exact', head: true });
        
      console.log('Total de registros na tabela pagamentos:', pagamentosCount);
      
      if (countError) {
        console.error('Erro ao verificar tabela pagamentos:', countError);
      }
      
      const { count: tempCount, error: tempCountError } = await supabase
        .from('temp_pagamentos')
        .select('*', { count: 'exact', head: true });
        
      console.log('Total de registros na tabela temp_pagamentos:', tempCount);
      
      if (tempCountError) {
        console.error('Erro ao verificar tabela temp_pagamentos:', tempCountError);
      }
      
      // Construir queries para pagamentos regulares
      let query = supabase
        .from('pagamentos')
        .select('*', { count: 'exact' });
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      if (dateFrom) {
        query = query.gte('data_pagamento', dateFrom.toISOString());
      }
      
      if (dateTo) {
        // Adicionar um dia ao dateTo para incluir todo o dia final
        const adjustedDateTo = addDays(dateTo, 1);
        query = query.lt('data_pagamento', adjustedDateTo.toISOString());
      }
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      // Log da consulta que será executada
      console.log('Consulta na tabela pagamentos:', 
                  'Filtros:', 
                  userId ? `user_id=${userId}` : 'sem filtro de usuário',
                  dateFrom ? `data>=${dateFrom.toISOString()}` : 'sem data inicial',
                  dateTo ? `data<${addDays(dateTo, 1).toISOString()}` : 'sem data final',
                  statusFilter !== 'all' ? `status=${statusFilter}` : 'todos os status');
      
      // Adicionar paginação
      query = query
        .order('data_pagamento', { ascending: false })
        .range(currentOffset, currentOffset + limit - 1);
      
      // Executa a query
      const { data: paymentsData, error: paymentsError, count } = await query;
      
      if (paymentsError) {
        console.error('Erro ao buscar pagamentos:', paymentsError);
        throw paymentsError;
      }
      
      // Armazenar contagem total para paginação
      if (count !== null) {
        totalItems = count;
        setTotalCount(count);
      }
      
      console.log(`Encontrados ${paymentsData?.length || 0} pagamentos regulares`);
      
      // Buscar pagamentos temporários se a opção estiver ativada
      let tempPaymentsData: any[] = [];
      
      if (includeTemp) {
        let tempQuery = supabase
          .from('temp_pagamentos')
          .select('*', { count: 'exact' });
        
        if (searchEmail.trim()) {
          tempQuery = tempQuery.eq('user_email', searchEmail);
          console.log('Filtrando temp_pagamentos por email:', searchEmail);
        }
        
        if (dateFrom) {
          tempQuery = tempQuery.gte('data_pagamento', dateFrom.toISOString());
        }
        
        if (dateTo) {
          const adjustedDateTo = addDays(dateTo, 1);
          tempQuery = tempQuery.lt('data_pagamento', adjustedDateTo.toISOString());
        }
        
        if (statusFilter !== 'all') {
          tempQuery = tempQuery.eq('status', statusFilter);
        }
        
        // Log da consulta que será executada em temp_pagamentos
        console.log('Consulta na tabela temp_pagamentos:', 
                    'Filtros:', 
                    searchEmail ? `user_email=${searchEmail}` : 'sem filtro de email',
                    dateFrom ? `data>=${dateFrom.toISOString()}` : 'sem data inicial',
                    dateTo ? `data<${addDays(dateTo, 1).toISOString()}` : 'sem data final',
                    statusFilter !== 'all' ? `status=${statusFilter}` : 'todos os status');
        
        tempQuery = tempQuery
          .order('data_pagamento', { ascending: false })
          .range(currentOffset, currentOffset + limit - 1);
        
        const { data: tempData, error: tempError, count: tempCount } = await tempQuery;
        
        if (!tempError && tempData) {
          tempPaymentsData = tempData;
          console.log(`Encontrados ${tempData.length} pagamentos temporários`);
          
          // Atualizar contagem total se não tivermos um ID de usuário específico
          if (!userId && tempCount !== null) {
            totalItems += tempCount;
            setTotalCount(totalItems);
          }
        } else if (tempError) {
          console.error('Erro ao buscar pagamentos temporários:', tempError);
        }
      }
      
      // Se não há pagamentos, mas precisamos verificar se as tabelas existem
      if ((!paymentsData || paymentsData.length === 0) && 
          (!tempPaymentsData || tempPaymentsData.length === 0)) {
            
        // Se estamos procurando com email e não encontramos o usuário
        if (searchEmail.trim() && !userId) {
          setSearchResults([]);
          toast.info(`Nenhum usuário encontrado com o email: ${searchEmail}`);
          setSearching(false);
          return;
        }
        
        // Se definimos muitos filtros, sugerir relaxar os critérios
        if (dateFrom && dateTo && statusFilter !== 'all') {
          toast.info("Tente relaxar os critérios de filtro para obter resultados");
      } else {
          toast.info("Nenhum histórico de pagamento encontrado com os filtros aplicados");
        }
        
        setSearchResults([]);
        setSearching(false);
        return;
      }
      
      // Combinar IDs de planos de ambas as tabelas
      const allPlanoIds = [
        ...(paymentsData?.map(p => p.plano_id) || []),
        ...(tempPaymentsData?.map(p => p.plano_id) || [])
      ].filter(id => id !== null && id !== undefined);
      
      // Busca os nomes dos planos, apenas se tivermos IDs de planos
      let planosMap: Record<number, string> = {};
      
      if (allPlanoIds.length > 0) {
        const { data: planosData, error: planosError } = await supabase
          .from('plans')
          .select('id, name')
          .in('id', allPlanoIds);
          
        if (planosError) {
          console.error('Erro ao buscar planos:', planosError);
        }
        
        // Criar mapa de planos
        if (planosData) {
          planosData.forEach(plano => {
            planosMap[plano.id] = plano.name;
          });
        }
      }
      
      // Formatar pagamentos regulares
      if (paymentsData && paymentsData.length > 0) {
        const formatted = paymentsData.map(payment => ({
          id: payment.id,
          user_id: payment.user_id,
          email: searchEmail || payment.email || "Email não especificado",
          plano_id: payment.plano_id,
          plano_nome: payment.plano_id ? (planosMap[payment.plano_id] || 'Plano não encontrado') : 'Sem plano',
          valor: payment.valor,
          data_pagamento: payment.data_pagamento,
          data_expiracao: payment.data_expiracao,
          status: payment.status,
          is_temp: false
        }));
        
        combinedResults = [...combinedResults, ...formatted];
      }
      
      // Formatar pagamentos temporários
      if (tempPaymentsData && tempPaymentsData.length > 0) {
        const formattedTemp = tempPaymentsData.map(payment => ({
          id: payment.id,
          user_id: payment.user_id || 'N/A',
          email: payment.user_email || searchEmail || "Email não especificado",
          plano_id: payment.plano_id,
          plano_nome: payment.plano_id ? (planosMap[payment.plano_id] || 'Plano não encontrado') : 'Sem plano',
          valor: payment.valor,
          data_pagamento: payment.data_pagamento,
          data_expiracao: payment.data_expiracao || null,
          status: payment.status,
          is_temp: true,
          notes: payment.notes
        }));
        
        combinedResults = [...combinedResults, ...formattedTemp];
      }
      
      // Ordenar resultados por data (mais recente primeiro)
      combinedResults.sort((a, b) => {
        const dateA = new Date(a.data_pagamento).getTime();
        const dateB = new Date(b.data_pagamento).getTime();
        return dateB - dateA;
      });
      
      setSearchResults(combinedResults);
      
      if (combinedResults.length > 0) {
        toast.success(`${combinedResults.length} registros encontrados`);
      }
    } catch (error) {
      console.error("Erro ao buscar histórico de pagamento:", error);
      setSearchError("Erro ao buscar histórico de pagamento");
      setSearchResults([]);
      toast.error("Erro ao buscar histórico de pagamento");
    } finally {
      setSearching(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Pesquisar Histórico de Pagamentos</CardTitle>
        <CardDescription>
          Busque o histórico de pagamentos por email ou utilizando filtros avançados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-[240px]">
              <label className="text-sm font-medium mb-1 block">Email do Usuário</label>
            <Input
              placeholder="Digite o email do usuário"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
            />
          </div>
            
            <Button 
              variant="outline" 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="mb-px"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showAdvancedFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
            </Button>
            
            <Button onClick={() => { resetPagination(); handleSearch(); }} disabled={searching} className="flex gap-2 items-center mb-px">
            {searching ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Buscando...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Buscar</span>
              </>
            )}
          </Button>
            
            <Button
              variant="secondary"
              onClick={() => {
                // Limpar todos os filtros para uma busca completa
                setSearchEmail("");
                setDateFrom(undefined);
                setDateTo(undefined);
                setStatusFilter("all");
                setIncludeTemp(true);
                resetPagination();
                // Executar a busca sem filtros
                setTimeout(() => handleSearch(), 100);
              }}
              disabled={searching}
              className="mb-px"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Busca Completa
            </Button>
          </div>
          
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border rounded-md p-4 bg-muted/30">
              <div className="space-y-1">
                <label className="text-sm font-medium">Período de</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: ptBR }) : <span>Sem data inicial</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium">Período até</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: ptBR }) : <span>Sem data final</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium">Status do Pagamento</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_STATUS.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="includeTemp" 
                  checked={includeTemp} 
                  onCheckedChange={(checked) => setIncludeTemp(checked as boolean)} 
                />
                <label
                  htmlFor="includeTemp"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Incluir pagamentos temporários
                </label>
              </div>
                
              <div className="space-y-1">
                <label className="text-sm font-medium">Itens por página</label>
                <Select value={limit.toString()} onValueChange={(val) => setLimit(parseInt(val))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Limite" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
        </div>
                
              <div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setDateFrom(undefined);
                    setDateTo(undefined);
                    setStatusFilter("all");
                    setIncludeTemp(true);
                    setLimit(20);
                    resetPagination();
                  }}
                  className="mt-6 w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              </div>
            </div>
          )}
        
        {searchError && (
          <Alert className="mb-4 bg-red-50 text-red-800 border-red-200">
            <AlertDescription>{searchError}</AlertDescription>
          </Alert>
        )}
        
        {searchPerformed && !searchError && (
            <div className="bg-muted rounded-md p-4 mb-2">
              <div className="flex justify-between items-center">
            <p className="font-medium">
              {searchResults.length === 0
                    ? "Nenhum registro de pagamento encontrado"
                : `${searchResults.length} ${searchResults.length === 1 ? 'registro encontrado' : 'registros encontrados'}`}
                  {totalCount > 0 ? ` (Total: ${totalCount})` : ''}
                </p>
                
                {/* Paginação básica */}
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevPage}
                    disabled={offset === 0 || searching}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextPage}
                    disabled={offset + limit >= totalCount || searching}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
              
              {/* Informações sobre os filtros aplicados */}
              {searchResults.length === 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>Filtros aplicados:</p>
                  <ul className="list-disc list-inside mt-1">
                    {searchEmail && <li>Email: {searchEmail}</li>}
                    {dateFrom && <li>Data inicial: {format(dateFrom, "dd/MM/yyyy", { locale: ptBR })}</li>}
                    {dateTo && <li>Data final: {format(dateTo, "dd/MM/yyyy", { locale: ptBR })}</li>}
                    {statusFilter !== 'all' && (
                      <li>Status: {PAYMENT_STATUS.find(s => s.value === statusFilter)?.label || statusFilter}</li>
                    )}
                    <li>Incluindo pagamentos temporários: {includeTemp ? 'Sim' : 'Não'}</li>
                  </ul>
                  <p className="mt-2">
                    Tente modificar ou remover alguns filtros para obter resultados, 
                    ou use o botão "Busca Completa" para ver todos os pagamentos.
                  </p>
                </div>
              )}
          </div>
        )}
        
        {searchResults.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                  <TableHead>Email</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Expiração</TableHead>
                <TableHead>Status</TableHead>
                  <TableHead>Tipo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {searchResults.map((payment) => (
                  <TableRow key={payment.id} className={payment.is_temp ? "bg-amber-50" : ""}>
                    <TableCell>{formatDate(payment.data_pagamento)}</TableCell>
                    <TableCell>{payment.email}</TableCell>
                    <TableCell>{payment.plano_nome}</TableCell>
                    <TableCell>R$ {payment.valor.toFixed(2)}</TableCell>
                    <TableCell>{formatDate(payment.data_expiracao)}</TableCell>
                  <TableCell>
                      <Badge variant={
                        payment.status === 'completed' ? 'success' : 
                        payment.status === 'pending' ? 'secondary' :
                        payment.status === 'pending_user_creation' ? 'warning' :
                        payment.status === 'error_inserting' ? 'destructive' :
                        'destructive'
                      }>
                      {payment.status === 'completed' ? 'Pago' : 
                         payment.status === 'pending' ? 'Pendente' :
                         payment.status === 'pending_user_creation' ? 'Pend. Usuário' :
                         payment.status === 'error_inserting' ? 'Erro' :
                         'Falhou'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={payment.is_temp ? "outline" : "default"}>
                        {payment.is_temp ? "Temporário" : "Regular"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/30 border-t px-6 py-4">
        <div className="flex flex-col w-full">
        <p className="text-sm text-muted-foreground">
            Os registros incluem pagamentos regulares e temporários (em amarelo).
          </p>
          {searchResults.some(p => p.is_temp) && (
            <p className="text-sm text-amber-600 mt-1">
              Pagamentos temporários precisam ser processados manualmente pelo administrador.
            </p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
