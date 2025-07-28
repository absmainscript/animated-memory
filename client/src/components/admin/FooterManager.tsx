import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export function FooterManager({ footerSettings }: { footerSettings: any[] }) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-gray-600">Componente FooterManager em desenvolvimento</p>
      </CardContent>
    </Card>
  );
}