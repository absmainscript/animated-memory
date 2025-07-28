import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { GripVertical } from "lucide-react";

interface DragDropProviderProps {
  children: React.ReactNode;
  items: any[];
  onDragEnd: (event: DragEndEvent) => void;
  onDragStart?: (event: DragStartEvent) => void;
  activeDragId?: string | null;
}

export function DragDropProvider({ 
  children, 
  items, 
  onDragEnd, 
  onDragStart,
  activeDragId 
}: DragDropProviderProps) {
  // Sensores otimizados para mobile com melhor suporte touch
  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100, // Delay reduzido para melhor responsividade
        tolerance: 15, // Tolerância aumentada para evitar ativação acidental
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Distância reduzida para melhor responsividade
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>

      <DragOverlay>
        {activeDragId ? (
          <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-200 transform rotate-2">
            <div className="flex items-center gap-3">
              <GripVertical className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Movendo item...</span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}