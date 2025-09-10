import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import SectionCard from '@/components/ui/SectionCard';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

// Mock user data - replace with actual user data
const userData = {
  name: 'John Farmer',
  email: 'john@example.com',
  phone: '+1 (555) 123-4567',
  certifications: ['Organic', 'Fair Trade', 'Rainforest Alliance'],
  completionPercentage: 75
};

export default function ProfileScreen() {
  const handleSectionPress = (section: string) => {
    // Handle navigation to specific section
    console.log(`Navigate to ${section}`);
  };

  const renderProgressBar = (percentage: number) => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
      </View>
      <ThemedText style={styles.progressText}>{percentage}% complete</ThemedText>
    </View>
  );

  const renderCertificationBadge = (cert: string) => (
    <View key={cert} style={styles.badge}>
      <ThemedText style={styles.badgeText}>{cert}</ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.screen}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: '#FFFFFF' }}
      >
        {/* Header with user info */}
        <ThemedView style={styles.header}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>
                {userData.name.split(' ').map(n => n[0]).join('')}
              </ThemedText>
            </View>
            <View style={styles.userInfo}>
              <ThemedText type="title" style={styles.userName}>
                {userData.name}
              </ThemedText>
              <ThemedText style={styles.userEmail}>{userData.email}</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.subtitle}>
            Complete your profile to unlock all features
          </ThemedText>
          {renderProgressBar(userData.completionPercentage)}
        </ThemedView>

        {/* Account Section */}
        <TouchableOpacity 
          onPress={() => handleSectionPress('account')}
          activeOpacity={0.7}
        >
          <SectionCard title="Account Information" style={styles.interactiveCard}>
            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <ThemedText style={styles.label}>Name</ThemedText>
                <ThemedText style={styles.value}>{userData.name}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={styles.label}>Email</ThemedText>
                <ThemedText style={styles.value}>{userData.email}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={styles.label}>Phone</ThemedText>
                <ThemedText style={styles.value}>{userData.phone}</ThemedText>
              </View>
            </View>
            <ThemedText style={styles.actionText}>Tap to edit →</ThemedText>
          </SectionCard>
        </TouchableOpacity>

        {/* Certifications Section */}
        <TouchableOpacity 
          onPress={() => handleSectionPress('certifications')}
          activeOpacity={0.7}
        >
          <SectionCard title="Certifications" style={styles.interactiveCard}>
            <View style={styles.cardContent}>
              <View style={styles.badgeContainer}>
                {userData.certifications.map(renderCertificationBadge)}
              </View>
              <ThemedText style={styles.description}>
                {userData.certifications.length} active certification{userData.certifications.length !== 1 ? 's' : ''}
              </ThemedText>
            </View>
            <ThemedText style={styles.actionText}>Manage certifications →</ThemedText>
          </SectionCard>
        </TouchableOpacity>

        {/* Preferences Section */}
        <TouchableOpacity 
          onPress={() => handleSectionPress('preferences')}
          activeOpacity={0.7}
        >
          <SectionCard title="Preferences" style={styles.interactiveCard}>
            <View style={styles.cardContent}>
              <View style={styles.preferenceItem}>
                <ThemedText style={styles.label}>Language</ThemedText>
                <ThemedText style={styles.value}>English</ThemedText>
              </View>
              <View style={styles.preferenceItem}>
                <ThemedText style={styles.label}>Notifications</ThemedText>
                <ThemedText style={styles.value}>Enabled</ThemedText>
              </View>
              <View style={styles.preferenceItem}>
                <ThemedText style={styles.label}>Theme</ThemedText>
                <ThemedText style={styles.value}>Auto</ThemedText>
              </View>
            </View>
            <ThemedText style={styles.actionText}>Customize settings →</ThemedText>
          </SectionCard>
        </TouchableOpacity>

        {/* Tips Section */}
        <SectionCard title="💡 Profile Tips" style={styles.tipsCard}>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <ThemedText style={styles.tipBullet}>✓</ThemedText>
              <ThemedText style={styles.tipText}>Keep your profile updated for better matches</ThemedText>
            </View>
            <View style={styles.tipItem}>
              <ThemedText style={styles.tipBullet}>🏆</ThemedText>
              <ThemedText style={styles.tipText}>Add certifications to unlock premium buyers</ThemedText>
            </View>
            <View style={styles.tipItem}>
              <ThemedText style={styles.tipBullet}>🌐</ThemedText>
              <ThemedText style={styles.tipText}>Set your preferred languages for support</ThemedText>
            </View>
          </View>
        </SectionCard>

        {/* Security Section */}
        <SectionCard title="🔒 Security" style={styles.securityCard}>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <ThemedText style={styles.securityBullet}>🛡️</ThemedText>
              <ThemedText style={styles.tipText}>Enable 2FA when available</ThemedText>
            </View>
            <View style={styles.tipItem}>
              <ThemedText style={styles.securityBullet}>🔑</ThemedText>
              <ThemedText style={styles.tipText}>Never share your service role key</ThemedText>
            </View>
            <View style={styles.tipItem}>
              <ThemedText style={styles.securityBullet}>👀</ThemedText>
              <ThemedText style={styles.tipText}>Review active sessions regularly</ThemedText>
            </View>
          </View>
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
    gap: 16,
    paddingBottom: 32, // Extra padding for safe area
  },
  header: {
    gap: 12,
    marginBottom: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    marginBottom: 4,
  },
  userEmail: {
    opacity: 0.7,
    fontSize: 14,
  },
  subtitle: {
    opacity: 0.8,
    fontSize: 16,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5E7',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'right',
    opacity: 0.7,
  },
  interactiveCard: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  label: {
    opacity: 0.7,
    fontSize: 14,
  },
  value: {
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  actionText: {
    marginTop: 8,
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    opacity: 0.7,
    fontSize: 14,
  },
  tipsCard: {
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  securityCard: {
    backgroundColor: '#FFF9F0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipBullet: {
    fontSize: 16,
    minWidth: 20,
  },
  securityBullet: {
    fontSize: 16,
    minWidth: 20,
  },
  tipText: {
    flex: 1,
    lineHeight: 20,
    color: '#333333',
  },
});