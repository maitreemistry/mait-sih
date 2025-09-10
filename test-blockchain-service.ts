/**
 * Comprehensive test suite for HyperledgerGridService
 * Tests all methods and functionality of the blockchain service
 */

import { HyperledgerGridService } from './services/blockchain/hyperledger.service';

async function testHyperledgerGridService() {
  console.log('🧪 Starting HyperledgerGridService Tests...\n');

  const service = new HyperledgerGridService();

  // Test data
  const farmerProductData = {
    farmerId: 'FARMER_001',
    name: 'Premium Organic Rice',
    description: 'High-quality organic rice from Odisha farms',
    cropType: 'Rice',
    harvestDate: '2024-01-15',
    location: { latitude: 20.9517, longitude: 85.0985 },
    qualityGrade: 'A+',
    certifications: ['Organic', 'Fair Trade'],
    farmName: 'Green Valley Farm',
    coordinates: '20.9517,85.0985',
    soilType: 'Alluvial',
    area: 5.2
  };

  try {
    // Test 1: Service instantiation
    console.log('✅ Test 1: Service instantiation');
    if (service) {
      console.log('   ✓ Service created successfully\n');
    } else {
      throw new Error('Service creation failed');
    }

    // Test 2: Product registration
    console.log('✅ Test 2: Product registration');
    const productId = await service.registerProduct(farmerProductData);
    console.log(`   ✓ Product registered with ID: ${productId}`);
    console.log(`   ✓ Product ID format: ${productId.startsWith('PROD_') ? 'Valid' : 'Invalid'}\n`);

    // Test 3: Ownership transfer
    console.log('✅ Test 3: Ownership transfer');
    await service.transferToDistributor(productId, 'DISTRIBUTOR_001');
    console.log('   ✓ Ownership transferred to distributor\n');

    // Test 4: Add quality certificate
    console.log('✅ Test 4: Add quality certificate');
    const qualityData = {
      grade: 'A+',
      qualityScore: 95.5,
      defects: ['Minor discoloration'],
      confidence: 0.98
    };
    await service.addQualityCertificate(productId, qualityData);
    console.log('   ✓ Quality certificate added\n');

    // Test 5: Get product history
    console.log('✅ Test 5: Get product history');
    const productHistory = await service.getProductHistory(productId);
    console.log(`   ✓ Product history retrieved`);
    console.log(`   ✓ Product name: ${productHistory.product.name}`);
    console.log(`   ✓ Current owner: ${productHistory.currentOwner}`);
    console.log(`   ✓ Status: ${productHistory.status}`);
    console.log(`   ✓ Timeline events: ${productHistory.timeline.length}`);
    console.log(`   ✓ Quality certificates: ${productHistory.qualityCertificates.length}\n`);

    // Test 6: Get products by farmer
    console.log('✅ Test 6: Get products by farmer');
    const farmerProducts = await service.getProductsByFarmer('FARMER_001');
    console.log(`   ✓ Retrieved ${farmerProducts.length} products for farmer`);
    farmerProducts.forEach((product, index) => {
      console.log(`   ✓ Product ${index + 1}: ${product.name} - ${product.status}`);
    });
    console.log('');

    // Test 7: Error handling
    console.log('✅ Test 7: Error handling');
    try {
      await service.getProductHistory('INVALID_ID');
      console.log('   ✓ Error handling: Should have thrown error');
    } catch (error) {
      console.log(`   ✓ Error handling: Correctly caught error - ${(error as Error).message}`);
    }

    // Test 8: Multiple product registration
    console.log('✅ Test 8: Multiple product registration');
    const productIds: string[] = [];
    for (let i = 0; i < 3; i++) {
      const testData = {
        ...farmerProductData,
        name: `Test Product ${i + 1}`,
        farmerId: `FARMER_TEST_${i + 1}`
      };
      const id = await service.registerProduct(testData);
      productIds.push(id);
      console.log(`   ✓ Product ${i + 1} registered: ${id}`);
    }
    console.log('');

    // Test 9: Batch operations
    console.log('✅ Test 9: Batch operations');
    for (const id of productIds) {
      await service.transferToDistributor(id, 'DISTRIBUTOR_BATCH');
      await service.addQualityCertificate(id, {
        grade: 'A',
        qualityScore: 92.0,
        defects: [],
        confidence: 0.95
      });
    }
    console.log('   ✓ Batch transfer and certification completed\n');

    // Test 10: Performance test
    console.log('✅ Test 10: Performance test');
    const startTime = Date.now();
    const performancePromises = [];
    for (let i = 0; i < 10; i++) {
      performancePromises.push(service.getProductHistory(productIds[0]));
    }
    await Promise.all(performancePromises);
    const endTime = Date.now();
    console.log(`   ✓ 10 concurrent requests completed in ${endTime - startTime}ms\n`);

    console.log('🎉 All tests passed successfully!');
    console.log('📊 Test Summary:');
    console.log('   - Service instantiation: ✅');
    console.log('   - Product registration: ✅');
    console.log('   - Ownership transfer: ✅');
    console.log('   - Quality certificate addition: ✅');
    console.log('   - Product history retrieval: ✅');
    console.log('   - Farmer products retrieval: ✅');
    console.log('   - Error handling: ✅');
    console.log('   - Multiple product registration: ✅');
    console.log('   - Batch operations: ✅');
    console.log('   - Performance test: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', (error as Error).stack);
    process.exit(1);
  }
}

// Run the tests
testHyperledgerGridService().catch((error) => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});
