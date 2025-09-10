
import { MARKET_ANALYSIS_PROMPTS, openai, OPENAI_CONFIG } from './config/openai.config';

interface CommodityPrice {
  commodity: string;
  variety?: string;
  market: string;
  district: string;
  state: string;
  price: number;
  unit: string;
  date: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
}

interface MarketAnalysis {
  commodity: string;
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  bestMarkets: string[];
  seasonalTrend: 'increasing' | 'decreasing' | 'stable';
  forecast7Day: number;
  forecast30Day: number;
  demandIndex: number;
  supplyIndex: number;
  aiInsights?: string[];
  confidence?: number;
}

interface PriceAlert {
  id: string;
  commodity: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
}

interface MarketIntelligence {
  mandiPrices: CommodityPrice[];
  analysis: MarketAnalysis[];
  alerts: PriceAlert[];
  recommendations: string[];
  aiInsights?: string[];
}

interface OpenAIForecast {
  forecast7Day: number;
  forecast30Day: number;
  confidence: number;
  reasoning: string[];
  recommendations: string[];
}

export class MarketIntelligenceService {
  private baseUrl: string;
  private useAI: boolean;

  constructor(useAI: boolean = true) {
    this.baseUrl = 'https://api.data.gov.in'; // Indian government open data API
    this.useAI = useAI && !!process.env.OPENAI_API_KEY;
  }

  async getCurrentPrices(commodity?: string, district?: string): Promise<CommodityPrice[]> {
    try {
      // Mock data for Odisha agricultural commodities
      const mockPrices: CommodityPrice[] = [
        {
          commodity: 'Rice',
          variety: 'IR-64',
          market: 'Cuttack Mandi',
          district: 'Cuttack',
          state: 'Odisha',
          price: 3100,
          unit: 'quintal',
          date: new Date().toISOString().split('T')[0],
          trend: 'up',
          changePercent: 2.5
        },
        {
          commodity: 'Rice',
          variety: 'Swarna',
          market: 'Bhubaneswar Mandi',
          district: 'Khordha',
          state: 'Odisha',
          price: 3200,
          unit: 'quintal',
          date: new Date().toISOString().split('T')[0],
          trend: 'stable',
          changePercent: 0.8
        },
        {
          commodity: 'Wheat',
          market: 'Sambalpur Mandi',
          district: 'Sambalpur',
          state: 'Odisha',
          price: 2800,
          unit: 'quintal',
          date: new Date().toISOString().split('T')[0],
          trend: 'down',
          changePercent: -1.2
        },
        {
          commodity: 'Maize',
          market: 'Berhampur Mandi',
          district: 'Ganjam',
          state: 'Odisha',
          price: 2100,
          unit: 'quintal',
          date: new Date().toISOString().split('T')[0],
          trend: 'up',
          changePercent: 3.1
        }
      ];

      let filteredPrices = mockPrices;

      if (commodity) {
        filteredPrices = filteredPrices.filter(p =>
          p.commodity.toLowerCase() === commodity.toLowerCase()
        );
      }

      if (district) {
        filteredPrices = filteredPrices.filter(p =>
          p.district.toLowerCase() === district.toLowerCase()
        );
      }

      return filteredPrices;
    } catch (error) {
      throw new Error(`Price data fetch failed: ${(error as Error).message}`);
    }
  }

  async getMarketAnalysis(commodity: string): Promise<MarketAnalysis> {
    try {
      const prices = await this.getCurrentPrices(commodity);

      if (prices.length === 0) {
        throw new Error(`No price data available for ${commodity}`);
      }

      const analysis: MarketAnalysis = {
        commodity,
        averagePrice: this.calculateAverage(prices.map(p => p.price)),
        priceRange: {
          min: Math.min(...prices.map(p => p.price)),
          max: Math.max(...prices.map(p => p.price))
        },
        bestMarkets: this.getBestMarkets(prices),
        seasonalTrend: this.analyzeSeasonalTrend(commodity),
        forecast7Day: this.generatePriceForecast(commodity, 7),
        forecast30Day: this.generatePriceForecast(commodity, 30),
        demandIndex: this.calculateDemandIndex(commodity),
        supplyIndex: this.calculateSupplyIndex(commodity),
        aiInsights: [],
        confidence: 0
      };

      if (this.useAI) {
        try {
          const prompt = MARKET_ANALYSIS_PROMPTS.PRICE_FORECAST
            .replace('{commodity}', commodity)
            .replace('{region}', 'Odisha')
            .replace('{currentPrice}', analysis.averagePrice.toString())
            .replace('{unit}', prices[0]?.unit || 'unit')
            .replace('{trend}', analysis.seasonalTrend)
            .replace('{season}', analysis.seasonalTrend)
            .replace('{demandIndex}', analysis.demandIndex.toString())
            .replace('{supplyIndex}', analysis.supplyIndex.toString());

          const response = await openai.chat.completions.create({
            model: OPENAI_CONFIG.model,
            messages: [{ role: 'user', content: prompt }],
            temperature: OPENAI_CONFIG.temperature,
            max_tokens: OPENAI_CONFIG.maxTokens
          });

          const aiText = response.choices[0]?.message?.content || '';
          analysis.aiInsights = [aiText];
          analysis.confidence = 85; // Mock confidence, could be parsed from AI response
        } catch (aiError) {
          console.error('OpenAI market analysis error:', aiError);
        }
      }

      return analysis;
    } catch (error) {
      throw new Error(`Market analysis failed: ${(error as Error).message}`);
    }
  }

