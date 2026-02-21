"use client";

import { useState, useEffect, useCallback } from "react";
import { mockUsers, MockUser } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, ChefHat, Store, LogOut, Bug } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

const MOCK_USER_KEY = "seated-mock-user";
const ACTIVE_MODE_KEY = "seated-active-mode";

export type ActiveMode = "host" | "guest";

export interface MockUserState {
  user: MockUser | null;
  activeMode: ActiveMode;
  isLoading: boolean;
  canSwitchMode: boolean;
}

export function DevAccountSwitcher() {
  const { data: session } = useSession();
  const [currentMockUser, setCurrentMockUser] = useState<MockUser | null>(null);
  const [activeMode, setActiveMode] = useState<ActiveMode>("guest");
  const [isOpen, setIsOpen] = useState(false);

  // Load mock user and active mode from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(MOCK_USER_KEY);
    const storedMode = localStorage.getItem(ACTIVE_MODE_KEY) as ActiveMode | null;

    if (stored) {
      const user = mockUsers.find((u) => u.id === stored);
      if (user) {
        setCurrentMockUser(user);
        // Set default mode based on user type
        if (storedMode && (storedMode === "host" || storedMode === "guest")) {
          setActiveMode(storedMode);
        } else {
          setActiveMode(user.role === "host" ? "host" : "guest");
        }
      }
    }
  }, []);

  const handleSelectUser = (user: MockUser) => {
    localStorage.setItem(MOCK_USER_KEY, user.id);
    // Set default mode for new user
    const defaultMode: ActiveMode = user.role === "host" ? "host" : "guest";
    localStorage.setItem(ACTIVE_MODE_KEY, defaultMode);
    setCurrentMockUser(user);
    setActiveMode(defaultMode);
    setIsOpen(false);
    // Reload to apply changes
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem(MOCK_USER_KEY);
    localStorage.removeItem(ACTIVE_MODE_KEY);
    setCurrentMockUser(null);
    signOut({ callbackUrl: "/" });
  };

  const getRoleIcon = (user: MockUser) => {
    if (user.role === "guest") return <User className="h-4 w-4" />;
    if (user.hostType === "restaurant") return <Store className="h-4 w-4" />;
    return <ChefHat className="h-4 w-4" />;
  };

  const getRoleBadgeColor = (user: MockUser) => {
    if (user.role === "guest") return "bg-blue-100 text-blue-700";
    if (user.hostType === "restaurant") return "bg-purple-100 text-purple-700";
    return "bg-amber-100 text-amber-700";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-yellow-50 border-yellow-300 hover:bg-yellow-100"
          >
            <Bug className="h-4 w-4 text-yellow-600" />
            <span className="text-xs">
              {currentMockUser ? currentMockUser.name.split(" ")[0] : "Dev Login"}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Bug className="h-4 w-4 text-yellow-600" />
            <span>Testowe konta (tylko dev)</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Guests section */}
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Goście
          </DropdownMenuLabel>
          {mockUsers
            .filter((u) => u.role === "guest")
            .map((user) => (
              <DropdownMenuItem
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={getRoleBadgeColor(user)}>
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{user.name}</span>
                    {currentMockUser?.id === user.id && (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                        aktywny
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.description}
                  </p>
                </div>
                {getRoleIcon(user)}
              </DropdownMenuItem>
            ))}

          <DropdownMenuSeparator />

          {/* Hosts section */}
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Hosty
          </DropdownMenuLabel>
          {mockUsers
            .filter((u) => u.role === "host")
            .map((user) => (
              <DropdownMenuItem
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={getRoleBadgeColor(user)}>
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{user.name}</span>
                    {currentMockUser?.id === user.id && (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                        aktywny
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.description}
                    {user.canSwitchMode && " • może być też gościem"}
                  </p>
                </div>
                {getRoleIcon(user)}
              </DropdownMenuItem>
            ))}

          {currentMockUser && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Wyloguj mock usera
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Hook to get current mock user with loading state and mode switching
export function useMockUser(): MockUserState & {
  switchMode: (mode: ActiveMode) => void;
  effectiveRole: "host" | "guest";
} {
  const [mockUser, setMockUser] = useState<MockUser | null>(null);
  const [activeMode, setActiveMode] = useState<ActiveMode>("guest");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(MOCK_USER_KEY);
    const storedMode = localStorage.getItem(ACTIVE_MODE_KEY) as ActiveMode | null;

    if (stored) {
      const user = mockUsers.find((u) => u.id === stored);
      if (user) {
        setMockUser(user);
        // Set mode from storage or default
        if (storedMode && (storedMode === "host" || storedMode === "guest")) {
          setActiveMode(storedMode);
        } else {
          setActiveMode(user.role === "host" ? "host" : "guest");
        }
      }
    }
    setIsLoading(false);
  }, []);

  const switchMode = useCallback((mode: ActiveMode) => {
    localStorage.setItem(ACTIVE_MODE_KEY, mode);
    setActiveMode(mode);
    // Reload to apply changes
    window.location.reload();
  }, []);

  // Can only switch if user is an individual host with canSwitchMode flag
  const canSwitchMode = Boolean(
    mockUser?.role === "host" &&
    mockUser?.hostType === "individual" &&
    mockUser?.canSwitchMode
  );

  // Effective role considers active mode for switchable users
  const effectiveRole: "host" | "guest" =
    canSwitchMode ? activeMode :
    mockUser?.role === "host" ? "host" : "guest";

  return {
    user: mockUser,
    activeMode,
    isLoading,
    canSwitchMode,
    switchMode,
    effectiveRole,
  };
}

// Get mock user ID from localStorage (for server-side compatible usage)
export function getMockUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(MOCK_USER_KEY);
}

// Get active mode from localStorage
export function getActiveMode(): ActiveMode {
  if (typeof window === "undefined") return "guest";
  const mode = localStorage.getItem(ACTIVE_MODE_KEY);
  return mode === "host" ? "host" : "guest";
}
