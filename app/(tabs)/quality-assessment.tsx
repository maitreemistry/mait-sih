import { QualityAssessmentScreen as QualityAssessmentComponent } from '@/components/farmer/QualityAssessment';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import SectionCard from '@/components/ui/SectionCard';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export default function QualityAssessmentScreen() {
  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">AI Quality Assessment</ThemedText>
          <ThemedText>Analyze and grade your produce quality</ThemedText>
        </ThemedView>

        <SectionCard title="Quality Analysis">
          <QualityAssessmentComponent />
        </SectionCard>

        <SectionCard title="Assessment Features">
          <ThemedText>• Real-time quality grading (A-F scale)</ThemedText>
          <ThemedText>• Defect detection and classification</ThemedText>
          <ThemedText>• Confidence scoring for accuracy</ThemedText>
          <ThemedText>• Blockchain integration for certificates</ThemedText>
        </SectionCard>

        <SectionCard title="How It Works">
          <ThemedText>1. Capture or upload product images</ThemedText>
          <ThemedText>2. AI analyzes quality parameters</ThemedText>
          <ThemedText>3. Receive detailed assessment report</ThemedText>
          <ThemedText>4. Generate blockchain-verified certificates</ThemedText>
        </SectionCard>

        <SectionCard title="Benefits">
          <ThemedText>• Fair pricing based on quality</ThemedText>
          <ThemedText>• Build buyer trust with certificates</ThemedText>
          <ThemedText>• Track quality trends over time</ThemedText>
          <ThemedText>• Meet export standards</ThemedText>
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
