import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export type Result_2 = {
    __kind__: "ok";
    ok: Service;
} | {
    __kind__: "err";
    err: string;
};
export interface BookingInput {
    customerName: string;
    serviceType: string;
    district: string;
    state: string;
    preferredDate: string;
    problemDescription: string;
    phoneNumber: string;
    location: string;
    timeSlot: TimeSlot;
}
export interface Service {
    id: bigint;
    descriptionHindi: string;
    nameHindi: string;
    name: string;
    description: string;
    priceRange: string;
    category: string;
}
export type Result_1 = {
    __kind__: "ok";
    ok: Array<BookingRecord>;
} | {
    __kind__: "err";
    err: string;
};
export interface BookingRecord {
    id: bigint;
    customerName: string;
    status: BookingStatus;
    serviceType: string;
    district: string;
    state: string;
    preferredTimeSlot: TimeSlot;
    preferredDate: string;
    timestamp: Time;
    problemDescription: string;
    phoneNumber: string;
    location: string;
}
export interface Settings {
    businessHours: string;
    businessName: string;
    businessAddress: string;
    whatsappNumber: string;
    contactPhone: string;
}
export type Result = {
    __kind__: "ok";
    ok: boolean;
} | {
    __kind__: "err";
    err: string;
};
export interface ServiceInput {
    descriptionHindi: string;
    nameHindi: string;
    name: string;
    description: string;
    priceRange: string;
    category: string;
}
export type Result_3 = {
    __kind__: "ok";
    ok: bigint;
} | {
    __kind__: "err";
    err: string;
};
export interface UserProfile {
    name: string;
    email: string;
}
export enum BookingStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    confirmed = "confirmed",
    inProgress = "inProgress"
}
export enum TimeSlot {
    afternoon_12_4 = "afternoon_12_4",
    morning_9_12 = "morning_9_12",
    evening_4_7 = "evening_4_7"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBooking(input: BookingInput): Promise<Result_3>;
    createService(input: ServiceInput): Promise<Result_2>;
    deleteBooking(id: bigint): Promise<Result>;
    deleteService(id: bigint): Promise<Result>;
    getAllBookings(): Promise<Result_1>;
    getAllServices(): Promise<Array<Service>>;
    getBookingById(bookingId: bigint): Promise<BookingRecord | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDistrictsByState(state: string): Promise<Array<string>>;
    getOwnBookings(): Promise<Array<BookingRecord>>;
    getServiceById(id: bigint): Promise<Service | null>;
    getServicesByCategory(category: string): Promise<Array<Service>>;
    getSettings(): Promise<Settings>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchServicesByName(name: string): Promise<Array<Service>>;
    updateBookingStatus(bookingId: bigint, newStatus: BookingStatus): Promise<Result>;
    updateSettings(newSettings: Settings): Promise<Result>;
}
