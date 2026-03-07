import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Platform, StatusBar, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import SpringButton from '../components/SpringButton';
import { C } from '../constants/theme';

// ── Data ──────────────────────────────────────────────────────────────────────
const TEAM = [
  { name: 'Angeline', role: 'Project Head',  icon: 'star-outline', color: C.teal,    photo: null },
  { name: 'Kate',     role: 'Project Assistant Head',  icon: 'star-half-outline',         color: C.ocean,   photo: null },
  { name: 'Andrea', role: 'Member',             icon: 'person-outline',         color: '#43C6AC', photo: null },
  { name: 'Enzo', role: 'Member',             icon: 'person-outline',         color: '#5B9BD5', photo: null },
];

// To add real photos later, put images in mobile/assets/ and update like:
// { name: 'Angeline', ..., photo: require('../assets/angeline.jpg') }

const FEATURES = [
  { icon: 'shield-checkmark-outline', label: 'Authentication',  desc: 'Role-based login',         color: C.teal    },
  { icon: 'settings-outline',         label: 'Machine Control', desc: 'Start, pause, stop',       color: C.ocean   },
  { icon: 'bar-chart-outline',        label: 'Dashboard',       desc: 'Real-time monitoring',     color: '#43C6AC' },
  { icon: 'layers-outline',           label: 'Inventory',       desc: 'Scales & materials',       color: C.info    },
  { icon: 'list-outline',             label: 'Batch History',   desc: 'Full production records',  color: '#5B9BD5' },
  { icon: 'chatbubble-outline',       label: 'Feedback',        desc: 'Quality ratings',          color: C.warning },
  { icon: 'flask-outline',            label: 'Demo Mode',       desc: 'Simulate without ESP32',   color: '#8B5CF6' },
  { icon: 'game-controller-outline',  label: 'Mini Game',       desc: 'Scale Catcher',            color: '#EC4899' },
];

const STACK = [
  { icon: 'phone-portrait-outline', label: 'React Native + Expo' },
  { icon: 'code-slash-outline',     label: 'PHP 8+'              },
  { icon: 'server-outline',         label: 'MySQL + XAMPP'       },
  { icon: 'hardware-chip-outline',  label: 'ESP32 Hardware'      },
];

// ── Sub-components ────────────────────────────────────────────────────────────
function SectionLabel({ icon, text }) {
  return (
    <View style={styles.sectionLabel}>
      <Ionicons name={icon} size={13} color={C.teal} />
      <Text style={styles.sectionLabelText}>{text}</Text>
      <View style={styles.sectionLabelLine} />
    </View>
  );
}

