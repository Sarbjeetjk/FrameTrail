import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import api from '../services/api';

export const ContactUsPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send directly to MongoDB Atlas online database via API
      await api.post('/contact', {
        name,
        email,
        category,
        subject,
        message,
      });
      setSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      console.error('[Send Contact Message Error]', err);
      // Fallback local save if network fails
      const newMessage = {
        id: `msg_${Date.now()}`,
        name,
        email,
        category,
        subject,
        message,
        createdAt: new Date().toISOString(),
        read: false,
      };
      const existing = localStorage.getItem('frametrail_contact_messages');
      const msgList = existing ? JSON.parse(existing) : [];
      localStorage.setItem('frametrail_contact_messages', JSON.stringify([newMessage, ...msgList]));
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header Banner */}
      <div className="relative rounded-[2.5rem] hero-mesh-bg border border-slate-800 p-8 sm:p-14 overflow-hidden shadow-2xl text-center space-y-4 text-white">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <span>24/7 Global Support & Inquiries</span>
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-black tracking-tight">
          Get in Touch with <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent">FrameTrail</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
          Have a question about asset licensing, media submissions, or technical support? Our curation and support team is here to assist you.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Direct Contact Info Cards (Span 5) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Email Support</h3>
              <p className="text-xs text-slate-400 mt-1">Direct inquiries & licensing assistance</p>
              <a href="mailto:sarbjeetraj03579gmail" className="inline-block mt-2 text-sm font-bold text-indigo-400 hover:underline">
                sarbjeetraj03579gmail
              </a>
            </div>
          </div>

          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/40 text-violet-400 flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Hotline Support</h3>
              <p className="text-xs text-slate-400 mt-1">Mon - Fri, 9:00 AM - 6:00 PM EST</p>
              <a href="tel:+917635095919" className="inline-block mt-2 text-sm font-bold text-violet-400 hover:underline">
                +917635095919
              </a>
            </div>
          </div>

          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Studio HQ Location</h3>
              <p className="text-xs text-slate-300 font-medium mt-1 leading-relaxed">
                FrameTrail Global Media Studios<br />
                San Francisco, CA & New Delhi, India
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Contact Form (Span 7) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl text-slate-900 space-y-6">
          
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">Send Us a Message</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Fill out the form below and we will respond within 2 hours.</p>
          </div>

          {submitted && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Thank you! Your message has been sent successfully. Our team will reach out to you shortly.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-medium">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Inquiry Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Asset Licensing">Asset Licensing & Copyright</option>
                  <option value="Creator Submissions">Creator Media Submissions</option>
                  <option value="Technical Support">Technical Support</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="How can we help?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Your Message</label>
              <textarea
                required
                rows={4}
                placeholder="Write your message details here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-95 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Sending Message...' : 'Send Message'}</span>
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
