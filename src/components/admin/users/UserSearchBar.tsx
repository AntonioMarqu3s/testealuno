
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface UserSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearch: () => void;
}

export function UserSearchBar({ searchTerm, setSearchTerm, handleSearch }: UserSearchBarProps) {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex-1">
        <Input
          placeholder="Buscar usuários por email ou ID..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
      <Button onClick={handleSearch} type="button">
        Buscar
      </Button>
    </div>
  );
}
