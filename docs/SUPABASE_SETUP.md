# Krishi Sakhi Farmer - Complete Setup Guide

This project implements a comprehensive agricultural marketplace platform with Supabase backend and modern React Native/Expo frontend using Tailwind CSS.

## 🗂️ Project Structure

```
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Supabase client configuration
│   │   └── config.ts          # Additional Supabase settings
│   └── index.ts               # Main exports for easy imports
├── types/
│   ├── supabase.ts           # Complete database type definitions
│   └── nativewind.d.ts       # NativeWind type declarations
├── services/
│   ├── auth.ts               # Authentication service
│   ├── database.ts           # Base database service
│   └── entities.ts           # Specific entity services
├── contexts/
│   └── AuthContext.tsx       # Authentication context provider
├── hooks/
│   └── database/
│       └── useQuery.ts       # Custom hooks for database operations
├── utils/
│   └── errors.ts             # Error formatting utilities
├── components/
│   ├── AuthScreen.tsx        # Authentication component
│   ├── FarmerMarketplace.tsx # Marketplace listing component
│   └── FarmTaskManager.tsx   # Task management component
├── global.css               # Tailwind CSS imports
├── tailwind.config.js       # Tailwind configuration
├── babel.config.js          # Babel configuration for NativeWind
└── .env.example             # Environment variables template
```

## �️ Database Schema

Your database includes the following key tables with comprehensive ENUM types:

### ENUM Types

- `user_role`: farmer, distributor, retailer
- `product_listing_status`: available, sold_out, delisted
- `order_status`: pending, confirmed, shipped, delivered, cancelled
- `shipment_status`: in_transit, delivered, delayed
- `payment_status`: succeeded, pending, failed
- `negotiation_status`: pending, accepted, rejected, countered
- `dispute_status`: open, under_review, resolved, closed
- `task_status`: pending, in_progress, completed

### Core Tables

- **profiles**: User profiles linked to Supabase Auth
- **products**: Master product catalog with GTIN support
- **product_listings**: Items for sale by farmers
- **orders & order_items**: Marketplace transactions
- **payments**: Payment tracking with Stripe integration
- **reviews**: Product/seller review system
- **certifications**: Organic/quality certifications with IPFS storage
- **quality_reports**: AI-powered quality assessments
- **messages**: Communication system
- **shipments**: Logistics tracking
- **retailer_inventory**: Inventory management
- **cold_chain_logs**: Temperature monitoring
- **negotiations**: Price negotiation system
- **disputes**: Dispute resolution system
- **farm_tasks**: Task management for farmers
- **blockchain_tx_references**: Blockchain transaction links

## 🚀 Getting Started

### 1. Install Dependencies

All required packages are already installed:

- `@supabase/supabase-js` - Supabase JavaScript client
- `react-native-url-polyfill` - URL polyfill for React Native
- `@react-native-async-storage/async-storage` - Session persistence
- `nativewind` - Tailwind CSS for React Native
- `tailwindcss` - Tailwind CSS core

### 2. Environment Setup

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials in `.env`:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. Database Setup

Run the provided SQL schema in your Supabase SQL editor to create all tables, indexes, and triggers.

### 4. Configure Row Level Security (RLS)

Enable RLS on all tables and create appropriate policies. Example policies:

```sql
-- Profiles: Users can read all but only update their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Product listings: Public read, farmers can manage their own
ALTER TABLE product_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product listings are viewable by everyone" ON product_listings
  FOR SELECT USING (true);

CREATE POLICY "Farmers can manage their listings" ON product_listings
  FOR ALL USING (auth.uid() = farmer_id);
```

## 🎨 Styling with Tailwind CSS

The project uses NativeWind for Tailwind CSS integration. Custom color palette includes:

- **Primary**: Green tones for agricultural theme
- **Secondary**: Purple accents
- **Neutral**: Grayscale
- **Success/Warning/Error**: Semantic colors

Example usage:

```tsx
<View className="bg-primary-50 p-4 rounded-xl shadow-soft">
  <Text className="text-primary-900 font-bold text-lg">
    Fresh Produce Available
  </Text>
</View>
```

## 📚 Usage Examples

### Authentication

```tsx
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, signIn, signUp, signOut, loading } = useAuth();

  const handleSignIn = async () => {
    const { error } = await signIn(email, password);
    if (error) {
      console.error("Sign in error:", error);
    }
  };

  return (
    <View className="flex-1 bg-neutral-50 p-6">
      {user ? (
        <Text className="text-xl font-bold">Welcome, {user.email}!</Text>
      ) : (
        <TouchableOpacity
          className="bg-primary-500 py-3 px-6 rounded-lg"
          onPress={handleSignIn}
        >
          <Text className="text-white font-semibold text-center">Sign In</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
```

