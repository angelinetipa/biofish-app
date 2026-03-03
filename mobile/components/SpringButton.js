import React, { useRef } from 'react';
import { Animated, TouchableOpacity } from 'react-native';

export default function SpringButton({ onPress, disabled, style, children }) {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn  = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, friction: 4, tension: 200, useNativeDriver: true }).start();
  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity onPress={onPress} disabled={disabled} onPressIn={pressIn} onPressOut={pressOut} activeOpacity={0.9}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}