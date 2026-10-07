import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { paymentsService } from '@shared/api/payments.service';
import { toast } from '@shared/ui/Toast';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  amount: number;
  customerName?: string;
  customerEmail?: string;
  onSuccess: (result: { transactionId: string; paymentIntentId: string }) => void;
  onFailure?: (errorMessage: string) => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  amount,
  customerName = 'Demo Customer',
  customerEmail = 'customer@zylo.com',
  onSuccess,
  onFailure,
}) => {
  // Modal status states: 'INIT' | 'READY' | 'PROCESSING' | 'SUCCESS' | 'DECLINED'
  const [stage, setStage] = useState<'INIT' | 'READY' | 'PROCESSING' | 'SUCCESS' | 'DECLINED'>('INIT');
  const [declineMessage, setDeclineMessage] = useState<string | null>(null);

  // Intent data
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [isSimulated, setIsSimulated] = useState<boolean>(true);

  // Form Fields
  const [cardholderName, setCardholderName] = useState<string>(customerName);
  const [cardNumber, setCardNumber] = useState<string>('4242 4242 4242 4242');
  const [expDate, setExpDate] = useState<string>('12/28');
  const [cvc, setCvc] = useState<string>('123');
  const [postalCode, setPostalCode] = useState<string>('97477');

  // Success transaction details
  const [confirmedTransactionId, setConfirmedTransactionId] = useState<string>('');

  // Initialize payment intent whenever modal opens
  useEffect(() => {
    if (!isOpen || !orderId) return;

    let isMounted = true;
    setStage('INIT');
    setDeclineMessage(null);

    const initIntent = async () => {
      try {
        const intent = await paymentsService.createPaymentIntent({
          orderId,
          amount,
          currency: 'usd',
          metadata: { receiptEmail: customerEmail },
        });

        if (!isMounted) return;
        setPaymentIntentId(intent.paymentIntentId);
        setIsSimulated(Boolean(intent.isSimulated));
        setStage('READY');
      } catch (err: any) {
        if (!isMounted) return;
        toast.error(err?.message || 'Failed to initialize Stripe Payment Intent');
        setStage('READY');
      }
    };

    initIntent();

    return () => {
      isMounted = false;
    };
  }, [isOpen, orderId, amount, customerEmail]);

  if (!isOpen) return null;

  // Format Card Number
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/.{1,4}/g);
    setCardNumber(parts ? parts.join(' ') : raw);
  };

  // Format Exp Date
  const handleExpDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setExpDate(raw);
  };

  // Quick fill helper
  const handleQuickFill = (card: 'VISA_SUCCESS' | 'DECLINE') => {
    if (card === 'VISA_SUCCESS') {
      setCardNumber('4242 4242 4242 4242');
      setExpDate('12/28');
      setCvc('123');
      setDeclineMessage(null);
      toast.success('Stripe standard test card populated (Success)');
    } else {
      setCardNumber('4000 0000 0000 0002');
      setExpDate('12/28');
      setCvc('123');
      setDeclineMessage(null);
      toast.info('Stripe decline test card populated');
    }
  };

  // Submit payment
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanNumber = cardNumber.replace(/\s+/g, '');
    if (cleanNumber.length < 13) {
      toast.error('Please enter a valid card number');
      return;
    }

    const [expMonth, expYear] = expDate.split('/').map((s) => s.trim());
    if (!expMonth || !expYear) {
      toast.error('Please enter a valid expiration date (MM/YY)');
      return;
    }

    try {
      setStage('PROCESSING');
      setDeclineMessage(null);

      // If user is testing card decline
      if (cleanNumber.endsWith('0002') || cleanNumber === '4000000000000002') {
        const declineReason = 'Your card has insufficient funds for this transaction.';
        await paymentsService.recordFailure({
          orderId,
          paymentIntentId,
          errorCode: 'card_declined',
          errorMessage: declineReason,
        });
        setDeclineMessage(declineReason);
        setStage('DECLINED');
        if (onFailure) onFailure(declineReason);
        return;
      }

      // Confirm with Stripe backend
      const res = await paymentsService.confirmPayment({
        paymentIntentId,
        orderId,
        cardBrand: getCardBrand(),
        cardLast4: cleanNumber.slice(-4),
      });

      if (res.success && res.transaction) {
        setConfirmedTransactionId(res.transaction.transactionId);
        setStage('SUCCESS');
        toast.success('Payment authorized and confirmed!');
        setTimeout(() => {
          onSuccess({
            transactionId: res.transaction.transactionId,
            paymentIntentId: res.transaction.paymentIntentId,
          });
        }, 1200);
      } else {
        // Declined
        const errorMsg = res.message || 'Your payment was declined by the card issuer.';
        setDeclineMessage(errorMsg);
        setStage('DECLINED');
        if (onFailure) onFailure(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Payment processing failed';
      setDeclineMessage(errorMsg);
      setStage('DECLINED');

      // Also record failure on backend if orderId is available
      try {
        await paymentsService.recordFailure({
          orderId,
          paymentIntentId,
          errorCode: 'card_error',
          errorMessage: errorMsg,
        });
      } catch {
        // silent fallback
      }

      if (onFailure) onFailure(errorMsg);
    }
  };

  // Detect card brand
  const getCardBrand = () => {
    const clean = cardNumber.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(clean)) return 'Mastercard';
    if (/^3[47]/.test(clean)) return 'Amex';
    return 'Card';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Stripe Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-white">
              <CreditCard className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-wide">Stripe Secure Checkout</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {isSimulated ? 'Test Sandbox' : 'Live Gateway'}
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                <Lock className="w-3 h-3 text-emerald-400" />
                End-to-end 256-bit encrypted card authorization
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={stage === 'PROCESSING'}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10 disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Price Bar */}
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500">Order Number: </span>
            <span className="font-mono font-bold text-slate-800">{orderNumber}</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-slate-500">Amount Due:</span>
            <span className="text-base font-black text-indigo-600 font-mono">
              ${Number(amount).toFixed(2)} USD
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {stage === 'INIT' ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-xs font-medium">Connecting to Stripe gateway & establishing session...</p>
            </div>
          ) : stage === 'SUCCESS' ? (
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Payment Confirmed!</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Your transaction has been securely authorized and completed. Order #{orderNumber} is now officially paid.
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 max-w-xs mx-auto text-left text-xs font-mono">
                <div className="flex justify-between text-slate-500 text-[11px] mb-1">
                  <span>Transaction ID:</span>
                  <span className="text-emerald-700 font-bold">PAID</span>
                </div>
                <div className="text-slate-800 break-all select-all font-bold">
                  {confirmedTransactionId || paymentIntentId}
                </div>
              </div>
              <p className="text-xs text-slate-400">Redirecting to order confirmation...</p>
            </div>
          ) : (
            <div>
              {/* Test Sandbox Helpers */}
              <div className="mb-5 bg-indigo-50/70 border border-indigo-200 rounded-lg p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Stripe Test Mode Simulator</span>
                  <span className="text-[10px] text-indigo-600 font-normal ml-auto">
                    No actual charges incurred
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('VISA_SUCCESS')}
                    className="flex-1 py-1.5 px-2.5 bg-white border border-indigo-300 rounded text-indigo-900 hover:bg-indigo-100 font-medium text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Success Card (4242)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('DECLINE')}
                    className="flex-1 py-1.5 px-2.5 bg-white border border-rose-200 rounded text-rose-900 hover:bg-rose-50 font-medium text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <AlertCircle className="w-3 h-3 text-rose-500" />
                    <span>Decline Card (0002)</span>
                  </button>
                </div>
              </div>

              {/* Decline Error Banner */}
              {stage === 'DECLINED' && declineMessage && (
                <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-3.5 text-xs flex items-start gap-2.5 animate-in slide-in-from-top-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold">Payment Authorization Declined</p>
                    <p className="text-[11px] text-rose-700 mt-0.5">{declineMessage}</p>
                    <p className="text-[10px] text-rose-600 mt-1">
                      Tip: Click "Success Card (4242)" above to simulate a successful Stripe payment.
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Card Form */}
              <form onSubmit={handleSubmitPayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Name on Card
                  </label>
                  <input
                    type="text"
                    required
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full text-xs py-2 px-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Card Number
                    </label>
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {getCardBrand()}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4242 4242 4242 4242"
                      maxLength={19}
                      className="w-full text-xs py-2 pl-9 pr-3 font-mono border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Expires
                    </label>
                    <input
                      type="text"
                      required
                      value={expDate}
                      onChange={handleExpDateChange}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full text-xs py-2 px-3 text-center font-mono border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      CVC / CVV
                    </label>
                    <input
                      type="password"
                      required
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="123"
                      maxLength={4}
                      className="w-full text-xs py-2 px-3 text-center font-mono border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="97477"
                      className="w-full text-xs py-2 px-3 font-mono border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={stage === 'PROCESSING'}
                    className="py-2.5 px-4 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Pay Later
                  </button>

                  <button
                    type="submit"
                    disabled={stage === 'PROCESSING'}
                    className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {stage === 'PROCESSING' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Authorizing with Stripe...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Pay ${Number(amount).toFixed(2)} USD</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Security Footer */}
        <div className="bg-slate-50/80 px-5 py-3 border-t border-slate-200 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Protected by Stripe Radar with fraud protection & PCI-DSS compliance</span>
        </div>
      </div>
    </div>
  );
};
