import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import SpringButton from '../components/SpringButton';
import { C } from '../constants/theme';

// ── Data ──────────────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    key: 'getting_started',
    icon: 'rocket-outline',
    color: C.teal,
    title: 'Getting Started',
    items: [
      {
        q: 'How do I log in?',
        a: 'Enter your username and password provided by your admin. If you forgot your credentials, contact your administrator — they can reset your account from the Users tab.',
      },
      {
        q: 'What are the two roles?',
        a: 'Operator — can monitor the machine, manage batches, inventory, and submit feedback.\n\nAdmin — has all operator permissions plus the ability to manage user accounts (add, delete, change roles).',
      },
      {
        q: 'Why can\'t I see the Users tab?',
        a: 'The Users tab is only visible to admins. If you need access, ask your admin to update your role.',
      },
    ],
  },
  {
    key: 'dashboard',
    icon: 'home-outline',
    color: '#4ECDC4',
    title: 'Dashboard',
    items: [
      {
        q: 'What is Demo Mode?',
        a: 'Demo Mode simulates the machine without needing an ESP32 connected. Stages run automatically every few seconds. Use it for testing or presentations. Toggle it with the flask button at the top of the Dashboard tab.',
      },
      {
        q: 'How do I start a batch?',
        a: '1. Make sure materials are in inventory.\n2. Tap the Start button on the machine card.\n3. You\'ll see a checklist — confirm everything is ready.\n4. Fill in the batch form (select fish scales, additives, quantities).\n5. Tap Start Batch.',
      },
      {
        q: 'What do the machine controls do?',
        a: 'Pause — temporarily halts the current batch. It can be resumed.\n\nResume — continues a paused batch.\n\nStop — permanently terminates the batch. Cannot be undone.\n\nCleaning Mode — runs a cleaning cycle. Make sure the machine is empty first.',
      },
      {
        q: 'What are the 4 production stages?',
        a: '1. Extraction — fish scale collagen is extracted using heat.\n2. Filtration — impurities are removed from the extract.\n3. Formulation — glycerol and other additives are mixed in.\n4. Film Formation — the mixture is cast and dried into bioplastic sheets.',
      },
      {
        q: 'What does the Scale Catcher game do?',
        a: 'It\'s a mini-game hidden in the Dashboard tab. Tap the 🎮 Scale Catcher card to play. Catch falling fish scales with the funnel — speed increases as your score goes up.',
      },
    ],
  },
  {
    key: 'batches',
    icon: 'list-outline',
    color: C.ocean,
    title: 'Batches',
    items: [
      {
        q: 'What do the batch statuses mean?',
        a: 'Running — currently being processed.\nPaused — temporarily stopped, can be resumed.\nCompleted — finished successfully.\nStopped — manually terminated before completion.\nCleaning — machine is in cleaning mode.',
      },
      {
        q: 'Can I edit or delete a batch?',
        a: 'No. Batch records are kept for traceability. If a batch was started by mistake, stop it and note it in feedback.',
      },
      {
        q: 'How do I search for a batch?',
        a: 'Use the search bar at the top of the Batches tab. You can filter by batch code, status, or fish scale type. Tap a batch card to expand its details.',
      },
    ],
  },
  {
    key: 'inventory',
    icon: 'layers-outline',
    color: '#3A7CA5',
    title: 'Inventory',
    items: [
      {
        q: 'What is the difference between Fish Scales and Process Materials?',
        a: 'Fish Scales — raw input material (measured in kg). Grouped by fish type.\n\nProcess Materials — additives like glycerol, acetic acid (measured in mL). These are consumed during formulation.',
      },
      {
        q: 'What do the stock statuses mean?',
        a: 'Available — sufficient stock.\nLow Stock — below the minimum level. Restock soon.\nDepleted — empty, cannot be used in new batches.',
      },
      {
        q: 'How do I add stock?',
        a: 'Tap the Add button at the top right of the Inventory tab. Select the type, fill in the details, and submit. For additives that already exist, the quantity will be added to the current stock.',
      },
      {
        q: 'How do I fix a wrong entry?',
        a: 'Expand the item (tap it), then tap the pencil ✏️ icon. Edit the fields and tap Save Changes.',
      },
      {
        q: 'What are the stats at the top?',
        a: 'Fish Scales — total kg available across all non-depleted entries.\nAdditives — total mL across all additives.\nLow Stock — count of items at or below minimum level.\nMost Used — the fish scale type used most frequently across all batches.',
      },
    ],
  },
  {
    key: 'feedback',
    icon: 'chatbubble-outline',
    color: '#F0A04B',
    title: 'Feedback',
    items: [
      {
        q: 'What is feedback for?',
        a: 'Feedback is tied to a specific batch and captures quality observations, bug reports, and feature requests. It helps track production quality over time.',
      },
      {
        q: 'How do I submit feedback?',
        a: 'Tap the Add button in the Feedback tab. Select the batch, give a star rating (1–5), and fill in any relevant fields. Not all fields are required.',
      },
      {
        q: 'What do the feedback types mean?',
        a: 'Quality Issue — problem with the output product.\nBug Report — something wrong with the app or machine.\nFeature Request — suggestion for improvement.\nGeneral Comment — any other observation.',
      },
    ],
  },
  {
    key: 'users',
    icon: 'people-outline',
    color: '#1565c0',
    title: 'User Management (Admin only)',
    items: [
      {
        q: 'How do I create a new user?',
        a: 'Go to the Users tab (admin only). Fill in the username, full name, email, role, and initial password, then tap Create User. Share the credentials with the new user and ask them to remember it.',
      },
      {
        q: 'How do I change someone\'s role?',
        a: 'In the Users tab, find the user and tap their role badge (green Operator / blue Admin). Confirm the change. You cannot change your own role.',
      },
      {
        q: 'How do I delete a user?',
        a: 'Tap the trash icon next to the user. You cannot delete your own account.',
      },
      {
        q: 'Can I reset a user\'s password?',
        a: 'Not yet from the app. To reset a password, delete the user and recreate them with a new password, or update it directly in the database via phpMyAdmin.',
      },
    ],
  },
  {
    key: 'troubleshooting',
    icon: 'construct-outline',
    color: C.error,
    title: 'Troubleshooting',
    items: [
      {
        q: 'App says "Connection failed"',
        a: 'Make sure your phone and the computer running XAMPP are on the same Wi-Fi network. Check that the IP address in api.js matches your computer\'s current IPv4. Restart Apache in XAMPP if needed.',
      },
      {
        q: 'Machine command says "Could not reach machine"',
        a: 'The app could not connect to the ESP32. Check that the ESP32 is powered on and connected to the same network. Verify the ESP32 IP in backend/config.php. Use Demo Mode if ESP32 is not available.',
      },
      {
        q: '"Invalid username or password" on login',
        a: 'Double-check your credentials with your admin. If you\'re an admin and all logins fail, run the reset_passwords.php script once via the browser to rehash all passwords.',
      },
      {
        q: 'Inventory not deducted after a batch',
        a: 'Inventory is deducted when the batch starts. If it was a demo batch that was stopped early, the system automatically rolls back the deduction.',
      },
    ],
  },
];

