"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HyperledgerGridService = void 0;
class HyperledgerGridService {
    constructor() {
        // Initialize Grid client - mock for demo
        this.gridClient = {
            products: {
                create: async (data) => ({ id: this.generateProductId(), ...data }),
                get: async (id) => ({ id, name: 'Sample Product' }),
                updateOwner: async (data) => data,
            },
            locations: {
                create: async (data) => data,
            },
            events: {
                record: async (data) => data,
                getByProduct: async (id) => [],
            },
            certificates: {
                create: async (data) => data,
                getByProduct: async (id) => [],
            },
        };
    }
    generateProductId() {
        return `PROD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    async registerProduct(productData) {
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
        }
        catch (error) {
            throw new Error(`Product registration failed: ${error.message}`);
        }
    }
    async transferToDistributor(productId, distributorId) {
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
    async addQualityCertificate(productId, qualityData) {
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
    async getProductHistory(productId) {
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
    async getProductsByFarmer(farmerId) {
        // Mock implementation for demo
        return [
            { id: '1', name: 'Organic Rice', price: 3200, status: 'listed' },
            { id: '2', name: 'Wheat', price: 2800, status: 'sold' },
            { id: '3', name: 'Maize', price: 2100, status: 'listed' },
        ];
    }
    determineProductStatus(events) {
        if (events.length === 0)
            return 'registered';
        const lastEvent = events[events.length - 1];
        return lastEvent.eventType === 'OWNERSHIP_TRANSFER' ? 'transferred' : 'active';
    }
}
exports.HyperledgerGridService = HyperledgerGridService;
