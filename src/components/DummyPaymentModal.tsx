import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Smartphone, Building2, CheckCircle2, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/currency";

type PaymentMethod = "card" | "upi" | "netbanking";

interface DummyPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  onPaymentSuccess: () => void;
}

const DummyPaymentModal = ({ open, onOpenChange, amount, onPaymentSuccess }: DummyPaymentModalProps) => {
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Card fields
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvv, setCvv] = useState("123");
  const [cardName, setCardName] = useState("Test User");

  // UPI
  const [upiId, setUpiId] = useState("testuser@upi");

  // Net Banking
  const [selectedBank, setSelectedBank] = useState("SBI");

  const handlePay = async () => {
    setProcessing(true);
    // Simulate payment processing
    await new Promise((r) => setTimeout(r, 2000));
    setProcessing(false);
    setSuccess(true);
    // Wait a moment then trigger success
    setTimeout(() => {
      setSuccess(false);
      onPaymentSuccess();
    }, 1500);
  };

  const resetState = () => {
    setProcessing(false);
    setSuccess(false);
    setMethod("card");
  };

  const methods = [
    { id: "card" as const, label: "Card", icon: CreditCard },
    { id: "upi" as const, label: "UPI", icon: Smartphone },
    { id: "netbanking" as const, label: "Net Banking", icon: Building2 },
  ];

  const banks = ["SBI", "HDFC", "ICICI", "Axis", "PNB", "BOB", "Kotak", "Yes Bank"];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!processing) { resetState(); onOpenChange(v); } }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Secure Payment
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center py-8 gap-4"
          >
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <h3 className="font-display text-xl font-bold">Payment Successful!</h3>
            <p className="text-muted-foreground text-sm">Transaction verified</p>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {/* Amount */}
            <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Amount to Pay</p>
              <p className="font-display text-2xl font-bold text-primary">{formatPrice(amount)}</p>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-3 gap-2">
              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition-all ${
                    method === m.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  <m.icon className="h-5 w-5" />
                  {m.label}
                </button>
              ))}
            </div>

            {/* Card Form */}
            {method === "card" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">Card Number</label>
                  <Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="1234 5678 9012 3456" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">Cardholder Name</label>
                  <Input value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Name on card" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block text-muted-foreground">Expiry</label>
                    <Input value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block text-muted-foreground">CVV</label>
                    <Input type="password" value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="•••" />
                  </div>
                </div>
              </div>
            )}

            {/* UPI Form */}
            {method === "upi" && (
              <div>
                <label className="text-xs font-medium mb-1 block text-muted-foreground">UPI ID</label>
                <Input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi" />
                <p className="text-xs text-muted-foreground mt-2">Any UPI ID will be accepted for demo</p>
              </div>
            )}

            {/* Net Banking */}
            {method === "netbanking" && (
              <div>
                <label className="text-xs font-medium mb-2 block text-muted-foreground">Select Bank</label>
                <div className="grid grid-cols-2 gap-2">
                  {banks.map((bank) => (
                    <button
                      key={bank}
                      onClick={() => setSelectedBank(bank)}
                      className={`p-2.5 rounded-lg border text-sm transition-all ${
                        selectedBank === bank
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Demo Notice */}
            <p className="text-xs text-center text-muted-foreground bg-muted/30 rounded-lg p-2">
              🔒 Demo Mode — All payment methods are accepted. No real charges.
            </p>

            {/* Pay Button */}
            <Button variant="hero" className="w-full" onClick={handlePay} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Verifying Payment...
                </>
              ) : (
                `Pay ${formatPrice(amount)}`
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DummyPaymentModal;
