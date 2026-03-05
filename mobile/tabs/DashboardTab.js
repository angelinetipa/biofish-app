import React from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SpringButton from '../components/SpringButton';
import { Card } from '../components/Card';
import MachineCard from '../components/MachineCard';
import { C, S } from '../constants/theme';

export default function DashboardTab({ dashboardData, controlling, sendCommand, demoMode, setDemoMode, demoStatus, demoCommand, stageIndex, timeLeft, temps, onRefresh, refreshing }) {

  const handleCommand = (cmd) => {
    if (cmd === 'start') { sendCommand('start'); return; }
    if (demoMode) demoCommand(cmd);
    else sendCommand(cmd);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ gap: 14, paddingBottom: 16 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing || false}
          onRefresh={onRefresh}
          tintColor={C.teal}
          colors={[C.teal]}
        />
      }
    >
      {/* Demo toggle */}
      <SpringButton onPress={() => {
        if (demoMode && demoStatus !== 'idle') demoCommand('stop');
        setDemoMode(d => !d);
      }}>
        <View style={[styles.demoToggle, demoMode && styles.demoToggleActive]}>
          <Ionicons name={demoMode ? 'flask' : 'flask-outline'} size={15} color={demoMode ? C.teal : C.slate} />
          <Text style={[styles.demoToggleText, demoMode && { color: C.teal }]}>
            {demoMode ? 'Demo Mode ON — no ESP32 needed' : 'Demo Mode OFF — tap to test'}
          </Text>
        </View>
      </SpringButton>

      <MachineCard
        dashboardData={dashboardData}
        controlling={controlling}
        demoMode={demoMode}
        demoStatus={demoStatus}
        stageIndex={stageIndex}
        timeLeft={timeLeft}
        temps={temps}
        handleCommand={handleCommand}
      />

      {/* Metrics */}
      <View style={styles.metricsGrid}>
        {[
          { icon: 'layers',         label: 'Batches',   value: dashboardData.totalBatches      },
          { icon: 'checkmark-done', label: 'Success',   value: `${dashboardData.successRate}%` },
          { icon: 'time',           label: 'Avg Time',  value: `${dashboardData.avgTime}m`     },
          { icon: 'warning',        label: 'Low Stock', value: dashboardData.lowStock          },
        ].map((m, i) => (
          <Card key={i} style={styles.metricCard}>
            <Ionicons name={m.icon} size={22} color={C.ocean} style={{ marginBottom: 6 }} />
            <Text style={styles.metricValue}>{m.value}</Text>
            <Text style={styles.metricLabel}>{m.label}</Text>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  demoToggle:       { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(248,250,251,0.85)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.7)', shadowColor: '#ffffff', shadowOffset: { width: -3, height: -3 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 4 },
  demoToggleActive: { borderColor: 'rgba(78,205,196,0.5)', backgroundColor: 'rgba(248,252,252,0.95)' },
  demoToggleText:   { fontSize: 12, fontWeight: '600', color: C.slate, flex: 1 },
  metricsGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricCard:       { flex: 1, minWidth: '45%', padding: 16, alignItems: 'center' },
  metricValue:      { fontSize: 22, fontWeight: '900', color: C.deep, marginBottom: 2 },
  metricLabel:      { fontSize: 10, fontWeight: '700', color: C.steel, textTransform: 'uppercase', letterSpacing: 0.4 },
});