import React, { useState } from 'react';
import { X, Mail, CheckCircle, Clock, Calendar as CalendarIcon, Send, Sparkles } from 'lucide-react';
import { Appointment, EmailReminder } from '../types';
import { sendSimulatedEmailReminder } from '../utils/storage';

interface EmailReminderModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onReminderSent?: () => void;
}

export const EmailReminderModal: React.FC<EmailReminderModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onReminderSent
}) => {
  const [selectedType, setSelectedType] = useState<EmailReminder['type']>('prep_guide_48h');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);

  if (!isOpen || !appointment) return null;

  const handleSendTestEmail = () => {
    setIsSending(true);
    setTimeout(() => {
      sendSimulatedEmailReminder(appointment.id, selectedType);
      setIsSending(false);
      setSendSuccessMessage(`Automated email successfully dispatched to ${appointment.client.email}!`);
      if (onReminderSent) onReminderSent();
      setTimeout(() => setSendSuccessMessage(null), 4000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#111317] border border-zinc-800 rounded-2xl shadow-2xl text-zinc-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-amber-400">
              <Mail className="w-3.5 h-3.5" />
              <span>Automated Email Reminders & Notifications</span>
            </div>
            <h2 className="text-lg font-display font-bold text-white">
              Appointment Communications [{appointment.bookingCode}]
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Dispatcher bar */}
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
              Select Automated Email Template to Preview & Test
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { type: 'prep_guide_48h', label: '48h Prep Guide' },
                { type: 'sketch_ready', label: 'Drawing Draft Ready' },
                { type: 'booking_confirmation', label: 'Deposit Confirmation' },
                { type: 'reminder_24h', label: '24h Studio Reminder' },
                { type: 'aftercare_review', label: 'Aftercare & Review' }
              ].map(item => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setSelectedType(item.type as any)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition-all ${
                    selectedType === item.type
                      ? 'border-amber-400 bg-amber-400/10 text-white font-semibold'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {sendSuccessMessage && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{sendSuccessMessage}</span>
              </div>
            )}
          </div>

          {/* Realistic email inbox preview container */}
          <div className="rounded-xl border border-zinc-700 bg-zinc-950 overflow-hidden shadow-inner font-sans">
            {/* Fake client bar */}
            <div className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400 flex items-center justify-between font-mono">
              <div className="truncate">
                <span className="text-zinc-500">To:</span> {appointment.client.name} &lt;{appointment.client.email}&gt;
              </div>
              <span className="text-emerald-400 text-[11px]">Inbox Delivery</span>
            </div>

            {/* Email Content Frame */}
            <div className="p-6 space-y-5 text-sm text-zinc-200 leading-relaxed">
              <div className="border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
                  <span>ATELIER NOIR TATTOO STUDIO</span>
                  <span>·</span>
                  <span>442 MERCER ST, SUITE 3B</span>
                </div>
                <h3 className="text-base font-display font-bold text-white">
                  {selectedType === 'prep_guide_48h' && `48-Hour Tattoo Prep Guide: Getting Ready for ${appointment.artistName}`}
                  {selectedType === 'sketch_ready' && `Your Digital Stencil Draft is Ready for Inspection [${appointment.bookingCode}]`}
                  {selectedType === 'booking_confirmation' && `Booking & Deposit Receipt Confirmed [${appointment.bookingCode}]`}
                  {selectedType === 'reminder_24h' && `Session Tomorrow at Atelier Noir [${appointment.bookingCode}]`}
                  {selectedType === 'aftercare_review' && `How is your new piece healing? Leave a review for ${appointment.artistName}`}
                </h3>
              </div>

              {/* Email body text according to type */}
              {selectedType === 'prep_guide_48h' && (
                <div className="space-y-4 text-xs text-zinc-300">
                  <p>
                    Hello {appointment.client.name},
                  </p>
                  <p>
                    Your custom session for your <strong>{appointment.tattooDetails.placement}</strong> tattoo with <strong>{appointment.artistName}</strong> is scheduled for <strong>{appointment.date} at {appointment.timeSlot}</strong>.
                  </p>
                  
                  <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2">
                    <p className="font-bold text-white uppercase text-[11px] font-mono text-amber-400">
                      Essential 48-Hour Preparation Checklist:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-zinc-300">
                      <li><strong>Hydration:</strong> Drink at least 2.5–3 liters of water daily to hydrate skin dermis cells.</li>
                      <li><strong>No Alcohol:</strong> Avoid all alcohol and aspirin 24 hours prior (thins blood and impacts ink saturation).</li>
                      <li><strong>Nutritious Meal:</strong> Eat a meal high in protein and carbohydrates 1–2 hours before arriving to stabilize blood sugar.</li>
                      <li><strong>Apparel:</strong> Wear dark, loose clothing with comfortable access to your {appointment.tattooDetails.placement}.</li>
                      <li><strong>Identification:</strong> Bring a valid state ID or driver's license for consent verification.</li>
                    </ul>
                  </div>

                  <p>
                    Your digital stencil proof has been generated. You can inspect line weights or suggest adjustments in your client portal.
                  </p>
                </div>
              )}

              {selectedType === 'sketch_ready' && (
                <div className="space-y-3 text-xs text-zinc-300">
                  <p>Hello {appointment.client.name},</p>
                  <p>
                    {appointment.artistName} has uploaded the initial draft stencil for your <strong>{appointment.tattooDetails.style}</strong> design!
                  </p>
                  <p>
                    Please log into your client dashboard to view the high-resolution artwork, test placement contour notes, and approve the stencil for session day.
                  </p>
                </div>
              )}

              {selectedType === 'booking_confirmation' && (
                <div className="space-y-3 text-xs text-zinc-300">
                  <p>Hello {appointment.client.name},</p>
                  <p>
                    We have successfully received your <strong>${appointment.payment.totalPaid}.00</strong> upfront deposit (Receipt #{appointment.payment.receiptNumber}).
                  </p>
                  <p>
                    Your concept and reference photos are queued in {appointment.artistName}'s drawing schedule.
                  </p>
                </div>
              )}

              {selectedType === 'reminder_24h' && (
                <div className="space-y-3 text-xs text-zinc-300">
                  <p>Hello {appointment.client.name},</p>
                  <p>
                    Friendly reminder that your tattoo appointment is tomorrow, <strong>{appointment.date}</strong> at <strong>{appointment.timeSlot.split('-')[0]}</strong>.
                  </p>
                  <p>
                    Studio Location: Atelier Noir Tattoo Studio, 442 Mercer Street, Suite 3B. Buzzer #04.
                  </p>
                </div>
              )}

              {selectedType === 'aftercare_review' && (
                <div className="space-y-3 text-xs text-zinc-300">
                  <p>Hello {appointment.client.name},</p>
                  <p>
                    We hope your new tattoo from {appointment.artistName} is healing smoothly!
                  </p>
                  <p>
                    Keep your protective film on for 3–5 days as instructed. Once peeled, wash gently with fragrance-free antibacterial soap. We invite you to leave a review and share a healed photo in your client portal!
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-zinc-800 text-[11px] text-zinc-500 font-mono">
                Atelier Noir Automated Notification Engine · 442 Mercer St · Replies directed to studio@ateliernoir.art
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between shrink-0">
          <span className="text-xs text-zinc-400 font-mono">
            Sending to {appointment.client.email}
          </span>

          <button
            type="button"
            onClick={handleSendTestEmail}
            disabled={isSending}
            className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSending ? 'Sending to Inbox...' : 'Send Test Email Now'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
