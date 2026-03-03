import React, { useState } from 'react';
import { View, Text, Modal, ScrollView, KeyboardAvoidingView, Alert, ActivityIndicator, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Card, CardAccent, ClayInput } from '../components/Card';
import SpringButton from '../components/SpringButton';
import { C, S } from '../constants/theme';
import { API_URL } from '../constants/api';

const today = new Date().toISOString().split('T')[0];

export default function AddInventoryModal({ visible, onClose, onSuccess }) {
  const [type, setType]     = useState('fish_scales');
  const [loading, setLoading] = useState(false);
  const [form, setForm]     = useState({
    fish_scale_type: '', source_location: '', quantity_kg: '', date_collected: today,
    additive_name: '', quantity_ml: '', minimum_level: '500', last_restocked: today,
  });
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    setLoading(true);
    try {
      const payload = type === 'fish_scales'
        ? { item_type: 'fish_scales', fish_scale_type: form.fish_scale_type, source_location: form.source_location, quantity_kg: form.quantity_kg, date_collected: form.date_collected }
        : { item_type: 'additive', additive_name: form.additive_name, quantity_ml: form.quantity_ml, minimum_level: form.minimum_level, last_restocked: form.last_restocked };
      const res = await axios.post(`${API_URL}/add_material.php`, payload);
      if (res.data.success) { onSuccess?.(); onClose(); }
      else Alert.alert('Error', res.data.message);
    } catch { Alert.alert('Error', 'Could not save. Check connection.'); }
    finally { setLoading(false); }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={S.modalOverlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
          <Card style={S.modalCard}>
            <CardAccent />

            {/* Header */}
            <View style={S.modalHeader}>
              <Text style={S.modalTitle}>Add to Inventory</Text>
              <SpringButton onPress={onClose}>
                <Ionicons name="close-circle" size={28} color={C.slate} />
              </SpringButton>
            </View>

            {/* Type toggle — fixed: explicit bg + text colors */}
            <View style={styles.toggleRow}>
              {[
                { key: 'fish_scales', label: 'Fish Scales',       icon: 'fish-outline'  },
                { key: 'additive',    label: 'Process Materials', icon: 'flask-outline' },
              ].map(t => {
                const active = type === t.key;
                return (
                  <TouchableOpacity key={t.key} onPress={() => setType(t.key)} style={[styles.toggleBtn, active && styles.toggleBtnActive]} activeOpacity={0.8}>
                    <Ionicons name={t.icon} size={14} color={active ? '#fff' : C.slate} />
                    <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{t.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {type === 'fish_scales' ? (
                <>
                  <ClayInput label="Fish Scale Type *"  value={form.fish_scale_type}  onChangeText={v => f('fish_scale_type', v)}  placeholder="e.g. Tilapia, Bangus" />
                  <ClayInput label="Source Location *"  value={form.source_location}  onChangeText={v => f('source_location', v)}  placeholder="e.g. Laguna Fish Market" />
                  <ClayInput label="Quantity (kg) *"    value={form.quantity_kg}      onChangeText={v => f('quantity_kg', v)}      placeholder="0.00" keyboardType="decimal-pad" />
                  <ClayInput label="Date Collected *"   value={form.date_collected}   onChangeText={v => f('date_collected', v)}   placeholder="YYYY-MM-DD" />
                </>
              ) : (
                <>
                  <ClayInput label="Material Name *"        value={form.additive_name}  onChangeText={v => f('additive_name', v)}  placeholder="e.g. Glycerol, Sorbitol" />
                  <ClayInput label="Quantity (mL) *"        value={form.quantity_ml}    onChangeText={v => f('quantity_ml', v)}    placeholder="0.00" keyboardType="decimal-pad" />
                  <ClayInput label="Min Stock Level (mL) *" value={form.minimum_level}  onChangeText={v => f('minimum_level', v)}  placeholder="500"  keyboardType="decimal-pad" />
                  <ClayInput label="Last Restocked *"       value={form.last_restocked} onChangeText={v => f('last_restocked', v)} placeholder="YYYY-MM-DD" />
                </>
              )}

              <SpringButton onPress={submit} disabled={loading} style={{ marginTop: 8, marginBottom: 8 }}>
                <LinearGradient colors={[C.tealLight, C.ocean]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.modalSubmitBtn}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={S.modalSubmitText}>Add to Inventory</Text>}
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
  toggleRow: {
    flexDirection: 'row', gap: 8, marginBottom: 18,
    backgroundColor: 'rgba(237,242,244,0.8)',
    borderRadius: 14, padding: 5,
  },
  toggleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: C.teal,
    elevation: 4,
  },
  toggleText:       { fontSize: 11, fontWeight: '700', color: C.slate, flexShrink: 1 },
  toggleTextActive: { fontSize: 11, fontWeight: '800', color: '#fff' },
});