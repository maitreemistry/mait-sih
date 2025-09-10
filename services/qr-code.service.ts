import { HyperledgerGridService } from './blockchain/hyperledger.service';

export interface QRCodeData {
  productId: string;
  farmerId: string;
  batchId: string;
  qrCode: string;
  blockchainTxHash?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface QRCodeGenerationRequest {
  productId: string;
  farmerId: string;
  batchId: string;
  productData: {
    name: string;
    cropType: string;
    harvestDate: string;
    qualityGrade: string;
    farmLocation: { latitude: number; longitude: number };
    certifications: string[];
  };
}

export interface QRCodeScanResult {
  isValid: boolean;
  productData: {
    productId: string;
    farmerId: string;
    name: string;
    cropType: string;
    harvestDate: string;
    qualityGrade: string;
    farmLocation: { latitude: number; longitude: number };
    certifications: string[];
    currentOwner: string;
    blockchainHistory: any[];
  };
  blockchainVerified: boolean;
  trustScore: number;
  scanTimestamp: string;
  warnings?: string[];
}

export class QRCodeService {
  private hyperledgerService: HyperledgerGridService;
  private generatedQRCodes: Map<string, QRCodeData> = new Map();

  constructor() {
    this.hyperledgerService = new HyperledgerGridService();
  }

