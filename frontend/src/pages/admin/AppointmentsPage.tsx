import { useEffect, useState } from 'react';
import { getAppointments, createAppointment, updateAppointmentState } from '../../api/appointments';
import { getUsers } from '../../api/users';
import { Appointment, AppointmentState, AppointmentType, User } from '../../types';
import Layout from '../../components/Layout';

const STATE_COLORS: Record<AppointmentState, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  CONFIRMADO: 'bg-blue-100 text-blue-800',
  COMPLETADO: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-red-100 text-red-800',
};

const TRANSITIONS: Partial<Record<AppointmentState, AppointmentState[]>> = {
  PENDIENTE: ['CONFIRMADO', 'CANCELADO'],
  CONFIRMADO: ['COMPLETADO', 'CANCELADO'],
};

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [suppliers, setSuppliers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ supplierId: '', type: 'DROP_OFF' as AppointmentType, scheduledAt: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    getAppointments().then(setAppointments).catch(() => {});
    getUsers().then(us => setSuppliers(us.filter(u => u.role === 'PROVEEDOR' && u.active))).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createAppointment(form);
      setShowForm(false);
      setForm({ supplierId: '', type: 'DROP_OFF', scheduledAt: '', notes: '' });
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStateChange = async (id: string, state: AppointmentState) => {
    try {
      await updateAppointmentState(id, state);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Turnos</h2>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
            + Crear Turno
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h3 className="font-medium text-gray-800">Nuevo Turno</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                <select value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Seleccionar...</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as AppointmentType })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="DROP_OFF">Entrega</option>
                  <option value="COLLECTION">Retiro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y hora</label>
                <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm({ ...form, scheduledAt: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Crear</button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Proveedor</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Notas</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {appointments.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Sin turnos</td></tr>
              ) : appointments.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{a.supplier?.name}</td>
                  <td className="px-4 py-3 text-gray-600">{a.type === 'DROP_OFF' ? 'Entrega' : 'Retiro'}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(a.scheduledAt).toLocaleString('es-AR')}</td>
                  <td className="px-4 py-3 text-gray-500">{a.notes || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATE_COLORS[a.state]}`}>
                      {a.state}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value=""
                      onChange={e => handleStateChange(a.id, e.target.value as AppointmentState)}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                      disabled={!TRANSITIONS[a.state]?.length}
                    >
                      <option value="">— acción —</option>
                      {(TRANSITIONS[a.state] ?? []).map(s => (
                        <option key={s} value={s}>{s}</option>
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
