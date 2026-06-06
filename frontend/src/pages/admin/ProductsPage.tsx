import { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProductState } from '../../api/products';
import { getUsers } from '../../api/users';
import { Product, ProductState, User } from '../../types';
import Layout from '../../components/Layout';

const STATE_LABELS: Record<ProductState, string> = {
  EN_VENTA: 'En Venta', VENDIDO: 'Vendido', PAGADO: 'Pagado', DEVUELTO: 'Devuelto', CANCELADO: 'Cancelado',
};
const STATE_COLORS: Record<ProductState, string> = {
  EN_VENTA: 'bg-green-100 text-green-800',
  VENDIDO: 'bg-blue-100 text-blue-800',
  PAGADO: 'bg-purple-100 text-purple-800',
  DEVUELTO: 'bg-orange-100 text-orange-800',
  CANCELADO: 'bg-red-100 text-red-800',
};
const TRANSITIONS: Partial<Record<ProductState, ProductState[]>> = {
  EN_VENTA: ['VENDIDO', 'DEVUELTO', 'CANCELADO'],
  VENDIDO: ['PAGADO'],
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: '', price: '', supplierId: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    getProducts().then(setProducts).catch(() => {});
    getUsers().then(us => setSuppliers(us.filter(u => u.role === 'PROVEEDOR' && u.active))).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createProduct({ ...form, price: parseFloat(form.price) });
      setForm({ name: '', description: '', category: '', price: '', supplierId: '' });
      setShowForm(false);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStateChange = async (id: string, state: ProductState) => {
    try {
      await updateProductState(id, state);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Productos</h2>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
            + Registrar Producto
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h3 className="font-medium text-gray-800">Nuevo Producto</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                <select value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Seleccionar...</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required min={0} step={0.01} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Registrar</button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Proveedor</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Categoría</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Precio</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Cambiar Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Sin productos</td></tr>
              ) : products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.supplier?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{p.category || '—'}</td>
                  <td className="px-4 py-3 text-gray-800">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATE_COLORS[p.state]}`}>
                      {STATE_LABELS[p.state]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value=""
                      onChange={e => handleStateChange(p.id, e.target.value as ProductState)}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                      disabled={!TRANSITIONS[p.state]?.length}
                    >
                      <option value="">— acción —</option>
                      {(TRANSITIONS[p.state] ?? []).map(s => (
                        <option key={s} value={s}>{STATE_LABELS[s]}</option>
                      ))}
                    </select>
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
