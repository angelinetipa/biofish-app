import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, ActivityIndicator, Animated, ScrollView, RefreshControl } from 'react-native';
import axios from 'axios';

const API_URL = 'http://192.168.0.117/biofish-backend/api'; // CHANGE THIS

// EXACT colors from variables.css
const colors = {
  primaryTeal: '#4ECDC4',
  primaryOcean: '#3A7CA5',
  primaryDeep: '#2C6B7F',
  neutralSnow: '#F8FAFB',
  neutralWhite: '#FFFFFF',
  neutralMist: '#EDF2F4',
  neutralSlate: '#8B9DAF',
  neutralSteel: '#627D98',
  neutralCharcoal: '#3E4C59',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
};

export default function App() {
  const [screen, setScreen] = useState('splash'); // splash, login, dashboard
  const [activeTab, setActiveTab] = useState('monitoring'); // monitoring, inventory, feedback
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  
  // Dashboard data
  const [dashboardData, setDashboardData] = useState({
    machineStatus: 'idle',
    currentBatch: null,
    currentStage: null,
    totalBatches: 0,
    successRate: 0,
    avgTime: 0,
    lowStock: 0,
  });
  
  const [batches, setBatches] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [feedback, setFeedback] = useState([]);

  // Splash animation
  useEffect(() => {
    if (screen === 'splash') {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => setScreen('login'));
      }, 2500);
    }
  }, [screen]);

  // Load dashboard data
  const loadDashboard = async () => {
    try {
      const [statusRes, batchesRes, materialsRes, feedbackRes] = await Promise.all([
        axios.get(`${API_URL}/dashboard.php?type=metrics`),
        axios.get(`${API_URL}/dashboard.php?type=batches`),
        axios.get(`${API_URL}/dashboard.php?type=materials`),
        axios.get(`${API_URL}/dashboard.php?type=feedback`),
      ]);
      
      if (statusRes.data.success) setDashboardData(statusRes.data.data);
      if (batchesRes.data.success) setBatches(batchesRes.data.data);
      if (materialsRes.data.success) setMaterials(materialsRes.data.data);
      if (feedbackRes.data.success) setFeedback(feedbackRes.data.data);
    } catch (error) {
      console.log('Error loading dashboard:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  useEffect(() => {
    if (screen === 'dashboard') {
      loadDashboard();
    }
  }, [screen]);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/login.php`, { username, password });
      if (response.data.success) {
        setScreen('dashboard');
      } else {
        Alert.alert('Error', 'Invalid username or password');
      }
    } catch (error) {
      Alert.alert('Error', 'Cannot connect to server');
    }
    setLoading(false);
  };

  const sendCommand = async (command) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/control.php`, { command });
      if (response.data.success) {
        Alert.alert('Success', `${command} command sent`);
        await loadDashboard(); // Refresh data
      } else {
        Alert.alert('Error', response.data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Cannot connect to server');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => setScreen('login') },
    ]);
  };

  // SPLASH SCREEN
  if (screen === 'splash') {
    return (
      <View style={styles.splashContainer}>
        <Animated.View style={[styles.splashContent, { opacity: fadeAnim }]}>
          <Text style={styles.logoEmoji}>🐟</Text>
          <Text style={styles.splashTitle}>BIO-FISH</Text>
          <Text style={styles.splashSubtitle}>Bioplastic Formation System</Text>
        </Animated.View>
      </View>
    );
  }

  // LOGIN SCREEN
  if (screen === 'login') {
    return (
      <View style={styles.authPage}>
        <View style={styles.decorBubble1} />
        <View style={styles.decorBubble2} />
        
        <View style={styles.loginWrapper}>
          <View style={styles.loginContainer}>
            <View style={styles.accentLine} />
            
            <View style={styles.logoSection}>
              <Text style={styles.logoClay}>🐟</Text>
              <Text style={styles.appName}>BIO-FISH</Text>
              <Text style={styles.appDesc}>Bioplastic Formation System</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>USERNAME</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor={colors.neutralSlate}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={colors.neutralSlate}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color={colors.neutralWhite} /> : <Text style={styles.btnText}>SIGN IN</Text>}
            </TouchableOpacity>

            <View style={styles.demoClayCard}>
              <Text style={styles.demoTitle}>🔒 Demo Credentials</Text>
              <View style={styles.credentialItem}>
                <Text style={styles.credLabel}>Admin</Text>
                <Text style={styles.credValue}>admin / password123</Text>
              </View>
              <View style={styles.credentialItem}>
                <Text style={styles.credLabel}>Operator</Text>
                <Text style={styles.credValue}>operator1 / password123</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // DASHBOARD SCREEN - EXACT REPLICA
  return (
    <View style={styles.dashboardPage}>
      <View style={styles.decorBubble1} />
      <View style={styles.decorBubble2} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🐟 BIO-FISH</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutBtn}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryTeal} />}
      >
        {/* METRICS */}
        <View style={styles.metricsContainer}>
          {/* Large Machine Status */}
          <View style={[styles.metricCard, styles.machineStatusCard, dashboardData.machineStatus === 'running' && styles.statusRunning]}>
            <Text style={styles.metricLabel}>MACHINE STATUS</Text>
            <Text style={styles.metricValueLarge}>{dashboardData.machineStatus.toUpperCase()}</Text>
            {dashboardData.currentBatch && (
              <Text style={styles.currentBatchText}>{dashboardData.currentBatch}</Text>
            )}
          </View>

          {/* 4 Metrics Grid */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCardSmall}>
              <Text style={styles.metricIcon}>📦</Text>
              <Text style={styles.metricLabelSmall}>Total Batches</Text>
              <Text style={styles.metricValueSmall}>{dashboardData.totalBatches}</Text>
            </View>
            <View style={styles.metricCardSmall}>
              <Text style={styles.metricIcon}>✅</Text>
              <Text style={styles.metricLabelSmall}>Success Rate</Text>
              <Text style={styles.metricValueSmall}>{dashboardData.successRate}%</Text>
            </View>
            <View style={styles.metricCardSmall}>
              <Text style={styles.metricIcon}>⏱️</Text>
              <Text style={styles.metricLabelSmall}>Avg Time</Text>
              <Text style={styles.metricValueSmall}>{dashboardData.avgTime}min</Text>
            </View>
            <View style={styles.metricCardSmall}>
              <Text style={styles.metricIcon}>⚠️</Text>
              <Text style={styles.metricLabelSmall}>Low Stock</Text>
              <Text style={[styles.metricValueSmall, dashboardData.lowStock > 0 && {color: colors.error}]}>{dashboardData.lowStock}</Text>
            </View>
          </View>
        </View>

        {/* TABS */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabButtons}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'monitoring' && styles.tabBtnActive]}
              onPress={() => setActiveTab('monitoring')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'monitoring' && styles.tabBtnTextActive]}>Monitoring</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'inventory' && styles.tabBtnActive]}
              onPress={() => setActiveTab('inventory')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'inventory' && styles.tabBtnTextActive]}>Inventory</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'feedback' && styles.tabBtnActive]}
              onPress={() => setActiveTab('feedback')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'feedback' && styles.tabBtnTextActive]}>Feedback</Text>
            </TouchableOpacity>
          </View>

          {/* TAB CONTENT - MONITORING */}
          {activeTab === 'monitoring' && (
            <View style={styles.tabContent}>
              <Text style={styles.tabTitle}>Machine Control</Text>
              
              <View style={styles.controlGrid}>
                <TouchableOpacity style={[styles.controlBtn, styles.startBtn]} onPress={() => sendCommand('start')} disabled={loading}>
                  <Text style={styles.controlBtnText}>START</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.controlBtn, styles.pauseBtn]} onPress={() => sendCommand('pause')} disabled={loading}>
                  <Text style={styles.controlBtnText}>PAUSE</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.controlBtn, styles.stopBtn]} onPress={() => sendCommand('stop')} disabled={loading}>
                  <Text style={styles.controlBtnText}>STOP</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.controlBtn, styles.cleanBtn]} onPress={() => sendCommand('cleaning')} disabled={loading}>
                  <Text style={styles.controlBtnText}>CLEANING</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.tabTitle}>Recent Batches</Text>
              {batches.slice(0, 5).map((batch, index) => (
                <View key={index} style={styles.listItem}>
                  <View>
                    <Text style={styles.listItemTitle}>{batch.batch_code}</Text>
                    <Text style={styles.listItemSubtitle}>{batch.fish_scale_type} • {batch.date}</Text>
                  </View>
                  <View style={[styles.badge, batch.status === 'completed' ? styles.badgeSuccess : styles.badgeWarning]}>
                    <Text style={styles.badgeText}>{batch.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* TAB CONTENT - INVENTORY */}
          {activeTab === 'inventory' && (
            <View style={styles.tabContent}>
              <Text style={styles.tabTitle}>Fish Scales Inventory</Text>
              {materials.map((material, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={{flex: 1}}>
                    <Text style={styles.listItemTitle}>{material.fish_scale_type}</Text>
                    <Text style={styles.listItemSubtitle}>{material.source_location} • {material.date_collected}</Text>
                  </View>
                  <View>
                    <Text style={styles.quantityText}>{material.quantity_kg} kg</Text>
                    <View style={[styles.badge, material.status === 'available' ? styles.badgeSuccess : styles.badgeError]}>
                      <Text style={styles.badgeText}>{material.status}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* TAB CONTENT - FEEDBACK */}
          {activeTab === 'feedback' && (
            <View style={styles.tabContent}>
              <Text style={styles.tabTitle}>Quality Feedback</Text>
              {feedback.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={{flex: 1}}>
                    <Text style={styles.listItemTitle}>{item.batch_code}</Text>
                    <Text style={styles.listItemSubtitle}>Rating: {'⭐'.repeat(item.rating)} • {item.date}</Text>
                    {item.comments && <Text style={styles.feedbackPreview}>{item.comments.substring(0, 80)}...</Text>}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... (keeping all previous splash and login styles)
  splashContainer: { flex: 1, backgroundColor: colors.primaryOcean, alignItems: 'center', justifyContent: 'center' },
  splashContent: { alignItems: 'center' },
  logoEmoji: { fontSize: 100, marginBottom: 20 },
  splashTitle: { fontSize: 48, fontWeight: 'bold', color: colors.neutralWhite, marginBottom: 10 },
  splashSubtitle: { fontSize: 16, color: 'rgba(255, 255, 255, 0.8)' },
  authPage: { flex: 1, backgroundColor: colors.primaryOcean },
  decorBubble1: { position: 'absolute', width: 400, height: 400, borderRadius: 200, top: -150, right: '10%', backgroundColor: 'rgba(78, 205, 196, 0.2)' },
  decorBubble2: { position: 'absolute', width: 300, height: 300, borderRadius: 150, bottom: -100, left: '8%', backgroundColor: 'rgba(58, 124, 165, 0.15)' },
  loginWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  loginContainer: { backgroundColor: 'rgba(248, 250, 251, 0.97)', borderRadius: 24, padding: 28, width: '100%', maxWidth: 360, shadowColor: '#2C6B7F', shadowOffset: { width: 16, height: 16 }, shadowOpacity: 0.15, shadowRadius: 48, elevation: 15 },
  accentLine: { position: 'absolute', top: 0, left: '5%', right: '5%', height: 3, backgroundColor: colors.primaryTeal, borderRadius: 50, opacity: 0.7 },
  logoSection: { alignItems: 'center', marginBottom: 24 },
  logoClay: { fontSize: 60, width: 80, height: 80, textAlign: 'center', lineHeight: 80, borderRadius: 50, backgroundColor: 'rgba(168, 224, 218, 0.25)', marginBottom: 12, shadowColor: '#2C6B7F', shadowOffset: { width: 6, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16 },
  appName: { fontSize: 24, fontWeight: '900', color: colors.primaryDeep, marginBottom: 4 },
  appDesc: { fontSize: 12, color: colors.neutralSlate },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: colors.neutralCharcoal, marginBottom: 6, letterSpacing: 0.3 },
  input: { backgroundColor: colors.neutralSnow, borderRadius: 14, padding: 10, fontSize: 13, borderWidth: 2, borderColor: 'transparent', shadowColor: '#2C6B7F', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
  btnPrimary: { backgroundColor: colors.primaryTeal, borderRadius: 14, padding: 11, alignItems: 'center', marginTop: 8, shadowColor: '#2C6B7F', shadowOffset: { width: 6, height: 6 }, shadowOpacity: 0.25, shadowRadius: 14, elevation: 10 },
  btnText: { color: colors.neutralWhite, fontSize: 14, fontWeight: '700', letterSpacing: 0.4 },
  demoClayCard: { backgroundColor: 'rgba(168, 224, 218, 0.2)', borderRadius: 14, padding: 16, marginTop: 20 },
  demoTitle: { fontSize: 12, fontWeight: '600', color: colors.primaryDeep, marginBottom: 10 },
  credentialItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 12, padding: 9, marginBottom: 8 },
  credLabel: { fontSize: 11, fontWeight: '600', color: colors.neutralSteel },
  credValue: { fontSize: 11, fontWeight: '700', color: colors.primaryDeep, fontFamily: 'monospace', backgroundColor: 'rgba(168, 224, 218, 0.3)', paddingVertical: 4, paddingHorizontal: 9, borderRadius: 8 },

  // DASHBOARD
  dashboardPage: { flex: 1, backgroundColor: colors.primaryOcean },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(248, 250, 251, 0.97)', padding: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, shadowColor: '#2C6B7F', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 12 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.primaryDeep },
  logoutBtn: { fontSize: 14, fontWeight: '600', color: colors.primaryTeal },
  scrollContainer: { flex: 1 },
  
  // METRICS
  metricsContainer: { padding: 16 },
  machineStatusCard: { backgroundColor: 'rgba(248, 250, 251, 0.97)', borderRadius: 20, padding: 24, marginBottom: 16, shadowColor: '#2C6B7F', shadowOffset: { width: 8, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  statusRunning: { backgroundColor: 'rgba(212, 237, 218, 0.97)' },
  metricLabel: { fontSize: 10, fontWeight: '700', color: colors.neutralSteel, letterSpacing: 0.5, marginBottom: 8 },
  metricValueLarge: { fontSize: 32, fontWeight: '800', color: colors.primaryDeep },
  currentBatchText: { fontSize: 12, color: colors.neutralCharcoal, marginTop: 8 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  metricCardSmall: { width: '48%', backgroundColor: 'rgba(248, 250, 251, 0.97)', borderRadius: 16, padding: 16, marginBottom: 12, alignItems: 'center', shadowColor: '#2C6B7F', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6 },
  metricCard: { backgroundColor: 'rgba(248, 250, 251, 0.97)', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#2C6B7F', shadowOffset: { width: 8, height: 8 }, shadowOpacity: 0.12, shadowRadius: 18, elevation: 10 },
  metricIcon: { fontSize: 28, marginBottom: 8 },
  metricLabelSmall: { fontSize: 10, fontWeight: '600', color: colors.neutralSteel, textAlign: 'center', marginBottom: 4 },
  metricValueSmall: { fontSize: 20, fontWeight: '800', color: colors.primaryDeep },

  // TABS
  tabsContainer: { backgroundColor: 'rgba(248, 250, 251, 0.97)', borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: 16, padding: 16, minHeight: 400 },
  tabButtons: { flexDirection: 'row', marginBottom: 20 },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: colors.primaryTeal },
  tabBtnText: { fontSize: 12, fontWeight: '600', color: colors.neutralSlate },
  tabBtnTextActive: { color: colors.primaryTeal, fontWeight: '700' },
  tabContent: { paddingBottom: 40 },
  tabTitle: { fontSize: 16, fontWeight: '700', color: colors.primaryDeep, marginBottom: 16, marginTop: 8 },

  // CONTROL BUTTONS
  controlGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  controlBtn: { width: '48%', padding: 16, borderRadius: 14, marginBottom: 12, alignItems: 'center', shadowColor: '#2C6B7F', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 8 },
  startBtn: { backgroundColor: colors.success },
  pauseBtn: { backgroundColor: colors.warning },
  stopBtn: { backgroundColor: colors.error },
  cleanBtn: { backgroundColor: colors.info },
  controlBtnText: { color: colors.neutralWhite, fontSize: 14, fontWeight: '700', letterSpacing: 0.4 },

  // LIST ITEMS
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.neutralSnow, borderRadius: 12, padding: 12, marginBottom: 8, shadowColor: '#2C6B7F', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
  listItemTitle: { fontSize: 14, fontWeight: '700', color: colors.primaryDeep, marginBottom: 4 },
  listItemSubtitle: { fontSize: 11, color: colors.neutralSlate },
  feedbackPreview: { fontSize: 11, color: colors.neutralCharcoal, marginTop: 4, fontStyle: 'italic' },
  quantityText: { fontSize: 16, fontWeight: '700', color: colors.primaryDeep, textAlign: 'right', marginBottom: 4 },
  badge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, marginTop: 4 },
  badgeSuccess: { backgroundColor: 'rgba(76, 175, 80, 0.2)' },
  badgeWarning: { backgroundColor: 'rgba(255, 152, 0, 0.2)' },
  badgeError: { backgroundColor: 'rgba(244, 67, 54, 0.2)' },
  badgeText: { fontSize: 10, fontWeight: '700', color: colors.primaryDeep },
});