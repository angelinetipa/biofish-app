import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
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

const fmtDate = (dt) => {
  if (!dt) return '';
  return new Date(dt).toISOString().split('T')[0]; // YYYY-MM-DD
};

const STATUS_FILTERS = ['all', 'running', 'paused', 'completed', 'stopped'];

export default function BatchesTab({ batches, onRefresh, refreshing }) {
  const [expanded,    setExpanded]    = useState(null);
  const [search,      setSearch]      = useState('');
  const [statusFilter,setStatusFilter]= useState('all');
  const [dateFrom,    setDateFrom]    = useState('');
  const [dateTo,      setDateTo]      = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const toggle = (i) => setExpanded(p => p === i ? null : i);

  const total     = batches.length;
  const completed = batches.filter(b => b.status === 'completed').length;
  const stopped   = batches.filter(b => b.status === 'stopped').length;
  const running   = batches.filter(b => ['running','paused'].includes(b.status)).length;

  // Unique operators and fish scale types for filter hints
  const operators  = useMemo(() => [...new Set(batches.map(b => b.operator).filter(Boolean))], [batches]);
  const scaleTypes = useMemo(() => [...new Set(batches.map(b => b.fish_scale_type).filter(Boolean))], [batches]);

  const [operatorFilter,  setOperatorFilter]  = useState('');
  const [scaleTypeFilter, setScaleTypeFilter] = useState('');

  const filtered = useMemo(() => {
    return batches.filter(b => {
      const q = search.toLowerCase();
      if (q && !b.batch_code?.toLowerCase().includes(q)) return false;
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (operatorFilter  && b.operator !== operatorFilter)          return false;
      if (scaleTypeFilter && b.fish_scale_type !== scaleTypeFilter)  return false;
      if (dateFrom) {
        const bDate = fmtDate(b.start_time);
        if (bDate < dateFrom) return false;
      }
      if (dateTo) {
        const bDate = fmtDate(b.start_time);
        if (bDate > dateTo) return false;
      }
      return true;
    });
  }, [batches, search, statusFilter, operatorFilter, scaleTypeFilter, dateFrom, dateTo]);

  const hasActiveFilter = statusFilter !== 'all' || operatorFilter || scaleTypeFilter || dateFrom || dateTo;

  const clearFilters = () => {
    setStatusFilter('all'); setOperatorFilter('');
    setScaleTypeFilter(''); setDateFrom(''); setDateTo('');
  };

  return (
    <Card style={S.tabCard}>
      <View style={S.tabContentPad}>
        <Text style={S.sectionTitle}>Batches</Text>

        {/* Stats */}
        {total > 0 && (
          <View style={styles.statsRow}>
            {[
              { icon: 'layers',         label: 'Total',     value: total,     color: C.ocean   },
              { icon: 'checkmark-done', label: 'Completed', value: completed, color: C.success },
              { icon: 'stop-circle',    label: 'Stopped',   value: stopped,   color: C.error   },
              { icon: 'play-circle',    label: 'Active',    value: running,   color: C.teal    },
            ].map((s, i) => (
              <View key={i} style={styles.statCard}>
                <Ionicons name={s.icon} size={16} color={s.color} />
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Search bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={15} color={C.slate} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search batch code..."
              placeholderTextColor={C.slate}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={15} color={C.slate} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            onPress={() => setShowFilters(f => !f)}
            style={[styles.filterBtn, (showFilters || hasActiveFilter) && styles.filterBtnActive]}
          >
            <Ionicons name="options-outline" size={16} color={hasActiveFilter ? C.teal : C.slate} />
            {hasActiveFilter && <View style={styles.filterDot} />}
          </TouchableOpacity>
        </View>

        {/* Filter panel */}
        {showFilters && (
          <View style={styles.filterPanel}>

            {/* Status chips */}
            <Text style={styles.filterLabel}>Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              <View style={styles.chipsRow}>
                {STATUS_FILTERS.map(s => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setStatusFilter(s)}
                    style={[styles.chip, statusFilter === s && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, statusFilter === s && styles.chipTextActive]}>
                      {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Operator chips */}
            {operators.length > 0 && (
              <>
                <Text style={styles.filterLabel}>Operator</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                  <View style={styles.chipsRow}>
                    <TouchableOpacity
                      onPress={() => setOperatorFilter('')}
                      style={[styles.chip, !operatorFilter && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, !operatorFilter && styles.chipTextActive]}>All</Text>
                    </TouchableOpacity>
                    {operators.map(op => (
                      <TouchableOpacity
                        key={op}
                        onPress={() => setOperatorFilter(op === operatorFilter ? '' : op)}
                        style={[styles.chip, operatorFilter === op && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, operatorFilter === op && styles.chipTextActive]}>{op}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </>
            )}

            {/* Fish scale type chips */}
            {scaleTypes.length > 0 && (
              <>
                <Text style={styles.filterLabel}>Fish Scale Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                  <View style={styles.chipsRow}>
                    <TouchableOpacity
                      onPress={() => setScaleTypeFilter('')}
                      style={[styles.chip, !scaleTypeFilter && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, !scaleTypeFilter && styles.chipTextActive]}>All</Text>
                    </TouchableOpacity>
                    {scaleTypes.map(st => (
                      <TouchableOpacity
                        key={st}
                        onPress={() => setScaleTypeFilter(st === scaleTypeFilter ? '' : st)}
                        style={[styles.chip, scaleTypeFilter === st && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, scaleTypeFilter === st && styles.chipTextActive]}>{st}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </>
            )}

            {/* Date range */}
            <Text style={styles.filterLabel}>Date Range</Text>
            <View style={styles.dateRow}>
              <View style={styles.dateBox}>
                <Ionicons name="calendar-outline" size={13} color={C.slate} />
                <TextInput
                  style={styles.dateInput}
                  placeholder="From (YYYY-MM-DD)"
                  placeholderTextColor={C.slate}
                  value={dateFrom}
                  onChangeText={setDateFrom}
                />
              </View>
              <Text style={{ color: C.slate, fontWeight: '700' }}>–</Text>
              <View style={styles.dateBox}>
                <Ionicons name="calendar-outline" size={13} color={C.slate} />
                <TextInput
                  style={styles.dateInput}
                  placeholder="To (YYYY-MM-DD)"
                  placeholderTextColor={C.slate}
                  value={dateTo}
                  onChangeText={setDateTo}
                />
              </View>
            </View>

            {hasActiveFilter && (
              <TouchableOpacity onPress={clearFilters} style={styles.clearBtn}>
                <Ionicons name="close-circle-outline" size={13} color={C.error} />
                <Text style={styles.clearBtnText}>Clear all filters</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Result count */}
        {(search || hasActiveFilter) && (
          <Text style={styles.resultCount}>
            {filtered.length} of {total} batch{total !== 1 ? 'es' : ''}
          </Text>
        )}
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
          {filtered.length === 0
            ? <Text style={S.emptyText}>{batches.length === 0 ? 'No batches yet' : 'No results found'}</Text>
            : filtered.map((b, i) => {
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
                          { icon: 'person-outline',      label: 'Operator',        value: b.operator || '—'                          },
                          { icon: 'git-branch-outline',  label: 'Last Stage',      value: b.current_stage?.replace(/_/g,' ') || '—'  },
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

  // Search
  searchRow:  { flexDirection: 'row', gap: 8, marginTop: 12, alignItems: 'center' },
  searchBox:  { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(237,242,244,0.9)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)' },
  searchInput:{ flex: 1, fontSize: 13, color: C.charcoal, padding: 0 },
  filterBtn:  { padding: 10, backgroundColor: 'rgba(237,242,244,0.9)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)', position: 'relative' },
  filterBtnActive: { borderColor: 'rgba(78,205,196,0.4)', backgroundColor: 'rgba(78,205,196,0.08)' },
  filterDot:  { position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: 4, backgroundColor: C.teal },

  // Filter panel
  filterPanel:  { backgroundColor: 'rgba(237,242,244,0.7)', borderRadius: 14, padding: 14, marginTop: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)' },
  filterLabel:  { fontSize: 10, fontWeight: '800', color: C.steel, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 7 },
  chipsRow:     { flexDirection: 'row', gap: 6 },
  chip:         { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.8)', borderWidth: 1, borderColor: 'rgba(139,157,175,0.2)' },
  chipActive:   { backgroundColor: C.teal, borderColor: C.teal },
  chipText:     { fontSize: 12, fontWeight: '700', color: C.slate },
  chipTextActive:{ color: '#fff' },

  dateRow:   { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 10 },
  dateBox:   { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(139,157,175,0.2)' },
  dateInput: { flex: 1, fontSize: 11, color: C.charcoal, padding: 0 },

  clearBtn:     { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  clearBtnText: { fontSize: 12, fontWeight: '700', color: C.error },

  resultCount: { fontSize: 11, color: C.steel, fontWeight: '600', marginTop: 8 },
});