# Security Specification — SLIIT Freelance Hub

## 1. Data Invariants
1. **Campus-Only Access**: Only authenticated users with verified emails who hold a valid `users/{uid}` profile with `verifiedCampus == true`, a valid `@my.sliit.lk` or `@sliit.lk` email, and a valid SLIIT Student ID (`^(IT|BM|EN|HS|AR|GS)[0-9]{8}$`) may publish gigs or place orders.
2. **PII Isolation**: User profiles (`/users/{userId}`) contain `sliitEmail` and `sliitStudentId`; reads are strictly restricted to the profile owner or the platform founder/admin (`kalanamahisuru@gmail.com`). Blanket `list` queries by students are denied.
3. **Immutable 25% Commission Split**: Every `/orders/{orderId}` must lock `platformFeeRate == 0.25`, `platformFeeLkr >= 0`, `sellerPayoutLkr >= 0`, and `platformFeeLkr + sellerPayoutLkr == grossAmountLkr`. Financial amounts and participant IDs are immutable after order creation.
4. **No Self-Ordering & State Integrity**: Buyers cannot purchase their own gigs (`buyerId != sellerId`). Order transitions follow `in_progress -> delivered -> completed` (or `in_progress -> cancelled`). Terminal states (`completed`, `cancelled`) cannot be mutated by non-admins.
5. **No Self-Assigned Admin**: Users cannot set `role: "admin"` or arbitrary shadow fields on any document.

## 2. The Dirty Dozen Adversarial Payloads
1. **Unverified Gmail Profile Spoof**: Creating `/users/attacker` with `sliitEmail: "attacker@gmail.com"` -> **DENIED** (fails SLIIT domain regex).
2. **Self-Assigned Admin Escalation**: Creating `/users/attacker` with `role: "admin"` -> **DENIED** (`role == 'student'` and `hasOnly` check).
3. **Shadow Field Injection**: Updating `/gigs/g1` with `{ isFeatured: true, priceLkr: 5000 }` -> **DENIED** (`hasOnly` and `affectedKeys().hasOnly`).
4. **Zero-Fee Order Bypass**: Creating `/orders/o1` with `grossAmountLkr: 10000, platformFeeRate: 0, platformFeeLkr: 0, sellerPayoutLkr: 10000` -> **DENIED** (`platformFeeRate == 0.25` and `platformFeeLkr == round(grossAmountLkr * 0.25)`).
5. **PII Blanket Read**: Student `u1` calling `getDocs(collection(db, 'users'))` -> **DENIED** (`allow list: if isBootstrappedAdmin()`).
6. **Cross-User Gig Hijack**: Student `u2` updating `/gigs/g1` owned by `u1` -> **DENIED** (`existing().sellerId == request.auth.uid`).
7. **Self-Purchase Fee Manipulation**: Seller `u1` creating an order where `buyerId == sellerId` -> **DENIED** (`incoming().buyerId != incoming().sellerId`).
8. **State Shortcutting**: Seller jumping order from `in_progress` directly to `completed` -> **DENIED** (only buyer can complete from `delivered`).
9. **Terminal State Reopening**: Buyer changing `completed` order back to `in_progress` -> **DENIED** (terminal state lock).
10. **ID Poisoning**: Creating `/gigs/<2000-char-id>` -> **DENIED** (`isValidId(gigId)` regex & size <= 128).
11. **Timestamp Forgery**: Creating `/orders/o1` with backdated `createdAt` -> **DENIED** (`incoming().createdAt == request.time`).
12. **Unverified Email Spoof**: Request where `request.auth.token.email_verified == false` -> **DENIED** (`isVerifiedEmail()`).
