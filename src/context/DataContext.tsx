import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Deposit, Payment, GoldPrice, DashboardStats } from '@/types';

interface DataContextType {
  users: User[];
  deposits: Deposit[];
  payments: Payment[];
  goldPrices: GoldPrice[];
  currentGoldRate: number;
  stats: DashboardStats;
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'totalGoldWeight'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addDeposit: (deposit: Omit<Deposit, 'id' | 'depositId' | 'goldWeight' | 'goldRateAtDeposit' | 'createdAt' | 'status'>) => void;
  addPayment: (payment: Omit<Payment, 'id' | 'date' | 'time'>) => void;
  setGoldRate: (price: number) => boolean;
  getCustomerDeposits: (customerId: string) => Deposit[];
  getDepositPayments: (depositId: string) => Payment[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substr(2, 9);
const generateDepositId = () => `DEP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [goldPrices, setGoldPrices] = useState<GoldPrice[]>([]);
  const [currentGoldRate, setCurrentGoldRate] = useState<number>(7500);

  // Load data from localStorage
  useEffect(() => {
    const storedUsers = localStorage.getItem('goldapp_users');
    const storedDeposits = localStorage.getItem('goldapp_deposits');
    const storedPayments = localStorage.getItem('goldapp_payments');
    const storedGoldPrices = localStorage.getItem('goldapp_goldprices');
    const storedCurrentRate = localStorage.getItem('goldapp_currentrate');

    if (storedUsers) setUsers(JSON.parse(storedUsers));
    if (storedDeposits) setDeposits(JSON.parse(storedDeposits));
    if (storedPayments) setPayments(JSON.parse(storedPayments));
    if (storedGoldPrices) setGoldPrices(JSON.parse(storedGoldPrices));
    if (storedCurrentRate) setCurrentGoldRate(JSON.parse(storedCurrentRate));
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('goldapp_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('goldapp_deposits', JSON.stringify(deposits));
  }, [deposits]);

  useEffect(() => {
    localStorage.setItem('goldapp_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('goldapp_goldprices', JSON.stringify(goldPrices));
  }, [goldPrices]);

  useEffect(() => {
    localStorage.setItem('goldapp_currentrate', JSON.stringify(currentGoldRate));
  }, [currentGoldRate]);

  const stats: DashboardStats = {
    currentGoldRate,
    totalUsers: users.length,
    totalDeposits: deposits.length,
    totalPayments: payments.reduce((sum, p) => sum + p.amount, 0),
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt' | 'totalGoldWeight'>) => {
    const newUser: User = {
      ...userData,
      id: generateId(),
      createdAt: new Date(),
      totalGoldWeight: 0,
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...userData } : user
    ));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
    setDeposits(prev => prev.filter(deposit => deposit.customerId !== id));
    setPayments(prev => prev.filter(payment => payment.customerId !== id));
  };

  const addDeposit = (depositData: Omit<Deposit, 'id' | 'depositId' | 'goldWeight' | 'goldRateAtDeposit' | 'createdAt' | 'status'>) => {
    const goldWeight = depositData.amount / currentGoldRate;
    const newDeposit: Deposit = {
      ...depositData,
      id: generateId(),
      depositId: generateDepositId(),
      goldWeight,
      goldRateAtDeposit: currentGoldRate,
      createdAt: new Date(),
      status: 'active',
    };
    setDeposits(prev => [...prev, newDeposit]);

    // Update user's total gold weight
    setUsers(prev => prev.map(user => 
      user.id === depositData.customerId 
        ? { ...user, totalGoldWeight: user.totalGoldWeight + goldWeight }
        : user
    ));
  };

  const addPayment = (paymentData: Omit<Payment, 'id' | 'date' | 'time'>) => {
    const now = new Date();
    const newPayment: Payment = {
      ...paymentData,
      id: generateId(),
      date: now,
      time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
    setPayments(prev => [...prev, newPayment]);
  };

  const setGoldRate = (price: number): boolean => {
    const newGoldPrice: GoldPrice = {
      id: generateId(),
      pricePerGram: price,
      date: new Date(),
      setBy: 'admin',
    };
    setGoldPrices(prev => [...prev, newGoldPrice]);
    setCurrentGoldRate(price);
    return true;
  };

  const getCustomerDeposits = (customerId: string): Deposit[] => {
    return deposits.filter(d => d.customerId === customerId);
  };

  const getDepositPayments = (depositId: string): Payment[] => {
    return payments.filter(p => p.depositId === depositId);
  };

  return (
    <DataContext.Provider value={{
      users,
      deposits,
      payments,
      goldPrices,
      currentGoldRate,
      stats,
      addUser,
      updateUser,
      deleteUser,
      addDeposit,
      addPayment,
      setGoldRate,
      getCustomerDeposits,
      getDepositPayments,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
