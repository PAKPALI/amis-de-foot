<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePasswordWasChanged
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $allowedRoutes = ['password.edit', 'password.update', 'logout'];

        if ($request->user()?->must_change_password && ! $request->routeIs(...$allowedRoutes)) {
            return to_route('password.edit');
        }

        return $next($request);
    }
}
