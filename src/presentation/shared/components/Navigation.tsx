import React from 'react';

import { LogOut, Package, ShoppingCart, Users } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

import { Button } from './ui/button';

interface NavItem {
  readonly name: string;
  readonly href: string;
  readonly icon: React.ComponentType<{ className?: string }>;
}

const navigation: readonly NavItem[] = [
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
];

export const Navigation: React.FC = (): React.JSX.Element => {
  const location: { pathname: string } = useLocation();
  // eslint-disable-next-line @typescript-eslint/typedef -- Type from react-router-dom
  const navigate = useNavigate();
  const { logout, user }: { logout: () => void; user: { email: string } | null } = useAuth();

  const handleLogout: () => void = (): void => {
    logout();
    // Navigate is synchronous in react-router-dom v6
    // eslint-disable-next-line @typescript-eslint/no-floating-promises -- Navigate is sync in v6
    navigate('/login');
  };

  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="shrink-0">
              <h1 className="text-2xl font-bold text-blue-600">Hexagonal TDD</h1>
            </div>
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item: NavItem) => {
                const isActive: boolean = location.pathname === item.href;
                const Icon: React.ComponentType<{ className?: string }> = item.icon;

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user !== null && (
              <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                {user.email}
              </div>
            )}
            <Button onClick={handleLogout} variant="ghost" size="sm" className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
