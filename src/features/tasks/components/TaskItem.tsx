import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, Image, TouchableOpacity, Modal, TextInput } from 'react-native';
import Toast from 'react-native-root-toast';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import withObservables from '@nozbe/with-observables';
import Task from '../../../core/database/models/Task';

interface TaskItemProps {
  task: Task;
}

const TaskItem = ({ task }: TaskItemProps) => {
  const [isCompleted, setIsCompleted] = useState(task.completed);

  useEffect(() => {
    setIsCompleted(task.completed);
  }, [task.completed]);

  const toggleCompletion = async () => {
    const nextVal = !isCompleted;
    setIsCompleted(nextVal);
    try {
      await task.toggleCompletion();
    } catch (error) {
      setIsCompleted(task.completed); // rollback
      console.error('Error toggling completion:', error);
    }
  };

  const hasAttachment = !!task.attachmentUri;
  const hasDescription = !!task.description;
  const [editVisible, setEditVisible] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPhoto, setEditPhoto] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.contentContainer}>
        {hasAttachment && (
          <Image source={{ uri: task.attachmentUri }} style={styles.thumbnail} />
        )}
        <View style={styles.textContainer}>
          <Text style={[styles.title, isCompleted && styles.completedTitle]} numberOfLines={2}>
            {task.title}
          </Text>
          {hasDescription && (
            <Text style={[styles.description, isCompleted && styles.completedText]} numberOfLines={2}>
              {task.description}
            </Text>
          )}
          {/* menu button replaced inline */}
        </View>
      </View>
      <View style={styles.rightControls}>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
          <Text style={styles.menuDots}>⋮</Text>
        </TouchableOpacity>
        <Switch
          value={isCompleted}
          onValueChange={toggleCompletion}
          trackColor={{ false: '#D1D5DB', true: '#A7F3D0' }}
          thumbColor={isCompleted ? '#10B981' : '#F3F4F6'}
        />
      </View>

      {/* Edit modal */}
      <Modal visible={editVisible} animationType="slide" transparent onRequestClose={() => setEditVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar tarea</Text>
            <TextInput style={styles.modalInput} value={editTitle} onChangeText={setEditTitle} />
            <TextInput style={[styles.modalInput, { height: 80 }]} value={editDescription} onChangeText={setEditDescription} multiline />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setEditVisible(false)}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={async () => {
                const newTitle = (editTitle ?? '').trim();
                const newDescription = (editDescription ?? '').trim();
                try {
                  if (!newTitle) {
                    Toast.show('Error: El título no puede estar vacío', { duration: Toast.durations.SHORT, position: Toast.positions.BOTTOM });
                    return;
                  }
                  const { database } = require('../../../core/database/database');
                  await database.write(async () => {
                    await task.update((t: any) => {
                      t._setRaw('title', newTitle);
                      t._setRaw('description', newDescription);
                      t._setRaw('attachment_uri', editPhoto || '');
                    });
                  });
                  setEditVisible(false);
                  Toast.show('Tarea actualizada', { duration: Toast.durations.SHORT, position: Toast.positions.BOTTOM });
                } catch (err) {
                  console.error('Error updating task', err);
                  Toast.show('Error: No se pudo actualizar la tarea', { duration: Toast.durations.LONG, position: Toast.positions.BOTTOM });
                }
              }}>
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Confirm delete modal */}
      <Modal visible={confirmVisible} transparent animationType="fade" onRequestClose={() => setConfirmVisible(false)}>
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>¿Eliminar tarea?</Text>
            <Text style={styles.confirmMessage}>Esta acción no se puede deshacer.</Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setConfirmVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={async () => {
                setConfirmVisible(false);
                try {
                  const { database } = require('../../../core/database/database');
                  await database.write(async () => { await (task as any).markAsDeleted(); });
                  Toast.show('Tarea eliminada', { duration: Toast.durations.SHORT, position: Toast.positions.BOTTOM });
                } catch (err) {
                  console.error('Error deleting task', err);
                  Toast.show('Error: No se pudo eliminar la tarea', { duration: Toast.durations.LONG, position: Toast.positions.BOTTOM });
                }
              }}>
                <Text style={styles.deleteButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Menu modal */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuCard}>
            <TouchableOpacity onPress={() => { setEditTitle(task.title ?? ''); setEditDescription(task.description ?? ''); setEditPhoto(task.attachmentUri || null); setMenuVisible(false); setEditVisible(true); }} style={styles.menuItem}>
              <Text style={styles.menuItemText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setMenuVisible(false); setConfirmVisible(true); }} style={styles.menuItem}>
              <Text style={[styles.menuItemText, { color: '#F87171' }]}>Eliminar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={async () => {
              setMenuVisible(false);
              const result = await launchCamera({ mediaType: 'photo', quality: 0.7, saveToPhotos: false });
              if (result.assets && result.assets[0]?.uri) {
                const uri = result.assets[0].uri;
                try {
                  const { database } = require('../../../core/database/database');
                  await database.write(async () => { await task.update((t: any) => { t._setRaw('attachment_uri', uri); }); });
                  Toast.show('Foto añadida', { duration: Toast.durations.SHORT, position: Toast.positions.BOTTOM });
                } catch (err) {
                  console.error('Error adding photo', err);
                  Toast.show('Error: No se pudo agregar la foto', { duration: Toast.durations.LONG, position: Toast.positions.BOTTOM });
                }
              }
            }} style={styles.menuItem}>
              <Text style={[styles.menuItemText, { color: '#60A5FA' }]}>Foto</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#334155',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
    lineHeight: 22,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  description: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 18,
  },
  completedText: {
    color: '#64748B',
  },
  actionsRow: { flexDirection: 'row', gap: 16, marginTop: 8 },
  actionText: { fontSize: 12, color: '#A5B4FC', fontWeight: '600', marginRight: 12 },
  rightControls: { flexDirection: 'row', alignItems: 'center' },
  menuButton: { paddingHorizontal: 8, paddingVertical: 4 },
  menuDots: { fontSize: 20, color: '#94A3B8', fontWeight: '700' },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  menuCard: { position: 'absolute', right: 24, top: '40%', backgroundColor: '#0F172A', borderRadius: 8, paddingVertical: 8, width: 160, borderWidth: 1, borderColor: '#334155' },
  menuItem: { paddingVertical: 12, paddingHorizontal: 14 },
  menuItemText: { color: '#E6EEF8', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', backgroundColor: '#1E293B', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, color: '#F1F5F9', fontWeight: '700', marginBottom: 12 },
  modalInput: { backgroundColor: '#0F172A', borderColor: '#334155', borderWidth: 1, borderRadius: 8, padding: 10, color: '#E6EEF8', marginBottom: 10 },
  modalButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#334155', margin: 6 },
  modalButtonText: { color: '#E6EEF8', fontWeight: '700' },
  saveButton: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  confirmOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  confirmCard: { width: '86%', backgroundColor: '#0B1220', borderRadius: 12, padding: 18, borderWidth: 1, borderColor: '#23303F' },
  confirmTitle: { fontSize: 18, color: '#F1F5F9', fontWeight: '800', marginBottom: 6 },
  confirmMessage: { fontSize: 14, color: '#94A3B8', marginBottom: 14 },
  confirmButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancelButton: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, marginRight: 8, backgroundColor: '#111827' },
  cancelButtonText: { color: '#E6EEF8', fontWeight: '700' },
  deleteButton: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, backgroundColor: '#DC2626' },
  deleteButtonText: { color: '#fff', fontWeight: '800' },
});

export default withObservables(['task'], ({ task }: { task: Task }) => ({
  task,
}))(TaskItem);
