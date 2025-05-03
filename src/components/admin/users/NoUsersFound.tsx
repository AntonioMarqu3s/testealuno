
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";

interface NoUsersFoundProps {
  usersExist: boolean;
}

export function NoUsersFound({ usersExist }: NoUsersFoundProps) {
  return (
    <TableRow>
      <TableCell colSpan={8} className="text-center h-24">
        {usersExist ? "Nenhum resultado para a busca" : "Nenhum usuário encontrado"}
      </TableCell>
    </TableRow>
  );
}
