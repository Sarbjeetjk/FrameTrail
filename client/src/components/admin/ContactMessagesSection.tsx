import React from 'react';
import { MessageSquare, Clock } from 'lucide-react';

interface ContactMessagesSectionProps {
  contactMessages: any[];
}

export const ContactMessagesSection: React.FC<ContactMessagesSectionProps> = ({ contactMessages }) => {
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
          {contactMessages.map((msg) => (
            <div
              key={msg.id}
              className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-indigo-500/40 transition-all space-y-3 shadow-inner"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs uppercase">
                    {msg.name ? msg.name[0] : 'U'}
                  </div>
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-2">
                      <span>{msg.name}</span>
                      {msg.status === 'unread' && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-600 text-white animate-pulse">
                          New Inquiry
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-indigo-400 font-mono">{msg.email}</div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{new Date(msg.createdAt || Date.now()).toLocaleDateString()}</span>
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
          ))}
        </div>
      )}
    </div>
  );
};