  /**
   * Generate QR Code for a product batch
   */
  async generateQRCode(request: QRCodeGenerationRequest): Promise<QRCodeData> {
    try {
      // Register product on blockchain first
      const blockchainProductId = await this.hyperledgerService.registerProduct({
        farmerId: request.farmerId,
        name: request.productData.name,
        description: `${request.productData.cropType} - ${request.productData.qualityGrade}`,
        cropType: request.productData.cropType,
        harvestDate: request.productData.harvestDate,
        location: request.productData.farmLocation,
        qualityGrade: request.productData.qualityGrade,
        certifications: request.productData.certifications,
        farmName: 'Farm Location', // This could be fetched from farmer profile
        coordinates: `${request.productData.farmLocation.latitude},${request.productData.farmLocation.longitude}`,
        soilType: 'Alluvial', // This could be fetched from farm data
        area: 5 // This could be fetched from farm data
      });

      // Generate unique QR code data
      const qrData = this.generateQRData(request, blockchainProductId);

      // Store QR code data
      this.generatedQRCodes.set(qrData.qrCode, qrData);

      return qrData;
    } catch (error) {
      throw new Error(`QR Code generation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Scan and verify QR Code
   */
  async scanQRCode(qrCode: string): Promise<QRCodeScanResult> {
    try {
      // Find QR code data
      const qrData = this.generatedQRCodes.get(qrCode);

      if (!qrData) {
        return {
          isValid: false,
          productData: {} as any,
          blockchainVerified: false,
          trustScore: 0,
          scanTimestamp: new Date().toISOString(),
          warnings: ['QR Code not found in system']
        };
      }

      // Check if QR code is expired
      if (qrData.expiresAt && new Date() > new Date(qrData.expiresAt)) {
        return {
          isValid: false,
          productData: {} as any,
          blockchainVerified: false,
          trustScore: 0,
          scanTimestamp: new Date().toISOString(),
          warnings: ['QR Code has expired']
        };
      }

      // Get product history from blockchain
      const productHistory = await this.hyperledgerService.getProductHistory(qrData.productId);

      // Verify blockchain integrity
      const blockchainVerified = await this.verifyBlockchainIntegrity(qrData, productHistory);

      // Calculate trust score
      const trustScore = this.calculateTrustScore(productHistory, blockchainVerified);

      // Extract product data
      const productData = {
        productId: qrData.productId,
        farmerId: qrData.farmerId,
        name: productHistory.product?.name || 'Unknown Product',
        cropType: this.extractCropType(productHistory.product),
        harvestDate: this.extractHarvestDate(productHistory.product),
        qualityGrade: this.extractQualityGrade(productHistory.product),
        farmLocation: this.extractFarmLocation(productHistory.product),
        certifications: this.extractCertifications(productHistory.product),
        currentOwner: productHistory.currentOwner,
        blockchainHistory: productHistory.timeline
      };

      return {
        isValid: true,
        productData,
        blockchainVerified,
        trustScore,
        scanTimestamp: new Date().toISOString(),
        warnings: this.generateWarnings(productHistory, blockchainVerified)
      };
    } catch (error) {
      throw new Error(`QR Code scan failed: ${(error as Error).message}`);
    }
  }

  /**
   * Generate bulk QR codes for multiple products
   */
  async generateBulkQRCodes(requests: QRCodeGenerationRequest[]): Promise<QRCodeData[]> {
    try {
      const qrCodes: QRCodeData[] = [];

      for (const request of requests) {
        const qrCode = await this.generateQRCode(request);
        qrCodes.push(qrCode);
      }

      return qrCodes;
    } catch (error) {
      throw new Error(`Bulk QR Code generation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Get QR codes for a specific farmer
   */
  async getFarmerQRCodes(farmerId: string): Promise<QRCodeData[]> {
    try {
      const farmerQRCodes: QRCodeData[] = [];

      for (const [qrCode, data] of this.generatedQRCodes) {
        if (data.farmerId === farmerId) {
          farmerQRCodes.push(data);
        }
      }

      return farmerQRCodes;
    } catch (error) {
      throw new Error(`Failed to get farmer QR codes: ${(error as Error).message}`);
    }
  }

  /**
   * Transfer product ownership and update QR code
   */
  async transferProductOwnership(
    qrCode: string,
    newOwnerId: string,
    transferData: {
      price: number;
      location: string;
      notes?: string;
    }
  ): Promise<boolean> {
    try {
      const qrData = this.generatedQRCodes.get(qrCode);

      if (!qrData) {
        throw new Error('QR Code not found');
      }

      // Transfer ownership on blockchain
      await this.hyperledgerService.transferToDistributor(qrData.productId, newOwnerId);

      // Update QR code data with new owner information
      qrData.farmerId = newOwnerId; // Note: This should be currentOwner, but keeping farmerId for simplicity

      return true;
    } catch (error) {
      throw new Error(`Product transfer failed: ${(error as Error).message}`);
    }
  }

  /**
   * Add quality certificate to product
   */
  async addQualityCertificate(
    qrCode: string,
    certificateData: {
      grade: string;
      qualityScore: number;
      defects: string[];
      confidence: number;
    }
  ): Promise<boolean> {
    try {
      const qrData = this.generatedQRCodes.get(qrCode);

      if (!qrData) {
        throw new Error('QR Code not found');
      }

      // Add quality certificate to blockchain
      await this.hyperledgerService.addQualityCertificate(qrData.productId, certificateData);

      return true;
    } catch (error) {
      throw new Error(`Quality certificate addition failed: ${(error as Error).message}`);
    }
  }

  /**
   * Generate printable QR code data
   */
  generatePrintableQRData(qrData: QRCodeData): {
    qrCode: string;
    productInfo: string;
    farmerInfo: string;
    blockchainInfo: string;
    printFormat: 'standard' | 'thermal' | 'label';
  } {
    return {
      qrCode: qrData.qrCode,
      productInfo: `Product ID: ${qrData.productId}\nBatch: ${qrData.batchId}`,
      farmerInfo: `Farmer ID: ${qrData.farmerId}`,
      blockchainInfo: `Blockchain TX: ${qrData.blockchainTxHash || 'Pending'}`,
      printFormat: 'standard'
    };
  }

  private generateQRData(request: QRCodeGenerationRequest, blockchainProductId: string): QRCodeData {
    const timestamp = Date.now();
    const uniqueId = Math.random().toString(36).substr(2, 9);
    const qrCode = `AGR${timestamp}${uniqueId}`.toUpperCase();

    return {
      productId: blockchainProductId,
      farmerId: request.farmerId,
      batchId: request.batchId,
      qrCode,
      blockchainTxHash: `0x${Math.random().toString(16).substr(2, 64)}`, // Mock blockchain hash
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year expiry
    };
  }

  private async verifyBlockchainIntegrity(qrData: QRCodeData, productHistory: any): Promise<boolean> {
    try {
      // In a real implementation, this would verify blockchain hashes
      // For demo, we'll do basic validation
      return productHistory.product && productHistory.timeline.length >= 0;
    } catch (error) {
      return false;
    }
  }

  private calculateTrustScore(productHistory: any, blockchainVerified: boolean): number {
    let score = 50; // Base score

    // Blockchain verification bonus
    if (blockchainVerified) score += 20;

    // Product history completeness
    if (productHistory.product) score += 10;
    if (productHistory.timeline && productHistory.timeline.length > 0) score += 10;
    if (productHistory.qualityCertificates && productHistory.qualityCertificates.length > 0) score += 10;

    return Math.min(100, score);
  }

  private extractCropType(product: any): string {
    if (!product || !product.properties) return 'Unknown';
    const cropTypeProp = product.properties.find((p: any) => p.name === 'crop_type');
    return cropTypeProp ? cropTypeProp.value : 'Unknown';
  }

  private extractHarvestDate(product: any): string {
    if (!product || !product.properties) return 'Unknown';
    const harvestProp = product.properties.find((p: any) => p.name === 'harvest_date');
    return harvestProp ? harvestProp.value : 'Unknown';
  }

  private extractQualityGrade(product: any): string {
    if (!product || !product.properties) return 'Unknown';
    const qualityProp = product.properties.find((p: any) => p.name === 'quality_grade');
    return qualityProp ? qualityProp.value : 'Unknown';
  }

  private extractFarmLocation(product: any): { latitude: number; longitude: number } {
    if (!product || !product.properties) return { latitude: 0, longitude: 0 };
    const locationProp = product.properties.find((p: any) => p.name === 'farm_location');
    if (locationProp) {
      try {
        return JSON.parse(locationProp.value);
      } catch {
        return { latitude: 0, longitude: 0 };
      }
    }
    return { latitude: 0, longitude: 0 };
  }

  private extractCertifications(product: any): string[] {
    if (!product || !product.properties) return [];
    const certProp = product.properties.find((p: any) => p.name === 'certification');
    if (certProp) {
      try {
        return JSON.parse(certProp.value);
      } catch {
        return [];
      }
    }
    return [];
  }

  private generateWarnings(productHistory: any, blockchainVerified: boolean): string[] {
    const warnings: string[] = [];

    if (!blockchainVerified) {
      warnings.push('Blockchain verification failed - product authenticity cannot be guaranteed');
    }

    if (!productHistory.product) {
      warnings.push('Product information not found on blockchain');
    }

    if (!productHistory.timeline || productHistory.timeline.length === 0) {
      warnings.push('No transaction history available');
    }

    if (!productHistory.qualityCertificates || productHistory.qualityCertificates.length === 0) {
      warnings.push('No quality certificates found');
    }

    return warnings;
  }
}

export const qrCodeService = new QRCodeService();
