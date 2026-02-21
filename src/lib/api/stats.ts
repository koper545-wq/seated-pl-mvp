import { api } from "./client";
import type { HostStats } from "./types";

export async function fetchHostStats(): Promise<HostStats> {
  return api.get<HostStats>("/host/stats");
}
