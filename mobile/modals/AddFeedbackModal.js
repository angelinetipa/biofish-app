import React, { useState } from 'react';
import { View, Text, Modal, KeyboardAvoidingView, Alert, ActivityIndicator, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Card, CardAccent, ClayInput } from '../components/Card';
import SpringButton from '../components/SpringButton';
import { C, S } from '../constants/theme';
import { API_URL } from '../constants/api';

export default function AddFeedbackModal({ visible, onClose, onSuccess }) {
  const [form, setForm] = useState({ batch_code: '', rating: '5', comments: '' });
  const [loading, setLoading] = useState(false);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/add_feedback.php`, form);
      if (res.data.success) { onSuccess(); onClose(); }
      else Alert.alert('Error', res.data.message);
    } catch { Alert.alert('Error', 'Could not save. Check connection.'); }
    finally { setLoading(false); }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={S.modalOverlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Card style={S.modalCard}>
            <CardAccent />
            <View style={S.modalHeader}>
              <Text style={S.modalTitle}>Add Feedback</Text>
              <SpringButton onPress={onClose}><Ionicons name="close-circle" size={28} color={C.slate} /></SpringButton>
            </View>
            <ClayInput label="Batch Code" value={form.batch_code} onChangeText={v => f('batch_code', v)} placeholder="e.g. BATCH-001" />
            <Text style={S.label}>Rating</Text>
            <View style={{ flexDirection: 'row', marginBottom: 14, marginTop: 4 }}>
              {[1,2,3,4,5].map(n => (
                <SpringButton key={n} onPress={() => f('rating', String(n))}>
                  <Ionicons name={parseInt(form.rating) >= n ? 'star' : 'star-outline'} size={32} color={parseInt(form.rating) >= n ? '#F0A04B' : C.cloud} style={{ marginRight: 4 }} />
                </SpringButton>
              ))}
            </View>
            <ClayInput label="Comments" value={form.comments} onChangeText={v => f('comments', v)} placeholder="Quality notes, observations..." multiline />
            <SpringButton onPress={submit} disabled={loading} style={{ marginTop: 4 }}>
              <LinearGradient colors={[C.tealLight, C.ocean]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.modalSubmitBtn}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={S.modalSubmitText}>Submit Feedback</Text>}
              </LinearGradient>
            </SpringButton>
          </Card>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}