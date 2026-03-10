import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  BookingInput,
  BookingRecord,
  BookingStatus,
  Service,
  ServiceInput,
  Settings,
} from "../backend";
import { useActor } from "./useActor";

export function useGetAllBookings(options?: { enabled?: boolean }) {
  const { actor, isFetching } = useActor();

  return useQuery<BookingRecord[]>({
    queryKey: ["allBookings"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.getAllBookings();
      return result;
    },
    enabled: !!actor && !isFetching && options?.enabled !== false,
    retry: (failureCount, error) => {
      const msg = error instanceof Error ? error.message : String(error);
      // Don't retry on authorization errors — these need re-login
      if (
        msg.includes("Unauthorized") ||
        msg.includes("Only admins") ||
        msg.includes("not registered") ||
        msg.includes("Permission denied")
      ) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: 0,
  });
}

export function useCreateBooking() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: BookingInput): Promise<bigint> => {
      if (!actor)
        throw new Error("Actor not initialized. Please wait and try again.");
      if (isFetching)
        throw new Error("Actor is still initializing. Please wait.");
      const result = await actor.createBooking(input);
      // Handle both { __kind__: "ok", ok: bigint } and { ok: bigint } shapes
      if (result && typeof result === "object") {
        const r = result as Record<string, unknown>;
        // Variant with __kind__
        if (r.__kind__ === "err") throw new Error(r.err as string);
        if (r.__kind__ === "ok") return r.ok as bigint;
        // Variant without __kind__ (direct ok/err keys)
        if ("err" in r) throw new Error(r.err as string);
        if ("ok" in r) return r.ok as bigint;
      }
      // If result is just a bigint (some SDK versions return directly)
      if (typeof result === "bigint") return result;
      throw new Error("Unexpected response from server. Please try again.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allBookings"] });
    },
  });
}

export function useUpdateBookingStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookingId,
      status,
    }: { bookingId: bigint; status: BookingStatus }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateBookingStatus(bookingId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allBookings"] });
    },
  });
}

export function useGetAllServices() {
  const { actor, isFetching } = useActor();

  return useQuery<Service[]>({
    queryKey: ["allServices"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllServices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ServiceInput) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.createService(input);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allServices"] });
    },
  });
}

export function useDeleteService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.deleteService(id);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allServices"] });
    },
  });
}

export function useInitializeAdmin() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (secret: string) => {
      if (!actor) throw new Error("Actor not available");
      await (actor as any)._initializeAccessControlWithSecret(secret);
    },
  });
}

export function usePromoteToAdmin() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (password: string) => {
      if (!actor) throw new Error("Actor not available");
      const result = await (actor as any)._promoteToAdmin(password);
      return result as boolean;
    },
  });
}

export function useGetSettings() {
  const { actor, isFetching } = useActor();

  return useQuery<Settings>({
    queryKey: ["settings"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newSettings: Settings) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateSettings(newSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}
