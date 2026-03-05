import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge } from '../components/Card';
import SpringButton from '../components/SpringButton';
import { C, S } from '../constants/theme';
import axios from 'axios';
import { API_URL } from '../constants/api';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

function DetailRow({ icon, label, value }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={14} color={C.ocean} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const confirmDelete = (type, id, name, onSuccess) => {
  Alert.alert(
    'Delete Item',
    `Are you sure you want to delete "${name}"? This cannot be undone.`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          const res = await axios.post(`${API_URL}/delete_material.php`, { type, id });
          if (res.data.success) onSuccess();
          else Alert.alert('Error', res.data.message);
        } catch (e) {
          Alert.alert('Error', e.message);
        }
      }},
    ]
  );
};

function FishScalesList({ fishScales, onRefresh }) {
  const [openGroup, setOpenGroup] = useState(null);
  const [openEntry, setOpenEntry] = useState(null);

  const handleRefresh = () => { setOpenGroup(null); setOpenEntry(null); onRefresh(); };

  if (fishScales.length === 0) return <Text style={S.emptyText}>No fish scale materials</Text>;

  const groups = fishScales.reduce((acc, m) => {
    const key = m.fish_scale_type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  return Object.entries(groups).map(([type, entries], gi) => {
    const totalKg     = entries.reduce((s, e) => s + parseFloat(e.quantity_kg || 0), 0);
    const isGroupOpen = openGroup === gi;
    const statusPriority = { depleted: 0, low_stock: 1, available: 2 };
    const worstStatus = entries.reduce((worst, e) =>
      statusPriority[e.status] < statusPriority[worst] ? e.status : worst, 'available');

    return (
      <View key={gi} style={{ marginBottom: 10 }}>
        <SpringButton onPress={() => { setOpenGroup(isGroupOpen ? null : gi); setOpenEntry(null); }}>
          <View style={[styles.groupCard, isGroupOpen && styles.groupCardOpen]}>
            <View style={styles.groupTop}>
              <View style={styles.groupIcon}>
                <Ionicons name="fish" size={16} color={C.teal} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.groupTitle}>{type}</Text>
                <Text style={S.listSub}>{totalKg.toFixed(2)} kg total · {entries.length} collection{entries.length > 1 ? 's' : ''}</Text>
              </View>
              <Badge status={worstStatus} />
              <Ionicons name={isGroupOpen ? 'chevron-up' : 'chevron-down'} size={16} color={C.slate} style={{ marginLeft: 6 }} />
            </View>

            {isGroupOpen && (
              <View style={styles.entriesWrap}>
                <View style={styles.detailDivider} />
                {entries.map((e, ei) => {
                  const entryKey    = `${gi}-${ei}`;
                  const isEntryOpen = openEntry === entryKey;
                  return (
                    <SpringButton
                      key={ei}
                      onPress={() => setOpenEntry(isEntryOpen ? null : entryKey)}
                      onLongPress={() => confirmDelete('fish_scale', e.material_id, `${e.quantity_kg}kg ${type} - ${e.source_location}`, handleRefresh)}
                    >
                      <View style={[styles.entryRow, isEntryOpen && styles.entryRowOpen]}>
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
                            <Ionicons name={isEntryOpen ? 'chevron-up' : 'chevron-down'} size={13} color={C.slate} />
                          </View>
                          {isEntryOpen && (
                            <View style={styles.entryDetails}>
                              <DetailRow icon="location-outline" label="Source"         value={e.source_location || '—'} />
                              <DetailRow icon="scale-outline"    label="Quantity"       value={`${parseFloat(e.quantity_kg).toFixed(2)} kg`} />
                              <DetailRow icon="calendar-outline" label="Date Collected" value={fmt(e.date_collected)} />
                              <View style={styles.detailRow}>
                                <Ionicons name="ellipse-outline" size={14} color={C.ocean} />
                                <Text style={styles.detailLabel}>Status</Text>
                                <Badge status={e.status} />
                              </View>
                            </View>
                          )}
                        </View>
                      </View>
                    </SpringButton>
                  );
                })}
              </View>
            )}
          </View>
        </SpringButton>
      </View>
    );
  });
}

function ProcessList({ additives, onRefresh }) {
  const [openItem, setOpenItem] = useState(null);

  if (additives.length === 0) return <Text style={S.emptyText}>No process materials</Text>;

  return additives.map((a, i) => {
    const qty        = parseFloat(a.quantity_ml);
    const min        = parseFloat(a.minimum_level);
    const isDepleted = qty <= 0;
    const isLow      = !isDepleted && qty <= min;
    const status     = isDepleted ? 'depleted' : isLow ? 'low_stock' : 'available';
    const pct        = Math.min(100, Math.round((qty / Math.max(min * 2, 1)) * 100));
    const isOpen     = openItem === i;

    return (
      <SpringButton
        key={i}
        onPress={() => setOpenItem(isOpen ? null : i)}
        onLongPress={() => confirmDelete('additive', a.additive_id, a.additive_name, onRefresh)}
        style={{ marginBottom: 8 }}
      >
        <View style={[styles.groupCard, isOpen && styles.groupCardOpen]}>
          <View style={styles.groupTop}>
            <View style={[styles.groupIcon, { backgroundColor: 'rgba(91,155,213,0.12)' }]}>
              <Ionicons name="flask" size={16} color={C.info} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.groupTitle}>{a.additive_name}</Text>
              <View style={styles.stockBarRow}>
                <View style={styles.stockBarBg}>
                  <View style={[styles.stockBarFill, {
                    width: `${pct}%`,
                    backgroundColor: isDepleted ? C.error : isLow ? C.warning : C.success,
                  }]} />
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
              <View style={styles.detailRow}>
                <Ionicons name="ellipse-outline" size={14} color={C.ocean} />
                <Text style={styles.detailLabel}>Status</Text>
                <Badge status={status} />
              </View>
            </View>
          )}
        </View>
      </SpringButton>
    );
  });
}

