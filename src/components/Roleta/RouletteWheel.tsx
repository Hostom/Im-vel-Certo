import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Play, CheckCircle2 } from "lucide-react";

interface Captador {
  id: string;
  nome: string;
  regiao: string;
}

interface RouletteWheelProps {
  captadores: Captador[];
  demanda: {
    id: string;
    codigo_demanda: string;
    cliente_interessado: string;
    regiao_desejada: string;
  };
  onAssign: (captadorId: string) => Promise<void>;
}

export const RouletteWheel = ({ captadores, demanda, onAssign }: RouletteWheelProps) => {
  const [spinning, setSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [assigned, setAssigned] = useState(false);

  const handleSpin = () => {
    if (captadores.length === 0 || spinning || assigned) return;

    setSpinning(true);
    setSelectedIndex(null);

    let currentIndex = 0;
    const spinInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % captadores.length;
      setSelectedIndex(currentIndex);
    }, 100);

    setTimeout(() => {
      clearInterval(spinInterval);
      const finalIndex = Math.floor(Math.random() * captadores.length);
      setSelectedIndex(finalIndex);
      setSpinning(false);
    }, 3000);
  };

  const handleConfirm = async () => {
    if (selectedIndex === null) return;
    
    try {
      await onAssign(captadores[selectedIndex].id);
      setAssigned(true);
    } catch (error) {
      console.error("Erro ao atribuir missão:", error);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Roleta de Distribuição
        </CardTitle>
        <CardDescription>
          Demanda: <strong>{demanda.codigo_demanda}</strong> - {demanda.cliente_interessado}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gradient-to-br from-primary/5 to-success/5 rounded-lg p-6">
          <div className="space-y-3">
            {captadores.length === 0 ? (
              <p className="text-center text-muted-foreground">
                Nenhum captador disponível para esta região
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {captadores.map((captador, index) => (
                    <div
                      key={captador.id}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedIndex === index
                          ? "border-primary bg-primary/10 scale-105"
                          : "border-border bg-card"
                      }`}
                    >
                      <p className="font-medium truncate">{captador.nome}</p>
                      <p className="text-xs text-muted-foreground">{captador.regiao}</p>
                    </div>
                  ))}
                </div>

                {selectedIndex !== null && !spinning && !assigned && (
                  <div className="mt-4 p-4 bg-success-light rounded-lg">
                    <p className="text-sm font-medium text-center">
                      Selecionado: <strong>{captadores[selectedIndex].nome}</strong>
                    </p>
                  </div>
                )}

                {assigned && selectedIndex !== null && (
                  <div className="mt-4 p-4 bg-success rounded-lg flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success-foreground" />
                    <p className="text-sm font-medium text-success-foreground">
                      Missão atribuída a {captadores[selectedIndex].nome}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {!assigned && (
            <>
              <Button
                onClick={handleSpin}
                disabled={spinning || captadores.length === 0 || selectedIndex !== null}
                className="flex-1 bg-gradient-primary"
              >
                {spinning ? (
                  <>
                    <Play className="h-4 w-4 mr-2 animate-spin" />
                    Sorteando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Girar Roleta
                  </>
                )}
              </Button>
              {selectedIndex !== null && !spinning && (
                <Button
                  onClick={handleConfirm}
                  variant="default"
                  className="flex-1 bg-gradient-success"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirmar
                </Button>
              )}
            </>
          )}
        </div>

        <div className="text-xs text-muted-foreground text-center">
          <Badge variant="outline">{captadores.length} captadores disponíveis</Badge>
        </div>
      </CardContent>
    </Card>
  );
};
