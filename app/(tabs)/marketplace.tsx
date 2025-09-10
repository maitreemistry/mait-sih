import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import FarmerMarketplace from '@/components/FarmerMarketplace';
import SectionCard from '@/components/ui/SectionCard';

export default function MarketplaceScreen() {
  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Marketplace</ThemedText>
          <ThemedText>Discover and list products</ThemedText>
        </ThemedView>

        <SectionCard title="Featured Categories">
          <ThemedText>• Vegetables (Tomato, Onion, Potato)</ThemedText>
          <ThemedText>• Fruits (Mango, Banana, Citrus)</ThemedText>
          <ThemedText>• Grains & Pulses (Wheat, Rice, Lentils)</ThemedText>
        </SectionCard>

        <SectionCard title="Browse & Manage Listings">
          <FarmerMarketplace />
        </SectionCard>

        <SectionCard title="Seller Tips">
          <ThemedText>• Add clear photos and variety/quality details</ThemedText>
          <ThemedText>• Keep stock and price updated daily</ThemedText>
          <ThemedText>• Offer bulk discounts for large buyers</ThemedText>
        </SectionCard>

        <SectionCard title="Get Started">
          <ThemedText>Create your first listing or import from inventory.</ThemedText>
        </SectionCard>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  header: {
    gap: 4,
    marginBottom: 4,
  },
}); 