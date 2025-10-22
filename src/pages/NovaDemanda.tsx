import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/api";

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

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { user, isAuthenticated } = useAuthStore.getState();

      if (!isAuthenticated || !user) {
        toast.error("Sessão expirada. Faça login novamente.");
        navigate("/");
        return;
      }

      // Criar demanda via API do backend
      const response = await api.post('/demandas', {
        codigo_demanda: formData.codigo_demanda,
        consultor_locacao: formData.consultor_locacao,
        cliente_interessado: formData.cliente_interessado,
        contato: formData.contato,
        tipo_imovel: formData.tipo_imovel,
        regiao_desejada: formData.regiao_desejada,
        regiao_demanda: formData.regiao_desejada || "Geral",
        faixa_aluguel: formData.faixa_aluguel,
        caracteristicas_desejadas: formData.caracteristicas_desejadas || null,
        prazo_necessidade: formData.prazo_necessidade,
        observacoes: formData.observacoes || null,
      });

      toast.success("Demanda criada com sucesso!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Erro ao criar demanda:", error);
      toast.error(`Erro: ${error?.response?.data?.error || "não foi possível criar a demanda"}`);
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
            <Select
              name="consultor_locacao"
              value={formData.consultor_locacao}
              onValueChange={(value) => handleSelectChange("consultor_locacao", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o consultor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Israel">Israel</SelectItem>
                <SelectItem value="Matheus">Matheus</SelectItem>
                <SelectItem value="Stephanie">Stephanie</SelectItem>
                <SelectItem value="Bruna Kleis">Bruna Kleis</SelectItem>
              </SelectContent>
            </Select>
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
          <Select
            name="tipo_imovel"
            value={formData.tipo_imovel}
            onValueChange={(value) => handleSelectChange("tipo_imovel", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de imóvel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Apartamento">Apartamento</SelectItem>
              <SelectItem value="Casa">Casa</SelectItem>
              <SelectItem value="Sala Comercial">Sala Comercial</SelectItem>
              <SelectItem value="Cobertura">Cobertura</SelectItem>
            </SelectContent>
          </Select>
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
            <Select
              name="faixa_aluguel"
              value={formData.faixa_aluguel}
              onValueChange={(value) => handleSelectChange("faixa_aluguel", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a faixa de aluguel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="de 8mil a 10mil">de 8mil a 10mil</SelectItem>
                <SelectItem value="de 10mil a 12mil">de 10mil a 12mil</SelectItem>
                <SelectItem value="de 12mil a 15mil">de 12mil a 15mil</SelectItem>
                <SelectItem value="de 15mil a 20mil">de 15mil a 20mil</SelectItem>
                <SelectItem value="de 20mil a 25mil">de 20mil a 25mil</SelectItem>
                <SelectItem value="de 25mil a 30mil">de 25mil a 30mil</SelectItem>
                <SelectItem value="acima de 30mil">acima de 30mil</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="prazo_necessidade">Prazo de Necessidade</Label>
          <Select
            name="prazo_necessidade"
            value={formData.prazo_necessidade}
            onValueChange={(value) => handleSelectChange("prazo_necessidade", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o prazo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Urgente">Urgente</SelectItem>
              <SelectItem value="Até 7 dias">Até 7 dias</SelectItem>
              <SelectItem value="Até 15 dias">Até 15 dias</SelectItem>
            </SelectContent>
          </Select>
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
