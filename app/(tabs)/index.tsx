import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const quickActions = [
    {
      title: 'Government Schemes',
      subtitle: 'Access Odisha agricultural schemes',
      icon: 'house.fill',
      route: '/scheme-tracker',
      color: colors.primary,
    },
    {
      title: 'Marketplace',
      subtitle: 'Buy and sell agricultural products',
      icon: 'cart.fill',
      route: '/marketplace',
      color: colors.secondary,
    },
    {
      title: 'Dashboard',
      subtitle: 'View your farm analytics',
      icon: 'chart.bar.fill',
      route: '/dashboard',
      color: colors.accent,
    },
    {
      title: 'Tasks',
      subtitle: 'Manage your farming activities',
      icon: 'checkmark.circle.fill',
      route: '/tasks',
      color: colors.success,
    },
  ];

  const handleActionPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerContent}>
          <ThemedText style={styles.welcomeText}>Welcome to</ThemedText>
          <ThemedText style={styles.appName}>Krishi Sahayak</ThemedText>
          <ThemedText style={styles.subtitle}>Your Agricultural Companion</ThemedText>
        </View>
        <View style={styles.headerIcon}>
          <IconSymbol size={80} name="leaf.fill" color="#FFFFFF" />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          Quick Actions
        </ThemedText>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleActionPress(action.route)}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                <Text style={[styles.actionIconText, { color: action.color }]}>
                  {action.icon === 'house.fill' ? '🏛️' :
                   action.icon === 'cart.fill' ? '🛒' :
                   action.icon === 'chart.bar.fill' ? '📊' : '✅'}
                </Text>
              </View>
              <ThemedText style={[styles.actionTitle, { color: colors.text }]}>
                {action.title}
              </ThemedText>
              <ThemedText style={[styles.actionSubtitle, { color: colors.icon }]}>
                {action.subtitle}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          Features
        </ThemedText>
        <View style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.featureItem}>
            <IconSymbol size={24} name="star.fill" color={colors.success} />
            <View style={styles.featureText}>
              <ThemedText style={[styles.featureTitle, { color: colors.text }]}>
                Government Schemes
              </ThemedText>
              <ThemedText style={[styles.featureDescription, { color: colors.icon }]}>
                Access KALIA, paddy procurement, and equipment subsidy schemes
              </ThemedText>
            </View>
          </View>
          <View style={styles.featureItem}>
            <IconSymbol size={24} name="cart.fill" color={colors.secondary} />
            <View style={styles.featureText}>
              <ThemedText style={[styles.featureTitle, { color: colors.text }]}>
                Marketplace
              </ThemedText>
              <ThemedText style={[styles.featureDescription, { color: colors.icon }]}>
                Buy seeds, fertilizers, and sell your produce at fair prices
              </ThemedText>
            </View>
          </View>
          <View style={styles.featureItem}>
            <IconSymbol size={24} name="chart.bar.fill" color={colors.accent} />
            <View style={styles.featureText}>
              <ThemedText style={[styles.featureTitle, { color: colors.text }]}>
                Analytics
              </ThemedText>
              <ThemedText style={[styles.featureDescription, { color: colors.icon }]}>
                Track your farm performance and get insights
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#E8F5E8',
    marginTop: 4,
  },
  headerIcon: {
    marginLeft: 16,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIconText: {
    fontSize: 24,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  featureCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
});
