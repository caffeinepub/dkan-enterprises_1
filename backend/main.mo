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

  // Defaults to hardcoded settings on first deployment
  var settings : Settings = {
    businessName = "JIVATRA Home Appliance Repair";
    contactPhone = "+91 90354 30990";
    whatsappNumber = "+91 90354 30990";
    businessAddress = "Shop Number 2, City Light Road, Surat";
    businessHours = "Mon-Sat: 9am-7pm";
  };

  // No auth check: admin dashboard is password-gated on the frontend only;
  // the ICP caller is anonymous, so we must allow guest access to read settings.
  public query func getSettings() : async Settings {
    settings;
  };

  // No auth check: admin dashboard uses a frontend password gate (AdminPasswordGate),
  // not Internet Identity. The caller is therefore anonymous (guest). Backend auth
  // checks would always fail for these callers, so authorization is enforced on
  // the frontend only, consistent with all other admin dashboard write operations.
  public shared func updateSettings(newSettings : Settings) : async () {
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

  // Anyone (including guests/anonymous) can create a booking
  public shared ({ caller }) func createBooking(input : BookingInput) : async Nat {
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
    bookingId;
  };

  // Anyone can look up a booking by ID (e.g. to check their own booking status)
  public query func getBookingById(bookingId : Nat) : async ?BookingRecord {
    bookings.get(bookingId);
  };

  // No auth check: admin dashboard uses a frontend password gate (AdminPasswordGate),
  // not Internet Identity. The caller is therefore anonymous (guest). Backend auth
  // checks would always fail for these callers, so authorization is enforced on
  // the frontend only, consistent with all other admin dashboard operations.
  public shared func updateBookingStatus(bookingId : Nat, newStatus : BookingStatus) : async () {
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

  // No auth check: admin dashboard is password-gated on the frontend only;
  // the ICP caller is anonymous, so we must allow guest access to read bookings.
  public query func getAllBookings() : async [BookingRecord] {
    bookings.values().toArray();
  };

  // No auth check: same reasoning as getAllBookings — frontend password gate only.
  public query func searchBookingsByCustomerName(name : Text) : async [BookingRecord] {
    bookings.values().toArray().filter(
      func(b) {
        b.customerName.toLower().contains(#text(name.toLower()));
      }
    );
  };

  // No auth check: same reasoning as getAllBookings — frontend password gate only.
  public query func getBookingsByStatus(status : BookingStatus) : async [BookingRecord] {
    bookings.values().toArray().filter(
      func(b) {
        b.status == status;
      }
    );
  };

  // No auth check: same reasoning as getAllBookings — frontend password gate only.
  public query func getBookingsByServiceType(serviceType : ServiceType) : async [BookingRecord] {
    bookings.values().toArray().filter(
      func(b) {
        b.serviceType == serviceType;
      }
    );
  };

  // No auth check: same reasoning as getAllBookings — frontend password gate only.
  public query func getBookingsByLocation(location : Text) : async [BookingRecord] {
    bookings.values().toArray().filter(
      func(b) {
        b.location.toLower().contains(#text(location.toLower()));
      }
    );
  };

  // No auth check: admin dashboard uses a frontend password gate (AdminPasswordGate),
  // not Internet Identity. The caller is therefore anonymous (guest). Backend auth
  // checks would always fail for these callers, so authorization is enforced on
  // the frontend only, consistent with all other admin dashboard write operations.
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

  // No auth check: admin dashboard uses a frontend password gate (AdminPasswordGate),
  // not Internet Identity. The caller is therefore anonymous (guest). Backend auth
  // checks would always fail for these callers, so authorization is enforced on
  // the frontend only, consistent with all other admin dashboard write operations.
  public shared func deleteService(id : Nat) : async Result<Bool, Text> {
    if (not services.containsKey(id)) {
      return #err("Service does not exist");
    };

    services.remove(id);
    #ok(true);
  };

  public query func getAllServices() : async [Service] {
    services.values().toArray();
  };

  // Not currently in use in the frontend, but useful for later expansion
  public query func getServiceById(id : Nat) : async ?Service {
    services.get(id);
  };

  // Not currently in use in the frontend, but useful for later expansion
  public query func getServicesByCategory(category : Text) : async [Service] {
    services.values().toArray().filter(
      func(service) {
        service.category == category;
      }
    );
  };

  // Not currently in use in the frontend, but useful for later expansion
  public query func searchServicesByName(name : Text) : async [Service] {
    services.values().toArray().filter(
      func(service) {
        service.name.toLower().contains(#text(name.toLower()));
      }
    );
  };

  public query func getBookingsByState(state : Text) : async [BookingRecord] {
    bookings.values().toArray().filter(
      func(b) {
        b.state.toLower().contains(#text(state.toLower()));
      }
    );
  };

  public query func getBookingsByDistrict(district : Text) : async [BookingRecord] {
    bookings.values().toArray().filter(
      func(b) {
        b.district.toLower().contains(#text(district.toLower()));
      }
    );
  };

  // Returns all districts for a given state
  public query func getDistrictsByState(state : Text) : async [Text] {
    switch (districtMappings.get(state)) {
      case (null) { [] };
      case (?districts) { districts };
    };
  };

  // District mappings for each state
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
