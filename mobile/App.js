import React, { useState } from 'react';
import { Animated, Alert } from 'react-native';
import axios from 'axios';

import { API_URL } from './constants/api';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';

export default function App() {
  const [screen, setScreen] = useState('splash');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const [dashboardData, setDashboardData] = useState({
    machineStatus: 'idle', currentBatch: null, currentStage: null,
    totalBatches: 0, successRate: 0, avgTime: 0, lowStock: 0,
  });
  const [batches, setBatches] = useState([]);
  const [fishScales, setFishScales] = useState([]);
  const [additives, setAdditives]   = useState([]);
  const [feedback, setFeedback] = useState([]);

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
      setFishScales(materialsRes.data.fish_scales || []);
      setAdditives(materialsRes.data.additives || []);
      if (feedbackRes.data.success) setFeedback(feedbackRes.data.data);
    } catch (e) {
      console.log('Dashboard load error:', e);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth.php`, { username, password });
      if (res.data.success) {
        setScreen('dashboard');
        loadDashboard();
      } else {
        Alert.alert('Error', res.data.message || 'Invalid credentials');
      }
    } catch {
      Alert.alert('Error', 'Connection failed. Check your API URL.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => setScreen('login') },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  if (screen === 'splash') {
    return <SplashScreen fadeAnim={fadeAnim} onDone={() => setScreen('login')} />;
  }

  if (screen === 'login') {
    return (
      <LoginScreen
        username={username} setUsername={setUsername}
        password={password} setPassword={setPassword}
        loading={loading} onLogin={handleLogin}
      />
    );
  }

  return (
    <DashboardScreen
      onDashboardUpdate={loadDashboard}
      dashboardData={dashboardData} batches={batches}
      fishScales={fishScales}
      additives={additives} feedback={feedback}
      activeTab={activeTab} setActiveTab={setActiveTab}
      refreshing={refreshing} onRefresh={onRefresh}
      onLogout={handleLogout}
    />
  );
}