import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, RefreshControl,
  Alert, ActivityIndicator, Platform, TextInput,
  KeyboardAvoidingView, Modal, TouchableOpacity, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import SpringButton from '../components/SpringButton';
import { API_URL } from '../constants/api';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  deep: '#2C6B7F', ocean: '#3A7CA5', teal: '#4ECDC4', tealLight: '#5DD9D2',
  steel: '#627D98', charcoal: '#3E4C59', snow: '#F8FAFB', slate: '#8B9DAF',
  mist: '#EDF2F4', cloud: '#D9E2EC',
  success: '#4CAF50', warning: '#F0A04B', error: '#C0544A', info: '#5B9BD5',
};

// ─── Shared components ────────────────────────────────────────────────────────
function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function CardAccent() {
  return (
    <LinearGradient
      colors={['transparent', C.teal, C.ocean, C.teal, 'transparent']}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
      style={styles.cardAccent}
    />
  );
}

function Badge({ status }) {
  const map = {
    completed:  { bg: 'rgba(76,175,80,0.12)',   text: '#2E7D32' },
    running:    { bg: 'rgba(78,205,196,0.18)',   text: C.teal    },
    paused:     { bg: 'rgba(240,160,75,0.18)',   text: '#B36B00' },
    stopped:    { bg: 'rgba(192,84,74,0.15)',    text: C.error   },
    cleaning:   { bg: 'rgba(91,155,213,0.18)',   text: C.info    },
    available:  { bg: 'rgba(76,175,80,0.12)',    text: '#2E7D32' },
    ok:         { bg: 'rgba(76,175,80,0.12)',    text: '#2E7D32' },
    low_stock:  { bg: 'rgba(240,160,75,0.18)',   text: '#B36B00' },
    low:        { bg: 'rgba(240,160,75,0.18)',   text: '#B36B00' },
    depleted:   { bg: 'rgba(192,84,74,0.15)',    text: C.error   },
  };
  const s = map[status] || { bg: 'rgba(139,157,175,0.12)', text: C.slate };
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.text }]}>
        {status?.replace(/_/g, ' ').toUpperCase()}
      </Text>
    </View>
  );
}

// Control button — no emojis, Ionicons
function ControlBtn({ label, iconName, colors: gc, onPress, disabled }) {
  return (
    <SpringButton onPress={onPress} disabled={disabled} style={styles.ctrlWrap}>
      <LinearGradient colors={gc} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctrlBtn}>
        <Ionicons name={iconName} size={22} color="#fff" />
        <Text style={styles.ctrlLabel}>{label}</Text>
      </LinearGradient>
    </SpringButton>
  );
}

// Simple clay input
function ClayInput({ label, value, onChangeText, placeholder, keyboardType, multiline }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <TextInput
        style={[styles.modalInput, focused && styles.modalInputFocused, multiline && { height: 80, textAlignVertical: 'top' }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.slate}
        keyboardType={keyboardType || 'default'}
        multiline={multiline}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}

// ─── Add Inventory Modal ──────────────────────────────────────────────────────
function AddInventoryModal({ visible, onClose, onSuccess }) {
  const [type, setType] = useState('fish_scales');
  const [form, setForm] = useState({
    fish_scale_type: '', source_location: '', quantity_kg: '',
    additive_name: '', quantity_ml: '', minimum_level: '500',
  });
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
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Card style={styles.modalCard}>
            <CardAccent />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add to Inventory</Text>
              <SpringButton onPress={onClose}>
                <Ionicons name="close-circle" size={28} color={C.slate} />
              </SpringButton>
            </View>

            {/* Type toggle */}
            <View style={styles.toggleRow}>
              {['fish_scales', 'additive'].map(t => (
                <SpringButton key={t} onPress={() => setType(t)} style={{ flex: 1 }}>
                  <View style={[styles.toggleBtn, type === t && styles.toggleBtnActive]}>
                    <Text style={[styles.toggleText, type === t && styles.toggleTextActive]}>
                      {t === 'fish_scales' ? 'Fish Scales' : 'Additive'}
                    </Text>
                  </View>
                </SpringButton>
              ))}
            </View>

            {type === 'fish_scales' ? (
              <>
                <ClayInput label="Fish Scale Type" value={form.fish_scale_type} onChangeText={v => f('fish_scale_type', v)} placeholder="e.g. Tilapia, Bangus" />
                <ClayInput label="Source Location" value={form.source_location} onChangeText={v => f('source_location', v)} placeholder="e.g. Laguna Fish Market" />
                <ClayInput label="Quantity (kg)" value={form.quantity_kg} onChangeText={v => f('quantity_kg', v)} placeholder="0.00" keyboardType="decimal-pad" />
              </>
            ) : (
              <>
                <ClayInput label="Material Name" value={form.additive_name} onChangeText={v => f('additive_name', v)} placeholder="e.g. Glycerol, Sorbitol" />
                <ClayInput label="Quantity (mL)" value={form.quantity_ml} onChangeText={v => f('quantity_ml', v)} placeholder="0.00" keyboardType="decimal-pad" />
                <ClayInput label="Min Stock Level (mL)" value={form.minimum_level} onChangeText={v => f('minimum_level', v)} placeholder="500" keyboardType="decimal-pad" />
              </>
            )}

            <SpringButton onPress={submit} disabled={loading} style={{ marginTop: 4 }}>
              <LinearGradient colors={[C.tealLight, C.ocean]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.modalSubmitBtn}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalSubmitText}>Add to Inventory</Text>}
              </LinearGradient>
            </SpringButton>
          </Card>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ─── Add Feedback Modal ───────────────────────────────────────────────────────
