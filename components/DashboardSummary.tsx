import { useAuth } from "@/contexts/AuthContext";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function DashboardSummary() {
  const { user, signOut } = useAuth();

  const featureCards = [
    {
      title: "🌱 Product Listings",
      description: "Manage your farm produce listings with AI quality reports",
      colors: "bg-green-50 border-green-200",
      textColor: "text-green-800",
    },
    {
      title: "📋 Farm Tasks",
      description: "Track and manage your daily farming activities",
      colors: "bg-yellow-50 border-yellow-200",
      textColor: "text-yellow-800",
    },
    {
      title: "🛒 Marketplace",
      description: "Browse and purchase fresh produce from verified farmers",
      colors: "bg-green-100 border-green-300",
      textColor: "text-green-900",
    },
    {
      title: "💬 Communication",
      description: "Real-time messaging with buyers and sellers",
      colors: "bg-blue-50 border-blue-200",
      textColor: "text-blue-800",
    },
    {
      title: "🔒 Blockchain Integration",
      description: "Transparent and secure transaction tracking",
      colors: "bg-gray-50 border-gray-200",
      textColor: "text-gray-800",
    },
    {
      title: "📊 Analytics",
      description: "Monitor your sales, reviews, and performance metrics",
      colors: "bg-red-50 border-red-200",
      textColor: "text-red-800",
    },
  ];

  return (
    <ScrollView className="flex-1 bg-green-50">
      {/* Header */}
      <View className="bg-green-700 pt-16 pb-8 px-6">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-2xl font-bold mb-1">
              Krishi Sakhi Platform
            </Text>
            <Text className="text-green-200 text-base">
              Agricultural Marketplace & Farm Management
            </Text>
          </View>

          <TouchableOpacity
            className="bg-white/20 p-2 rounded-full"
            onPress={signOut}
          >
            <Text className="text-white text-sm">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* User Info */}
      {user && (
        <View className="bg-white mx-4 -mt-4 p-6 rounded-xl shadow-lg border border-green-200">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-semibold text-green-900 mb-1">
                Welcome back! 👋
              </Text>
              <Text className="text-green-700">{user.email}</Text>
            </View>

            {/* Role badge - simulated for demo */}
            <View className="bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-green-700 text-sm font-medium">
                🌾 Farmer
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Platform Features */}
      <View className="p-6">
        <Text className="text-xl font-bold text-green-900 mb-4">
          Platform Features
        </Text>

        <View className="space-y-4">
          {featureCards.map((feature, index) => (
            <TouchableOpacity
              key={index}
              className={`${feature.colors} border rounded-xl p-6 active:opacity-80 shadow-sm`}
            >
              <Text
                className={`text-lg font-semibold mb-2 ${feature.textColor}`}
              >
                {feature.title}
              </Text>
              <Text className="text-green-700 leading-5">
                {feature.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Technology Stack */}
      <View className="p-6">
        <Text className="text-xl font-bold text-green-900 mb-4">
          Technology Stack
        </Text>

        <View className="bg-white rounded-xl p-6 shadow-lg border border-green-200">
          <View className="space-y-3">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">⚛️</Text>
              <View>
                <Text className="font-semibold text-green-900">
                  React Native + Expo
                </Text>
                <Text className="text-sm text-green-700">
                  Cross-platform mobile development
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">🗄️</Text>
              <View>
                <Text className="font-semibold text-green-900">Supabase</Text>
                <Text className="text-sm text-green-700">
                  PostgreSQL database with real-time features
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">🎨</Text>
              <View>
                <Text className="font-semibold text-green-900">
                  Tailwind CSS (NativeWind)
                </Text>
                <Text className="text-sm text-green-700">
                  Utility-first styling framework
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">🔐</Text>
              <View>
                <Text className="font-semibold text-green-900">
                  TypeScript
                </Text>
                <Text className="text-sm text-green-700">
                  Type-safe development experience
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">🔗</Text>
              <View>
                <Text className="font-semibold text-green-900">
                  Blockchain Integration
                </Text>
                <Text className="text-sm text-green-700">
                  Transparent transaction tracking
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Database Schema Info */}
      <View className="p-6">
        <Text className="text-xl font-bold text-green-900 mb-4">
          Database Schema
        </Text>

        <View className="bg-white rounded-xl p-6 shadow-lg border border-green-200">
          <Text className="text-green-700 mb-4">
            Complete agricultural marketplace schema with:
          </Text>

          <View className="space-y-2">
            {[
              "👥 User profiles with role-based access",
              "🥕 Product catalog with GTIN support",
              "📦 Product listings with quality reports",
              "🛒 Order management system",
              "💳 Payment processing integration",
              "⭐ Review and rating system",
              "📜 Certification tracking with IPFS",
              "💬 Real-time messaging system",
              "🚚 Shipment and logistics tracking",
              "🌡️ Cold chain monitoring",
              "🤝 Negotiation system",
              "⚖️ Dispute resolution",
              "📋 Farm task management",
            ].map((item, index) => (
              <Text key={index} className="text-sm text-green-700">
                {item}
              </Text>
            ))}
          </View>
        </View>
      </View>

      {/* Footer */}
      <View className="p-6 pb-12">
        <View className="bg-green-700 rounded-xl p-6 items-center">
          <Text className="text-white text-lg font-semibold mb-2">
            Ready to Start Building? 🚀
          </Text>
          <Text className="text-green-200 text-center">
            Your Krishi Sakhi platform is fully configured with Supabase,
            Tailwind CSS, and comprehensive TypeScript types.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
