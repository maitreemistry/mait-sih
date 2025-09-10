import FarmTaskManager from '@/components/FarmTaskManager';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import SectionCard from '@/components/ui/SectionCard';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function TasksScreen() {
  const handleQuickAction = (action: string) => {
    // Handle quick actions
    console.log(`Quick action: ${action}`);
  };

  const handleTemplateSelect = (template: string) => {
    // Handle template selection
    console.log(`Template selected: ${template}`);
  };

  return (
    <ThemedView style={styles.screen}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: '#FFFFFF' }}
      >
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>Tasks</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Plan and track your farm work efficiently</ThemedText>
        </ThemedView>

        {/* Quick Actions */}
        <SectionCard title="⚡ Quick Actions" style={styles.quickActionsCard}>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => handleQuickAction('add_task')}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.quickActionIcon}>➕</ThemedText>
              <ThemedText style={styles.quickActionText}>Add Task</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => handleQuickAction('set_reminder')}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.quickActionIcon}>⏰</ThemedText>
              <ThemedText style={styles.quickActionText}>Set Reminder</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => handleQuickAction('assign_task')}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.quickActionIcon}>👥</ThemedText>
              <ThemedText style={styles.quickActionText}>Assign Task</ThemedText>
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.comingSoonText}>Advanced features coming soon</ThemedText>
        </SectionCard>

        {/* Task Templates */}
        <SectionCard title="📋 Task Templates" style={styles.templatesCard}>
          <View style={styles.templatesList}>
            <TouchableOpacity 
              style={styles.templateItem}
              onPress={() => handleTemplateSelect('harvest')}
              activeOpacity={0.7}
            >
              <View style={styles.templateHeader}>
                <ThemedText style={styles.templateIcon}>🌾</ThemedText>
                <ThemedText style={styles.templateTitle}>Harvest</ThemedText>
              </View>
              <ThemedText style={styles.templateDescription}>Track crop, quantity, and harvest date</ThemedText>
            </TouchableOpacity>
            
            <View style={styles.templateDivider} />
            
            <TouchableOpacity 
              style={styles.templateItem}
              onPress={() => handleTemplateSelect('irrigation')}
              activeOpacity={0.7}
            >
              <View style={styles.templateHeader}>
                <ThemedText style={styles.templateIcon}>💧</ThemedText>
                <ThemedText style={styles.templateTitle}>Irrigation</ThemedText>
              </View>
              <ThemedText style={styles.templateDescription}>Manage field watering schedules</ThemedText>
            </TouchableOpacity>
            
            <View style={styles.templateDivider} />
            
            <TouchableOpacity 
              style={styles.templateItem}
              onPress={() => handleTemplateSelect('fertilizer')}
              activeOpacity={0.7}
            >
              <View style={styles.templateHeader}>
                <ThemedText style={styles.templateIcon}>🧪</ThemedText>
                <ThemedText style={styles.templateTitle}>Fertilizer Application</ThemedText>
              </View>
              <ThemedText style={styles.templateDescription}>Record type, dosage, and safety notes</ThemedText>
            </TouchableOpacity>
          </View>
        </SectionCard>

        {/* Productivity Tips */}
        <SectionCard title="💡 Productivity Tips" style={styles.tipsCard}>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <ThemedText style={styles.tipBullet}>📅</ThemedText>
              <ThemedText style={styles.tipText}>Set due dates and reminders for all tasks</ThemedText>
            </View>
            <View style={styles.tipItem}>
              <ThemedText style={styles.tipBullet}>🗂️</ThemedText>
              <ThemedText style={styles.tipText}>Group tasks by field or crop for better organization</ThemedText>
            </View>
            <View style={styles.tipItem}>
              <ThemedText style={styles.tipBullet}>⏳</ThemedText>
              <ThemedText style={styles.tipText}>Review overdue tasks weekly to stay on track</ThemedText>
            </View>
            <View style={styles.tipItem}>
              <ThemedText style={styles.tipBullet}>📊</ThemedText>
              <ThemedText style={styles.tipText}>Use templates to maintain consistency</ThemedText>
            </View>
          </View>
        </SectionCard>

        {/* Task Manager */}
        <SectionCard title="📋 Task Manager" style={styles.taskManagerCard}>
          <FarmTaskManager />
        </SectionCard>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
  },
  header: {
    gap: 8,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    color: '#000000',
    fontWeight: '600',
  },
  headerSubtitle: {
    color: '#666666',
    fontSize: 16,
  },
  quickActionsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
  },
  comingSoonText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  templatesCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  templatesList: {
    gap: 0,
  },
  templateItem: {
    paddingVertical: 16,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  templateIcon: {
    fontSize: 20,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  templateDescription: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 32,
  },
  templateDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: -16,
  },
  tipsCard: {
    backgroundColor: '#F8F9FA',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
    minWidth: 24,
  },
  tipText: {
    flex: 1,
    lineHeight: 20,
    color: '#333333',
  },
  taskManagerCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
});