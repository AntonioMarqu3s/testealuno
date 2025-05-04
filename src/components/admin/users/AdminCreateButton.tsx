
import React from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { DialogTrigger } from "@/components/ui/dialog";

export function AdminCreateButton() {
  return (
    <DialogTrigger asChild>
      <Button>
        <UserPlus className="h-4 w-4 mr-2" />
        Novo Administrador
      </Button>
    </DialogTrigger>
  );
}
