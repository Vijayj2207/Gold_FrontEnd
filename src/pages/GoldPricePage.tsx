import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { TrendingUp, Calendar, AlertTriangle, Coins } from 'lucide-react';
import { toast } from 'sonner';

const GoldPricePage = () => {
  const { goldPrices, currentGoldRate, deposits, setGoldRate } = useData();
  const [isSetOpen, setIsSetOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [newPrice, setNewPrice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(newPrice);
    if (!price || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    // Check if there are existing deposits with current rate
    if (deposits.length > 0) {
      setShowWarning(true);
      return;
    }

    confirmSetRate();
  };

  const confirmSetRate = () => {
    const price = parseFloat(newPrice);
    setGoldRate(price);
    toast.success('Gold rate updated successfully!');
    setIsSetOpen(false);
    setShowWarning(false);
    setNewPrice('');
  };

  const sortedPrices = [...goldPrices].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold">Gold Price</h1>
          <p className="text-muted-foreground">Manage and track gold rates</p>
        </div>
        
        <Dialog open={isSetOpen} onOpenChange={setIsSetOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-gold-dark to-gold text-primary gap-2 shadow-gold">
              <TrendingUp className="w-4 h-4" />
              Set New Rate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Gold Rate</DialogTitle>
              <DialogDescription>
                Update the current gold price per gram
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Current Rate</Label>
                <div className="p-3 bg-muted rounded-lg">
                  <span className="text-2xl font-bold">₹{currentGoldRate.toLocaleString('en-IN')}</span>
                  <span className="text-muted-foreground text-sm ml-1">/gram</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPrice">New Rate (₹ per gram)</Label>
                <Input
                  id="newPrice"
                  type="number"
                  placeholder="Enter new gold rate"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  required
                />
              </div>

              {newPrice && parseFloat(newPrice) > 0 && (
                <div className="p-4 bg-gold/10 rounded-lg border border-gold/20">
                  <div className="flex items-center gap-2 text-gold mb-2">
                    <Coins className="w-5 h-5" />
                    <span className="font-medium">Calculation Example</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    At ₹{parseFloat(newPrice).toLocaleString('en-IN')}/gram:
                  </p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>₹5,000 = <span className="font-semibold">{(5000 / parseFloat(newPrice)).toFixed(3)}g</span></p>
                    <p>₹10,000 = <span className="font-semibold">{(10000 / parseFloat(newPrice)).toFixed(3)}g</span></p>
                    <p>₹15,000 = <span className="font-semibold">{(15000 / parseFloat(newPrice)).toFixed(3)}g</span></p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-gold-dark to-gold text-primary"
                >
                  Update Rate
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsSetOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Rate Card */}
      <Card className="bg-gradient-to-br from-gold-dark via-gold to-gold-light text-primary">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-primary/80 text-sm font-medium">Current Gold Rate</p>
              <p className="text-3xl md:text-4xl font-bold">
                ₹{currentGoldRate.toLocaleString('en-IN')}
                <span className="text-lg font-normal ml-1">/gram</span>
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-primary/20">
            <div className="text-center">
              <p className="text-lg font-semibold">{(5000 / currentGoldRate).toFixed(3)}g</p>
              <p className="text-xs text-primary/70">for ₹5,000</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{(10000 / currentGoldRate).toFixed(3)}g</p>
              <p className="text-xs text-primary/70">for ₹10,000</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{(15000 / currentGoldRate).toFixed(3)}g</p>
              <p className="text-xs text-primary/70">for ₹15,000</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price History */}
      <Card>
        <CardHeader>
          <CardTitle>Price History</CardTitle>
          <CardDescription>Track gold rate changes over time</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedPrices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No price history yet</p>
              <p className="text-sm">Set a gold rate to start tracking</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedPrices.map((price, index) => (
                <div 
                  key={price.id} 
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    index === 0 ? 'bg-gold/10 border border-gold/20' : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-gold text-primary' : 'bg-muted-foreground/10 text-muted-foreground'
                    }`}>
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold">₹{price.pricePerGram.toLocaleString('en-IN')}/gram</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(price.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                  {index === 0 && (
                    <span className="px-2 py-1 text-xs font-medium bg-gold/20 text-gold-dark rounded-full">
                      Current
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Warning Dialog */}
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Existing Deposits Warning
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have {deposits.length} deposit(s) created with the current gold rate of ₹{currentGoldRate.toLocaleString('en-IN')}/gram.
              <br /><br />
              Changing the gold rate will only affect <strong>new deposits</strong>. Existing deposits will retain their original gold weight calculated at the time of creation.
              <br /><br />
              Do you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmSetRate}
              className="bg-gradient-to-r from-gold-dark to-gold text-primary"
            >
              Yes, Update Rate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GoldPricePage;
