import { useEffect, useState } from 'react';
import { getReturns, updateReturnState } from '../../api/returns';
import { ReturnRequest, ReturnState } from '../../types';
import Layout from '../../components/Layout';

const STATE_COLORS: Record<ReturnState, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  APROBADA: 'bg-green-100 text-green-800',
  RECHAZADA: 'bg-red-100 text-red-800',
};

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [noteModal, setNoteModal] = useState<{ id: string; state: ReturnState } | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => getReturns().then(setReturns).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleAction = async () => {
    if (!noteModal) return;
    setSubmitting(true);
    try {
      await updateReturnState(noteModal.id, noteModal.state, adminNote);
      setNoteModal(null);
      setAdminNote('');
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Solicitudes de Devolución</h2>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Proveedor</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Producto</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Motivo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {returns.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Sin solicitudes</td></tr>
              ) : returns.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{r.supplier?.name}</td>
                  <td className="px-4 py-3 text-gray-600">{r.product?.name}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{r.reason}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATE_COLORS[r.state]}`}>
                      {r.state}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(r.createdAt).toLocaleDateString('es-AR')}</td>
                  <td className="px-4 py-3 text-right">
                    {r.state === 'PENDIENTE' && (
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => { setNoteModal({ id: r.id, state: 'APROBADA' }); setAdminNote(''); }} className="text-xs text-green-700 hover:underline">Aprobar</button>
                        <button onClick={() => { setNoteModal({ id: r.id, state: 'RECHAZADA' }); setAdminNote(''); }} className="text-xs text-red-600 hover:underline">Rechazar</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {noteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-semibold text-gray-800 mb-4">
              {noteModal.state === 'APROBADA' ? 'Aprobar' : 'Rechazar'} Devolución
            </h3>
            <textarea
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              placeholder="Nota (opcional)..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-20 resize-none"
            />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setNoteModal(null)} className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancelar
              </button>
              <button
                onClick={handleAction}
                disabled={submitting}
                className={`flex-1 px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50 ${
                  noteModal.state === 'APROBADA' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
