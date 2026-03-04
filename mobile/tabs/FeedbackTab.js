import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import SpringButton from '../components/SpringButton';
import { C, S } from '../constants/theme';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const RATING_LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };

function StarRow({ rating }) {
  return (
    <View style={styles.starRow}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons key={i} name={i < rating ? 'star' : 'star-outline'} size={14} color={i < rating ? '#F0A04B' : C.cloud} />
      ))}
      <Text style={styles.ratingLabel}>{RATING_LABELS[rating]}</Text>
    </View>
  );
}

function TypeTag({ icon, label, color }) {
  return (
    <View style={[styles.typeTag, { backgroundColor: color + '18' }]}>
      <Ionicons name={icon} size={11} color={color} />
      <Text style={[styles.typeTagText, { color }]}>{label}</Text>
    </View>
  );
}

function FeedbackCard({ item }) {
  const [open, setOpen] = useState(false);
  const hasComments = !!item.comments;
  const hasBug      = !!item.bug_report;
  const hasFeature  = !!item.feature_request;

  return (
    <TouchableOpacity onPress={() => setOpen(o => !o)} activeOpacity={0.85} style={{ marginBottom: 10 }}>
      <View style={[styles.card, open && styles.cardOpen]}>
        {/* Top row */}
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.batchCode}>{item.batch_code || '—'}</Text>
              <StarRow rating={item.rating} />
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="person-outline" size={11} color={C.steel} />
              <Text style={styles.metaText}>{item.user_name || '—'}</Text>
              <Text style={styles.metaDot}>·</Text>
              <Ionicons name="calendar-outline" size={11} color={C.steel} />
              <Text style={styles.metaText}>{fmt(item.date)}</Text>
            </View>
            {/* Type tags */}
            <View style={styles.tagsRow}>
              {hasComments && <TypeTag icon="chatbubble-outline"  label="Comment" color={C.teal}    />}
              {hasBug      && <TypeTag icon="bug-outline"         label="Bug"     color={C.error}   />}
              {hasFeature  && <TypeTag icon="bulb-outline"        label="Feature" color={C.warning} />}
            </View>
          </View>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={C.slate} style={{ marginLeft: 8, marginTop: 2 }} />
        </View>

        {/* Expanded */}
        {open && (
          <View style={styles.expandedWrap}>
            <View style={styles.divider} />
            {hasComments && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="chatbubble-outline" size={13} color={C.teal} />
                  <Text style={[styles.sectionTitle, { color: C.teal }]}>Comments</Text>
                </View>
                <Text style={styles.sectionText}>{item.comments}</Text>
              </View>
            )}
            {hasBug && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="bug-outline" size={13} color={C.error} />
                  <Text style={[styles.sectionTitle, { color: C.error }]}>Bug Report</Text>
                </View>
                <Text style={styles.sectionText}>{item.bug_report}</Text>
              </View>
            )}
            {hasFeature && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="bulb-outline" size={13} color={C.warning} />
                  <Text style={[styles.sectionTitle, { color: C.warning }]}>Feature Request</Text>
                </View>
                <Text style={styles.sectionText}>{item.feature_request}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function FeedbackTab({ feedback, onAdd }) {
  // Stats
  const total   = feedback.length;
  const avgRating = total ? (feedback.reduce((s, f) => s + Number(f.rating || 0), 0) / total).toFixed(1) : '—';
  const bugs     = feedback.filter(f => f.bug_report).length;
  const features = feedback.filter(f => f.feature_request).length;

  return (
    <Card style={S.tabCard}>
      <View style={S.tabContentPad}>
        <View style={S.tabTitleRow}>
          <Text style={S.sectionTitle}>Feedback</Text>
          <SpringButton onPress={onAdd}>
            <LinearGradient colors={[C.tealLight, C.ocean]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.addBtn}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={S.addBtnText}>Add</Text>
            </LinearGradient>
          </SpringButton>
        </View>

        {/* Stats row */}
        {total > 0 && (
          <View style={styles.statsRow}>
            {[
              { icon: 'star',         label: 'Avg Rating', value: avgRating, color: '#F0A04B' },
              { icon: 'chatbubbles',  label: 'Total',      value: total,     color: C.teal    },
              { icon: 'bug',          label: 'Bugs',       value: bugs,      color: C.error   },
              { icon: 'bulb',         label: 'Features',   value: features,  color: C.warning },
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
          {feedback.length === 0
            ? <Text style={S.emptyText}>No feedback yet</Text>
            : feedback.map((f, i) => <FeedbackCard key={i} item={f} />)
          }
        </View>
      </ScrollView>
    </Card>
  );
}

const styles = StyleSheet.create({
  statsRow:   { flexDirection: 'row', gap: 8, marginBottom: 4 },
  statCard:   { flex: 1, alignItems: 'center', backgroundColor: 'rgba(237,242,244,0.8)', borderRadius: 12, paddingVertical: 10, gap: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)' },
  statValue:  { fontSize: 16, fontWeight: '900' },
  statLabel:  { fontSize: 9, fontWeight: '700', color: C.steel, textTransform: 'uppercase', letterSpacing: 0.3 },

  card:       { backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)', shadowColor: '#ffffff', shadowOffset: { width: -3, height: -3 }, shadowOpacity: 0.5, shadowRadius: 6, elevation: 2, overflow: 'hidden' },
  cardOpen:   { borderColor: 'rgba(78,205,196,0.35)', backgroundColor: 'rgba(255,255,255,0.95)' },
  cardTop:    { flexDirection: 'row', alignItems: 'flex-start', padding: 12 },
  cardTitleRow:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  batchCode:  { fontSize: 13, fontWeight: '800', color: C.charcoal },
  starRow:    { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingLabel:{ fontSize: 10, fontWeight: '700', color: C.steel, marginLeft: 4 },
  metaRow:    { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  metaText:   { fontSize: 11, color: C.steel },
  metaDot:    { fontSize: 11, color: C.cloud },
  tagsRow:    { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  typeTag:    { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 3, paddingHorizontal: 8, borderRadius: 20 },
  typeTagText:{ fontSize: 10, fontWeight: '700' },

  expandedWrap:  { paddingHorizontal: 12, paddingBottom: 12 },
  divider:       { height: 1, backgroundColor: 'rgba(78,205,196,0.2)', marginBottom: 12 },
  section:       { marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  sectionTitle:  { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionText:   { fontSize: 12, color: C.charcoal, lineHeight: 18 },
});