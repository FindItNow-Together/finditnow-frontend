'use client';

import React from 'react';

interface StarRatingProps {
    rating: number;
    onChange?: (rating: number) => void;
    readonly?: boolean;
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
}

export default function StarRating({
    rating,
    onChange,
    readonly = false,
    size = 'md',
    showValue = false,
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = React.useState(0);

    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    const handleClick = (value: number) => {
        if (!readonly && onChange) {
            onChange(value);
        }
    };

    const displayRating = hoverRating || rating || 0;

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => {
                const isFilled = value <= displayRating;
                const isHalf = !isFilled && value - 0.5 <= displayRating;

                return (
                    <button
                        key={value}
                        type="button"
                        onClick={() => handleClick(value)}
                        onMouseEnter={() => !readonly && setHoverRating(value)}
                        onMouseLeave={() => !readonly && setHoverRating(0)}
                        disabled={readonly}
                        className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
                        aria-label={`${value} star${value > 1 ? 's' : ''}`}
                    >
                        <svg
                            className={`${sizes[size]} transition-colors`}
                            fill={isFilled ? '#FCD34D' : isHalf ? 'url(#halfGradient)' : 'none'}
                            stroke="#FCD34D"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                        >
                            <defs>
                                <linearGradient id="halfGradient">
                                    <stop offset="50%" stopColor="#FCD34D" />
                                    <stop offset="50%" stopColor="transparent" />
                                </linearGradient>
                            </defs>
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                        </svg>
                    </button>
                );
            })}
            {showValue && (
                <span className="ml-2 text-sm font-medium text-gray-700">
                    {(rating || 0).toFixed(1)}
                </span>
            )}
        </div>
    );
}
