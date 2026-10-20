<?php

namespace App\Http\Controllers;

use App\Models\ContributionPaymentBatch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContributionReceiptController extends Controller
{
    public function show(Request $request, ContributionPaymentBatch $batch): Response
    {
        abort_unless($batch->status === ContributionPaymentBatch::STATUS_CONFIRMED && $batch->receipt_number, 404);

        $user = $request->user();
        abort_unless($user->id === $batch->user_id || $user->canAccessAdministration(), 403);

        $batch->load(['member:id,name,email,phone', 'periods' => fn ($query) => $query->orderBy('period_starts_on')]);

        return Inertia::render('contributions/receipt', [
            'receiptNumber' => $batch->receipt_number,
            'issuedAt' => ($batch->confirmed_at ?? $batch->reported_at ?? $batch->created_at)->toIso8601String(),
            'memberName' => $batch->member->name,
            'memberContact' => $batch->member->email ?: $batch->member->phone,
            'reference' => $batch->reference,
            'months' => $batch->periods->map(fn ($period) => [
                'periodStartsOn' => $period->period_starts_on->toDateString(),
                'amount' => $period->amount,
            ])->values(),
            'amount' => $batch->amount,
        ]);
    }
}
