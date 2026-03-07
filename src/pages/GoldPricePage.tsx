import { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  Coins,
  RefreshCw,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import {
  getCurrentGoldRate,
  getGoldRateHistory,
  setGoldRate as setGoldRateAPI,
} from "@/services/DashboardService";

const GoldPricePage = () => {
  const { deposits } = useData();
  const [isSetOpen, setIsSetOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [newPrice, setNewPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [currentGoldRate, setCurrentGoldRate] = useState<number>(0);
  const [goldRateChange, setGoldRateChange] = useState({
    amount: 0,
    percentage: 0,
  });
  const [goldPrices, setGoldPrices] = useState<any[]>([]);

  const fetchGoldData = async () => {
    try {
      const currentData = await getCurrentGoldRate();

      // ✅ Handle both possible API response shapes
      const rate = currentData?.currentRate ?? currentData?.rate ?? 0;
      const changeAmount =
        currentData?.change?.amount ?? currentData?.change ?? 0;
      const changePercentage =
        currentData?.change?.percentage ?? currentData?.changePercentage ?? 0;

      setCurrentGoldRate(Number(rate) || 0);
      setGoldRateChange({
        amount: Number(changeAmount) || 0,
        percentage: Number(changePercentage) || 0,
      });
      setLastUpdated(new Date());

      const historyData = await getGoldRateHistory(30);
      setGoldPrices(Array.isArray(historyData) ? historyData : []);
    } catch (error) {
      console.error("Failed to fetch gold data:", error);
      toast.error("Failed to fetch gold rate data");
    }
  };

  const handleForceRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchGoldData();
      toast.success("Gold rate refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh gold rate");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGoldData();
    const interval = setInterval(fetchGoldData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(newPrice);
    if (!price || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    if (deposits.length > 0) {
      setShowWarning(true);
      return;
    }
    confirmSetRate();
  };

  const confirmSetRate = async () => {
    try {
      setLoading(true);
      const price = parseFloat(newPrice);
      const today = new Date().toISOString().split("T")[0];
      await setGoldRateAPI(today, price);
      await fetchGoldData();
      toast.success("Gold rate updated successfully!");
      setIsSetOpen(false);
      setShowWarning(false);
      setNewPrice("");
    } catch (error) {
      toast.error("Failed to update gold rate");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentMonthPrices = () => {
    const now = new Date();
    return goldPrices.filter((price) => {
      const priceDate = new Date(price.date);
      return (
        priceDate.getMonth() === now.getMonth() &&
        priceDate.getFullYear() === now.getFullYear()
      );
    });
  };

  const currentMonthPrices = getCurrentMonthPrices();
  const sortedPrices = [...currentMonthPrices].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const currentMonthName = new Date().toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const formatLastUpdated = () => {
    if (!lastUpdated) return "Never";
    const diff = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return lastUpdated.toLocaleString("en-IN");
  };

  // Safe helpers
  const safeRate = currentGoldRate || 0;
  const safeChangeAmount = goldRateChange?.amount || 0;
  const safeChangePercentage = goldRateChange?.percentage || 0;

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold">
            Gold Price
          </h1>
          <p className="text-muted-foreground">Manage and track gold rates</p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {formatLastUpdated()}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleForceRefresh}
            disabled={refreshing}
            title="Refresh gold rate"
            className="relative"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <Globe className="w-2 h-2 absolute bottom-1 right-1 text-green-500" />
          </Button>

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
                  Manually override the current gold price per gram
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Rate</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">
                        ₹{safeRate.toLocaleString("en-IN")}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        /gram
                      </span>
                      <Globe className="w-4 h-4 text-green-500 ml-auto" />
                    </div>

                    {Math.abs(safeChangeAmount) > 0 && (
                      <div
                        className={`inline-flex items-center gap-1 mt-2 text-xs font-medium ${
                          safeChangeAmount >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {safeChangeAmount >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>
                          {safeChangeAmount >= 0 ? "+" : ""}₹
                          {Math.abs(safeChangeAmount).toFixed(2)}
                        </span>
                        <span className="text-muted-foreground">
                          ({safeChangeAmount >= 0 ? "+" : ""}
                          {safeChangePercentage.toFixed(2)}%) today
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Note:</strong> Manual rate override will replace
                    today's rate.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPrice">Override Rate (₹ per gram)</Label>
                  <Input
                    id="newPrice"
                    type="number"
                    step="0.01"
                    placeholder="Enter manual gold rate"
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
                      At ₹{parseFloat(newPrice).toLocaleString("en-IN")}/gram:
                    </p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p>
                        ₹5,000 ={" "}
                        <span className="font-semibold">
                          {(5000 / parseFloat(newPrice)).toFixed(3)}g
                        </span>
                      </p>
                      <p>
                        ₹10,000 ={" "}
                        <span className="font-semibold">
                          {(10000 / parseFloat(newPrice)).toFixed(3)}g
                        </span>
                      </p>
                      <p>
                        ₹15,000 ={" "}
                        <span className="font-semibold">
                          {(15000 / parseFloat(newPrice)).toFixed(3)}g
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-gold-dark to-gold text-primary"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Override Rate"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsSetOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Current Rate Card */}
      <Card className="bg-gradient-to-br from-gold-dark via-gold to-gold-light text-primary relative overflow-hidden">
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
          <Globe className="w-3 h-3" />
          <span>Live</span>
        </div>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              {safeChangeAmount >= 0 ? (
                <TrendingUp className="w-6 h-6 text-primary" />
              ) : (
                <TrendingDown className="w-6 h-6 text-primary" />
              )}
            </div>
            <div>
              <p className="text-primary/80 text-sm font-medium">
                Current Gold Rate
              </p>
              <p className="text-3xl md:text-4xl font-bold">
                ₹{safeRate.toLocaleString("en-IN")}
                <span className="text-lg font-normal ml-1">/gram</span>
              </p>

              {Math.abs(safeChangeAmount) > 0 && (
                <div
                  className={`flex items-center gap-1 mt-1 text-sm font-medium ${
                    safeChangeAmount >= 0
                      ? "text-green-700 dark:text-green-300"
                      : "text-red-700 dark:text-red-300"
                  }`}
                >
                  {safeChangeAmount >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>
                    {safeChangeAmount >= 0 ? "+" : ""}₹
                    {Math.abs(safeChangeAmount).toFixed(2)}
                  </span>
                  <span className="text-primary/70">
                    ({safeChangeAmount >= 0 ? "+" : ""}
                    {safeChangePercentage.toFixed(2)}%) today
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-primary/20">
            <div className="text-center">
              <p className="text-lg font-semibold">
                {safeRate > 0 ? (5000 / safeRate).toFixed(3) : "0.000"}g
              </p>
              <p className="text-xs text-primary/70">for ₹5,000</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">
                {safeRate > 0 ? (10000 / safeRate).toFixed(3) : "0.000"}g
              </p>
              <p className="text-xs text-primary/70">for ₹10,000</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">
                {safeRate > 0 ? (15000 / safeRate).toFixed(3) : "0.000"}g
              </p>
              <p className="text-xs text-primary/70">for ₹15,000</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Price History
                <span className="text-xs font-normal px-2 py-1 bg-muted rounded-full">
                  {currentMonthName}
                </span>
              </CardTitle>
              <CardDescription>Gold rates for current month</CardDescription>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {sortedPrices.length}{" "}
              {sortedPrices.length === 1 ? "entry" : "entries"}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {sortedPrices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No price history for this month</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedPrices.map((price, index) => {
                const isToday =
                  price.date === new Date().toISOString().split("T")[0];
                const priceChange = Number(price.change) || 0;
                const priceChangePercentage =
                  Number(price.changePercentage) || 0;
                const priceRate = Number(price.rate) || 0;
                const isIncreased = priceChange >= 0;

                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                      isToday
                        ? "bg-gold/10 border border-gold/20"
                        : "bg-muted/50 hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isToday
                            ? "bg-gold text-primary"
                            : "bg-muted-foreground/10 text-muted-foreground"
                        }`}
                      >
                        {isIncreased ? (
                          <TrendingUp className="w-5 h-5" />
                        ) : (
                          <TrendingDown className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">
                          ₹{priceRate.toLocaleString("en-IN")}/gram
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(price.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              weekday: "short",
                            })}
                          </div>

                          {Math.abs(priceChange) > 0 && (
                            <div
                              className={`flex items-center gap-1 text-xs font-medium ${
                                isIncreased
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {isIncreased ? "+" : ""}₹
                              {Math.abs(priceChange).toFixed(2)}
                              <span className="text-muted-foreground">
                                ({isIncreased ? "+" : ""}
                                {priceChangePercentage.toFixed(2)}%)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {isToday && (
                      <div className="flex flex-col items-end gap-1">
                        <span className="px-2 py-1 text-xs font-medium bg-gold/20 text-gold-dark rounded-full">
                          Today
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-green-600">
                          <Globe className="w-2 h-2" />
                          Live
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Info Card */}
      <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
              <Globe className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Live Gold Rates
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Rates are synced automatically. Click refresh to get the latest
                rate instantly.
              </p>
            </div>
          </div>
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
              You have {deposits.length} deposit(s) created with the current
              gold rate of ₹{safeRate.toLocaleString("en-IN")}/gram.
              <br />
              <br />
              Changing the gold rate will only affect{" "}
              <strong>new deposits</strong>.
              <br />
              <br />
              Do you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSetRate}
              className="bg-gradient-to-r from-gold-dark to-gold text-primary"
              disabled={loading}
            >
              {loading ? "Updating..." : "Yes, Update Rate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GoldPricePage;
