# DKAN Enterprises

## Current State
Admin panel has persistent "Re-login Required" error. Root cause: `promoteToAdmin` function was not defined in `access-control.mo`, and `getUserRole` would `Runtime.trap` for any unregistered principal.

## Requested Changes (Diff)

### Add
- `promoteToAdmin` function in `access-control.mo` that directly sets principal as admin without requiring existing admin check

### Modify
- `getUserRole` in `access-control.mo`: return `#guest` instead of `Runtime.trap` for unregistered users
- `hasPermission` now works safely for all principals

### Remove
- Nothing

## Implementation Plan
1. Fix `access-control.mo`: add `promoteToAdmin`, change `getUserRole` to return `#guest` for unknown principals
2. Keep `main.mo` backend `_promoteToAdmin` calling the now-properly-defined `AccessControl.promoteToAdmin`
3. No frontend changes needed - the admin flow already calls `_promoteToAdmin` correctly
