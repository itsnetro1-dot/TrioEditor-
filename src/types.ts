export interface User {
  id: string;
  username: string;
  email: string;
  robloxUsername: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  robloxGame: string;
  category: 'Murder Mystery 2 (MM2)' | 'Roblox Game Passes' | 'In-Game Items' | 'Special Offers' | 'Other Roblox Games';
  priceRobux: number;
  gamePassId: string;
  availability: 'in_stock' | 'out_of_stock' | 'preorder';
  stock: number;
  featured: boolean;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  recipientRobloxUsername: string;
  productId: string;
  productName: string;
  productCategory: string;
  productImage: string;
  gamePassId: string;
  priceRobux: number;
  discountRobux: number;
  finalPriceRobux: number;
  promoCodeApplied?: string;
  paymentMethod: string;
  paymentReference: string;
  gamepassLink?: string;
  declineReason?: string;
  status: 'pending_owner_approval' | 'accepted_awaiting_payment' | 'declined' | 'payment_submitted' | 'completed' | 'cancelled';
  fulfillmentNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromoCode {
  id: string;
  code: string;
  rewardType: 'percentage_discount' | 'fixed_discount' | 'free_product' | 'ingame_item' | 'special_promo' | 'custom_reward';
  discountValue: number;
  eligibleProductIds: string[];
  rewardName: string;
  rewardPayload?: string;
  maxTotalRedemptions: number;
  maxPerUserRedemptions: number;
  timesRedeemed: number;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt: string;
}

export interface CodeRedemption {
  id: string;
  codeId: string;
  code: string;
  userId: string;
  robloxUsername: string;
  rewardType: string;
  rewardSummary: string;
  createdAt: string;
}

export interface RewardDelivery {
  id: string;
  source: 'promo_code' | 'giveaway' | 'order';
  sourceId: string;
  userId: string;
  robloxUsername: string;
  rewardName: string;
  sourceTitle: string;
  status: 'pending' | 'processing' | 'delivered' | 'rejected';
  deliveryNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Giveaway {
  id: string;
  title: string;
  description: string;
  prizeImage: string;
  prizeTitle: string;
  rules: string;
  prizeType: 'In-Game Weapon' | 'Roblox Game Pass' | 'Exclusive Pet' | 'Robux Gift';
  gamePassId?: string;
  prizeQuantity: number;
  maxParticipants: number;
  winnerCount: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'upcoming' | 'active' | 'full' | 'ended' | 'winner_selected' | 'completed' | 'cancelled';
  participantCount?: number;
  hasEntered?: boolean;
  winners?: {
    username: string;
    robloxUsername: string;
    prizeTitle: string;
    selectedAt: string;
    deliveryStatus?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'giveaway' | 'promo' | 'reward' | 'support' | 'system';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userEmail: string;
  robloxUsername: string;
  category: 'order_issue' | 'gamepass_delivery' | 'promo_code' | 'giveaway_prize' | 'general';
  orderId?: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  adminReply?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performedByUserId: string;
  performedByUsername: string;
  details: string;
  timestamp: string;
}
