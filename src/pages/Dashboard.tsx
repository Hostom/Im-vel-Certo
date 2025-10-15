import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MetricsCards } from "@/components/Dashboard/MetricsCards";
import { MissaoCard } from "@/components/Missoes/MissaoCard";
import { RouletteWheel } from "@/components/Roleta/RouletteWheel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Plus, BarChart3, UserCog } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [usuario, setUsuario] = useState<any>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [missoes, setMissoes] = useState<any[]>([]);
  const [demandasPendentes, setDemandasPendentes] = useState<any[]>([]);
  const [captadores, setCaptadores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDemanda, setSelectedDemanda] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/");
      return;
    }
    setUser(user);

    const { data: usuarioData } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", user.id)
      .single();

    setUsuario(usuarioData);

    // Load user roles
    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    setUserRoles(rolesData?.map(r => r.role) || []);
  };

  const loadData = async () => {
    try {
      const { data: metricsData } = await supabase
        .from("vw_metricas_dashboard")
        .select("*")
        .single();

      setMetrics(metricsData);

      const { data: missoesData } = await supabase
        .from("missoes")
        .select(`
          *,
          demandas(*),
          usuarios(nome)
        `)
        .in("status", ["em_andamento", "imovel_encontrado"])
        .order("data_limite", { ascending: true })
        .limit(10);

      setMissoes(missoesData || []);

      const { data: demandasData } = await supabase
        .from("demandas")
        .select("*")
        .eq("status", "pendente")
        .gte("valor_aluguel_min", 8000)
        .order("created_at", { ascending: false });

      setDemandasPendentes(demandasData || []);

      const { data: captadoresData } = await supabase
        .from("usuarios")
        .select("*")
        .eq("tipo", "captador")
        .eq("ativo", true);

      setCaptadores(captadoresData || []);

    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignMission = async (demandaId: string, captadorId: string) => {
    try {
      const { error: missaoError } = await supabase
        .from("missoes")
        .insert({
          demanda_id: demandaId,
          captador_id: captadorId,
          criado_por_id: user?.id,
          status: "em_andamento",
          prazo_horas: 48,
        });

      if (missaoError) throw missaoError;

      const { error: demandaError } = await supabase
        .from("demandas")
        .update({ status: "em_captacao" })
        .eq("id", demandaId);

      if (demandaError) throw demandaError;

      toast({
        title: "Missão criada!",
        description: "A demanda foi atribuída com sucesso",
      });

      setSelectedDemanda(null);
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Sistema de Captação</h1>
              <p className="text-sm text-muted-foreground">
                Olá, {usuario?.nome} ({usuario?.tipo})
              </p>
            </div>
            <div className="flex gap-2">
              {(userRoles.includes("admin") || userRoles.includes("diretor")) && (
                <Button onClick={() => navigate("/admin/usuarios")} variant="outline" size="sm">
                  <UserCog className="h-4 w-4 mr-2" />
                  Gerenciar Usuários
                </Button>
              )}
              <Button onClick={handleLogout} variant="ghost" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {metrics && <MetricsCards metrics={metrics} />}

        {(usuario?.tipo === "admin" || usuario?.tipo === "gerente_regional") && demandasPendentes.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Demandas Pendentes (≥ R$ 8.000)
                  </CardTitle>
                  <CardDescription>
                    {demandasPendentes.length} demandas aguardando distribuição
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {demandasPendentes.slice(0, 5).map((demanda) => (
                  <div
                    key={demanda.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{demanda.codigo_demanda}</p>
                      <p className="text-sm text-muted-foreground">
                        {demanda.cliente_interessado} - {demanda.regiao_desejada}
                      </p>
                      <p className="text-xs text-muted-foreground">{demanda.faixa_aluguel}</p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          onClick={() => setSelectedDemanda(demanda)}
                          className="bg-gradient-primary"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Atribuir
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Atribuir Demanda via Roleta</DialogTitle>
                        </DialogHeader>
                        {selectedDemanda && (
                          <RouletteWheel
                            captadores={captadores.filter(
                              c => c.regiao === selectedDemanda.regiao_demanda || c.regiao === "Geral"
                            )}
                            demanda={selectedDemanda}
                            onAssign={(captadorId) => handleAssignMission(selectedDemanda.id, captadorId)}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Missões Ativas</CardTitle>
            <CardDescription>
              {missoes.length} missões em andamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {missoes.map((missao) => (
                <MissaoCard key={missao.id} missao={missao} />
              ))}
            </div>
            {missoes.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma missão ativa no momento
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
