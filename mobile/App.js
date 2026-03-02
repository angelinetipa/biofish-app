import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, ActivityIndicator, Animated } from 'react-native';
import axios from 'axios';

const API_URL = 'http://192.168.0.117/biofish-backend/api'; // CHANGE THIS

// EXACT colors from variables.css
const colors = {
  primaryTeal: '#4ECDC4',
  primaryOcean: '#3A7CA5',
  primarySeafoam: '#7FB8B0',
  primaryAqua: '#A8E0DA',
  primaryDeep: '#2C6B7F',
  secondaryTurquoise: '#5DD9D2',
  secondarySky: '#507BA8',
  secondaryMint: '#95C9C3',
  secondaryPearl: '#C7EDE8',
  secondaryNavy: '#1F5568',
  neutralWhite: '#FFFFFF',
  neutralSnow: '#F8FAFB',
  neutralMist: '#EDF2F4',
  neutralCloud: '#D9E2EC',
  neutralSlate: '#8B9DAF',
  neutralSteel: '#627D98',
  neutralCharcoal: '#3E4C59',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
};

export default function App() {
  const [screen, setScreen] = useState('splash');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [fadeAnim] = useState(new Animated.Value(0));

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

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/login.php`, { username, password });
      if (response.data.success) {
        setScreen('control');
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
    setStatus(`Sending ${command}...`);
    try {
      const response = await axios.post(`${API_URL}/control.php`, { command });
      if (response.data.success) {
        setStatus(`${command} activated`);
        Alert.alert('Success', `${command} command sent`);
      } else {
        setStatus('Failed');
        Alert.alert('Error', response.data.message);
      }
    } catch (error) {
      setStatus('Connection failed');
      Alert.alert('Error', 'Cannot connect to server');
    }
    setLoading(false);
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

  // LOGIN SCREEN - EXACT REPLICA
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

            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.neutralWhite} />
              ) : (
                <Text style={styles.btnText}>SIGN IN</Text>
              )}
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

  // CONTROL SCREEN - EXACT REPLICA
  return (
    <View style={styles.controlPage}>
      <View style={styles.decorBubble1} />
      <View style={styles.decorBubble2} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🐟 BIO-FISH Controller</Text>
      </View>

      <View style={styles.container}>
        <Text style={styles.statusText}>{status}</Text>

        <View style={styles.buttonGrid}>
          <TouchableOpacity
            style={[styles.controlBtn, styles.startBtn]}
            onPress={() => sendCommand('start')}
            disabled={loading}
          >
            <Text style={styles.controlBtnText}>START</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, styles.pauseBtn]}
            onPress={() => sendCommand('pause')}
            disabled={loading}
          >
            <Text style={styles.controlBtnText}>PAUSE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, styles.stopBtn]}
            onPress={() => sendCommand('stop')}
            disabled={loading}
          >
            <Text style={styles.controlBtnText}>STOP</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, styles.cleanBtn]}
            onPress={() => sendCommand('cleaning')}
            disabled={loading}
          >
            <Text style={styles.controlBtnText}>CLEANING</Text>
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator size="large" color={colors.primaryTeal} style={styles.loader} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // SPLASH
  splashContainer: {
    flex: 1,
    backgroundColor: colors.primaryOcean,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashContent: {
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 100,
    marginBottom: 20,
  },
  splashTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.neutralWhite,
    marginBottom: 10,
  },
  splashSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // AUTH PAGE - EXACT
  authPage: {
    flex: 1,
    backgroundColor: colors.primaryOcean,
  },
  decorBubble1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    top: -150,
    right: '10%',
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
  },
  decorBubble2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    bottom: -100,
    left: '8%',
    backgroundColor: 'rgba(58, 124, 165, 0.15)',
  },
  loginWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loginContainer: {
    backgroundColor: 'rgba(248, 250, 251, 0.97)',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 360,
    shadowColor: '#2C6B7F',
    shadowOffset: { width: 16, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 48,
    elevation: 15,
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: '5%',
    right: '5%',
    height: 3,
    backgroundColor: colors.primaryTeal,
    borderRadius: 50,
    opacity: 0.7,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoClay: {
    fontSize: 60,
    width: 80,
    height: 80,
    textAlign: 'center',
    lineHeight: 80,
    borderRadius: 50,
    backgroundColor: 'rgba(168, 224, 218, 0.25)',
    marginBottom: 12,
    shadowColor: '#2C6B7F',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primaryDeep,
    marginBottom: 4,
  },
  appDesc: {
    fontSize: 12,
    color: colors.neutralSlate,
  },

  // FORM - EXACT
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutralCharcoal,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: colors.neutralSnow,
    borderRadius: 14,
    padding: 10,
    fontSize: 13,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#2C6B7F',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },

  // BUTTON - EXACT
  btnPrimary: {
    backgroundColor: colors.primaryTeal,
    borderRadius: 14,
    padding: 11,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2C6B7F',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 10,
  },
  btnText: {
    color: colors.neutralWhite,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  // DEMO CARD - EXACT
  demoClayCard: {
    backgroundColor: 'rgba(168, 224, 218, 0.2)',
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDeep,
    marginBottom: 10,
  },
  credentialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 9,
    marginBottom: 8,
    shadowColor: '#2C6B7F',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  credLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutralSteel,
    letterSpacing: 0.2,
  },
  credValue: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDeep,
    fontFamily: 'monospace',
    backgroundColor: 'rgba(168, 224, 218, 0.3)',
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 8,
  },

  // CONTROL PAGE
  controlPage: {
    flex: 1,
    backgroundColor: colors.primaryOcean,
  },
  header: {
    backgroundColor: 'rgba(248, 250, 251, 0.97)',
    padding: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#2C6B7F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primaryDeep,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    color: colors.neutralWhite,
    fontWeight: '600',
    marginBottom: 40,
  },
  buttonGrid: {
    width: '100%',
    maxWidth: 300,
  },

  // CONTROL BUTTONS - EXACT
  controlBtn: {
    padding: 20,
    borderRadius: 14,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#2C6B7F',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 10,
  },
  startBtn: {
    backgroundColor: colors.success,
  },
  pauseBtn: {
    backgroundColor: colors.warning,
  },
  stopBtn: {
    backgroundColor: colors.error,
  },
  cleanBtn: {
    backgroundColor: colors.info,
  },
  controlBtnText: {
    color: colors.neutralWhite,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  loader: {
    marginTop: 20,
  },
});