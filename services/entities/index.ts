// Import all entity services
import { BlockchainTxReferencesService } from "./BlockchainTxReferencesService";
import { CertificationsService } from "./CertificationsService";
import { ColdChainLogsService } from "./ColdChainLogsService";
import { DisputesService } from "./DisputesService";
import { FarmTaskService } from "./FarmTaskService";
import { MessagesService } from "./MessagesService";
import { NegotiationsService } from "./NegotiationsService";
import { OrderItemsService } from "./OrderItemsService";
import { OrderService } from "./OrderService";
import { PaymentService } from "./PaymentService";
import { ProductListingService } from "./ProductListingService";
import { ProductService } from "./ProductService";
import { ProfileService } from "./ProfileService";
import { QualityReportsService } from "./QualityReportsService";
import { RetailerInventoryService } from "./RetailerInventoryService";
import { ReviewsService } from "./ReviewsService";
import { ShipmentsService } from "./ShipmentsService";

// Export all entity services
export { BlockchainTxReferencesService } from "./BlockchainTxReferencesService";
export { CertificationsService } from "./CertificationsService";
export { ColdChainLogsService } from "./ColdChainLogsService";
export { DisputesService } from "./DisputesService";
export { FarmTaskService } from "./FarmTaskService";
export { MessagesService } from "./MessagesService";
export { NegotiationsService } from "./NegotiationsService";
export { OrderItemsService } from "./OrderItemsService";
export { OrderService } from "./OrderService";
export { PaymentService } from "./PaymentService";
export { ProductListingService } from "./ProductListingService";
export { ProductService } from "./ProductService";
export { ProfileService } from "./ProfileService";
export { QualityReportsService } from "./QualityReportsService";
export { RetailerInventoryService } from "./RetailerInventoryService";
export { ReviewsService } from "./ReviewsService";
export { ShipmentsService } from "./ShipmentsService";

// Export service instances for easy use
export const profileService = new ProfileService();
export const productService = new ProductService();
export const productListingService = new ProductListingService();
export const orderService = new OrderService();
export const orderItemsService = new OrderItemsService();
export const paymentService = new PaymentService();
export const reviewsService = new ReviewsService();
export const farmTaskService = new FarmTaskService();
export const coldChainLogsService = new ColdChainLogsService();
export const blockchainTxReferencesService =
  new BlockchainTxReferencesService();
export const disputesService = new DisputesService();
export const certificationsService = new CertificationsService();
export const messagesService = new MessagesService();
export const negotiationsService = new NegotiationsService();
export const qualityReportsService = new QualityReportsService();
export const retailerInventoryService = new RetailerInventoryService();
export const shipmentsService = new ShipmentsService();
