# Specification

## Summary
**Goal:** Fix the booking form so that errors and successes are handled and displayed correctly in both Hindi and English.

**Planned changes:**
- Investigate and fix the BookingForm component to correctly handle Promise rejections and actor call failures without crashing or showing spurious error messages
- On successful booking submission, display a proper success confirmation message and no error message
- On booking failure (validation, backend, or network error), display a clear, user-friendly error message in the active language (Hindi/English)
- Add/update bilingual translation strings in `translations.ts` for `bookingSuccess`, `bookingError`, and `bookingNetworkError` in both Hindi and English
- Update the BookingForm to render these translated strings dynamically based on the active language context
- Review and update the backend `createBooking` (or equivalent) function in `main.mo` to return a `Result` type (`#ok` / `#err`) with a descriptive error message string on failure

**User-visible outcome:** Users submitting the booking form will see a clear success message on successful booking, and a descriptive bilingual error message when something goes wrong — with no unhandled or misleading error messages appearing.
