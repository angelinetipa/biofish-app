import React, { useState } from 'react';
import { View, Text, Modal, KeyboardAvoidingView, Alert, ActivityIndicator, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Card, CardAccent, ClayInput } from '../components/Card';
import SpringButton from '../components/SpringButton';
import { C, S } from '../constants/theme';
import { API_URL } from '../constants/api';

export default function AddInventoryModal({ visible, onClose, onSuccess }) {
  const [type, setType] = useState('fish_scales');
  const [form, setForm] = useState({ fish_scale_type: '', source_location: '', quantity_kg: '', additive_name: '', quantity_ml: '', minimum_level: '500' });
  const [loading, setLoading] = useState(false);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    setLoading(true);
    try {
      const payload = type === 'fish_scales'
        ? { item_type: 'fish_scales', fish_scale_type: form.fish_scale_type, source_location: form.source_location, quantity_kg: form.quantity_kg, date_collected: new Date().toISOString().split('T')[0] }
        : { item_type: 'additive', additive_name: form.additive_name, quantity_ml: form.quantity_ml, minimum_level: form.minimum_level };
      const res = await axios.post(`${API_URL}/add_material.php`, payload);
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
              <Text style={S.modalTitle}>Add to Inventory</Text>
              <SpringButton onPress={onClose}><Ionicons name="close-circle" size={28} color={C.slate} /></SpringButton>
            </View>
            <View style={S.toggleRow}>
              {['fish_scales', 'additive'].map(t => (
                <SpringButton key={t} onPress={() => setType(t)} style={{ flex: 1 }}>
                  <View style={[S.toggleBtn, type === t && S.toggleBtnActive]}>
                    <Text style={[S.toggleText, type === t && S.toggleTextActive]}>{t === 'fish_scales' ? 'Fish Scales' : 'Additive'}</Text>
                  </View>
                </SpringButton>
              ))}
            </View>
            {type === 'fish_scales' ? (
              <>
                <ClayInput label="Fish Scale Type" value={form.fish_scale_type} onChangeText={v => f('fish_scale_type', v)} placeholder="e.g. Tilapia, Bangus" />
                <ClayInput label="Source Location"  value={form.source_location}  onChangeText={v => f('source_location', v)}  placeholder="e.g. Laguna Fish Market" />
                <ClayInput label="Quantity (kg)"    value={form.quantity_kg}      onChangeText={v => f('quantity_kg', v)}      placeholder="0.00" keyboardType="decimal-pad" />
              </>
            ) : (
              <>
                <ClayInput label="Material Name"        value={form.additive_name}  onChangeText={v => f('additive_name', v)}  placeholder="e.g. Glycerol, Sorbitol" />
                <ClayInput label="Quantity (mL)"        value={form.quantity_ml}    onChangeText={v => f('quantity_ml', v)}    placeholder="0.00" keyboardType="decimal-pad" />
                <ClayInput label="Min Stock Level (mL)" value={form.minimum_level}  onChangeText={v => f('minimum_level', v)}  placeholder="500"  keyboardType="decimal-pad" />
              </>
            )}
            <SpringButton onPress={submit} disabled={loading} style={{ marginTop: 4 }}>
              <LinearGradient colors={[C.tealLight, C.ocean]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.modalSubmitBtn}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={S.modalSubmitText}>Add to Inventory</Text>}
              </LinearGradient>
            </SpringButton>
          </Card>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}