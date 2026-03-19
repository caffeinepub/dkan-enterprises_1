import Time "mo:core/Time";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  stable var DKAN_ADMIN_PASSWORD : Text = "admin123";

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type ServiceType = {
    #acRepair;
    #washingMachineRepair;
    #refrigeratorRepair;
    #microwaveRepair;
    #geyserRepair;
    #lcdLedTvRepair;
    #waterPurifier;
  };

  type TimeSlot = {
    #morning_9_12;
    #afternoon_12_4;
    #evening_4_7;
  };

  type BookingInput = {
    customerName : Text;
    state : Text;
    district : Text;
    phoneNumber : Text;
    serviceType : ServiceType;
    problemDescription : Text;
    location : Text;
    preferredDate : Text;
    timeSlot : TimeSlot;
  };

  type BookingStatus = {
    #pending;
    #confirmed;
    #inProgress;
    #completed;
    #cancelled;
  };

  type BookingRecord = {
    id : Nat;
    customerName : Text;
    state : Text;
    district : Text;
    phoneNumber : Text;
    serviceType : ServiceType;
    problemDescription : Text;
    location : Text;
    preferredDate : Text;
    preferredTimeSlot : TimeSlot;
    timestamp : Time.Time;
    status : BookingStatus;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextBookingId = 1;

  let bookingOwners = Map.empty<Principal, List.List<Nat>>();
  let bookings = Map.empty<Nat, BookingRecord>();

  var nextServiceId = 1;
  let services = Map.empty<Nat, Service>();

  type Service = {
    id : Nat;
    name : Text;
    nameHindi : Text;
    description : Text;
    descriptionHindi : Text;
    priceRange : Text;
    category : Text;
  };

  type ServiceInput = {
    name : Text;
    nameHindi : Text;
    description : Text;
    descriptionHindi : Text;
    priceRange : Text;
    category : Text;
  };

  public type Result<T, E> = { #ok : T; #err : E };

  public type Settings = {
    businessName : Text;
    contactPhone : Text;
    whatsappNumber : Text;
    businessAddress : Text;
    businessHours : Text;
  };

  var settings : Settings = {
    businessName = "DKAN Enterprises";
    contactPhone = "+91-8009675645";
    whatsappNumber = "+91-8009675645";
    businessAddress = "Kanpur, Uttar Pradesh";
    businessHours = "Mon-Sat: 9am-7pm";
  };

  // ================= ADMIN PROMOTION =================
  // Anyone who provides correct password gets promoted to admin immediately
  public shared ({ caller }) func _promoteToAdmin(password : Text) : async Bool {
    if (password == DKAN_ADMIN_PASSWORD) {
      AccessControl.promoteToAdmin(accessControlState, caller);
      true;
    } else {
      false;
    };
  };

  public query func getSettings() : async Settings {
    settings;
  };

  public query func getBookingById(bookingId : Nat) : async ?BookingRecord {
    bookings.get(bookingId);
  };

  public query func getAllServices() : async [Service] {
    services.values().toArray();
  };

  public query func getServiceById(id : Nat) : async ?Service {
    services.get(id);
  };

  public query func getServicesByCategory(category : Text) : async [Service] {
    services.values().toArray().filter(
      func(service) { service.category == category }
    );
  };

  public query func searchServicesByName(name : Text) : async [Service] {
    services.values().toArray().filter(
      func(service) { service.name.toLower().contains(#text(name.toLower())) }
    );
  };

  public shared ({ caller }) func createBooking(input : BookingInput) : async Result<Nat, Text> {
    if (input.customerName.isEmpty()) { return #err("Customer name cannot be empty") };
    if (input.phoneNumber.isEmpty()) { return #err("Phone number cannot be empty") };
    if (input.state.isEmpty()) { return #err("State cannot be empty") };
    if (input.district.isEmpty()) { return #err("District cannot be empty") };
    if (input.location.isEmpty()) { return #err("Location cannot be empty") };

    let bookingId = nextBookingId;
    nextBookingId += 1;

    let newBooking : BookingRecord = {
      id = bookingId;
      customerName = input.customerName;
      state = input.state;
      district = input.district;
      phoneNumber = input.phoneNumber;
      serviceType = input.serviceType;
      problemDescription = input.problemDescription;
      location = input.location;
      preferredDate = input.preferredDate;
      preferredTimeSlot = input.timeSlot;
      timestamp = Time.now();
      status = #pending;
    };

    bookings.add(bookingId, newBooking);

    let callerBookings = switch (bookingOwners.get(caller)) {
      case (null) { List.empty<Nat>() };
      case (?existing) { existing };
    };
    callerBookings.add(bookingId);
    bookingOwners.add(caller, callerBookings);

    #ok(bookingId);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      return null;
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  // =============== ADMIN QUERY FUNCTIONS =============
  public query ({ caller }) func getAllBookings() : async [BookingRecord] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all bookings");
    };
    bookings.values().toArray();
  };

  public query ({ caller }) func searchBookingsByCustomerName(name : Text) : async [BookingRecord] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized");
    };
    bookings.values().toArray().filter(
      func(b) { b.customerName.toLower().contains(#text(name.toLower())) }
    );
  };

  public query ({ caller }) func getBookingsByStatus(status : BookingStatus) : async [BookingRecord] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized");
    };
    bookings.values().toArray().filter(
      func(b) { b.status == status }
    );
  };

  public query ({ caller }) func getBookingsByServiceType(serviceType : ServiceType) : async [BookingRecord] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized");
    };
    bookings.values().toArray().filter(
      func(b) { b.serviceType == serviceType }
    );
  };

  public query ({ caller }) func getBookingsByLocation(location : Text) : async [BookingRecord] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized");
    };
    bookings.values().toArray().filter(
      func(b) { b.location.toLower().contains(#text(location.toLower())) }
    );
  };

  public query ({ caller }) func getBookingsByState(state : Text) : async [BookingRecord] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized");
    };
    bookings.values().toArray().filter(
      func(b) { b.state.toLower().contains(#text(state.toLower())) }
    );
  };

  public query ({ caller }) func getBookingsByDistrict(district : Text) : async [BookingRecord] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized");
    };
    bookings.values().toArray().filter(
      func(b) { b.district.toLower().contains(#text(district.toLower())) }
    );
  };

  public shared ({ caller }) func updateSettings(newSettings : Settings) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update settings");
    };
    settings := newSettings;
  };

  public shared ({ caller }) func updateBookingStatus(bookingId : Nat, newStatus : BookingStatus) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update booking status");
    };
    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking does not exist") };
      case (?booking) {
        bookings.add(bookingId, { booking with status = newStatus });
      };
    };
  };

  public shared ({ caller }) func createService(input : ServiceInput) : async Result<Service, Text> {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      return #err("Unauthorized: Only admins can create services");
    };
    let serviceId = nextServiceId;
    nextServiceId += 1;

    let newService : Service = {
      id = serviceId;
      name = input.name;
      nameHindi = input.nameHindi;
      description = input.description;
      descriptionHindi = input.descriptionHindi;
      priceRange = input.priceRange;
      category = input.category;
    };

    services.add(serviceId, newService);
    #ok(newService);
  };

  public shared ({ caller }) func deleteService(id : Nat) : async Result<Bool, Text> {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      return #err("Unauthorized: Only admins can delete services");
    };
    if (not services.containsKey(id)) {
      return #err("Service does not exist");
    };
    services.remove(id);
    #ok(true);
  };

  public query func getDistrictsByState(state : Text) : async [Text] {
    switch (districtMappings.get(state)) {
      case (null) { [] };
      case (?districts) { districts.toArray() };
    };
  };

  public type DistrictData = {
    state : Text;
    districts : [Text];
  };

  let districtMappings = Map.empty<Text, List.List<Text>>();
};
