import React, { useState, useEffect } from 'react';
import { View, Text, Modal, ScrollView, KeyboardAvoidingView, Alert, ActivityIndicator, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Card, CardAccent, ClayInput } from '../components/Card';
import SpringButton from '../components/SpringButton';
import { C, S } from '../constants/theme';
import { API_URL } from '../constants/api';

const shortCode = (code) => {
  if (!code) return '—';
  const parts = code.split('-');
  return parts.length >= 3 ? '#' + parts[parts.length - 1] : code;
};

export default function AddFeedbackModal({ visible, onClose, onSuccess }) {
  const [loading,  setLoading]  = useState(false);
  const [batches,  setBatches]  = useState([]);
  const [form, setForm] = useState({
    batch_id: '', rating: '5', user_name: '',
    comments: '', bug_report: '', feature_request: '',
  });
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    if (visible) {
      axios.get(`${API_URL}/get_completed_batches.php`)
        .then(r => { if (r.data.success) setBatches(r.data.data); })
        .catch(() => {});
    }
  }, [visible]);

  const submit = async () => {
    if (!form.batch_id) return Alert.alert('Error', 'Please select a batch.');
    if (!form.user_name.trim()) return Alert.alert('Error', 'Please enter your name.');
    if (!form.comments && !form.bug_report && !form.feature_request)
      return Alert.alert('Error', 'Please fill at least one feedback section.');

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/add_feedback.php`, {
        ...form,
        batch_id: parseInt(form.batch_id),
        rating: parseInt(form.rating),
      });
      if (res.data.success) { onSuccess?.(); onClose(); resetForm(); }
      else Alert.alert('Error', res.data.message);
    } catch { Alert.alert('Error', 'Could not save. Check connection.'); }
    finally { setLoading(false); }
  };

  const resetForm = () => setForm({ batch_id: '', rating: '5', user_name: '', comments: '', bug_report: '', feature_request: '' });

  const selectedBatch = batches.find(b => b.batch_id == form.batch_id);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={S.modalOverlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
          <Card style={[S.modalCard, { maxHeight: '92%' }]}>
            <CardAccent />
            <View style={S.modalHeader}>
              <Text style={S.modalTitle}>Submit Feedback</Text>
              <SpringButton onPress={() => { onClose(); resetForm(); }}>
                <Ionicons name="close-circle" size={28} color={C.slate} />
              </SpringButton>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Batch picker */}
              <Text style={S.label}>Select Batch *</Text>
              <View style={styles.batchPicker}>
                {batches.length === 0
                  ? <Text style={{ color: C.slate, fontSize: 12, padding: 10 }}>No completed batches found</Text>
                  : batches.map(b => (
                    <TouchableOpacity key={b.batch_id} onPress={() => f('batch_id', b.batch_id)} activeOpacity={0.8}
                      style={[styles.batchOption, form.batch_id == b.batch_id && styles.batchOptionActive]}>
                      <Text style={[styles.batchOptionText, form.batch_id == b.batch_id && { color: '#fff' }]}>{b.batch_code}</Text>
                      <Text style={[styles.batchOptionSub,  form.batch_id == b.batch_id && { color: 'rgba(255,255,255,0.75)' }]}>{b.completed_date}</Text>
                    </TouchableOpacity>
                  ))
                }
              </View>

              {/* Name */}
              <ClayInput label="Your Name *" value={form.user_name} onChangeText={v => f('user_name', v)} placeholder="Enter your name" />

              {/* Star rating */}
              <Text style={S.label}>Overall Rating *</Text>
              <View style={styles.starsRow}>
                {[1,2,3,4,5].map(n => (
                  <TouchableOpacity key={n} onPress={() => f('rating', String(n))} activeOpacity={0.7}>
                    <Ionicons name={parseInt(form.rating) >= n ? 'star' : 'star-outline'} size={36} color={parseInt(form.rating) >= n ? '#F0A04B' : C.cloud} style={{ marginRight: 6 }} />
                  </TouchableOpacity>
                ))}
                <Text style={styles.ratingHint}>{['','Poor','Fair','Good','Very Good','Excellent'][form.rating]}</Text>
              </View>

              {/* Three sections */}
              <View style={styles.sectionBox}>
                <View style={styles.sectionBoxHeader}>
                  <Ionicons name="chatbubble-outline" size={14} color={C.teal} />
                  <Text style={[styles.sectionBoxTitle, { color: C.teal }]}>Comments & Observations</Text>
                </View>
                <ClayInput value={form.comments} onChangeText={v => f('comments', v)} placeholder="e.g. Film quality, appearance, flexibility..." multiline />
              </View>

              <View style={styles.sectionBox}>
                <View style={styles.sectionBoxHeader}>
                  <Ionicons name="bug-outline" size={14} color={C.error} />
                  <Text style={[styles.sectionBoxTitle, { color: C.error }]}>Bug Report / Issues</Text>
                </View>
                <ClayInput value={form.bug_report} onChangeText={v => f('bug_report', v)} placeholder="e.g. Filtration took longer, air bubbles in film..." multiline />
              </View>

              <View style={styles.sectionBox}>
                <View style={styles.sectionBoxHeader}>
                  <Ionicons name="bulb-outline" size={14} color={C.warning} />
                  <Text style={[styles.sectionBoxTitle, { color: C.warning }]}>Feature Requests</Text>
                </View>
                <ClayInput value={form.feature_request} onChangeText={v => f('feature_request', v)} placeholder="e.g. Temperature alerts, stage notifications..." multiline />
              </View>

              <Text style={styles.hint}>* Fill at least one feedback section</Text>

              <SpringButton onPress={submit} disabled={loading} style={{ marginTop: 8, marginBottom: 16 }}>
                <LinearGradient colors={[C.tealLight, C.ocean]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.modalSubmitBtn}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={S.modalSubmitText}>Submit Feedback</Text>}
                </LinearGradient>
              </SpringButton>
            </ScrollView>
          </Card>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  batchPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  batchOption: {
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10,
    backgroundColor: 'rgba(237,242,244,0.9)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)',
  },
  batchOptionActive: { backgroundColor: C.teal, borderColor: C.teal },
  batchOptionText:   { fontSize: 12, fontWeight: '700', color: C.charcoal },
  batchOptionSub:    { fontSize: 10, color: C.steel, marginTop: 1 },

  starsRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 4 },
  ratingHint:  { fontSize: 12, fontWeight: '700', color: C.steel, marginLeft: 6 },

  sectionBox: {
    backgroundColor: 'rgba(237,242,244,0.6)',
    borderRadius: 14, padding: 12, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  sectionBoxHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  sectionBoxTitle:  { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },

  hint: { fontSize: 11, color: C.slate, textAlign: 'center', marginBottom: 8 },
});