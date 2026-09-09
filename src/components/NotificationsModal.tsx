import React from 'react';
import { NotificationItem } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearNotifications,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-sm overflow-hidden border border-slate-200 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-black text-white p-6 flex justify-between items-center border-b border-slate-900">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl text-slate-300">notifications</span>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">Notifications</h2>
              <p className="text-xs text-slate-400">System updates & discount receipts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-900 text-slate-400 flex items-center justify-center hover:bg-slate-800 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Action Controls */}
        {notifications.length > 0 && (
          <div className="flex justify-between items-center px-6 py-2.5 bg-slate-50 border-b border-slate-100">
            <button
              onClick={onMarkAllAsRead}
              className="text-xs font-bold text-slate-700 hover:text-black uppercase tracking-wider"
            >
              Mark all as read
            </button>
            <button
              onClick={onClearNotifications}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 uppercase tracking-wider"
            >
              Clear all
            </button>
          </div>
        )}

        {/* List */}
        <div className="p-6 space-y-3 overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">notifications_off</span>
              <p className="font-bold text-sm text-slate-700">No new notifications</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  item.read
                    ? 'bg-white border-slate-100'
                    : 'bg-slate-50 border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-sm text-slate-900">
                    {item.title}
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">
                    {item.time}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {item.message}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full h-11 bg-black text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-900 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
