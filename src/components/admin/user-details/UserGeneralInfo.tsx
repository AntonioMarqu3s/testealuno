
import React from "react";
import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserData, formatDate } from "./types";

interface UserGeneralInfoProps {
  userData: UserData;
}

export function UserGeneralInfo({ userData }: UserGeneralInfoProps) {
  return (
    <>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">ID</h3>
        <p className="font-mono text-sm">{userData.id}</p>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
        <p>{userData.email}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Data de criação</h3>
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-sm">{formatDate(userData.created_at)}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Último login</h3>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-sm">{formatDate(userData.last_sign_in_at)}</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
        <div className={cn(
          "px-2.5 py-0.5 rounded-full text-xs inline-block",
          userData.last_sign_in_at ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        )}>
          {userData.last_sign_in_at ? "Ativo" : "Inativo"}
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Metadados</h3>
        <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">
          {JSON.stringify(userData.user_metadata, null, 2)}
        </pre>
      </div>
    </>
  );
}
