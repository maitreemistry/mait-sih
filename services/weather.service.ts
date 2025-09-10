interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  visibility: number;
  uvIndex: number;
  condition: string;
  icon: string;
}

interface WeatherForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  rainfall: number;
  condition: string;
  icon: string;
  humidity: number;
}

interface CropAdvisory {
  cropType: string;
  advisory: string;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  optimalActions: string[];
}

interface WeatherAlert {
  id: string;
  type: 'rain' | 'drought' | 'storm' | 'frost' | 'heatwave';
  severity: 'low' | 'medium' | 'high' | 'extreme';
  title: string;
  description: string;
  affectedAreas: string[];
  startTime: string;
  endTime: string;
  recommendations: string[];
}

export class WeatherService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // Using OpenWeatherMap API - replace with actual API key
    this.apiKey = process.env.EXPO_PUBLIC_WEATHER_API_KEY || 'demo_key';
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
      // Mock data for demo - replace with actual API call
      const mockWeather: WeatherData = {
        temperature: 28.5,
        humidity: 65,
        rainfall: 0,
        windSpeed: 12,
        windDirection: 'NE',
        pressure: 1013,
        visibility: 10,
        uvIndex: 7,
        condition: 'Partly Cloudy',
        icon: '02d'
      };

      return mockWeather;
    } catch (error) {
      throw new Error(`Weather data fetch failed: ${(error as Error).message}`);
    }
  }

  async getWeatherForecast(lat: number, lon: number, days: number = 7): Promise<WeatherForecast[]> {
    try {
      // Mock forecast data
      const mockForecast: WeatherForecast[] = [
        {
          date: new Date().toISOString().split('T')[0],
          maxTemp: 32,
          minTemp: 24,
          rainfall: 0,
          condition: 'Sunny',
          icon: '01d',
          humidity: 60
        },
        {
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          maxTemp: 31,
          minTemp: 23,
          rainfall: 2.5,
          condition: 'Light Rain',
          icon: '10d',
          humidity: 75
        }
      ];

      return mockForecast.slice(0, days);
    } catch (error) {
      throw new Error(`Forecast data fetch failed: ${(error as Error).message}`);
    }
  }

  async getCropAdvisory(cropType: string, weatherData: WeatherData): Promise<CropAdvisory> {
    try {
      // AI-powered crop advisory based on weather conditions
      const advisory: CropAdvisory = {
        cropType,
        advisory: this.generateAdvisoryText(cropType, weatherData),
        riskLevel: this.calculateRiskLevel(weatherData),
        recommendations: this.generateRecommendations(cropType, weatherData),
        optimalActions: this.generateOptimalActions(cropType, weatherData)
      };

      return advisory;
    } catch (error) {
      throw new Error(`Crop advisory generation failed: ${(error as Error).message}`);
    }
  }

  async getWeatherAlerts(district: string): Promise<WeatherAlert[]> {
    try {
      // Mock weather alerts for Odisha districts
      const mockAlerts: WeatherAlert[] = [
        {
          id: 'alert_001',
          type: 'rain',
          severity: 'medium',
          title: 'Heavy Rainfall Expected',
          description: 'Heavy rainfall expected in the next 24 hours',
          affectedAreas: ['Cuttack', 'Bhubaneswar', 'Puri'],
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 86400000).toISOString(),
          recommendations: [
            'Secure loose farm equipment',
            'Ensure proper drainage in fields',
            'Monitor crops for waterlogging'
          ]
        }
      ];

      return mockAlerts.filter(alert => alert.affectedAreas.includes(district));
    } catch (error) {
      throw new Error(`Weather alerts fetch failed: ${(error as Error).message}`);
    }
  }

  async getOptimalIrrigationSchedule(cropType: string, weatherData: WeatherData): Promise<{
    shouldIrrigate: boolean;
    recommendedAmount: number;
    timing: string;
    reason: string;
  }> {
    try {
      const schedule = {
        shouldIrrigate: weatherData.temperature > 30 || weatherData.humidity < 50,
        recommendedAmount: this.calculateIrrigationAmount(cropType, weatherData),
        timing: weatherData.temperature > 30 ? 'Early morning or evening' : 'Morning',
        reason: this.generateIrrigationReason(cropType, weatherData)
      };

      return schedule;
    } catch (error) {
      throw new Error(`Irrigation schedule calculation failed: ${(error as Error).message}`);
    }
  }

  async getHarvestTimingRecommendation(cropType: string, weatherData: WeatherData): Promise<{
    optimalHarvestTime: string;
    weatherSuitability: number;
    riskFactors: string[];
    recommendations: string[];
  }> {
    try {
      const recommendation = {
        optimalHarvestTime: this.calculateOptimalHarvestTime(cropType, weatherData),
        weatherSuitability: this.calculateWeatherSuitability(weatherData),
        riskFactors: this.identifyRiskFactors(weatherData),
        recommendations: this.generateHarvestRecommendations(cropType, weatherData)
      };

      return recommendation;
    } catch (error) {
      throw new Error(`Harvest timing recommendation failed: ${(error as Error).message}`);
    }
  }

  private generateAdvisoryText(cropType: string, weather: WeatherData): string {
    if (weather.temperature > 35) {
      return `High temperature (${weather.temperature}°C) detected. ${cropType} crops may experience heat stress.`;
    } else if (weather.rainfall > 50) {
      return `Heavy rainfall (${weather.rainfall}mm) expected. Ensure proper drainage to prevent waterlogging in ${cropType} fields.`;
    } else if (weather.humidity > 80) {
      return `High humidity (${weather.humidity}%) conditions favorable for fungal diseases in ${cropType}.`;
    }
    return `Weather conditions are favorable for ${cropType} cultivation.`;
  }

  private calculateRiskLevel(weather: WeatherData): 'low' | 'medium' | 'high' {
    if (weather.temperature > 40 || weather.rainfall > 100) return 'high';
    if (weather.temperature > 35 || weather.rainfall > 50) return 'medium';
    return 'low';
  }

  private generateRecommendations(cropType: string, weather: WeatherData): string[] {
    const recommendations: string[] = [];

    if (weather.temperature > 35) {
      recommendations.push('Provide shade or mulch to protect roots');
      recommendations.push('Increase irrigation frequency');
    }

    if (weather.humidity > 80) {
      recommendations.push('Apply preventive fungicide');
      recommendations.push('Improve air circulation between plants');
    }

    if (weather.rainfall > 50) {
      recommendations.push('Apply nitrogen fertilizer after rain stops');
      recommendations.push('Monitor for pest outbreaks');
    }

    return recommendations;
  }

  private generateOptimalActions(cropType: string, weather: WeatherData): string[] {
    const actions: string[] = [];

    if (weather.temperature < 25) {
      actions.push('Delay planting by 1-2 weeks');
    } else if (weather.temperature > 30) {
      actions.push('Plant shade-tolerant varieties');
      actions.push('Schedule irrigation during cooler hours');
    }

    if (weather.rainfall < 20) {
      actions.push('Implement drip irrigation system');
    }

    return actions;
  }

  private calculateIrrigationAmount(cropType: string, weather: WeatherData): number {
    const baseAmount = cropType === 'rice' ? 25 : 15; // mm per day
    const tempMultiplier = weather.temperature > 30 ? 1.5 : 1.0;
    const humidityMultiplier = weather.humidity < 50 ? 1.3 : 1.0;

    return Math.round(baseAmount * tempMultiplier * humidityMultiplier);
  }

  private generateIrrigationReason(cropType: string, weather: WeatherData): string {
    if (weather.temperature > 30) {
      return 'High temperature increases water evaporation from soil';
    } else if (weather.humidity < 50) {
      return 'Low humidity causes faster soil moisture depletion';
    }
    return 'Regular irrigation needed to maintain optimal soil moisture';
  }

  private calculateOptimalHarvestTime(cropType: string, weather: WeatherData): string {
    if (weather.humidity > 80) {
      return 'Harvest during midday when humidity is lower to reduce fungal growth';
    } else if (weather.temperature > 30) {
      return 'Harvest early morning or evening to minimize heat stress';
    }
    return 'Harvest during normal working hours';
  }

  private calculateWeatherSuitability(weather: WeatherData): number {
    let suitability = 100;

    if (weather.temperature > 35) suitability -= 30;
    if (weather.humidity > 85) suitability -= 20;
    if (weather.rainfall > 20) suitability -= 15;

    return Math.max(0, suitability);
  }

  private identifyRiskFactors(weather: WeatherData): string[] {
    const risks: string[] = [];

    if (weather.temperature > 35) risks.push('Heat stress damage');
    if (weather.humidity > 80) risks.push('Fungal disease outbreak');
    if (weather.rainfall > 50) risks.push('Waterlogging and root rot');
    if (weather.windSpeed > 20) risks.push('Physical damage to crops');

    return risks;
  }

  private generateHarvestRecommendations(cropType: string, weather: WeatherData): string[] {
    const recommendations: string[] = [];

    if (weather.condition.includes('rain')) {
      recommendations.push('Harvest before rainfall to prevent quality degradation');
    }

    if (weather.temperature > 30) {
      recommendations.push('Use mechanical harvesters to reduce labor heat stress');
    }

    recommendations.push('Store harvested produce in shaded, well-ventilated area');
    recommendations.push('Sort and grade immediately after harvest');

    return recommendations;
  }
}
