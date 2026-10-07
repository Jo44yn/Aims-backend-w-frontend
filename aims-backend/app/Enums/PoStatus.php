<?php

namespace App\Enums;

enum PoStatus: string
{
    case Draft = 'draft';
    case ForApproval = 'for_approval';
    case Approved = 'approved';
    case Sent = 'sent';
    case PartiallyReceived = 'partially_received';
    case Received = 'received';
    case Closed = 'closed';
    case Cancelled = 'cancelled';
}