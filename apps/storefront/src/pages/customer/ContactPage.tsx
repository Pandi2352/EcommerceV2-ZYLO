import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  ChevronRight,
  CheckCircle2,
  Share2,
  HelpCircle,
  Truck,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { ROUTES } from '../../routes/routePaths';
import { useSettings } from '../../features/settings/context/SettingsContext';
import { settingsService } from '@shared/api/settings.service';
import { toast } from '@shared/ui/Toast';

export const ContactPage: React.FC = () => {
  const { settings } = useSettings();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const res = await settingsService.submitContactMessage({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        subject: subject.trim(),
        message: message.trim(),
      });

      toast.success(res.message || 'Thank you! Your message has been sent successfully.');
      setIsSubmitted(true);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to send message. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-6 sm:py-8">
      <div className="max-w-[1240px] mx-auto px-4 space-y-8">
        {/* 1. Breadcrumb Bar */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link to={ROUTES.CUSTOMER.HOME} className="hover:text-amber-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="font-semibold text-slate-800">Contact Us</span>
        </nav>

        {/* 2. Hero Header Banner */}
        <div className="bg-[#081831] text-white rounded-lg p-6 sm:p-10 relative overflow-hidden shadow-sm">
          <div className="max-w-2xl relative z-10 space-y-2">
            <span className="text-amber-400 text-xs font-black uppercase tracking-widest">
              We Are Here To Help
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Get in Touch with {settings.storeName || 'ZYLO'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Have questions about an order, product compatibility, bulk business pricing, or
              shipping? Our dedicated support specialists are ready to assist you.
            </p>
          </div>
          {/* Subtle geometric background pattern */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
            <MessageSquare className="w-64 h-64 text-white" />
          </div>
        </div>

        {/* 3. Contact Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Phone Support */}
          <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Call Us Directly
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Toll-free customer hotline</p>
            </div>
            <div className="space-y-1">
              {settings.phone && (
                <a
                  href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                  className="text-sm font-extrabold text-slate-900 hover:text-amber-600 block transition-colors"
                >
                  {settings.phone}
                </a>
              )}
              {settings.whatsapp && (
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-emerald-600 font-semibold hover:underline block"
                >
                  WhatsApp: {settings.whatsapp}
                </a>
              )}
            </div>
          </div>

          {/* Card 2: Email Inquiries */}
          <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Email Helpdesk
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">24/7 Ticket resolution</p>
            </div>
            <div className="space-y-1">
              <a
                href={`mailto:${settings.supportEmail}`}
                className="text-sm font-bold text-slate-900 hover:text-amber-600 block transition-colors truncate"
              >
                {settings.supportEmail || 'support@zylo.com'}
              </a>
              {settings.salesEmail && (
                <a
                  href={`mailto:${settings.salesEmail}`}
                  className="text-xs text-slate-500 hover:text-amber-600 block truncate"
                >
                  Sales: {settings.salesEmail}
                </a>
              )}
            </div>
          </div>

          {/* Card 3: Store Address */}
          <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Physical Location
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Corporate Headquarters</p>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {settings.address || '5171 W Campbell Ave, San Jose, CA 95124'}
            </p>
          </div>

          {/* Card 4: Operating Hours */}
          <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Business Hours
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Operating schedule</p>
            </div>
            <p className="text-xs font-medium text-slate-700 leading-relaxed">
              {settings.operatingHours || 'Mon - Fri: 9:00 AM - 8:00 PM EST'}
            </p>
          </div>
        </div>

        {/* 4. Main Two-Column Contact Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-md border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900">Send Us a Direct Message</h2>
              <p className="text-xs text-slate-500 mt-1">
                Fill in the details below and an account specialist will reply to your inquiry within
                24 hours.
              </p>
            </div>

            {isSubmitted && (
              <div className="p-4 rounded-md bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 space-y-1">
                  <span className="font-bold block">Message sent successfully!</span>
                  <span>
                    Thank you for reaching out. We have received your inquiry and our support team
                    will get back to you shortly.
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="text-emerald-700 font-bold underline block mt-2 hover:text-emerald-900 cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
              </div>
            )}

            {!isSubmitted && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full text-xs px-3.5 py-2.5 rounded border border-slate-300 focus:outline-none focus:border-amber-500 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. sarah@example.com"
                      className="w-full text-xs px-3.5 py-2.5 rounded border border-slate-300 focus:outline-none focus:border-amber-500 text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 555-0199"
                      className="w-full text-xs px-3.5 py-2.5 rounded border border-slate-300 focus:outline-none focus:border-amber-500 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Subject <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Order Delivery Status inquiry"
                      className="w-full text-xs px-3.5 py-2.5 rounded border border-slate-300 focus:outline-none focus:border-amber-500 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details about your question, order number, or request..."
                    className="w-full text-xs px-3.5 py-2.5 rounded border border-slate-300 focus:outline-none focus:border-amber-500 text-slate-800"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Sending Message...' : 'Submit Message'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Column: FAQs & Social Links (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Self-Service Links */}
            <div className="bg-white p-6 rounded-md border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                <span>Instant Self-Service</span>
              </h3>

              <div className="space-y-3 text-xs">
                <Link
                  to={ROUTES.CUSTOMER.ORDERS}
                  className="flex items-center justify-between p-3 rounded-md bg-slate-50 hover:bg-amber-50 border border-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Truck className="w-4 h-4 text-slate-500 group-hover:text-amber-600" />
                    <span className="font-bold text-slate-800">Track an Existing Order</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
                </Link>

                <div className="p-3 rounded-md bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                    <span>30-Day Free Returns</span>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Hassle-free return policy on all eligible purchases in unopened original
                    packaging.
                  </p>
                </div>

                <div className="p-3 rounded-md bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Verified Merchant Guarantee</span>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    All products are guaranteed 100% authentic with factory manufacturer warranties.
                  </p>
                </div>
              </div>
            </div>

            {/* Social Network Connections */}
            <div className="bg-white p-6 rounded-md border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Share2 className="w-4 h-4 text-amber-500" />
                <span>Connect on Social Media</span>
              </h3>
              <p className="text-xs text-slate-500">
                Follow our official channels for product releases, flash deals, and promotions.
              </p>

              <div className="flex items-center gap-2 pt-2 flex-wrap">
                {settings.facebook && (
                  <a
                    href={settings.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold transition-colors"
                  >
                    Facebook
                  </a>
                )}
                {settings.twitter && (
                  <a
                    href={settings.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 text-xs font-bold transition-colors"
                  >
                    Twitter / X
                  </a>
                )}
                {settings.instagram && (
                  <a
                    href={settings.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded bg-slate-100 hover:bg-pink-50 text-slate-700 hover:text-pink-700 text-xs font-bold transition-colors"
                  >
                    Instagram
                  </a>
                )}
                {settings.linkedin && (
                  <a
                    href={settings.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-800 text-xs font-bold transition-colors"
                  >
                    LinkedIn
                  </a>
                )}
                {settings.youtube && (
                  <a
                    href={settings.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-bold transition-colors"
                  >
                    YouTube
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
