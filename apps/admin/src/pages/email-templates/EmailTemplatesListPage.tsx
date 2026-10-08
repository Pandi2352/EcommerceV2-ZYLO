import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Plus,
  Search,
  Copy,
  Trash2,
  Edit3,
  Eye,
  Check,
  Send,
  Sparkles,
  Smartphone,
  Monitor,
  X,
  RefreshCw,
} from 'lucide-react';
import {
  FcMultipleDevices,
  FcApproval,
  FcFile,
  FcConferenceCall,
} from 'react-icons/fc';
import { emailTemplatesService } from '../../services/email-templates.service';
import type {
  EmailTemplate,
  EmailTemplateTypeMeta,
} from '../../services/email-templates.service';
import { ROUTES } from '../../routes/routePaths';
import { toast } from '@shared/ui/Toast';
import { Button } from '@shared/ui/Button';

export const EmailTemplatesListPage: React.FC = () => {
  const navigate = useNavigate();

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [typesMeta, setTypesMeta] = useState<EmailTemplateTypeMeta[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DRAFT'>('ALL');

  // Preview Modal
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Create Template Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newType, setNewType] = useState<string>('USER_INVITATION');
  const [newSubject, setNewSubject] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Test Email Modal
  const [testModalTemplate, setTestModalTemplate] = useState<EmailTemplate | null>(null);
  const [testEmailAddress, setTestEmailAddress] = useState<string>('');
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const [tplList, metaList] = await Promise.all([
        emailTemplatesService.getTemplates(),
        emailTemplatesService.getTemplateTypes(),
      ]);
      setTemplates(tplList);
      setTypesMeta(metaList);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load email templates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      const matchesSearch =
        !searchTerm.trim() ||
        tpl.template_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tpl.subject_template.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tpl.template_type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = selectedType === 'ALL' || tpl.template_type === selectedType;

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && tpl.is_active) ||
        (statusFilter === 'DRAFT' && !tpl.is_active);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [templates, searchTerm, selectedType, statusFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const total = templates.length;
    const activeCount = templates.filter((t) => t.is_active).length;
    const draftCount = total - activeCount;
    const uniqueTypesCovered = new Set(templates.filter((t) => t.is_active).map((t) => t.template_type)).size;
    return {
      total,
      activeCount,
      draftCount,
      uniqueTypesCovered,
      totalTypes: typesMeta.length,
    };
  }, [templates, typesMeta]);

  // Activate Template (single active per type)
  const handleActivate = async (id: string, name: string, type: string) => {
    try {
      await emailTemplatesService.activateTemplate(id);
      toast.success(`"${name}" is now the active template for ${type}`);
      // Refresh local list
      setTemplates((prev) =>
        prev.map((t) => {
          if (t.template_type === type) {
            return { ...t, is_active: t._id === id };
          }
          return t;
        }),
      );
    } catch (err: any) {
      toast.error(err?.message || 'Failed to activate template');
    }
  };

  // Clone Template
  const handleClone = async (id: string) => {
    try {
      const cloned = await emailTemplatesService.cloneTemplate(id);
      toast.success(`Cloned draft copy "${cloned.template_name}" created`);
      setTemplates((prev) => [cloned, ...prev]);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to clone template');
    }
  };

  // Delete Template
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete template "${name}"?`)) return;
    try {
      await emailTemplatesService.deleteTemplate(id);
      toast.success(`Template "${name}" deleted`);
      setTemplates((prev) => prev.filter((t) => t._id !== id));
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete template');
    }
  };

  // Create Template
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Template title is required');
      return;
    }

    try {
      setIsCreating(true);
      const meta = typesMeta.find((m) => m.type === newType);
      const subject = newSubject.trim() || meta?.defaultSubject || `Notification from {{company_name}}`;

      // Base starter HTML
      const starterHtml = `<!DOCTYPE html><html><body style="margin: 0; padding: 0; background: #f8fafc; font-family: Arial, sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 16px;"><tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;"><tr><td style="background: #2A3B5C; padding: 32px; text-align: center;"><h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0;">{{company_name}}</h1><p style="color: #cbd5e1; font-size: 14px; margin: 6px 0 0 0;">${newTitle.trim()}</p></td></tr><tr><td style="padding: 32px;"><h3 style="color: #0f172a; margin: 0 0 16px 0;">Hello {{name}},</h3><p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">This is an updated notification message for your account.</p><div style="text-align: center; margin: 28px 0;"><a href="#" style="background: #2A3B5C; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">View Details</a></div></td></tr><tr><td style="background: #f8fafc; padding: 18px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;"><p style="margin: 0;">&copy; {{current_year}} {{company_name}}</p></td></tr></table></td></tr></table></body></html>`;

      const created = await emailTemplatesService.createTemplate({
        template_name: newTitle.trim(),
        template_type: newType,
        subject_template: subject,
        html_template: starterHtml,
        allowed_variables: meta?.allowedVariables || [],
        is_active: false,
      });

      toast.success(`Template created! Opening Visual Canvas editor...`);
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewSubject('');
      navigate(ROUTES.EMAIL_TEMPLATE_EDITOR.replace(':id', created._id));
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create template');
    } finally {
      setIsCreating(false);
    }
  };

  // Send Test Email
  const handleSendTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailAddress.trim() || !testModalTemplate) return;

    try {
      setIsSendingTest(true);
      await emailTemplatesService.sendTestEmail(testModalTemplate._id, {
        recipient_email: testEmailAddress.trim(),
      });
      toast.success(`Test email dispatched to ${testEmailAddress.trim()}!`);
      setTestModalTemplate(null);
      setTestEmailAddress('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send test email');
    } finally {
      setIsSendingTest(false);
    }
  };

  // Helper: Format type label
  const getTypeMeta = (type: string) => {
    return typesMeta.find((m) => m.type === type) || {
      label: type.replace(/_/g, ' '),
      category: 'AUTH',
      description: '',
    };
  };

  return (
    <div className="w-full space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            <Mail className="w-4 h-4 text-purple-600" />
            <span>Communications &amp; Messaging</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            Email Templates
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700 border border-purple-200">
              Visual Canvas Editor
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Customize and activate branded transactional HTML emails for every customer &amp; staff event.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTemplates}
            disabled={isLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </Button>
        </div>
      </div>

      {/* KPI Count Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-md p-4 flex items-center gap-3.5 shadow-none">
          <div className="w-12 h-12 rounded-md bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
            <FcMultipleDevices className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Total Templates</div>
            <div className="text-2xl font-bold text-slate-900">{metrics.total}</div>
            <div className="text-[11px] text-slate-400">Created across all events</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-4 flex items-center gap-3.5 shadow-none">
          <div className="w-12 h-12 rounded-md bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
            <FcApproval className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Active Live Coverage</div>
            <div className="text-2xl font-bold text-emerald-600">
              {metrics.uniqueTypesCovered} / {metrics.totalTypes || 11}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium">Events ready to dispatch</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-4 flex items-center gap-3.5 shadow-none">
          <div className="w-12 h-12 rounded-md bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
            <FcFile className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Draft Variants</div>
            <div className="text-2xl font-bold text-amber-600">{metrics.draftCount}</div>
            <div className="text-[11px] text-slate-400">Alternative designs</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-4 flex items-center gap-3.5 shadow-none">
          <div className="w-12 h-12 rounded-md bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
            <FcConferenceCall className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Supported Events</div>
            <div className="text-2xl font-bold text-blue-600">{metrics.totalTypes}</div>
            <div className="text-[11px] text-slate-400">Auth, Orders, Staff, Alerts</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-none">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by template name, subject, or event key..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Event Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="ALL">All Event Types ({typesMeta.length})</option>
            {typesMeta.map((t) => (
              <option key={t.type} value={t.type}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <div className="inline-flex rounded-md border border-slate-200 p-0.5 bg-slate-50 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                statusFilter === 'ACTIVE'
                  ? 'bg-white text-emerald-700 font-bold shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Active Only
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('DRAFT')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                statusFilter === 'DRAFT'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Drafts
            </button>
          </div>
        </div>
      </div>

      {/* Templates List Table / Cards */}
      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-md p-12 text-center text-xs text-slate-500 shadow-none">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-600 mb-2" />
          Loading email templates...
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-md p-12 text-center shadow-none">
          <Mail className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 mb-1">No Email Templates Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            No templates matched your current filter criteria. Try clearing search or create a new template.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedType('ALL');
              setStatusFilter('ALL');
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Template Title</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Subject Template</th>
                  <th className="py-3 px-4 text-center">Active Status</th>
                  <th className="py-3 px-4 text-center">Variables</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTemplates.map((tpl) => {
                  const meta = getTypeMeta(tpl.template_type);

                  return (
                    <tr
                      key={tpl._id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Template Title */}
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(ROUTES.EMAIL_TEMPLATE_EDITOR.replace(':id', tpl._id))}
                            className="font-bold text-slate-900 hover:text-purple-600 text-xs transition-colors text-left"
                          >
                            {tpl.template_name}
                          </button>
                          {tpl.is_default && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-normal">
                              System
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {tpl.template_key}
                        </div>
                      </td>

                      {/* Event Type Badge */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {meta.label}
                        </span>
                      </td>

                      {/* Subject Template */}
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={tpl.subject_template}>
                        <span className="font-mono text-[11px] text-slate-800 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60">
                          {tpl.subject_template}
                        </span>
                      </td>

                      {/* Active Toggle Switch */}
                      <td className="py-3.5 px-4 text-center">
                        {tpl.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            ACTIVE
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleActivate(tpl._id, tpl.template_name, tpl.template_type)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 transition-colors"
                            title="Click to set this template as the single active template for this event"
                          >
                            <Check className="w-3 h-3" />
                            Set Active
                          </button>
                        )}
                      </td>

                      {/* Variables count */}
                      <td className="py-3.5 px-4 text-center text-slate-500 text-[11px]">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                          {tpl.allowed_variables?.length || 0} vars
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Visual Canvas Edit */}
                          <button
                            type="button"
                            onClick={() => navigate(ROUTES.EMAIL_TEMPLATE_EDITOR.replace(':id', tpl._id))}
                            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                            title="Edit in Canvas"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Live Preview */}
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewTemplate(tpl);
                              setPreviewDevice('desktop');
                            }}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Live Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Send Test Mail */}
                          <button
                            type="button"
                            onClick={() => {
                              setTestModalTemplate(tpl);
                              setTestEmailAddress('admin@zylo.com');
                            }}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                            title="Send Test Email"
                          >
                            <Send className="w-4 h-4" />
                          </button>

                          {/* Clone */}
                          <button
                            type="button"
                            onClick={() => handleClone(tpl._id)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                            title="Duplicate as Draft"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Delete (if not active default) */}
                          {(!tpl.is_default || !tpl.is_active) && (
                            <button
                              type="button"
                              onClick={() => handleDelete(tpl._id, tpl.template_name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Delete Template"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* 1. PREVIEW MODAL */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-purple-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {previewTemplate.template_name}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Subject: {previewTemplate.subject_template}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Device Switcher */}
                <div className="inline-flex rounded-md border border-slate-200 p-0.5 bg-white text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 font-medium transition-colors ${
                      previewDevice === 'desktop'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 font-medium transition-colors ${
                      previewDevice === 'mobile'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    Mobile (375px)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: HTML Iframe container */}
            <div className="flex-1 overflow-auto bg-slate-100 p-6 flex justify-center items-start">
              <div
                className={`bg-white border border-slate-300 rounded shadow-md transition-all duration-200 ${
                  previewDevice === 'mobile' ? 'w-[375px]' : 'w-full max-w-[650px]'
                }`}
              >
                <iframe
                  title="Template Live Preview"
                  srcDoc={previewTemplate.html_template}
                  className="w-full min-h-[580px] border-0 rounded"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">
                {previewTemplate.allowed_variables?.length || 0} template variables available
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const id = previewTemplate._id;
                    setPreviewTemplate(null);
                    navigate(`/email-templates/editor/${id}`);
                  }}
                  className="flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Open in Canvas Editor
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPreviewTemplate(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* 2. CREATE TEMPLATE MODAL */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">Create Email Template</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Template Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern VIP User Invitation"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Event Category *
                </label>
                <select
                  value={newType}
                  onChange={(e) => {
                    setNewType(e.target.value);
                    const meta = typesMeta.find((m) => m.type === e.target.value);
                    if (meta) setNewSubject(meta.defaultSubject);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-purple-500 focus:outline-none"
                >
                  {typesMeta.map((t) => (
                    <option key={t.type} value={t.type}>
                      {t.label} ({t.category})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  {typesMeta.find((m) => m.type === newType)?.description}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Default Subject Line
                </label>
                <input
                  type="text"
                  placeholder="Subject line with {{variables}}"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono text-[11px] focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isCreating}
                  className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
                >
                  {isCreating ? 'Creating...' : 'Create & Launch Canvas'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* 3. SEND TEST EMAIL MODAL */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {testModalTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Send Live Test Email</h3>
              </div>
              <button
                type="button"
                onClick={() => setTestModalTemplate(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendTestSubmit} className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Send a live test dispatch of <strong>{testModalTemplate.template_name}</strong> to your email address using simulated sample variables.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Recipient Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. your.email@example.com"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-3 text-[11px] text-slate-500">
                <strong>Subject Preview:</strong> {testModalTemplate.subject_template}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTestModalTemplate(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSendingTest}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                >
                  {isSendingTest ? 'Sending Test...' : 'Send Test Dispatch'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplatesListPage;
