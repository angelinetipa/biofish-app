import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Platform, StatusBar, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

import SpringButton from '../components/SpringButton';
import useDemoMachine from '../components/useDemoMachine';
import DashboardTab  from '../tabs/DashboardTab';
import BatchesTab    from '../tabs/BatchesTab';
import InventoryTab  from '../tabs/InventoryTab';
import FeedbackTab   from '../tabs/FeedbackTab';
import AddInventoryModal from '../modals/AddInventoryModal';
import AddFeedbackModal  from '../modals/AddFeedbackModal';
import { C } from '../constants/theme';
import { API_URL } from '../constants/api';
import StartBatchModal from '../modals/StartBatchModal';
import GameTab from '../tabs/GameTab';

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'home-outline',       iconActive: 'home'        },
  { key: 'batches',   label: 'Batches',   icon: 'list-outline',       iconActive: 'list'        },
  { key: 'inventory', label: 'Inventory', icon: 'layers-outline',     iconActive: 'layers'      },
  { key: 'feedback',  label: 'Feedback',  icon: 'chatbubble-outline', iconActive: 'chatbubble'  },
  { key: 'game',      label: 'Game',      icon: 'game-controller-outline', iconActive: 'game-controller' },
];

export default function DashboardScreen({
  dashboardData, batches, fishScales, additives, feedback,
  activeTab, setActiveTab, refreshing, onRefresh, onLogout, onDashboardUpdate,
}) {
  const [controlling,       setControlling]       = useState(false);
  const [showAddInventory,  setShowAddInventory]  = useState(false);
  const [showAddFeedback,   setShowAddFeedback]   = useState(false);
  const [showStartBatch, setShowStartBatch] = useState(false);

  const demo = useDemoMachine(onDashboardUpdate);

  const bx = useRef(Array.from({ length: 4 }, () => new Animated.Value(0))).current;
  const by = useRef(Array.from({ length: 4 }, () => new Animated.Value(0))).current;

  const bubbleConfigs = [
    { toX: 55,  toY: -40, delay: 0,     dur: 10000 },
    { toX: -45, toY: 35,  delay: 2000,  dur: 11000 },
    { toX: 35,  toY: 45,  delay: 1000,  dur: 9000  },
    { toX: -40, toY: -35, delay: 3000,  dur: 12000 },
  ];

  useEffect(() => {
    bubbleConfigs.forEach(({ toX, toY, delay, dur }, i) => {
      const d = dur / 3;
      setTimeout(() => {
        Animated.loop(Animated.sequence([
          Animated.parallel([
            Animated.timing(bx[i], { toValue: toX,          duration: d, useNativeDriver: true }),
            Animated.timing(by[i], { toValue: toY,          duration: d, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(bx[i], { toValue: -toX * 0.75, duration: d, useNativeDriver: true }),
            Animated.timing(by[i], { toValue: toY * 0.6,   duration: d, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(bx[i], { toValue: 0, duration: d, useNativeDriver: true }),
            Animated.timing(by[i], { toValue: 0, duration: d, useNativeDriver: true }),
          ]),
        ])).start();
      }, delay);
    });
  }, []);

  const sendCommand = (command) => {
    if (command === 'start') {
      if (demo.demoMode) {
        setShowStartBatch(true);
      } else {
        Alert.alert(
          'Pre-Start Checklist',
          'Before starting, please ensure:\n\n' +
          '🐟  Fish scales are loaded into the funnel\n' +
          '💧  Water tank is filled to the required level\n' +
          '🧪  Glycerol container is filled and connected\n' +
          '🔌  Machine is powered on and all connections are secure\n\n' +
          'Proceed only when everything is ready.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Start Machine', onPress: () => setShowStartBatch(true) }
          ]
        );
      }
      return;
    }
    const confirm = {
      stop:     { title: 'Stop Machine',   msg: 'This will terminate the current batch. It cannot be resumed.', btn: 'Stop'  },
      cleaning: { title: 'Start Cleaning', msg: 'Make sure the machine is empty before proceeding.',            btn: 'Start' },
    };
    if (confirm[command]) {
      const { title, msg, btn } = confirm[command];
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
    } catch { Alert.alert('Error', 'Could not reach machine.'); }
    finally { setControlling(false); }
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab dashboardData={dashboardData} controlling={controlling} sendCommand={sendCommand} {...demo} />;
      case 'batches':   return <BatchesTab   batches={batches}   />;
      case 'inventory': return <InventoryTab fishScales={fishScales} additives={additives} onAdd={() => setShowAddInventory(true)} onRefresh={onDashboardUpdate} />;
      case 'feedback':  return <FeedbackTab  feedback={feedback}  onAdd={() => setShowAddFeedback(true)}  />;
      case 'game':      return <GameTab />;
    }
  };

  return (
    <LinearGradient colors={['#4ECDC4', '#3A7CA5', '#2C6B7F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Bubbles */}
      {[
        { w: 380, h: 380, r: 190, top: -140, right: -60  },
        { w: 260, h: 260, r: 130, bottom: 60, left: -80  },
        { w: 150, h: 150, r: 75,  top: '30%', right: -40 },
        { w: 100, h: 100, r: 50,  top: '55%', left: 10   },
      ].map((b, i) => (
        <Animated.View key={i} style={{
          position: 'absolute', width: b.w, height: b.h, borderRadius: b.r,
          top: b.top, bottom: b.bottom, left: b.left, right: b.right,
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)',
          transform: [{ translateX: bx[i] }, { translateY: by[i] }],
        }} />
      ))}
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

      <View style={styles.tabContainer}>
        {renderTab()}
      </View>

      {/* Bottom tab bar */}
      <View style={styles.tabBar}>
        {TABS.map(tab => {
          const active = activeTab === tab.key;
          return (
            <SpringButton key={tab.key} onPress={() => setActiveTab(tab.key)} style={{ flex: 1 }}>
              <View style={styles.tabItem}>
                {active && (
                  <LinearGradient colors={[C.tealLight, C.ocean]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tabActivePill} />
                )}
                <Ionicons name={active ? tab.iconActive : tab.icon} size={22} color={active ? C.teal : C.slate} />
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
              </View>
            </SpringButton>
          );
        })}
      </View>

      <AddInventoryModal visible={showAddInventory} onClose={() => setShowAddInventory(false)} onSuccess={onDashboardUpdate} />
      <AddFeedbackModal  visible={showAddFeedback}  onClose={() => setShowAddFeedback(false)}  onSuccess={onDashboardUpdate} />
      <StartBatchModal
        visible={showStartBatch}
        onClose={() => setShowStartBatch(false)}
        onSuccess={(batch_id) => {
          if (demo.demoMode && batch_id) {
            demo.demoCommand('start', batch_id);
            onDashboardUpdate?.();
          } else {
            setControlling(true);
            axios.post(`${API_URL}/control.php`, { command: 'start' })
              .then(res => {
                if (res.data.success) {
                  onDashboardUpdate?.();
                } else {
                  if (batch_id) {
                    axios.post(`${API_URL}/demo_control.php`, { action: 'rollback', batch_id })
                      .finally(() => onDashboardUpdate?.());
                  } else {
                    onDashboardUpdate?.();
                  }
                  Alert.alert('Error', res.data.message || 'Command failed');
                }
              })
              .catch(() => {
                if (batch_id) {
                  axios.post(`${API_URL}/demo_control.php`, { action: 'rollback', batch_id })
                    .finally(() => {
                      onDashboardUpdate?.(); // ← moved inside, fires AFTER rollback
                    });
                } else {
                  onDashboardUpdate?.();
                }
                Alert.alert('Error', 'Could not reach machine.');
              })
              .finally(() => setControlling(false));
          }
          setShowStartBatch(false);
        }}
      />
    </LinearGradient>
  );
}

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
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerLogo:  { width: 38, height: 38, borderRadius: 10, backgroundColor: C.teal, alignItems: 'center', justifyContent: 'center', shadowColor: '#ffffff', shadowOffset: { width: -3, height: -3 }, shadowOpacity: 0.6, shadowRadius: 8, elevation: 6 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: C.deep, letterSpacing: 0.5 },
  logoutBtn:   { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 7, paddingHorizontal: 12, backgroundColor: 'rgba(78,205,196,0.1)', borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(78,205,196,0.35)' },
  logoutText:  { fontSize: 12, fontWeight: '700', color: C.ocean },
  tabContainer: { flex: 1, padding: 16, paddingBottom: 0 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(248,250,251,0.98)',
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 10, paddingHorizontal: 8,
    shadowColor: '#ffffff', shadowOffset: { width: -4, height: -4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 20,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)', borderBottomWidth: 0,
  },
  tabItem:       { alignItems: 'center', justifyContent: 'center', paddingVertical: 4, borderRadius: 14, position: 'relative' },
  tabActivePill: { position: 'absolute', top: 0, left: '20%', right: '20%', height: 3, borderRadius: 99 },
  tabLabel:      { fontSize: 10, fontWeight: '600', color: C.slate, marginTop: 3, letterSpacing: 0.2 },
  tabLabelActive:{ color: C.teal, fontWeight: '800' },
});