import * as React from "react"

import { Slot } from "@radix-ui/react-slot"


import { cn } from "@/presentation/shared/lib/utils"

import { buttonVariants } from "./button-variants"

import type { VariantProps } from "class-variance-authority"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>> = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, ...props }: ButtonProps,
    ref: React.ForwardedRef<HTMLButtonElement>
  ) => {
    const Comp: React.ElementType = asChild ? Slot : "button"
    const restProps: Omit<ButtonProps, 'className' | 'variant' | 'size' | 'asChild'> = props;
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...restProps}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }

