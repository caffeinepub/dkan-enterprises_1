import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { BookingInput, BookingRecord, BookingStatus, ServiceInput, Service, Settings } from '../backend';

export function useGetAllBookings() {
  const { actor, isFetching } = useActor();

  return useQuery<BookingRecord[]>({
    queryKey: ['allBookings'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.getAllBookings();
      return result;
    },
    enabled: !!actor && !isFetching,
    retry: 1,
  });
}

export function useCreateBooking() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: BookingInput): Promise<bigint> => {
      if (!actor) throw new Error('Actor not initialized. Please wait and try again.');
      if (isFetching) throw new Error('Actor is still initializing. Please wait.');
      const result = await actor.createBooking(input);
      // Result_2 is { __kind__: "ok"; ok: bigint } | { __kind__: "err"; err: string }
      if (result.__kind__ === 'err') {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
    },
  });
}

export function useUpdateBookingStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: bigint; status: BookingStatus }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateBookingStatus(bookingId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
    },
  });
}

export function useGetAllServices() {
  const { actor, isFetching } = useActor();

  return useQuery<Service[]>({
    queryKey: ['allServices'],
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
      if (!actor) throw new Error('Actor not available');
      const result = await actor.createService(input);
      if (result.__kind__ === 'err') throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allServices'] });
    },
  });
}

export function useDeleteService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.deleteService(id);
      if (result.__kind__ === 'err') throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allServices'] });
    },
  });
}

export function useInitializeAdmin() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (secret: string) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any)._initializeAccessControlWithSecret(secret);
    },
  });
}

export function useGetSettings() {
  const { actor, isFetching } = useActor();

  return useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
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
      if (!actor) throw new Error('Actor not available');
      await actor.updateSettings(newSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
