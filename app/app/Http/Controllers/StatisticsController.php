<?php

namespace App\Http\Controllers;

use App\Models\CashTransaction;
use App\Models\Membership;
use App\Models\User;
use App\Services\StatisticsReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StatisticsController extends Controller
{
    public function admin(Request $request, StatisticsReport $report): Response
    {
        $filters = $this->filters($request, true);

        return Inertia::render('statistics/report', [
            'scope' => 'admin',
            'filters' => $filters,
            'report' => $report->build($filters),
            'members' => User::query()->whereHas('membership')->orderBy('name')->get(['id', 'name']),
            'categories' => CashTransaction::query()->where('affects_balance', true)->where('kind', '!=', CashTransaction::KIND_OPENING)->distinct()->orderBy('category')->pluck('category'),
        ]);
    }

    public function member(Request $request, StatisticsReport $report): Response
    {
        $filters = $this->filters($request, false);

        return Inertia::render('statistics/report', [
            'scope' => 'member',
            'filters' => $filters,
            'report' => $report->build($filters, $request->user()),
            'members' => [],
            'categories' => [],
        ]);
    }

    private function filters(Request $request, bool $admin): array
    {
        $rules = [
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
            'membership_status' => ['nullable', Rule::in([
                Membership::STATUS_AWAITING_PAYMENT, Membership::STATUS_AWAITING_APPROVAL,
                Membership::STATUS_APPROVED, Membership::STATUS_REJECTED,
            ])],
            'contribution_status' => ['nullable', Rule::in(['paid', 'pending'])],
        ];
        if ($admin) {
            $rules['member_id'] = ['nullable', 'integer', Rule::exists('users', 'id')];
            $rules['category'] = ['nullable', 'string', Rule::exists('cash_transactions', 'category')];
        }

        return Validator::make($request->query(), $rules)->validate();
    }
}
