import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // ================= TYPE DEFINITIONS =================

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
    serviceType : Text;
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
    serviceType : Text;
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
  // Keep old stable vars for upgrade compatibility (not used for auth)
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let districtMappings = Map.empty<Text, List.List<Text>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextBookingId = 1;
  var nextServiceId = 1;

  let services = Map.empty<Nat, Service>();
  let bookings = Map.empty<Nat, BookingRecord>();
  let bookingOwners = Map.empty<Principal, List.List<Nat>>();

  var settings : Settings = {
    businessName = "DKAN Enterprises";
    contactPhone = "+91-8009675645";
    whatsappNumber = "+91-8009675645";
    businessAddress = "Kanpur, Uttar Pradesh";
    businessHours = "Mon-Sat: 9am-7pm";
  };

  // Seed default services
  let _seed1 : Service = {
    id = nextServiceId;
    name = "AC Repair";
    nameHindi = "एसी मरम्मत";
    description = "AC repair and servicing";
    descriptionHindi = "एसी मरम्मत और सर्विसिंग";
    priceRange = "₹299-₹1999";
    category = "Appliance";
  };
  services.add(nextServiceId, _seed1);
  nextServiceId += 1;

  let _seed2 : Service = {
    id = nextServiceId;
    name = "Mobile Repair";
    nameHindi = "मोबाइल मरम्मत";
    description = "Mobile phone repair";
    descriptionHindi = "मोबाइल फोन मरम्मत";
    priceRange = "₹199-₹2999";
    category = "Electronics";
  };
  services.add(nextServiceId, _seed2);
  nextServiceId += 1;

  let _seed3 : Service = {
    id = nextServiceId;
    name = "Laptop Repair";
    nameHindi = "लैपटॉप मरम्मत";
    description = "Laptop repair and servicing";
    descriptionHindi = "लैपटॉप मरम्मत और सर्विसिंग";
    priceRange = "₹499-₹4999";
    category = "Electronics";
  };
  services.add(nextServiceId, _seed3);
  nextServiceId += 1;

  let _seed4 : Service = {
    id = nextServiceId;
    name = "Chip Level Repair";
    nameHindi = "चिप लेवल मरम्मत";
    description = "Chip level board repair";
    descriptionHindi = "चिप लेवल बोर्ड मरम्मत";
    priceRange = "₹999-₹5999";
    category = "Electronics";
  };
  services.add(nextServiceId, _seed4);
  nextServiceId += 1;

  let _seed5 : Service = {
    id = nextServiceId;
    name = "Refrigerator Repair";
    nameHindi = "रेफ्रिजरेटर मरम्मत";
    description = "Fridge repair and servicing";
    descriptionHindi = "फ्रिज मरम्मत और सर्विसिंग";
    priceRange = "₹299-₹1999";
    category = "Appliance";
  };
  services.add(nextServiceId, _seed5);
  nextServiceId += 1;

  let _seed6 : Service = {
    id = nextServiceId;
    name = "Washing Machine Repair";
    nameHindi = "वाशिंग मशीन मरम्मत";
    description = "Washing machine repair";
    descriptionHindi = "वाशिंग मशीन मरम्मत";
    priceRange = "₹299-₹1999";
    category = "Appliance";
  };
  services.add(nextServiceId, _seed6);
  nextServiceId += 1;

  let _seed7 : Service = {
    id = nextServiceId;
    name = "LED/LCD TV Repair";
    nameHindi = "एलईडी/एलसीडी टीवी मरम्मत";
    description = "TV repair and servicing";
    descriptionHindi = "टीवी मरम्मत और सर्विसिंग";
    priceRange = "₹399-₹2999";
    category = "Electronics";
  };
  services.add(nextServiceId, _seed7);
  nextServiceId += 1;

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

  // =============== ADMIN FUNCTIONS (no auth checks - password verified on frontend) =============
  public query func getAllBookings() : async Result<[BookingRecord], Text> {
    #ok(bookings.values().toArray());
  };

  public shared func updateBookingStatus(bookingId : Nat, newStatus : BookingStatus) : async Result<Bool, Text> {
    switch (bookings.get(bookingId)) {
      case (null) { #err("Booking does not exist") };
      case (?booking) {
        bookings.add(bookingId, { booking with status = newStatus });
        #ok(true);
      };
    };
  };

  public shared func deleteBooking(id : Nat) : async Result<Bool, Text> {
    if (not bookings.containsKey(id)) {
      return #err("Booking does not exist");
    };
    bookings.remove(id);
    #ok(true);
  };

  public shared func updateSettings(newSettings : Settings) : async Result<Bool, Text> {
    settings := newSettings;
    #ok(true);
  };

  public shared func createService(input : ServiceInput) : async Result<Service, Text> {
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

  public shared func deleteService(id : Nat) : async Result<Bool, Text> {
    if (not services.containsKey(id)) {
      return #err("Service does not exist");
    };
    services.remove(id);
    #ok(true);
  };

  // Keep old public functions that frontend bindings may reference
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };
};
