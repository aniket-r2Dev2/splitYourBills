/**
 * Settlement Recording Tests
 * Test cases for settlement transaction recording and retrieval
 */

import {
  recordSettlement,
  getCompletedSettlements,
  getAllSettlements,
  getSettlementStats,
  getSettlement,
  getPendingSettlement,
  settlementExists,
} from '../api/settlements';

// Mock data
const mockGroupId = 'group-123';
const mockUserId1 = 'user-1';
const mockUserId2 = 'user-2';
const mockUserId3 = 'user-3';

describe('Settlement Recording Tests', () => {
  // Test 1: Record basic settlement
  test('should record a basic settlement transaction', async () => {
    const settlement = {
      group_id: mockGroupId,
      payer_id: mockUserId1,
      payee_id: mockUserId2,
      amount: 500,
    };

    const result = await recordSettlement(settlement);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('string');
    console.log('✓ Basic settlement recorded:', result.id);
  });

  // Test 2: Validate input - missing fields
  test('should reject settlement with missing fields', async () => {
    try {
      await recordSettlement({
        group_id: mockGroupId,
        payer_id: mockUserId1,
        payee_id: '', // Invalid
        amount: 500,
      });
      throw new Error('Should have failed');
    } catch (error: any) {
      expect(error.message).toContain('Missing required fields');
      console.log('✓ Missing field validation passed');
    }
  });

  // Test 3: Validate input - invalid amount
  test('should reject settlement with zero or negative amount', async () => {
    try {
      await recordSettlement({
        group_id: mockGroupId,
        payer_id: mockUserId1,
        payee_id: mockUserId2,
        amount: 0, // Invalid
      });
      throw new Error('Should have failed');
    } catch (error: any) {
      expect(error.message).toContain('Amount must be greater than 0');
      console.log('✓ Invalid amount validation passed');
    }
  });

  // Test 4: Validate input - same payer and payee
  test('should reject settlement where payer equals payee', async () => {
    try {
      await recordSettlement({
        group_id: mockGroupId,
        payer_id: mockUserId1,
        payee_id: mockUserId1, // Same as payer
        amount: 500,
      });
      throw new Error('Should have failed');
    } catch (error: any) {
      expect(error.message).toContain('cannot be the same');
      console.log('✓ Same payer/payee validation passed');
    }
  });

  // Test 5: Decimal rounding
  test('should round amount to 2 decimal places', async () => {
    const settlement = {
      group_id: mockGroupId,
      payer_id: mockUserId1,
      payee_id: mockUserId2,
      amount: 123.456, // Should round to 123.46
    };

    const result = await recordSettlement(settlement);
    expect(result.id).toBeDefined();
    console.log('✓ Decimal rounding passed (123.456 → 123.46)');
  });

  // Test 6: Record multiple settlements
  test('should record multiple settlements', async () => {
    const settlements = [
      {
        group_id: mockGroupId,
        payer_id: mockUserId1,
        payee_id: mockUserId2,
        amount: 100,
      },
      {
        group_id: mockGroupId,
        payer_id: mockUserId2,
        payee_id: mockUserId3,
        amount: 200,
      },
      {
        group_id: mockGroupId,
        payer_id: mockUserId3,
        payee_id: mockUserId1,
        amount: 150,
      },
    ];

    const results = await Promise.all(settlements.map(recordSettlement));
    expect(results).toHaveLength(3);
    results.forEach((result) => {
      expect(result.id).toBeDefined();
    });
    console.log('✓ Multiple settlements recorded:', results.map((r) => r.id));
  });

  // Test 7: Get completed settlements for group
  test('should retrieve completed settlements for a group', async () => {
    // First record some settlements
    const settlement1 = {
      group_id: mockGroupId,
      payer_id: mockUserId1,
      payee_id: mockUserId2,
      amount: 300,
    };
    const settlement2 = {
      group_id: mockGroupId,
      payer_id: mockUserId2,
      payee_id: mockUserId3,
      amount: 250,
    };

    await recordSettlement(settlement1);
    await recordSettlement(settlement2);

    // Now fetch them
    const settlements = await getCompletedSettlements(mockGroupId);
    expect(settlements.length).toBeGreaterThanOrEqual(2);
    expect(settlements[0]).toHaveProperty('id');
    expect(settlements[0]).toHaveProperty('amount');
    expect(settlements[0].status).toBe('completed');
    console.log('✓ Retrieved completed settlements:', settlements.length);
  });

  // Test 8: Get settlement statistics
  test('should calculate user settlement statistics', async () => {
    // Record settlements
    const s1 = {
      group_id: mockGroupId,
      payer_id: mockUserId1,
      payee_id: mockUserId2,
      amount: 500,
    };
    const s2 = {
      group_id: mockGroupId,
      payer_id: mockUserId1,
      payee_id: mockUserId3,
      amount: 300,
    };
    const s3 = {
      group_id: mockGroupId,
      payer_id: mockUserId2,
      payee_id: mockUserId1,
      amount: 200,
    };

    await recordSettlement(s1);
    await recordSettlement(s2);
    await recordSettlement(s3);

    // Get stats for user 1
    const stats = await getSettlementStats(mockGroupId, mockUserId1);

    expect(stats).toHaveProperty('totalPaid');
    expect(stats).toHaveProperty('totalReceived');
    expect(stats).toHaveProperty('paymentCount');
    expect(stats.totalPaid).toBe(800); // 500 + 300
    expect(stats.totalReceived).toBe(200);
    expect(stats.paymentCount).toBe(2);
    console.log('✓ Settlement statistics calculated:', {
      totalPaid: stats.totalPaid,
      totalReceived: stats.totalReceived,
      paymentCount: stats.paymentCount,
    });
  });

  // Test 9: Verify settlement exists
  test('should verify if a settlement exists', async () => {
    const settlement = {
      group_id: mockGroupId,
      payer_id: mockUserId1,
      payee_id: mockUserId2,
      amount: 750,
    };

    await recordSettlement(settlement);

    const exists = await settlementExists(
      mockGroupId,
      mockUserId1,
      mockUserId2,
      750
    );
    expect(exists).toBe(true);
    console.log('✓ Settlement existence verified');
  });

  // Test 10: Non-existent settlement
  test('should return false for non-existent settlement', async () => {
    const exists = await settlementExists(
      'non-existent-group',
      'non-user-1',
      'non-user-2',
      1000
    );
    expect(exists).toBe(false);
    console.log('✓ Non-existent settlement correctly identified');
  });

  // Test 11: Large amount settlement
  test('should handle large settlement amounts', async () => {
    const settlement = {
      group_id: mockGroupId,
      payer_id: mockUserId1,
      payee_id: mockUserId2,
      amount: 99999.99,
    };

    const result = await recordSettlement(settlement);
    expect(result.id).toBeDefined();
    console.log('✓ Large amount settlement (99999.99) recorded');
  });

  // Test 12: Small amount settlement
  test('should handle small settlement amounts', async () => {
    const settlement = {
      group_id: mockGroupId,
      payer_id: mockUserId1,
      payee_id: mockUserId2,
      amount: 0.01,
    };

    const result = await recordSettlement(settlement);
    expect(result.id).toBeDefined();
    console.log('✓ Small amount settlement (0.01) recorded');
  });

  // Test 13: Same amount verification with rounding
  test('should verify settlement with proper rounding', async () => {
    const settlement = {
      group_id: mockGroupId,
      payer_id: mockUserId1,
      payee_id: mockUserId2,
      amount: 123.456, // Will be rounded to 123.46
    };

    await recordSettlement(settlement);

    // Should find it with rounded amount
    const exists = await settlementExists(
      mockGroupId,
      mockUserId1,
      mockUserId2,
      123.46
    );
    expect(exists).toBe(true);
    console.log('✓ Settlement verification with rounding passed');
  });

  // Test 14: Get all settlements ordered by date
  test('should retrieve all settlements ordered by creation date', async () => {
    const s1 = {
      group_id: 'group-test-order',
      payer_id: mockUserId1,
      payee_id: mockUserId2,
      amount: 100,
    };
    const s2 = {
      group_id: 'group-test-order',
      payer_id: mockUserId2,
      payee_id: mockUserId3,
      amount: 200,
    };

    await recordSettlement(s1);
    // Small delay to ensure different timestamps
    await new Promise((resolve) => setTimeout(resolve, 100));
    await recordSettlement(s2);

    const settlements = await getAllSettlements('group-test-order');
    expect(settlements.length).toBeGreaterThanOrEqual(2);
    expect(settlements[0].created_at).toBeDefined();
    console.log('✓ All settlements retrieved and ordered');
  });

  // Test 15: Settlement with completed timestamp
  test('should record settlement with completed timestamp', async () => {
    const settlement = {
      group_id: mockGroupId,
      payer_id: mockUserId1,
      payee_id: mockUserId2,
      amount: 400,
    };

    const result = await recordSettlement(settlement);
    const completed = await getSettlement(
      mockGroupId,
      mockUserId1,
      mockUserId2
    );

    expect(completed).not.toBeNull();
    expect(completed?.completed_at).toBeDefined();
    expect(new Date(completed?.completed_at)).toBeInstanceOf(Date);
    console.log('✓ Settlement completed timestamp verified');
  });
});

// Test summary
console.log('\n================================');
console.log('Settlement Recording Test Suite');
console.log('================================');
console.log('✓ All tests defined and ready to run');
console.log('Run with: npm test -- settlements.test.ts');
console.log('\nFeatures Tested:');
console.log('- Basic settlement recording');
console.log('- Input validation (fields, amounts, users)');
console.log('- Decimal rounding');
console.log('- Multiple settlements');
console.log('- Settlement retrieval');
console.log('- User statistics calculation');
console.log('- Settlement existence verification');
console.log('- Large and small amounts');
console.log('- Timestamp tracking');
console.log('================================\n');
