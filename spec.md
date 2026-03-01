# DKAN Enterprises

## Current State
Full-stack service booking website for DKAN Enterprises (Kanpur, UP). Features: Hindi/English bilingual UI, booking form with All-India state/district selection, admin dashboard with bookings/services/settings management, WhatsApp floating button, SevaMitra partner badge.

**Core bug:** `access-control.mo` `getUserRole` function calls `Runtime.trap("User is not registered")` when a principal is not found in userRoles map. This causes `hasPermission` to throw an error instead of returning `false`, so `getAllBookings` and other admin queries fail with an authorization error even after successful Internet Identity login and `_initializeAccessControlWithSecret` call.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- Fix `getUserRole` in access-control.mo: when principal is not in userRoles map, return `#guest` instead of calling `Runtime.trap`. This ensures `hasPermission` correctly returns `false` for unregistered principals instead of throwing.

### Remove
- Nothing

## Implementation Plan
1. Regenerate backend Motoko code with the access-control bug fixed: `getUserRole` returns `#guest` for unregistered (non-anonymous) principals instead of trapping.
2. Keep all existing backend functions identical (bookings, services, settings, authorization).
3. No frontend changes needed.
