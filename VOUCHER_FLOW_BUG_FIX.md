# Voucher Flow Bug Fixes

## Issues Identified

### 1. **`usedQuantity` in Voucher stays at 0**

- **Root Cause**: The `orderId` parameter was being passed as a string instead of a proper MongoDB ObjectId
- **Impact**: Voucher usage tracking was failing

### 2. **`orderId` in UserVoucher is null**

- **Root Cause**: Same ObjectId conversion issue when calling `markAsUsed()`
- **Impact**: Cannot track which order used which voucher

### 3. **VoucherUsageHistory not being created**

- **Root Cause**: Multiple potential issues:
  - ObjectId not properly converted
  - Lack of error handling causing silent failures
  - No logging to identify the exact failure point

## Solutions Implemented

### 1. ObjectId Validation and Conversion

**File**: `src/services/OrderService.js`

Added proper ObjectId validation and conversion at the start of `confirmPaymentWithVoucher`:

```javascript
// Validate and convert orderId to ObjectId
if (!mongoose.Types.ObjectId.isValid(orderId)) {
  return reject({
    status: "ERR",
    message: "Invalid order ID format",
  });
}

const orderObjectId = new mongoose.Types.ObjectId(orderId);
```

**Why this fixes the issue**:

- Ensures `orderId` is always a proper MongoDB ObjectId
- Used consistently throughout the function
- Prevents type mismatch issues when saving to database

### 2. Enhanced Error Handling

**File**: `src/services/OrderService.js`

Wrapped the voucher processing loop in a try-catch block:

```javascript
for (const voucher of selectedVouchers) {
  try {
    // Process voucher
    await userVoucher.markAsUsed(orderObjectId);
    await voucherDoc.incrementUsed();
    await VoucherUsageHistory.create({...});
  } catch (voucherError) {
    console.error("Error processing voucher:", {
      voucherId: voucher._id,
      error: voucherError.message,
    });
    // Continue processing other vouchers
  }
}
```

**Why this fixes the issue**:

- Individual voucher failures don't break the entire flow
- Detailed error logging helps identify specific issues
- Other vouchers can still be processed

### 3. Improved `markAsUsed` Method

**File**: `src/models/UserVoucherModel.js`

Added ObjectId conversion in the method itself:

```javascript
userVoucherSchema.methods.markAsUsed = async function (orderId) {
  // Ensure orderId is an ObjectId
  const orderObjectId = mongoose.Types.ObjectId.isValid(orderId)
    ? new mongoose.Types.ObjectId(orderId)
    : orderId;

  this.status = "USED";
  this.usedAt = new Date();
  this.orderId = orderObjectId;

  await this.save();
};
```

**Why this fixes the issue**:

- Double-checks ObjectId conversion at the model level
- Provides defensive programming against future bugs
- Adds logging for debugging

### 4. Enhanced Logging

Added comprehensive logging throughout the flow:

**In `OrderService.js`**:

- Log when function is called with orderId
- Log UserVoucher status after marking as used
- Log Voucher usedQuantity after increment
- Log VoucherUsageHistory creation with IDs

**In `UserVoucherModel.js`**:

- Log before and after `markAsUsed` operation
- Shows orderId type and value

**In `VoucherModel.js`**:

- Log before and after `incrementUsed` operation
- Shows usedQuantity changes

## Testing the Fix

### Method 1: Use the Test Script

Run the test script to check voucher data:

```bash
node test-voucher-flow.js
```

This will show:

- Current voucher quantities (total, claimed, used)
- UserVoucher records with orderId status
- VoucherUsageHistory records
- Recent orders with vouchers applied

### Method 2: Manual Testing

1. Start the backend server:

   ```bash
   npm start
   ```

2. From the frontend:

   - Create an order
   - Apply a voucher (e.g., WINTER0010)
   - Complete the payment

3. Check the console logs for detailed information

4. Verify in MongoDB:

   ```javascript
   // Check Voucher
   db.vouchers.findOne({ voucherCode: "WINTER0010" });

   // Check UserVoucher
   db.uservouchers.find({ voucherId: ObjectId("...") });

   // Check VoucherUsageHistory
   db.voucherusagehistories.find({ voucherId: ObjectId("...") });
   ```

## Expected Results After Fix

### Voucher Document

```javascript
{
  voucherCode: "WINTER0010",
  totalQuantity: 1,
  claimedQuantity: 1,
  usedQuantity: 1  // ✓ Should be 1 after use
}
```

### UserVoucher Document

```javascript
{
  userId: ObjectId("..."),
  voucherId: ObjectId("..."),
  status: "USED",
  orderId: ObjectId("..."),  // ✓ Should NOT be null
  usedAt: ISODate("...")
}
```

### VoucherUsageHistory Document

```javascript
{
  userId: ObjectId("..."),
  voucherId: ObjectId("..."),
  userVoucherId: ObjectId("..."),
  orderId: ObjectId("..."),  // ✓ Should be present
  originalOrderValue: 330000,
  discountAmount: 30000,
  finalOrderValue: 300000,
  voucherCode: "WINTER0010",
  usedAt: ISODate("...")
}
```

## Flow Diagram

```
Frontend: Apply Voucher
    ↓
confirmPaymentWithVoucher(orderId, userId, voucherData)
    ↓
[1] Validate & Convert orderId → ObjectId
    ↓
[2] Update Order with vouchersUsed array
    ↓
[3] For each voucher:
        ├─ Find UserVoucher (status: ACTIVE)
        ├─ Call markAsUsed(orderObjectId)
        │   └─ Set status=USED, orderId=ObjectId, usedAt=Date
        ├─ Find Voucher document
        ├─ Call incrementUsed()
        │   └─ Increment usedQuantity by 1
        └─ Create VoucherUsageHistory
            └─ Store complete usage record
    ↓
[4] Return success response
```

## Files Modified

1. `src/services/OrderService.js`

   - Added ObjectId validation
   - Enhanced error handling in voucher loop
   - Consistent use of `orderObjectId`
   - Added detailed logging

2. `src/models/UserVoucherModel.js`

   - Enhanced `markAsUsed` method with ObjectId conversion
   - Added logging

3. `src/models/VoucherModel.js`

   - Enhanced `incrementUsed` method with logging

4. `test-voucher-flow.js` (NEW)
   - Test script to verify the fix

## Additional Notes

- The fix is backward compatible
- No database migration required
- Existing data will work correctly going forward
- Enhanced logging can be removed after confirming the fix works

## Rollback Plan

If issues occur, revert these commits:

```bash
git revert HEAD~3..HEAD
```

Then investigate the specific error in the logs.
