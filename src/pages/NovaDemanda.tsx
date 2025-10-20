import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Sessão expirada. Faça login novamente.");
        navigate("/");
        return;
      }

      // 1) Criar a demanda no Supabase
      const { data: demanda, error: demandaError } = await supabase
        .from("demandas")
        .insert({
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
          criado_por_id: user.id,
        })
        .select("*")
        .single();

      if (demandaError || !demanda) {
        throw new Error(demandaError?.message || "Falha ao inserir demanda");
      }

      // 2) Buscar captadores disponíveis para a região (ou Geral) e fazer roleta
      const { data: captadoresData, error: captadoresError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("tipo", "captador");

      if (captadoresError) {
        throw new Error(captadoresError.message);
      }

      const candidatos = (captadoresData || []).filter(
        (c) => c.regiao === demanda.regiao_demanda || c.regiao === "Geral"
      );

      if (!candidatos.length) {
        toast.warning(
          "Demanda criada, mas nenhum captador disponível na região. Atribua manualmente."
        );
        navigate("/dashboard");
        return;
      }

      const sorteadoIndex = Math.floor(Math.random() * candidatos.length);
      const captadorSelecionado = candidatos[sorteadoIndex];

      // 3) Criar missão para o captador sorteado
      const { error: missaoError } = await supabase.from("missoes").insert({
        demanda_id: demanda.id,
        captador_id: captadorSelecionado.id,
        criado_por_id: user.id,
        status: "em_andamento",
        prazo_horas: 48,
      });

      if (missaoError) {
        throw new Error(missaoError.message);
      }

      // 4) Atualizar status da demanda para em_captacao
      const { error: updateDemandaError } = await supabase
        .from("demandas")
        .update({ status: "em_captacao" })
        .eq("id", demanda.id);

      if (updateDemandaError) {
        throw new Error(updateDemandaError.message);
      }

      toast.success(
        `Demanda criada e atribuída via roleta para ${captadorSelecionado.nome}.`
      );
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Erro ao criar e atribuir demanda:", error);
      toast.error(`Erro: ${error?.message || "não foi possível criar a demanda"}`);
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
          <Label htmlFor="prazo_necessidade">Prazo de Necessidade</Label>
          <Input
            name="prazo_necessidade"
            value={formData.prazo_necessidade}
            onChange={handleChange}
            placeholder="Ex.: Urgente (15 dias), 30 dias, 60 dias"
            required
          />
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
