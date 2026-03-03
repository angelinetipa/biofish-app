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

  return (
    <Card style={S.tabCard}>
      <View style={S.tabContentPad}>
        <Text style={S.sectionTitle}>Batches</Text>
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
});