import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getBalance, getBalanceHistory } from '../../api/balance';
import { BalanceSummary, BalanceTransaction } from '../../types';
import Layout from '../../components/Layout';

export default function SupplierBalancePage() {
  const { userId } = useAuth();
  const [summary, setSummary] = useState<BalanceSummary | null>(null);
  const [history, setHistory] = useState<BalanceTransaction[]>([]);

  useEffect(() => {
    if (!userId) return;
    getBalance(userId).then(setSummary).catch(() => {});
    getBalanceHistory(userId).then(setHistory).catch(() => {});
  }, [userId]);

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Mi Saldo</h2>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Crédito Disponible</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">${summary?.pendingCredit.toFixed(2) ?? '—'}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Efectivo Disponible</p>
            <p className="text-2xl font-bold text-green-600 mt-1">${summary?.pendingCash.toFixed(2) ?? '—'}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">${summary?.total.toFixed(2) ?? '—'}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-800">Historial de Transacciones</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Producto</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Monto</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Sin transacciones</td></tr>
              ) : history.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{new Date(t.createdAt).toLocaleDateString('es-AR')}</td>
                  <td className="px-4 py-3 text-gray-700">{t.product?.name || t.note || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      t.type === 'CREDIT' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {t.type === 'CREDIT' ? 'Crédito' : 'Efectivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">${t.amount.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      t.state === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                      t.state === 'COBRADO' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {t.state}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
