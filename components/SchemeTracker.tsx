import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { governmentSchemeService } from '../services/government.service';
import type { SchemeData } from '../types/government.types';

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'eligible':
    case 'available':
    case 'open':
      return '#4CAF50';
    case 'pending':
    case 'under_review':
      return '#FF9800';
    case 'not_eligible':
    case 'closed':
      return '#F44336';
    default:
      return '#9E9E9E';
  }
};

const SchemeTracker: React.FC = () => {
  const { user } = useAuth();
  const [schemes, setSchemes] = useState<SchemeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchemeData();
  }, []);

  const loadSchemeData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const [kaliaData, procurementData, subsidyData] = await Promise.all([
        governmentSchemeService.checkKALIAEligibility(user.id),
        governmentSchemeService.getPaddyProcurementInfo(user.id),
        governmentSchemeService.getActiveSubsidies(user.id)
      ]);

      setSchemes([
        {
          name: 'KALIA Scheme',
          status: kaliaData.applicationStatus,
          benefitAmount: kaliaData.benefitAmount,
          nextAction: kaliaData.isEligible ? 'Complete Application' : 'Check Eligibility',
          icon: 'account-balance-wallet'
        },
        {
          name: 'Paddy Procurement',
          status: procurementData.registrationOpen ? 'Open' : 'Closed',
          benefitAmount: procurementData.currentMSP,
          nextAction: 'Book Delivery Slot',
          icon: 'agriculture'
        },
        {
          name: 'Equipment Subsidy',
          status: 'Available',
          benefitAmount: subsidyData[0]?.maxBenefit || 0,
          nextAction: 'Calculate Subsidy',
          icon: 'build'
        }
      ]);
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to load scheme data. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSchemeAction = (scheme: SchemeData) => {
    Alert.alert(
      scheme.name,
      `Next action: ${scheme.nextAction}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Proceed', onPress: () => handleActionPress(scheme) }
      ]
    );
  };

  const handleActionPress = (scheme: SchemeData) => {
    switch (scheme.name) {
      case 'KALIA Scheme':
        Alert.alert('KALIA', 'Redirecting to KALIA application...');
        break;
      case 'Paddy Procurement':
        Alert.alert('Procurement', 'Redirecting to slot booking...');
        break;
      case 'Equipment Subsidy':
        Alert.alert('Subsidy', 'Redirecting to subsidy calculator...');
        break;
      default:
        Alert.alert('Action', 'Feature coming soon!');
    }
  };

  const renderSchemeCard = (scheme: SchemeData) => (
    <View key={scheme.name} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>
            {scheme.icon === 'account-balance-wallet' ? '💰' :
             scheme.icon === 'agriculture' ? '🌾' : '🔧'}
          </Text>
        </View>
        <Text style={styles.schemeName}>{scheme.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(scheme.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(scheme.status) }]}>
            {scheme.status}
          </Text>
        </View>
      </View>

      <Text style={styles.benefitAmount}>
        ₹{scheme.benefitAmount.toLocaleString()}
      </Text>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleSchemeAction(scheme)}
      >
        <Text style={styles.actionButtonText}>
          {scheme.nextAction}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>
            Loading government schemes...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Government Schemes
        </Text>
        <Text style={styles.headerSubtitle}>
          Access Odisha government agricultural schemes and benefits
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>
          Available Schemes
        </Text>

        {schemes.length > 0 ? (
          schemes.map(renderSchemeCard)
        ) : (
          <View style={styles.noSchemesContainer}>
            <Text style={styles.noSchemesTitle}>
              No schemes available
            </Text>
            <Text style={styles.noSchemesSubtitle}>
              Check back later for new schemes!
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadSchemeData}
        >
          <Text style={styles.refreshButtonText}>
            Refresh Schemes
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F4EA',
  },
  header: {
    backgroundColor: '#2E7D32',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#A5D6A7',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1B5E20',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#C8E6C9',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  schemeName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1B5E20',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  benefitAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: '#388E3C',
    paddingVertical: 12,
    borderRadius: 16,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E6F4EA',
  },
  loadingBox: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 20,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
    textAlign: 'center',
  },
  noSchemesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  noSchemesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1B5E20',
    marginBottom: 8,
  },
  noSchemesSubtitle: {
    fontSize: 14,
    color: '#66BB6A',
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 16,
    borderRadius: 20,
    marginTop: 24,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 18,
  },
});

export default SchemeTracker;
