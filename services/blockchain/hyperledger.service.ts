interface FarmerProductData {
  farmerId: string;
  name: string;
  description: string;
  cropType: string;
  harvestDate: string;
  location: { latitude: number; longitude: number };
  qualityGrade: string;
  certifications: string[];
  farmName: string;
  coordinates: string;
  soilType: string;
  area: number;
}

interface ProductHistory {
  product: any;
  timeline: any[];
  qualityCertificates: any[];
  currentOwner: string;
  status: string;
}

export class HyperledgerGridService {
  private gridClient: any;

  constructor() {
    // Initialize Grid client - mock for demo
    this.gridClient = {
      products: {
        create: async (data: any) => ({ id: this.generateProductId(), ...data }),
        get: async (id: string) => ({ id, name: 'Sample Product' }),
        updateOwner: async (data: any) => data,
      },
      locations: {
        create: async (data: any) => data,
      },
      events: {
        record: async (data: any) => data,
        getByProduct: async (id: string) => [],
      },
      certificates: {
        create: async (data: any) => data,
        getByProduct: async (id: string) => [],
      },
    };
  }

  private generateProductId(): string {
    return `PROD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async registerProduct(productData: FarmerProductData): Promise<string> {
    try {
      const product = await this.gridClient.products.create({
        id: this.generateProductId(),
        name: productData.name,
        description: productData.description,
        owner: productData.farmerId,
        properties: [
          { name: 'crop_type', value: productData.cropType },
          { name: 'harvest_date', value: productData.harvestDate },
          { name: 'farm_location', value: JSON.stringify(productData.location) },
          { name: 'quality_grade', value: productData.qualityGrade },
          { name: 'certification', value: JSON.stringify(productData.certifications) }
        ]
      });

      await this.gridClient.locations.create({
        id: `FARM_${productData.farmerId}`,
        name: productData.farmName,
        properties: [
          { name: 'gps_coordinates', value: productData.coordinates },
          { name: 'soil_type', value: productData.soilType },
          { name: 'area_hectares', value: productData.area.toString() }
        ]
      });

      return product.id;
    } catch (error: any) {
      throw new Error(`Product registration failed: ${error.message}`);
    }
  }

  async transferToDistributor(productId: string, distributorId: string): Promise<void> {
    await this.gridClient.products.updateOwner({
      productId,
      newOwner: distributorId,
      timestamp: new Date().toISOString()
    });

    await this.gridClient.events.record({
      productId,
      eventType: 'OWNERSHIP_TRANSFER',
      location: 'Farm Gate',
      timestamp: new Date().toISOString(),
      details: { from: 'farmer', to: 'distributor' }
    });
  }

  async addQualityCertificate(productId: string, qualityData: any): Promise<void> {
    await this.gridClient.certificates.create({
      id: `QUAL_${productId}_${Date.now()}`,
      productId,
      certifyingBody: 'AI_QUALITY_SYSTEM',
      certificationType: 'QUALITY_GRADE',
      grade: qualityData.grade,
      score: qualityData.qualityScore,
      defects: qualityData.defects,
      confidence: qualityData.confidence,
      timestamp: new Date().toISOString()
    });
  }

  async getProductHistory(productId: string): Promise<ProductHistory> {
    const [product, events, certificates] = await Promise.all([
      this.gridClient.products.get(productId),
      this.gridClient.events.getByProduct(productId),
      this.gridClient.certificates.getByProduct(productId)
    ]);

    return {
      product,
      timeline: events,
      qualityCertificates: certificates,
      currentOwner: product.owner,
      status: this.determineProductStatus(events)
    };
  }

  async getProductsByFarmer(farmerId: string): Promise<any[]> {
    // Mock implementation for demo
    return [
      { id: '1', name: 'Organic Rice', price: 3200, status: 'listed' },
      { id: '2', name: 'Wheat', price: 2800, status: 'sold' },
      { id: '3', name: 'Maize', price: 2100, status: 'listed' },
    ];
  }

  private determineProductStatus(events: any[]): string {
    if (events.length === 0) return 'registered';
    const lastEvent = events[events.length - 1];
    return lastEvent.eventType === 'OWNERSHIP_TRANSFER' ? 'transferred' : 'active';
  }
}
