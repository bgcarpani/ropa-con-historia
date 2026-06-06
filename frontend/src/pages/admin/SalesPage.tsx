import { useEffect, useState } from 'react';
import { getSales, createSale } from '../../api/sales';
import { getProducts } from '../../api/products';
import { Sale, Product } from '../../types';
import Layout from '../../components/Layout';

export default function AdminSalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    getSales().then(setSales).catch(() => {});
    getProducts().then(ps => setProducts(ps.filter(p => p.state === 'EN_VENTA'))).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const handleToggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.length === 0) return;
    setSubmitting(true);
    try {
      await createSale(selected);
      setSelected([]);
      setShowForm(false);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al registrar venta');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTotal = selected.reduce((sum, id) => {
    const p = products.find(x => x.id === id);
    return sum + (p?.price ?? 0);
  }, 0);

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Ventas</h2>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
            + Registrar Venta
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h3 className="font-medium text-gray-800">Nueva Venta</h3>
            <p className="text-sm text-gray-500">Seleccioná los productos vendidos:</p>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
              {products.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-500">No hay productos en venta</p>
              ) : products.map(p => (
                <label key={p.id} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" checked={selected.includes(p.id)} onChange={() => handleToggle(p.id)} className="rounded" />
                  <span className="text-sm text-gray-800">{p.name}</span>
                  <span className="text-sm text-gray-500">{p.supplier?.name}</span>
                  <span className="ml-auto text-sm font-medium text-gray-800">${p.price.toFixed(2)}</span>
                </label>
              ))}
            </div>
            {selected.length > 0 && (
              <div className="bg-blue-50 rounded-lg px-4 py-3">
                <p className="text-sm font-medium text-blue-800">
                  {selected.length} producto(s) — Total: ${selectedTotal.toFixed(2)}
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <button type="button" onClick={() => { setShowForm(false); setSelected([]); }} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button type="submit" disabled={submitting || selected.length === 0} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                Confirmar Venta
              </button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Productos</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Total</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Registrado por</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sales.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Sin ventas</td></tr>
              ) : sales.map(s => {
                const total = s.products?.reduce((sum, p) => sum + p.price, 0) ?? 0;
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{new Date(s.createdAt).toLocaleString('es-AR')}</td>
                    <td className="px-4 py-3 text-gray-600">{s.products?.length ?? 0} producto(s)</td>
                    <td className="px-4 py-3 font-medium text-gray-800">${total.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600">{s.admin?.name}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
