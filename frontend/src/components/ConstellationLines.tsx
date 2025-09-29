import React from 'react';

export const ConstellationLines = () => {
    return (
        <svg
            className="absolute inset-0 w-full h-full z-30"
            viewBox="0 0 900 900"
            preserveAspectRatio="xMidYMid meet"
            style={{
                filter: 'drop-shadow(0 0 2px rgba(59, 130, 246, 0.5))'
            }}
        >
            {/* Top line with enhanced visibility */}
            <line
                x1="450"
                y1="330"
                x2="450"
                y2="100"
                stroke="#3B82F6"
                strokeWidth={3}
                strokeLinecap="round"
                style={{
                    filter: 'drop-shadow(0 0 1px rgba(59, 130, 246, 0.8))'
                }}
            />

            {/* Regular lines */}
            <line x1="450" y1="570" x2="450" y2="780" stroke="#3B82F6" strokeWidth={2} strokeLinecap="round" />
            <line x1="330" y1="450" x2="100" y2="450" stroke="#3B82F6" strokeWidth={2} strokeLinecap="round" />
            <line x1="570" y1="450" x2="780" y2="450" stroke="#3B82F6" strokeWidth={2} strokeLinecap="round" />
            <line x1="520" y1="520" x2="680" y2="680" stroke="#3B82F6" strokeWidth={2} strokeLinecap="round" />
            <line x1="380" y1="520" x2="220" y2="680" stroke="#3B82F6" strokeWidth={2} strokeLinecap="round" />
        </svg>
    );
};