# Build the GrowthBridge Admin Portal

## What will be built

- Add a separate `/admin/login` page using the existing email/password sign-in, followed by a server-verified staff-role check.
- Add a protected admin shell with GBB branding, responsive sidebar/navigation, current staff identity and secure sign-out.
- Add these working screens:
  - `/admin/dashboard` — live totals, pending queues, recent transactions and recent admin actions.
  - `/admin/users` — searchable customer list with account and verification status.
  - `/admin/kyc` — pending/all verification reviews with approve, reject and review actions.
  - `/admin/deposits` and `/admin/withdrawals` — real credit/debit requests with approval or rejection and required confirmation.
  - `/admin/transfers` — transfer queue and decisions.
  - `/admin/loans` — loan applications and valid lifecycle decisions.
  - `/admin/transactions` — searchable/filterable full transaction ledger.
  - `/admin/audit-logs` — searchable, read-only record of administrator actions.
- Add clear loading, empty, error, disabled and read-only states throughout.
- Remove the requested bank-status disclaimer from the homepage and shared footer, plus matching copies in About and Help so the statement does not remain elsewhere.

## Security and behavior

- Every private data request continues through the existing authenticated server functions and database access rules.
- Every admin page verifies the signed-in account has a staff role; ordinary customers are redirected to the admin login with a generic unauthorized message.
- Staff with view-only permissions can inspect data but cannot see enabled approval controls.
- Approval and rejection actions use the existing secured database routines, preserve balance safety, and create audit records.
- Rejections require a reason; success appears only after the database confirms the action.
- No administrator password or role is hard-coded. The portal will accept only an existing account that has an authorized role.

## Technical details

- Reuse `src/lib/admin.functions.ts`, TanStack server functions, the existing GBB design tokens and existing UI controls.
- Add a client-side admin guard after authentication rather than putting protected server calls in public page loaders.
- Correct the loan status options to match the database enum before wiring loan decisions.
- Sanitize admin search text before constructing database filters to prevent malformed filter expressions.
- Keep the existing customer dashboard, customer routes, authentication and admin database routines intact.

## Verification

- Check all admin URLs at phone and desktop widths.
- Verify unauthorized visitors cannot render admin data.
- Verify successful staff navigation, filters, dialogs, sign-out and error/retry states.
- Check the final app build and runtime logs, and confirm the removed statement no longer appears in user-facing source.