// ── Components ────────────────────────────────────────────────────────────────
function Section({ section }) {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: section.color + '22' }]}>
          <Ionicons name={section.icon} size={16} color={section.color} />
        </View>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>

      {section.items.map((item, i) => {
        const open = openIdx === i;
        return (
          <TouchableOpacity
            key={i}
            activeOpacity={0.8}
            onPress={() => setOpenIdx(open ? null : i)}
            style={[styles.item, open && styles.itemOpen]}
          >
            <View style={styles.itemTop}>
              <Text style={styles.question}>{item.q}</Text>
              <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={C.slate} />
            </View>
            {open && <Text style={styles.answer}>{item.a}</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function HelpScreen({ onBack }) {
  return (
    <LinearGradient colors={['#4ECDC4', '#3A7CA5', '#2C6B7F']} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={styles.header}>
        <SpringButton onPress={onBack}>
          <View style={styles.backBtn}>
            <Ionicons name="arrow-back" size={18} color={C.ocean} />
          </View>
        </SpringButton>
        <View>
          <Text style={styles.headerTitle}>Help & User Guide</Text>
          <Text style={styles.headerSub}>BIO-FISH Bioplastic System</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Tap any question to expand the answer. Sections are grouped by feature.
        </Text>
        {SECTIONS.map(s => <Section key={s.key} section={s} />)}
        <Text style={styles.footer}>BIO-FISH v1.0 · Thesis / Capstone Project</Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight || 24) + 12,
    paddingBottom: 14, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(248,250,251,0.97)',
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

  scroll: { padding: 16, paddingBottom: 40, gap: 16 },

  intro: {
    fontSize: 12, color: 'rgba(255,255,255,0.85)', textAlign: 'center',
    paddingHorizontal: 8,
  },

  section: { gap: 6 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  sectionIcon:   { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sectionTitle:  { fontSize: 13, fontWeight: '900', color: '#fff' },

  item: {
    backgroundColor: 'rgba(248,250,251,0.95)',
    borderRadius: 14, padding: 12,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)',
  },
  itemOpen: { borderColor: 'rgba(78,205,196,0.4)' },
  itemTop:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  question: { fontSize: 13, fontWeight: '700', color: C.deep, flex: 1 },
  answer:   { fontSize: 12, color: C.slate, lineHeight: 19, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(78,205,196,0.15)' },

  footer: { fontSize: 10, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 8 },
});