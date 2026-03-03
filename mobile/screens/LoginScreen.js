import React, { useRef, useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ActivityIndicator, Animated, StatusBar, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SpringButton from '../components/SpringButton';

export default function LoginScreen({ username, setUsername, password, setPassword, loading, onLogin }) {
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const bx = Array.from({ length: 6 }, () => useRef(new Animated.Value(0)).current);
  const by = Array.from({ length: 6 }, () => useRef(new Animated.Value(0)).current);

  const configs = [
    { toX: 40,  toY: -35, delay: 0,     dur: 25000 },
    { toX: -30, toY: 25,  delay: 7000,  dur: 25000 },
    { toX: 20,  toY: 30,  delay: 3000,  dur: 20000 },
    { toX: -25, toY: -20, delay: 11000, dur: 22000 },
    { toX: 15,  toY: -28, delay: 5000,  dur: 18000 },
    { toX: -18, toY: 22,  delay: 9000,  dur: 23000 },
  ];

  useEffect(() => {
    configs.forEach(({ toX, toY, delay, dur }, i) => {
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

  const bubbleDefs = [
    { w: 420, h: 420, r: 210, top: -160,     right: -60   },
    { w: 320, h: 320, r: 160, bottom: -120,  left: -70    },
    { w: 180, h: 180, r: 90,  top: '40%',    right: -50   },
    { w: 130, h: 130, r: 65,  top: '12%',    left: -30    },
    { w: 80,  h: 80,  r: 40,  top: '25%',    right: 20    },
    { w: 100, h: 100, r: 50,  bottom: '15%', left: '40%'  },
  ];

  return (
    <LinearGradient colors={['#4ECDC4', '#3A7CA5', '#2C6B7F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
      <StatusBar barStyle="light-content" />

      {bubbleDefs.map((b, i) => (
        <Animated.View key={i} style={[styles.bubble, {
          width: b.w, height: b.h, borderRadius: b.r,
          top: b.top, bottom: b.bottom, left: b.left, right: b.right,
          transform: [{ translateX: bx[i] }, { translateY: by[i] }],
        }]} />
      ))}

      <View style={styles.wrapper}>
        <View style={styles.card}>
          <LinearGradient
            colors={['transparent', '#4ECDC4', '#3A7CA5', '#4ECDC4', 'transparent']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.accentLine}
          />

          <View style={styles.logoSection}>
            <View style={styles.logoGlow}>
              <LinearGradient colors={['#5DD9D2', '#3A7CA5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logoBox}>
                <Text style={styles.logoEmoji}>🐟</Text>
              </LinearGradient>
            </View>
            <Text style={styles.appName}>BIO-FISH</Text>
            <Text style={styles.appDesc}>Bioplastic Sheet Production from Fish Scales</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>USERNAME</Text>
            <TextInput
              style={[styles.input, usernameFocused && styles.inputFocused]}
              placeholder="Enter your username" placeholderTextColor="#8B9DAF"
              value={username} onChangeText={setUsername}
              onFocus={() => setUsernameFocused(true)} onBlur={() => setUsernameFocused(false)}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={[styles.input, passwordFocused && styles.inputFocused]}
              placeholder="Enter your password" placeholderTextColor="#8B9DAF"
              value={password} onChangeText={setPassword}
              onFocus={() => setPasswordFocused(true)} onBlur={() => setPasswordFocused(false)}
              secureTextEntry
            />
          </View>

          <SpringButton onPress={onLogin} disabled={loading} style={styles.btnWrap}>
            <LinearGradient colors={['#5DD9D2', '#3A7CA5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>SIGN IN</Text>}
            </LinearGradient>
          </SpringButton>

          <View style={styles.demoCard}>
            <Text style={styles.demoTitle}>🔒  DEMO CREDENTIALS</Text>
            {[
              { label: 'Admin',    value: 'admin / password123'     },
              { label: 'Operator', value: 'operator1 / password123' },
            ].map((c, i) => (
              <View key={i} style={[styles.credRow, i === 1 && { marginBottom: 0 }]}>
                <Text style={styles.credLabel}>{c.label}</Text>
                <View style={styles.credValueWrap}>
                  <Text style={styles.credValue}>{c.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  wrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },

  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#ffffff',
    shadowOffset: { width: -6, height: -6 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
  },

  card: {
    width: '100%', maxWidth: 360,
    backgroundColor: 'rgba(248,250,251,0.97)',
    borderRadius: 24,
    paddingTop: 36, paddingBottom: 28,
    shadowColor: '#ffffff',
    shadowOffset: { width: -8, height: -8 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.88)',
  },

  accentLine: {
    position: 'absolute', top: 0, left: '5%', right: '5%',
    height: 3, borderRadius: 99, opacity: 0.75,
  },

  logoSection: { alignItems: 'center', marginBottom: 20, paddingHorizontal: 32 },
  logoGlow: {
    borderRadius: 16, marginBottom: 12,
    shadowColor: '#ffffff',
    shadowOffset: { width: -5, height: -5 },
    shadowOpacity: 0.7, shadowRadius: 14, elevation: 8,
  },
  logoBox: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
  },
  logoEmoji: { fontSize: 28 },
  appName: { fontSize: 20, fontWeight: '900', color: '#2C6B7F', marginBottom: 4, letterSpacing: 0.5 },
  appDesc: { fontSize: 11, color: '#627D98', textAlign: 'center', letterSpacing: 0.3 },

  formGroup: { marginBottom: 14, paddingHorizontal: 32 },
  label: { fontSize: 11, fontWeight: '800', color: '#3E4C59', letterSpacing: 0.8, marginBottom: 7 },

  input: {
    backgroundColor: '#E4EDF1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 13 : 10,
    fontSize: 13, color: '#3E4C59',
    borderWidth: 2, borderColor: 'transparent',
  },
  inputFocused: {
    borderColor: '#4ECDC4',
    backgroundColor: '#f0fafa',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35, shadowRadius: 8,
  },

  btnWrap: {
    marginHorizontal: 32, marginTop: 8,
    borderRadius: 14,
    shadowColor: '#ffffff',
    shadowOffset: { width: -5, height: -5 },
    shadowOpacity: 0.55, shadowRadius: 12, elevation: 10,
  },
  btn: {
    borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  btnText: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 0.4 },

  demoCard: {
    marginHorizontal: 32, marginTop: 20,
    padding: 14,
    backgroundColor: 'rgba(209,236,241,0.55)',
    borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.85)',
  },
  demoTitle: {
    fontSize: 10, fontWeight: '800', color: '#3A7CA5',
    marginBottom: 10, letterSpacing: 0.8, textTransform: 'uppercase',
  },
  credRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10, padding: 10, marginBottom: 8,
    shadowColor: '#ffffff',
    shadowOffset: { width: -3, height: -3 },
    shadowOpacity: 0.6, shadowRadius: 6, elevation: 2,
  },
  credLabel: { fontSize: 12, fontWeight: '600', color: '#627D98' },
  credValueWrap: {
    backgroundColor: 'rgba(168,224,218,0.35)',
    borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10,
  },
  credValue: {
    fontSize: 11, fontWeight: '700', color: '#2C6B7F',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});