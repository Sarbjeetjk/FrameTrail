import React from 'react';
import { MessageSquare, Clock, CheckCircle2, Check } from 'lucide-react';

interface ContactMessagesSectionProps {
  contactMessages: any[];
  onMarkAsRead?: (msgId: string) => void;
}

export const ContactMessagesSection: React.FC<ContactMessagesSectionProps> = ({
  contactMessages,
  onMarkAsRead,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-rose-400" />
            <span>Contact Form User Inquiries Inbox</span>
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Review live support and inquiry messages sent by users from the Contact Us page
          </p>
        </div>

        <span className="px-3.5 py-1.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-extrabold rounded-full">
          {contactMessages.length} Messages Received
        </span>
      </div>

      {contactMessages.length === 0 ? (
        <div className="p-12 text-center bg-slate-950 border border-slate-800 rounded-3xl space-y-2 text-slate-400">
          <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
          <h4 className="text-sm font-extrabold text-white">No Contact Messages Yet</h4>
          <p className="text-xs">Messages submitted on the Contact Us page will automatically arrive here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contactMessages.map((msg) => {
            const isUnread = !msg.read && msg.status !== 'read';
            const msgId = msg._id || msg.id;

            return (
              <div
                key={msgId}
                className={`p-5 rounded-2xl bg-slate-950 border transition-all space-y-3 shadow-inner ${
                  isUnread
                    ? 'border-rose-500/30 bg-gradient-to-r from-rose-950/20 via-slate-950 to-slate-950'
                    : 'border-slate-800/80 hover:border-indigo-500/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs uppercase shadow-md">
                      {msg.name ? msg.name[0] : 'U'}
                    </div>
                    <div>
                      <div className="text-xs font-black text-white flex items-center gap-2">
                        <span>{msg.name}</span>
                        {isUnread ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-600 text-white animate-pulse">
                            New Inquiry
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> Read
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-indigo-400 font-mono">{msg.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(msg.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>

                    {isUnread && onMarkAsRead && (
                      <button
                        onClick={() => onMarkAsRead(msgId)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                        title="Mark message as read"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark as Read</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300">
                    Subject: <span className="text-white">{msg.subject || 'General Inquiry'}</span>
                  </div>
                  <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                    {msg.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

