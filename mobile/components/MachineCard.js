import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardAccent } from './Card';
import ControlBtn from './ControlBtn';
import { C } from '../constants/theme';
import { STAGES } from './useDemoMachine';

const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

export default function MachineCard({ dashboardData, controlling, demoMode, demoStatus, stageIndex, timeLeft, temps, handleCommand }) {
  const status      = demoMode ? demoStatus : (dashboardData.machineStatus || 'idle');
  const statusColor = { idle: C.slate, running: C.success, paused: C.warning, stopped: C.error, cleaning: C.info }[status] || C.slate;
  const isIdle      = status === 'idle';
  const isRunning   = status === 'running';
  const isPaused    = status === 'paused';
  const isBusy      = isRunning || isPaused;
  const isCleaning  = status === 'cleaning';
  const stageLabel  = demoMode ? STAGES[stageIndex]?.label : dashboardData.currentStage?.replace(/_/g,' ');

  return (
    <Card style={styles.card}>
      <CardAccent />

      {/* Status */}
      <View style={styles.statusRow}>
        <View>
          <Text style={styles.statusLabel}>MACHINE STATUS</Text>
          <View style={styles.statusValueRow}>
            <View style={[styles.dot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusValue, { color: statusColor }]}>{status.toUpperCase()}</Text>
          </View>
          {(dashboardData.currentBatch || demoMode) && (
            <Text style={styles.batchCode}>Batch: {demoMode ? 'DEMO-001' : dashboardData.currentBatch}</Text>
          )}
        </View>
        {controlling && !demoMode && <ActivityIndicator color={C.teal} size="large" />}
      </View>

      {/* Stage progress */}
      {(isRunning || isPaused) && (
        <View style={styles.stageBox}>
          <View style={styles.stageHeader}>
            <Text style={styles.stageStep}>CURRENT STAGE</Text>
            <View style={styles.timerBadge}>
              <Ionicons name="timer-outline" size={13} color={C.ocean} />
              <Text style={styles.timerText}>{fmt(timeLeft || dashboardData.timeLeft || 0)}</Text>
            </View>
          </View>
          <View style={styles.stageDots}>
            {STAGES.map((s, i) => (
              <View key={i} style={styles.stageDotItem}>
                <View style={[styles.stageDot, i < stageIndex && styles.dotDone, i === stageIndex && styles.dotActive]} />
                <Text style={[styles.stageDotLabel, i === stageIndex && { color: C.teal }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Cleaning timer */}
      {isCleaning && (
        <View style={styles.stageBox}>
          <View style={styles.stageHeader}>
            <View>
              <Text style={styles.stageStep}>CLEANING MODE</Text>
              <Text style={styles.stageTitle}>Automated Cleaning Sequence</Text>
            </View>
            <View style={styles.timerBadge}>
              <Ionicons name="timer-outline" size={13} color={C.ocean} />
              <Text style={styles.timerText}>{fmt(timeLeft || 0)}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Temperatures */}
      {(isRunning || isPaused || isCleaning) && (
        <View style={styles.tempsRow}>
          {[
            { label: 'C1 Temp', value: demoMode ? temps.c1 : (dashboardData.tempC1 ?? '--') },
            { label: 'C3 Temp', value: demoMode ? temps.c3 : (dashboardData.tempC3 ?? '--') },
          ].map((t, i) => (
            <View key={i} style={styles.tempCard}>
              <Ionicons name="thermometer-outline" size={18} color={C.ocean} />
              <Text style={styles.tempValue}>{t.value}°C</Text>
              <Text style={styles.tempLabel}>{t.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 4 Buttons */}
      <View style={styles.ctrlRow}>
        <ControlBtn label="Start"   iconName="play"         colors={['#43C6AC','#2A7A6B']}  onPress={() => handleCommand('start')}                        disabled={!isIdle || controlling} />
        <ControlBtn label={isPaused ? 'Resume' : 'Pause'}
                                    iconName={isPaused ? 'play-forward' : 'pause'}
                                                            colors={['#E8A020','#B36B00']}  onPress={() => handleCommand(isPaused ? 'continue' : 'pause')} disabled={!isBusy || controlling} />
        <ControlBtn label="Stop"    iconName="stop"         colors={['#C05040','#8B2020']}  onPress={() => handleCommand('stop')}                         disabled={!isBusy || controlling} />
        <ControlBtn label={isCleaning ? 'End Clean' : 'Clean'}
                                    iconName="water"        colors={isCleaning ? ['#43C6AC','#2A7A6B'] : ['#5B9BD5','#2E6DA4']}
                                                                                            onPress={() => handleCommand(isCleaning ? 'end_cleaning' : 'cleaning')}
                                                                                                                                    disabled={(!isIdle && !isCleaning) || controlling} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card:           { padding: 20, paddingTop: 24 },
  statusRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
  statusLabel:    { fontSize: 10, fontWeight: '800', color: C.steel, letterSpacing: 0.8, marginBottom: 6 },
  statusValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  dot:            { width: 10, height: 10, borderRadius: 5 },
  statusValue:    { fontSize: 26, fontWeight: '900', letterSpacing: 0.5 },
  batchCode:      { fontSize: 12, color: C.steel, fontWeight: '600', marginTop: 2 },
  stageBox:       { backgroundColor: 'rgba(237,242,244,0.7)', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)' },
  stageHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  stageStep:      { fontSize: 9, fontWeight: '800', color: C.steel, letterSpacing: 0.8, textTransform: 'uppercase' },
  stageTitle:     { fontSize: 13, fontWeight: '700', color: C.deep, marginTop: 2 },
  timerBadge:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(78,205,196,0.15)', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10 },
  timerText:      { fontSize: 13, fontWeight: '800', color: C.ocean },
  stageDots:      { flexDirection: 'row', justifyContent: 'space-between' },
  stageDotItem:   { alignItems: 'center', flex: 1 },
  stageDot:       { width: 10, height: 10, borderRadius: 5, backgroundColor: C.cloud, marginBottom: 4 },
  dotDone:        { backgroundColor: C.success },
  dotActive:      { backgroundColor: C.teal, width: 12, height: 12, borderRadius: 6 },
  stageDotLabel:  { fontSize: 9, color: C.slate, fontWeight: '600', textAlign: 'center' },
  tempsRow:       { flexDirection: 'row', gap: 10, marginBottom: 14 },
  tempCard:       { flex: 1, alignItems: 'center', gap: 4, backgroundColor: 'rgba(237,242,244,0.7)', borderRadius: 12, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)' },
  tempValue:      { fontSize: 18, fontWeight: '900', color: C.deep },
  tempLabel:      { fontSize: 10, fontWeight: '700', color: C.steel, textTransform: 'uppercase', letterSpacing: 0.4 },
  ctrlRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});