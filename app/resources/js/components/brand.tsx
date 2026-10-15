import AppLogoIcon from '@/components/app-logo-icon';
import { cn } from '@/lib/utils';

interface BrandProps {
    className?: string;
    compact?: boolean;
    onDark?: boolean;
}

export function Brand({ className, compact = false, onDark = false }: BrandProps) {
    return (
        <span className={cn('inline-flex items-center gap-3', className)}>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-[15px] bg-gradient-to-br from-white via-[#d7ebff] to-[#8abaff] text-[#174084] shadow-[0_10px_28px_rgba(47,113,231,0.28)]">
                <AppLogoIcon className="size-7" />
            </span>
            <span className={cn('flex flex-col leading-tight max-[360px]:hidden', onDark ? 'text-white' : 'text-foreground')}>
                <span className="text-[1rem] font-extrabold tracking-[-0.04em]">Amis de foot</span>
                {!compact && (
                    <span className={cn('mt-0.5 text-[0.62rem] font-bold tracking-[0.21em]', onDark ? 'text-blue-100/65' : 'text-muted-foreground')}>
                        LE CLUB, ENSEMBLE
                    </span>
                )}
            </span>
        </span>
    );
}
