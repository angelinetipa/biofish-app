import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge } from '../components/Card';
import SpringButton from '../components/SpringButton';
import { C, S } from '../constants/theme';

export default function InventoryTab({ materials, onAdd }) {
  return (
    <Card style={S.tabCard}>
      <View style={S.tabContentPad}>
        <View style={S.tabTitleRow}>
          <Text style={S.sectionTitle}>Inventory</Text>
          <SpringButton onPress={onAdd}>
            <LinearGradient colors={[C.tealLight, C.ocean]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.addBtn}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={S.addBtnText}>Add</Text>
            </LinearGradient>
          </SpringButton>
        </View>
      </View>
      <ScrollView style={S.tabScroll} showsVerticalScrollIndicator={false}>
        <View style={S.tabScrollInner}>
          {materials.length === 0
            ? <Text style={S.emptyText}>No materials yet</Text>
            : materials.map((m, i) => (
              <View key={i} style={S.listRow}>
                <View style={{ flex: 1 }}>
                  <Text style={S.listTitle}>{m.name || m.fish_scale_type || m.additive_name}</Text>
                  <Text style={S.listSub}>
                    {m.quantity_kg ? `${m.quantity_kg} kg` : m.quantity_ml ? `${m.quantity_ml} mL` : `${m.quantity} ${m.unit || ''}`}
                  </Text>
                </View>
                <Badge status={m.status} />
              </View>
            ))}
        </View>
      </ScrollView>
    </Card>
  );
}