function FeatureItem({ icon, label, desc, color }) {
  return (
    <View style={styles.featureItem}>
      <View style={[styles.featureIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.featureName}>{label}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
    </View>
  );
}

function TeamMember({ name, role, icon, color, photo }) {
  return (
    <View style={styles.memberRow}>
      {photo ? (
        <Image source={photo} style={styles.memberPhoto} />
      ) : (
        <View style={[styles.memberAvatar, { backgroundColor: color + '22' }]}>
          <Text style={[styles.memberInitial, { color }]}>{name[0]}</Text>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.memberName}>{name}</Text>
        <View style={styles.memberRoleRow}>
          <Ionicons name={icon} size={11} color={C.steel} />
          <Text style={styles.memberRole}>{role}</Text>
        </View>
      </View>
      <View style={[styles.memberBadge, { backgroundColor: color + '15', borderColor: color + '30' }]}>
        <Ionicons name="checkmark-circle" size={14} color={color} />
      </View>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function AboutScreen({ onBack }) {
  return (
    <LinearGradient colors={['#4ECDC4', '#3A7CA5', '#2C6B7F']} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <SpringButton onPress={onBack}>
          <View style={styles.backBtn}>
            <Ionicons name="arrow-back" size={18} color={C.ocean} />
          </View>
        </SpringButton>
        <View>
          <Text style={styles.headerTitle}>About BIO-FISH</Text>
          <Text style={styles.headerSub}>Version 1.0.0</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero card */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={['transparent', C.teal, C.ocean, C.teal, 'transparent']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.accentLine}
          />
          <View style={styles.heroLogoWrap}>
            <LinearGradient colors={[C.teal, C.ocean]} style={styles.heroLogo}>
              <Text style={{ fontSize: 32 }}>🐟</Text>
            </LinearGradient>
          </View>
          <Text style={styles.heroTitle}>BIO-FISH</Text>
          <Text style={styles.heroTagline}>Bioplastic Formation Monitoring System</Text>
          <View style={styles.heroBadge}>
            <View style={styles.heroBadgeDot} />
            <Text style={styles.heroBadgeText}>Thesis Project</Text>
          </View>
        </View>

        {/* Mission */}
        <View style={styles.card}>
          <SectionLabel icon="leaf-outline" text="Our Mission" />
          <Text style={styles.missionText}>
            BIO-FISH transforms{' '}
            <Text style={styles.missionHighlight}>fish scale waste</Text>
            {' '}into sustainable bioplastic sheets — reducing environmental pollution
            while advancing green material science research.
          </Text>
          <View style={styles.missionTagsRow}>
            {['♻️  Sustainable', '🌊  Eco-Friendly', '🔬  Research-Driven'].map((t, i) => (
              <View key={i} style={styles.missionTag}>
                <Text style={styles.missionTagText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Features */}
        <View style={styles.card}>
          <SectionLabel icon="grid-outline" text="Features" />
          <View style={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <FeatureItem key={i} {...f} />
            ))}
          </View>
        </View>

        {/* Process Stages */}
        <View style={styles.card}>
          <SectionLabel icon="git-branch-outline" text="Production Stages" />
          {[
            { num: '01', label: 'Extraction',    desc: 'Collagen extracted from fish scales using heat',    color: '#43C6AC' },
            { num: '02', label: 'Filtration',    desc: 'Impurities are removed from the extract',          color: C.teal   },
            { num: '03', label: 'Formulation',   desc: 'Glycerol and additives are blended in',            color: C.ocean  },
            { num: '04', label: 'Film Formation',desc: 'Mixture is cast and dried into bioplastic sheets', color: C.deep   },
          ].map((s, i) => (
            <View key={i} style={styles.stageRow}>
              <View style={[styles.stageNum, { backgroundColor: s.color + '18' }]}>
                <Text style={[styles.stageNumText, { color: s.color }]}>{s.num}</Text>
              </View>
              <View style={styles.stageConnector}>
                <View style={[styles.stageConnectorLine, { backgroundColor: s.color + '40' }]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stageName}>{s.label}</Text>
                <Text style={styles.stageDesc}>{s.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Team */}
        <View style={styles.card}>
          <SectionLabel icon="people-outline" text="The Team" />
          <Text style={styles.teamIntro}>
            Built with 💙 by a dedicated thesis team focused on sustainable materials research.
          </Text>
          {TEAM.map((m, i) => <TeamMember key={i} {...m} />)}
        </View>

        {/* Tech Stack */}
        <View style={styles.card}>
          <SectionLabel icon="code-outline" text="Tech Stack" />
          <View style={styles.stackGrid}>
            {STACK.map((s, i) => (
              <View key={i} style={styles.stackItem}>
                <Ionicons name={s.icon} size={20} color={C.teal} />
                <Text style={styles.stackLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={{ fontSize: 28, marginBottom: 8 }}>🐟</Text>
          <Text style={styles.footerTitle}>BIO-FISH v1.0</Text>
          <Text style={styles.footerText}>
            © 2025 BIO-FISH Team{'\n'}Thesis Project{'\n'}All rights reserved
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight || 24) + 12,
    paddingBottom: 14, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F8FAFB',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', borderTopWidth: 0,
    shadowColor: '#fff', shadowOffset: { width: -6, height: -6 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(78,205,196,0.12)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(78,205,196,0.3)',
  },
  headerTitle: { fontSize: 16, fontWeight: '900', color: C.deep, textAlign: 'center' },
  headerSub:   { fontSize: 10, color: C.slate, textAlign: 'center', marginTop: 1 },

  scroll: { padding: 16, gap: 14, paddingBottom: 100 },

  card: {
    backgroundColor: 'rgba(248,250,251,0.97)',
    borderRadius: 20, padding: 18,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.88)',
    shadowColor: '#ffffff', shadowOffset: { width: -6, height: -6 },
    shadowOpacity: 0.55, shadowRadius: 18, elevation: 10,
    gap: 12,
  },

  sectionLabel:     { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 2 },
  sectionLabelText: { fontSize: 10, fontWeight: '800', color: C.teal, letterSpacing: 1.5, textTransform: 'uppercase' },
  sectionLabelLine: { flex: 1, height: 1, backgroundColor: 'rgba(78,205,196,0.25)' },

  heroCard: {
    backgroundColor: 'rgba(248,250,251,0.97)',
    borderRadius: 20, padding: 24, alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.88)',
    shadowColor: '#ffffff', shadowOffset: { width: -6, height: -6 },
    shadowOpacity: 0.55, shadowRadius: 18, elevation: 10,
    overflow: 'hidden',
  },
  accentLine: {
    position: 'absolute', top: 0, left: '5%', right: '5%',
    height: 3, borderRadius: 99, opacity: 0.75,
  },
  heroLogoWrap: {
    borderRadius: 20, marginBottom: 14, marginTop: 8,
    shadowColor: '#ffffff', shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 0.6, shadowRadius: 12, elevation: 8,
  },
  heroLogo: {
    width: 72, height: 72, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
  },
  heroTitle:    { fontSize: 28, fontWeight: '900', color: C.deep, letterSpacing: 1, marginBottom: 4 },
  heroTagline:  { fontSize: 12, color: C.steel, textAlign: 'center', fontWeight: '500', marginBottom: 12 },
  heroBadge:    { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(78,205,196,0.1)', borderRadius: 20, paddingVertical: 5, paddingHorizontal: 12, borderWidth: 1, borderColor: 'rgba(78,205,196,0.25)' },
  heroBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.teal },
  heroBadgeText:{ fontSize: 11, fontWeight: '700', color: C.ocean },

  missionText:      { fontSize: 13, color: C.charcoal, lineHeight: 20, fontWeight: '400' },
  missionHighlight: { fontWeight: '800', color: C.teal },
  missionTagsRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  missionTag:       { backgroundColor: 'rgba(237,242,244,0.9)', borderRadius: 20, paddingVertical: 5, paddingHorizontal: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)' },
  missionTagText:   { fontSize: 11, fontWeight: '700', color: C.steel },

  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  featureItem:  {
    width: '47%', backgroundColor: 'rgba(237,242,244,0.7)',
    borderRadius: 14, padding: 12, gap: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  featureIcon:  { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  featureName:  { fontSize: 12, fontWeight: '800', color: C.charcoal },
  featureDesc:  { fontSize: 10, color: C.steel, lineHeight: 14 },

  stageRow:          { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 4 },
  stageNum:          { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stageNumText:      { fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  stageConnector:    { paddingTop: 12, width: 1 },
  stageConnectorLine:{ width: 1.5, height: 24 },
  stageName:         { fontSize: 13, fontWeight: '800', color: C.charcoal, marginBottom: 2 },
  stageDesc:         { fontSize: 11, color: C.steel, lineHeight: 16 },

  teamIntro:     { fontSize: 12, color: C.steel, lineHeight: 18 },
  memberRow:     {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(237,242,244,0.7)',
    borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  memberPhoto:   { width: 42, height: 42, borderRadius: 12 },
  memberAvatar:  { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  memberInitial: { fontSize: 18, fontWeight: '900' },
  memberName:    { fontSize: 13, fontWeight: '800', color: C.charcoal, marginBottom: 3 },
  memberRoleRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  memberRole:    { fontSize: 11, color: C.steel, fontWeight: '500' },
  memberBadge:   { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },

  stackGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stackItem: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(237,242,244,0.8)',
    borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  stackLabel: { fontSize: 12, fontWeight: '700', color: C.charcoal },

  footer:      { alignItems: 'center', paddingTop: 8, paddingBottom: 8 },
  footerTitle: { fontSize: 14, fontWeight: '900', color: 'rgba(255,255,255,0.9)', marginBottom: 6 },
  footerText:  { fontSize: 11, color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: 18 },
});