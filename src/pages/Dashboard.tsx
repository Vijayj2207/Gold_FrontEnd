import { useData } from '@/context/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Receipt, CreditCard, TrendingUp, ArrowUpRight, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { stats, deposits, payments } = useData();
  const navigate = useNavigate();

  const statCards = [
    {
      title: 'Current Gold Rate',
      value: `₹${stats.currentGoldRate.toLocaleString('en-IN')}`,
      subtitle: 'per gram',
      icon: TrendingUp,
      color: 'from-gold-dark to-gold',
      onClick: () => navigate('/gold-price'),
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      subtitle: 'registered customers',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      onClick: () => navigate('/users'),
    },
    {
      title: 'Total Deposits',
      value: stats.totalDeposits,
      subtitle: 'active deposits',
      icon: Receipt,
      color: 'from-emerald-500 to-emerald-600',
      onClick: () => navigate('/deposits'),
    },
    {
      title: 'Total Payments',
      value: `₹${stats.totalPayments.toLocaleString('en-IN')}`,
      subtitle: 'collected',
      icon: CreditCard,
      color: 'from-violet-500 to-violet-600',
      onClick: () => navigate('/payments'),
    },
  ];

  const recentDeposits = deposits.slice(-5).reverse();
  const recentPayments = payments.slice(-5).reverse();

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your Gold Deposit Management System</p>
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
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} text-white`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.subtitle}</p>
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
            {recentDeposits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Coins className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No deposits yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentDeposits.map((deposit) => (
                  <div 
                    key={deposit.id} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{deposit.customerName}</p>
                      <p className="text-xs text-muted-foreground">{deposit.depositId}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">₹{deposit.amount.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-gold">{deposit.goldWeight.toFixed(3)}g gold</p>
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
            {recentPayments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No payments yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment) => (
                  <div 
                    key={payment.id} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{payment.customerName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{payment.paymentMode}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm text-success">
                        +₹{payment.amount.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-muted-foreground">{payment.time}</p>
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