function AddFeedbackModal({ visible, onClose, onSuccess, batches }) {
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
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Card style={styles.modalCard}>
            <CardAccent />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Feedback</Text>
              <SpringButton onPress={onClose}>
                <Ionicons name="close-circle" size={28} color={C.slate} />
              </SpringButton>
            </View>

            <ClayInput label="Batch Code" value={form.batch_code} onChangeText={v => f('batch_code', v)} placeholder="e.g. BATCH-001" />

            {/* Star rating */}
            <Text style={styles.inputLabel}>Rating</Text>
            <View style={styles.ratingRow}>
              {[1,2,3,4,5].map(n => (
                <SpringButton key={n} onPress={() => f('rating', String(n))}>
                  <Ionicons
                    name={parseInt(form.rating) >= n ? 'star' : 'star-outline'}
                    size={32} color={parseInt(form.rating) >= n ? '#F0A04B' : C.cloud}
                    style={{ marginRight: 4 }}
                  />
                </SpringButton>
              ))}
            </View>

            <ClayInput label="Comments" value={form.comments} onChangeText={v => f('comments', v)} placeholder="Quality notes, observations..." multiline />

            <SpringButton onPress={submit} disabled={loading} style={{ marginTop: 4 }}>
              <LinearGradient colors={[C.tealLight, C.ocean]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.modalSubmitBtn}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalSubmitText}>Submit Feedback</Text>}
              </LinearGradient>
            </SpringButton>
          </Card>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ─── Tab screens ──────────────────────────────────────────────────────────────
