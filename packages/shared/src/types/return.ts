export const ReturnReason = {
  DAMAGED_ITEM: 'DAMAGED_ITEM',
  WRONG_ITEM: 'WRONG_ITEM',
  QUALITY_ISSUE: 'QUALITY_ISSUE',
  NOT_AS_DESCRIBED: 'NOT_AS_DESCRIBED',
  DEFECTIVE: 'DEFECTIVE',
  OTHER: 'OTHER',
} as const;
export type ReturnReason = (typeof ReturnReason)[keyof typeof ReturnReason];

export const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
  DAMAGED_ITEM: 'Damaged during delivery',
  WRONG_ITEM: 'Received wrong item',
  QUALITY_ISSUE: 'Item quality issue',
  NOT_AS_DESCRIBED: 'Item does not match description',
  DEFECTIVE: 'Defective / Not working',
  OTHER: 'Other reason',
};

export const ReturnStatus = {
  REQUESTED: 'REQUESTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  REFUNDED: 'REFUNDED',
} as const;
export type ReturnStatus = (typeof ReturnStatus)[keyof typeof ReturnStatus];

export const RETURN_STATUS_CONFIG: Record<
  ReturnStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  REQUESTED: {
    label: 'Pending Review',
    color: '#d97706',
    bg: '#fef3c7',
    border: '#fde68a',
  },
  APPROVED: {
    label: 'Approved',
    color: '#2563eb',
    bg: '#dbeafe',
    border: '#bfdbfe',
  },
  REFUNDED: {
    label: 'Refunded',
    color: '#16a34a',
    bg: '#dcfce7',
    border: '#bbf7d0',
  },
  REJECTED: {
    label: 'Rejected',
    color: '#dc2626',
    bg: '#fee2e2',
    border: '#fecaca',
  },
};

export interface ReturnItem {
  _id: string;
  orderItemId: string;
  productId: string;
  productSlug: string;
  name: string;
  image: string;
  variantSku?: string | null;
  variantTitle?: string | null;
  unitPrice: number;
  quantity: number;
  refundAmount: number;
}

export interface ReturnStatusHistory {
  status: ReturnStatus;
  timestamp: string | Date;
  note?: string;
  changedBy?: string;
}

export interface ReturnRequest {
  _id: string;
  returnNumber: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: ReturnItem[];
  reason: ReturnReason;
  customerNote?: string;
  proofImages?: string[];
  status: ReturnStatus;
  statusHistory: ReturnStatusHistory[];
  totalRefundAmount: number;
  adminNotes?: string;
  restockOnApproval: boolean;
  reviewedBy?: string | null;
  reviewedAt?: string | Date | null;
  rejectionReason?: string | null;
  refundProcessedAt?: string | Date | null;
  refundTransactionId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReturnRequestInput {
  orderId: string;
  items: Array<{
    orderItemId: string;
    quantity: number;
  }>;
  reason: ReturnReason;
  customerNote?: string;
  proofImages?: string[];
}

export interface ReviewReturnInput {
  decision: 'APPROVE' | 'REJECT';
  note?: string;
  restockItems?: boolean;
  adminNotes?: string;
}

export interface ProcessRefundInput {
  amount?: number;
  transactionId?: string;
  note?: string;
}

export interface AdminReturnSummary {
  totalRequests: number;
  pendingCount: number;
  approvedCount: number;
  refundedCount: number;
  rejectedCount: number;
  totalRefundedAmount: number;
}
