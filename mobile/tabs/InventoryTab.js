import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge } from '../components/Card';
import SpringButton from '../components/SpringButton';
import { C, S } from '../constants/theme';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

function ExpandableItem({ children, topContent }) {
  const [open, setOpen] = useState(false);
  return (
    <SpringButton onPress={() => setOpen(o => !o)} style={{ marginBottom: 8 }}>
      <View style={[styles.itemCard, open && styles.itemCardOpen]}>
        <View style={styles.itemTop}>
          {topContent}
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={C.slate} />
        </View>
        {open && (
          <View style={styles.itemDetails}>
            <View style={styles.detailDivider} />
            {children}
          </View>
        )}
      </View>
    </SpringButton>
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

function SectionHeader({ icon, title, count, color }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={styles.sectionHeaderTitle}>{title}</Text>
      <View style={[styles.sectionCount, { backgroundColor: color + '22' }]}>
        <Text style={[styles.sectionCountText, { color }]}>{count}</Text>
      </View>
    </View>
  );
}

export default function InventoryTab({ fishScales = [], additives = [], onAdd }) {
  return (
    <Card style={S.tabCard}>
      <View style={S.tabContentPad}>
        <View style={S.tabTitleRow}>
          <Text style={S.sectionTitle}>Inventory</Text>
          <SpringButton onPress={onAdd}>
            <LinearGradient colors={[C.tealLight, C.ocean]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.addBtn}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={S.addBtnText}>Add</Text>
            </LinearGradient>
          </SpringButton>
        </View>
      </View>

      <ScrollView style={S.tabScroll} showsVerticalScrollIndicator={false}>
        <View style={S.tabScrollInner}>

          {/* Fish Scales */}
          <SectionHeader icon="fish" title="Fish Scales" count={fishScales.length} color={C.teal} />
          {fishScales.length === 0
            ? <Text style={[S.emptyText, { marginBottom: 20 }]}>No fish scale materials</Text>
            : fishScales.map((m, i) => (
              <ExpandableItem key={i} topContent={
                <View style={{ flex: 1 }}>
                  <Text style={S.listTitle}>{m.fish_scale_type}</Text>
                  <Text style={S.listSub}>{parseFloat(m.quantity_kg).toFixed(2)} kg</Text>
                </View>
              }>
                <DetailRow icon="location-outline"    label="Source"       value={m.source_location || '—'} />
                <DetailRow icon="scale-outline"       label="Quantity"     value={`${parseFloat(m.quantity_kg).toFixed(2)} kg`} />
                <DetailRow icon="calendar-outline"    label="Date Collected" value={fmt(m.date_collected)} />
                <View style={[styles.detailRow, { marginTop: 4 }]}>
                  <Ionicons name="ellipse-outline" size={14} color={C.ocean} />
                  <Text style={styles.detailLabel}>Status</Text>
                  <Badge status={m.status} />
                </View>
              </ExpandableItem>
            ))}

          <View style={styles.sectionGap} />

          {/* Process Materials */}
          <SectionHeader icon="flask" title="Process Materials" count={additives.length} color={C.info} />
          {additives.length === 0
            ? <Text style={S.emptyText}>No process materials</Text>
            : additives.map((a, i) => {
              const isDepleted = parseFloat(a.quantity_ml) <= 0;
              const isLow      = !isDepleted && parseFloat(a.quantity_ml) <= parseFloat(a.minimum_level);
              const status     = isDepleted ? 'depleted' : isLow ? 'low_stock' : 'available';
              const pct        = Math.min(100, Math.round((parseFloat(a.quantity_ml) / parseFloat(a.minimum_level)) * 50));

              return (
                <ExpandableItem key={i} topContent={
                  <View style={{ flex: 1 }}>
                    <Text style={S.listTitle}>{a.additive_name}</Text>
                    <View style={styles.stockBarRow}>
                      <View style={styles.stockBarBg}>
                        <View style={[styles.stockBarFill, {
                          width: `${pct}%`,
                          backgroundColor: isDepleted ? C.error : isLow ? C.warning : C.success,
                        }]} />
                      </View>
                      <Text style={S.listSub}>{parseFloat(a.quantity_ml).toFixed(0)} mL</Text>
                    </View>
                  </View>
                }>
                  <DetailRow icon="beaker-outline"    label="Current Stock"  value={`${parseFloat(a.quantity_ml).toFixed(2)} mL`} />
                  <DetailRow icon="alert-circle-outline" label="Min Level"   value={`${parseFloat(a.minimum_level).toFixed(2)} mL`} />
                  <DetailRow icon="refresh-outline"   label="Last Restocked" value={fmt(a.last_restocked)} />
                  <View style={[styles.detailRow, { marginTop: 4 }]}>
                    <Ionicons name="ellipse-outline" size={14} color={C.ocean} />
                    <Text style={styles.detailLabel}>Status</Text>
                    <Badge status={status} />
                  </View>
                </ExpandableItem>
              );
            })}

        </View>
      </ScrollView>
    </Card>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginBottom: 10,
  },
  sectionIcon: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  sectionHeaderTitle: { fontSize: 13, fontWeight: '800', color: C.deep, flex: 1 },
  sectionCount: {
    paddingVertical: 2, paddingHorizontal: 8, borderRadius: 20,
  },
  sectionCountText: { fontSize: 11, fontWeight: '800' },
  sectionGap: { height: 20 },

  itemCard: {
    backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#ffffff', shadowOffset: { width: -3, height: -3 },
    shadowOpacity: 0.5, shadowRadius: 6, elevation: 2, overflow: 'hidden',
  },
  itemCardOpen: { borderColor: 'rgba(78,205,196,0.35)', backgroundColor: 'rgba(255,255,255,0.92)' },
  itemTop:    { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
  itemDetails:{ paddingHorizontal: 12, paddingBottom: 12 },
  detailDivider: { height: 1, backgroundColor: 'rgba(78,205,196,0.2)', marginBottom: 10 },
  detailRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 7 },
  detailLabel:{ fontSize: 11, fontWeight: '600', color: C.steel, width: 110 },
  detailValue:{ fontSize: 12, fontWeight: '700', color: C.charcoal, flex: 1 },

  stockBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  stockBarBg:  { flex: 1, height: 4, backgroundColor: 'rgba(139,157,175,0.2)', borderRadius: 99, overflow: 'hidden' },
  stockBarFill:{ height: '100%', borderRadius: 99 },
});