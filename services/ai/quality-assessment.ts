
export type QualityGrade = 'Premium' | 'Grade-A' | 'Grade-B' | 'Grade-C';

export interface QualityAssessmentResult {
  grade: QualityGrade;
  qualityScore: number;
  defects: string[];
  confidence: number;
  marketPrice: number;
  recommendations: string[];
  processingTime: string;
  timestamp: string;
}

export interface BatchQualityResult {
  individualResults: QualityAssessmentResult[];
  batchSummary: {
    averageQuality: number;
    overallGrade: QualityGrade;
    consistencyScore: number;
    recommendations: string[];
  };
  totalImages: number;
  processingTime: number;
}

export class MockAIQualityService {
  private basePrices: Record<string, number> = {
    'rice': 3100,
    'wheat': 2725,
    'maize': 2090,
    'pulses': 4500,
    'vegetables': 3500
  };

  async assessQualityDemo(imageUri: string, cropType: string): Promise<QualityAssessmentResult> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate realistic demo results based on crop type
    const baseScores = {
      'rice': 85,
      'wheat': 78,
      'maize': 82,
      'pulses': 80,
      'vegetables': 75
    };

    const randomVariation = Math.random() * 20 - 10; // ±10%
    const qualityScore = Math.max(60, Math.min(95, baseScores[cropType as keyof typeof baseScores] + randomVariation));

    return {
      grade: this.mapScoreToGrade(qualityScore),
      qualityScore: Math.round(qualityScore),
      defects: this.generateRealisticDefects(qualityScore),
      confidence: 0.85 + Math.random() * 0.1,
      marketPrice: this.calculateMarketPrice(cropType, qualityScore),
      recommendations: this.generateRecommendations(qualityScore),
      processingTime: '~2 seconds',
      timestamp: new Date().toISOString()
    };
  }

  private mapScoreToGrade(score: number): QualityGrade {
    if (score >= 90) return 'Premium';
    if (score >= 80) return 'Grade-A';
    if (score >= 70) return 'Grade-B';
    return 'Grade-C';
  }

  private generateRealisticDefects(qualityScore: number): string[] {
    const defects: string[] = [];

    if (qualityScore < 85) {
      const possibleDefects = [
        'Minor discoloration',
        'Small foreign matter',
        'Slight moisture content',
        'Minor insect damage'
      ];

      // Add 1-2 defects for lower quality scores
      const numDefects = qualityScore < 75 ? 2 : 1;
      for (let i = 0; i < numDefects; i++) {
        const randomIndex = Math.floor(Math.random() * possibleDefects.length);
        defects.push(possibleDefects[randomIndex]);
      }
    }

    return defects;
  }

  private calculateMarketPrice(cropType: string, qualityScore: number): number {
    const basePrice = this.basePrices[cropType as keyof typeof this.basePrices] || 2000;
    const gradeMultiplier = this.getGradeMultiplier(qualityScore);
    return Math.round(basePrice * gradeMultiplier);
  }

  private getGradeMultiplier(qualityScore: number): number {
    if (qualityScore >= 90) return 1.2; // Premium
    if (qualityScore >= 80) return 1.1; // Grade-A
    if (qualityScore >= 70) return 1.0; // Grade-B
    return 0.85; // Grade-C
  }

  private generateRecommendations(qualityScore: number): string[] {
    const recommendations: string[] = [];

    if (qualityScore >= 90) {
      recommendations.push('Excellent quality - suitable for premium markets');
      recommendations.push('Consider organic certification for higher prices');
      recommendations.push('Maintain current harvesting and storage practices');
    } else if (qualityScore >= 80) {
      recommendations.push('Good quality - suitable for retail markets');
      recommendations.push('Focus on proper storage to maintain quality');
      recommendations.push('Consider value addition through processing');
    } else if (qualityScore >= 70) {
      recommendations.push('Average quality - suitable for wholesale markets');
      recommendations.push('Improve harvest timing and post-harvest handling');
      recommendations.push('Consider sorting and grading before sale');
    } else {
      recommendations.push('Below average quality detected');
      recommendations.push('Review farming practices and soil management');
      recommendations.push('Consider alternative uses or processing');
    }

    return recommendations;
  }

  async batchAssessment(imageUris: string[], cropType: string): Promise<BatchQualityResult> {
    const results = await Promise.all(
      imageUris.map(uri => this.assessQualityDemo(uri, cropType))
    );

    const averageScore = results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length;
    const overallGrade = this.mapScoreToGrade(averageScore);

    return {
      individualResults: results,
      batchSummary: {
        averageQuality: averageScore,
        overallGrade,
        consistencyScore: this.calculateConsistency(results),
        recommendations: this.generateBatchRecommendations(results)
      },
      totalImages: imageUris.length,
      processingTime: results.reduce((sum, r) => sum + parseFloat(r.processingTime.replace(/\D/g, '')), 0)
    };
  }

  private calculateConsistency(results: QualityAssessmentResult[]): number {
    const scores = results.map(r => r.qualityScore);
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);

    // Convert to consistency score (lower deviation = higher consistency)
    return Math.max(0, 100 - (standardDeviation * 2));
  }

  private generateBatchRecommendations(results: QualityAssessmentResult[]): string[] {
    const recommendations: string[] = [];
    const consistencyScore = this.calculateConsistency(results);

    if (consistencyScore > 85) {
      recommendations.push('Excellent batch consistency - maintain current practices');
    } else if (consistencyScore > 70) {
      recommendations.push('Good consistency - minor improvements in handling needed');
    } else {
      recommendations.push('Inconsistent quality detected - review harvesting and storage practices');
    }

    return recommendations;
  }
}
