import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface MetricsCardsProps {
  metrics: {
    total_demandas: number;
    demandas_pendentes: number;
    demandas_em_captacao: number;
    demandas_concluidas: number;
    total_missoes: number;
    missoes_ativas: number;
    missoes_sucesso: number;
    missoes_tempo_esgotado: number;
    tempo_medio_conclusao_horas: number;
  };
}

export const MetricsCards = ({ metrics }: MetricsCardsProps) => {
  const cards = [
    {
      title: "Demandas Ativas",
      value: metrics.demandas_pendentes + metrics.demandas_em_captacao,
      subtitle: `${metrics.demandas_pendentes} pendentes`,
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Missões em Andamento",
      value: metrics.missoes_ativas,
      subtitle: "Captações ativas",
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning-light",
    },
    {
      title: "Locações Fechadas",
      value: metrics.missoes_sucesso,
      subtitle: `${((metrics.missoes_sucesso / metrics.total_missoes) * 100 || 0).toFixed(0)}% de sucesso`,
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success-light",
    },
    {
      title: "Tempo Médio",
      value: `${metrics.tempo_medio_conclusao_horas?.toFixed(1) || 0}h`,
      subtitle: "Para conclusão",
      icon: AlertCircle,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="shadow-card hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.subtitle}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
