# Automated Background Jobs

This document describes the automated background jobs running in the UG Gymnasium system.

## Jobs Overview

### 1. Payment Cleanup Job

**File:** `src/jobs/paymentCleanup.job.ts`
**Schedule:** Every 15 minutes (`*/15 * * * *`)
**Purpose:** Automatically marks abandoned pending payments as FAILED

#### What it does:

- Finds all transactions with `PENDING` payment status
- Checks if they are older than the configured timeout (default: 30 minutes)
- Marks abandoned transactions as `FAILED`
- Updates associated subscriptions to `EXPIRED` status

#### Configuration:

Set the timeout in `.env`:

```env
PAYMENT_TIMEOUT_MINUTES=30  # Default: 30 minutes
```

#### Why it's needed:

- Users may close their browser during payment
- Payment gateway redirects may fail
- Network issues during payment
- Keeps the database clean by not leaving payments in PENDING indefinitely

---

### 2. Subscription Expiration Job

**File:** `src/jobs/subscriptionExpiration.job.ts`
**Schedule:** Daily at midnight (`0 0 * * *`)
**Purpose:** Automatically expires subscriptions that have reached their end date

#### What it does:

- Finds all active subscriptions with `endDate` in the past
- Marks them as `EXPIRED`
- Ensures users don't have access after subscription ends

---

## Cron Schedule Syntax

```
*    *    *    *    *
┬    ┬    ┬    ┬    ┬
│    │    │    │    │
│    │    │    │    └─ Day of week (0 - 7) (0 or 7 is Sunday)
│    │    │    └────── Month (1 - 12)
│    │    └─────────── Day of month (1 - 31)
│    └──────────────── Hour (0 - 23)
└───────────────────── Minute (0 - 59)
```

### Common Examples:

- `*/15 * * * *` - Every 15 minutes
- `0 0 * * *` - Daily at midnight
- `0 */6 * * *` - Every 6 hours
- `* * * * *` - Every minute (for testing only!)

---

## Manual Cleanup Endpoint

If you need to manually trigger payment cleanup (e.g., for testing):

```bash
POST /api/admin/transactions/cleanup-abandoned
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "Successfully marked 5 abandoned payment(s) as failed",
  "data": {
    "count": 5,
    "timeoutMinutes": 30
  }
}
```

---

## Monitoring

The jobs log their activity to the console/log files:

**Successful run (no abandoned payments):**

```
[INFO] Running payment cleanup job...
[INFO] Payment cleanup: No abandoned payments found
```

**Successful run (with cleanups):**

```
[INFO] Running payment cleanup job...
[INFO] Payment cleanup: Marked 3 abandoned payment(s) as FAILED
```

**Error:**

```
[ERROR] Payment cleanup job error: <error details>
```

---

## Testing

To test the payment cleanup job with a faster schedule, modify the cron expression in `paymentCleanup.job.ts`:

```typescript
// Test: Run every minute
cron.schedule("* * * * *", async () => {
  // ...
});

// Production: Run every 15 minutes
cron.schedule("*/15 * * * *", async () => {
  // ...
});
```

**Remember to change it back to the production schedule before deploying!**

---

## Troubleshooting

### Jobs not running?

1. Check if the server started successfully
2. Look for the log message: `Payment cleanup job scheduled (runs every 15 minutes)`
3. Check for any errors in the console/logs

### Need to change the timeout?

Update `PAYMENT_TIMEOUT_MINUTES` in your `.env` file and restart the server.

### Want to disable a job temporarily?

Comment out the job call in `src/index.ts`:

```typescript
// startPaymentCleanupJob(); // Temporarily disabled
```
