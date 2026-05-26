import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  TouchableWithoutFeedback, Keyboard, Image,
} from 'react-native';
import Toast from 'react-native-root-toast';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { database } from '../../../core/database/database';
import Task from '../../../core/database/models/Task';

interface CreateTaskModalProps {
  visible: boolean;
  onClose: () => void;
  userEmail: string;  // ← nuevo
}

export default function CreateTaskModal({ visible, onClose, userEmail }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleCamera = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.7,
      saveToPhotos: false,
    });
    if (result.assets && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleGallery = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
    });
    if (result.assets && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('El título es obligatorio');
      return;
    }
    try {
      await database.write(async () => {
        const tasksCollection = database.get<Task>('tasks');
        await tasksCollection.create((task: any) => {
          task._setRaw('title', title.trim());
          task._setRaw('completed', false);
          task._setRaw('server_id', Date.now());
          task._setRaw('created_at', Date.now());
          task._setRaw('description', description.trim());
          task._setRaw('attachment_uri', photoUri || '');
          task._setRaw('user_id', userEmail);

        });
      });
      setTitle('');
      setDescription('');
      setPhotoUri(null);
      setError('');
      // Notify creation with toast (and if photo was added)
      if (photoUri) {
        Toast.show('Tarea creada: se agregó la foto', { duration: Toast.durations.SHORT, position: Toast.positions.BOTTOM });
      } else {
        Toast.show('Tarea creada', { duration: Toast.durations.SHORT, position: Toast.positions.BOTTOM });
      }
      onClose();
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setPhotoUri(null);
    setError('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleCancel}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Nueva Tarea</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Título *</Text>
                <TextInput
                  style={[styles.input, error ? styles.inputError : null]}
                  placeholder="Escribe el título de la tarea..."
                  placeholderTextColor="#64748B"
                  value={title}
                  onChangeText={(text) => { setTitle(text); if (text.trim()) setError(''); }}
                />
                {!!error && <Text style={styles.errorText}>{error}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Descripción</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Añade una descripción (opcional)..."
                  placeholderTextColor="#64748B"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              {/* Botones de foto */}
              <View style={styles.photoButtonsRow}>
                <TouchableOpacity style={styles.photoButton} onPress={handleCamera}>
                  <Text style={styles.photoButtonText}>📷 Cámara</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoButton} onPress={handleGallery}>
                  <Text style={styles.photoButtonText}>🖼 Galería</Text>
                </TouchableOpacity>
              </View>

              {/* Miniatura de foto */}
              {photoUri && (
                <View style={styles.thumbnailContainer}>
                  <Image source={{ uri: photoUri }} style={styles.thumbnail} />
                  <TouchableOpacity style={styles.removePhoto} onPress={() => setPhotoUri(null)}>
                    <Text style={styles.removePhotoText}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  keyboardView: { width: '100%', alignItems: 'center' },
  modalContent: {
    width: '90%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 28 : 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#F1F5F9', marginBottom: 20 },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#CBD5E1', marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: '#334155', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 15,
    color: '#F1F5F9', backgroundColor: '#0F172A',
  },
  inputError: { borderColor: '#DC2626', backgroundColor: '#3F0F0F' },
  textArea: { height: 80, paddingTop: 12 },
  errorText: { color: '#FCA5A5', fontSize: 12, marginTop: 6 },
  photoButtonsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  photoButton: {
    flex: 1, borderWidth: 1, borderColor: '#6366F1', borderRadius: 12,
    paddingVertical: 10, alignItems: 'center', backgroundColor: '#312E81',
  },
  photoButtonText: { color: '#A5B4FC', fontWeight: '600', fontSize: 14 },
  thumbnailContainer: { position: 'relative', alignSelf: 'flex-start', marginBottom: 12 },
  thumbnail: { width: 100, height: 100, borderRadius: 10 },
  removePhoto: {
    position: 'absolute', top: -8, right: -8, backgroundColor: '#DC2626',
    width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center',
  },
  removePhotoText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  button: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelButton: { backgroundColor: '#334155', marginRight: 12 },
  cancelButtonText: { color: '#E2E8F0', fontSize: 16, fontWeight: '600' },
  saveButton: { backgroundColor: '#6366F1' },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});