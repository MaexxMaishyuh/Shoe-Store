import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { COUPON_CODE, COUPON_RATE, Colors, Font } from '../theme';
import { useApp } from '../store/AppContext';
import { peso } from '../utils/format';
import { Field, TextField } from '../components/Fields';
import { ConfirmModal } from '../components/ConfirmModal';
import { Toast } from '../components/Toast';
import { useWebDesktop } from '../hooks/useWebDesktop';

export default function Settings() {
  const { settings, updateSettings, resetDemoData } = useApp();
  const isDesktop = useWebDesktop();
  const [name, setName] = useState(settings.userName);
  const [fee, setFee] = useState(String(settings.deliveryFee));
  const [feeError, setFeeError] = useState<string | undefined>();
  const [confirmReset, setConfirmReset] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const saveProfile = () => {
    updateSettings({ userName: name.trim() || 'Alex' });
    setToast('Profile saved.');
  };

  const saveFee = () => {
    const v = Number(fee);
    if (fee.trim() === '' || Number.isNaN(v) || v < 0) {
      setFeeError('Delivery fee must be non-negative.');
      return;
    }
    setFeeError(undefined);
    updateSettings({ deliveryFee: Math.round(v) });
    setToast(`Delivery fee set to ${peso(Math.round(v))}.`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        contentContainerStyle={[styles.content, isDesktop && web.content]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.dotRow}>
            <View style={styles.dot} />
            <View>
              <Text style={styles.cardTitle}>Connection Status</Text>
              <Text style={styles.cardSub}>Offline-first · data stored on this device</Text>
            </View>
          </View>
        </View>

        <Field label="Display Name">
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <TextField value={name} onChangeText={setName} placeholder="Your name" />
            </View>
            <Pressable onPress={saveProfile} style={styles.saveBtn}>
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          </View>
        </Field>

        <Field label={`Delivery Fee (${'\u20B1'})`} error={feeError}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <TextField value={fee} onChangeText={setFee} keyboardType="numeric" placeholder="150" />
            </View>
            <Pressable onPress={saveFee} style={styles.saveBtn}>
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          </View>
        </Field>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Currency</Text>
          <Text style={styles.cardSub}>Philippine Peso ({'\u20B1'}) — fixed for this store</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Default Discount</Text>
          <Text style={styles.cardSub}>
            Coupon {COUPON_CODE} — {Math.round(COUPON_RATE * 100)}% off subtotal, applied once per
            checkout
          </Text>
        </View>

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.cardTitle}>Notifications</Text>
            <Text style={styles.cardSub}>Order updates and promos</Text>
          </View>
          <Switch
            value={settings.notifications}
            onValueChange={(v) => updateSettings({ notifications: v })}
            trackColor={{ true: Colors.primary, false: '#ddd' }}
          />
        </View>

        <Pressable onPress={() => setConfirmReset(true)} style={styles.resetBtn}>
          <Text style={styles.resetText}>Reset Demo Data</Text>
        </Pressable>
        <Text style={styles.note}>
          Restores the original catalog and clears cart, favorites, orders and settings.
        </Text>
      </ScrollView>

      <ConfirmModal
        visible={confirmReset}
        title="Reset demo data?"
        message="This clears your cart, favorites, orders and custom products."
        confirmLabel="Reset"
        onConfirm={() => {
          resetDemoData();
          setConfirmReset(false);
          setToast('Demo data restored.');
        }}
        onCancel={() => setConfirmReset(false)}
      />
      <Toast message={toast} onHide={() => setToast(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  card: { backgroundColor: Colors.pinkBg, borderRadius: 12, padding: 16, gap: 4 },
  cardTitle: { fontFamily: Font.semiBold, fontSize: 15, color: Colors.ink },
  cardSub: { fontFamily: Font.regular, fontSize: 13, color: Colors.muted },
  dotRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.success },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: { fontFamily: Font.semiBold, fontSize: 15, color: '#fff' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.pinkBg,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  resetBtn: {
    backgroundColor: '#FDECEC',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetText: { fontFamily: Font.semiBold, fontSize: 15, color: Colors.danger },
  note: { fontFamily: Font.regular, fontSize: 12, color: Colors.muted, textAlign: 'center' },
});

/** Web/laptop only — never applied on native, so the phone UI is unchanged. */
const web = StyleSheet.create({
  content: { width: '100%', maxWidth: 720, alignSelf: 'center' },
});
