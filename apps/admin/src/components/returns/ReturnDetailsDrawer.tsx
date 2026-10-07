import React, { useState } from 'react';
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  Clock,
  DollarSign,
  ExternalLink,
  Package,
  RotateCcw,
  User,
} from 'lucide-react';
import type { ReturnRequest } from '@shared/types/return';
import {
  RETURN_REASON_LABELS,
  RETURN_STATUS_CONFIG,
  ReturnStatus,
} from '@shared/types/return';
import { Drawer } from '@shared/ui/Drawer';
import { Button } from '@shared/ui/Button';
import { toast } from '@shared/ui/Toast';
import { returnsService } from '@shared/api/returns.service';
import { formatPrice } from '@shared/utils/currency';

interface ReturnDetailsDrawerProps {
  returnReq: ReturnRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onReturnUpdated: (updatedReturn: ReturnRequest) => void;
  currencySymbol?: string;
}

export const ReturnDetailsDrawer: React.FC<ReturnDetailsDrawerProps> = ({
  returnReq,
  isOpen,
  onClose,
  onReturnUpdated,
  currencySymbol = '$',
}) => {
  // Review actions state
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [restockItems, setRestockItems] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);

  // Refund actions state
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundTxnId, setRefundTxnId] = useState('');
  const [refundNote, setRefundNote] = useState('');
  const [showRefundBox, setShowRefundBox] = useState(false);

  // Sync state on change
  React.useEffect(() => {
    if (returnReq) {
      setReviewNote('');
      setRestockItems(true);
      setRejectReason('');
      setShowRejectBox(false);
      setRefundAmount(returnReq.totalRefundAmount);
      setRefundTxnId(`TXN-REF-${Date.now().toString().slice(-6)}`);
      setRefundNote('');
      setShowRefundBox(false);
    }
  }, [returnReq]);

  if (!returnReq) return null;

  const statusCfg = RETURN_STATUS_CONFIG[returnReq.status] || {
    label: returnReq.status,
    color: '#64748b',
    bg: '#f1f5f9',
    border: '#e2e8f0',
  };

  // Handle Approve
  const handleApprove = async () => {
    try {
      setIsReviewing(true);
      const res = await returnsService.reviewReturn(returnReq._id, {
        decision: 'APPROVE',
        note: reviewNote.trim() || 'Approved by support staff',
        restockItems,
      });
      toast.success('Return request approved successfully! Stock replenishment applied.');
      onReturnUpdated(res.returnRequest);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to approve return request');
    } finally {
      setIsReviewing(false);
    }
  };

  // Handle Reject
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please specify a rejection reason for the customer');
      return;
    }
    try {
      setIsReviewing(true);
      const res = await returnsService.reviewReturn(returnReq._id, {
        decision: 'REJECT',
        note: rejectReason.trim(),
      });
      toast.success('Return request has been rejected');
      onReturnUpdated(res.returnRequest);
      setShowRejectBox(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reject return request');
    } finally {
      setIsReviewing(false);
    }
  };

  // Handle Process Refund
  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsRefunding(true);
      const res = await returnsService.processRefund(returnReq._id, {
        amount: Number(refundAmount) || returnReq.totalRefundAmount,
        transactionId: refundTxnId.trim() || undefined,
        note: refundNote.trim() || 'Online refund triggered via payment gateway',
      });
      toast.success('Refund processed successfully! Order payment status updated to REFUNDED.');
      onReturnUpdated(res.returnRequest);
      setShowRefundBox(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to process refund');
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <span className="p-1.5 rounded bg-amber-50 text-amber-600">
            <RotateCcw className="w-4 h-4" />
          </span>
          <span className="font-mono font-bold">{returnReq.returnNumber}</span>
          <span
            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
            style={{
              backgroundColor: statusCfg.bg,
              color: statusCfg.color,
              borderColor: statusCfg.border,
            }}
          >
            {statusCfg.label}
          </span>
        </div>
      }
      description={`Requested on ${new Date(returnReq.createdAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`}
    >
      <div className="space-y-5 text-xs text-slate-800">
        {/* 1. Customer & Order Info Card */}
        <div className="p-4 rounded-md bg-white border border-slate-200 grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
              <User className="w-3 h-3" />
              <span>Customer Details</span>
            </div>
            <p className="font-bold text-slate-900">{returnReq.customerName}</p>
            <p className="text-slate-500">{returnReq.customerEmail}</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
              <Package className="w-3 h-3" />
              <span>Linked Order</span>
            </div>
            <p className="font-mono font-bold text-amber-600">
              #{returnReq.orderNumber}
            </p>
            <p className="text-[11px] text-slate-400">Order ID: {returnReq.orderId}</p>
          </div>
        </div>

        {/* 2. Return Reason & Customer Note */}
        <div className="p-4 rounded-md bg-white border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Return Reason
            </span>
            <span className="px-2 py-0.5 rounded font-bold text-xs bg-amber-50 text-amber-800 border border-amber-200">
              {RETURN_REASON_LABELS[returnReq.reason] || returnReq.reason}
            </span>
          </div>

          {returnReq.customerNote && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Customer Explanation
              </span>
              <p className="p-2.5 rounded bg-slate-50 border border-slate-100 text-slate-700 italic">
                "{returnReq.customerNote}"
              </p>
            </div>
          )}

          {/* Proof Photos */}
          {returnReq.proofImages && returnReq.proofImages.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Proof Photos Uploaded ({returnReq.proofImages.length})
              </span>
              <div className="grid grid-cols-3 gap-2">
                {returnReq.proofImages.map((img, i) => (
                  <a
                    key={i}
                    href={img}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative block aspect-square rounded overflow-hidden border border-slate-200 bg-slate-100 hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={img}
                      alt={`Proof ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold gap-1">
                      <ExternalLink className="w-3.5 h-3.5" /> View
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Items to Return */}
        <div className="p-4 rounded-md bg-white border border-slate-200 space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Returned Items Breakdown ({returnReq.items.length})
          </span>
          <div className="divide-y divide-slate-100">
            {returnReq.items.map((item, idx) => (
              <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center gap-3">
                <img
                  src={item.image || 'https://placehold.co/80?text=Product'}
                  alt={item.name}
                  className="w-11 h-11 rounded object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 truncate">{item.name}</p>
                  {item.variantTitle && (
                    <p className="text-[11px] text-slate-500">
                      Variant: {item.variantTitle} {item.variantSku ? `(${item.variantSku})` : ''}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500">
                    {formatPrice(item.unitPrice, { currencySymbol })} × {item.quantity} unit{item.quantity > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-slate-900">
                    {formatPrice(item.refundAmount, { currencySymbol })}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-medium">To Refund</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between font-bold text-sm">
            <span className="text-slate-600">Total Refund Claim:</span>
            <span className="text-amber-700 font-mono text-base">
              {formatPrice(returnReq.totalRefundAmount, { currencySymbol })}
            </span>
          </div>
        </div>

        {/* 4. Action Queue Controls */}
        <div className="p-4 rounded-md bg-white border border-slate-200 space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Administrative Actions
          </span>

          {/* If REQUESTED: Approve or Reject */}
          {returnReq.status === ReturnStatus.REQUESTED && (
            <div className="space-y-3">
              {!showRejectBox ? (
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
                    <input
                      type="checkbox"
                      checked={restockItems}
                      onChange={(e) => setRestockItems(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <span className="font-bold text-slate-800">
                        Automatically replenish inventory stock
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Increment product/variant stock quantity upon approval
                      </p>
                    </div>
                  </label>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Approval Note (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Return authorized; stock replenished"
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={isReviewing}
                      onClick={handleApprove}
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Approve Return
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isReviewing}
                      onClick={() => setShowRejectBox(true)}
                      leftIcon={<Ban className="w-3.5 h-3.5" />}
                    >
                      Reject Return
                    </Button>
                  </div>
                </div>
              ) : (
                /* Rejection Box */
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-md space-y-3">
                  <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                    <AlertCircle className="w-4 h-4" />
                    <span>Confirm Rejection</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Rejection Reason (Visible to customer)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Items show wear and tear beyond return policy period..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full text-xs p-2 border border-rose-300 rounded bg-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRejectBox(false)}
                      disabled={isReviewing}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      isLoading={isReviewing}
                      onClick={handleReject}
                    >
                      Confirm Rejection
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* If APPROVED: Trigger Online Refund */}
          {returnReq.status === ReturnStatus.APPROVED && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-900 text-xs">
                <p className="font-bold">Return Approved</p>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  Items have been inspected and approved. Trigger online refund to credit the customer's account.
                </p>
              </div>

              {!showRefundBox ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowRefundBox(true)}
                  leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                >
                  Trigger Refund via Payment Gateway
                </Button>
              ) : (
                <form onSubmit={handleProcessRefund} className="p-3 bg-emerald-50 border border-emerald-200 rounded-md space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <DollarSign className="w-4 h-4" />
                    <span>Process Online Refund</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Refund Amount ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                        className="w-full text-xs p-2 border border-slate-200 rounded bg-white font-mono focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Gateway Reference ID
                      </label>
                      <input
                        type="text"
                        value={refundTxnId}
                        onChange={(e) => setRefundTxnId(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 rounded bg-white font-mono focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Refund Note
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Gateway transaction executed"
                      value={refundNote}
                      onChange={(e) => setRefundNote(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRefundBox(false)}
                      disabled={isRefunding}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={isRefunding}
                      leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                    >
                      Confirm & Execute Refund
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* If REFUNDED: Completion Badge */}
          {returnReq.status === ReturnStatus.REFUNDED && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4" />
                <span>Refund Completed</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Transaction ID:{' '}
                <strong className="font-mono">{returnReq.refundTransactionId || 'N/A'}</strong>
              </p>
              {returnReq.refundProcessedAt && (
                <p className="text-[11px] text-emerald-700">
                  Processed on: {new Date(returnReq.refundProcessedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* If REJECTED: Notice */}
          {returnReq.status === ReturnStatus.REJECTED && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-900 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-rose-800">
                <Ban className="w-4 h-4" />
                <span>Return Request Rejected</span>
              </div>
              {returnReq.rejectionReason && (
                <p className="text-[11px] text-rose-700">
                  Reason: "{returnReq.rejectionReason}"
                </p>
              )}
              {returnReq.reviewedBy && (
                <p className="text-[11px] text-rose-600">
                  Reviewed by: {returnReq.reviewedBy}
                </p>
              )}
            </div>
          )}
        </div>

        {/* 5. Status History Timeline */}
        <div className="p-4 rounded-md bg-white border border-slate-200 space-y-3">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <Clock className="w-3 h-3" />
            <span>Audit Status Timeline</span>
          </div>

          <div className="relative pl-4 border-l border-slate-200 space-y-4">
            {returnReq.statusHistory.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white ring-1 ring-amber-300" />
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-slate-900">{step.status}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(step.timestamp).toLocaleString()}
                  </span>
                </div>
                {step.changedBy && (
                  <p className="text-[10px] text-slate-400">By {step.changedBy}</p>
                )}
                {step.note && (
                  <p className="text-xs text-slate-600 mt-0.5">{step.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
};
