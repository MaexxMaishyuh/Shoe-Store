import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COUPON_CODE, COUPON_RATE, Colors, Font } from '../theme';
import { useApp } from '../store/AppContext';
import { peso } from '../utils/format';
import { ProductImage } from '../components/ProductImage';
import { QtyStepper } from '../components/QtyStepper';
import { EmptyState } from '../components/EmptyState';
import { ConfirmModal } from '../components/ConfirmModal';
import { Toast } from '../components/Toast';
import { useWebDesktop } from '../hooks/useWebDesktop';

export default function Checkout() {
  const { cart, productById, updateQty, removeFromCart, clearCart, checkout, settings } = useApp();
  const isDesktop = useWebDesktop();
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<{ key: string } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const lines = useMemo(
    () =>
      cart
        .map((l) => ({ line: l, product: productById(l.productId) }))
        .filter((x) => x.product),
    [cart, productById],
  );

  const subtotal = lines.reduce((s, x) => s + x.product!.price * x.line.qty, 0);
  const deliveryFee = cart.length === 0 ? 0 : settings.deliveryFee;
  const discount =
    appliedCoupon === COUPON_CODE ? Math.round(subtotal * COUPON_RATE) : 0;
  const total = subtotal + deliveryFee - discount;

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponMsg('Enter a coupon code.');
      return;
    }
    if (appliedCoupon) {
      setCouponMsg('A coupon is already applied.');
      return;
    }
    if (code === COUPON_CODE) {
      setAppliedCoupon(code);
      setCouponMsg('DISCOUNT20 applied — 20% off.');
    } else {
      setCouponMsg('Invalid coupon code.');
    }
  };

  const placeOrder = () => {
    const res = checkout(appliedCoupon ? { coupon: appliedCoupon } : undefined);
    if (!res.ok || !res.order) {
      setToast(res.message);
      return;
    }
    router.replace(`/order-success?id=${res.order.id}`);
  };

  if (lines.length === 0) {
    return (
      <View style={styles.empty}>
        <EmptyState
          icon="bag-outline"
          title="Your bag is empty"
          subtitle="Browse the collection and add some shoes."
        />
        <Pressable onPress={() => router.push('/explore')} style={styles.browseBtn}>
          <Text style={styles.browseText}>Browse Shoes</Text>
        </Pressable>
      </View>
    );
  }

  const count = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        contentContainerStyle={[styles.content, isDesktop && web.content]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bagHead}>
          <Text style={styles.bagTitle}>Your bag</Text>
          <Text style={styles.bagCount}>
            {count} item{count === 1 ? '' : 's'}
          </Text>
        </View>

        {lines.map(({ line, product }) => (
          <View key={`${line.productId}-${line.size}-${line.colorName}`} style={styles.card}>
            <ProductImage uri={product!.image} style={styles.thumb} iconSize={24} />
            <View style={styles.info}>
              <Text style={styles.pname} numberOfLines={1}>
                {product!.name}
              </Text>
              <Text style={styles.psize}>
                Size {line.size} · {line.colorName}
              </Text>
              <View style={styles.prow}>
                <Text style={styles.pprice}>{peso(product!.price)}</Text>
                <QtyStepper
                  qty={line.qty}
                  onInc={() => updateQty(line.productId, line.size, line.colorName, 1)}
                  onDec={() => updateQty(line.productId, line.size, line.colorName, -1)}
                />
              </View>
            </View>
            <Pressable
              onPress={() =>
                setConfirmRemove({ key: `${line.productId}|${line.size}|${line.colorName}` })
              }
              hitSlop={8}
              style={styles.remove}
              accessibilityLabel="Remove item"
            >
              <Ionicons name="trash-outline" size={18} color={Colors.muted} />
            </Pressable>
          </View>
        ))}

        <Pressable onPress={() => setConfirmClear(true)} hitSlop={8} style={styles.clearRow}>
          <Text style={styles.clearText}>Clear bag</Text>
        </Pressable>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>Coupon</Text>
          <View style={styles.couponRow}>
            <TextInput
              value={couponInput}
              onChangeText={(t) => {
                setCouponInput(t);
                setCouponMsg(null);
              }}
              placeholder="DISCOUNT20"
              autoCapitalize="characters"
              placeholderTextColor={Colors.faint}
              style={styles.couponInput}
              editable={!appliedCoupon}
            />
            <Pressable onPress={applyCoupon} style={styles.applyBtn}>
              <Text style={styles.applyText}>{appliedCoupon ? 'Applied' : 'Apply'}</Text>
            </Pressable>
          </View>
          {couponMsg ? <Text style={styles.couponMsg}>{couponMsg}</Text> : null}
        </View>

        <View style={styles.summary}>
          <SummaryRow label="Subtotal" value={peso(subtotal)} />
          <View style={styles.divider} />
          <SummaryRow label="Delivery Fee" value={peso(deliveryFee)} />
          <View style={styles.divider} />
          <SummaryRow
            label="Discount"
            value={discount > 0 ? `-${peso(discount)}` : peso(0)}
            accent={discount > 0}
          />
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{peso(total)}</Text>
          </View>
        </View>

        <Pressable
          onPress={placeOrder}
          style={({ pressed }) => [styles.checkoutBtn, pressed && { opacity: 0.9 }, isDesktop && web.checkoutBtn]}
        >
          <Text style={styles.checkoutText}>Checkout</Text>
        </Pressable>
      </ScrollView>

      <ConfirmModal
        visible={confirmRemove !== null}
        title="Remove item?"
        message="Remove this item from your cart?"
        confirmLabel="Remove"
        onConfirm={() => {
          if (confirmRemove) {
            const [pid, size, color] = confirmRemove.key.split('|');
            removeFromCart(pid, size, color);
          }
          setConfirmRemove(null);
        }}
        onCancel={() => setConfirmRemove(null)}
      />
      <ConfirmModal
        visible={confirmClear}
        title="Clear bag?"
        message="Are you sure you want to clear your cart?"
        confirmLabel="Clear"
        onConfirm={() => {
          clearCart();
          setAppliedCoupon(null);
          setConfirmClear(false);
        }}
        onCancel={() => setConfirmClear(false)}
      />
      <Toast message={toast} onHide={() => setToast(null)} />
    </View>
  );
}

function SummaryRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View style={styles.sumRow}>
      <Text style={styles.sumLabel}>{label}</Text>
      <Text style={[styles.sumValue, accent && styles.sumAccent]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', padding: 16 },
  browseBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  browseText: { fontFamily: Font.semiBold, fontSize: 16, color: '#fff' },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  bagHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bagTitle: { fontFamily: Font.bold, fontSize: 18, color: Colors.ink },
  bagCount: { fontFamily: Font.regular, fontSize: 14, color: Colors.muted },
  card: {
    backgroundColor: Colors.pinkBg,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    position: 'relative',
  },
  thumb: { width: 80, height: 80, borderRadius: 10, backgroundColor: '#fff' },
  info: { flex: 1, minWidth: 0, justifyContent: 'center', gap: 4 },
  pname: { fontFamily: Font.semiBold, fontSize: 14, color: Colors.ink },
  psize: { fontFamily: Font.regular, fontSize: 13, color: Colors.muted },
  prow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  pprice: { fontFamily: Font.bold, fontSize: 15, color: Colors.primary },
  remove: { position: 'absolute', top: 8, right: 8, padding: 4 },
  clearRow: { alignSelf: 'flex-end', paddingVertical: 4 },
  clearText: { fontFamily: Font.semiBold, fontSize: 13, color: Colors.danger },
  block: { gap: 8, marginTop: 4 },
  blockTitle: { fontFamily: Font.bold, fontSize: 16, color: Colors.ink },
  couponRow: { flexDirection: 'row', gap: 8 },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    fontFamily: Font.regular,
    fontSize: 15,
    color: Colors.ink,
    backgroundColor: '#fff',
  },
  applyBtn: {
    width: 88,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: { fontFamily: Font.semiBold, fontSize: 15, color: '#fff' },
  couponMsg: { fontFamily: Font.regular, fontSize: 13, color: Colors.muted },
  summary: {
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginTop: 4,
  },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sumLabel: { fontFamily: Font.regular, fontSize: 14, color: Colors.muted },
  sumValue: { fontFamily: Font.semiBold, fontSize: 14, color: Colors.ink },
  sumAccent: { color: Colors.primary },
  divider: { height: 1, backgroundColor: Colors.line },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontFamily: Font.bold, fontSize: 16, color: Colors.primary },
  totalValue: { fontFamily: Font.bold, fontSize: 20, color: Colors.primary },
  checkoutBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  checkoutText: { fontFamily: Font.semiBold, fontSize: 16, color: '#fff' },
});

/** Web/laptop only — never applied on native, so the phone UI is unchanged. */
const web = StyleSheet.create({
  content: { width: '100%', maxWidth: 720, alignSelf: 'center' },
  checkoutBtn: { width: '100%', maxWidth: 480, alignSelf: 'center' },
});
