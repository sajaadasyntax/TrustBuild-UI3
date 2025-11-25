import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

/**
 * Responsive container component that provides consistent padding and max-width
 * for mobile-first design
 */
export function ResponsiveContainer({ 
  children, 
  className,
  maxWidth = 'xl'
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  };

  return (
    <div className={cn(
      'container mx-auto px-4 sm:px-6 lg:px-8',
      maxWidthClasses[maxWidth],
      className
    )}>
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
}

/**
 * Responsive grid component with configurable columns for different breakpoints
 */
export function ResponsiveGrid({
  children,
  className,
  cols = { default: 1, md: 2, lg: 3 },
  gap = 4
}: ResponsiveGridProps) {
  const gridCols = `grid-cols-${cols.default || 1}`;
  const smCols = cols.sm ? `sm:grid-cols-${cols.sm}` : '';
  const mdCols = cols.md ? `md:grid-cols-${cols.md}` : '';
  const lgCols = cols.lg ? `lg:grid-cols-${cols.lg}` : '';
  const xlCols = cols.xl ? `xl:grid-cols-${cols.xl}` : '';
  const gapClass = `gap-${gap}`;

  return (
    <div className={cn(
      'grid',
      gridCols,
      smCols,
      mdCols,
      lgCols,
      xlCols,
      gapClass,
      className
    )}>
      {children}
    </div>
  );
}

interface ResponsiveStackProps {
  children: ReactNode;
  className?: string;
  direction?: 'row' | 'column';
  breakpoint?: 'sm' | 'md' | 'lg';
  gap?: number;
}

/**
 * Responsive stack component that switches between column and row layout
 * based on screen size
 */
export function ResponsiveStack({
  children,
  className,
  direction = 'row',
  breakpoint = 'md',
  gap = 4
}: ResponsiveStackProps) {
  const baseDirection = direction === 'row' ? 'flex-row' : 'flex-col';
  const responsiveDirection = direction === 'row' 
    ? 'flex-col' 
    : 'flex-row';
  
  const breakpointClass = `${breakpoint}:${baseDirection}`;
  const gapClass = `gap-${gap}`;

  return (
    <div className={cn(
      'flex',
      responsiveDirection,
      breakpointClass,
      gapClass,
      className
    )}>
      {children}
    </div>
  );
}

