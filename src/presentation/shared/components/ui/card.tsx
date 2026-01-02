import * as React from 'react';

import { cn } from '../../lib/utils';

const Card: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
> = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (
    { className, ...props }: React.HTMLAttributes<HTMLDivElement>,
    ref: React.ForwardedRef<HTMLDivElement>
  ): React.JSX.Element => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border border-gray-200 bg-white text-gray-950 shadow-sm',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
> = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (
    { className, ...props }: React.HTMLAttributes<HTMLDivElement>,
    ref: React.ForwardedRef<HTMLDivElement>
  ): React.JSX.Element => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLHeadingElement> & React.RefAttributes<HTMLParagraphElement>
> = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  (
    { className, ...props }: React.HTMLAttributes<HTMLHeadingElement>,
    ref: React.ForwardedRef<HTMLParagraphElement>
  ): React.JSX.Element => (
    <h3
      ref={ref}
      className={cn('text-2xl leading-none font-semibold tracking-tight', className)}
      {...props}
    >
      {props.children}
    </h3>
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>
> = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  (
    { className, ...props }: React.HTMLAttributes<HTMLParagraphElement>,
    ref: React.ForwardedRef<HTMLParagraphElement>
  ): React.JSX.Element => (
    <p ref={ref} className={cn('text-sm text-gray-500', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
> = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (
    { className, ...props }: React.HTMLAttributes<HTMLDivElement>,
    ref: React.ForwardedRef<HTMLDivElement>
  ): React.JSX.Element => <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
);
CardContent.displayName = 'CardContent';

const CardFooter: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
> = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (
    { className, ...props }: React.HTMLAttributes<HTMLDivElement>,
    ref: React.ForwardedRef<HTMLDivElement>
  ): React.JSX.Element => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
