import { useEffect, useState } from 'react';
import { getUsers } from '../../api/users';
import { getBalance, getBalanceHistory, updateTransaction, adjustBalance } from '../../api/balance';
import { User, BalanceSummary, BalanceTransaction } from '../../types';
import Layout from '../../components/Layout';

export default function AdminBalancePage() {
  const [suppliers, setSuppliers] = useState<User[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [summary, setSummary] = useState<BalanceSummary | null>(null);
  const [history, setHistory] = useState<BalanceTransaction[]>([]);
  const [adjustForm, setAdjustForm] = useState({ amount: '', type: 'CREDIT' as 'CREDIT' | 'CASH', note: '' });
  const [showAdjust, setShowAdjust] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getUsers().then(us => setSuppliers(us.filter(u => u.role === 'PROVEEDOR'))).catch(() => {});
  }, []);

  const loadSupplier = (id: string) => {
    setSelectedId(id);
    if (!id) { setSummary(null); setHistory([]); return; }
    getBalance(id).then(setSummary).catch(() => {});
    getBalanceHistory(id).then(setHistory).catch(() => {});
  };

  const handleMarkCobrado = async (txId: string) => {
    try {
      await updateTransaction(txId, 'COBRADO');
      loadSupplier(selectedId);
    } catch { alert('Error'); }
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adjustBalance(selectedId, { amount: parseFloat(adjustForm.amount), type: adjustForm.type, note: adjustForm.note });
      setShowAdjust(false);
      setAdjustForm({ amount: '', type: 'CREDIT', note: '' });
      loadSupplier(selectedId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Saldos por Proveedor</h2>

        <div className="flex items-center gap-4">
          <select
            value={selectedId}
            onChange={e => loadSupplier(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Seleccionar proveedor...</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {selectedId && (
            <button
              onClick={() => setShowAdjust(!showAdjust)}
              className="px-4 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-800"
            >
              Ajuste Manual
            </button>
          )}
        </div>

        {summary && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Crédito Pendiente</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">${summary.pendingCredit.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Efectivo Pendiente</p>
              <p className="text-2xl font-bold text-green-600 mt-1">${summary.pendingCash.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">${summary.total.toFixed(2)}</p>
            </div>
          </div>
        )}

        {showAdjust && (
          <form onSubmit={handleAdjust} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h3 className="font-medium text-gray-800">Ajuste Manual</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                <input type="number" value={adjustForm.amount} onChange={e => setAdjustForm({ ...adjustForm, amount: e.target.value })} required step={0.01} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select value={adjustForm.type} onChange={e => setAdjustForm({ ...adjustForm, type: e.target.value as 'CREDIT' | 'CASH' })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="CREDIT">Crédito</option>
                  <option value="CASH">Efectivo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nota (requerida)</label>
                <input type="text" value={adjustForm.note} onChange={e => setAdjustForm({ ...adjustForm, note: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowAdjust(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50">Aplicar Ajuste</button>
            </div>
          </form>
        )}

        {selectedId && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-800">Historial de Transacciones</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Producto / Nota</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Monto</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Sin transacciones</td></tr>
                ) : history.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{new Date(t.createdAt).toLocaleDateString('es-AR')}</td>
                    <td className="px-4 py-3 text-gray-700">{t.product?.name || t.note || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.type === 'CREDIT' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
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
                    <td className="px-4 py-3 text-right">
                      {t.state === 'PENDIENTE' && (
                        <button onClick={() => handleMarkCobrado(t.id)} className="text-xs text-green-700 hover:underline">
                          Marcar Cobrado
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
