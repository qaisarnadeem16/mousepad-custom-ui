"use client";

import React from "react";

interface ReuseBtnProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    variant?: "default" | "outline" | "delete";
}

const ReuseBtn: React.FC<ReuseBtnProps> = ({
    children,
    onClick,
    className = "",
    disabled,
    variant = "default",
}) => {
    const baseStyles =
        "flex items-center gap-1 justify-center text-sm py-2 px-4 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants: Record<string, string> = {
        default:
            "bg-[#6633FF] text-white shadow-[0px_4px_12.9px_0px_#6633FF] hover:bg-opacity-80 hover:cursor-pointer",
        outline:
            "border border-[#6633FF] text-[#6633FF] rounded-lg py-1 px-2  bg-transparent hover:bg-[#6633FF] hover:text-white hover:cursor-pointer",
        delete:
            "bg-red-600 text-white hover:bg-red-700 shadow-[0px_4px_12px_0px_rgba(255,0,0,0.5)] hover:cursor-pointer",
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

export default ReuseBtn;
