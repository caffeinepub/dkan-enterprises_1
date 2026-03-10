import AccessControl "./access-control";

mixin (accessControlState : AccessControl.AccessControlState) {
  // Initialize auth — tries CAFFEINE_ADMIN_TOKEN first, falls back to hardcoded password
  public shared ({ caller }) func _initializeAccessControlWithSecret(userSecret : Text) : async () {
    if (caller.isAnonymous()) { return };
    // Always try to register caller; if already registered skip
    switch (accessControlState.userRoles.get(caller)) {
      case (?_) {}; // already registered
      case (null) {
        // Register as user by default
        accessControlState.userRoles.add(caller, #user);
      };
    };
  };

  // Promote caller to admin if they provide the correct password
  public shared ({ caller }) func _promoteToAdmin(password : Text) : async Bool {
    if (caller.isAnonymous()) { return false };
    if (password == "admin123") {
      accessControlState.userRoles.add(caller, #admin);
      accessControlState.adminAssigned := true;
      true
    } else {
      false
    };
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };
};
