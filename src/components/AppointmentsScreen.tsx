import React, { useState } from 'react';
import { Appointment } from '../types';
import { Language, translations } from '../utils/translations';
import { playReminderChime, speakText } from '../utils/audioAndTTS';
import { sanitizeInput } from '../utils/securityAndEncoding';

interface AppointmentsScreenProps {
  appointments: Appointment[];
  onAddAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  onEditAppointment?: (appointment: Appointment) => void;
  onDeleteAppointment?: (id: string) => void;
  onToggleReminder: (id: string) => void;
  onShowToast: (message: string) => void;
  language?: Language;
}

export const AppointmentsScreen: React.FC<AppointmentsScreenProps> = ({
  appointments,
  onAddAppointment,
  onEditAppointment,
  onDeleteAppointment,
  onToggleReminder,
  onShowToast,
  language = 'en',
}) => {
  const t = translations[language] || translations.en;
  
  // Today's date string YYYY-MM-DD for blocking past dates
  const todayStr = new Date().toISOString().split('T')[0];

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // Form State
  const [hospitalName, setHospitalName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('General Consultation');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('09:00 AM');
  const [reminderTimeBefore, setReminderTimeBefore] = useState('1 hour before');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sort appointments in chronological order
  const sortedAppointments = [...appointments].sort((a, b) => {
    return new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime();
  });

  const resetForm = () => {
    setHospitalName('');
    setDoctorName('');
    setSpecialty('General Consultation');
    setAppointmentDate('');
    setAppointmentTime('09:00 AM');
    setReminderTimeBefore('1 hour before');
    setLocation('');
    setNotes('');
    setValidationError(null);
  };

  const openAddModal = () => {
    resetForm();
    setEditingAppointment(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (app: Appointment) => {
    setEditingAppointment(app);
    setHospitalName(app.hospitalName);
    setDoctorName(app.doctorName);
    setSpecialty(app.specialty);
    setAppointmentDate(app.appointmentDate);
    setAppointmentTime(app.appointmentTime);
    setReminderTimeBefore(app.reminderTimeBefore || '1 hour before');
    setLocation(app.location || '');
    setNotes(app.notes || '');
    setValidationError(null);
    setIsAddModalOpen(true);
  };

  // Trigger test reminder audio and voice notification
  const handleTriggerTestReminder = (app?: Appointment) => {
    const target = app || sortedAppointments[0];
    playReminderChime();

    if (target) {
      const msg = language === 'tl'
        ? `Paalala: Mayroon kang appointment kay ${target.doctorName} sa ${target.hospitalName} sa ${target.appointmentDate} nang ${target.appointmentTime}.`
        : `Reminder: You have an appointment with ${target.doctorName} at ${target.hospitalName} scheduled on ${target.appointmentDate} at ${target.appointmentTime}.`;
      
      speakText(msg, language);
      onShowToast(language === 'tl' ? `🔔 Paalala: ${target.hospitalName} (${target.appointmentTime})` : `🔔 Test Reminder: ${target.hospitalName} (${target.appointmentTime})`);
    } else {
      const msg = language === 'tl' ? 'Paalala sa medikal na kalendaryo. Walang nakatakdang appointment.' : 'Medical alert reminder system test: All systems operational.';
      speakText(msg, language);
      onShowToast('🔔 Audio Reminder Alert Triggered!');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanHospital = sanitizeInput(hospitalName);
    const cleanDoctor = sanitizeInput(doctorName);
    const cleanSpecialty = sanitizeInput(specialty) || 'General Consultation';
    const cleanLocation = sanitizeInput(location);
    const cleanNotes = sanitizeInput(notes);

    if (!cleanHospital || !cleanDoctor || !appointmentDate) {
      setValidationError('Please complete all required fields (Clinic/Hospital, Doctor, Date).');
      return;
    }

    // 1. Enforce Validation: Block Past Dates
    if (appointmentDate < todayStr) {
      setValidationError(`Cannot schedule appointment in the past. Please select a date on or after today (${todayStr}).`);
      return;
    }

    // 2. Enforce Validation: Block Duplicate Slots
    const isDuplicate = appointments.some((a) => {
      // If editing, skip comparing with self
      if (editingAppointment && a.id === editingAppointment.id) return false;

      const sameDate = a.appointmentDate === appointmentDate;
      const sameTime = a.appointmentTime.trim().toLowerCase() === appointmentTime.trim().toLowerCase();
      const sameDoctorOrClinic =
        a.doctorName.trim().toLowerCase() === cleanDoctor.toLowerCase() ||
        a.hospitalName.trim().toLowerCase() === cleanHospital.toLowerCase();

      return sameDate && (sameTime || sameDoctorOrClinic);
    });

    if (isDuplicate) {
      setValidationError(`Duplicate slot conflict: An appointment already exists on ${appointmentDate} at ${appointmentTime} with this doctor or hospital.`);
      return;
    }

    if (editingAppointment && onEditAppointment) {
      onEditAppointment({
        ...editingAppointment,
        hospitalName: cleanHospital,
        doctorName: cleanDoctor,
        specialty: cleanSpecialty,
        appointmentDate,
        appointmentTime,
        reminderTimeBefore,
        location: cleanLocation || undefined,
        notes: cleanNotes || undefined,
      });
      onShowToast(`Updated appointment at ${cleanHospital} with ${cleanDoctor}`);
    } else {
      onAddAppointment({
        hospitalName: cleanHospital,
        doctorName: cleanDoctor,
        specialty: cleanSpecialty,
        appointmentDate,
        appointmentTime,
        reminderStatus: 'Active',
        reminderTimeBefore,
        location: cleanLocation || undefined,
        notes: cleanNotes || undefined,
      });
      onShowToast(`Appointment scheduled at ${cleanHospital} with ${cleanDoctor}`);
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  const handleDelete = (id: string, name: string) => {
    if (onDeleteAppointment) {
      onDeleteAppointment(id);
      onShowToast(`Appointment with ${name} deleted.`);
    }
  };

  return (
    <div className="px-4 sm:px-5 py-4 pb-20 max-w-lg mx-auto flex flex-col gap-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-950 text-white p-4 sm:p-5 rounded-[1.5rem] shadow-md border border-indigo-700/60 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 border border-blue-400/30">
              <span className="material-symbols-outlined text-[20px]">calendar_clock</span>
            </div>
            <div className="truncate">
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight truncate">{t.apptHeader}</h2>
              <p className="text-[10px] sm:text-[11px] text-blue-200 truncate">{t.apptSub}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              onClick={() => handleTriggerTestReminder()}
              title="Test audio reminder alert"
              className="px-2.5 py-1.5 bg-indigo-700 hover:bg-indigo-600 active:scale-95 text-white rounded-xl font-bold text-xs uppercase tracking-wide flex items-center gap-1 shadow-xs transition-all border border-indigo-400/30"
            >
              <span className="material-symbols-outlined text-[16px]">notifications_active</span>
              <span className="hidden sm:inline">Test Alert</span>
            </button>

            <button
              onClick={openAddModal}
              className="px-2.5 py-1.5 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white rounded-xl font-bold text-xs uppercase tracking-wide flex items-center gap-1 shadow-xs transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>{t.newApptBtn}</span>
            </button>
          </div>
        </div>

        <div className="mt-2.5 pt-2.5 border-t border-indigo-800/80 flex items-center justify-between text-xs">
          <span className="text-blue-200 font-medium">{t.upcomingSchedule}:</span>
          <span className="font-extrabold text-blue-300">{sortedAppointments.length} Booked</span>
        </div>
      </div>

      {/* Appointment Cards List */}
      <div className="space-y-2.5">
        {sortedAppointments.length === 0 ? (
          <div className="p-6 text-center bg-white rounded-2xl border border-slate-200/80 text-slate-500">
            <span className="material-symbols-outlined text-3xl text-slate-300 mb-1">event_available</span>
            <p className="text-xs sm:text-sm font-bold">{t.noApptsFound}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{t.noApptsDesc}</p>
            <button
              onClick={openAddModal}
              className="mt-3 px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold uppercase inline-flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Book Appointment</span>
            </button>
          </div>
        ) : (
          sortedAppointments.map((app) => (
            <div
              key={app.id}
              className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-blue-300 transition-colors flex flex-col gap-2"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center shrink-0 border border-blue-100">
                    <span className="material-symbols-outlined text-[18px]">local_hospital</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug truncate">{app.hospitalName}</h3>
                    <p className="text-[11px] font-bold text-blue-900 flex items-center gap-1 mt-0.5 truncate">
                      <span className="material-symbols-outlined text-[13px]">stethoscope</span>
                      <span className="truncate">{app.specialty} — {app.doctorName}</span>
                    </p>
                  </div>
                </div>

                {/* Reminder Toggle Badge */}
                <button
                  onClick={() => onToggleReminder(app.id)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 border transition-all shrink-0 ${
                    app.reminderStatus === 'Active'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[13px]"
                    style={{ fontVariationSettings: app.reminderStatus === 'Active' ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    notifications_active
                  </span>
                  <span>{app.reminderStatus === 'Active' ? t.reminderActive : t.reminderMuted}</span>
                </button>
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-blue-800 text-[15px]">calendar_today</span>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">{t.dateLabel}</span>
                    <span className="font-extrabold text-slate-900 text-[11px]">{app.appointmentDate}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-blue-800 text-[15px]">schedule</span>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">{t.timeLabel}</span>
                    <span className="font-extrabold text-slate-900 text-[11px]">{app.appointmentTime}</span>
                  </div>
                </div>
              </div>

              {app.location && (
                <p className="text-[10px] text-slate-600 flex items-center gap-1">
                  <span className="material-symbols-outlined text-slate-400 text-[13px]">location_on</span>
                  <span className="truncate">{app.location}</span>
                </p>
              )}

              {app.notes && (
                <div className="p-2 bg-amber-50/80 border border-amber-200/80 rounded-xl text-[10px] sm:text-[11px] text-amber-950 font-medium flex items-start gap-1">
                  <span className="material-symbols-outlined text-amber-700 text-[14px] shrink-0 mt-0.5">info</span>
                  <span>{app.notes}</span>
                </div>
              )}

              {/* Card Action Controls: Test Reminder, Edit, Delete */}
              <div className="pt-1.5 mt-0.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleTriggerTestReminder(app)}
                  className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 hover:underline active:scale-95"
                >
                  <span className="material-symbols-outlined text-[14px]">notifications_active</span>
                  <span>Test Reminder</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(app)}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-900 text-[10px] font-extrabold uppercase flex items-center gap-1 transition-all"
                  >
                    <span className="material-symbols-outlined text-[13px]">edit</span>
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(app.id, app.doctorName)}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 text-[10px] font-extrabold uppercase flex items-center gap-1 transition-all"
                  >
                    <span className="material-symbols-outlined text-[13px]">delete</span>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Adding or Editing Appointment */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-800 text-[20px]">
                  {editingAppointment ? 'edit_calendar' : 'event_note'}
                </span>
                <h3 className="text-sm font-extrabold text-slate-900">
                  {editingAppointment ? 'Edit Medical Appointment' : t.addApptTitle}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            {validationError && (
              <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs flex items-start gap-1.5">
                <span className="material-symbols-outlined text-red-600 text-[16px] shrink-0 mt-0.5">error</span>
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-0.5">{t.hospitalClinicName}</label>
                <input
                  type="text"
                  required
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder="e.g. Philippine General Hospital"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-700"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-0.5">{t.doctorName}</label>
                <input
                  type="text"
                  required
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g. Dr. Maria Santos, MD"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-700"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-0.5">{t.specialtyService}</label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="e.g. Cardiology, Eye Check-up, Dental"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">
                    {t.appointmentDate} (Min: Today)
                  </label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-700"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">{t.appointmentTime}</label>
                  <input
                    type="text"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    placeholder="09:00 AM"
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-0.5">{t.reminderTiming}</label>
                <select
                  value={reminderTimeBefore}
                  onChange={(e) => setReminderTimeBefore(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-700"
                >
                  <option value="15 mins before">15 mins before</option>
                  <option value="30 mins before">30 mins before</option>
                  <option value="1 hour before">1 hour before</option>
                  <option value="2 hours before">2 hours before</option>
                  <option value="1 day before">1 day before</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-0.5">{t.locationLabel} (Optional)</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Room 204, OPD Building"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-700"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-0.5">{t.notesLabel} (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Bring laboratory results and senior ID."
                  rows={2}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-700"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl font-bold text-xs uppercase shadow-xs"
                >
                  {editingAppointment ? 'Save Changes' : t.saveSchedule}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