function DashboardTab({ dashboardData, controlling, sendCommand }) {
  const status = dashboardData.machineStatus || 'idle';
  const statusColor = { idle: C.slate, running: C.success, paused: C.warning, stopped: C.error, cleaning: C.info }[status] || C.slate;

  const controls = () => {
    if (status === 'cleaning') return (
      <ControlBtn label="End Cleaning" iconName="checkmark-circle" colors={[C.tealLight, C.ocean]} onPress={() => sendCommand('end_cleaning')} disabled={controlling} />
    );
    return (
      <>
        {/* Start — visible when idle */}
        {status === 'idle' && (
          <ControlBtn label="Start" iconName="play" colors={['#43C6AC', '#2A7A6B']} onPress={() => sendCommand('start')} disabled={controlling} />
        )}
        {/* Pause — visible when running */}
        {status === 'running' && (
          <ControlBtn label="Pause" iconName="pause" colors={['#E8A020', '#B36B00']} onPress={() => sendCommand('pause')} disabled={controlling} />
        )}
        {/* Continue — visible when paused */}
        {status === 'paused' && (
          <ControlBtn label="Continue" iconName="play-forward" colors={['#43C6AC', '#2A7A6B']} onPress={() => sendCommand('continue')} disabled={controlling} />
        )}
        {/* Stop — visible when running or paused */}
        {(status === 'running' || status === 'paused') && (
          <ControlBtn label="Stop" iconName="stop" colors={['#C05040', '#8B2020']} onPress={() => sendCommand('stop')} disabled={controlling} />
        )}
        {/* Cleaning — visible when idle */}
        {status === 'idle' && (
          <ControlBtn label="Cleaning" iconName="water" colors={['#5B9BD5', '#2E6DA4']} onPress={() => sendCommand('cleaning')} disabled={controlling} />
        )}
      </>
    );
  };

  return (
    <>
      {/* Machine status */}
      <Card style={styles.statusCard}>
        <CardAccent />
        <View style={styles.statusRow}>
          <View>
            <Text style={styles.statusLabel}>MACHINE STATUS</Text>
            <View style={styles.statusValueRow}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusValue, { color: statusColor }]}>{status.toUpperCase()}</Text>
            </View>
            {dashboardData.currentBatch && <Text style={styles.batchCode}>Batch: {dashboardData.currentBatch}</Text>}
            {dashboardData.currentStage && (
              <Text style={styles.batchStage}>{dashboardData.currentStage.replace(/_/g, ' ').toUpperCase()}</Text>
            )}
          </View>
          {controlling && <ActivityIndicator color={C.teal} size="large" />}
        </View>
        <View style={styles.ctrlRow}>{controls()}</View>
      </Card>

      {/* Metrics */}
      <View style={styles.metricsGrid}>
        {[
          { icon: 'layers',         label: 'Batches',   value: dashboardData.totalBatches },
          { icon: 'checkmark-done', label: 'Success',   value: `${dashboardData.successRate}%` },
          { icon: 'time',           label: 'Avg Time',  value: `${dashboardData.avgTime}m` },
          { icon: 'warning',        label: 'Low Stock', value: dashboardData.lowStock },
        ].map((m, i) => (
          <Card key={i} style={styles.metricCard}>
            <Ionicons name={m.icon} size={22} color={C.ocean} style={{ marginBottom: 6 }} />
            <Text style={styles.metricValue}>{m.value}</Text>
            <Text style={styles.metricLabel}>{m.label}</Text>
          </Card>
        ))}
      </View>
    </>
  );
}

function BatchesTab({ batches }) {
  return (
    <Card>
      <View style={styles.tabContentPad}>
        <Text style={styles.sectionTitle}>Recent Batches</Text>
        {batches.length === 0
          ? <Text style={styles.emptyText}>No batches yet</Text>
          : batches.map((b, i) => (
            <View key={i} style={styles.listRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle}>{b.batch_code}</Text>
                <Text style={styles.listSub}>{b.current_stage || b.stage} · {b.start_time || b.date}</Text>
              </View>
              <Badge status={b.status} />
            </View>
          ))}
      </View>
    </Card>
  );
}

function InventoryTab({ materials, onAdd }) {
  return (
    <Card>
      <View style={styles.tabContentPad}>
        <View style={styles.tabTitleRow}>
          <Text style={styles.sectionTitle}>Inventory</Text>
          <SpringButton onPress={onAdd}>
            <LinearGradient colors={[C.tealLight, C.ocean]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.addBtn}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.addBtnText}>Add</Text>
            </LinearGradient>
          </SpringButton>
        </View>
        {materials.length === 0
          ? <Text style={styles.emptyText}>No materials yet</Text>
          : materials.map((m, i) => (
            <View key={i} style={styles.listRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle}>{m.name || m.fish_scale_type || m.additive_name}</Text>
                <Text style={styles.listSub}>{m.quantity}{m.unit ? ` ${m.unit}` : m.quantity_kg ? ` kg` : ` mL`}</Text>
              </View>
              <Badge status={m.status} />
            </View>
          ))}
      </View>
    </Card>
  );
}

function FeedbackTab({ feedback, onAdd }) {
  return (
    <Card>
      <View style={styles.tabContentPad}>
        <View style={styles.tabTitleRow}>
          <Text style={styles.sectionTitle}>Feedback</Text>
          <SpringButton onPress={onAdd}>
            <LinearGradient colors={[C.tealLight, C.ocean]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.addBtn}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.addBtnText}>Add</Text>
            </LinearGradient>
          </SpringButton>
        </View>
        {feedback.length === 0
          ? <Text style={styles.emptyText}>No feedback yet</Text>
          : feedback.map((f, i) => (
            <View key={i} style={styles.listRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle}>{f.batch_code}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Ionicons key={s} name={s < f.rating ? 'star' : 'star-outline'} size={12} color={s < f.rating ? '#F0A04B' : C.cloud} />
                  ))}
                  <Text style={styles.listSub}> · {f.date}</Text>
                </View>
                {f.comments && <Text style={styles.listComment} numberOfLines={2}>{f.comments}</Text>}
              </View>
            </View>
          ))}
      </View>
    </Card>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'home',       iconActive: 'home'             },
  { key: 'batches',   label: 'Batches',   icon: 'list-outline',       iconActive: 'list'             },
  { key: 'inventory', label: 'Inventory', icon: 'layers-outline',     iconActive: 'layers'           },
  { key: 'feedback',  label: 'Feedback',  icon: 'chatbubble-outline', iconActive: 'chatbubble'       },
];

