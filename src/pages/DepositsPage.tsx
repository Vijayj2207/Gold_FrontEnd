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
import { Plus, Search, Receipt, Calendar, Coins } from 'lucide-react';
import { toast } from 'sonner';

const PRESET_AMOUNTS = [5000, 10000, 15000];

const DepositsPage = () => {
  const { deposits, users, currentGoldRate, addDeposit } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(PRESET_AMOUNTS[0]);
  const [customAmount, setCustomAmount] = useState('');

  const filteredDeposits = deposits.filter(deposit =>
    deposit.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deposit.depositId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      toast.error('Please select a customer');
      return;
    }

    const customer = users.find(u => u.id === selectedCustomerId);
    if (!customer) return;

    const amount = selectedAmount === 'custom' ? parseFloat(customAmount) : selectedAmount;
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    addDeposit({
      customerId: customer.id,
      customerName: customer.name,
      amount,
    });

    toast.success(`Deposit created successfully! Gold weight: ${(amount / currentGoldRate).toFixed(3)}g`);
    setIsCreateOpen(false);
    setSelectedCustomerId('');
    setSelectedAmount(PRESET_AMOUNTS[0]);
    setCustomAmount('');
  };

  const goldWeight = selectedAmount === 'custom' 
    ? (parseFloat(customAmount) || 0) / currentGoldRate 
    : (selectedAmount || 0) / currentGoldRate;

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold">Deposits</h1>
          <p className="text-muted-foreground">{deposits.length} total deposits</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-gold-dark to-gold text-primary gap-2 shadow-gold">
              <Plus className="w-4 h-4" />
              New Deposit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Deposit</DialogTitle>
              <DialogDescription>
                Current Gold Rate: ₹{currentGoldRate.toLocaleString('en-IN')}/gram
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Select Customer</Label>
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
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
                <Label>Deposit Amount</Label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_AMOUNTS.map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant={selectedAmount === amount ? 'default' : 'outline'}
                      onClick={() => setSelectedAmount(amount)}
                      className={selectedAmount === amount ? 'bg-gold text-primary hover:bg-gold-dark' : ''}
                    >
                      ₹{amount.toLocaleString('en-IN')}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    variant={selectedAmount === 'custom' ? 'default' : 'outline'}
                    onClick={() => setSelectedAmount('custom')}
                    className={selectedAmount === 'custom' ? 'bg-gold text-primary hover:bg-gold-dark' : ''}
                  >
                    Custom
                  </Button>
                </div>

                {selectedAmount === 'custom' && (
                  <Input
                    type="number"
                    placeholder="Enter custom amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>

              {goldWeight > 0 && (
                <div className="p-4 bg-gold/10 rounded-lg border border-gold/20">
                  <div className="flex items-center gap-2 text-gold mb-2">
                    <Coins className="w-5 h-5" />
                    <span className="font-medium">Gold Calculation</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    At ₹{currentGoldRate.toLocaleString('en-IN')}/gram, this deposit equals:
                  </p>
                  <p className="text-2xl font-bold mt-1">{goldWeight.toFixed(3)} grams</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-gold-dark to-gold text-primary"
                  disabled={users.length === 0}
                >
                  Create Deposit
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

      {/* Deposits List */}
      {filteredDeposits.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Receipt className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium mb-1">No deposits found</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? 'Try a different search term' : 'Create your first deposit to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDeposits.map((deposit) => (
            <Card key={deposit.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-gold" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{deposit.customerName}</h3>
                        <p className="text-sm font-mono text-muted-foreground">{deposit.depositId}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-lg">₹{deposit.amount.toLocaleString('en-IN')}</p>
                    <div className="flex items-center gap-1 text-sm text-gold justify-end">
                      <Coins className="w-4 h-4" />
                      <span>{deposit.goldWeight.toFixed(3)}g</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(deposit.createdAt).toLocaleDateString('en-IN')}
                  </div>
                  <div>
                    Rate: ₹{deposit.goldRateAtDeposit.toLocaleString('en-IN')}/g
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

export default DepositsPage;
