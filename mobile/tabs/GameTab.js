import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  PanResponder, Dimensions, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants/theme';

const { width: SW, height: SH } = Dimensions.get('window');
const FUNNEL_W   = 70;
const FUNNEL_H   = 40;
const SCALE_SIZE = 32;
const SPAWN_Y    = 110;
const MAX_LIVES  = 3;
const TICK_MS    = 30;

// keep fish strictly within screen
const randomX = () => Math.random() * (SW - SCALE_SIZE * 2 - 20) + SCALE_SIZE;

const SCALE_EMOJIS = ['🐟', '🐠', '🐡'];

export default function GameTab() {
  const [screen,     setScreen]    = useState('menu');
  const [score,      setScore]     = useState(0);
  const [best,       setBest]      = useState(0);
  const [lives,      setLives]     = useState(MAX_LIVES);
  const [scales,     setScales]    = useState([]);
  const [funnelX,    setFunnelX]   = useState(SW / 2 - FUNNEL_W / 2);
  const [containerH, setContainerH] = useState(SH * 0.7);
  const [flashColor, setFlashColor] = useState(null);

  const funnelRef  = useRef(SW / 2 - FUNNEL_W / 2);
  const scoreRef   = useRef(0);
  const livesRef   = useRef(MAX_LIVES);
  const scalesRef  = useRef([]);
  const nextId     = useRef(0);
  const gameLoop   = useRef(null);
  const spawnTimer = useRef(null);
  const flashAnim  = useRef(new Animated.Value(0)).current;
  const flashLock  = useRef(false);
  const floorRef = useRef(SH * 0.7 - SPAWN_Y);

  const speed = () => Math.min(5.0 + scoreRef.current * 2, 50);

  const spawnScale = useCallback(() => {
  const count = scoreRef.current >= 15 ? 3 : scoreRef.current >= 7 ? 2 : 1;
  for (let i = 0; i < count; i++) {
    scalesRef.current = [...scalesRef.current, {
      id:    nextId.current++,
      x:     randomX(),
      y:     SPAWN_Y - (i * 40), // stagger vertically so they don't overlap
      emoji: SCALE_EMOJIS[Math.floor(Math.random() * SCALE_EMOJIS.length)],
    }];
  }
}, []);

  const flash = (color) => {
    if (flashLock.current) return;
    flashLock.current = true;
    setFlashColor(color);
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 60,  useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => { setFlashColor(null); flashLock.current = false; });
  };

  const tick = useCallback(() => {
    const sp  = speed();
    const fx  = funnelRef.current;
    const updated = [];
    let gained = 0, missed = 0;

    for (const s of scalesRef.current) {
      const ny      = s.y + sp;
      const centerX = s.x + SCALE_SIZE / 2;
      if (
        ny + SCALE_SIZE >= floorRef.current &&
        ny <= floorRef.current + FUNNEL_H + 10 &&
        centerX >= fx &&
        centerX <= fx + FUNNEL_W
      ) {
        gained++;
      } else if (ny > floorRef.current + FUNNEL_H + 20) {
        missed++;
      } else {
        updated.push({ ...s, y: ny });
      }
    }

    if (gained > 0) { scoreRef.current += gained; setScore(scoreRef.current); flash(C.teal); }
    if (missed > 0) {
      livesRef.current = Math.max(0, livesRef.current - missed);
      setLives(livesRef.current);
      flash(C.error);
      if (livesRef.current <= 0) { stopGame(true); return; }
    }

    scalesRef.current = updated;
    setScales([...updated]);
  }, []);

  const startGame = () => {
    scoreRef.current  = 0; livesRef.current = MAX_LIVES;
    scalesRef.current = []; nextId.current  = 0;
    funnelRef.current = SW / 2 - FUNNEL_W / 2;
    setScore(0); setLives(MAX_LIVES); setScales([]);
    setFunnelX(SW / 2 - FUNNEL_W / 2);
    setScreen('playing');
    spawnTimer.current = setInterval(spawnScale, 1300);
    gameLoop.current   = setInterval(tick, TICK_MS);
  };

  const stopGame = (over = false) => {
    clearInterval(gameLoop.current);
    clearInterval(spawnTimer.current);
    if (over) {
      setBest(b => Math.max(b, scoreRef.current));
      setTimeout(() => setScreen('gameover'), 300);
    }
  };

  useEffect(() => () => stopGame(), []);
  useEffect(() => { floorRef.current = containerH - SPAWN_Y; }, [containerH]);

  useEffect(() => {
    if (screen !== 'playing') return;
    clearInterval(spawnTimer.current);
    const interval = Math.max(550, 1300 - scoreRef.current * 18);
    spawnTimer.current = setInterval(spawnScale, interval);
  }, [score]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,
      onPanResponderMove: (_, g) => {
        const nx = Math.max(0, Math.min(SW - FUNNEL_W, g.moveX - FUNNEL_W / 2));
        funnelRef.current = nx;
        setFunnelX(nx);
      },
    })
  ).current;

  // ── MENU ──────────────────────────────────────────
  if (screen === 'menu') return (
    <LinearGradient colors={['#1a3a4a', '#0d2233']} style={styles.fill}>
      <View style={styles.menuCenter}>
        <Text style={styles.gameTitle}>🐟 Scale Catcher</Text>
        <Text style={styles.gameSub}>Catch falling fish scales in the funnel!</Text>
        <View style={styles.howBox}>
          {[
            'Drag the funnel left & right',
            'Catch scales to score points',
            'Miss 3 scales = game over',
            'Speed increases as you score!',
          ].map((t, i) => (
            <View key={i} style={styles.howRow}>
              <Text style={styles.howBullet}>▸</Text>
              <Text style={styles.howText}>{t}</Text>
            </View>
          ))}
        </View>
        {best > 0 && <Text style={styles.bestText}>🏆 Best: {best}</Text>}
        <TouchableOpacity onPress={startGame} activeOpacity={0.85}>
          <LinearGradient colors={[C.teal, C.ocean]} style={styles.startBtn}>
            <Ionicons name="play" size={20} color="#fff" />
            <Text style={styles.startBtnText}>START GAME</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  // ── GAME OVER ─────────────────────────────────────
  if (screen === 'gameover') return (
    <LinearGradient colors={['#1a3a4a', '#0d2233']} style={styles.fill}>
      <View style={styles.menuCenter}>
        <Text style={styles.gameOverEmoji}>💀</Text>
        <Text style={styles.gameOverTitle}>Game Over!</Text>
        <Text style={styles.gameOverScore}>{score}</Text>
        <Text style={styles.gameOverLabel}>SCALES CAUGHT</Text>
        {score >= best && score > 0
          ? <Text style={styles.newBest}>🏆 New Best!</Text>
          : <Text style={styles.bestText}>Best: {best}</Text>}
        <View style={styles.btnRow}>
          <TouchableOpacity onPress={startGame} activeOpacity={0.85}>
            <LinearGradient colors={[C.teal, C.ocean]} style={styles.startBtn}>
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={styles.startBtnText}>PLAY AGAIN</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setScreen('menu')} activeOpacity={0.85} style={styles.menuBtn}>
            <Text style={styles.menuBtnText}>Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );

  // ── PLAYING ───────────────────────────────────────
  return (
    <View style={styles.fill} onLayout={e => setContainerH(e.nativeEvent.layout.height)} {...panResponder.panHandlers}>
      <LinearGradient colors={['#1a3a4a', '#0d2233']} style={StyleSheet.absoluteFill} />

      {/* Very subtle flash — max 15% opacity */}
      {flashColor && (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: flashColor,
              opacity: flashAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.15] }),
            },
          ]}
        />
      )}

      {/* HUD */}
      <View style={styles.hud}>
        <View style={styles.hudItem}>
          <Text style={styles.hudLabel}>SCORE</Text>
          <Text style={styles.hudValue}>{score}</Text>
        </View>
        <Text style={styles.hudTitle}>🐟 Scale Catcher</Text>
        <View style={styles.hudItem}>
          <Text style={styles.hudLabel}>LIVES</Text>
          <Text style={styles.hudLives}>{'❤️'.repeat(lives)}{'🖤'.repeat(MAX_LIVES - lives)}</Text>
        </View>
      </View>

      <Text style={styles.speedText}>Speed ×{speed().toFixed(1)}</Text>

      {/* Falling scales */}
      {scales.map(s => (
        <Text key={s.id} style={[styles.scaleEmoji, { left: s.x, top: s.y }]}>
          {s.emoji}
        </Text>
      ))}

      {/* Floor line */}
      <View style={[styles.floorLine, { top: floorRef.current }]} />

      {/* Funnel */}
      <View style={[styles.funnel, { left: funnelX, top: floorRef.current }]}>
        <LinearGradient colors={[C.teal, C.ocean]} style={styles.funnelGrad}>
          <Text style={styles.funnelEmoji}>🪣</Text>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, overflow: 'hidden', borderRadius: 20, marginBottom: 20, marginHorizontal: 5, marginVertical: 5 },

  menuCenter:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, gap: 16 },
  gameTitle:     { fontSize: 30, fontWeight: '900', color: C.teal, letterSpacing: 1 },
  gameSub:       { fontSize: 13, color: C.slate, textAlign: 'center', fontWeight: '600' },
  howBox:        { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, width: '100%', gap: 8, borderWidth: 1, borderColor: 'rgba(78,205,196,0.2)' },
  howRow:        { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  howBullet:     { color: C.teal, fontWeight: '900', fontSize: 14 },
  howText:       { color: '#cde', fontSize: 13, fontWeight: '600', flex: 1 },
  bestText:      { fontSize: 15, color: C.warning, fontWeight: '800' },
  startBtn:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, paddingHorizontal: 36, borderRadius: 50, elevation: 6 },
  startBtnText:  { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  btnRow:        { flexDirection: 'row', gap: 12, alignItems: 'center' },
  menuBtn:       { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 50, borderWidth: 2, borderColor: 'rgba(78,205,196,0.4)' },
  menuBtnText:   { color: C.teal, fontWeight: '800', fontSize: 14 },

  gameOverEmoji: { fontSize: 56 },
  gameOverTitle: { fontSize: 26, fontWeight: '900', color: '#fff' },
  gameOverScore: { fontSize: 70, fontWeight: '900', color: C.teal, lineHeight: 76 },
  gameOverLabel: { fontSize: 10, color: C.slate, fontWeight: '800', letterSpacing: 2 },
  newBest:       { fontSize: 17, color: C.warning, fontWeight: '900' },

  hud:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 6 },
  hudItem:   { alignItems: 'center', minWidth: 70 },
  hudLabel:  { fontSize: 9, color: C.slate, fontWeight: '800', letterSpacing: 1.5 },
  hudValue:  { fontSize: 22, fontWeight: '900', color: '#fff', marginTop: 2 },
  hudLives:  { fontSize: 14, marginTop: 2 },
  hudTitle:  { fontSize: 12, fontWeight: '900', color: C.teal, letterSpacing: 0.5 },
  speedText: { textAlign: 'center', fontSize: 10, color: 'rgba(78,205,196,0.4)', fontWeight: '700', letterSpacing: 1, marginBottom: 4 },

  scaleEmoji:  { position: 'absolute', fontSize: SCALE_SIZE, zIndex: 10 },
  floorLine:   { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(78,205,196,0.15)' },
  funnel:      { position: 'absolute', width: FUNNEL_W, height: FUNNEL_H, zIndex: 20 },
  funnelGrad:  { flex: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)' },
  funnelEmoji: { fontSize: 22 },
});