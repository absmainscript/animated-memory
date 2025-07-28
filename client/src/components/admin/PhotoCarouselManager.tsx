import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, ImageIcon, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DragDropProvider } from "./DragDropProvider";
import { SortableItem } from "./SortableItem";

// Schema para fotos da galeria
const photoSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  imageUrl: z.string().url("URL da imagem inválida"),
  isActive: z.boolean().default(true)
});

type PhotoFormData = z.infer<typeof photoSchema>;

interface GalleryPhoto {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  isActive: boolean;
  order: number;
}

interface PhotoCarouselManagerProps {
  configs: any[];
}

export function PhotoCarouselManager({ configs }: PhotoCarouselManagerProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // Mock data para demonstração
  const [localPhotos, setLocalPhotos] = useState<GalleryPhoto[]>([
    { 
      id: 1, 
      title: "Consultório Principal", 
      description: "Ambiente acolhedor para sessões individuais",
      imageUrl: "/uploads/gallery/office1.jpg", 
      isActive: true, 
      order: 0 
    },
    { 
      id: 2, 
      title: "Sala de Espera", 
      description: "Espaço confortável e relaxante",
      imageUrl: "/uploads/gallery/waiting-room.jpg", 
      isActive: true, 
      order: 1 
    },
    { 
      id: 3, 
      title: "Área de Terapia em Grupo", 
      description: "Local preparado para sessões em grupo",
      imageUrl: "/uploads/gallery/group-therapy.jpg", 
      isActive: true, 
      order: 2 
    }
  ]);

  const form = useForm<PhotoFormData>({
    resolver: zodResolver(photoSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      isActive: true
    }
  });

  // Funções para mover itens com botões
  const handleMoveUp = (photo: GalleryPhoto) => {
    const currentIndex = localPhotos.findIndex(p => p.id === photo.id);
    if (currentIndex > 0) {
      const newList = [...localPhotos];
      [newList[currentIndex], newList[currentIndex - 1]] = [newList[currentIndex - 1], newList[currentIndex]];
      
      const updatedList = newList.map((item, index) => ({
        ...item,
        order: index
      }));

      setLocalPhotos(updatedList);
      saveOrderToServer(updatedList);
    }
  };

  const handleMoveDown = (photo: GalleryPhoto) => {
    const currentIndex = localPhotos.findIndex(p => p.id === photo.id);
    if (currentIndex < localPhotos.length - 1) {
      const newList = [...localPhotos];
      [newList[currentIndex], newList[currentIndex + 1]] = [newList[currentIndex + 1], newList[currentIndex]];
      
      const updatedList = newList.map((item, index) => ({
        ...item,
        order: index
      }));

      setLocalPhotos(updatedList);
      saveOrderToServer(updatedList);
    }
  };

  const saveOrderToServer = async (updatedList: GalleryPhoto[]) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      toast({ title: "Ordem das fotos atualizada!" });
    } catch (error) {
      toast({ title: "Erro ao atualizar ordem", variant: "destructive" });
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = localPhotos.findIndex(p => p.id === active.id);
    const newIndex = localPhotos.findIndex(p => p.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newList = [...localPhotos];
    const [moved] = newList.splice(oldIndex, 1);
    newList.splice(newIndex, 0, moved);
    
    const updatedList = newList.map((item, index) => ({
      ...item,
      order: index
    }));

    setLocalPhotos(updatedList);
    saveOrderToServer(updatedList);
  };

  const handleToggleActive = (photo: GalleryPhoto) => {
    const updatedList = localPhotos.map(p =>
      p.id === photo.id ? { ...p, isActive: !p.isActive } : p
    );
    setLocalPhotos(updatedList);
    toast({ title: `Foto ${photo.isActive ? 'ocultada' : 'exibida'}!` });
  };

  const handleEdit = (photo: GalleryPhoto) => {
    setEditingPhoto(photo);
    form.reset({
      title: photo.title,
      description: photo.description || "",
      imageUrl: photo.imageUrl,
      isActive: photo.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover esta foto?")) {
      const updatedList = localPhotos.filter(p => p.id !== id);
      setLocalPhotos(updatedList);
      toast({ title: "Foto removida com sucesso!" });
    }
  };

  const openCreateDialog = () => {
    setEditingPhoto(null);
    form.reset({
      title: "",
      description: "",
      imageUrl: "",
      isActive: true
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: PhotoFormData) => {
    if (editingPhoto) {
      const updatedList = localPhotos.map(p =>
        p.id === editingPhoto.id ? { ...p, ...data } : p
      );
      setLocalPhotos(updatedList);
      toast({ title: "Foto atualizada com sucesso!" });
    } else {
      const newPhoto: GalleryPhoto = {
        ...data,
        id: Date.now(),
        order: localPhotos.length
      };
      setLocalPhotos([...localPhotos, newPhoto]);
      toast({ title: "Foto adicionada com sucesso!" });
    }
    
    setIsDialogOpen(false);
    setEditingPhoto(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Galeria de Fotos ({localPhotos.length})</h3>
        </div>
        <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Foto
        </Button>
      </div>

      {localPhotos.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma foto ainda</h3>
            <p className="text-gray-500 text-center mb-4">
              Adicione fotos do seu consultório, ambiente de trabalho ou eventos.
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar primeira foto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DragDropProvider
          items={localPhotos}
          onDragEnd={handleDragEnd}
          onDragStart={(event) => setActiveDragId(event.active.id.toString())}
          activeDragId={activeDragId}
        >
          <div className="space-y-3">
            {localPhotos.map((photo, index) => (
              <SortableItem
                key={photo.id}
                id={photo.id}
                onEdit={() => handleEdit(photo)}
                onDelete={() => handleDelete(photo.id)}
                onToggleActive={() => handleToggleActive(photo)}
                onMoveUp={() => handleMoveUp(photo)}
                onMoveDown={() => handleMoveDown(photo)}
                canMoveUp={index > 0}
                canMoveDown={index < localPhotos.length - 1}
                isActive={photo.isActive}
              >
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={photo.imageUrl} 
                      alt={photo.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg0NFY0NEgyMFYyMFoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+CjxjaXJjbGUgY3g9IjI4IiBjeT0iMjgiIHI9IjMiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTIwIDM2TDI4IDI4TDM2IDM2TDQ0IDI4IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPgo8L3N2Zz4K';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{photo.title}</div>
                    {photo.description && (
                      <div className="text-sm text-gray-600 truncate">{photo.description}</div>
                    )}
                  </div>
                </div>
              </SortableItem>
            ))}
          </div>
        </DragDropProvider>
      )}

      {/* Dialog para criar/editar foto */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPhoto ? "Editar Foto" : "Nova Foto"}
            </DialogTitle>
            <DialogDescription>
              Adicione uma foto para a galeria do seu consultório.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da Foto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Consultório Principal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Ambiente acolhedor para sessões" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Imagem</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
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
                        Exibir esta foto na galeria
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
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingPhoto ? "Atualizar" : "Adicionar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}