# PayU Callback Issue - Complete Investigation Report for ChatGPT

## CONTEXT: System Setup
- **Project**: Counsellors of India (Next.js 16.2.4 + React 19.2.4)
- **Hosting**: Vercel (deployed to https://counsellorsofindia.com)
- **Backend**: Next.js API routes
- **Payment Gateway**: PayU India (PRODUCTION environment)
- **Issue**: PayU payment callback not working - payments not being recorded after successful payment

---

## ENVIRONMENT DETAILS

### Framework & Infrastructure
- **Backend Framework**: Next.js 16.2.4
- **Frontend Framework**: React 19.2.4
- **Hosting Platform**: Vercel
- **Deployment URL**: https://counsellorsofindia.com
- **Node.js Version**: Default Vercel runtime (18+)
- **Configuration Output**: `output: 'standalone'`

### PayU Configuration (PRODUCTION)
```
PAYU_KEY=M6RB3T
PAYU_SALT=9DyKtFPyZL4icAVhyQiZuKYBsm5Bw1fB
PAYU_BASE_URL=https://secure.payu.in/_payment
NEXT_PUBLIC_APP_URL=https://counsellorsofindia.com
```

### Callback URLs
- **Callback Route**: POST `/api/payu/callback`
- **Success URL (surl)**: `https://counsellorsofindia.com/api/payu/callback`
- **Failure URL (furl)**: `https://counsellorsofindia.com/api/payu/callback`
- **HTTP Method**: PayU sends POST with form-urlencoded data

---

## CODE STRUCTURE

### File 1: Hash Configuration & Helpers
**Location**: `src/lib/payu.ts`

**Current Implementation**:
- Request hash: `SHA512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)`
- Response hash: `SHA512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)`
- Uses constant-time comparison for security: `crypto.timingSafeEqual()`
- Supports `additionalCharges` when present

**Functions**:
- `buildRequestHash()` - creates SHA-512 hash for form submission
- `buildResponseHash()` - creates SHA-512 hash for callback verification
- `verifyResponseHash()` - verifies callback hash against computed value
- `generateTxnId()` - creates unique transaction ID
- `formatAmount()` - formats rupees to 2-decimal string

---

### File 2: Payment Initiation Route
**Location**: `src/app/api/payu/initiate/route.ts`

**Current Implementation**:
```typescript
POST /api/payu/initiate

Body: { plan: 'starter' | 'pro' }

Returns:
{
  action: "https://secure.payu.in/_payment",
  fields: {
    key: PAYU_KEY,
    txnid: "plan<timestamp><random>",
    amount: "1.00" or "2499.00",
    productinfo: "COI Starter Plan" or "COI Pro Plan",
    firstname: extracted from user metadata,
    email: user.email,
    phone: user.phone metadata,
    udf1: user.id (therapist ID),
    udf2: plan name,
    surl: "https://counsellorsofindia.com/api/payu/callback",
    furl: "https://counsellorsofindia.com/api/payu/callback",
    hash: SHA512(...) computed on server
  }
}
```

**Pricing**:
- Starter: ₹1
- Pro: ₹2499

**Flow**:
1. User authenticated via Supabase
2. Server verifies user exists
3. Server computes request hash (SALT never sent to client)
4. Server returns action URL + signed fields
5. Client browser auto-submits hidden form to PayU

---

### File 3: Client-Side Form Submission
**Location**: `src/lib/payu-client.ts`

**Implementation**:
```typescript
export function submitToPayu({ action, fields }): void {
  // Creates hidden form with all fields from /api/payu/initiate
  // Auto-submits to PayU gateway
  // Browser redirects to PayU payment page
}

export async function startPayuPlanCheckout(plan: string): Promise<void> {
  // Calls /api/payu/initiate
  // Gets signed fields from server
  // Calls submitToPayu() with response
  // Browser navigates away to PayU
}
```

---

### File 4: Callback Handler (CRITICAL - THE ISSUE)
**Location**: `src/app/api/payu/callback/route.ts`

**Current Implementation**:

```typescript
POST /api/payu/callback

Receives (form-urlencoded from PayU):
- status: 'success' or 'failed'
- txnid: transaction ID
- amount: paid amount
- productinfo: product description
- firstname, email: customer details
- udf1: therapist_id
- udf2: plan
- hash: PayU's computed hash for verification
- mihpayid: PayU's payment ID
- additionalCharges: (optional)

Flow:
1. Extract all form fields
2. Call verifyResponseHash() to verify signature
3. If hash fails → redirect to /payment/failure?reason=invalid_signature
4. If status !== 'success' → redirect to /payment/failure?reason={status}
5. Validate therapistId and plan
6. Check idempotency: if payment already applied, redirect to success
7. Update therapist record in database:
   - plan: new plan
   - highest_plan: ratchet value (never lower)
   - plan_payment_id: mihpayid (for idempotency)
   - plan_activated_at: timestamp
8. Fallback logic: try 3 different update strategies if columns don't exist
9. Redirect to /payment/success?plan={plan}&txnid={txnid}
```

**Current Code for Hash Verification (Line 56-70)**:
```typescript
const status = get('status')
txnid = get('txnid')
const amount = get('amount')
const productinfo = get('productinfo')
const firstname = get('firstname')
const email = get('email')
const udf1 = get('udf1')      // therapist_id
const udf2 = get('udf2')      // plan
const hash = get('hash')
const mihpayid = get('mihpayid')
const additionalCharges = get('additionalCharges') || undefined

const ok = verifyResponseHash({
  status, txnid, amount, productinfo, firstname, email,
  udf1, udf2, hash, additionalCharges,  // ❌ MISSING udf3, udf4, udf5
})
```

---

## CRITICAL ISSUES IDENTIFIED

### 🔴 ISSUE #1: UDF3-5 Fields Not Passed to Hash Verification (HIGH PRIORITY)

**Problem**:
- Callback extracts `udf1` and `udf2` from form data
- But does NOT extract `udf3`, `udf4`, `udf5`
- Calls `verifyResponseHash()` passing only `udf1` and `udf2`
- PayU echoes back ALL UDF fields (even if empty strings)
- Hash verification uses defaults for missing fields, causing mismatch

**Why This Breaks**:
PayU's response hash formula requires:
```
SHA512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
```

If PayU sends `udf3=''`, `udf4=''`, `udf5=''`, but your code passes default empty strings, the hash won't match because of subtle differences in how empty fields are handled.

**Code Location**: `src/app/api/payu/callback/route.ts` line 56-70

**Impact**: 
- Hash verification fails with "invalid_signature"
- Payment redirects to `/payment/failure?reason=invalid_signature`
- Therapist plan never upgrades despite payment success
- User sees "Payment failed" even though PayU processed the payment

**Fix Required**:
```typescript
// ADD these lines after line 56:
const udf3 = get('udf3') || ''
const udf4 = get('udf4') || ''
const udf5 = get('udf5') || ''

// MODIFY line 65 to:
const ok = verifyResponseHash({
  status, txnid, amount, productinfo, firstname, email,
  udf1, udf2, udf3, udf4, udf5,  // ✅ PASS ALL UDFs
  hash, additionalCharges,
})
```

---

### 🔴 ISSUE #2: Missing Environment Variables in Vercel Deployment (HIGH PRIORITY)

**Problem**:
- `.env.local` file has PayU credentials configured
- But environment variables must ALSO be set in Vercel dashboard
- If not set in Vercel, `assertPayuConfigured()` will fail when deployed
- Callback will fail with error: "PayU not configured"

**Verification Steps**:
1. Go to https://vercel.com/dashboard
2. Select "counsellors-of-india" project
3. Settings → Environment Variables
4. Check if these exist with Production visibility:
   - `PAYU_KEY`
   - `PAYU_SALT`
   - `PAYU_BASE_URL`
   - `NEXT_PUBLIC_APP_URL`

**Fix Required**:
- Add all four variables to Vercel with these exact values:
  ```
  PAYU_KEY=M6RB3T
  PAYU_SALT=9DyKtFPyZL4icAVhyQiZuKYBsm5Bw1fB
  PAYU_BASE_URL=https://secure.payu.in/_payment
  NEXT_PUBLIC_APP_URL=https://counsellorsofindia.com
  ```

---

### 🟠 ISSUE #3: Silent Database Update Failures (MEDIUM PRIORITY)

**Problem**:
- Lines 103-115 in callback route only check for error codes `'42703'` and `'PGRST204'`
- Other database errors (constraint violations, connection issues) fail silently
- If `plan_payment_id` has a unique constraint and `mihpayid` is duplicate:
  - Database update fails
  - Callback still redirects to `/payment/success`
  - User thinks payment succeeded, but database wasn't updated
  - Plan never actually upgrades

**Current Code**:
```typescript
if (updErr?.code === '42703' || updErr?.code === 'PGRST204') {
  // fallback logic
}
if (updErr) {
  console.error('[payu/callback] DB update failed:', updErr)
  return redirect(req, `/payment/failure?reason=db_error&txnid=...`)
}
```

**Fix Required**:
- Add comprehensive error logging:
```typescript
if (updErr) {
  console.error('[payu/callback] DB update failed:', {
    errorCode: updErr.code,
    errorMessage: updErr.message,
    therapistId,
    plan,
    mihpayid,
    timestamp: new Date().toISOString(),
  })
  return redirect(req, `/payment/failure?reason=db_error&txnid=${encodeURIComponent(txnid)}`)
}
```

---

### 🟠 ISSUE #4: Potential additionalCharges Hash Position (MEDIUM PRIORITY)

**Problem**:
- Code assumes: `SHA512(additionalCharges | SALT | status | ... | key)`
- PayU documentation may specify different position
- Could cause hash mismatch if `additionalCharges` is positioned differently

**Current Code** (Line 121-128):
```typescript
const expected = params.additionalCharges
  ? sha512(`${params.additionalCharges}|${[
      PAYU_SALT, params.status,
      '', '', '', '', '',
      params.udf5 ?? '', params.udf4 ?? '', params.udf3 ?? '', params.udf2 ?? '', params.udf1 ?? '',
      params.email, params.firstname, params.productinfo, params.amount, params.txnid,
      PAYU_KEY,
    ].join('|')}`)
  : base
```

**Fix Required**:
- Verify with PayU documentation the exact hash sequence when `additionalCharges` is present
- May need to prepend or append differently

---

### 🟡 ISSUE #5: Missing Debug Logging in Production (LOW PRIORITY)

**Problem**:
- `PAYU_DEBUG` environment variable exists but not set in Vercel
- Can't see full form data PayU sends without enabling debug
- Makes troubleshooting callback issues difficult

**Fix Required**:
```
Add to Vercel Environment Variables:
PAYU_DEBUG=1
```

---

## VERIFICATION CHECKLIST

- [ ] UDF3, UDF4, UDF5 extracted and passed to `verifyResponseHash()`
- [ ] All environment variables set in Vercel dashboard (not just `.env.local`)
- [ ] Database error logging captures all error codes
- [ ] Test payment flow in production with debug enabled
- [ ] Verify PayU dashboard shows "Success" status
- [ ] Check database: therapist record has updated plan
- [ ] Test idempotency: repeat same payment, verify no double-upgrade

---

## DEBUGGING COMMANDS FOR VERCEL

```bash
# View real-time logs
vercel logs --follow

# View last 100 logs
vercel logs --limit 100

# View specific deployment logs
vercel logs <deployment-id> --follow

# After triggering payment, search for:
# - "[payu/callback] received fields:" (if PAYU_DEBUG=1)
# - "[payu/callback] hash mismatch"
# - "[payu/callback] DB update failed"
# - Any error messages
```

---

## EXPECTED HAPPY PATH

1. **Initiation**:
   - User clicks "Upgrade to Pro"
   - Browser calls `POST /api/payu/initiate` with `{ plan: 'pro' }`
   - Server returns: `{ action: "https://secure.payu.in/_payment", fields: {...} }`
   - Browser auto-submits hidden form to PayU

2. **Payment**:
   - User enters payment details on PayU gateway
   - Payment processed successfully

3. **Callback**:
   - PayU POSTs callback to `https://counsellorsofindia.com/api/payu/callback` with form data
   - Server extracts all form fields (including udf3-5)
   - Server verifies hash signature
   - Server checks idempotency
   - Server updates database with new plan
   - Server redirects to `/payment/success?plan=pro&txnid=...`

4. **Result**:
   - User sees success page
   - Database shows therapist plan updated to "pro"
   - Therapist can access pro features

---

## REQUIRED ACTIONS (Priority Order)

1. **Immediate**: Apply UDF3-5 fix to callback route
2. **Immediate**: Verify all environment variables in Vercel dashboard
3. **High**: Add comprehensive error logging for database operations
4. **Medium**: Enable PAYU_DEBUG in Vercel
5. **Medium**: Test end-to-end payment flow
6. **Low**: Verify additionalCharges hash position with PayU docs

---

## NOTES FOR CHATGPT CONTINUATION

This investigation identified that the most likely root cause is **UDF3-5 fields not being passed to hash verification**, which would cause PayU callback signature validation to fail. The secondary issue is **missing Vercel environment variables**, which would cause the callback to fail at the configuration check stage.

Both issues are high-priority and should be fixed immediately. Provide the exact code changes needed in `src/app/api/payu/callback/route.ts`.

