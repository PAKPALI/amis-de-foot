import { type SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="3" />
            <path d="M32 17 44.5 26l-4.8 14.7H24.3L19.5 26 32 17Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
            <path
                d="m32 17 1.5-12M44.5 26l12-3M39.7 40.7l7 9.5M24.3 40.7l-7 9.5M19.5 26l-12-3"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
            />
        </svg>
    );
}
