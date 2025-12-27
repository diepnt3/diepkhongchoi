'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();

  const navItems = [
    { href: '/projects', label: 'Quản lý dự án', icon: '📊' },
    { href: '/dashboard', label: 'Dashboard', icon: '📈' },
  ];

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Logo/Title */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Quản lý Dự án</h1>
        <p className="text-sm text-gray-500 mt-1">Hệ thống phân tích</p>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer with User Info and Logout */}
      <div className="p-4 border-t border-gray-200">
        {session?.user && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Đăng nhập với</p>
            <p className="text-sm font-medium text-gray-700 truncate">
              {session.user.email}
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors duration-200"
        >
          <span>🚪</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </nav>
  );
}

