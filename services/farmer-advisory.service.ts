import { GovernmentSchemeService } from './government.service';
import { MarketIntelligenceService } from './market-intelligence.service';
import { WeatherService } from './weather.service';

export interface CropRecommendation {
  cropType: string;
  suitabilityScore: number;
  expectedYield: number;
  profitPotential: number;
  riskLevel: 'low' | 'medium' | 'high';
  reasons: string[];
  plantingWindow: {
    startDate: string;
    endDate: string;
  };
  careInstructions: string[];
}

export interface MarketAdvisory {
  commodity: string;
  recommendation: 'sell_now' | 'hold' | 'wait';
  confidence: number;
  expectedPrice: number;
  timeFrame: string;
  reasoning: string[];
  alternativeActions: string[];
}

export interface WeatherAdvisory {
  alertType: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  impact: string;
  recommendations: string[];
  validUntil: string;
}

export interface SchemeAdvisory {
  schemeName: string;
  eligibilityScore: number;
  potentialBenefit: number;
  applicationDeadline: string;
  requirements: string[];
  applicationSteps: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface FarmHealthReport {
  overallScore: number;
  categories: {
    soilHealth: { score: number; issues: string[]; recommendations: string[] };
    cropHealth: { score: number; issues: string[]; recommendations: string[] };
    waterManagement: { score: number; issues: string[]; recommendations: string[] };
    pestManagement: { score: number; issues: string[]; recommendations: string[] };
  };
  actionItems: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

export interface PersonalizedAdvisory {
  farmerId: string;
  location: { latitude: number; longitude: number };
  farmSize: number;
  soilType: string;
  currentCrops: string[];
  cropRecommendations: CropRecommendation[];
  marketAdvisories: MarketAdvisory[];
  weatherAdvisories: WeatherAdvisory[];
  schemeAdvisories: SchemeAdvisory[];
  farmHealthReport: FarmHealthReport;
  generatedAt: string;
}

export class FarmerAdvisoryService {
  private marketService: MarketIntelligenceService;
  private weatherService: WeatherService;
  private governmentService: GovernmentSchemeService;

  constructor() {
    this.marketService = new MarketIntelligenceService();
    this.weatherService = new WeatherService();
    this.governmentService = new GovernmentSchemeService();
  }

  /**
   * Generate comprehensive personalized advisory for a farmer
   */
  async generatePersonalizedAdvisory(farmerData: {
    farmerId: string;
    location: { latitude: number; longitude: number };
    farmSize: number;
    soilType: string;
    currentCrops: string[];
  }): Promise<PersonalizedAdvisory> {
    try {
      // Generate all advisory components in parallel
      const [
        cropRecommendations,
        marketAdvisories,
        weatherAdvisories,
        schemeAdvisories,
        farmHealthReport
      ] = await Promise.all([
        this.generateCropRecommendations(farmerData),
        this.generateMarketAdvisories(farmerData.currentCrops),
        this.generateWeatherAdvisories(farmerData.location),
        this.generateSchemeAdvisories(farmerData.farmerId),
        this.generateFarmHealthReport(farmerData)
      ]);

      return {
        farmerId: farmerData.farmerId,
        location: farmerData.location,
        farmSize: farmerData.farmSize,
        soilType: farmerData.soilType,
        currentCrops: farmerData.currentCrops,
        cropRecommendations,
        marketAdvisories,
        weatherAdvisories,
        schemeAdvisories,
        farmHealthReport,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Advisory generation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Generate crop recommendations based on farmer's conditions
   */
  async generateCropRecommendations(farmerData: {
    location: { latitude: number; longitude: number };
    soilType: string;
    farmSize: number;
  }): Promise<CropRecommendation[]> {
    try {
      const recommendations: CropRecommendation[] = [];

      // Get current season
      const currentMonth = new Date().getMonth() + 1;
      const season = this.getCurrentSeason(currentMonth);

      // Odisha-specific crop recommendations
      const cropData = this.getOdishaCropData();

      for (const crop of cropData) {
        if (crop.suitableSeasons.includes(season)) {
          const suitabilityScore = this.calculateSuitabilityScore(crop, farmerData);
          const expectedYield = this.calculateExpectedYield(crop, farmerData);
          const profitPotential = this.calculateProfitPotential(crop, expectedYield);
          const riskLevel = this.assessRiskLevel(crop, farmerData);

          if (suitabilityScore > 60) { // Only recommend crops with good suitability
            recommendations.push({
              cropType: crop.name,
              suitabilityScore,
              expectedYield,
              profitPotential,
              riskLevel,
              reasons: this.generateSuitabilityReasons(crop, farmerData),
              plantingWindow: crop.plantingWindow,
              careInstructions: crop.careInstructions
            });
          }
        }
      }

      // Sort by profit potential
      return recommendations.sort((a, b) => b.profitPotential - a.profitPotential);
    } catch (error) {
      throw new Error(`Crop recommendation generation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Generate market advisories for current crops
   */
  async generateMarketAdvisories(currentCrops: string[]): Promise<MarketAdvisory[]> {
    try {
      const advisories: MarketAdvisory[] = [];

      for (const crop of currentCrops) {
        try {
          const marketAnalysis = await this.marketService.getMarketAnalysis(crop);
          const sellingRecommendation = await this.marketService.getOptimalSellingTime(
            crop,
            marketAnalysis.averagePrice
          );

          const advisory: MarketAdvisory = {
            commodity: crop,
            recommendation: sellingRecommendation.shouldSellNow ? 'sell_now' : 'hold',
            confidence: sellingRecommendation.confidence,
            expectedPrice: sellingRecommendation.expectedPrice,
            timeFrame: sellingRecommendation.optimalTime,
            reasoning: sellingRecommendation.reasoning,
            alternativeActions: this.generateAlternativeActions(crop, marketAnalysis)
          };

          advisories.push(advisory);
        } catch (error) {
          // Skip crops that don't have market data
          console.warn(`Could not generate market advisory for ${crop}: ${(error as Error).message}`);
        }
      }

      return advisories;
    } catch (error) {
      throw new Error(`Market advisory generation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Generate weather advisories for the location
   */
  async generateWeatherAdvisories(location: { latitude: number; longitude: number }): Promise<WeatherAdvisory[]> {
    try {
      const advisories: WeatherAdvisory[] = [];

      // Get current weather conditions
      const currentWeather = await this.weatherService.getCurrentWeather(
        location.latitude,
        location.longitude
      );

      // Get 7-day forecast
      // Removed call to getForecast as it does not exist in WeatherService
      const forecast = null;

      // Analyze weather conditions for agricultural impact
      const weatherAnalysis = this.analyzeWeatherConditions(currentWeather, forecast);

      if (weatherAnalysis.rainfall > 50) {
        advisories.push({
          alertType: 'warning',
          title: 'Heavy Rainfall Expected',
          description: `Heavy rainfall of ${weatherAnalysis.rainfall}mm expected in the next 7 days`,
          impact: 'May cause waterlogging and crop damage',
          recommendations: [
            'Ensure proper drainage in fields',
            'Avoid fertilizer application during heavy rain',
            'Monitor crops for waterlogging signs',
            'Prepare for possible pest outbreaks after rain'
          ],
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
      }

      if (weatherAnalysis.temperature > 35) {
        advisories.push({
          alertType: 'warning',
          title: 'High Temperature Alert',
          description: `Temperatures expected to reach ${weatherAnalysis.temperature}°C`,
          impact: 'May affect crop growth and increase water requirements',
          recommendations: [
            'Increase irrigation frequency',
            'Provide shade for young plants',
            'Monitor for heat stress symptoms',
            'Consider mulching to retain soil moisture'
          ],
          validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        });
      }

      if (weatherAnalysis.dryDays > 5) {
        advisories.push({
          alertType: 'info',
          title: 'Dry Spell Expected',
          description: `${weatherAnalysis.dryDays} consecutive dry days expected`,
          impact: 'May require additional irrigation',
          recommendations: [
            'Plan irrigation schedule',
            'Check soil moisture levels regularly',
            'Consider drought-resistant crop varieties',
            'Monitor for wilting symptoms'
          ],
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
      }

      return advisories;
    } catch (error) {
      throw new Error(`Weather advisory generation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Generate government scheme advisories
   */
  async generateSchemeAdvisories(farmerId: string): Promise<SchemeAdvisory[]> {
    try {
      const advisories: SchemeAdvisory[] = [];

      // Check KALIA scheme eligibility
      const kaliaEligibility = await this.governmentService.checkKALIAEligibility(farmerId);

      if (kaliaEligibility.isEligible) {
        advisories.push({
          schemeName: 'KALIA Scheme',
          eligibilityScore: 95,
          potentialBenefit: kaliaEligibility.benefitAmount,
          applicationDeadline: 'December 31, 2025',
          requirements: kaliaEligibility.requirements,
          applicationSteps: [
            'Visit nearest agriculture office',
            'Submit Aadhaar card and land documents',
            'Complete bank account verification',
            'Receive approval within 30 days'
          ],
          priority: 'high'
        });
      }

      // Check Samrudha Krushak scheme
      const procurementInfo = await this.governmentService.getPaddyProcurementInfo(farmerId);

      if (procurementInfo.registrationOpen) {
        advisories.push({
          schemeName: 'Samrudha Krushak Yojana',
          eligibilityScore: 90,
          potentialBenefit: procurementInfo.currentMSP * 100, // Assuming 100 quintals
          applicationDeadline: procurementInfo.availableSlots[0]?.date || 'TBD',
          requirements: procurementInfo.requiredDocuments,
          applicationSteps: [
            'Register at nearest procurement center',
            'Get quality assessment done',
            'Submit produce for procurement',
            'Receive payment within 48 hours'
          ],
          priority: 'high'
        });
      }

      // Check subsidy schemes
      const activeSubsidies = await this.governmentService.getActiveSubsidies(farmerId);

      for (const subsidy of activeSubsidies) {
        if (subsidy.status === 'available') {
          const subsidyCalculation = await this.governmentService.calculateSubsidy(
            subsidy.equipmentType,
            subsidy.maxBenefit * 2 // Assuming equipment cost
          );

          advisories.push({
            schemeName: `${subsidy.equipmentType} Subsidy`,
            eligibilityScore: 85,
            potentialBenefit: subsidyCalculation.subsidyAmount,
            applicationDeadline: 'Ongoing',
            requirements: [
              'Equipment quotation',
              'Land documents',
              'Bank account details'
            ],
            applicationSteps: subsidyCalculation.applicationProcess,
            priority: 'medium'
          });
        }
      }

      return advisories;
    } catch (error) {
      throw new Error(`Scheme advisory generation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Generate farm health report
   */
  async generateFarmHealthReport(farmerData: {
    soilType: string;
    currentCrops: string[];
    farmSize: number;
  }): Promise<FarmHealthReport> {
    try {
      // Mock farm health assessment
      const soilHealth = this.assessSoilHealth(farmerData.soilType);
      const cropHealth = this.assessCropHealth(farmerData.currentCrops);
      const waterManagement = this.assessWaterManagement(farmerData.farmSize);
      const pestManagement = this.assessPestManagement(farmerData.currentCrops);

      const overallScore = Math.round(
        (soilHealth.score + cropHealth.score + waterManagement.score + pestManagement.score) / 4
      );

      return {
        overallScore,
        categories: {
          soilHealth,
          cropHealth,
          waterManagement,
          pestManagement
        },
        actionItems: {
          immediate: this.generateImmediateActions(soilHealth, cropHealth, waterManagement, pestManagement),
          shortTerm: this.generateShortTermActions(soilHealth, cropHealth, waterManagement, pestManagement),
          longTerm: this.generateLongTermActions(soilHealth, cropHealth, waterManagement, pestManagement)
        }
      };
    } catch (error) {
      throw new Error(`Farm health report generation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Get quick advisory for specific scenarios
   */
  async getQuickAdvisory(scenario: 'pest_attack' | 'drought' | 'excess_rain' | 'market_crash', cropType: string): Promise<{
    title: string;
    description: string;
    immediateActions: string[];
    preventiveMeasures: string[];
  }> {
    try {
      const advisories = {
        pest_attack: {
          title: 'Pest Attack Management',
          description: 'Immediate steps to control pest infestation',
          immediateActions: [
            'Identify the pest type and affected area',
            'Apply appropriate organic pesticides',
            'Remove and destroy affected plant parts',
            'Introduce natural predators if possible'
          ],
          preventiveMeasures: [
            'Regular field monitoring',
            'Crop rotation practices',
            'Use of pest-resistant varieties',
            'Maintain field sanitation'
          ]
        },
        drought: {
          title: 'Drought Management',
          description: 'Water conservation and drought-resistant strategies',
          immediateActions: [
            'Check soil moisture levels',
            'Implement water-saving irrigation',
            'Mulch soil to retain moisture',
            'Prioritize watering for high-value crops'
          ],
          preventiveMeasures: [
            'Install rainwater harvesting',
            'Use drought-resistant crop varieties',
            'Implement conservation tillage',
            'Monitor weather forecasts regularly'
          ]
        },
        excess_rain: {
          title: 'Waterlogging Management',
          description: 'Managing excess water in fields',
          immediateActions: [
            'Create drainage channels',
            'Avoid working in waterlogged soil',
            'Monitor for root rot symptoms',
            'Apply fungicides if needed'
          ],
          preventiveMeasures: [
            'Improve field drainage systems',
            'Raised bed farming',
            'Select water-tolerant varieties',
            'Regular soil testing'
          ]
        },
        market_crash: {
          title: 'Market Price Drop Management',
          description: 'Strategies for low market prices',
          immediateActions: [
            'Assess storage capacity',
            'Consider value addition processing',
            'Explore alternative markets',
            'Check government procurement schemes'
          ],
          preventiveMeasures: [
            'Diversify crop portfolio',
            'Build storage infrastructure',
            'Join farmer producer organizations',
            'Monitor market trends regularly'
          ]
        }
      };

      return advisories[scenario];
    } catch (error) {
      throw new Error(`Quick advisory generation failed: ${(error as Error).message}`);
    }
  }

  // Helper methods
  private getCurrentSeason(month: number): string {
    if (month >= 6 && month <= 9) return 'kharif';
    if (month >= 10 && month <= 12) return 'rabi';
    if (month >= 1 && month <= 5) return 'summer';
    return 'off-season';
  }

  private getOdishaCropData(): any[] {
    return [
      {
        name: 'Rice',
        suitableSeasons: ['kharif', 'rabi'],
        soilTypes: ['alluvial', 'clay', 'loam'],
        plantingWindow: { startDate: 'June 15', endDate: 'July 15' },
        careInstructions: ['Regular irrigation', 'Pest monitoring', 'Timely weeding']
      },
      {
        name: 'Wheat',
        suitableSeasons: ['rabi'],
        soilTypes: ['loam', 'clay'],
        plantingWindow: { startDate: 'November 15', endDate: 'December 15' },
        careInstructions: ['Cold weather protection', 'Irrigation management', 'Disease monitoring']
      },
      {
        name: 'Maize',
        suitableSeasons: ['kharif', 'rabi'],
        soilTypes: ['alluvial', 'loam'],
        plantingWindow: { startDate: 'June 20', endDate: 'July 20' },
        careInstructions: ['Wind protection', 'Regular fertilization', 'Pest control']
      }
    ];
  }

  private calculateSuitabilityScore(crop: any, farmerData: any): number {
    let score = 50;

    if (crop.soilTypes.includes(farmerData.soilType.toLowerCase())) score += 20;
    if (farmerData.farmSize >= 2 && farmerData.farmSize <= 10) score += 15; // Medium farm size
    if (farmerData.location.latitude >= 19 && farmerData.location.latitude <= 23) score += 15; // Odisha latitude range

    return Math.min(100, score);
  }

  private calculateExpectedYield(crop: any, farmerData: any): number {
    const baseYields = { 'Rice': 4.5, 'Wheat': 3.2, 'Maize': 5.8 };
    const baseYield = baseYields[crop.name as keyof typeof baseYields] || 4.0;
    return Math.round(baseYield * farmerData.farmSize * 100) / 100;
  }

  private calculateProfitPotential(crop: any, expectedYield: number): number {
    const prices = { 'Rice': 3100, 'Wheat': 2800, 'Maize': 2100 };
    const price = prices[crop.name as keyof typeof prices] || 2500;
    const costs = { 'Rice': 15000, 'Wheat': 12000, 'Maize': 18000 };
    const cost = costs[crop.name as keyof typeof costs] || 15000;

    return Math.round((price * expectedYield * 100) - cost);
  }

  private assessRiskLevel(crop: any, farmerData: any): 'low' | 'medium' | 'high' {
    if (crop.name === 'Rice' && farmerData.soilType === 'alluvial') return 'low';
    if (farmerData.farmSize < 2) return 'high';
    return 'medium';
  }

  private generateSuitabilityReasons(crop: any, farmerData: any): string[] {
    const reasons: string[] = [];

    if (crop.soilTypes.includes(farmerData.soilType.toLowerCase())) {
      reasons.push(`Suitable for ${farmerData.soilType} soil type`);
    }

    reasons.push(`Expected yield: ${this.calculateExpectedYield(crop, farmerData)} tons/acre`);
    reasons.push(`Good market demand in Odisha`);

    return reasons;
  }

  private generateAlternativeActions(crop: string, analysis: any): string[] {
    return [
      `Consider storage for 2-4 weeks if prices expected to rise`,
      `Explore contract farming opportunities`,
      `Consider value addition like processing`,
      `Check alternative markets in nearby districts`
    ];
  }

  private analyzeWeatherConditions(currentWeather: any, forecast: any): any {
    // Mock weather analysis
    return {
      rainfall: 45,
      temperature: 32,
      dryDays: 3
    };
  }

  private assessSoilHealth(soilType: string): { score: number; issues: string[]; recommendations: string[] } {
    const assessments = {
      'alluvial': { score: 85, issues: ['Minor nutrient deficiency'], recommendations: ['Add organic matter', 'Regular soil testing'] },
      'clay': { score: 75, issues: ['Poor drainage', 'Compaction'], recommendations: ['Improve drainage', 'Add gypsum'] },
      'loam': { score: 90, issues: [], recommendations: ['Maintain current practices', 'Regular monitoring'] }
    };

    return assessments[soilType as keyof typeof assessments] || { score: 70, issues: ['Unknown soil type'], recommendations: ['Get soil testing done'] };
  }

  private assessCropHealth(currentCrops: string[]): { score: number; issues: string[]; recommendations: string[] } {
    if (currentCrops.length === 0) {
      return { score: 50, issues: ['No crops planted'], recommendations: ['Plan crop rotation', 'Select suitable crops'] };
    }

    return {
      score: 80,
      issues: ['Minor pest pressure'],
      recommendations: ['Regular monitoring', 'Integrated pest management']
    };
  }

  private assessWaterManagement(farmSize: number): { score: number; issues: string[]; recommendations: string[] } {
    if (farmSize < 2) {
      return { score: 70, issues: ['Limited irrigation options'], recommendations: ['Install drip irrigation', 'Rainwater harvesting'] };
    }

    return {
      score: 85,
      issues: [],
      recommendations: ['Optimize irrigation schedule', 'Monitor soil moisture']
    };
  }

  private assessPestManagement(currentCrops: string[]): { score: number; issues: string[]; recommendations: string[] } {
    return {
      score: 75,
      issues: ['Potential pest pressure'],
      recommendations: ['Regular field monitoring', 'Use of biopesticides', 'Crop rotation']
    };
  }

  private generateImmediateActions(...assessments: any[]): string[] {
    const actions: string[] = [];

    assessments.forEach(assessment => {
      if (assessment.issues.length > 0) {
        actions.push(...assessment.recommendations.slice(0, 2));
      }
    });

    return [...new Set(actions)]; // Remove duplicates
  }

  private generateShortTermActions(...assessments: any[]): string[] {
    return [
      'Implement integrated pest management',
      'Set up weather monitoring system',
      'Plan next cropping season',
      'Update farm records'
    ];
  }

  private generateLongTermActions(...assessments: any[]): string[] {
    return [
      'Invest in irrigation infrastructure',
      'Adopt sustainable farming practices',
      'Build storage facilities',
      'Join farmer producer organization'
    ];
  }
}

export const farmerAdvisoryService = new FarmerAdvisoryService();
