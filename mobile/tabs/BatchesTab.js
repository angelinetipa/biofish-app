import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge } from '../components/Card';
import SpringButton from '../components/SpringButton';
import { C, S } from '../constants/theme';

const fmt = (dt) => {
  if (!dt) return '—';
  const d = new Date(dt);
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
    + '  ' + d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
};

export default function BatchesTab({ batches }) {
  const [expanded, setExpanded] = useState(null);
  const toggle = (i) => setExpanded(p => p === i ? null : i);

  const total     = batches.length;
  const completed = batches.filter(b => b.status === 'completed').length;
  const stopped   = batches.filter(b => b.status === 'stopped').length;
  const running   = batches.filter(b => ['running','paused'].includes(b.status)).length;

  return (
    <Card style={S.tabCard}>
      <View style={S.tabContentPad}>
        <Text style={S.sectionTitle}>Batches</Text>
        {total > 0 && (
          <View style={styles.statsRow}>
            {[
              { icon: 'layers',        label: 'Total',     value: total,     color: C.ocean   },
              { icon: 'checkmark-done',label: 'Completed', value: completed, color: C.success },
              { icon: 'stop-circle',   label: 'Stopped',   value: stopped,   color: C.error   },
              { icon: 'play-circle',   label: 'Active',    value: running,   color: C.teal    },
            ].map((s, i) => (
              <View key={i} style={styles.statCard}>
                <Ionicons name={s.icon} size={16} color={s.color} />
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <ScrollView style={S.tabScroll} showsVerticalScrollIndicator={false}>
        <View style={S.tabScrollInner}>
          {batches.length === 0
            ? <Text style={S.emptyText}>No batches yet</Text>
            : batches.map((b, i) => {
              const isOpen = expanded === i;
              return (
                <SpringButton key={i} onPress={() => toggle(i)} style={{ marginBottom: 8 }}>
                  <View style={[styles.batchCard, isOpen && styles.batchCardOpen]}>
                    <View style={styles.batchCardTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={S.listTitle}>{b.batch_code}</Text>
                        <Text style={S.listSub}>{fmt(b.start_time)}</Text>
                      </View>
                      <View style={styles.batchCardRight}>
                        <Badge status={b.status} />
                        <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color={C.slate} style={{ marginTop: 4 }} />
                      </View>
                    </View>
                    {isOpen && (
                      <View style={styles.batchDetails}>
                        <View style={styles.detailDivider} />
                        {[
                          { icon: 'play-circle-outline', label: 'Start Time',      value: fmt(b.start_time)                          },
                          { icon: 'stop-circle-outline', label: 'End Time',        value: fmt(b.end_time)                            },
                          { icon: 'fish-outline',        label: 'Fish Scale Type', value: b.fish_scale_type || '—'                   },
                          { icon: 'person-outline',      label: 'Operator',        value: b.operator || '—'                         },
                          { icon: 'git-branch-outline',  label: 'Last Stage',      value: b.current_stage?.replace(/_/g,' ') || '—' },
                        ].map((d, j) => (
                          <View key={j} style={styles.detailRow}>
                            <Ionicons name={d.icon} size={14} color={C.ocean} style={{ marginTop: 1 }} />
                            <Text style={styles.detailLabel}>{d.label}</Text>
                            <Text style={styles.detailValue}>{d.value}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </SpringButton>
              );
            })}
        </View>
      </ScrollView>
    </Card>
  );
}

const styles = StyleSheet.create({
  batchCard:      { backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)', shadowColor: '#ffffff', shadowOffset: { width: -3, height: -3 }, shadowOpacity: 0.5, shadowRadius: 6, elevation: 2, overflow: 'hidden' },
  batchCardOpen:  { borderColor: 'rgba(78,205,196,0.35)', backgroundColor: 'rgba(255,255,255,0.92)' },
  batchCardTop:   { flexDirection: 'row', alignItems: 'center', padding: 12 },
  batchCardRight: { alignItems: 'flex-end', gap: 2 },
  batchDetails:   { paddingHorizontal: 12, paddingBottom: 12 },
  detailDivider:  { height: 1, backgroundColor: 'rgba(78,205,196,0.2)', marginBottom: 10 },
  detailRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 7 },
  detailLabel:    { fontSize: 11, fontWeight: '600', color: C.steel, width: 110 },
  detailValue:    { fontSize: 12, fontWeight: '700', color: C.charcoal, flex: 1 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  statCard:  { flex: 1, alignItems: 'center', backgroundColor: 'rgba(237,242,244,0.8)', borderRadius: 12, paddingVertical: 10, gap: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)' },
  statValue: { fontSize: 16, fontWeight: '900' },
  statLabel: { fontSize: 9, fontWeight: '700', color: C.steel, textTransform: 'uppercase', letterSpacing: 0.3 },
});