import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavLink {
  label: string;
  to: string;
}

const adminLinks: NavLink[] = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Proveedores', to: '/admin/suppliers' },
  { label: 'Productos', to: '/admin/products' },
  { label: 'Ventas', to: '/admin/sales' },
  { label: 'Turnos', to: '/admin/appointments' },
  { label: 'Saldos', to: '/admin/balance' },
];

const supplierLinks: NavLink[] = [
  { label: 'Dashboard', to: '/supplier' },
  { label: 'Mis Productos', to: '/supplier/products' },
  { label: 'Mi Saldo', to: '/supplier/balance' },
  { label: 'Turnos', to: '/supplier/appointments' },
  { label: 'Devoluciones', to: '/supplier/returns' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  const links = role === 'ADMIN' ? adminLinks : supplierLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-sm font-bold text-gray-800">Ropa con Historia</h1>
          <p className="text-xs text-gray-500 mt-0.5">{role === 'ADMIN' ? 'Administrador' : 'Proveedor'}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors text-left"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
