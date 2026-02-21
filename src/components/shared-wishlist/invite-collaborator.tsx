"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Search, Check, X } from "lucide-react";
import { mockHomies } from "@/lib/mock-data";

interface InviteCollaboratorProps {
  wishlistId: string;
  existingCollaboratorIds: string[];
  onInvite?: (userId: string) => void;
}

export function InviteCollaborator({
  wishlistId,
  existingCollaboratorIds,
  onInvite,
}: InviteCollaboratorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [invitedIds, setInvitedIds] = useState<string[]>([]);

  // Filter homies that are not already collaborators
  const availableHomies = mockHomies.filter(
    (homie) =>
      !existingCollaboratorIds.includes(homie.id) &&
      !invitedIds.includes(homie.id) &&
      (searchQuery === "" ||
        homie.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleInvite = (userId: string) => {
    setInvitedIds([...invitedIds, userId]);
    onInvite?.(userId);
  };

  const handleRemoveInvite = (userId: string) => {
    setInvitedIds(invitedIds.filter((id) => id !== userId));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Zaproś
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Zaproś do wspólnej listy</DialogTitle>
          <DialogDescription>
            Wybierz homies, których chcesz zaprosić do współtworzenia listy
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj homies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Invited list */}
          {invitedIds.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Zaproszeni:</p>
              <div className="flex flex-wrap gap-2">
                {invitedIds.map((userId) => {
                  const homie = mockHomies.find((h) => h.id === userId);
                  if (!homie) return null;
                  return (
                    <Badge
                      key={userId}
                      variant="secondary"
                      className="gap-1 pr-1"
                    >
                      {homie.name}
                      <button
                        onClick={() => handleRemoveInvite(userId)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available homies */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {availableHomies.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {searchQuery
                  ? "Brak wyników wyszukiwania"
                  : "Wszyscy homies już są na liście"}
              </p>
            ) : (
              availableHomies.map((homie) => (
                <div
                  key={homie.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={homie.avatar} />
                      <AvatarFallback className="bg-amber-100 text-amber-700">
                        {homie.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{homie.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {homie.mutualEventsCount} wspólnych wydarzeń
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleInvite(homie.id)}
                    className="gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                  >
                    <UserPlus className="h-4 w-4" />
                    Zaproś
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Anuluj
            </Button>
            <Button
              onClick={() => setOpen(false)}
              disabled={invitedIds.length === 0}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Wyślij zaproszenia ({invitedIds.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
