import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { GripVertical, ChevronUp, ChevronDown, Edit, Trash2 } from "lucide-react";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string | number;
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleActive?: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  isActive?: boolean;
  showControls?: boolean;
}

export function SortableItem({
  id,
  children,
  onEdit,
  onDelete,
  onToggleActive,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  isActive = true,
  showControls = true
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

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
      } ${!isActive ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Handle de arraste otimizado para mobile */}
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 mt-2 cursor-grab active:cursor-grabbing touch-manipulation select-none"
          style={{ touchAction: 'none' }}
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

        {/* Conteúdo do item */}
        <div className="flex-1 min-w-0">
          {children}
        </div>

        {/* Controles de ação */}
        {showControls && (
          <div className="flex items-center gap-1">
            {/* Botões de reordenação */}
            <div className="flex flex-col gap-0">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onMoveUp}
                disabled={!canMoveUp}
                className="h-6 px-1 py-0 text-gray-400 hover:text-blue-600 disabled:opacity-30 touch-manipulation"
                title="Mover para cima"
              >
                <ChevronUp className="w-3 h-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onMoveDown}
                disabled={!canMoveDown}
                className="h-6 px-1 py-0 text-gray-400 hover:text-blue-600 disabled:opacity-30 touch-manipulation"
                title="Mover para baixo"
              >
                <ChevronDown className="w-3 h-3" />
              </Button>
            </div>

            {/* Switch de ativo/inativo */}
            {onToggleActive && (
              <Switch
                checked={isActive}
                onCheckedChange={onToggleActive}
                className="data-[state=checked]:bg-green-500"
              />
            )}

            {/* Botão de editar */}
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={onEdit} className="touch-manipulation">
                <Edit className="w-4 h-4" />
              </Button>
            )}

            {/* Botão de deletar */}
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600 touch-manipulation">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}