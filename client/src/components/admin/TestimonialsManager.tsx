import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Plus, GripVertical, Users, MessageSquare, Star, ChevronUp, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Testimonial } from "@shared/schema";
import { TestimonialImageUpload } from "./TestimonialImageUpload";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Schema de validação para depoimentos
const testimonialSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  service: z.string().min(1, "Serviço é obrigatório"),  
  testimonial: z.string().min(10, "Depoimento deve ter pelo menos 10 caracteres"),
  rating: z.number().min(1).max(5),
  photo: z.string().optional(),
  isActive: z.boolean().default(true)
});

type TestimonialFormData = z.infer<typeof testimonialSchema>;

interface TestimonialsManagerProps {
  testimonials: Testimonial[];
}

// Lista de avatares disponíveis
const AVATAR_OPTIONS = [
  { id: "👶", label: "Bebê", category: "👶 Bebês e Crianças" },
  { id: "🧒", label: "Criança", category: "👶 Bebês e Crianças" },
  { id: "👦", label: "Menino", category: "👶 Bebês e Crianças" },
  { id: "👧", label: "Menina", category: "👶 Bebês e Crianças" },
  { id: "👨", label: "Homem jovem", category: "👨 Homens" },
  { id: "🧔", label: "Homem com barba", category: "👨 Homens" },
  { id: "👨‍💼", label: "Executivo", category: "👨 Homens" },
  { id: "👨‍⚕️", label: "Médico", category: "👨 Homens" },
  { id: "👨‍🎓", label: "Estudante masculino", category: "👨 Homens" },
  { id: "👩", label: "Mulher jovem", category: "👩 Mulheres" },
  { id: "👩‍💼", label: "Executiva", category: "👩 Mulheres" },
  { id: "👩‍⚕️", label: "Médica", category: "👩 Mulheres" },
  { id: "👩‍🎓", label: "Estudante feminina", category: "👩 Mulheres" },
  { id: "👵", label: "Idosa", category: "👴 Idosos" },
  { id: "👴", label: "Idoso", category: "👴 Idosos" },
  { id: "👫", label: "Casal jovem", category: "👫 Casais" },
  { id: "👪", label: "Família", category: "👪 Famílias" },
  { id: "👨‍👩‍👧", label: "Família com filha", category: "👪 Famílias" },
  { id: "👨‍👩‍👦", label: "Família com filho", category: "👪 Famílias" },
  { id: "👩‍👧", label: "Mãe solteira", category: "👪 Famílias" }
];

