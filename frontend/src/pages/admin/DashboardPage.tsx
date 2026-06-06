import { useEffect, useState } from 'react';
import { getSales } from '../../api/sales';
import { getAppointments } from '../../api/appointments';
import { Sale, Appointment } from '../../types';
import Layout from '../../components/Layout';

export default function AdminDashboardPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    getSales().then(data => {
      const today = new Date().toDateString();
      setSales(data.filter(s => new Date(s.createdAt).toDateString() === today));
    }).catch(() => {});
    getAppointments().then(data => {
      setPendingAppointments(data.filter(a => a.state === 'PENDIENTE'));
    }).catch(() => {});
  }, []);

  const todayRevenue = sales.reduce((sum, s) => sum + (s.products?.reduce((ps, p) => ps + p.price, 0) ?? 0), 0);

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Panel de Administración</h2>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Ventas Hoy</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{sales.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Recaudado Hoy</p>
            <p className="text-2xl font-bold text-green-600 mt-1">${todayRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Turnos Pendientes</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{pendingAppointments.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-medium text-gray-800 mb-4">Turnos Pendientes de Confirmación</h3>
          {pendingAppointments.length === 0 ? (
            <p className="text-sm text-gray-500">No hay turnos pendientes</p>
          ) : (
            <div className="space-y-2">
              {pendingAppointments.slice(0, 5).map(a => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{a.supplier?.name}</p>
                    <p className="text-xs text-gray-500">
                      {a.type === 'DROP_OFF' ? 'Entrega' : 'Retiro'} — {new Date(a.scheduledAt).toLocaleString('es-AR')}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-800">
                    PENDIENTE
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
