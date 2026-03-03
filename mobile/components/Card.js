import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, S } from '../constants/theme';

export function Card({ children, style }) {
  return <View style={[S.card, style]}>{children}</View>;
}

export function CardAccent() {
  return (
    <LinearGradient
      colors={['transparent', C.teal, C.ocean, C.teal, 'transparent']}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
      style={{ position: 'absolute', top: 0, left: '5%', right: '5%', height: 3, borderRadius: 99, opacity: 0.75 }}
    />
  );
}

export function Badge({ status }) {
  const map = {
    completed:  { bg: 'rgba(76,175,80,0.12)',   text: '#2E7D32' },
    running:    { bg: 'rgba(78,205,196,0.18)',   text: C.teal    },
    paused:     { bg: 'rgba(240,160,75,0.18)',   text: '#B36B00' },
    stopped:    { bg: 'rgba(192,84,74,0.15)',    text: C.error   },
    cleaning:   { bg: 'rgba(91,155,213,0.18)',   text: C.info    },
    available:  { bg: 'rgba(76,175,80,0.12)',    text: '#2E7D32' },
    ok:         { bg: 'rgba(76,175,80,0.12)',    text: '#2E7D32' },
    low_stock:  { bg: 'rgba(240,160,75,0.18)',   text: '#B36B00' },
    low:        { bg: 'rgba(240,160,75,0.18)',   text: '#B36B00' },
    depleted:   { bg: 'rgba(192,84,74,0.15)',    text: C.error   },
  };
  const s = map[status] || { bg: 'rgba(139,157,175,0.12)', text: C.slate };
  return (
    <View style={[S.badge, { backgroundColor: s.bg }]}>
      <Text style={[S.badgeText, { color: s.text }]}>
        {status?.replace(/_/g, ' ').toUpperCase()}
      </Text>
    </View>
  );
}

export function ClayInput({ label, value, onChangeText, placeholder, keyboardType, multiline }) {
  const [focused, setFocused] = React.useState(false);
  const { TextInput } = require('react-native');
  return (
    <View style={{ marginBottom: 14 }}>
      {label && <Text style={S.label}>{label}</Text>}
      <TextInput
        style={[S.input, focused && S.inputFocused, multiline && { height: 80, textAlignVertical: 'top' }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.slate}
        keyboardType={keyboardType || 'default'}
        multiline={multiline}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}