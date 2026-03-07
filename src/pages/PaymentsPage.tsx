import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  CreditCard,
  Calendar,
  Banknote,
  Smartphone,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllPayments,
  createPayment,
  deletePayment,
} from "@/services/paymentsService.js";
import { getUsers } from "@/services/customerService";
import { getDepositsByCustomer } from "@/services/depositService";

const PaymentsPage = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerDeposits, setCustomerDeposits] = useState<any[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedDepositId, setSelectedDepositId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<"Cash" | "GPay">("Cash");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [loadingDeposits, setLoadingDeposits] = useState(false);

  /* ── Fetch on mount ── */
  useEffect(() => {
    fetchPayments();
    fetchCustomers();
  }, []);

  const fetchPayments = async () => {
    try {
      setFetching(true);
      const data = await getAllPayments();
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load payments");
    } finally {
      setFetching(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await getUsers();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load customers");
    }
  };

  /* ── When customer is selected, load their deposits ── */
  const handleCustomerChange = async (customerId: string) => {
    setSelectedCustomerId(customerId);
    setSelectedDepositId("");
    setCustomerDeposits([]);

    if (!customerId) return;

    try {
      setLoadingDeposits(true);
      const data = await getDepositsByCustomer(customerId);
      setCustomerDeposits(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load deposits for this customer");
    } finally {
      setLoadingDeposits(false);
    }
  };

  /* ── Create payment ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomerId || !selectedDepositId || !amount) {
      toast.error("Please fill all required fields");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (parsedAmount <= 0) {
      toast.error("Amount must be positive");
      return;
    }

    try {
      setLoading(true);
      const result = await createPayment({
        deposit_id: Number(selectedDepositId),
        customer_id: Number(selectedCustomerId),
        amount: parsedAmount,
        payment_mode: paymentMode,
      });

      if (result.message === "Payment created successfully") {
        toast.success("Payment recorded successfully!");
        await fetchPayments();
        setIsCreateOpen(false);
        setSelectedCustomerId("");
        setSelectedDepositId("");
        setAmount("");
        setPaymentMode("Cash");
        setCustomerDeposits([]);
      } else {
        toast.error(result.message || "Failed to record payment");
      }
    } catch (err) {
      toast.error("Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  /* ── Delete payment ── */
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this payment?")) return;
    try {
      await deletePayment(id);
      toast.success("Payment deleted");
      await fetchPayments();
    } catch (err) {
      toast.error("Failed to delete payment");
    }
  };

  const filteredPayments = payments.filter(
    (payment) =>
      (payment.customer_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (payment.deposit_uid || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold">
            Payments
          </h1>
          <p className="text-muted-foreground">
            {payments.length} total payments
          </p>
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
              <DialogDescription>
                Add a new payment against a deposit
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Customer dropdown */}
              <div className="space-y-2">
                <Label>Select Customer</Label>
                <Select
                  value={selectedCustomerId}
                  onValueChange={handleCustomerChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No customers available
                      </SelectItem>
                    ) : (
                      customers.map((customer) => (
                        <SelectItem
                          key={customer.id}
                          value={String(customer.id)}
                        >
                          {customer.full_name} - {customer.mobile_number}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Deposit dropdown — loads after customer selected */}
              <div className="space-y-2">
                <Label>Select Deposit</Label>
                <Select
                  value={selectedDepositId}
                  onValueChange={setSelectedDepositId}
                  disabled={!selectedCustomerId || loadingDeposits}
                >
                  <SelectTrigger>
                    {loadingDeposits ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading deposits...</span>
                      </div>
                    ) : (
                      <SelectValue
                        placeholder={
                          !selectedCustomerId
                            ? "Select customer first"
                            : customerDeposits.length === 0
                              ? "No deposits found"
                              : "Choose a deposit"
                        }
                      />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {customerDeposits.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No deposits for this customer
                      </SelectItem>
                    ) : (
                      customerDeposits.map((deposit) => (
                        <SelectItem key={deposit.id} value={String(deposit.id)}>
                          {deposit.deposit_uid} — ₹
                          {(Number(deposit.amount) || 0).toLocaleString(
                            "en-IN",
                          )}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
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

              {/* Payment mode */}
              <div className="space-y-2">
                <Label>Payment Mode</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={paymentMode === "Cash" ? "default" : "outline"}
                    onClick={() => setPaymentMode("Cash")}
                    className={
                      paymentMode === "Cash"
                        ? "bg-gold text-primary hover:bg-gold-dark"
                        : ""
                    }
                  >
                    <Banknote className="w-4 h-4 mr-2" />
                    Cash
                  </Button>
                  <Button
                    type="button"
                    variant={paymentMode === "GPay" ? "default" : "outline"}
                    onClick={() => setPaymentMode("GPay")}
                    className={
                      paymentMode === "GPay"
                        ? "bg-gold text-primary hover:bg-gold-dark"
                        : ""
                    }
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
                  disabled={loading || !selectedDepositId}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Recording...
                    </>
                  ) : (
                    "Record Payment"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
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
      {fetching ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      ) : filteredPayments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium mb-1">No payments found</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm
                ? "Try a different search term"
                : "Record your first payment to get started"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredPayments.map((payment) => (
            <Card
              key={payment.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          payment.payment_mode === "Cash"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {payment.payment_mode === "Cash" ? (
                          <Banknote className="w-5 h-5" />
                        ) : (
                          <Smartphone className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {payment.customer_name}
                        </h3>
                        <p className="text-sm font-mono text-muted-foreground">
                          {payment.deposit_uid}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-lg text-emerald-600">
                        +₹
                        {(Number(payment.amount) || 0).toLocaleString("en-IN")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payment.payment_mode}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(payment.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(payment.paid_at).toLocaleDateString("en-IN")}
                  </div>
                  <div>Deposit: {payment.deposit_uid}</div>
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
