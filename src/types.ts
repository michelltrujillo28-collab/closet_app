export type Role = 'user' | 'admin';

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: Role;
  created_at: string;
};

export type Category = { id: string; name: string; sort_order: number; created_at: string };

export type Garment = {
  id: string;
  user_id: string;
  category_id: string | null;
  name: string;
  color: string | null;
  size: string | null;
  brand: string | null;
  image_url: string | null;
  created_at: string;
};

export type GarmentWithRel = Garment & {
  categories: { name: string } | null;
  profiles?: { email: string | null } | null;
};

export type Outfit = {
  id: string;
  user_id: string;
  name: string;
  occasion: string | null;
  created_at: string;
  outfit_items: { garment_id: string; garments: { name: string; image_url: string | null } | null }[];
};

export type OutfitPlan = {
  id: string;
  user_id: string;
  outfit_id: string;
  plan_date: string; // YYYY-MM-DD
  outfits: { name: string; outfit_items: { garments: { image_url: string | null } | null }[] } | null;
};

export type WishItem = {
  id: string;
  user_id: string;
  name: string;
  store: string | null;
  price: number | null;
  bought: boolean;
  created_at: string;
};

export type Stats = { users: number; garments: number; outfits: number; wishlist: number };

export type AuthStackParamList = { Landing: undefined; Login: undefined; Register: undefined };
export type UserTabParamList = {
  Home: undefined; Garments: undefined; Studio: undefined; Calendar: undefined; Wishlist: undefined; Profile: undefined;
};
export type AdminTabParamList = {
  Dashboard: undefined; Users: undefined; Categories: undefined; AllGarments: undefined; Profile: undefined;
};
