import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { BookingStatus, BookingInput, ServiceInput, Settings } from '../backend';

export function useGetAllBookings() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: BookingInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createBooking(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useUpdateBookingStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, newStatus }: { bookingId: bigint; newStatus: BookingStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBookingStatus(bookingId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useGetAllServices() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['services'],
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
      queryClient.invalidateQueries({ queryKey: ['services'] });
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
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function useGetSettings() {
  const { actor, isFetching } = useActor();
  return useQuery({
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
      return actor.updateSettings(newSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

export function useGetDistrictsByState(state: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['districts', state],
    queryFn: async () => {
      if (!actor) return [];
      if (!state) return [];
      return actor.getDistrictsByState(state);
    },
    enabled: !!actor && !isFetching && !!state,
  });
}
