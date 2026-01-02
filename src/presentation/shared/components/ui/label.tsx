import * as React from 'react';

import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

// eslint-disable-next-line @typescript-eslint/typedef
const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);

const Label: React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants> &
    React.RefAttributes<React.ComponentRef<typeof LabelPrimitive.Root>>
> = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(
  (
    {
      className,
      ...props
    }: React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
      VariantProps<typeof labelVariants>,
    ref: React.ForwardedRef<React.ComponentRef<typeof LabelPrimitive.Root>>
  ): React.JSX.Element => (
    <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
  )
);
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
