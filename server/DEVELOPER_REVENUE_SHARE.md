# Developer Revenue Share Implementation

## Overview

This project implements a 5% developer revenue share on all subscription packages. The client agreed to add 5% to all plan prices, which is then split between the developers and the client using Paystack's split payment feature.

## How It Works

### 1. Price Markup (5%)

When admins create or update plans, a 5% markup is automatically added to the base price:

- **Example**: If the base price is GHS 100, the final price stored is GHS 105
- Users see the marked-up price (GHS 105) on the frontend
- The 5% difference (GHS 5) goes to the developers

### 2. Automatic Calculation

The markup is handled transparently in the backend:

```typescript
// Creating a plan with base price of 100
POST /api/admin/plans
{
  "price": 100,  // Base price input by admin
  ...
}

// Stored in database: 105 (automatically calculated)
```

### 3. Split Payment via Paystack

When users make payments:

- The full amount (GHS 105) is charged to the customer
- Paystack automatically splits the payment:
  - **95%** (GHS 100) → Client's main account
  - **5%** (GHS 5) → Developer's subaccount

## Setup Instructions

### Step 1: Create Paystack Subaccount

1. Log in to your Paystack Dashboard
2. Navigate to Settings → Subaccounts
3. Create a new subaccount for the developers:
   - **Account Name**: Developer Team
   - **Settlement Account**: Developer's bank account
   - **Revenue Split**: This is handled automatically by the code

4. Copy the **Subaccount Code** (format: `ACCT_xxxxxxxxxx`)

### Step 2: Configure Environment Variables

Add the developer subaccount code to your `.env` file:

```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_xxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
# Developer subaccount for split payments (5% revenue share)
PAYSTACK_DEVELOPER_SUBACCOUNT=ACCT_xxxxxxxxxx
```

Replace `ACCT_xxxxxxxxxx` with the actual subaccount code from Step 1.

### Step 3: Test the Implementation

#### Test Plan Creation

```bash
# Create a plan with base price of 100
POST /api/admin/plans
{
  "name": "Test Plan",
  "price": 100,
  "duration": 30,
  "targetRole": "STUDENT"
}

# Response will show price as 105 (with 5% markup)
{
  "success": true,
  "data": {
    "id": "...",
    "price": 105,  // Automatically calculated
    ...
  }
}
```

#### Test Payment Split

1. Subscribe to a plan (price: 105)
2. Initialize payment → Paystack charges 105
3. Check Paystack Dashboard:
   - Main account receives: 100
   - Developer subaccount receives: 5

## Code Components

### 1. Constants (`src/config/constants.ts`)

- `DEVELOPER_MARKUP_PERCENTAGE`: 5%
- `calculatePriceWithMarkup()`: Adds 5% to base price
- `calculateDeveloperShare()`: Calculates developer's portion

### 2. Plan Controller (`src/controllers/admin/plan.controller.ts`)

- `createPlan()`: Automatically adds 5% markup
- `updatePlan()`: Applies markup when price is updated

### 3. Payment Controller (`src/controllers/user/payment.controller.ts`)

- `initializePayment()`: Includes Paystack subaccount for split payments
- Uses `subaccount` parameter to direct 5% to developers
- `bearer: 'account'` ensures subaccount pays transaction fees

## Important Notes

### Transaction Fees

- Paystack charges ~1.5% + GHS 0.30 per transaction
- With `bearer: 'account'`, the **developer subaccount** pays these fees
- This means developers receive slightly less than 5% after fees

**Example**:

- Customer pays: GHS 105
- Client receives: GHS 100 (exactly)
- Developer receives: ~GHS 4.42 (5% minus Paystack fees)

### Testing vs Production

- Use test keys during development
- Create separate subaccounts for test and live environments
- Update environment variables when going live

### Existing Plans

Plans created before this implementation **will not** have the markup:

- Old plans: Price stored as-is (e.g., 100)
- New plans: Price includes markup (e.g., 105)

**Recommendation**: The client should:

1. Update all existing active plans to include the 5% markup
2. Or, migrate data by updating prices in database

## Migration Script (If Needed)

If you need to update existing plans with the 5% markup:

```typescript
// Run this once to update all existing plans
import prisma from "./src/config/database";
import { calculatePriceWithMarkup } from "./src/config/constants";

async function migrateExistingPlans() {
  const plans = await prisma.plan.findMany();

  for (const plan of plans) {
    const newPrice = calculatePriceWithMarkup(plan.price);

    await prisma.plan.update({
      where: { id: plan.id },
      data: { price: newPrice },
    });

    console.log(`Updated ${plan.name}: ${plan.price} → ${newPrice}`);
  }
}

// migrateExistingPlans();
```

**⚠️ Warning**: Only run migration once, or prices will be marked up multiple times!

## Verification Checklist

- [ ] Paystack subaccount created for developers
- [ ] Subaccount code added to `.env`
- [ ] Test plan creation shows 5% markup
- [ ] Payment initialization includes subaccount
- [ ] Test payment splits correctly in Paystack Dashboard
- [ ] Existing plans updated (if necessary)

## Support

For issues with:

- **Split payments not working**: Verify subaccount code is correct
- **Wrong amounts**: Check that markup is being applied in plan controller
- **Payment failures**: Check Paystack Dashboard for error details
