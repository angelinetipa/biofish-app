import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  Alert, ActivityIndicator, TouchableOpacity, RefreshControl, Platform, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '../constants/api';
import { C } from '../constants/theme';
import SpringButton from '../components/SpringButton';

export default function ManageUsersScreen({ currentUser, onBack }) {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Add user form state
  const [form, setForm] = useState({ username: '', full_name: '', email: '', password: '', role: 'operator' });

  const loadUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/users.php?caller_id=${currentUser.id}`);
      if (res.data.success) setUsers(res.data.data);
    } catch { Alert.alert('Error', 'Could not load users.'); }
    finally { setLoading(false); setRefreshing(false); }
  }, [currentUser.id]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleAdd = async () => {
    if (!form.username.trim() || !form.password.trim()) {
      Alert.alert('Error', 'Username and password are required.'); return;
    }
    setSaving(true);
    try {
      const res = await axios.post(`${API_URL}/users.php`, {
        action: 'add_user', caller_id: currentUser.id, ...form,
      });
      if (res.data.success) {
        setForm({ username: '', full_name: '', email: '', password: '', role: 'operator' });
        loadUsers();
      } else {
        Alert.alert('Error', res.data.message);
      }
    } catch { Alert.alert('Error', 'Request failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = (user) => {
    Alert.alert('Delete User', `Remove "${user.username}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await axios.post(`${API_URL}/users.php`, {
              action: 'delete_user', caller_id: currentUser.id, user_id: user.user_id,
            });
            loadUsers();
          } catch { Alert.alert('Error', 'Could not delete user.'); }
        },
      },
    ]);
  };

  const handleRoleToggle = async (user) => {
    const newRole = user.role === 'admin' ? 'operator' : 'admin';
    Alert.alert('Change Role', `Set "${user.username}" as ${newRole}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm', onPress: async () => {
          try {
            await axios.post(`${API_URL}/users.php`, {
              action: 'update_role', caller_id: currentUser.id, user_id: user.user_id, role: newRole,
            });
            loadUsers();
          } catch { Alert.alert('Error', 'Could not update role.'); }
        },
      },
    ]);
  };

  return (
    <LinearGradient colors={['#4ECDC4', '#3A7CA5', '#2C6B7F']} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <SpringButton onPress={onBack}>
          <View style={styles.backBtn}>
            <Ionicons name="arrow-back" size={18} color={C.ocean} />
          </View>
        </SpringButton>
        <Text style={styles.headerTitle}>Manage Users</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadUsers(); }} tintColor={C.teal} colors={[C.teal]} />}
      >
        {/* Add User Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            <Ionicons name="person-add-outline" size={15} color={C.ocean} /> Add New User
          </Text>

        {[
        { key: 'username',  placeholder: 'Username *'  },
        { key: 'full_name', placeholder: 'Full Name'   },
        { key: 'email',     placeholder: 'Email'       },
        ].map(({ key, placeholder }) => (
        <TextInput
            key={key}
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#aaa"
            autoCapitalize="none"
            value={form[key]}
            onChangeText={v => setForm(f => ({ ...f, [key]: v }))}
        />
        ))}
        <View style={styles.inputRow}>
            <TextInput
                style={[styles.input, { flex: 1, paddingRight: 44 }]}
                placeholder="Initial Password *"
                placeholderTextColor="#aaa"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                value={form.password}
                onChangeText={v => setForm(f => ({ ...f, password: v }))}
            />
            <TouchableOpacity onPress={() => setShowPassword(s => !s)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={C.slate} />
            </TouchableOpacity>
        </View>

          {/* Role toggle */}
          <View style={styles.roleRow}>
            <Text style={styles.roleLabel}>Role:</Text>
            {['operator', 'admin'].map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.roleChip, form.role === r && styles.roleChipActive]}
                onPress={() => setForm(f => ({ ...f, role: r }))}
              >
                <Text style={[styles.roleChipText, form.role === r && styles.roleChipTextActive]}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <SpringButton onPress={handleAdd} disabled={saving}>
            <LinearGradient colors={[C.tealLight, C.ocean]} style={styles.addBtn}>
              {saving
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.addBtnText}>Create User</Text>
              }
            </LinearGradient>
          </SpringButton>
        </View>

        {/* Users List */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            <Ionicons name="people-outline" size={15} color={C.ocean} /> All Users ({users.length})
          </Text>

          {loading
            ? <ActivityIndicator color={C.teal} style={{ marginVertical: 20 }} />
            : users.map(u => (
              <View key={u.user_id} style={styles.userRow}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>{(u.username || '?')[0].toUpperCase()}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>
                    {u.username}
                    {u.user_id === currentUser.id && <Text style={styles.youBadge}> (you)</Text>}
                  </Text>
                  <Text style={styles.userMeta}>{u.full_name || '—'}</Text>
                </View>

                <View style={styles.userActions}>
                  {/* Role badge / tap to toggle */}
                  {u.user_id !== currentUser.id ? (
                    <TouchableOpacity onPress={() => handleRoleToggle(u)} style={[styles.roleBadge, u.role === 'admin' && styles.roleBadgeAdmin]}>
                      <Text style={[styles.roleBadgeText, u.role === 'admin' && styles.roleBadgeTextAdmin]}>
                        {u.role}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.roleBadge, u.role === 'admin' && styles.roleBadgeAdmin]}>
                      <Text style={[styles.roleBadgeText, u.role === 'admin' && styles.roleBadgeTextAdmin]}>
                        {u.role}
                      </Text>
                    </View>
                  )}

                  {/* Delete */}
                  {u.user_id !== currentUser.id && (
                    <TouchableOpacity onPress={() => handleDelete(u)} style={styles.deleteBtn}>
                      <Ionicons name="trash-outline" size={16} color="#e53935" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          }
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight || 24) + 12,
    paddingBottom: 14, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(248,250,251,0.97)',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', borderTopWidth: 0,
    shadowColor: '#fff', shadowOffset: { width: -6, height: -6 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(78,205,196,0.12)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(78,205,196,0.3)',
  },
  headerTitle: { fontSize: 17, fontWeight: '900', color: C.deep },

  scroll: { padding: 16, gap: 16, paddingBottom: 40 },

  card: {
    backgroundColor: 'rgba(248,250,251,0.97)',
    borderRadius: 20, padding: 16,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.85)',
    shadowColor: '#fff', shadowOffset: { width: -4, height: -4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
    gap: 10,
  },
  cardTitle: { fontSize: 13, fontWeight: '800', color: C.deep, marginBottom: 4 },

  input: {
    backgroundColor: '#E4EDF1', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 13, color: '#3E4C59',
    borderWidth: 2, borderColor: 'transparent',
  },

  roleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roleLabel: { fontSize: 12, fontWeight: '700', color: C.slate },
  roleChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99,
    backgroundColor: '#E4EDF1', borderWidth: 1.5, borderColor: 'transparent',
  },
  roleChipActive: { backgroundColor: 'rgba(78,205,196,0.15)', borderColor: C.teal },
  roleChipText:   { fontSize: 12, fontWeight: '600', color: C.slate },
  roleChipTextActive: { color: C.ocean, fontWeight: '800' },

  addBtn: { borderRadius: 12, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '800', letterSpacing: 0.4 },

  userRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  userAvatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(78,205,196,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  userAvatarText: { fontSize: 16, fontWeight: '800', color: C.ocean },
  userName: { fontSize: 13, fontWeight: '700', color: C.deep },
  youBadge: { fontSize: 11, color: C.slate, fontWeight: '500' },
  userMeta: { fontSize: 11, color: C.slate, marginTop: 1 },

  userActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roleBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99,
    backgroundColor: '#e8f5e9',
  },
  roleBadgeAdmin: { backgroundColor: '#e8f4fd' },
  roleBadgeText:  { fontSize: 10, fontWeight: '800', color: '#2e7d32', textTransform: 'uppercase' },
  roleBadgeTextAdmin: { color: '#1565c0' },
  deleteBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#ffebee', alignItems: 'center', justifyContent: 'center',
  },
  inputRow: { position: 'relative', justifyContent: 'center' },
  eyeBtn:   { position: 'absolute', right: 12, padding: 4 },
});