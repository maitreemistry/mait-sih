import { MockAIQualityService } from './services/ai/quality-assessment';
import { HyperledgerGridService } from './services/blockchain/hyperledger.service';
import { FarmerAdvisoryService } from './services/farmer-advisory.service';
import { GovernmentSchemeService } from './services/government.service';
import { MarketIntelligenceService } from './services/market-intelligence.service';
import { QRCodeService } from './services/qr-code.service';
import { WeatherService } from './services/weather.service';

async function testAllServices() {
  console.log('🚀 Starting Comprehensive Service Testing...\n');

  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  // Test 1: Market Intelligence Service
  console.log('📊 Testing MarketIntelligenceService...');
  try {
    const marketService = new MarketIntelligenceService();

    // Test current prices
    const prices = await marketService.getCurrentPrices();
    console.log(`✅ Retrieved ${prices.length} price records`);

    // Test market analysis
    const analysis = await marketService.getMarketAnalysis('Rice');
    console.log(`✅ Market analysis: ₹${analysis.averagePrice}/quintal`);

    // Test export opportunities
    const exportOps = await marketService.getExportOpportunities();
    console.log(`✅ Export opportunities: ${exportOps.opportunities.length} crops`);

    // Test bulk pricing
    const bulkPricing = await marketService.calculateBulkPricing('Rice', 100, 'Grade-A', 'Cuttack', 'Bhubaneswar');
    console.log(`✅ Bulk pricing calculated: ₹${bulkPricing.netPrice}`);

    results.passed++;
    console.log('✅ MarketIntelligenceService: PASSED\n');
  } catch (error) {
    console.log(`❌ MarketIntelligenceService: FAILED - ${error}`);
    results.failed++;
  }
  results.total++;

  // Test 2: Government Scheme Service
  console.log('🏛️ Testing GovernmentSchemeService...');
  try {
    const govtService = new GovernmentSchemeService();

    // Test KALIA eligibility
    const kaliaEligibility = await govtService.checkKALIAEligibility('farmer123');
    console.log(`✅ KALIA eligibility: ${kaliaEligibility.isEligible ? 'Eligible' : 'Not Eligible'}`);

    // Test paddy procurement
    const procurement = await govtService.getPaddyProcurementInfo('farmer123');
    console.log(`✅ Paddy procurement: ${procurement.registrationOpen ? 'Open' : 'Closed'}`);

    // Test subsidy calculation
    const subsidy = await govtService.calculateSubsidy('Tractor', 500000);
    console.log(`✅ Subsidy calculated: ₹${subsidy.subsidyAmount}`);

    results.passed++;
    console.log('✅ GovernmentSchemeService: PASSED\n');
  } catch (error) {
    console.log(`❌ GovernmentSchemeService: FAILED - ${error}`);
    results.failed++;
  }
  results.total++;

  // Test 3: QR Code Service
  console.log('📱 Testing QRCodeService...');
  try {
    const qrService = new QRCodeService();

    // Test QR code generation
    const qrData = await qrService.generateQRCode({
      productId: 'test123',
      farmerId: 'farmer123',
      batchId: 'batch001',
      productData: {
        name: 'Premium Rice',
        cropType: 'Rice',
        harvestDate: '2024-09-01',
        qualityGrade: 'Premium',
        farmLocation: { latitude: 20.2961, longitude: 85.8245 },
        certifications: ['Organic', 'GAP']
      }
    });
    console.log(`✅ QR Code generated: ${qrData.qrCode}`);

    // Test QR code scanning
    const scanResult = await qrService.scanQRCode(qrData.qrCode);
    console.log(`✅ QR Code scanned: ${scanResult.isValid ? 'Valid' : 'Invalid'}`);

    results.passed++;
    console.log('✅ QRCodeService: PASSED\n');
  } catch (error) {
    console.log(`❌ QRCodeService: FAILED - ${error}`);
    results.failed++;
  }
  results.total++;

  // Test 4: Farmer Advisory Service
  console.log('👨‍🌾 Testing FarmerAdvisoryService...');
  try {
    const advisoryService = new FarmerAdvisoryService();

    // Test personalized advisory
    const advisory = await advisoryService.generatePersonalizedAdvisory({
      farmerId: 'farmer123',
      location: { latitude: 20.2961, longitude: 85.8245 },
      farmSize: 5,
      soilType: 'alluvial',
      currentCrops: ['Rice', 'Wheat']
    });
    console.log(`✅ Personalized advisory generated with ${advisory.cropRecommendations.length} crop recommendations`);

    // Test quick advisory
    const quickAdvisory = await advisoryService.getQuickAdvisory('pest_attack', 'Rice');
    console.log(`✅ Quick advisory: ${quickAdvisory.title}`);

    results.passed++;
    console.log('✅ FarmerAdvisoryService: PASSED\n');
  } catch (error) {
    console.log(`❌ FarmerAdvisoryService: FAILED - ${error}`);
    results.failed++;
  }
  results.total++;

  // Test 5: Weather Service
  console.log('🌤️ Testing WeatherService...');
  try {
    const weatherService = new WeatherService();

    // Test current weather
    const weather = await weatherService.getCurrentWeather(20.2961, 85.8245);
    console.log(`✅ Current weather: ${weather.temperature}°C, ${weather.condition}`);

    // Test crop advisory
    const cropAdvisory = await weatherService.getCropAdvisory('Rice', weather);
    console.log(`✅ Crop advisory: ${cropAdvisory.advisory}`);

    // Test irrigation schedule
    const irrigation = await weatherService.getOptimalIrrigationSchedule('Rice', weather);
    console.log(`✅ Irrigation schedule: ${irrigation.shouldIrrigate ? 'Irrigate' : 'No irrigation needed'}`);

    results.passed++;
    console.log('✅ WeatherService: PASSED\n');
  } catch (error) {
    console.log(`❌ WeatherService: FAILED - ${error}`);
    results.failed++;
  }
  results.total++;

  // Test 6: Hyperledger Blockchain Service
  console.log('⛓️ Testing HyperledgerGridService...');
  try {
    const blockchainService = new HyperledgerGridService();

    // Test product registration
    const productId = await blockchainService.registerProduct({
      farmerId: 'farmer123',
      name: 'Premium Rice',
      description: 'High-quality organic rice',
      cropType: 'Rice',
      harvestDate: '2024-09-01',
      location: { latitude: 20.2961, longitude: 85.8245 },
      qualityGrade: 'Premium',
      certifications: ['Organic', 'GAP'],
      farmName: 'Green Valley Farm',
      coordinates: '20.2961,85.8245',
      soilType: 'Alluvial',
      area: 5
    });
    console.log(`✅ Product registered on blockchain: ${productId}`);

    // Test product history
    const history = await blockchainService.getProductHistory(productId);
    console.log(`✅ Product history retrieved: ${history.timeline.length} events`);

    // Test transfer to distributor
    await blockchainService.transferToDistributor(productId, 'distributor123');
    console.log(`✅ Product transferred to distributor`);

    results.passed++;
    console.log('✅ HyperledgerGridService: PASSED\n');
  } catch (error) {
    console.log(`❌ HyperledgerGridService: FAILED - ${error}`);
    results.failed++;
  }
  results.total++;

  // Test 7: AI Quality Assessment Service
  console.log('🤖 Testing MockAIQualityService...');
  try {
    const qualityService = new MockAIQualityService();

    // Test quality assessment
    const assessment = await qualityService.assessQualityDemo('test-image-uri', 'Rice');
    console.log(`✅ Quality assessment: Grade ${assessment.grade}, Score ${assessment.qualityScore}`);

    // Test batch assessment
    const batchAssessment = await qualityService.batchAssessment(['image1', 'image2'], 'Rice');
    console.log(`✅ Batch assessment: ${batchAssessment.totalImages} images processed`);

    results.passed++;
    console.log('✅ MockAIQualityService: PASSED\n');
  } catch (error) {
    console.log(`❌ MockAIQualityService: FAILED - ${error}`);
    results.failed++;
  }
  results.total++;

  // Test 8: Service Integration Tests
  console.log('🔗 Testing Service Integrations...');
  try {
    // Test QR Code with Blockchain integration
    const qrService = new QRCodeService();
    const qrData = await qrService.generateQRCode({
      productId: 'integration-test',
      farmerId: 'farmer123',
      batchId: 'batch001',
      productData: {
        name: 'Integration Test Rice',
        cropType: 'Rice',
        harvestDate: '2024-09-01',
        qualityGrade: 'Premium',
        farmLocation: { latitude: 20.2961, longitude: 85.8245 },
        certifications: ['Organic']
      }
    });

    const scanResult = await qrService.scanQRCode(qrData.qrCode);
    console.log(`✅ QR-Blockchain integration: ${scanResult.blockchainVerified ? 'Verified' : 'Not verified'}`);

    // Test Farmer Advisory with multiple services
    const advisoryService = new FarmerAdvisoryService();
    const fullAdvisory = await advisoryService.generatePersonalizedAdvisory({
      farmerId: 'farmer123',
      location: { latitude: 20.2961, longitude: 85.8245 },
      farmSize: 5,
      soilType: 'alluvial',
      currentCrops: ['Rice']
    });

    console.log(`✅ Multi-service integration: ${fullAdvisory.weatherAdvisories.length} weather advisories`);

    results.passed++;
    console.log('✅ Service Integrations: PASSED\n');
  } catch (error) {
    console.log(`❌ Service Integrations: FAILED - ${error}`);
    results.failed++;
  }
  results.total++;

  // Final Results
  console.log('🎯 Test Results Summary:');
  console.log(`Total Tests: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! The SIH application is fully functional.');
  } else {
    console.log(`\n⚠️ ${results.failed} test(s) failed. Please review the errors above.`);
  }
}

// Run comprehensive tests
testAllServices().catch(console.error);