  async getPriceHistory(commodity: string, days: number = 30): Promise<{
    dates: string[];
    prices: number[];
    trend: 'up' | 'down' | 'stable';
    volatility: number;
  }> {
    try {
      // Generate mock historical data
      const history: {
        dates: string[];
        prices: number[];
        trend: 'up' | 'down' | 'stable';
        volatility: number;
      } = {
        dates: [],
        prices: [],
        trend: 'stable',
        volatility: 0
      };

      const basePrice = commodity === 'Rice' ? 3000 : commodity === 'Wheat' ? 2700 : 2000;

      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        history.dates.push(date.toISOString().split('T')[0]);

        // Add some random variation with trend
        const trendFactor = i > days / 2 ? 0.8 : 1.2; // Earlier dates slightly lower
        const variation = (Math.random() - 0.5) * 200 * trendFactor;
        history.prices.push(Math.round(basePrice + variation));
      }

      // Ensure arrays are properly typed
      history.dates = history.dates as string[];
      history.prices = history.prices as number[];

      // Calculate trend
      const firstPrice = history.prices[0];
      const lastPrice = history.prices[history.prices.length - 1];
      const changePercent = ((lastPrice - firstPrice) / firstPrice) * 100;

      if (changePercent > 2) history.trend = 'up';
      else if (changePercent < -2) history.trend = 'down';
      else history.trend = 'stable';

      // Calculate volatility (standard deviation)
      const mean = this.calculateAverage(history.prices);
      const squaredDiffs = history.prices.map(price => Math.pow(price - mean, 2));
      history.volatility = Math.sqrt(this.calculateAverage(squaredDiffs));

      return history;
    } catch (error) {
      throw new Error(`Price history fetch failed: ${(error as Error).message}`);
    }
  }

  async createPriceAlert(alertData: {
    commodity: string;
    targetPrice: number;
    condition: 'above' | 'below';
    userId: string;
  }): Promise<PriceAlert> {
    try {
      const alert: PriceAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        commodity: alertData.commodity,
        targetPrice: alertData.targetPrice,
        condition: alertData.condition,
        isActive: true,
        createdAt: new Date().toISOString()
      };

      // In a real implementation, this would be saved to a database
      console.log(`Price alert created for ${alertData.commodity} at ₹${alertData.targetPrice}`);

      return alert;
    } catch (error) {
      throw new Error(`Price alert creation failed: ${(error as Error).message}`);
    }
  }

  async getOptimalSellingTime(commodity: string, currentPrice: number): Promise<{
    shouldSellNow: boolean;
    optimalTime: string;
    expectedPrice: number;
    confidence: number;
    reasoning: string[];
  }> {
    try {
      const analysis = await this.getMarketAnalysis(commodity);
      const history = await this.getPriceHistory(commodity, 7);

      const recommendation = {
        shouldSellNow: this.shouldSellNow(currentPrice, analysis, history),
        optimalTime: this.calculateOptimalSellingTime(analysis, history),
        expectedPrice: analysis.forecast7Day,
        confidence: this.calculateConfidence(analysis, history),
        reasoning: this.generateSellingReasoning(currentPrice, analysis, history)
      };

      return recommendation;
    } catch (error) {
      throw new Error(`Selling time recommendation failed: ${(error as Error).message}`);
    }
  }

  async getRegionalPriceComparison(commodity: string): Promise<{
    regionalPrices: { region: string; averagePrice: number; trend: string }[];
    bestRegion: string;
    priceDifference: number;
    transportationCost: number;
    netBenefit: number;
  }> {
    try {
      const prices = await this.getCurrentPrices(commodity);
      const regions = ['Coastal Odisha', 'Western Odisha', 'Southern Odisha', 'Northern Odisha'];

      const regionalPrices = regions.map(region => {
        const regionPrices = prices.filter(p => this.getRegionFromDistrict(p.district) === region);
        const avgPrice = regionPrices.length > 0 ? this.calculateAverage(regionPrices.map(p => p.price)) : 0;

        return {
          region,
          averagePrice: avgPrice,
          trend: regionPrices.length > 0 ? regionPrices[0].trend : 'stable'
        };
      });

      const bestRegion = regionalPrices.reduce((best, current) =>
        current.averagePrice > best.averagePrice ? current : best
      );

      const currentRegion = regionalPrices[0]; // Assuming current region
      const priceDifference = bestRegion.averagePrice - currentRegion.averagePrice;
      const transportationCost = this.estimateTransportationCost(currentRegion.region, bestRegion.region);
      const netBenefit = priceDifference - transportationCost;

      return {
        regionalPrices,
        bestRegion: bestRegion.region,
        priceDifference,
        transportationCost,
        netBenefit
      };
    } catch (error) {
      throw new Error(`Regional comparison failed: ${(error as Error).message}`);
    }
  }

  async getMarketIntelligence(): Promise<MarketIntelligence> {
    try {
      const [mandiPrices, riceAnalysis, wheatAnalysis] = await Promise.all([
        this.getCurrentPrices(),
        this.getMarketAnalysis('Rice'),
        this.getMarketAnalysis('Wheat')
      ]);

      const intelligence: MarketIntelligence = {
        mandiPrices,
        analysis: [riceAnalysis, wheatAnalysis],
        alerts: [], // Would be fetched from user preferences
        recommendations: this.generateMarketRecommendations([riceAnalysis, wheatAnalysis])
      };

      return intelligence;
    } catch (error) {
      throw new Error(`Market intelligence fetch failed: ${(error as Error).message}`);
    }
  }

  /**
   * Get export opportunity alerts for cash crops
   */
  async getExportOpportunities(): Promise<{
    opportunities: Array<{
      crop: string;
      destination: string;
      potentialPrice: number;
      volumeRequired: number;
      deadline: string;
      requirements: string[];
    }>;
    alerts: string[];
  }> {
    try {
      // Mock export opportunities for Odisha cash crops
      const opportunities = [
        {
          crop: 'Rice',
          destination: 'Middle East',
          potentialPrice: 4500,
          volumeRequired: 1000,
          deadline: '2025-02-15',
          requirements: ['Organic certification', 'Premium quality grade', 'Phytosanitary certificate']
        },
        {
          crop: 'Cashew',
          destination: 'USA',
          potentialPrice: 8000,
          volumeRequired: 500,
          deadline: '2025-03-01',
          requirements: ['Grade 1 quality', 'Export packaging', 'Quality inspection']
        },
        {
          crop: 'Spices',
          destination: 'Europe',
          potentialPrice: 12000,
          volumeRequired: 200,
          deadline: '2025-01-30',
          requirements: ['Organic certification', 'EU standards compliance', 'Traceability documentation']
        }
      ];

      const alerts = [
        'High demand for organic rice in Middle East markets',
        'Premium pricing available for Grade 1 cashew exports',
        'European spice market showing increased interest in Odisha products'
      ];

      return { opportunities, alerts };
    } catch (error) {
      throw new Error(`Export opportunities fetch failed: ${(error as Error).message}`);
    }
  }

  /**
   * Calculate bulk order pricing with transportation costs
   */
  async calculateBulkPricing(
    crop: string,
    quantity: number,
    quality: string,
    fromLocation: string,
    toLocation: string
  ): Promise<{
    basePrice: number;
    qualityPremium: number;
    bulkDiscount: number;
    transportationCost: number;
    totalCost: number;
    netPrice: number;
    profitMargin: number;
    recommendations: string[];
  }> {
    try {
      const marketAnalysis = await this.getMarketAnalysis(crop);
      const basePrice = marketAnalysis.averagePrice;

      // Calculate quality premium
      const qualityPremium = this.calculateQualityPremium(crop, quality, basePrice);

      // Calculate bulk discount
      const bulkDiscount = this.calculateBulkDiscount(quantity);

      // Calculate transportation cost
      const transportationCost = await this.calculateTransportationCost(fromLocation, toLocation, quantity);

      // Calculate total costs (assuming 20% operational costs)
      const operationalCosts = (basePrice + qualityPremium) * 0.2;
      const totalCost = operationalCosts + transportationCost;

      // Calculate net price and profit margin
      const netPrice = basePrice + qualityPremium - bulkDiscount;
      const profitMargin = ((netPrice - totalCost) / totalCost) * 100;

      const recommendations = this.generateBulkPricingRecommendations(
        crop, quantity, quality, profitMargin, transportationCost
      );

      return {
        basePrice,
        qualityPremium,
        bulkDiscount,
        transportationCost,
        totalCost,
        netPrice,
        profitMargin,
        recommendations
      };
    } catch (error) {
      throw new Error(`Bulk pricing calculation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Get demand-supply indicators by region
   */
  async getDemandSupplyIndicators(): Promise<{
    regionalIndicators: Array<{
      region: string;
      crop: string;
      demandIndex: number;
      supplyIndex: number;
      balance: 'surplus' | 'deficit' | 'balanced';
      priceTrend: 'increasing' | 'decreasing' | 'stable';
      opportunities: string[];
    }>;
    overallTrends: string[];
  }> {
    try {
      const regions = ['Coastal Odisha', 'Western Odisha', 'Southern Odisha', 'Northern Odisha'];
      const crops = ['Rice', 'Wheat', 'Maize', 'Pulses'];

      const regionalIndicators = [];

      for (const region of regions) {
        for (const crop of crops) {
          const demandIndex = this.calculateRegionalDemandIndex(region, crop);
          const supplyIndex = this.calculateRegionalSupplyIndex(region, crop);
          const balance = this.determineSupplyDemandBalance(demandIndex, supplyIndex);
          const priceTrend = this.getRegionalPriceTrend(region, crop);

          regionalIndicators.push({
            region,
            crop,
            demandIndex,
            supplyIndex,
            balance,
            priceTrend,
            opportunities: this.generateRegionalOpportunities(region, crop, balance, priceTrend)
          });
        }
      }

      const overallTrends = [
        'Increasing demand for organic produce across all regions',
        'Rice surplus in coastal regions, deficit in western Odisha',
        'Growing export demand for cash crops',
        'Seasonal price fluctuations expected for maize'
      ];

      return { regionalIndicators, overallTrends };
    } catch (error) {
      throw new Error(`Demand-supply indicators fetch failed: ${(error as Error).message}`);
    }
  }

  // Helper methods for new features
  private calculateQualityPremium(crop: string, quality: string, basePrice: number): number {
    const premiumRates = {
      'Rice': { 'Premium': 0.3, 'Grade-A': 0.2, 'Grade-B': 0.1, 'Grade-C': 0 },
      'Wheat': { 'Premium': 0.25, 'Grade-A': 0.15, 'Grade-B': 0.05, 'Grade-C': 0 },
      'Maize': { 'Premium': 0.2, 'Grade-A': 0.1, 'Grade-B': 0.05, 'Grade-C': 0 }
    };

    const cropPremiums = premiumRates[crop as keyof typeof premiumRates] || { 'Premium': 0.2, 'Grade-A': 0.1, 'Grade-B': 0.05, 'Grade-C': 0 };
    const premiumRate = cropPremiums[quality as keyof typeof cropPremiums] || 0;

    return basePrice * premiumRate;
  }

  private calculateBulkDiscount(quantity: number): number {
    if (quantity >= 1000) return 300; // Large bulk discount
    if (quantity >= 500) return 150; // Medium bulk discount
    if (quantity >= 100) return 50; // Small bulk discount
    return 0; // No discount for small quantities
  }

  private async calculateTransportationCost(fromLocation: string, toLocation: string, quantity: number): Promise<number> {
    // Mock transportation cost calculation
    const baseDistanceCost = 200; // Base cost per quintal
    const distanceMultiplier = this.getDistanceMultiplier(fromLocation, toLocation);
    const quantityDiscount = quantity > 500 ? 0.9 : 1; // 10% discount for large quantities

    return Math.round(baseDistanceCost * distanceMultiplier * quantityDiscount);
  }

  private getDistanceMultiplier(fromLocation: string, toLocation: string): number {
    // Mock distance multipliers
    const distanceMatrix: { [key: string]: { [key: string]: number } } = {
      'Cuttack': { 'Bhubaneswar': 1.2, 'Sambalpur': 2.5, 'Berhampur': 1.8 },
      'Bhubaneswar': { 'Cuttack': 1.2, 'Sambalpur': 2.3, 'Berhampur': 1.6 },
      'Sambalpur': { 'Cuttack': 2.5, 'Bhubaneswar': 2.3, 'Berhampur': 3.1 },
      'Berhampur': { 'Cuttack': 1.8, 'Bhubaneswar': 1.6, 'Sambalpur': 3.1 }
    };

    return distanceMatrix[fromLocation]?.[toLocation] || 2.0;
  }

  private generateBulkPricingRecommendations(
    crop: string,
    quantity: number,
    quality: string,
    profitMargin: number,
    transportationCost: number
  ): string[] {
    const recommendations = [];

    if (profitMargin > 30) {
      recommendations.push('Excellent profit margin - proceed with sale');
    } else if (profitMargin > 15) {
      recommendations.push('Good profit margin - consider negotiating better rates');
    } else {
      recommendations.push('Low profit margin - explore alternative markets or value addition');
    }

    if (transportationCost > 500) {
      recommendations.push('High transportation costs - consider local markets or bulk transport');
    }

    if (quality === 'Premium' && profitMargin > 20) {
      recommendations.push('Premium quality justifies higher pricing - target premium markets');
    }

    if (quantity > 500) {
      recommendations.push('Large quantity - consider direct buyer contracts for better rates');
    }

    return recommendations;
  }

  private calculateRegionalDemandIndex(region: string, crop: string): number {
    // Mock demand calculation based on regional factors
    const baseDemand = 70;
    const regionalFactors: { [key: string]: number } = {
      'Coastal Odisha': crop === 'Rice' ? 15 : -5,
      'Western Odisha': crop === 'Wheat' ? 10 : 0,
      'Southern Odisha': crop === 'Maize' ? 15 : -10,
      'Northern Odisha': crop === 'Pulses' ? 10 : 5
    };

    return Math.min(100, Math.max(0, baseDemand + (regionalFactors[region] || 0)));
  }

  private calculateRegionalSupplyIndex(region: string, crop: string): number {
    // Mock supply calculation
    const baseSupply = 65;
    const regionalFactors: { [key: string]: number } = {
      'Coastal Odisha': crop === 'Rice' ? 20 : -15,
      'Western Odisha': crop === 'Wheat' ? 15 : -5,
      'Southern Odisha': crop === 'Maize' ? 10 : 0,
      'Northern Odisha': crop === 'Pulses' ? 5 : 10
    };

    return Math.min(100, Math.max(0, baseSupply + (regionalFactors[region] || 0)));
  }

  private determineSupplyDemandBalance(demandIndex: number, supplyIndex: number): 'surplus' | 'deficit' | 'balanced' {
    const difference = supplyIndex - demandIndex;

    if (difference > 15) return 'surplus';
    if (difference < -15) return 'deficit';
    return 'balanced';
  }

  private getRegionalPriceTrend(region: string, crop: string): 'increasing' | 'decreasing' | 'stable' {
    // Mock price trend calculation
    const trends = ['increasing', 'decreasing', 'stable'] as const;
    return trends[Math.floor(Math.random() * trends.length)];
  }

  private generateRegionalOpportunities(
    region: string,
    crop: string,
    balance: string,
    priceTrend: string
  ): string[] {
    const opportunities = [];

    if (balance === 'surplus') {
      opportunities.push(`Export opportunities available for ${crop} from ${region}`);
      opportunities.push('Consider inter-regional trade to deficit areas');
    }

    if (balance === 'deficit') {
      opportunities.push(`Import opportunities for ${crop} in ${region}`);
      opportunities.push('Consider contract farming arrangements');
    }

    if (priceTrend === 'increasing') {
      opportunities.push(`Rising prices expected for ${crop} in ${region}`);
      opportunities.push('Consider holding inventory for better returns');
    }

    return opportunities;
  }

  private calculateAverage(prices: number[]): number {
    return Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length);
  }

  private getBestMarkets(prices: CommodityPrice[]): string[] {
    return prices
      .sort((a, b) => b.price - a.price)
      .slice(0, 3)
      .map(p => p.market);
  }

  private analyzeSeasonalTrend(commodity: string): 'increasing' | 'decreasing' | 'stable' {
    // Mock seasonal analysis
    const seasonalTrends: { [key: string]: 'increasing' | 'decreasing' | 'stable' } = {
      'Rice': 'stable',
      'Wheat': 'increasing',
      'Maize': 'decreasing'
    };

    return seasonalTrends[commodity] || 'stable';
  }

  private generatePriceForecast(commodity: string, days: number): number {
    // Mock forecast calculation
    const basePrices: { [key: string]: number } = {
      'Rice': 3100,
      'Wheat': 2800,
      'Maize': 2100
    };

    const basePrice = basePrices[commodity] || 2500;
    const trend = this.analyzeSeasonalTrend(commodity);

    let multiplier = 1;
    if (trend === 'increasing') multiplier = 1.05;
    else if (trend === 'decreasing') multiplier = 0.95;

    return Math.round(basePrice * multiplier);
  }

  private calculateDemandIndex(commodity: string): number {
    // Mock demand calculation based on seasonal factors
    const demandFactors: { [key: string]: number } = {
      'Rice': 75,
      'Wheat': 60,
      'Maize': 45
    };

    return demandFactors[commodity] || 50;
  }

  private calculateSupplyIndex(commodity: string): number {
    // Mock supply calculation
    const supplyFactors: { [key: string]: number } = {
      'Rice': 80,
      'Wheat': 70,
      'Maize': 55
    };

    return supplyFactors[commodity] || 50;
  }

  private shouldSellNow(currentPrice: number, analysis: MarketAnalysis, history: any): boolean {
    const forecastPrice = analysis.forecast7Day;
    const priceIncrease = ((forecastPrice - currentPrice) / currentPrice) * 100;

    return priceIncrease < 2; // Sell now if price won't increase significantly
  }

  private calculateOptimalSellingTime(analysis: MarketAnalysis, history: any): string {
    if (analysis.seasonalTrend === 'increasing') {
      return 'Wait 1-2 weeks for better prices';
    } else if (analysis.seasonalTrend === 'decreasing') {
      return 'Sell within next 3-5 days';
    }
    return 'Sell within this week';
  }

  private calculateConfidence(analysis: MarketAnalysis, history: any): number {
    // Mock confidence calculation
    return Math.min(95, Math.max(60, 80 + (Math.random() * 15)));
  }

  private generateSellingReasoning(currentPrice: number, analysis: MarketAnalysis, history: any): string[] {
    const reasoning: string[] = [];

    if (analysis.seasonalTrend === 'increasing') {
      reasoning.push('Prices are expected to rise in the coming weeks');
    }

    if (currentPrice > analysis.averagePrice) {
      reasoning.push('Current price is above market average');
    }

    if (analysis.demandIndex > 70) {
      reasoning.push('High demand indicates good selling conditions');
    }

    return reasoning;
  }

  private getRegionFromDistrict(district: string): string {
    const coastal = ['Cuttack', 'Khordha', 'Puri', 'Jagatsinghpur'];
    const western = ['Sambalpur', 'Jharsuguda', 'Bargarh'];
    const southern = ['Ganjam', 'Gajapati', 'Malkangiri'];
    const northern = ['Mayurbhanj', 'Kalahandi', 'Nuapada'];

    if (coastal.includes(district)) return 'Coastal Odisha';
    if (western.includes(district)) return 'Western Odisha';
    if (southern.includes(district)) return 'Southern Odisha';
    if (northern.includes(district)) return 'Northern Odisha';

    return 'Central Odisha';
  }

  private estimateTransportationCost(fromRegion: string, toRegion: string): number {
    if (fromRegion === toRegion) return 0;

    // Mock transportation costs in rupees per quintal
    const distanceMatrix: { [key: string]: { [key: string]: number } } = {
      'Coastal Odisha': {
        'Western Odisha': 150,
        'Southern Odisha': 200,
        'Northern Odisha': 180
      },
      'Western Odisha': {
        'Coastal Odisha': 150,
        'Southern Odisha': 250,
        'Northern Odisha': 120
      }
    };

    return distanceMatrix[fromRegion]?.[toRegion] || 200;
  }

  private generateMarketRecommendations(analyses: MarketAnalysis[]): string[] {
    const recommendations: string[] = [];

    analyses.forEach(analysis => {
      if (analysis.seasonalTrend === 'increasing') {
        recommendations.push(`Consider holding ${analysis.commodity} for better prices`);
      }

      if (analysis.demandIndex > 70) {
        recommendations.push(`High demand for ${analysis.commodity} - good selling opportunity`);
      }

      if (analysis.priceRange.max - analysis.priceRange.min > 500) {
        recommendations.push(`Significant price variation for ${analysis.commodity} across markets`);
      }
    });

    return recommendations;
  }
}
