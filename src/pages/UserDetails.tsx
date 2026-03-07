import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Coins,
  Receipt,
  Calendar,
  CreditCard,
  Loader2,
  Banknote,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<any>(null);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [depositPayments, setDepositPayments] = useState<Record<number, any[]>>(
    {},
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchAll();
  }, [id]);

  const fetchAll = async () => {
    try {
      setLoading(true);

      // Fetch customer
      const customerRes = await axios.get(`${API_URL}/api/customers/${id}`);
      setCustomer(customerRes.data);

      // Fetch deposits for this customer
      const depositsRes = await axios.get(
        `${API_URL}/api/deposits/customer/${id}`,
      );
      const customerDeposits = Array.isArray(depositsRes.data)
        ? depositsRes.data
        : [];
      setDeposits(customerDeposits);

      // Fetch payments for each deposit
      const paymentsMap: Record<number, any[]> = {};
      await Promise.all(
        customerDeposits.map(async (deposit: any) => {
          try {
            const paymentsRes = await axios.get(
              `${API_URL}/api/payments/deposit/${deposit.id}`,
            );
            paymentsMap[deposit.id] = Array.isArray(paymentsRes.data)
              ? paymentsRes.data
              : [];
          } catch {
            paymentsMap[deposit.id] = [];
          }
        }),
      );
      setDepositPayments(paymentsMap);
    } catch (error) {
      toast.error("Failed to load customer details");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Customer not found</h2>
        <Button variant="outline" onClick={() => navigate("/users")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Users
        </Button>
      </div>
    );
  }

  // Calculate totals
  const totalGoldWeight = deposits.reduce(
    (sum, d) => sum + Number(d.gold_weight_grams || 0),
    0,
  );
  const totalPaidOverall = Object.values(depositPayments)
    .flat()
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/users")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-semibold">
            Customer Profile
          </h1>
          <p className="text-muted-foreground">
            View customer details and transactions
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="w-20 h-20 border-4 border-gold/20">
              <AvatarImage src={customer.profile_picture_url} />
              <AvatarFallback className="bg-secondary text-foreground text-2xl font-medium">
                {getInitials(customer.full_name || "NA")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h2 className="text-2xl font-display font-semibold">
                {customer.full_name}
              </h2>
              <div className="flex flex-col gap-2 mt-3 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{customer.mobile_number || "N/A"}</span>
                </div>
                {customer.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    <span>{customer.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gold mb-1">
                <Coins className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">
                {totalGoldWeight.toFixed(3)}g
              </p>
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
              <p className="text-2xl font-bold">
                ₹{totalPaidOverall.toLocaleString("en-IN")}
              </p>
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
                const payments = depositPayments[deposit.id] || [];
                const totalPaid = payments.reduce(
                  (sum, p) => sum + Number(p.amount || 0),
                  0,
                );

                return (
                  <Card key={deposit.id} className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-mono text-sm font-medium">
                            {deposit.deposit_uid}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(deposit.created_at).toLocaleDateString(
                              "en-IN",
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ₹
                            {(Number(deposit.amount) || 0).toLocaleString(
                              "en-IN",
                            )}
                          </p>
                          <p className="text-sm text-gold">
                            {(Number(deposit.gold_weight_grams) || 0).toFixed(
                              3,
                            )}
                            g gold
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground mb-2">
                        Gold Rate at Deposit: ₹
                        {(
                          Number(deposit.gold_rate_at_time) || 0
                        ).toLocaleString("en-IN")}
                        /g
                      </div>

                      {/* Payments */}
                      {payments.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            Payment History
                          </p>
                          <div className="space-y-2">
                            {payments.map((payment) => (
                              <div
                                key={payment.id}
                                className="flex items-center justify-between text-sm bg-background/50 p-2 rounded"
                              >
                                <div className="flex items-center gap-2">
                                  {payment.payment_mode === "Cash" ? (
                                    <Banknote className="w-4 h-4 text-emerald-500" />
                                  ) : (
                                    <Smartphone className="w-4 h-4 text-blue-500" />
                                  )}
                                  <span>{payment.payment_mode}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(
                                      payment.paid_at,
                                    ).toLocaleDateString("en-IN")}
                                  </span>
                                </div>
                                <span className="font-medium text-emerald-600">
                                  +₹
                                  {(Number(payment.amount) || 0).toLocaleString(
                                    "en-IN",
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 pt-2 border-t border-border/50 flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Total Paid
                            </span>
                            <span className="font-semibold">
                              ₹{totalPaid.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      )}

                      {payments.length === 0 && (
                        <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                          No payments yet for this deposit
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
