import OpenAI from 'openai';

// OpenAI Configuration
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here',
  dangerouslyAllowBrowser: true // Only for development - remove in production
});

// OpenAI Model Configuration
export const OPENAI_CONFIG = {
  model: 'gpt-4o-mini', // Cost-effective model for market analysis
  temperature: 0.3, // Lower temperature for more consistent market predictions
  maxTokens: 1000,
  timeout: 30000, // 30 second timeout
};

// Market Analysis Prompts
export const MARKET_ANALYSIS_PROMPTS = {
  PRICE_FORECAST: `
    Analyze the following market data for {commodity} in {region} and provide a price forecast:

    Current Data:
    - Current Price: ₹{currentPrice} per {unit}
    - Historical Trend: {trend}
    - Seasonal Factor: {season}
    - Demand Index: {demandIndex}/100
    - Supply Index: {supplyIndex}/100

    Please provide:
    1. 7-day price forecast with confidence level
    2. 30-day price forecast with confidence level
    3. Key factors influencing the price
    4. Recommendations for farmers
  `,

  MARKET_INSIGHTS: `
    Based on the following market intelligence data for Odisha agriculture:

    Commodities: {commodities}
    Current Market Conditions: {marketConditions}
    Regional Variations: {regionalData}

    Provide:
    1. Market trends analysis
    2. Price volatility assessment
    3. Regional opportunities
    4. Risk factors and mitigation strategies
    5. Actionable recommendations for farmers
  `,

  EXPORT_OPPORTUNITIES: `
    Analyze export opportunities for the following Odisha agricultural products:

    Products: {products}
    Current Market Data: {marketData}
    Global Demand Trends: {globalTrends}

    Provide:
    1. High-potential export markets
    2. Competitive advantages of Odisha products
    3. Required certifications and compliance
    4. Pricing strategies for international markets
    5. Logistics and supply chain recommendations
  `,

  SELLING_STRATEGY: `
    Develop an optimal selling strategy for {commodity} based on:

    Current Price: ₹{currentPrice}
    Market Forecast: {forecast}
    Inventory Level: {inventory}
    Farmer's Location: {location}
    Quality Grade: {quality}

    Provide:
    1. Optimal timing for sale
    2. Recommended selling channels
    3. Price negotiation strategies
    4. Risk management recommendations
    5. Alternative options if market conditions change
  `
};

export default openai;
