import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface DataContextType {
  users: any[];
  deposits: any[];
  payments: any[];
  stats: any;
  loading: boolean;
  refreshAll: () => void;
  getCustomerDeposits: (customerId: number) => any[];
  getDepositPayments: (depositId: number) => any[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    totalPayments: 0,
    recentDeposits: [],
    recentPayments: [],
    currentGoldRate: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      setLoading(true);

      const [usersRes, depositsRes, paymentsRes, statsRes] =
        await Promise.allSettled([
          axios.get(`${API_URL}/api/customers`),
          axios.get(`${API_URL}/api/deposits`),
          axios.get(`${API_URL}/api/payments`),
          axios.get(`${API_URL}/api/dashboard/stats`),
        ]);

      if (usersRes.status === "fulfilled") {
        setUsers(usersRes.value.data || []);
      }
      if (depositsRes.status === "fulfilled") {
        setDeposits(depositsRes.value.data || []);
      }
      if (paymentsRes.status === "fulfilled") {
        setPayments(paymentsRes.value.data || []);
      }
      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value.data || {});
      }
    } catch (err) {
      console.error("DataContext fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const getCustomerDeposits = (customerId: number) => {
    return deposits.filter((d) => d.customer_id === customerId);
  };

  const getDepositPayments = (depositId: number) => {
    return payments.filter((p) => p.deposit_id === depositId);
  };

  return (
    <DataContext.Provider
      value={{
        users,
        deposits,
        payments,
        stats,
        loading,
        refreshAll: fetchAll,
        getCustomerDeposits,
        getDepositPayments,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
