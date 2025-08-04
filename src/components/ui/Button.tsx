'use client';

import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Define button variants using class-variance-authority
const buttonVariants = cva(
  // Base styles applied to all buttons
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        // Primary button - used for main actions, submit buttons
        primary: "bg-[#4a6fa1] text-[#ffffff] hover:bg-[#3a5a85] dark:bg-[#81a1c1] dark:text-[#ffffff] dark:hover:bg-[#5e81ac] focus-visible:ring-[#4a6fa1]/30",
        
        // Secondary button - used for secondary actions, cancel buttons
        secondary: "bg-[#5fb0c9] text-[#ffffff] hover:bg-[#45a29e] dark:bg-[#a3be8c] dark:text-[#2e3440] dark:hover:bg-[#8fbcbb] focus-visible:ring-[#5fb0c9]/30 border border-[#5fb0c9]/20",
        
        // Outline button - bordered version, good for cancel/back actions
        outline: "border-2 border-[#4a6fa1] bg-transparent text-[#4a6fa1] hover:bg-[#4a6fa1]/10 hover:text-[#3a5a85] dark:border-[#81a1c1] dark:bg-transparent dark:text-[#81a1c1] dark:hover:bg-[#81a1c1]/20 dark:hover:text-[#eceff4] focus-visible:ring-[#4a6fa1]/30",
        
        // Ghost button - minimal styling, blends with background
        ghost: "text-[#2a2a36] hover:bg-[#e0e4ed] hover:text-[#2a2a36] dark:text-[#eceff4] dark:hover:bg-[#4c566a] dark:hover:text-[#eceff4] focus-visible:ring-[#e6b64c]/30 border border-transparent",
        
        // Link button - appears as a link but behaves as a button
        link: "text-[#4a6fa1] underline-offset-4 hover:underline dark:text-[#81a1c1] focus-visible:ring-[#4a6fa1]/30",
        
        // Destructive button - for delete/remove actions
        destructive: "bg-[#e86671] text-[#ffffff] hover:bg-[#e86671]/90 dark:bg-[#bf616a] dark:text-[#ffffff] dark:hover:bg-[#bf616a]/90 focus-visible:ring-[#e86671]/30",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
      fullWidth: {
        true: "w-full",
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  // No additional props needed
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
