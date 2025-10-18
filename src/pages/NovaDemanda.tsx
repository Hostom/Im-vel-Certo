import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const NovaDemanda = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    codigo_demanda: `DEM-${Date.now()}`,
    consultor_locacao: "",
    cliente_interessado: "",
    contato: "",
    tipo_imovel: "Apartamento",
    regiao_desejada: "",
    faixa_aluguel: "",
    caracteristicas_desejadas: "",
    prazo_necessidade: "",
    observacoes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/demandas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Demanda criada com sucesso!");
        navigate("/dashboard");
      } else {
        const error = await response.json();
        toast.error("Erro ao criar demanda: " + (error.error || "Erro desconhecido"));
      }
    } catch (error) {
      console.error("Erro ao criar demanda:", error);
      toast.error("Erro ao criar demanda");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Criar Nova Demanda</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="codigo_demanda">Código da Demanda</Label>
            <Input name="codigo_demanda" value={formData.codigo_demanda} readOnly />
          </div>

          <div>
            <Label htmlFor="consultor_locacao">Consultor de Locação</Label>
            <Input
              name="consultor_locacao"
              value={formData.consultor_locacao}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="cliente_interessado">Cliente Interessado</Label>
            <Input
              name="cliente_interessado"
              value={formData.cliente_interessado}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="contato">Contato</Label>
            <Input
              name="contato"
              value={formData.contato}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="tipo_imovel">Tipo de Imóvel</Label>
          <Input
            name="tipo_imovel"
            value={formData.tipo_imovel}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="regiao_desejada">Região Desejada</Label>
            <Input
              name="regiao_desejada"
              value={formData.regiao_desejada}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="faixa_aluguel">Faixa de Aluguel</Label>
            <Input
              name="faixa_aluguel"
              value={formData.faixa_aluguel}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="caracteristicas_desejadas">Características Desejadas</Label>
          <Textarea
            name="caracteristicas_desejadas"
            value={formData.caracteristicas_desejadas}
            onChange={handleChange}
            rows={4}
            placeholder="Descreva as características desejadas do imóvel..."
          />
        </div>

        <div>
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            name="observacoes"
            value={formData.observacoes}
            onChange={handleChange}
            rows={3}
            placeholder="Informações adicionais..."
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit">Criar Demanda</Button>
        </div>
      </form>
    </div>
  );
};

export default NovaDemanda;
