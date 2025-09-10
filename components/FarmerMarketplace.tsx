import { productListingService } from "@/services/entities";
import type { ProductListing } from "@/types/supabase";
import React, { useEffect, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

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
  const [listings, setListings] = useState<ProductListingWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productListingService.getAvailable();
      if (response.error) {
        setError(response.error.message);
        return;
      }
      setListings(response.data || []);
    } catch {
      setError("Failed to fetch listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const renderListingItem = ({ item }: { item: ProductListingWithDetails }) => (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-lg border-2 border-green-200">
      <View className="flex-row">
        {item.products?.image_url && (
          <Image
            source={{ uri: item.products.image_url }}
            className="w-20 h-20 rounded-xl mr-4"
            resizeMode="cover"
          />
        )}

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-lg font-semibold text-green-900">
              {item.products?.name}
            </Text>
            {item.profiles?.is_verified && (
              <View className="bg-green-100 px-2 py-1 rounded-full">
                <Text className="text-green-700 text-xs font-medium">
                  ✓ Verified
                </Text>
              </View>
            )}
          </View>

          <Text className="text-sm text-green-600 mb-2">
            by {item.profiles?.full_name || "Anonymous Farmer"}
          </Text>

          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xl font-bold text-green-600">
                ₹{item.price_per_unit}
              </Text>
              <Text className="text-xs text-green-500">
                per {item.unit_of_measure}
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-sm font-medium text-green-700">
                {item.quantity_available} {item.unit_of_measure}
              </Text>
              <Text className="text-xs text-green-500">available</Text>
            </View>
          </View>

          {item.harvest_date && (
            <Text className="text-xs text-green-500 mt-2">
              Harvested: {new Date(item.harvest_date).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>

      <View className="flex-row mt-4 space-x-3">
        <TouchableOpacity className="flex-1 bg-green-500 py-3 rounded-xl active:bg-green-600 shadow-md">
          <Text className="text-white font-semibold text-center">
            View Details
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 bg-green-100 py-3 rounded-xl active:bg-green-200">
          <Text className="text-green-700 font-semibold text-center">
            Make Offer
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-green-50">
        <View className="bg-white p-8 rounded-2xl shadow-lg border border-green-200">
          <Text className="text-lg font-medium text-green-700 text-center">
            Loading fresh produce... 🌱
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-green-50 px-6">
        <View className="bg-white p-8 rounded-2xl shadow-lg border border-green-200">
          <Text className="text-lg font-semibold text-red-600 text-center mb-2">
            Unable to load listings
          </Text>
          <Text className="text-green-700 text-center mb-4">{error}</Text>
          <TouchableOpacity
            className="bg-green-500 py-3 px-6 rounded-xl active:bg-green-600 shadow-md"
            onPress={fetchListings}
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
    <View className="flex-1 bg-green-50">
      <View className="bg-green-700 pt-12 pb-6 px-6 shadow-lg">
        <Text className="text-2xl font-bold text-white mb-2">
          Fresh From Farm 🚜
        </Text>
        <Text className="text-green-200">
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
        onRefresh={fetchListings}
        ListEmptyComponent={
          <View className="bg-white rounded-2xl p-8 items-center border border-green-200">
            <Text className="text-lg font-medium text-green-700 text-center mb-2">
              No listings available
            </Text>
            <Text className="text-green-500 text-center">
              Check back later for fresh produce!
            </Text>
          </View>
        }
      />
    </View>
  );
}
