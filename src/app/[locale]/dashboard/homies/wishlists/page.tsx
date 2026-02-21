"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { WishlistCard } from "@/components/shared-wishlist";
import { Plus, ListPlus, Search, Lock, UserCheck, Globe } from "lucide-react";
import { getSharedWishlists } from "@/lib/mock-data";

export default function WishlistsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListVisibility, setNewListVisibility] = useState<
    "private" | "collaborators" | "public"
  >("collaborators");

  const wishlists = getSharedWishlists("user-current");

  const filteredWishlists = wishlists.filter((wishlist) =>
    wishlist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateWishlist = () => {
    // In a real app, this would create a new wishlist
    console.log("Creating wishlist:", { name: newListName, visibility: newListVisibility });
    setCreateDialogOpen(false);
    setNewListName("");
    setNewListVisibility("collaborators");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Wspólne listy życzeń</h1>
          <p className="text-muted-foreground mt-1">
            Planuj wydarzenia razem z homies i głosujcie na ulubione
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700 gap-2">
              <Plus className="h-4 w-4" />
              Utwórz listę
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nowa wspólna lista</DialogTitle>
              <DialogDescription>
                Utwórz listę wydarzeń i zaproś homies do współpracy
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="list-name">Nazwa listy</Label>
                <Input
                  id="list-name"
                  placeholder="np. Kolacja urodzinowa"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visibility">Widoczność</Label>
                <Select
                  value={newListVisibility}
                  onValueChange={(value: "private" | "collaborators" | "public") =>
                    setNewListVisibility(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Prywatna - tylko ty
                      </div>
                    </SelectItem>
                    <SelectItem value="collaborators">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Współpracownicy - zaproszeni homies
                      </div>
                    </SelectItem>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Publiczna - wszyscy widzą
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Anuluj
                </Button>
                <Button
                  onClick={handleCreateWishlist}
                  disabled={!newListName.trim()}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <ListPlus className="h-4 w-4 mr-2" />
                  Utwórz
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Szukaj list..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {/* Wishlists grid */}
      {filteredWishlists.length === 0 ? (
        <div className="text-center py-16">
          <ListPlus className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {searchQuery ? "Brak wyników" : "Brak list"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {searchQuery
              ? "Spróbuj zmienić kryteria wyszukiwania"
              : "Utwórz pierwszą wspólną listę i zaproś homies"}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 gap-2"
            >
              <Plus className="h-4 w-4" />
              Utwórz pierwszą listę
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWishlists.map((wishlist) => (
            <WishlistCard key={wishlist.id} wishlist={wishlist} />
          ))}
        </div>
      )}
    </div>
  );
}