### Database Operations with Entity Services

```tsx
import { ProductListingService } from "@/services/entities";
import { useQuery, useMutation } from "@/hooks/database/useQuery";

const productListingService = new ProductListingService();

function FarmerDashboard() {
  const {
    data: listings,
    loading,
    refetch,
  } = useQuery(() => productListingService.getByFarmer(farmerId));

  const { mutate: createListing } = useMutation((listingData) =>
    productListingService.create(listingData)
  );

  const handleCreateListing = async () => {
    await createListing({
      farmer_id: farmerId,
      product_id: productId,
      quantity_available: 100,
      unit_of_measure: "kg",
      price_per_unit: 50,
    });
    refetch();
  };

  return (
    <View className="flex-1 bg-neutral-50">
      <FlatList
        data={listings}
        renderItem={({ item }) => (
          <View className="bg-white m-2 p-4 rounded-xl shadow-soft">
            <Text className="font-bold text-lg">{item.products?.name}</Text>
            <Text className="text-primary-600 text-xl">
              ₹{item.price_per_unit}/{item.unit_of_measure}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
```

### Task Management

```tsx
import { FarmTaskService } from "@/services/entities";

const farmTaskService = new FarmTaskService();

function TaskManager() {
  const { data: tasks } = useQuery(() => farmTaskService.getByFarmer(farmerId));

  const { mutate: updateTaskStatus } = useMutation(({ id, status }) =>
    farmTaskService.updateStatus(id, status)
  );

  return (
    <View className="flex-1 bg-neutral-50 p-4">
      {tasks?.map((task) => (
        <View key={task.id} className="bg-white p-4 mb-3 rounded-lg">
          <Text className="font-semibold text-lg">{task.title}</Text>
          <TouchableOpacity
            className="bg-success-500 mt-2 py-2 px-4 rounded"
            onPress={() =>
              updateTaskStatus({
                id: task.id,
                status: "completed",
              })
            }
          >
            <Text className="text-white text-center">Mark Complete</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}
```

## �️ Available Services

### Core Services

- **AuthService**: Authentication operations
- **ProfileService**: User profile management
- **ProductService**: Product catalog management
- **ProductListingService**: Marketplace listings
- **OrderService**: Order management
- **FarmTaskService**: Task management
- **NegotiationService**: Price negotiations
- **ReviewService**: Review system

### Custom Hooks

- **useQuery**: Data fetching with loading states
- **useMutation**: Data modifications
- **usePaginatedQuery**: Paginated data with load more

### Utility Functions

- **formatAuthError**: User-friendly auth error messages
- **formatDatabaseError**: Database error formatting
- **logError**: Development error logging

## 🔒 Security Features

1. **Row Level Security**: All tables protected with RLS policies
2. **Type Safety**: Full TypeScript coverage
3. **Input Validation**: Client-side validation for all forms
4. **Error Handling**: Comprehensive error management
5. **Session Management**: Secure session persistence

## 📱 Mobile-First Design

- **NativeWind**: Tailwind CSS for React Native
- **Responsive Components**: Mobile-optimized layouts
- **Touch Interactions**: Proper touch targets and feedback
- **Performance**: Optimized FlatLists and lazy loading

## 🚀 Production Readiness

### Environment Configuration

- Separate configs for development/production
- Environment-based feature flags
- Secure credential management

### Monitoring & Analytics

- Error tracking with development logs
- Performance monitoring hooks
- User analytics integration points

### Deployment

- Expo EAS Build configuration
- Environment variable management
- Store deployment readiness

## 📖 Next Steps

1. **Set up your Supabase project** with the provided schema
2. **Configure authentication** providers (email, Google, etc.)
3. **Implement RLS policies** for your security requirements
4. **Customize the UI** with your brand colors and components
5. **Add business logic** specific to your use case
6. **Set up push notifications** for order updates
7. **Integrate payment processing** with Stripe
8. **Add real-time features** with Supabase subscriptions

## 🤝 Development Workflow

1. **Database Changes**: Update schema → regenerate types → update services
2. **New Features**: Create service → add hooks → build UI → test
3. **Styling**: Use Tailwind classes → maintain design system consistency
4. **Testing**: Test auth flows → validate data operations → check UI states

---

Your Krishi Sakhi platform is now ready for development with a complete, scalable, and secure foundation! 🌱🚀
