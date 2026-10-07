export const Colors = {
  primary: '#8E1EA2',
  primaryDark: '#6E1480',
  primarySoft: '#F3E3F6',
  pinkBg: '#FFF5F5',
  ink: '#1A1A1A',
  muted: '#757575',
  faint: '#A8A8A8',
  line: '#F1E3F3',
  card: '#FFFFFF',
  page: '#FFFFFF',
  success: '#1E9E5A',
  warning: '#E8930C',
  danger: '#D64545',
  star: '#8E1EA2',
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 100,
};

export const Font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const BRANDS = ['Nike', 'Adidas', 'Puma', 'New Balance'] as const;

export const ALL_SIZES = ['38', '39', '40', '41', '42', '43'];

export const COUPON_CODE = 'DISCOUNT20';
export const COUPON_RATE = 0.2;
export const LOW_STOCK_THRESHOLD = 5;

export const ORDER_STATUSES = [
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
