import React, { useState, useEffect } from 'react';
import { View, Text, Modal, ScrollView, KeyboardAvoidingView, Alert, ActivityIndicator, Platform, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Card, CardAccent } from '../components/Card';
import SpringButton from '../components/SpringButton';
import { C, S } from '../constants/theme';
import { API_URL } from '../constants/api';

export default function StartBatchModal({ visible, onClose, onSuccess, demoMode, demoCommand }) {
  const [loading,    setLoading]    = useState(false);
  const [fetching,   setFetching]   = useState(false);
  const [batchCode,  setBatchCode]  = useState('');
  const [materials,  setMaterials]  = useState([]);
  const [additives,  setAdditives]  = useState([]);
  const [selMats,    setSelMats]    = useState({});  // { material_id: qty_string }
  const [selAdds,    setSelAdds]    = useState({});  // { additive_id: qty_string }

  useEffect(() => {
    if (visible) loadFormData();
  }, [visible]);

  const loadFormData = async () => {
    if (demoMode) {
        // In demo mode: use fake data, no DB check
        setBatchCode('DEMO-' + Date.now().toString().slice(-4));
        setMaterials([{ material_id: 1, fish_scale_type: 'Tilapia', quantity_kg: 10 }]);
        setAdditives([{ additive_id: 1, additive_name: 'Glycerol', quantity_ml: 500 }]);
        setSelMats({});
        setSelAdds({});
        return;
    }
    setFetching(true);
    try {
        const res = await axios.get(`${API_URL}/get_batch_form_data.php`);
        if (res.data.busy) {
        Alert.alert('Machine Busy', 'A batch is already running or paused.');
        onClose(); return;
        }
        setBatchCode(res.data.batch_code);
        setMaterials(res.data.materials);
        setAdditives(res.data.additives);
        setSelMats({});
        setSelAdds({});
    } catch { Alert.alert('Error', 'Could not load form data.'); onClose(); }
    finally { setFetching(false); }
};

  const toggleMat = (id) => {
    setSelMats(p => {
      const n = { ...p };
      if (n[id] !== undefined) delete n[id];
      else n[id] = '';
      return n;
    });
  };

  const toggleAdd = (id) => {
    setSelAdds(p => {
      const n = { ...p };
      if (n[id] !== undefined) delete n[id];
      else n[id] = '';
      return n;
    });
  };

  const submit = async () => {
    const selectedMats = Object.entries(selMats).filter(([_, q]) => parseFloat(q) > 0);
    const selectedAdds = Object.entries(selAdds).filter(([_, q]) => parseFloat(q) > 0);

    if (selectedMats.length === 0) return Alert.alert('Error', 'Select at least one fish scale material with quantity.');
    if (selectedAdds.length === 0) return Alert.alert('Error', 'Select at least one process material with quantity.');

    if (demoMode) {
        demoCommand('start');
        onSuccess?.();
        onClose();
        return;
    }
    setLoading(true);
    try {
      const payload = {
        batch_code: batchCode,
        materials: selectedMats.map(([id, qty]) => ({ material_id: parseInt(id), quantity_used: parseFloat(qty) })),
        additives: selectedAdds.map(([id, qty]) => ({ additive_id: parseInt(id), quantity_used: parseFloat(qty) })),
      };
    const res = await axios.post(`${API_URL}/start_batch.php`, payload);
    if (res.data.success) {
        Alert.alert('Started!', `${res.data.batch_code} is now running.`);
        onSuccess?.(res.data.batch_id); // ← pass up
        onClose();
    } else {
        Alert.alert('Error', res.data.message);
    }
    } catch { Alert.alert('Error', 'Could not start batch. Check connection.'); }
    finally { setLoading(false); }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={S.modalOverlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
          <Card style={S.modalCard}>
            <CardAccent />
            <View style={S.modalHeader}>
              <Text style={S.modalTitle}>Start New Batch</Text>
              <SpringButton onPress={onClose}>
                <Ionicons name="close-circle" size={28} color={C.slate} />
              </SpringButton>
            </View>

            {fetching ? (
              <View style={styles.center}>
                <ActivityIndicator color={C.teal} size="large" />
                <Text style={styles.loadingText}>Loading form data...</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 500 }}>

                {/* Batch code */}
                <Text style={S.label}>Batch Code</Text>
                <View style={styles.batchCodeRow}>
                  <TextInput
                    style={[S.input, { flex: 1 }]}
                    value={batchCode}
                    onChangeText={setBatchCode}
                    placeholderTextColor={C.slate}
                  />
                </View>

                {/* Fish scales */}
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIcon, { backgroundColor: 'rgba(78,205,196,0.12)' }]}>
                    <Ionicons name="fish" size={14} color={C.teal} />
                  </View>
                  <Text style={styles.sectionTitle}>Fish Scale Materials *</Text>
                </View>

                {materials.length === 0
                  ? <Text style={styles.noStock}>No available fish scale materials</Text>
                  : materials.map(m => {
                    const selected = selMats[m.material_id] !== undefined;
                    return (
                      <View key={m.material_id} style={[styles.itemRow, selected && styles.itemRowActive]}>
                        <TouchableOpacity onPress={() => toggleMat(m.material_id)} style={styles.itemLeft} activeOpacity={0.8}>
                          <View style={[styles.checkbox, selected && styles.checkboxActive]}>
                            {selected && <Ionicons name="checkmark" size={12} color="#fff" />}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.itemName}>{m.fish_scale_type}</Text>
                            <Text style={styles.itemSub}>{m.source_location} · {parseFloat(m.quantity_kg).toFixed(2)} kg available</Text>
                          </View>
                        </TouchableOpacity>
                        {selected && (
                          <TextInput
                            style={styles.qtyInput}
                            value={selMats[m.material_id]}
                            onChangeText={v => setSelMats(p => ({ ...p, [m.material_id]: v }))}
                            placeholder="kg"
                            placeholderTextColor={C.slate}
                            keyboardType="decimal-pad"
                          />
                        )}
                      </View>
                    );
                  })
                }

                {/* Process materials */}
                <View style={[styles.sectionHeader, { marginTop: 16 }]}>
                  <View style={[styles.sectionIcon, { backgroundColor: 'rgba(91,155,213,0.12)' }]}>
                    <Ionicons name="flask" size={14} color={C.info} />
                  </View>
                  <Text style={styles.sectionTitle}>Process Materials *</Text>
                </View>

                {additives.length === 0
                  ? <Text style={styles.noStock}>No process materials available</Text>
                  : additives.map(a => {
                    const selected   = selAdds[a.additive_id] !== undefined;
                    const isDepleted = parseFloat(a.quantity_ml) <= 0;
                    return (
                      <View key={a.additive_id} style={[styles.itemRow, selected && styles.itemRowActive, isDepleted && styles.itemRowDisabled]}>
                        <TouchableOpacity onPress={() => !isDepleted && toggleAdd(a.additive_id)} style={styles.itemLeft} activeOpacity={0.8}>
                          <View style={[styles.checkbox, selected && styles.checkboxActive, isDepleted && styles.checkboxDisabled]}>
                            {selected && <Ionicons name="checkmark" size={12} color="#fff" />}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.itemName, isDepleted && { color: C.slate }]}>{a.additive_name}</Text>
                            <Text style={styles.itemSub}>{parseFloat(a.quantity_ml).toFixed(0)} mL available</Text>
                          </View>
                        </TouchableOpacity>
                        {selected && (
                          <TextInput
                            style={styles.qtyInput}
                            value={selAdds[a.additive_id]}
                            onChangeText={v => setSelAdds(p => ({ ...p, [a.additive_id]: v }))}
                            placeholder="mL"
                            placeholderTextColor={C.slate}
                            keyboardType="decimal-pad"
                          />
                        )}
                      </View>
                    );
                  })
                }

                <SpringButton onPress={submit} disabled={loading} style={{ marginTop: 20, marginBottom: 16 }}>
                  <LinearGradient colors={['#43C6AC', '#2A7A6B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.modalSubmitBtn}>
                    {loading
                      ? <ActivityIndicator color="#fff" />
                      : <>
                          <Ionicons name="play" size={16} color="#fff" />
                          <Text style={S.modalSubmitText}>Start Batch</Text>
                        </>
                    }
                  </LinearGradient>
                </SpringButton>
              </ScrollView>
            )}
          </Card>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  center:       { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText:  { fontSize: 13, color: C.steel },
  batchCodeRow: { marginBottom: 16 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionIcon:   { width: 26, height: 26, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  sectionTitle:  { fontSize: 12, fontWeight: '800', color: C.deep, textTransform: 'uppercase', letterSpacing: 0.4 },
  noStock:       { fontSize: 12, color: C.slate, fontStyle: 'italic', marginBottom: 10 },

  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(237,242,244,0.7)',
    borderRadius: 12, padding: 10, marginBottom: 8,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)',
  },
  itemRowActive:   { borderColor: C.teal, backgroundColor: 'rgba(78,205,196,0.06)' },
  itemRowDisabled: { opacity: 0.45 },
  itemLeft:        { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  checkbox:        { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: C.cloud, alignItems: 'center', justifyContent: 'center' },
  checkboxActive:  { backgroundColor: C.teal, borderColor: C.teal },
  checkboxDisabled:{ borderColor: C.cloud, backgroundColor: C.cloud },
  itemName:        { fontSize: 13, fontWeight: '700', color: C.charcoal },
  itemSub:         { fontSize: 11, color: C.steel, marginTop: 1 },
  qtyInput: {
    width: 70, backgroundColor: '#fff',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
    fontSize: 13, fontWeight: '700', color: C.charcoal,
    borderWidth: 1.5, borderColor: C.teal, textAlign: 'center',
  },
});