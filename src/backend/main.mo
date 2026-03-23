import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // ================= TYPE DEFINITIONS =================

  public type ServiceType = {
    #acRepair;
    #washingMachineRepair;
    #refrigeratorRepair;
    #microwaveRepair;
    #geyserRepair;
    #lcdLedTvRepair;
    #waterPurifier;
  };

  public type TimeSlot = {
    #morning_9_12;
    #afternoon_12_4;
    #evening_4_7;
  };

  public type BookingInput = {
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

  public type BookingStatus = {
    #pending;
    #confirmed;
    #inProgress;
    #completed;
    #cancelled;
  };

  public type BookingRecord = {
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

  public type Service = {
    id : Nat;
    name : Text;
    nameHindi : Text;
    description : Text;
    descriptionHindi : Text;
    priceRange : Text;
    category : Text;
  };

  public type ServiceInput = {
    name : Text;
    nameHindi : Text;
    description : Text;
    descriptionHindi : Text;
    priceRange : Text;
    category : Text;
  };

  public type Result<T, E> = { #ok : T; #err : E };

  public type DistrictData = {
    state : Text;
    districts : [Text];
  };

  public type Settings = {
    businessName : Text;
    contactPhone : Text;
    whatsappNumber : Text;
    businessAddress : Text;
    businessHours : Text;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
  };

  // ================ SYSTEM STATE ===============
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let districtMappings = Map.empty<Text, List.List<Text>>();
  var nextBookingId = 1;
  var nextServiceId = 1;

  let services = Map.empty<Nat, Service>();
  let bookings = Map.empty<Nat, BookingRecord>();
  let bookingOwners = Map.empty<Principal, List.List<Nat>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var settings : Settings = {
    businessName = "DKAN Enterprises";
    contactPhone = "+91-8009675645";
    whatsappNumber = "+91-8009675645";
    businessAddress = "Kanpur, Uttar Pradesh";
    businessHours = "Mon-Sat: 9am-7pm";
  };

  // ================= PUBLIC QUERIES =================
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

  public query func getDistrictsByState(state : Text) : async [Text] {
    switch (districtMappings.get(state)) {
      case (null) { [] };
      case (?districts) { districts.toArray() };
    };
  };

  // ================= PUBLIC BOOKING =================
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

  public query ({ caller }) func getOwnBookings() : async [BookingRecord] {
    switch (bookingOwners.get(caller)) {
      case (null) { [] };
      case (?bookingsList) {
        bookingsList.toArray().filterMap(
          func(id) { bookings.get(id) }
        );
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // =============== ADMIN FUNCTIONS =============
  public query ({ caller }) func getAllBookings() : async Result<[BookingRecord], Text> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all bookings");
    };
    #ok(bookings.values().toArray());
  };

  public shared ({ caller }) func updateBookingStatus(bookingId : Nat, newStatus : BookingStatus) : async Result<Bool, Text> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update booking status");
    };
    switch (bookings.get(bookingId)) {
      case (null) { #err("Booking does not exist") };
      case (?booking) {
        bookings.add(bookingId, { booking with status = newStatus });
        #ok(true);
      };
    };
  };

  public shared ({ caller }) func deleteBooking(id : Nat) : async Result<Bool, Text> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete bookings");
    };
    if (not bookings.containsKey(id)) {
      return #err("Booking does not exist");
    };
    bookings.remove(id);
    #ok(true);
  };

  public shared ({ caller }) func updateSettings(newSettings : Settings) : async Result<Bool, Text> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update settings");
    };
    settings := newSettings;
    #ok(true);
  };

  public shared ({ caller }) func createService(input : ServiceInput) : async Result<Service, Text> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create services");
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete services");
    };
    if (not services.containsKey(id)) {
      return #err("Service does not exist");
    };
    services.remove(id);
    #ok(true);
  };
};
