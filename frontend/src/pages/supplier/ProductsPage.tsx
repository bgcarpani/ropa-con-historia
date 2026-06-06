import { useEffect, useState } from 'react';
import { getProducts } from '../../api/products';
import { createReturn } from '../../api/returns';
import { Product, ProductState } from '../../types';
import Layout from '../../components/Layout';

const STATE_LABELS: Record<ProductState, string> = {
  EN_VENTA: 'En Venta',
  VENDIDO: 'Vendido',
  PAGADO: 'Pagado',
  DEVUELTO: 'Devuelto',
  CANCELADO: 'Cancelado',
};

const STATE_COLORS: Record<ProductState, string> = {
  EN_VENTA: 'bg-green-100 text-green-800',
  VENDIDO: 'bg-blue-100 text-blue-800',
  PAGADO: 'bg-purple-100 text-purple-800',
  DEVUELTO: 'bg-orange-100 text-orange-800',
  CANCELADO: 'bg-red-100 text-red-800',
};

export default function SupplierProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<ProductState | 'ALL'>('ALL');
  const [returnModal, setReturnModal] = useState<Product | null>(null);
  const [returnReason, setReturnReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getProducts().then(setProducts).catch(() => {});
  }, []);

  const filtered = filter === 'ALL' ? products : products.filter(p => p.state === filter);

  const handleReturn = async () => {
    if (!returnModal) return;
    setSubmitting(true);
    try {
      await createReturn({ productId: returnModal.id, reason: returnReason });
      setReturnModal(null);
      setReturnReason('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al solicitar devolución');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Mis Productos</h2>

        <div className="flex gap-2 flex-wrap">
          {(['ALL', 'EN_VENTA', 'VENDIDO', 'PAGADO', 'DEVUELTO', 'CANCELADO'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'ALL' ? 'Todos' : STATE_LABELS[s]}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Categoría</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Precio</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Sin productos</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500">{p.category || '—'}</td>
                  <td className="px-4 py-3 text-gray-800">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATE_COLORS[p.state]}`}>
                      {STATE_LABELS[p.state]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.state === 'EN_VENTA' && (
                      <button
                        onClick={() => setReturnModal(p)}
                        className="text-xs text-orange-600 hover:underline"
                      >
                        Pedir devolución
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {returnModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-semibold text-gray-800 mb-4">Solicitar Devolución</h3>
            <p className="text-sm text-gray-600 mb-3">Producto: <strong>{returnModal.name}</strong></p>
            <textarea
              value={returnReason}
              onChange={e => setReturnReason(e.target.value)}
              placeholder="Motivo de la devolución..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => { setReturnModal(null); setReturnReason(''); }}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleReturn}
                disabled={!returnReason || submitting}
                className="flex-1 px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
              >
                Solicitar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
