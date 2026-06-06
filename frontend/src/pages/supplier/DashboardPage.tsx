import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getBalance } from '../../api/balance';
import { getAppointments } from '../../api/appointments';
import { BalanceSummary, Appointment } from '../../types';
import Layout from '../../components/Layout';

export default function SupplierDashboardPage() {
  const { userId } = useAuth();
  const [balance, setBalance] = useState<BalanceSummary | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (!userId) return;
    getBalance(userId).then(setBalance).catch(() => {});
    getAppointments().then(data => {
      const upcoming = data.filter(a => a.state !== 'CANCELADO' && a.state !== 'COMPLETADO');
      setAppointments(upcoming.slice(0, 3));
    }).catch(() => {});
  }, [userId]);

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Mi Panel</h2>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Saldo en Crédito</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">${balance?.pendingCredit.toFixed(2) ?? '—'}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Saldo en Efectivo</p>
            <p className="text-2xl font-bold text-green-600 mt-1">${balance?.pendingCash.toFixed(2) ?? '—'}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Total Pendiente</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">${balance?.total.toFixed(2) ?? '—'}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-800">Próximos Turnos</h3>
            <Link to="/supplier/appointments" className="text-sm text-blue-600 hover:underline">Ver todos</Link>
          </div>
          {appointments.length === 0 ? (
            <p className="text-sm text-gray-500">No tenés turnos próximos</p>
          ) : (
            <div className="space-y-2">
              {appointments.map(a => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {a.type === 'DROP_OFF' ? 'Entrega' : 'Retiro'}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(a.scheduledAt).toLocaleString('es-AR')}</p>
                  </div>
                  <StateBadge state={a.state} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function StateBadge({ state }: { state: string }) {
  const colors: Record<string, string> = {
    PENDIENTE: 'bg-yellow-100 text-yellow-800',
    CONFIRMADO: 'bg-blue-100 text-blue-800',
    COMPLETADO: 'bg-green-100 text-green-800',
    CANCELADO: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[state] ?? 'bg-gray-100 text-gray-600'}`}>
      {state}
    </span>
  );
}
