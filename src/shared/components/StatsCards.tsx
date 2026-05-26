import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Q } from '@nozbe/watermelondb';
import { database } from '../../core/database/database';
import Task from '../../core/database/models/Task';

interface StatsCardsProps {
  userEmail: string;
  onSelectFilter?: (filter: 'Todas' | 'Pendientes' | 'Completadas') => void;
}

export default function StatsCards({ userEmail, onSelectFilter }: StatsCardsProps) {
  const [total, setTotal] = useState(0);
  const [pending, setPending] = useState(0);
  const [completed, setCompleted] = useState(0);

  const percent = total ? Math.round((completed / total) * 100) : 0;

  useEffect(() => {
    const col = database.get<Task>('tasks');
    const userFilter = Q.where('user_id', userEmail);

    const s1 = col.query(userFilter).observeCount().subscribe(setTotal);
    const s2 = col.query(userFilter, Q.where('completed', false)).observeCount().subscribe(setPending);
    const s3 = col.query(userFilter, Q.where('completed', true)).observeCount().subscribe(setCompleted);

    return () => { s1.unsubscribe(); s2.unsubscribe(); s3.unsubscribe(); };
  }, [userEmail]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.card, styles.pendingCard]} onPress={() => onSelectFilter && onSelectFilter('Pendientes')}>
        <Text style={styles.cardTitle}>PENDIENTES</Text>
        <Text style={[styles.cardValue, styles.pendingText]}>{pending}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.card, styles.completedCard]} onPress={() => onSelectFilter && onSelectFilter('Completadas')}>
        <Text style={styles.cardTitle}>COMPLETADAS</Text>
        <Text style={[styles.cardValue, styles.completedText]}>{completed}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.card, styles.totalCard]} onPress={() => onSelectFilter && onSelectFilter('Todas')}>
        <Text style={styles.cardTitle}>TOTAL</Text>
        <Text style={[styles.cardValue, styles.totalText]}>{total}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginVertical: 12 },
  card: { flex: 1, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 10, marginHorizontal: 4, elevation: 2, alignItems: 'center', borderWidth: 1 },
  totalCard: { backgroundColor: '#1E293B', borderColor: '#334155' },
  pendingCard: { backgroundColor: '#1E293B', borderColor: '#334155' },
  completedCard: { backgroundColor: '#1E293B', borderColor: '#334155' },
  cardTitle: { fontSize: 11, fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 },
  cardValue: { fontSize: 20, fontWeight: '700' },
  percentage: { fontSize: 12, color: '#CBD5E1', marginTop: 6, fontWeight: '600' },
  totalText: { color: '#A5B4FC' },
  pendingText: { color: '#FB923C' },
  completedText: { color: '#86EFAC' },
});