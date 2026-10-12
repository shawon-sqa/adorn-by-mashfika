import { createBrowserClient } from '@/lib/supabase/client';
import { SupabaseCoupon } from '@/lib/types/supabase';

export const INITIAL_MOCK_COUPONS: SupabaseCoupon[] = [
  {
    id: 'cpn-welcome10',
    code: 'WELCOME10',
    type: 'percentage',
    discount_value: 10,
    description: 'Welcome offer: 10% off on your first order above ৳1,000',
    min_order_amount: 1000,
    requires_email: false,
    requires_phone: true,
    redemption_type: 'limited',
    max_uses: 100,
    max_uses_per_customer: 1,
    used_count: 14,
    starts_at: '2026-01-01T00:00:00.000Z',
    ends_at: null,
    status: 'active',
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'cpn-adorn50',
    code: 'ADORN50',
    type: 'fixed',
    discount_value: 50,
    description: 'Flat ৳50 off on boutique jewelry orders above ৳1,500',
    min_order_amount: 1500,
    requires_email: false,
    requires_phone: false,
    redemption_type: 'unlimited',
    max_uses: null,
    max_uses_per_customer: 1,
    used_count: 32,
    starts_at: '2026-02-01T00:00:00.000Z',
    ends_at: null,
    status: 'active',
    created_at: '2026-02-01T00:00:00.000Z',
  },
  {
    id: 'cpn-festive20',
    code: 'FESTIVE20',
    type: 'percentage',
    discount_value: 20,
    description: 'Special celebratory 20% savings on purchases ৳3,000+',
    min_order_amount: 3000,
    requires_email: false,
    requires_phone: true,
    redemption_type: 'one_time',
    max_uses: 1,
    max_uses_per_customer: 1,
    used_count: 1,
    starts_at: '2026-03-01T00:00:00.000Z',
    ends_at: '2026-03-15T23:59:59.000Z',
    status: 'used_up',
    created_at: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'cpn-vip100',
    code: 'VIP100',
    type: 'fixed',
    discount_value: 100,
    description: 'Exclusive VIP coupon for luxury connoisseurs',
    min_order_amount: 2500,
    requires_email: true,
    requires_phone: true,
    redemption_type: 'limited',
    max_uses: 50,
    max_uses_per_customer: 1,
    used_count: 5,
    starts_at: '2026-04-01T00:00:00.000Z',
    ends_at: '2026-12-31T23:59:59.000Z',
    status: 'disabled',
    created_at: '2026-04-01T00:00:00.000Z',
  },
];

const LOCAL_STORAGE_KEY = 'adorn_coupons';

function getLocalCoupons(): SupabaseCoupon[] {
  if (typeof window === 'undefined') return INITIAL_MOCK_COUPONS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_COUPONS));
      return INITIAL_MOCK_COUPONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MOCK_COUPONS;
  }
}

function saveLocalCoupons(coupons: SupabaseCoupon[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(coupons));
  } catch {
    // ignore
  }
}

export async function fetchCoupons(): Promise<SupabaseCoupon[]> {
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('fetchCoupons database warning, using local cache:', error.message);
      return getLocalCoupons();
    }

    if (!data || data.length === 0) {
      const local = getLocalCoupons();
      return local;
    }

    return data as SupabaseCoupon[];
  } catch (err) {
    console.warn('fetchCoupons error, falling back:', err);
    return getLocalCoupons();
  }
}

export async function createCoupon(
  coupon: Omit<SupabaseCoupon, 'id' | 'used_count' | 'created_at'>
): Promise<{ success: boolean; data?: SupabaseCoupon; error?: string }> {
  const newCoupon: SupabaseCoupon = {
    ...coupon,
    id: 'cpn-' + Date.now(),
    code: coupon.code.toUpperCase().trim(),
    used_count: 0,
    created_at: new Date().toISOString(),
  };

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('coupons')
      .insert({
        code: newCoupon.code,
        type: newCoupon.type,
        discount_value: newCoupon.discount_value,
        description: newCoupon.description || null,
        min_order_amount: newCoupon.min_order_amount || null,
        requires_email: !!newCoupon.requires_email,
        requires_phone: !!newCoupon.requires_phone,
        redemption_type: newCoupon.redemption_type,
        max_uses: newCoupon.max_uses || null,
        max_uses_per_customer: newCoupon.max_uses_per_customer || 1,
        used_count: 0,
        starts_at: newCoupon.starts_at || null,
        ends_at: newCoupon.ends_at || null,
        status: newCoupon.status,
      })
      .select()
      .single();

    if (!error && data) {
      const local = getLocalCoupons();
      saveLocalCoupons([data as SupabaseCoupon, ...local.filter((c) => c.code !== data.code)]);
      return { success: true, data: data as SupabaseCoupon };
    }

    if (error) {
      console.warn('Supabase createCoupon notice:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase insert exception, using local store:', err);
  }

  const local = getLocalCoupons();
  if (local.some((c) => c.code.toLowerCase() === newCoupon.code.toLowerCase())) {
    return { success: false, error: 'Coupon code ' + newCoupon.code + ' already exists.' };
  }
  const updated = [newCoupon, ...local];
  saveLocalCoupons(updated);
  return { success: true, data: newCoupon };
}

