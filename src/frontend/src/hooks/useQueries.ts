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
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    enabled: !!actor && !isFetching && options?.enabled !== false,
    retry: 2,
    retryDelay: 1000,
    staleTime: 0,
    gcTime: 0,
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
      if (result && typeof result === "object") {
        const r = result as Record<string, unknown>;
        if (r.__kind__ === "err") throw new Error(r.err as string);
        if (r.__kind__ === "ok") return r.ok as bigint;
        if ("err" in r) throw new Error(r.err as string);
        if ("ok" in r) return r.ok as bigint;
      }
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

export function useDeleteBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.deleteBooking(id);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
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
  return useMutation({
    mutationFn: async (_secret: string) => {
      // no-op
    },
  });
}

export function usePromoteToAdmin() {
  return useMutation({
    mutationFn: async (_password: string) => {
      // no-op — admin access is now password-only on frontend
      return true;
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
