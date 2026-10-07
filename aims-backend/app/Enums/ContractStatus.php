<?php

namespace App\Enums;

enum ContractStatus: string
{
    case Awarded = 'awarded';
    case InProgress = 'in_progress';
    case Delivered = 'delivered';
    case Accepted = 'accepted';
    case Closed = 'closed';
    case Cancelled = 'cancelled';
}