export default function DashboardScreen({
  dashboardData, batches, materials, feedback,
  activeTab, setActiveTab, refreshing, onRefresh, onLogout, onDashboardUpdate,
}) {
  const [controlling, setControlling] = useState(false);
  const [showAddInventory, setShowAddInventory] = useState(false);
  const [showAddFeedback, setShowAddFeedback]   = useState(false);

  const sendCommand = (command) => {
    const confirmCmds = {
      stop:     { title: 'Stop Machine',     msg: 'This will terminate the current batch. It cannot be resumed.', btn: 'Stop' },
      cleaning: { title: 'Start Cleaning',   msg: 'Make sure the machine is empty before proceeding.',            btn: 'Start' },
    };
    if (confirmCmds[command]) {
      const { title, msg, btn } = confirmCmds[command];
      Alert.alert(title, msg, [
        { text: 'Cancel', style: 'cancel' },
        { text: btn, style: command === 'stop' ? 'destructive' : 'default', onPress: () => executeCommand(command) },
      ]);
    } else {
      executeCommand(command);
    }
  };

  const executeCommand = async (command) => {
    setControlling(true);
    try {
      const res = await axios.post(`${API_URL}/control.php`, { command });
      if (res.data.success) onDashboardUpdate?.();
      else Alert.alert('Error', res.data.message || 'Command failed');
    } catch {
      Alert.alert('Error', 'Could not reach machine.');
    } finally {
      setControlling(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab dashboardData={dashboardData} controlling={controlling} sendCommand={sendCommand} />;
      case 'batches':   return <BatchesTab   batches={batches}   />;
      case 'inventory': return <InventoryTab materials={materials} onAdd={() => setShowAddInventory(true)} />;
      case 'feedback':  return <FeedbackTab  feedback={feedback}   onAdd={() => setShowAddFeedback(true)}  />;
    }
  };

  return (
    <LinearGradient colors={['#4ECDC4', '#3A7CA5', '#2C6B7F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerLogo}><Text style={{ fontSize: 18 }}>🐟</Text></View>
          <Text style={styles.headerTitle}>BIO-FISH</Text>
        </View>
        <SpringButton onPress={onLogout}>
          <View style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={16} color={C.ocean} />
            <Text style={styles.logoutText}>Logout</Text>
          </View>
        </SpringButton>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        {renderContent()}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom tab bar */}
      <View style={styles.tabBar}>
        {TABS.map(tab => {
          const active = activeTab === tab.key;
          return (
            <SpringButton key={tab.key} onPress={() => setActiveTab(tab.key)} style={{ flex: 1 }}>
              <View style={[styles.tabItem, active && styles.tabItemActive]}>
                {active && <LinearGradient colors={[C.tealLight, C.ocean]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tabActivePill} />}
                <Ionicons name={active ? tab.iconActive : tab.icon} size={22} color={active ? C.teal : C.slate} />
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
              </View>
            </SpringButton>
          );
        })}
      </View>

      {/* Modals */}
      <AddInventoryModal visible={showAddInventory} onClose={() => setShowAddInventory(false)} onSuccess={onDashboardUpdate} />
      <AddFeedbackModal  visible={showAddFeedback}  onClose={() => setShowAddFeedback(false)}  onSuccess={onDashboardUpdate} batches={batches} />
    </LinearGradient>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight || 24) + 12,
    paddingBottom: 14, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(248,250,251,0.97)',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    shadowColor: '#ffffff', shadowOffset: { width: -6, height: -6 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', borderTopWidth: 0,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerLogo: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: C.teal,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#ffffff', shadowOffset: { width: -3, height: -3 }, shadowOpacity: 0.6, shadowRadius: 8, elevation: 6,
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: C.deep, letterSpacing: 0.5 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 7, paddingHorizontal: 12,
    backgroundColor: 'rgba(78,205,196,0.1)', borderRadius: 20,
    borderWidth: 1.5, borderColor: 'rgba(78,205,196,0.35)',
  },
  logoutText: { fontSize: 12, fontWeight: '700', color: C.ocean },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 14 },

  card: {
    backgroundColor: 'rgba(248,250,251,0.97)', borderRadius: 20,
    shadowColor: '#ffffff', shadowOffset: { width: -6, height: -6 }, shadowOpacity: 0.55, shadowRadius: 18, elevation: 10,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.88)',
  },
  cardAccent: {
    position: 'absolute', top: 0, left: '5%', right: '5%',
    height: 3, borderRadius: 99, opacity: 0.75,
  },

  statusCard: { padding: 20, paddingTop: 24 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
  statusLabel: { fontSize: 10, fontWeight: '800', color: C.steel, letterSpacing: 0.8, marginBottom: 6 },
  statusValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusValue: { fontSize: 26, fontWeight: '900', letterSpacing: 0.5 },
  batchCode: { fontSize: 12, color: C.steel, fontWeight: '600', marginTop: 2 },
  batchStage: { fontSize: 11, color: C.teal, fontWeight: '700', marginTop: 2, letterSpacing: 0.4 },

  ctrlRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  ctrlWrap: {
    flex: 1, minWidth: '45%', borderRadius: 14,
    shadowColor: '#ffffff', shadowOffset: { width: -4, height: -4 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 8,
  },
  ctrlBtn: {
    borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  ctrlLabel: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 0.4 },

  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricCard: { flex: 1, minWidth: '45%', padding: 16, alignItems: 'center' },
  metricValue: { fontSize: 22, fontWeight: '900', color: C.deep, marginBottom: 2 },
  metricLabel: { fontSize: 10, fontWeight: '700', color: C.steel, textTransform: 'uppercase', letterSpacing: 0.4 },

  tabContentPad: { padding: 16 },
  tabTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: C.deep },

  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 20, paddingVertical: 7, paddingHorizontal: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  listRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.65)', borderRadius: 12, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#ffffff', shadowOffset: { width: -3, height: -3 }, shadowOpacity: 0.5, shadowRadius: 6, elevation: 2,
  },
  listTitle: { fontSize: 13, fontWeight: '700', color: C.charcoal, marginBottom: 2 },
  listSub: { fontSize: 11, color: C.steel },
  listComment: { fontSize: 11, color: C.slate, marginTop: 3, fontStyle: 'italic' },

  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },

  emptyText: { color: C.slate, fontSize: 13, textAlign: 'center', paddingVertical: 24 },

  // Bottom tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(248,250,251,0.98)',
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 10, paddingHorizontal: 8,
    shadowColor: '#ffffff', shadowOffset: { width: -4, height: -4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 20,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)', borderBottomWidth: 0,
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', paddingVertical: 4, borderRadius: 14, position: 'relative' },
  tabItemActive: {},
  tabActivePill: {
    position: 'absolute', top: 0, left: '20%', right: '20%',
    height: 3, borderRadius: 99,
  },
  tabLabel: { fontSize: 10, fontWeight: '600', color: C.slate, marginTop: 3, letterSpacing: 0.2 },
  tabLabelActive: { color: C.teal, fontWeight: '800' },

  // Modals
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(44,107,127,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingTop: 28,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: C.deep },

  toggleRow: { flexDirection: 'row', backgroundColor: 'rgba(237,242,244,0.8)', borderRadius: 12, padding: 4, gap: 4, marginBottom: 16 },
  toggleBtn: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 10 },
  toggleBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#ffffff', shadowOffset: { width: -3, height: -3 }, shadowOpacity: 0.6, shadowRadius: 6, elevation: 3,
  },
  toggleText: { fontSize: 13, fontWeight: '600', color: C.slate },
  toggleTextActive: { color: C.deep, fontWeight: '800' },

  inputLabel: { fontSize: 11, fontWeight: '800', color: C.charcoal, letterSpacing: 0.6, marginBottom: 7 },
  modalInput: {
    backgroundColor: '#E4EDF1', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 13 : 10,
    fontSize: 13, color: C.charcoal, borderWidth: 2, borderColor: 'transparent',
  },
  modalInputFocused: { borderColor: C.teal, backgroundColor: '#f0fafa' },

  ratingRow: { flexDirection: 'row', marginBottom: 14, marginTop: 4 },

  modalSubmitBtn: {
    borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  modalSubmitText: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0.4 },
});