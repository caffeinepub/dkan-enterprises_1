import Time "mo:core/Time";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
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

  type BookingStatus = {
    #pending;
    #confirmed;
    #inProgress;
    #completed;
    #cancelled;
  };

  type UserProfile = {
    name : Text;
    email : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let bookings = Map.empty<Nat, BookingRecord>();
  var nextBookingId = 1;

  // Service management state
  var nextServiceId = 1;
  let services = Map.empty<Nat, Service>();

  type ServiceInput = {
    name : Text;
    nameHindi : Text;
    description : Text;
    descriptionHindi : Text;
    priceRange : Text;
    category : Text;
  };

  type Service = {
    id : Nat;
    name : Text;
    nameHindi : Text;
    description : Text;
    descriptionHindi : Text;
    priceRange : Text;
    category : Text;
  };

  public type Result<T, E> = { #ok : T; #err : E };

  // Site-wide settings
  public type Settings = {
    businessName : Text;
    contactPhone : Text;
    whatsappNumber : Text;
    businessAddress : Text;
    businessHours : Text;
  };

  var settings : Settings = {
    businessName = "JIVATRA Home Appliance Repair";
    contactPhone = "+91 90354 30990";
    whatsappNumber = "+91 90354 30990";
    businessAddress = "Shop Number 2, City Light Road, Surat";
    businessHours = "Mon-Sat: 9am-7pm";
  };

  public query func getSettings() : async Settings {
    settings;
  };

  public shared ({ caller }) func updateSettings(newSettings : Settings) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update settings");
    };
    settings := newSettings;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their profile");
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

  // createBooking is open to all callers (guests can submit bookings from the public form)
  public shared ({ caller }) func createBooking(input : BookingInput) : async Result<Nat, Text> {
    // Validate input
    if (input.customerName.isEmpty()) {
      return #err("Customer name cannot be empty");
    };
    if (input.phoneNumber.isEmpty()) {
      return #err("Phone number cannot be empty");
    };
    if (input.state.isEmpty()) {
      return #err("State cannot be empty");
    };
    if (input.district.isEmpty()) {
      return #err("District cannot be empty");
    };
    if (input.location.isEmpty()) {
      return #err("Location cannot be empty");
    };

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
    #ok(bookingId);
  };

  public query func getBookingById(bookingId : Nat) : async ?BookingRecord {
    bookings.get(bookingId);
  };

  public shared ({ caller }) func updateBookingStatus(bookingId : Nat, newStatus : BookingStatus) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update booking status");
    };
    switch (bookings.get(bookingId)) {
      case (null) {
        Runtime.trap("Booking does not exist");
      };
      case (?booking) {
        let updatedBooking = { booking with status = newStatus };
        bookings.add(bookingId, updatedBooking);
      };
    };
  };

  public query ({ caller }) func getAllBookings() : async [BookingRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all bookings");
    };
    bookings.values().toArray();
  };

  public query ({ caller }) func searchBookingsByCustomerName(name : Text) : async [BookingRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can search bookings");
    };
    bookings.values().toArray().filter(
      func(b) {
        b.customerName.toLower().contains(#text(name.toLower()));
      }
    );
  };

  public query ({ caller }) func getBookingsByStatus(status : BookingStatus) : async [BookingRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can filter bookings by status");
    };
    bookings.values().toArray().filter(
      func(b) {
        b.status == status;
      }
    );
  };

  public query ({ caller }) func getBookingsByServiceType(serviceType : ServiceType) : async [BookingRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can filter bookings by service type");
    };
    bookings.values().toArray().filter(
      func(b) {
        b.serviceType == serviceType;
      }
    );
  };

  public query ({ caller }) func getBookingsByLocation(location : Text) : async [BookingRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can filter bookings by location");
    };
    bookings.values().toArray().filter(
      func(b) {
        b.location.toLower().contains(#text(location.toLower()));
      }
    );
  };

  public shared ({ caller }) func createService(input : ServiceInput) : async Result<Service, Text> {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
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
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete services");
    };
    if (not services.containsKey(id)) {
      return #err("Service does not exist");
    };

    services.remove(id);
    #ok(true);
  };

  public query func getAllServices() : async [Service] {
    services.values().toArray();
  };

  public query func getServiceById(id : Nat) : async ?Service {
    services.get(id);
  };

  public query func getServicesByCategory(category : Text) : async [Service] {
    services.values().toArray().filter(
      func(service) {
        service.category == category;
      }
    );
  };

  public query func searchServicesByName(name : Text) : async [Service] {
    services.values().toArray().filter(
      func(service) {
        service.name.toLower().contains(#text(name.toLower()));
      }
    );
  };

  public query ({ caller }) func getBookingsByState(state : Text) : async [BookingRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can filter bookings by state");
    };
    bookings.values().toArray().filter(
      func(b) {
        b.state.toLower().contains(#text(state.toLower()));
      }
    );
  };

  public query ({ caller }) func getBookingsByDistrict(district : Text) : async [BookingRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can filter bookings by district");
    };
    bookings.values().toArray().filter(
      func(b) {
        b.district.toLower().contains(#text(district.toLower()));
      }
    );
  };

  public query func getDistrictsByState(state : Text) : async [Text] {
    switch (districtMappings.get(state)) {
      case (null) { [] };
      case (?districts) { districts };
    };
  };

  let districtMappings = Map.fromIter([
    (
      "gujarat",
      [
        "ahmedabad",
        "amreli",
        "anand",
        "aravalli",
        "banaskantha",
        "bharuch",
        "bhavnagar",
        "botad",
        "chhota udepur",
        "dahod",
        "dang",
        "devbhoomi dwarka",
        "gandhinagar",
        "gir somnath",
        "jamnagar",
        "junagadh",
        "kachchh",
        "kheda",
        "mahisagar",
        "mehsana",
        "morbi",
        "narmada",
        "navsari",
        "panchmahal",
        "patan",
        "porbandar",
        "rajkot",
        "sabarkantha",
        "surat",
        "surendranagar",
        "tapi",
        "vadodara",
        "valsad",
      ],
    ),
    (
      "maharashtra",
      [
        "ahmednagar",
        "akola",
        "amravati",
        "aurangabad",
        "beed",
        "bhandara",
        "buldhana",
        "chandrapur",
        "dhule",
        "gadchiroli",
        "gondia",
        "hingoli",
        "jalgaon",
        "jalna",
        "kolhapur",
        "latur",
        "mumbai city",
        "mumbai suburban",
        "nagpur",
        "nanded",
        "nandurbar",
        "nashik",
        "osmanabad",
        "palghar",
        "parbhani",
        "pune",
        "raigad",
        "ratnagiri",
        "sangli",
        "satara",
        "sindhudurg",
        "solapur",
        "thane",
        "wardha",
        "washim",
        "yavatmal",
      ],
    ),
    (
      "madhya pradesh",
      [
        "agar malwa",
        "alirajpur",
        "anuppur",
        "ashoknagar",
        "balaghat",
        "barwani",
        "betul",
        "bhind",
        "bhopal",
        "burhanpur",
        "chhatarpur",
        "chhindwara",
        "damoh",
        "datia",
        "dewas",
        "dhar",
        "dindori",
        "guna",
        "gwalior",
        "harda",
        "hoshangabad",
        "indore",
        "jabalpur",
        "jhabua",
        "katni",
        "khandwa",
        "khargone",
        "mandla",
        "mandsaur",
        "morena",
        "narsinghpur",
        "neemuch",
        "panna",
        "raisen",
        "rajgarh",
        "ratlam",
        "rewa",
        "sagar",
        "satna",
        "sehore",
        "seoni",
        "shahdol",
        "shajapur",
        "sheopur",
        "shivpuri",
        "sidhi",
        "singrauli",
        "tikamgarh",
        "ujjain",
        "umaria",
        "vidisha",
      ],
    ),
  ].values());
};
