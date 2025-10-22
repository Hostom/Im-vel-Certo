import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/api";
import { canCreateDemanda, canManageUsers, canAssignMissions } from "@/lib/permissions";
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
  console.log("Usuário carregado:", usuario);
  console.log("Funções (roles):", userRoles);
}, [usuario, userRoles]);

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = async () => {
    const { user, isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated || !user) {
      navigate("/");
      return;
    }
    setUser(user);
    setUsuario(user);
    setUserRoles([user.tipo]);
    console.log("🧭 Debug → usuarioData:", user);
    console.log("🧭 Debug → userRoles:", [user.tipo]);  
  };

// Determinar se o usuário pode criar demandas
const podeCriarDemanda = usuario ? canCreateDemanda(usuario.tipo) : false;
const podeGerenciarUsuarios = usuario ? canManageUsers(usuario.tipo) : false;
const podeAtribuirMissoes = usuario ? canAssignMissions(usuario.tipo) : false;


  const loadData = async () => {
    try {
      // TODO: Implementar endpoints no backend para métricas, missões, demandas e captadores
      // Por enquanto, deixar vazio para não quebrar
      setMetrics(null);
      setMissoes([]);
      setDemandasPendentes([]);
      setCaptadores([]);

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
      // TODO: Implementar endpoint no backend para criar missões
      toast({
        title: "Funcionalidade em desenvolvimento",
        description: "Criação de missões será implementada em breve",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    const { logout } = useAuthStore.getState();
    await logout();
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
            {podeCriarDemanda && (
              <Button onClick={() => navigate("/demandas/nova")} variant="default" size="sm">
                  Criar Demanda
                </Button>
               )}
              {podeGerenciarUsuarios && (
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
  {podeCriarDemanda && (
    <div className="flex justify-end mb-4">
      <Button
        onClick={() => navigate("/demandas/nova")}
        className="bg-gradient-primary"
      >
        <Plus className="h-4 w-4 mr-1" /> Criar Demanda
      </Button>
    </div>
  )}

        {metrics && <MetricsCards metrics={metrics} />}

        {(userRoles.includes("admin") || userRoles.includes("gerente_regional") || userRoles.includes("diretor")) && demandasPendentes.length > 0 && (
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

