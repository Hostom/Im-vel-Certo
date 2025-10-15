import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Home, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";

interface MissaoCardProps {
  missao: {
    id: string;
    status: string;
    data_limite: string;
    demandas: {
      codigo_demanda: string;
      cliente_interessado: string;
      tipo_imovel: string;
      regiao_desejada: string;
      faixa_aluguel: string;
    };
    usuarios?: {
      nome: string;
    };
  };
  onUpdateStatus?: (id: string, newStatus: string) => void;
}

export const MissaoCard = ({ missao, onUpdateStatus }: MissaoCardProps) => {
  const [timeRemaining, setTimeRemaining] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const deadline = new Date(missao.data_limite);
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("Tempo esgotado");
        setIsUrgent(true);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeRemaining(`${hours}h ${minutes}m`);
      setIsUrgent(hours < 6);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [missao.data_limite]);

  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "urgent" }> = {
    pendente: { label: "Pendente", variant: "secondary" },
    em_andamento: { label: "Em Andamento", variant: "warning" },
    imovel_encontrado: { label: "Imóvel Encontrado", variant: "success" },
    apresentado_cliente: { label: "Apresentado ao Cliente", variant: "success" },
    locacao_fechada: { label: "Locação Fechada", variant: "success" },
    cancelada: { label: "Cancelada", variant: "urgent" },
    tempo_esgotado: { label: "Tempo Esgotado", variant: "urgent" },
  };

  const currentStatus = statusConfig[missao.status] || statusConfig.pendente;

  return (
    <Card className="shadow-card hover:shadow-lg transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">
              {missao.demandas.codigo_demanda}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{missao.demandas.cliente_interessado}</p>
          </div>
          <Badge variant={currentStatus.variant as any}>{currentStatus.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Home className="h-4 w-4" />
            <span>{missao.demandas.tipo_imovel}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{missao.demandas.regiao_desejada}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>{missao.demandas.faixa_aluguel}</span>
          </div>
          {missao.usuarios && (
            <div className="text-xs text-muted-foreground pt-1 border-t">
              Captador(a): {missao.usuarios.nome}
            </div>
          )}
        </div>

        <div className={`flex items-center justify-between p-3 rounded-lg ${
          isUrgent ? "bg-urgent-light" : "bg-muted"
        }`}>
          <div className="flex items-center gap-2">
            <Clock className={`h-4 w-4 ${isUrgent ? "text-urgent" : "text-muted-foreground"}`} />
            <span className={`text-sm font-medium ${isUrgent ? "text-urgent" : ""}`}>
              {timeRemaining}
            </span>
          </div>
          {isUrgent && (
            <Badge variant="urgent" className="text-xs">Urgente</Badge>
          )}
        </div>

        {onUpdateStatus && missao.status === "em_andamento" && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onUpdateStatus(missao.id, "imovel_encontrado")}
            >
              Imóvel Encontrado
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
