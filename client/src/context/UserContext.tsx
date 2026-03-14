import { createContext, useContext, useState } from "react";
import { getOrCreateUserId } from "../lib/userId";

const UserContext = createContext<string>("");

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId] = useState<string>(getOrCreateUserId);

  return <UserContext.Provider value={userId}>{children}</UserContext.Provider>;
}

export function useUserId(): string {
  return useContext(UserContext);
}
