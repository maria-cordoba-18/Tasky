import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, TextInput, Modal } from 'react-native';
import TaskList from '../components/TaskList';
import { useTaskStore, TaskFilter } from '../../useTaskStore';
import { syncTasks } from '../../../core/database/sync';
import AvatarView from '../../../shared/components/AvatarView';
import StatsCards from '../../../shared/components/StatsCards';
import CreateTaskModal from '../components/CreateTaskModal';
import { useAuthStore } from '../../../store/useAuthStore';

export const DashboardScreen = () => {
  const { filter, setFilter } = useTaskStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { currentUser, logout } = useAuthStore();
  const filters: TaskFilter[] = ['Todas', 'Pendientes', 'Completadas'];

  const userEmail = currentUser?.email ?? '';
  const userName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : 'Usuario';

  const [profileVisible, setProfileVisible] = useState(false);
  const [selectedCardTitle, setSelectedCardTitle] = useState<string | null>(null);

  useEffect(() => {
    if (userEmail) syncTasks(userEmail);
  }, [userEmail]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        <View style={styles.header}>
          <TouchableOpacity style={styles.headerLeft} onPress={() => setProfileVisible(true)}>
            <AvatarView name={userName} style={styles.avatar} />
            <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <StatsCards userEmail={userEmail} onSelectFilter={(f) => {
          setFilter(f);
          setSelectedCardTitle(f);
          setTimeout(() => setSelectedCardTitle(null), 1500);
        }} />

        {selectedCardTitle ? (
          <View style={styles.cardLabelContainer}>
            <Text style={styles.cardLabelText}>{selectedCardTitle}</Text>
          </View>
        ) : null}

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar tarea..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* filtros removidos: ahora las tarjetas arriba seleccionan el filtro */}

        <View style={styles.tasksWrapper}>
          <Text style={styles.sectionTitle}>Tareas</Text>
          <View style={{ flex: 1 }}>
            <TaskList
              filter={filter}
              userEmail={userEmail}
              searchText={searchText}
            />
          </View>
        </View>

        {/* FAB movido al header */}

        <CreateTaskModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          userEmail={userEmail}
        />

      {/* Profile modal */}
      <Modal visible={profileVisible} transparent animationType="slide" onRequestClose={() => setProfileVisible(false)}>
        <View style={styles.profileOverlay}>
          <View style={styles.profileCard}>
            <AvatarView name={userName} style={{ width: 80, height: 80, marginBottom: 12 }} />
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileEmail}>{userEmail}</Text>
            <TouchableOpacity style={[styles.button, styles.logoutButtonProfile]} onPress={() => { setProfileVisible(false); logout(); }}>
              <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.closeButton]} onPress={() => setProfileVisible(false)}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  userName: { fontSize: 18, fontWeight: '700', color: '#F1F5F9', maxWidth: 180, marginLeft: 12 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 46, height: 46 },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  addButtonText: { color: '#FFFFFF', fontSize: 24, lineHeight: 24 },
  logoutButton: {
    marginLeft: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#5B21B6',
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  logoutButtonText: { color: '#E9D5FF', fontSize: 12, fontWeight: '600' },
  filtersContainer: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 10 },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#334155',
  },
  filterButtonActive: { backgroundColor: '#6366F1' },
  filterText: { fontSize: 14, color: '#CBD5E1', fontWeight: '500' },
  filterTextActive: { color: '#F1F5F9' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
    lineHeight: Platform.OS === 'ios' ? 32 : 36,
  },

  searchContainer: {
  paddingHorizontal: 16,
  marginBottom: 12,
},

searchInput: {
  backgroundColor: '#0B1220',
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.06)',
  fontSize: 14,
  color: '#E6EEF8',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.12,
  shadowRadius: 6,
  elevation: 2,
},
  tasksWrapper: {
   flex: 1,
   marginTop: 8,
   backgroundColor: '#071029',
   borderTopLeftRadius: 16,
   borderTopRightRadius: 16,
   paddingTop: 14,
   paddingHorizontal: 12,
   paddingBottom: 16,
 },
  cardLabelContainer: { alignItems: 'center', marginTop: 8 },
  cardLabelText: { color: '#A5B4FC', fontWeight: '700', fontSize: 14 },
  
 sectionTitle: {
   color: '#E6EEF8',
   fontSize: 18,
   fontWeight: '700',
   marginBottom: 8,
   paddingHorizontal: 4,
 },
 profileOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
 profileCard: { width: '85%', backgroundColor: '#0F172A', borderRadius: 12, padding: 20, alignItems: 'center' },
 profileName: { color: '#F1F5F9', fontSize: 20, fontWeight: '700', marginBottom: 4 },
 profileEmail: { color: '#94A3B8', fontSize: 14, marginBottom: 12 },
 button: { width: '100%', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
 logoutButtonProfile: { backgroundColor: '#DC2626' },
 closeButton: { backgroundColor: '#334155' },
 closeButtonText: { color: '#E6EEF8', fontWeight: '700' },
});