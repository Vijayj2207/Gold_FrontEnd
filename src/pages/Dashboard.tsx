import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Receipt,
  CreditCard,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Coins,
  Loader2,
  Banknote,
  Smartphone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCurrentGoldRate } from "@/services/DashboardService";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    totalPayments: 0,
    recentDeposits: [] as any[],
    recentPayments: [] as any[],
  });

  const [goldRateData, setGoldRateData] = useState({
    currentRate: 0,
    change: { amount: 0, percentage: 0 },
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchGoldRate();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/dashboard/stats`);
      console.log("Dashboard stats response:", res.data);
      setStats({
        totalUsers: res.data.totalUsers || 0,
        totalDeposits: res.data.totalDeposits || 0,
        totalPayments: res.data.totalPayments || 0,
        recentDeposits: res.data.recentDeposits || [],
        recentPayments: res.data.recentPayments || [],
      });
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoldRate = async () => {
    try {
      const data = await getCurrentGoldRate();
      const rate = data?.currentRate ?? data?.rate ?? 0;
      const changeAmount = data?.change?.amount ?? data?.change ?? 0;
      const changePercentage =
        data?.change?.percentage ?? data?.changePercentage ?? 0;
      setGoldRateData({
        currentRate: Number(rate) || 0,
        change: {
          amount: Number(changeAmount) || 0,
          percentage: Number(changePercentage) || 0,
        },
      });
    } catch (err) {
      console.error("Failed to fetch gold rate:", err);
    }
  };

  const statCards = [
    {
      title: "Current Gold Rate",
      value: `₹${(goldRateData.currentRate || 0).toLocaleString("en-IN")}`,
      subtitle: "per gram",
      icon: goldRateData.change.amount >= 0 ? TrendingUp : TrendingDown,
      color: "from-gold-dark to-gold",
      onClick: () => navigate("/gold-price"),
      change: goldRateData.change,
      showChange: true,
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      subtitle: "registered customers",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      onClick: () => navigate("/users"),
      showChange: false,
    },
    {
      title: "Total Deposits",
      value: stats.totalDeposits,
      subtitle: "active deposits",
      icon: Receipt,
      color: "from-emerald-500 to-emerald-600",
      onClick: () => navigate("/deposits"),
      showChange: false,
    },
    {
      title: "Total Payments",
      value: `₹${(stats.totalPayments || 0).toLocaleString("en-IN")}`,
      subtitle: "collected",
      icon: CreditCard,
      color: "from-violet-500 to-violet-600",
      onClick: () => navigate("/payments"),
      showChange: false,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-semibold">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome to your Gold Deposit Management System
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 group overflow-hidden"
            onClick={stat.onClick}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div
                className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} text-white`}
              >
                <stat.icon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div className="flex-1">
                  <div className="text-xl sm:text-2xl font-bold">
                    {stat.value}
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {stat.subtitle}
                    </p>
                    {stat.showChange &&
                      stat.change &&
                      Math.abs(stat.change.amount) > 0 && (
                        <div
                          className={`flex items-center gap-1 text-[10px] sm:text-xs font-medium ${
                            stat.change.amount >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {stat.change.amount >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span>
                            {stat.change.amount >= 0 ? "+" : ""}₹
                            {Math.abs(stat.change.amount).toFixed(2)}
                          </span>
                          <span className="text-muted-foreground">
                            ({stat.change.amount >= 0 ? "+" : ""}
                            {stat.change.percentage.toFixed(2)}%)
                          </span>
                        </div>
                      )}
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Deposits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Receipt className="w-5 h-5 text-gold" />
              Recent Deposits
            </CardTitle>
            <CardDescription>Latest deposit transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentDeposits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Coins className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No deposits yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentDeposits.map((deposit) => (
                  <div
                    key={deposit.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => navigate(`/deposits`)}
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {deposit.customer_name}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {deposit.deposit_uid}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        ₹{(Number(deposit.amount) || 0).toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-gold">
                        {(Number(deposit.gold_weight_grams) || 0).toFixed(3)}g
                        gold
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gold" />
              Recent Payments
            </CardTitle>
            <CardDescription>Latest payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentPayments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No payments yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => navigate(`/payments`)}
                  >
                    <div className="flex items-center gap-2">
                      {payment.payment_mode === "Cash" ? (
                        <Banknote className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Smartphone className="w-4 h-4 text-blue-500" />
                      )}
                      <div>
                        <p className="font-medium text-sm">
                          {payment.customer_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payment.payment_mode}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm text-emerald-600">
                        +₹
                        {(Number(payment.amount) || 0).toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payment.paid_at).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
