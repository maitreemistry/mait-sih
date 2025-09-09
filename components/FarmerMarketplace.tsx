import { useQuery } from "@/hooks/database/useQuery";
import { ProductListingService } from "@/services/entities";
import type { ProductListing } from "@/types/supabase";
import React from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

const productListingService = new ProductListingService();

interface ProductListingWithDetails extends ProductListing {
  products?: {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    image_url: string | null;
  };
  profiles?: {
    full_name: string | null;
    location_gln: string | null;
    is_verified: boolean;
  };
}

export default function FarmerMarketplace() {
  const {
    data: listings,
    loading,
    error,
    refetch,
  } = useQuery<ProductListingWithDetails[]>(() =>
    productListingService.getAvailableListings()
  );

  const renderListingItem = ({ item }: { item: ProductListingWithDetails }) => (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-soft border border-neutral-200">
      <View className="flex-row">
        {item.products?.image_url && (
          <Image
            source={{ uri: item.products.image_url }}
            className="w-20 h-20 rounded-lg mr-4"
            resizeMode="cover"
          />
        )}

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-lg font-semibold text-neutral-900">
              {item.products?.name}
            </Text>
            {item.profiles?.is_verified && (
              <View className="bg-success-100 px-2 py-1 rounded-full">
                <Text className="text-success-700 text-xs font-medium">
                  ✓ Verified
                </Text>
              </View>
            )}
          </View>

          <Text className="text-sm text-neutral-600 mb-2">
            by {item.profiles?.full_name || "Anonymous Farmer"}
          </Text>

          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xl font-bold text-primary-600">
                ₹{item.price_per_unit}
              </Text>
              <Text className="text-xs text-neutral-500">
                per {item.unit_of_measure}
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-sm font-medium text-neutral-700">
                {item.quantity_available} {item.unit_of_measure}
              </Text>
              <Text className="text-xs text-neutral-500">available</Text>
            </View>
          </View>

          {item.harvest_date && (
            <Text className="text-xs text-neutral-500 mt-2">
              Harvested: {new Date(item.harvest_date).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>

      <View className="flex-row mt-4 space-x-3">
        <TouchableOpacity className="flex-1 bg-primary-500 py-3 rounded-lg active:bg-primary-600">
          <Text className="text-white font-semibold text-center">
            View Details
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 bg-neutral-100 py-3 rounded-lg active:bg-neutral-200">
          <Text className="text-neutral-700 font-semibold text-center">
            Make Offer
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-neutral-50">
        <View className="bg-white p-8 rounded-xl shadow-soft">
          <Text className="text-lg font-medium text-neutral-700 text-center">
            Loading fresh produce... 🌱
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-neutral-50 px-6">
        <View className="bg-white p-8 rounded-xl shadow-soft">
          <Text className="text-lg font-semibold text-error-600 text-center mb-2">
            Unable to load listings
          </Text>
          <Text className="text-neutral-600 text-center mb-4">
            {error.message}
          </Text>
          <TouchableOpacity
            className="bg-primary-500 py-3 px-6 rounded-lg active:bg-primary-600"
            onPress={refetch}
          >
            <Text className="text-white font-semibold text-center">
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <View className="bg-white pt-12 pb-6 px-6 shadow-sm">
        <Text className="text-2xl font-bold text-neutral-900 mb-2">
          Fresh From Farm 🚜
        </Text>
        <Text className="text-neutral-600">
          Discover quality produce directly from verified farmers
        </Text>
      </View>

      <FlatList
        data={listings}
        renderItem={renderListingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={refetch}
        ListEmptyComponent={
          <View className="bg-white rounded-xl p-8 items-center">
            <Text className="text-lg font-medium text-neutral-700 text-center mb-2">
              No listings available
            </Text>
            <Text className="text-neutral-500 text-center">
              Check back later for fresh produce!
            </Text>
          </View>
        }
      />
    </View>
  );
}
