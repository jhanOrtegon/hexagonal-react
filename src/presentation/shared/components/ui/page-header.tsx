import React from 'react';

interface PageHeaderProps {
  readonly title: string;
  readonly description?: string;
  readonly action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
}: PageHeaderProps): React.JSX.Element => (
    <div className="border-b border-gray-200 bg-white px-6 py-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {description !== undefined && (
            <p className="mt-2 text-sm text-gray-600">{description}</p>
          )}
        </div>
        {action !== undefined && <div className="ml-6">{action}</div>}
      </div>
    </div>
  );
