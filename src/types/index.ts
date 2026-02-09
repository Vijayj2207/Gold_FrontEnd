export interface User {
  id: string;
  name: string;
  mobile: string;
  address: string;
  profilePicture?: string;
  createdAt: Date;
  totalGoldWeight: number;
}

export interface Deposit {
  id: string;
  depositId: string;
  customerId: string;
  customerName: string;
  amount: number;
  goldWeight: number;
  goldRateAtDeposit: number;
  createdAt: Date;
  status: 'active' | 'completed';
}

export interface Payment {
  id: string;
  depositId: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMode: 'cash' | 'gpay';
  date: Date;
  time: string;
}

export interface GoldPrice {
  id: string;
  pricePerGram: number;
  date: Date;
  setBy: string;
}

export interface DashboardStats {
  currentGoldRate: number;
  totalUsers: number;
  totalDeposits: number;
  totalPayments: number;
}