// Componente para item arrastável
function SortableTestimonialItem({ testimonial, onEdit, onDelete, onToggleActive, onMoveUp, onMoveDown, canMoveUp, canMoveDown }: {
  testimonial: Testimonial;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: testimonial.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-xl p-4 ${
        isDragging ? 'shadow-2xl' : 'shadow-sm'
      } ${!testimonial.isActive ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 mt-2 cursor-grab active:cursor-grabbing touch-manipulation select-none"
          style={{ touchAction: 'none' }} // Previne scroll durante drag
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            {testimonial.photo ? (
              <img
                src={testimonial.photo}
                alt={testimonial.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center text-lg">
                👤
              </div>
            )}
            <div>
              <div className="font-medium text-gray-900">{testimonial.name}</div>
              <div className="text-sm text-gray-500">{testimonial.service}</div>
            </div>
          </div>
          
          <p className="text-sm text-gray-700 mb-2 line-clamp-3">
            {testimonial.testimonial}
          </p>
          
          <div className="flex items-center gap-1 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < testimonial.rating
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Botões de reordenação para mobile/alternativa */}
          <div className="flex flex-col gap-0">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className="h-6 px-1 py-0 text-gray-400 hover:text-blue-600 disabled:opacity-30"
              title="Mover para cima"
            >
              <ChevronUp className="w-3 h-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className="h-6 px-1 py-0 text-gray-400 hover:text-blue-600 disabled:opacity-30"
              title="Mover para baixo"
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
          </div>

          <Switch
            checked={testimonial.isActive}
            onCheckedChange={onToggleActive}
            className="data-[state=checked]:bg-green-500"
          />
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsManager({ testimonials }: TestimonialsManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [localTestimonials, setLocalTestimonials] = useState(testimonials);

  // Atualizar estado local quando props mudam
  React.useEffect(() => {
    setLocalTestimonials(testimonials);
  }, [testimonials]);

  const form = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      name: "",
      service: "",
      testimonial: "",
      rating: 5,
      photo: "",
      isActive: true
    }
  });

  // Sensores otimizados para mobile e desktop com melhor suporte touch
  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100, // Reduzir delay para melhor responsividade
        tolerance: 10, // Aumentar tolerância para evitar ativação acidental
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Reduzir distância para melhor responsividade
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Mutation para criar depoimento - usa setQueryData para evitar reload
  const createMutation = useMutation({
    mutationFn: async (data: TestimonialFormData) => {
      const response = await fetch("/api/admin/testimonials", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Atualizar estado local direto sem invalidação
      const newList = [...localTestimonials, data];
      setLocalTestimonials(newList);
      queryClient.setQueryData(["/api/admin/testimonials"], newList);
      
      toast({ title: "Depoimento criado com sucesso!" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Erro ao criar depoimento", variant: "destructive" });
    }
  });

  // Mutation para atualizar depoimento - usa setQueryData para evitar reload
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<TestimonialFormData> }) => {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (data, { id }) => {
      // Atualizar estado local direto
      const updatedList = localTestimonials.map(t => 
        t.id === id ? data : t
      );
      setLocalTestimonials(updatedList);
      queryClient.setQueryData(["/api/admin/testimonials"], updatedList);
      
      toast({ title: "Depoimento atualizado com sucesso!" });
      setIsDialogOpen(false);
      setEditingTestimonial(null);
    },
    onError: () => {
      toast({ title: "Erro ao atualizar depoimento", variant: "destructive" });
    }
  });

  // Mutation para deletar depoimento
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: "DELETE"
      });
      return response.json();
    },
    onSuccess: (_, id) => {
      // Atualizar estado local direto
      const updatedList = localTestimonials.filter(t => t.id !== id);
      setLocalTestimonials(updatedList);
      queryClient.setQueryData(["/api/admin/testimonials"], updatedList);
      
      toast({ title: "Depoimento removido com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao remover depoimento", variant: "destructive" });
    }
  });

  // Função para reordenar depoimentos via drag and drop
  const handleReorder = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = localTestimonials.findIndex(t => t.id === active.id);
    const newIndex = localTestimonials.findIndex(t => t.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedList = arrayMove(localTestimonials, oldIndex, newIndex);
    
    // Atualizar ordem local imediatamente
    const updatedList = reorderedList.map((item, index) => ({
      ...item,
      order: index
    }));

    setLocalTestimonials(updatedList);
    queryClient.setQueryData(["/api/admin/testimonials"], updatedList);

    try {
      // Salvar nova ordem no servidor
      await fetch("/api/admin/testimonials/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testimonials: updatedList.map(t => ({ id: t.id, order: t.order }))
        })
      });
      
      toast({ title: "Ordem dos depoimentos atualizada!" });
    } catch (error) {
      // Reverter em caso de erro
      setLocalTestimonials(localTestimonials);
      queryClient.setQueryData(["/api/admin/testimonials"], localTestimonials);
      toast({ title: "Erro ao reordenar depoimentos", variant: "destructive" });
    }
  };

  const handleSubmit = (data: TestimonialFormData) => {
    if (editingTestimonial) {
      updateMutation.mutate({ id: editingTestimonial.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Funções para mover itens com botões
  const handleMoveUp = (testimonial: Testimonial) => {
    const currentIndex = localTestimonials.findIndex(t => t.id === testimonial.id);
    if (currentIndex > 0) {
      const newList = [...localTestimonials];
      [newList[currentIndex], newList[currentIndex - 1]] = [newList[currentIndex - 1], newList[currentIndex]];
      
      // Atualizar ordens
      const updatedList = newList.map((item, index) => ({
        ...item,
        order: index
      }));

      setLocalTestimonials(updatedList);
      queryClient.setQueryData(["/api/admin/testimonials"], updatedList);
      
      // Salvar no servidor
      saveOrderToServer(updatedList);
    }
  };

  const handleMoveDown = (testimonial: Testimonial) => {
    const currentIndex = localTestimonials.findIndex(t => t.id === testimonial.id);
    if (currentIndex < localTestimonials.length - 1) {
      const newList = [...localTestimonials];
      [newList[currentIndex], newList[currentIndex + 1]] = [newList[currentIndex + 1], newList[currentIndex]];
      
      // Atualizar ordens
      const updatedList = newList.map((item, index) => ({
        ...item,
        order: index
      }));

      setLocalTestimonials(updatedList);
      queryClient.setQueryData(["/api/admin/testimonials"], updatedList);
      
      // Salvar no servidor
      saveOrderToServer(updatedList);
    }
  };

  // Função auxiliar para salvar ordem no servidor
  const saveOrderToServer = async (updatedList: Testimonial[]) => {
    try {
      await fetch("/api/admin/testimonials/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testimonials: updatedList.map(t => ({ id: t.id, order: t.order }))
        })
      });
      
      toast({ title: "Ordem atualizada com sucesso!" });
    } catch (error) {
      toast({ title: "Erro ao atualizar ordem", variant: "destructive" });
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    form.reset({
      name: testimonial.name,
      service: testimonial.service,
      testimonial: testimonial.testimonial,
      rating: testimonial.rating,
      photo: testimonial.photo ?? "",
      isActive: testimonial.isActive
    });
    setIsDialogOpen(true);
  };

  const handleToggleActive = (testimonial: Testimonial) => {
    updateMutation.mutate({
      id: testimonial.id,
      data: { isActive: !testimonial.isActive }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover este depoimento?")) {
      deleteMutation.mutate(id);
    }
  };

  const openCreateDialog = () => {
    setEditingTestimonial(null);
    form.reset({
      name: "",
      service: "",
      testimonial: "",
      rating: 5,
      photo: "",
      isActive: true
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Depoimentos ({localTestimonials.length})</h3>
        </div>
        <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Depoimento
        </Button>
      </div>

      {localTestimonials.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum depoimento ainda</h3>
            <p className="text-gray-500 text-center mb-4">
              Adicione depoimentos dos seus pacientes para aumentar a credibilidade do seu site.
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Criar primeiro depoimento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleReorder}
        >
          <SortableContext items={localTestimonials} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {localTestimonials.map((testimonial, index) => (
                <SortableTestimonialItem
                  key={testimonial.id}
                  testimonial={testimonial}
                  onEdit={() => handleEdit(testimonial)}
                  onDelete={() => handleDelete(testimonial.id)}
                  onToggleActive={() => handleToggleActive(testimonial)}
                  onMoveUp={() => handleMoveUp(testimonial)}
                  onMoveDown={() => handleMoveDown(testimonial)}
                  canMoveUp={index > 0}
                  canMoveDown={index < localTestimonials.length - 1}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Dialog para criar/editar depoimento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial ? "Editar Depoimento" : "Novo Depoimento"}
            </DialogTitle>
            <DialogDescription>
              Adicione um depoimento autêntico dos seus pacientes para aumentar a credibilidade.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Paciente</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Maria Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="service"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serviço/Tratamento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Terapia Individual, Terapia de Casal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="testimonial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depoimento</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Escreva o depoimento completo aqui..."
                        className="min-h-[120px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avaliação (Estrelas)</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a avaliação" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <SelectItem key={rating} value={rating.toString()}>
                              {Array.from({ length: rating }, (_, i) => "⭐").join("")} ({rating} estrela{rating > 1 ? "s" : ""})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                          Exibir este depoimento no site
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
              </div>

              {/* Upload de imagem */}
              {editingTestimonial && (
                <div>
                  <FormLabel>Foto do Paciente</FormLabel>
                  <TestimonialImageUpload
                    testimonialId={editingTestimonial.id}
                    currentImage={editingTestimonial.photo ?? ""}
                    onImageUpdate={(imageUrl) => {
                      form.setValue("photo", imageUrl);
                      // Atualizar estado local
                      const updatedList = localTestimonials.map(t =>
                        t.id === editingTestimonial.id ? { ...t, photo: imageUrl } : t
                      );
                      setLocalTestimonials(updatedList);
                      queryClient.setQueryData(["/api/admin/testimonials"], updatedList);
                    }}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Salvando..."
                    : editingTestimonial
                    ? "Atualizar"
                    : "Criar"
                  }
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}