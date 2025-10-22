import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/api";
import { canManageUsers } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Shield, UserCog } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type UserRole = "captador" | "gerente_regional" | "admin" | "diretor";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo: string;
  regiao: string;
  ativo: boolean;
  created_at: string;
}

interface UserRoleAssignment {
  role: UserRole;
}

const AVAILABLE_ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: "captador", label: "Captador(a)", description: "Busca imóveis para demandas atribuídas" },
  { value: "gerente_regional", label: "Gerente Regional", description: "Gerencia equipe e atribui demandas" },
  { value: "admin", label: "Administrador", description: "Acesso total ao sistema" },
  { value: "diretor", label: "Diretor", description: "Visão estratégica e aprovações" },
];

export default function AdminUsuarios() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, UserRole[]>>({});
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { user, isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated || !user) {
      navigate("/");
      return;
    }

    // Check if user can manage users
    const isAdmin = canManageUsers(user.tipo);
    
    if (!isAdmin) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    setCurrentUser(user);
    loadUsuarios();
  };

  const loadUsuarios = async () => {
    try {
      // TODO: Implementar endpoint no backend para listar usuários
      // Por enquanto, deixar vazio para não quebrar
      setUsuarios([]);
      setUserRoles({});
    } catch (error: any) {
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (userId: string, role: UserRole, isChecked: boolean) => {
    setSavingUserId(userId);
    try {
      // TODO: Implementar endpoints no backend para gerenciar roles
      toast({
        title: "Funcionalidade em desenvolvimento",
        description: "Gerenciamento de roles será implementado em breve",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingUserId(null);
    }
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
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/dashboard")} variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <UserCog className="h-6 w-6 text-primary" />
                Gerenciamento de Usuários
              </h1>
              <p className="text-sm text-muted-foreground">
                Gerencie papéis e permissões dos usuários
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Usuários do Sistema
            </CardTitle>
            <CardDescription>
              {usuarios.length} usuários cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {usuarios.map((usuario) => (
                <div
                  key={usuario.id}
                  className="p-4 border rounded-lg space-y-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{usuario.nome}</h3>
                        {!usuario.ativo && (
                          <Badge variant="outline" className="text-xs">
                            Inativo
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{usuario.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Região: {usuario.regiao} • Tipo: {usuario.tipo}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {(userRoles[usuario.id] || []).map((role) => (
                        <Badge key={role} variant="secondary">
                          {AVAILABLE_ROLES.find(r => r.value === role)?.label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <Label className="text-sm font-medium mb-3 block">
                      Papéis e Permissões
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {AVAILABLE_ROLES.map((roleOption) => {
                        const hasRole = (userRoles[usuario.id] || []).includes(roleOption.value);
                        const isSaving = savingUserId === usuario.id;
                        
                        return (
                          <div
                            key={roleOption.value}
                            className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                          >
                            <Checkbox
                              id={`${usuario.id}-${roleOption.value}`}
                              checked={hasRole}
                              onCheckedChange={(checked) => 
                                handleRoleToggle(usuario.id, roleOption.value, checked as boolean)
                              }
                              disabled={isSaving}
                            />
                            <div className="grid gap-1.5 leading-none">
                              <label
                                htmlFor={`${usuario.id}-${roleOption.value}`}
                                className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {roleOption.label}
                              </label>
                              <p className="text-xs text-muted-foreground">
                                {roleOption.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}