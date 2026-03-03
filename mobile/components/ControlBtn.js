import React from 'react';
import { Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import SpringButton from './SpringButton';
import { C } from '../constants/theme';

export default function ControlBtn({ label, iconName, colors: gc, onPress, disabled }) {
  return (
    <SpringButton onPress={onPress} disabled={disabled} style={[styles.wrap, disabled && styles.wrapDisabled]}>
      <LinearGradient
        colors={disabled ? ['#C8D4D8', '#B0BEC5'] : gc}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.btn, disabled && styles.btnDisabled]}
      >
        <Ionicons name={iconName} size={22} color={disabled ? C.slate : '#fff'} />
        <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
      </LinearGradient>
    </SpringButton>
  );
}

const styles = {
  wrap: {
    flex: 1, minWidth: '45%', borderRadius: 14,
    shadowColor: '#ffffff', shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 0.5, shadowRadius: 10, elevation: 8,
  },
  wrapDisabled: { shadowOpacity: 0.15, elevation: 2 },
  btn: {
    borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  btnDisabled: { borderColor: 'rgba(255,255,255,0.1)' },
  label: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 0.4 },
  labelDisabled: { color: '#8B9DAF' },
};