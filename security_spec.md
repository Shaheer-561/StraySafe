# StraySafe Security Specification

## Data Invariants
1. A user can only edit their own profile, except for grade points and grade which are system-managed or admin-managed (via actions).
2. Only Volunteers/Vets/Admins can update report status to "In Progress" or "Resolved".
3. Reporters can only create reports and update their own reports while they are "Pending".
4. Grade points must be positive.
5. Critical reports (emergency) must have a priority of "High".

## The Dirty Dozen Payloads
1. **Unauthorized Profile Edit**: User A tries to change User B's `displayName`.
2. **Points Spoof**: User tries to increment their own `gradePoints` directly.
3. **Escalation**: User tries to change their `role` to `admin` during profile update.
4. **Illegal Status Jump**: Reporter tries to mark their own report as "Resolved" without any volunteer action.
5. **Orphaned Report**: Creating a report with a `reporterId` that doesn't match the authenticated user.
6. **Large Payload**: Injecting 1MB of junk text into the report `description`.
7. **Invalid ID**: Using special characters or extreme length for `userId`.
8. **Malicious Report**: Setting `isEmergency` to true but `priority` to "Low" (violating business logic).
9. **Private Information Leak**: Authenticated user B tries to read the `email` of User A (if we decide email is private).
10. **Shadow Field**: Adding `isVerified: true` to a report to skip validation.
11. **Time Travel**: Manually setting `createdAt` to a date in the past.
12. **Double Action**: Resolving a case twice to get double points (if logic is on client).

## Proposed Rules Logic
- `isValidUser`: Checks keys, types, and restricts sensitive fields like `role` and `gradePoints` on client-side updates.
- `isValidReport`: Checks mandatory fields and field lengths.
- `isStaff`: Helper to check if the user is a volunteer, vet, or admin.
