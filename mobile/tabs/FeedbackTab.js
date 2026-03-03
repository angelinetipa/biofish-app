import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import SpringButton from '../components/SpringButton';
import { C, S } from '../constants/theme';

export default function FeedbackTab({ feedback, onAdd }) {
  return (
    <Card style={S.tabCard}>
      <View style={S.tabContentPad}>
        <View style={S.tabTitleRow}>
          <Text style={S.sectionTitle}>Feedback</Text>
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
          {feedback.length === 0
            ? <Text style={S.emptyText}>No feedback yet</Text>
            : feedback.map((f, i) => (
              <View key={i} style={S.listRow}>
                <View style={{ flex: 1 }}>
                  <Text style={S.listTitle}>{f.batch_code}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Ionicons key={s} name={s < f.rating ? 'star' : 'star-outline'} size={12} color={s < f.rating ? '#F0A04B' : C.cloud} />
                    ))}
                    <Text style={S.listSub}> · {f.date}</Text>
                  </View>
                  {f.comments && <Text style={S.listComment} numberOfLines={2}>{f.comments}</Text>}
                </View>
              </View>
            ))}
        </View>
      </ScrollView>
    </Card>
  );
}