import client from './client';
import { Appointment, AppointmentState, AppointmentType } from '../types';

export const getAppointments = () => client.get<Appointment[]>('/appointments').then(r => r.data);
export const createAppointment = (data: { type: AppointmentType; scheduledAt: string; notes?: string; supplierId?: string }) =>
  client.post<Appointment>('/appointments', data).then(r => r.data);
export const updateAppointmentState = (id: string, state: AppointmentState) =>
  client.patch<Appointment>(`/appointments/${id}/state`, { state }).then(r => r.data);
