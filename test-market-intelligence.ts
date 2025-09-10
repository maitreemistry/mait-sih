import { MarketIntelligenceService } from './services/market-intelligence.service';

async function testMarketIntelligenceService() {
  console.log('Testing MarketIntelligenceService...');

  const service = new MarketIntelligenceService();

  try {
    // Test getCurrentPrices
    console.log('\n1. Testing getCurrentPrices...');
    const prices = await service.getCurrentPrices();
    console.log(`Retrieved ${prices.length} price records`);
    console.log('Sample price:', prices[0]);

    // Test getMarketAnalysis
    console.log('\n2. Testing getMarketAnalysis...');
    const analysis = await service.getMarketAnalysis('Rice');
    console.log('Market analysis for Rice:', analysis);

    // Test getDemandSupplyIndicators (this uses the modified methods)
    console.log('\n3. Testing getDemandSupplyIndicators...');
    const indicators = await service.getDemandSupplyIndicators();
    console.log(`Retrieved ${indicators.regionalIndicators.length} regional indicators`);
    console.log('Sample indicator:', indicators.regionalIndicators[0]);

    // Test calculateRegionalDemandIndex directly
    console.log('\n4. Testing calculateRegionalDemandIndex...');
    const demandIndex = (service as any).calculateRegionalDemandIndex('Coastal Odisha', 'Rice');
    console.log(`Demand index for Rice in Coastal Odisha: ${demandIndex}`);

    // Test calculateRegionalSupplyIndex directly
    console.log('\n5. Testing calculateRegionalSupplyIndex...');
    const supplyIndex = (service as any).calculateRegionalSupplyIndex('Coastal Odisha', 'Rice');
    console.log(`Supply index for Rice in Coastal Odisha: ${supplyIndex}`);

    console.log('\n✅ All tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testMarketIntelligenceService();
