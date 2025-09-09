// Supabase client
export { supabase } from "./supabase/client";

// Types
export type {
  BlockchainTxReference,
  Certification,
  ColdChainLog,
  Database,
  Dispute,
  DisputeStatus,
  FarmTask,
  Message,
  Negotiation,
  NegotiationStatus,
  Order,
  OrderItem,
  OrderStatus,
  Payment,
  PaymentStatus,
  Product,
  ProductListing,
  ProductListingStatus,
  Profile,
  QualityReport,
  RetailerInventory,
  Review,
  Shipment,
  ShipmentStatus,
  TaskStatus,
  UserRole,
} from "../types/supabase";

// Services
export { AuthService } from "../services/auth";
export { BaseService } from "../services/database";
export {
  FarmTaskService,
  NegotiationService,
  OrderService,
  ProductListingService,
  ProductService,
  ProfileService,
  ReviewService,
} from "../services/entities";

// Contexts
export { AuthProvider, useAuth } from "../contexts/AuthContext";

// Hooks
export {
  useMutation,
  usePaginatedQuery,
  useQuery,
} from "../hooks/database/useQuery";

// Utils
export {
  formatAuthError,
  formatDatabaseError,
  logError,
} from "../utils/errors";
