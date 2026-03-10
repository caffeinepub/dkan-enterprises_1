import AccessControl "./access-control";

mixin (accessControlState : AccessControl.AccessControlState) {
  // Initialize: first caller with correct password becomes admin
  public shared ({ caller }) func _initializeAccessControlWithSecret(userPassword : Text) : async () {
    // Use hardcoded admin password - first caller with correct password becomes admin
    let adminPassword = "admin123";
    AccessControl.initialize(accessControlState, caller, adminPassword, userPassword);
  };

  // Re-register as admin if already registered as user (for existing deployments)
  public shared ({ caller }) func _promoteToAdmin(userPassword : Text) : async Bool {
    if (userPassword != "admin123") { return false };
    if (caller.isAnonymous()) { return false };
    // If admin not yet assigned, assign this caller as admin
    if (not accessControlState.adminAssigned) {
      accessControlState.userRoles.add(caller, #admin);
      accessControlState.adminAssigned := true;
      return true;
    };
    // Already has an admin - check if caller is already admin
    return AccessControl.isAdmin(accessControlState, caller);
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
