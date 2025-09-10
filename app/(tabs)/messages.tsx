import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import SectionCard from '@/components/ui/SectionCard';

const SAMPLE_CHATS = [
  { id: '1', name: 'Retailer A', last: 'Order #123 ready for pickup?', status: 'unread' },
  { id: '2', name: 'Buyer Group', last: 'Can we negotiate price for tomatoes?', status: 'read' },
  { id: '3', name: 'Cold-chain', last: 'Temperature log updated.', status: 'muted' },
];

export default function MessagesScreen() {
  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Messages</ThemedText>
          <ThemedText>Chat with buyers and partners</ThemedText>
        </ThemedView>

        <SectionCard title="Quick Actions">
          <ThemedText>• Start new conversation</ThemedText>
          <ThemedText>• Mark all as read</ThemedText>
          <ThemedText>• Manage notifications</ThemedText>
        </SectionCard>

        <SectionCard title="Conversations">
          {SAMPLE_CHATS.map((c) => (
            <View key={c.id} style={styles.chatRow}>
              <ThemedText type="defaultSemiBold">{c.name}</ThemedText>
              <ThemedText>{c.last}</ThemedText>
              <ThemedText>status: {c.status}</ThemedText>
            </View>
          ))}
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
  chatRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    gap: 6,
  },
}); 