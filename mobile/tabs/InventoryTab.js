import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl,
  TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import SpringButton from '../components/SpringButton';
import { Card, CardAccent } from '../components/Card';
import { C, S } from '../constants/theme';
import { API_URL } from '../constants/api';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

function Badge({ status }) {
  const map = { available: [C.success,'Available'], low_stock: [C.warning,'Low Stock'], depleted: [C.error,'Depleted'] };
  const [color, label] = map[status] || [C.slate, status];
  return (
    <View style={[styles.badge, { backgroundColor: color + '22' }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={14} color={C.ocean} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────
function StatsBar({ stats, loading }) {
  if (loading) return <ActivityIndicator color={C.teal} style={{ marginBottom: 10 }} />;
  if (!stats) return null;

  const items = [
    { icon: 'fish',    label: 'Fish Scales', value: `${stats.total_fish_kg}kg`,          color: C.teal    },
    { icon: 'flask',   label: 'Additives',   value: `${stats.total_additives_ml}mL`,     color: C.ocean   },
    { icon: 'warning', label: 'Low Stock',   value: stats.low_stock_count,               color: stats.low_stock_count > 0 ? C.warning : C.slate },
    { icon: 'star',    label: 'Most Used',   value: stats.most_used?.split(' (')[0] || '—', color: '#F0A04B' },
  ];

  return (
    <View style={styles.statsRow}>
      {items.map((s, i) => (
        <View key={i} style={styles.statCard}>
          <Ionicons name={s.icon} size={16} color={s.color} />
          <Text style={[styles.statValue, { color: s.color }]} numberOfLines={1}>{s.value}</Text>
          <Text style={styles.statLabel}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ visible, item, type, onClose, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!item) return;
    if (type === 'fish_scale') {
      setForm({
        fish_scale_type: item.fish_scale_type || '',
        source_location: item.source_location || '',
        quantity_kg:     String(item.quantity_kg ?? ''),
        date_collected:  item.date_collected?.split('T')[0] || '',
      });
    } else {
      setForm({
        additive_name:  item.additive_name || '',
        quantity_ml:    String(item.quantity_ml ?? ''),
        minimum_level:  String(item.minimum_level ?? ''),
        last_restocked: item.last_restocked?.split('T')[0] || '',
      });
    }
  }, [item, type]);

  const save = async () => {
    setSaving(true);
    try {
      const id = type === 'fish_scale' ? item.material_id : item.additive_id;
      const res = await axios.post(`${API_URL}/edit_material.php`, { type, id, ...form });
      if (res.data.success) { onSaved(); onClose(); }
      else Alert.alert('Error', res.data.message);
    } catch { Alert.alert('Error', 'Could not save.'); }
    finally { setSaving(false); }
  };

  const fields = type === 'fish_scale'
    ? [
        { key: 'fish_scale_type', label: 'Fish Scale Type' },
        { key: 'source_location', label: 'Source Location' },
        { key: 'quantity_kg',     label: 'Quantity (kg)',  keyboard: 'numeric' },
        { key: 'date_collected',  label: 'Date Collected (YYYY-MM-DD)' },
      ]
    : [
        { key: 'additive_name',  label: 'Material Name' },
        { key: 'quantity_ml',    label: 'Quantity (mL)',    keyboard: 'numeric' },
        { key: 'minimum_level',  label: 'Minimum Level (mL)', keyboard: 'numeric' },
        { key: 'last_restocked', label: 'Last Restocked (YYYY-MM-DD)' },
      ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={S.modalOverlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
          <Card style={S.modalCard}>
            <CardAccent />
            <View style={S.modalHeader}>
              <Text style={S.modalTitle}>Edit {type === 'fish_scale' ? 'Fish Scale' : 'Additive'}</Text>
              <SpringButton onPress={onClose}>
                <Ionicons name="close-circle" size={28} color={C.slate} />
              </SpringButton>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {fields.map(({ key, label, keyboard }) => (
                <View key={key} style={{ marginBottom: 12 }}>
                  <Text style={S.label}>{label}</Text>
                  <TextInput
                    style={S.input}
                    value={form[key]}
                    onChangeText={v => f(key, v)}
                    keyboardType={keyboard || 'default'}
                    placeholderTextColor={C.slate}
                  />
                </View>
              ))}

              <SpringButton onPress={save} disabled={saving}>
                <LinearGradient colors={[C.tealLight, C.ocean]} style={styles.saveBtn}>
                  {saving
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.saveBtnText}>Save Changes</Text>
                  }
                </LinearGradient>
              </SpringButton>
            </ScrollView>
          </Card>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ── Fish Scales List ──────────────────────────────────────────────────────────
function FishScalesList({ fishScales, onRefresh, onEdit }) {
  const [expanded, setExpanded] = useState(null);
  if (!fishScales.length) return <Text style={S.emptyText}>No fish scales in inventory</Text>;

  const grouped = fishScales.reduce((acc, m) => {
    const k = m.fish_scale_type || 'Unknown';
    if (!acc[k]) acc[k] = [];
    acc[k].push(m);
    return acc;
  }, {});

  return Object.entries(grouped).map(([type, entries], gi) => {
    const totalKg    = entries.reduce((s, e) => s + parseFloat(e.quantity_kg || 0), 0);
    const isGroupOpen = expanded === gi;
    const best = entries.reduce((b, e) => {
      const rank = { depleted: 0, low_stock: 1, available: 2 };
      return rank[e.status] > rank[b] ? e.status : b;
    }, 'depleted');

    return (
      <View key={gi} style={{ marginBottom: 10 }}>
        <SpringButton onPress={() => setExpanded(isGroupOpen ? null : gi)}>
          <View style={[styles.groupCard, isGroupOpen && styles.groupCardOpen]}>
            <View style={styles.groupTop}>
              <View style={styles.groupIcon}>
                <Ionicons name="fish" size={16} color={C.teal} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.groupTitle}>{type}</Text>
                <Text style={S.listSub}>{totalKg.toFixed(2)} kg · {entries.length} entry(s)</Text>
              </View>
              <Badge status={best} />
              <Ionicons name={isGroupOpen ? 'chevron-up' : 'chevron-down'} size={16} color={C.slate} style={{ marginLeft: 6 }} />
            </View>

            {isGroupOpen && (
              <View style={styles.entriesWrap}>
                <View style={styles.detailDivider} />
                {entries.map((e, ei) => (
                  <View key={ei} style={styles.entryRow}>
                    <View style={styles.timelineCol}>
                      <View style={[styles.timelineDot, { backgroundColor: e.status === 'available' ? C.success : e.status === 'low_stock' ? C.warning : C.error }]} />
                      {ei < entries.length - 1 && <View style={styles.timelineLine} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.entryMain}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.entryTitle}>{parseFloat(e.quantity_kg).toFixed(2)} kg</Text>
                          <Text style={styles.entrySub}>{e.source_location} · {fmt(e.date_collected)}</Text>
                        </View>
                        <TouchableOpacity onPress={() => onEdit(e, 'fish_scale')} style={styles.editBtn}>
                          <Ionicons name="pencil-outline" size={14} color={C.ocean} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </SpringButton>
      </View>
    );
  });
}

// ── Process Materials List ────────────────────────────────────────────────────
function ProcessList({ additives, onEdit }) {
  const [openEntry, setOpenEntry] = useState(null);
  if (!additives.length) return <Text style={S.emptyText}>No process materials in inventory</Text>;

  return additives.map((a, i) => {
    const qty    = parseFloat(a.quantity_ml || 0);
    const min    = parseFloat(a.minimum_level || 0);
    const isLow  = qty > 0 && qty <= min;
    const status = qty <= 0 ? 'depleted' : isLow ? 'low_stock' : 'available';
    const pct    = min > 0 ? Math.min(qty / (min * 3), 1) : 1;
    const isOpen = openEntry === i;

    return (
      <SpringButton key={i} onPress={() => setOpenEntry(isOpen ? null : i)} style={{ marginBottom: 8 }}>
        <View style={[styles.groupCard, isOpen && styles.groupCardOpen]}>
          <View style={styles.groupTop}>
            <View style={[styles.groupIcon, { backgroundColor: 'rgba(58,124,165,0.1)' }]}>
              <Ionicons name="flask" size={15} color={C.ocean} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.groupTitle}>{a.additive_name}</Text>
              <View style={styles.stockBarRow}>
                <View style={styles.stockBarBg}>
                  <View style={[styles.stockBarFill, { width: `${pct * 100}%`, backgroundColor: status === 'available' ? C.success : status === 'low_stock' ? C.warning : C.error }]} />
                </View>
                <Text style={S.listSub}>{qty.toFixed(0)} mL</Text>
              </View>
            </View>
            <Badge status={status} />
            <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color={C.slate} style={{ marginLeft: 6 }} />
          </View>

          {isOpen && (
            <View style={styles.entriesWrap}>
              <View style={styles.detailDivider} />
              <DetailRow icon="beaker-outline"       label="Current Stock"  value={`${qty.toFixed(2)} mL`} />
              <DetailRow icon="alert-circle-outline" label="Min Level"      value={`${min.toFixed(2)} mL`} />
              <DetailRow icon="refresh-outline"      label="Last Restocked" value={fmt(a.last_restocked)} />
              <TouchableOpacity onPress={() => onEdit(a, 'additive')} style={styles.editBtnFull}>
                <Ionicons name="pencil-outline" size={14} color={C.ocean} />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SpringButton>
    );
  });
}

// ── Main Component ────────────────────────────────────────────────────────────
const INV_TABS = [
  { key: 'fish',    label: 'Fish Scales',       icon: 'fish-outline',  iconActive: 'fish'  },
  { key: 'process', label: 'Process Materials', icon: 'flask-outline', iconActive: 'flask' },
];

export default function InventoryTab({ fishScales = [], additives = [], onAdd, onRefresh, refreshing }) {
  const [activeTab,  setActiveTab]  = useState('fish');
  const [stats,      setStats]      = useState(null);
  const [statsLoad,  setStatsLoad]  = useState(true);
  const [editItem,   setEditItem]   = useState(null);
  const [editType,   setEditType]   = useState(null);

  const loadStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/inventory_stats.php`);
      if (res.data.success) setStats(res.data);
    } catch {}
    finally { setStatsLoad(false); }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats, fishScales, additives]);

  const handleEdit = (item, type) => { setEditItem(item); setEditType(type); };
  const handleSaved = () => { onRefresh?.(); loadStats(); };

  return (
    <Card style={S.tabCard}>
      <View style={[S.tabContentPad, { paddingBottom: 0 }]}>
        <View style={S.tabTitleRow}>
          <Text style={S.sectionTitle}>Inventory</Text>
          <SpringButton onPress={onAdd}>
            <LinearGradient colors={[C.tealLight, C.ocean]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.addBtn}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={S.addBtnText}>Add</Text>
            </LinearGradient>
          </SpringButton>
        </View>

        <StatsBar stats={stats} loading={statsLoad} />

        <View style={styles.innerTabBar}>
          {INV_TABS.map(tab => {
            const active = activeTab === tab.key;
            const count  = tab.key === 'fish' ? fishScales.length : additives.length;
            return (
              <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key)} style={[styles.innerTab, active && styles.innerTabActive]} activeOpacity={0.8}>
                <Ionicons name={active ? tab.iconActive : tab.icon} size={14} color={active ? '#fff' : C.slate} />
                <Text style={[styles.innerTabText, active && styles.innerTabTextActive]}>{tab.label}</Text>
                <View style={[styles.countBadge, { backgroundColor: active ? 'rgba(255,255,255,0.3)' : 'rgba(139,157,175,0.15)' }]}>
                  <Text style={[styles.countText, { color: active ? '#fff' : C.slate }]}>{count}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        style={S.tabScroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing || false} onRefresh={onRefresh} tintColor={C.teal} colors={[C.teal]} />}
      >
        <View style={S.tabScrollInner}>
          {activeTab === 'fish'
            ? <FishScalesList fishScales={fishScales} onRefresh={onRefresh} onEdit={handleEdit} />
            : <ProcessList    additives={additives}   onEdit={handleEdit} />
          }
        </View>
      </ScrollView>

      <EditModal
        visible={!!editItem}
        item={editItem}
        type={editType}
        onClose={() => setEditItem(null)}
        onSaved={handleSaved}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  // Stats — matches BatchesTab / FeedbackTab
  statsRow:  { flexDirection: 'row', gap: 8, marginBottom: 10 },
  statCard:  { flex: 1, alignItems: 'center', backgroundColor: 'rgba(237,242,244,0.8)', borderRadius: 12, paddingVertical: 10, gap: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)' },
  statValue: { fontSize: 16, fontWeight: '900', textAlign: 'center' },
  statLabel: { fontSize: 9, fontWeight: '700', color: C.steel, textTransform: 'uppercase', letterSpacing: 0.3, textAlign: 'center' },

  // Tab bar
  innerTabBar:       { flexDirection: 'row', gap: 6, backgroundColor: 'rgba(237,242,244,0.8)', borderRadius: 12, padding: 4, marginBottom: 8 },
  innerTab:          { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 9, paddingHorizontal: 6, borderRadius: 10 },
  innerTabActive:    { backgroundColor: C.teal, elevation: 3 },
  innerTabText:      { fontSize: 11, fontWeight: '700', color: C.slate, flexShrink: 1 },
  innerTabTextActive:{ color: '#fff', fontWeight: '800' },
  countBadge:        { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 20 },
  countText:         { fontSize: 10, fontWeight: '800' },

  // Cards
  badge:         { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  badgeText:     { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  groupCard:     { backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)', shadowColor: '#ffffff', shadowOffset: { width: -3, height: -3 }, shadowOpacity: 0.5, shadowRadius: 6, elevation: 2, overflow: 'hidden' },
  groupCardOpen: { borderColor: 'rgba(78,205,196,0.35)', backgroundColor: 'rgba(255,255,255,0.95)' },
  groupTop:      { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  groupIcon:     { width: 32, height: 32, borderRadius: 9, backgroundColor: 'rgba(78,205,196,0.12)', alignItems: 'center', justifyContent: 'center' },
  groupTitle:    { fontSize: 13, fontWeight: '800', color: C.charcoal, marginBottom: 2 },

  entriesWrap:  { paddingHorizontal: 12, paddingBottom: 12 },
  detailDivider:{ height: 1, backgroundColor: 'rgba(78,205,196,0.2)', marginBottom: 10 },
  entryRow:     { flexDirection: 'row', gap: 10, paddingVertical: 6 },
  timelineCol:  { alignItems: 'center', width: 16, paddingTop: 4 },
  timelineDot:  { width: 8, height: 8, borderRadius: 4 },
  timelineLine: { flex: 1, width: 1.5, backgroundColor: 'rgba(139,157,175,0.25)', marginTop: 3 },
  entryMain:    { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  entryTitle:   { fontSize: 12, fontWeight: '700', color: C.charcoal },
  entrySub:     { fontSize: 11, color: C.steel, marginTop: 1 },

  detailRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 7 },
  detailLabel:  { fontSize: 11, fontWeight: '600', color: C.steel, width: 110 },
  detailValue:  { fontSize: 12, fontWeight: '700', color: C.charcoal, flex: 1 },

  stockBarRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  stockBarBg:   { flex: 1, height: 4, backgroundColor: 'rgba(139,157,175,0.2)', borderRadius: 99, overflow: 'hidden' },
  stockBarFill: { height: '100%', borderRadius: 99 },

  // Edit buttons
  editBtn:      { padding: 6, backgroundColor: 'rgba(78,205,196,0.1)', borderRadius: 8 },
  editBtnFull:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, paddingVertical: 7, paddingHorizontal: 12, backgroundColor: 'rgba(78,205,196,0.1)', borderRadius: 8, alignSelf: 'flex-start' },
  editBtnText:  { fontSize: 12, fontWeight: '700', color: C.ocean },

  // Save button
  saveBtn:      { borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 8 },
  saveBtnText:  { color: '#fff', fontSize: 13, fontWeight: '800' },
});