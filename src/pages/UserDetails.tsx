import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Phone, 
  MapPin, 
  Coins, 
  Receipt, 
  Download,
  Calendar,
  CreditCard
} from 'lucide-react';
import { exportToPDF, exportToExcel } from '@/utils/exportUtils';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, getCustomerDeposits, getDepositPayments } = useData();

  const user = users.find(u => u.id === id);
  const deposits = user ? getCustomerDeposits(user.id) : [];

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">User not found</h2>
        <Button variant="outline" onClick={() => navigate('/users')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Users
        </Button>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const totalPayments = deposits.reduce((sum, deposit) => {
    const payments = getDepositPayments(deposit.depositId);
    return sum + payments.reduce((pSum, p) => pSum + p.amount, 0);
  }, 0);

  const handleDownload = (format: 'pdf' | 'excel') => {
    if (format === 'pdf') {
      exportToPDF({ user, deposits, getDepositPayments });
    } else {
      exportToExcel({ user, deposits, getDepositPayments });
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/users')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-semibold">Customer Profile</h1>
          <p className="text-muted-foreground">View customer details and transactions</p>
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="w-20 h-20 border-4 border-gold/20">
              <AvatarImage src={user.profilePicture} />
              <AvatarFallback className="bg-secondary text-foreground text-2xl font-medium">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h2 className="text-2xl font-display font-semibold">{user.name}</h2>
              <div className="flex flex-col gap-2 mt-3 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{user.mobile}</span>
                </div>
                {user.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    <span>{user.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleDownload('pdf')}>
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDownload('excel')}>
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gold mb-1">
                <Coins className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">{user.totalGoldWeight.toFixed(3)}g</p>
              <p className="text-xs text-muted-foreground">Total Gold</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-blue-500 mb-1">
                <Receipt className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">{deposits.length}</p>
              <p className="text-xs text-muted-foreground">Deposits</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-emerald-500 mb-1">
                <CreditCard className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">₹{totalPayments.toLocaleString('en-IN')}</p>
              <p className="text-xs text-muted-foreground">Total Paid</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deposits */}
      <Card>
        <CardHeader>
          <CardTitle>Deposits</CardTitle>
          <CardDescription>All deposits made by this customer</CardDescription>
        </CardHeader>
        <CardContent>
          {deposits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No deposits yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {deposits.map((deposit) => {
                const payments = getDepositPayments(deposit.depositId);
                const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
                
                return (
                  <Card key={deposit.id} className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-mono text-sm font-medium">{deposit.depositId}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(deposit.createdAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{deposit.amount.toLocaleString('en-IN')}</p>
                          <p className="text-sm text-gold">{deposit.goldWeight.toFixed(3)}g gold</p>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground mb-2">
                        Gold Rate at Deposit: ₹{deposit.goldRateAtDeposit.toLocaleString('en-IN')}/g
                      </div>

                      {/* Payments for this deposit */}
                      {payments.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Payment History</p>
                          <div className="space-y-2">
                            {payments.map((payment) => (
                              <div 
                                key={payment.id} 
                                className="flex items-center justify-between text-sm bg-background/50 p-2 rounded"
                              >
                                <div>
                                  <span className="capitalize">{payment.paymentMode}</span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {new Date(payment.date).toLocaleDateString('en-IN')} {payment.time}
                                  </span>
                                </div>
                                <span className="font-medium text-success">
                                  +₹{payment.amount.toLocaleString('en-IN')}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 pt-2 border-t border-border/50 flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Paid</span>
                            <span className="font-semibold">₹{totalPaid.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetails;