export async function updateCoupon(
  couponId: string,
  updates: Partial<Omit<SupabaseCoupon, 'id' | 'created_at'>>
): Promise<{ success: boolean; data?: SupabaseCoupon; error?: string }> {
  try {
    const supabase = createBrowserClient();
    const dbPayload: Record<string, any> = { ...updates };
    if (updates.code) {
      dbPayload.code = updates.code.toUpperCase().trim();
    }
    const { data, error } = await supabase
      .from('coupons')
      .update(dbPayload)
      .eq('id', couponId)
      .select()
      .single();

    if (!error && data) {
      const local = getLocalCoupons();
      const updated = local.map((c) => (c.id === couponId ? (data as SupabaseCoupon) : c));
      saveLocalCoupons(updated);
      return { success: true, data: data as SupabaseCoupon };
    }
    if (error) {
      console.warn('Supabase updateCoupon notice:', error.message);
    }
  } catch (err) {
    console.warn('Supabase updateCoupon exception:', err);
  }

  // Local fallback
  const local = getLocalCoupons();
  let updatedCoupon: SupabaseCoupon | undefined;
  const updated = local.map((c) => {
    if (c.id === couponId) {
      updatedCoupon = { ...c, ...updates };
      return updatedCoupon;
    }
    return c;
  });
  saveLocalCoupons(updated);
  return { success: true, data: updatedCoupon };
}

export async function toggleCouponStatus(
  couponId: string,
  newStatus: 'active' | 'disabled'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('coupons')
      .update({ status: newStatus })
      .eq('id', couponId);

    if (error) {
      console.warn('Supabase update notice:', error.message);
    }
  } catch (err) {
    console.warn('Supabase toggle status exception:', err);
  }

  const local = getLocalCoupons();
  const updated = local.map((c) => (c.id === couponId ? { ...c, status: newStatus } : c));
  saveLocalCoupons(updated);
  return { success: true };
}

export async function deleteCoupon(couponId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createBrowserClient();
    const { error } = await supabase.from('coupons').delete().eq('id', couponId);
    if (error) {
      console.warn('Supabase delete notice:', error.message);
    }
  } catch (err) {
    console.warn('Supabase delete coupon exception:', err);
  }

  const local = getLocalCoupons();
  saveLocalCoupons(local.filter((c) => c.id !== couponId));
  return { success: true };
}

export async function validateCouponCode(
  code: string,
  cartSubtotal: number
): Promise<{
  valid: boolean;
  coupon?: SupabaseCoupon;
  discountAmount?: number;
  error?: string;
}> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) {
    return { valid: false, error: 'Please enter a coupon code.' };
  }

  let found: SupabaseCoupon | undefined;

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', cleanCode)
      .single();

    if (!error && data) {
      found = data as SupabaseCoupon;
    }
  } catch {
    // fallback to local
  }

  if (!found) {
    const local = getLocalCoupons();
    found = local.find((c) => c.code.toUpperCase() === cleanCode);
  }

  if (!found) {
    return { valid: false, error: 'Invalid coupon code.' };
  }

  if (found.status === 'disabled') {
    return { valid: false, error: 'This coupon is currently disabled.' };
  }

  if (found.status === 'used_up') {
    return { valid: false, error: 'This coupon has reached its maximum redemptions.' };
  }

  const now = new Date();
  if (found.starts_at && new Date(found.starts_at) > now) {
    return { valid: false, error: 'This coupon has not started yet.' };
  }

  if (found.ends_at && new Date(found.ends_at) < now) {
    return { valid: false, error: 'Coupon expired.' };
  }

  if (found.redemption_type === 'one_time' && found.used_count >= 1) {
    return { valid: false, error: 'This one-time coupon has already been redeemed.' };
  }

  if (
    found.redemption_type === 'limited' &&
    found.max_uses !== null &&
    found.max_uses !== undefined &&
    found.used_count >= found.max_uses
  ) {
    return { valid: false, error: 'This coupon has reached its maximum limit.' };
  }

  if (found.min_order_amount && cartSubtotal < found.min_order_amount) {
    return {
      valid: false,
      error: 'Minimum order ৳' + found.min_order_amount.toLocaleString() + ' required.',
    };
  }

  let discount = 0;
  if (found.type === 'percentage') {
    discount = Math.round((cartSubtotal * found.discount_value) / 100);
  } else {
    discount = Math.min(found.discount_value, cartSubtotal);
  }

  return {
    valid: true,
    coupon: found,
    discountAmount: discount,
  };
}