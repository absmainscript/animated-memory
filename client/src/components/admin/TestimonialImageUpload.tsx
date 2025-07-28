import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Camera, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface TestimonialImageUploadProps {
  testimonialId: number;
  currentImage?: string;
  onImageUpdate: (imageUrl: string) => void;
}

export function TestimonialImageUpload({ 
  testimonialId, 
  currentImage, 
  onImageUpdate 
}: TestimonialImageUploadProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  // Mutation para upload de imagem
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`/api/admin/testimonials/${testimonialId}/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro no upload da imagem');
      }

      return response.json();
    },
    onSuccess: (data) => {
      onImageUpdate(data.imageUrl);
      toast({ title: "Imagem enviada com sucesso!" });
    },
    onError: (error) => {
      console.error('Erro no upload:', error);
      toast({ 
        title: "Erro ao enviar imagem", 
        description: "Tente novamente ou escolha outra imagem.",
        variant: "destructive" 
      });
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  // Mutation para remover imagem
  const removeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/testimonials/${testimonialId}/image`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao remover imagem');
      }

      return response.json();
    },
    onSuccess: () => {
      onImageUpdate("");
      toast({ title: "Imagem removida com sucesso!" });
    },
    onError: (error) => {
      console.error('Erro ao remover:', error);
      toast({ 
        title: "Erro ao remover imagem", 
        variant: "destructive" 
      });
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({ 
        title: "Arquivo inválido", 
        description: "Por favor, selecione uma imagem.",
        variant: "destructive" 
      });
      return;
    }

    // Validar tamanho (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({ 
        title: "Arquivo muito grande", 
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive" 
      });
      return;
    }

    setIsUploading(true);
    uploadMutation.mutate(file);
  };

  const handleRemove = () => {
    if (confirm("Tem certeza que deseja remover esta imagem?")) {
      removeMutation.mutate();
    }
  };

  return (
    <div className="space-y-4">
      {currentImage ? (
        <Card className="relative">
          <CardContent className="p-4">
            <div className="relative group">
              <img
                src={currentImage}
                alt="Foto do depoimento"
                className="w-32 h-32 rounded-xl object-cover border-2 border-gray-200 mx-auto"
              />
              
              {/* Overlay com ações */}
              <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => document.getElementById(`file-upload-${testimonialId}`)?.click()}
                  disabled={isUploading || removeMutation.isPending}
                >
                  <Upload className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleRemove}
                  disabled={isUploading || removeMutation.isPending}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Loading overlay */}
              {(isUploading || removeMutation.isPending) && (
                <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              )}
            </div>

            <div className="text-center mt-3">
              <p className="text-sm text-gray-600">
                Passe o mouse sobre a imagem para ver as opções
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors">
          <CardContent className="p-6">
            <motion.div
              className="text-center cursor-pointer"
              onClick={() => document.getElementById(`file-upload-${testimonialId}`)?.click()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-3" />
                  <p className="text-sm text-gray-600">Enviando imagem...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Camera className="w-12 h-12 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Adicionar Foto
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Clique aqui para enviar uma foto do paciente
                  </p>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Upload className="w-4 h-4 mr-2" />
                    Escolher Imagem
                  </Button>
                </div>
              )}
            </motion.div>
          </CardContent>
        </Card>
      )}

      {/* Input de arquivo oculto */}
      <input
        id={`file-upload-${testimonialId}`}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
        disabled={isUploading || removeMutation.isPending}
      />

      <div className="text-xs text-gray-500 text-center">
        Formatos aceitos: JPG, PNG, GIF • Tamanho máximo: 5MB
      </div>
    </div>
  );
}