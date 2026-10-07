<?php

namespace App\Enums;

enum MovementType: string
{
    case Receive = 'RECEIVE';
    case Produce = 'PRODUCE';
    case QaPass = 'QA_PASS';
    case QaReject = 'QA_REJECT';
    case ReturnToSupplier = 'RETURN_TO_SUPPLIER';
    case Deliver = 'DELIVER';
    case Reallocate = 'REALLOCATE';
    case Adjust = 'ADJUST';
}