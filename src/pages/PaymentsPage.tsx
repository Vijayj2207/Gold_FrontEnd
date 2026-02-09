import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Search, CreditCard, Calendar, Clock, Banknote, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

const PaymentsPage = () => {
  const { payments, users, deposits, getCustomerDeposits, addPayment } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedDepositId, setSelectedDepositId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'gpay'>('cash');

  const customerDeposits = selectedCustomerId ? getCustomerDeposits(selectedCustomerId) : [];

  const filteredPayments = payments.filter(payment =>
    payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.depositId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedDepositId || !amount) {
      toast.error('Please fill all required fields');
      return;
    }

    const customer = users.find(u => u.id === selectedCustomerId);
    if (!customer) return;

    addPayment({
      depositId: selectedDepositId,
      customerId: customer.id,
      customerName: customer.name,
      amount: parseFloat(amount),
      paymentMode,
    });

    toast.success('Payment recorded successfully!');
    setIsCreateOpen(false);
    setSelectedCustomerId('');
    setSelectedDepositId('');
    setAmount('');
    setPaymentMode('cash');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold">Payments</h1>
          <p className="text-muted-foreground">{payments.length} total payments</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-gold-dark to-gold text-primary gap-2 shadow-gold">
              <Plus className="w-4 h-4" />
              Add Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>Add a new payment against a deposit</DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Select Customer</Label>
                <Select 
                  value={selectedCustomerId} 
                  onValueChange={(value) => {
                    setSelectedCustomerId(value);
                    setSelectedDepositId('');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.length === 0 ? (
                      <SelectItem value="none" disabled>No customers available</SelectItem>
                    ) : (
                      users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} - {user.mobile}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select Deposit</Label>
                <Select 
                  value={selectedDepositId} 
                  onValueChange={setSelectedDepositId}
                  disabled={!selectedCustomerId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedCustomerId ? "Choose a deposit" : "Select customer first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {customerDeposits.length === 0 ? (
                      <SelectItem value="none" disabled>No deposits for this customer</SelectItem>
                    ) : (
                      customerDeposits.map((deposit) => (
                        <SelectItem key={deposit.id} value={deposit.depositId}>
                          {deposit.depositId} - ₹{deposit.amount.toLocaleString('en-IN')}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Payment Amount</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Mode</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={paymentMode === 'cash' ? 'default' : 'outline'}
                    onClick={() => setPaymentMode('cash')}
                    className={paymentMode === 'cash' ? 'bg-gold text-primary hover:bg-gold-dark' : ''}
                  >
                    <Banknote className="w-4 h-4 mr-2" />
                    Cash
                  </Button>
                  <Button
                    type="button"
                    variant={paymentMode === 'gpay' ? 'default' : 'outline'}
                    onClick={() => setPaymentMode('gpay')}
                    className={paymentMode === 'gpay' ? 'bg-gold text-primary hover:bg-gold-dark' : ''}
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    GPay
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-gold-dark to-gold text-primary"
                  disabled={!selectedDepositId}
                >
                  Record Payment
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by customer name or deposit ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium mb-1">No payments found</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? 'Try a different search term' : 'Record your first payment to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredPayments.slice().reverse().map((payment) => (
            <Card key={payment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        payment.paymentMode === 'cash' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {payment.paymentMode === 'cash' ? (
                          <Banknote className="w-5 h-5" />
                        ) : (
                          <Smartphone className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{payment.customerName}</h3>
                        <p className="text-sm font-mono text-muted-foreground">{payment.depositId}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-lg text-success">+₹{payment.amount.toLocaleString('en-IN')}</p>
                    <p className="text-sm text-muted-foreground capitalize">{payment.paymentMode}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(payment.date).toLocaleDateString('en-IN')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {payment.time}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
