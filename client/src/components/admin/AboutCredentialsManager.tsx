import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, Award, ChevronUp, ChevronDown, Edit, Trash2, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DragDropProvider } from "./DragDropProvider";
import { SortableItem } from "./SortableItem";

// Schema para credenciais
const credentialSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  institution: z.string().min(1, "Instituição é obrigatória"),
  year: z.string().optional(),
  isActive: z.boolean().default(true)
});

type CredentialFormData = z.infer<typeof credentialSchema>;

interface Credential {
  id: number;
  title: string;
  institution: string;
  year?: string;
  isActive: boolean;
  order: number;
}

interface AboutCredentialsManagerProps {
  configs: any[];
}

export function AboutCredentialsManager({ configs }: AboutCredentialsManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // Mock data para demonstração - substituir por dados reais
  const [localCredentials, setLocalCredentials] = useState<Credential[]>([
    { id: 1, title: "Psicologia", institution: "Centro Universitário Integrado", year: "2018", isActive: true, order: 0 },
    { id: 2, title: "Especialização em Terapia Cognitivo-Comportamental", institution: "Instituto de Psicologia", year: "2020", isActive: true, order: 1 },
    { id: 3, title: "CRP 08/123456", institution: "Conselho Regional de Psicologia - PR", isActive: true, order: 2 }
  ]);

  const form = useForm<CredentialFormData>({
    resolver: zodResolver(credentialSchema),
    defaultValues: {
      title: "",
      institution: "",
      year: "",
      isActive: true
    }
  });

  // Funções para mover itens com botões
  const handleMoveUp = (credential: Credential) => {
    const currentIndex = localCredentials.findIndex(c => c.id === credential.id);
    if (currentIndex > 0) {
      const newList = [...localCredentials];
      [newList[currentIndex], newList[currentIndex - 1]] = [newList[currentIndex - 1], newList[currentIndex]];
      
      const updatedList = newList.map((item, index) => ({
        ...item,
        order: index
      }));

      setLocalCredentials(updatedList);
      saveOrderToServer(updatedList);
    }
  };

  const handleMoveDown = (credential: Credential) => {
    const currentIndex = localCredentials.findIndex(c => c.id === credential.id);
    if (currentIndex < localCredentials.length - 1) {
      const newList = [...localCredentials];
      [newList[currentIndex], newList[currentIndex + 1]] = [newList[currentIndex + 1], newList[currentIndex]];
      
      const updatedList = newList.map((item, index) => ({
        ...item,
        order: index
      }));

      setLocalCredentials(updatedList);
      saveOrderToServer(updatedList);
    }
  };

  const saveOrderToServer = async (updatedList: Credential[]) => {
    try {
      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 100));
      toast({ title: "Ordem das credenciais atualizada!" });
    } catch (error) {
      toast({ title: "Erro ao atualizar ordem", variant: "destructive" });
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = localCredentials.findIndex(c => c.id === active.id);
    const newIndex = localCredentials.findIndex(c => c.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newList = [...localCredentials];
    const [moved] = newList.splice(oldIndex, 1);
    newList.splice(newIndex, 0, moved);
    
    const updatedList = newList.map((item, index) => ({
      ...item,
      order: index
    }));

    setLocalCredentials(updatedList);
    saveOrderToServer(updatedList);
  };

  const handleToggleActive = (credential: Credential) => {
    const updatedList = localCredentials.map(c =>
      c.id === credential.id ? { ...c, isActive: !c.isActive } : c
    );
    setLocalCredentials(updatedList);
    toast({ title: `Credencial ${credential.isActive ? 'desativada' : 'ativada'}!` });
  };

  const handleEdit = (credential: Credential) => {
    setEditingCredential(credential);
    form.reset({
      title: credential.title,
      institution: credential.institution,
      year: credential.year || "",
      isActive: credential.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover esta credencial?")) {
      const updatedList = localCredentials.filter(c => c.id !== id);
      setLocalCredentials(updatedList);
      toast({ title: "Credencial removida com sucesso!" });
    }
  };

  const openCreateDialog = () => {
    setEditingCredential(null);
    form.reset({
      title: "",
      institution: "",
      year: "",
      isActive: true
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: CredentialFormData) => {
    if (editingCredential) {
      const updatedList = localCredentials.map(c =>
        c.id === editingCredential.id ? { ...c, ...data } : c
      );
      setLocalCredentials(updatedList);
      toast({ title: "Credencial atualizada com sucesso!" });
    } else {
      const newCredential: Credential = {
        ...data,
        id: Date.now(),
        order: localCredentials.length
      };
      setLocalCredentials([...localCredentials, newCredential]);
      toast({ title: "Credencial criada com sucesso!" });
    }
    
    setIsDialogOpen(false);
    setEditingCredential(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Credenciais ({localCredentials.length})</h3>
        </div>
        <Button onClick={openCreateDialog} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Credencial
        </Button>
      </div>

      {localCredentials.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Award className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma credencial ainda</h3>
            <p className="text-gray-500 text-center mb-4">
              Adicione suas formações, certificações e registros profissionais.
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira credencial
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DragDropProvider
          items={localCredentials}
          onDragEnd={handleDragEnd}
          onDragStart={(event) => setActiveDragId(event.active.id.toString())}
          activeDragId={activeDragId}
        >
          <div className="space-y-3">
            {localCredentials.map((credential, index) => (
              <SortableItem
                key={credential.id}
                id={credential.id}
                onEdit={() => handleEdit(credential)}
                onDelete={() => handleDelete(credential.id)}
                onToggleActive={() => handleToggleActive(credential)}
                onMoveUp={() => handleMoveUp(credential)}
                onMoveDown={() => handleMoveDown(credential)}
                canMoveUp={index > 0}
                canMoveDown={index < localCredentials.length - 1}
                isActive={credential.isActive}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Award className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">{credential.title}</div>
                    <div className="text-sm text-gray-600">
                      {credential.institution}
                      {credential.year && ` • ${credential.year}`}
                    </div>
                  </div>
                </div>
              </SortableItem>
            ))}
          </div>
        </DragDropProvider>
      )}

      {/* Dialog para criar/editar credencial */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCredential ? "Editar Credencial" : "Nova Credencial"}
            </DialogTitle>
            <DialogDescription>
              Adicione informações sobre sua formação ou certificação profissional.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título/Formação</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Psicologia, Especialização em TCC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instituição</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Centro Universitário Integrado" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 2018" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Ativo</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Exibir esta credencial no site
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  {editingCredential ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}