import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import DashboardSummary from '@/components/DashboardSummary';
import SectionCard from '@/components/ui/SectionCard';

export default function DashboardScreen() {
  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Dashboard</ThemedText>
          <ThemedText>Your farm at a glance</ThemedText>
        </ThemedView>

        <SectionCard title="Summary">
          <DashboardSummary />
        </SectionCard>

        <View style={styles.row}>
          <SectionCard title="Revenue (30d)" style={styles.flexItem}>
            <ThemedText type="title">₹ 1,24,500</ThemedText>
            <ThemedText>↑ 12% vs last month</ThemedText>
          </SectionCard>
          <SectionCard title="Orders in Progress" style={styles.flexItem}>
            <ThemedText type="title">8</ThemedText>
            <ThemedText>3 pending shipment</ThemedText>
          </SectionCard>
        </View>

        <SectionCard title="Next actions">
          <ThemedText>• Confirm pickup for Order #123</ThemedText>
          <ThemedText>• Create harvesting task for Tomatoes (Fri)</ThemedText>
          <ThemedText>• Update inventory for Onions (200 kg)</ThemedText>
        </SectionCard>

        <SectionCard title="Tips">
          <ThemedText>• Add certifications to increase buyer trust</ThemedText>
          <ThemedText>• Enable reminders for time-sensitive tasks</ThemedText>
          <ThemedText>• Check daily price trends before listing</ThemedText>
        </SectionCard>

        <SectionCard title="Insights">
          <ThemedText>Weather and price insights will appear here.</ThemedText>
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flexItem: {
    flex: 1,
  },
}); 