const INV_TABS = [
  { key: 'fish',    label: 'Fish Scales',       icon: 'fish-outline',  iconActive: 'fish'  },
  { key: 'process', label: 'Process Materials', icon: 'flask-outline', iconActive: 'flask' },
];

export default function InventoryTab({ fishScales = [], additives = [], onAdd, onRefresh, refreshing }) {
  const [activeTab, setActiveTab] = useState('fish');

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing || false}
            onRefresh={onRefresh}
            tintColor={C.teal}
            colors={[C.teal]}
          />
        }
      >
        <View style={S.tabScrollInner}>
          {activeTab === 'fish'
            ? <FishScalesList fishScales={fishScales} onRefresh={onRefresh} />
            : <ProcessList    additives={additives}   onRefresh={onRefresh} />
          }
        </View>
      </ScrollView>
    </Card>
  );
}

const styles = StyleSheet.create({
  innerTabBar:       { flexDirection: 'row', gap: 6, backgroundColor: 'rgba(237,242,244,0.8)', borderRadius: 12, padding: 4, marginBottom: 8 },
  innerTab:          { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 9, paddingHorizontal: 6, borderRadius: 10 },
  innerTabActive:    { backgroundColor: C.teal, elevation: 3 },
  innerTabText:      { fontSize: 11, fontWeight: '700', color: C.slate, flexShrink: 1 },
  innerTabTextActive:{ color: '#fff', fontWeight: '800' },
  countBadge:        { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 20 },
  countText:         { fontSize: 10, fontWeight: '800' },

  groupCard:      { backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)', shadowColor: '#ffffff', shadowOffset: { width: -3, height: -3 }, shadowOpacity: 0.5, shadowRadius: 6, elevation: 2, overflow: 'hidden' },
  groupCardOpen:  { borderColor: 'rgba(78,205,196,0.35)', backgroundColor: 'rgba(255,255,255,0.95)' },
  groupTop:       { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  groupIcon:      { width: 32, height: 32, borderRadius: 9, backgroundColor: 'rgba(78,205,196,0.12)', alignItems: 'center', justifyContent: 'center' },
  groupTitle:     { fontSize: 13, fontWeight: '800', color: C.charcoal, marginBottom: 2 },

  entriesWrap:    { paddingHorizontal: 12, paddingBottom: 12 },
  detailDivider:  { height: 1, backgroundColor: 'rgba(78,205,196,0.2)', marginBottom: 10 },

  entryRow:       { flexDirection: 'row', gap: 10, paddingVertical: 6 },
  entryRowOpen:   {},
  timelineCol:    { alignItems: 'center', width: 16, paddingTop: 4 },
  timelineDot:    { width: 8, height: 8, borderRadius: 4 },
  timelineLine:   { flex: 1, width: 1.5, backgroundColor: 'rgba(139,157,175,0.25)', marginTop: 3 },
  entryMain:      { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  entryTitle:     { fontSize: 12, fontWeight: '700', color: C.charcoal },
  entrySub:       { fontSize: 11, color: C.steel, marginTop: 1 },
  entryDetails:   { marginTop: 8 },

  detailRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 7 },
  detailLabel:    { fontSize: 11, fontWeight: '600', color: C.steel, width: 110 },
  detailValue:    { fontSize: 12, fontWeight: '700', color: C.charcoal, flex: 1 },

  stockBarRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  stockBarBg:     { flex: 1, height: 4, backgroundColor: 'rgba(139,157,175,0.2)', borderRadius: 99, overflow: 'hidden' },
  stockBarFill:   { height: '100%', borderRadius: 99 },
});