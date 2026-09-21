# Subscriptions (planned for v2)

Schema is ready in Prisma (`SubscriptionPlan`, `UserSubscription`). Checkout is **not** wired in v1.x.

## Planned plans

| Code | Audience | Highlights |
|---|---|---|
| `free` | Individuals | Matches, tracker, local AI fallback |
| `pro` | Power users | Higher AI + tailor limits |
| `team` | Agencies | Seats for PM + Bidder/Caller/Developer |
| `enterprise` | Orgs | SSO, audit exports, custom SLAs |

## v2 delivery checklist

1. **Billing provider** — Stripe (or Paddle) Checkout + Customer Portal
2. **Webhooks** — sync `UserSubscription.status` / period dates
3. **Entitlements** — enforce `maxApplications`, `maxAiRequests`, `maxSeats` in API
4. **Team seats** — invite flow tied to Team plan seat count
5. **Upgrade CTA** — enable Profile → Subscription buttons (currently “Coming in v2”)
6. **Invoices / receipts** — link from Profile
7. **Trials** — `status=trialing` already supported in schema

## Current behavior (v1.1)

- Plans are seeded and shown on **Profile → Subscription** as a preview
- New users are attached to the **Free** plan when present
- `GET /api/billing/plans` returns `billingEnabled: false`
