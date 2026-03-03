import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { C } from '../constants/theme';

export default function SplashScreen({ fadeAnim, onDone }) {
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
    setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true })
        .start(onDone);
    }, 2500);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.emoji}>🐟</Text>
        <Text style={styles.title}>BIO-FISH</Text>
        <Text style={styles.subtitle}>Bioplastic Formation System</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.ocean, alignItems: 'center', justifyContent: 'center' },
  content: { alignItems: 'center' },
  emoji: { fontSize: 100, marginBottom: 20 },
  title: { fontSize: 48, fontWeight: 'bold', color: '#ffffff', marginBottom: 10 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
});