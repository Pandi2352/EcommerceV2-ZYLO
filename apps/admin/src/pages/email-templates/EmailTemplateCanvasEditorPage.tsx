import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Eye,
  X,
  Send,
  Monitor,
  Smartphone,
  Tablet,
  RotateCcw,
  RotateCw,
  Code2,
  Copy,
  Check,
  Paintbrush,
  Layers,
  Component,
  Sliders,
  Sparkles,
} from 'lucide-react';
import grapesjs, { type Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import { emailTemplatesService } from '../../services/email-templates.service';
import type {
  EmailTemplate,
  EmailTemplateTypeMeta,
} from '../../services/email-templates.service';
import { ROUTES } from '../../routes/routePaths';
import { toast } from '@shared/ui/Toast';
import { Button } from '@shared/ui/Button';

export const EmailTemplateCanvasEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [typesMeta, setTypesMeta] = useState<EmailTemplateTypeMeta[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Core Form State
  const [templateName, setTemplateName] = useState<string>('');
  const [subjectTemplate, setSubjectTemplate] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(false);

  // Editor View Controls
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeRightTab, setActiveRightTab] = useState<'styles' | 'traits' | 'layers' | 'blocks' | 'variables'>('styles');
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [rawCodeContent, setRawCodeContent] = useState<string>('');

  // Test Email Modal
  const [isTestMailOpen, setIsTestMailOpen] = useState<boolean>(false);
  const [testEmailAddress, setTestEmailAddress] = useState<string>('admin@zylo.com');
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);

  // Subject Input Ref
  const subjectInputRef = useRef<HTMLInputElement | null>(null);
  const editorRef = useRef<Editor | null>(null);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);

  // Load Template Data
  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const [tpl, allTypes] = await Promise.all([
          emailTemplatesService.getTemplateById(id),
          emailTemplatesService.getTemplateTypes(),
        ]);
        setTemplate(tpl);
        setTypesMeta(allTypes);
        setTemplateName(tpl.template_name);
        setSubjectTemplate(tpl.subject_template);
        setIsActive(tpl.is_active);
      } catch (err: any) {
        toast.error(err?.message || 'Failed to load email template');
        navigate(ROUTES.EMAIL_TEMPLATES);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  // Initialize GrapesJS Free Canvas Package
  useEffect(() => {
    if (isLoading || !template || editorRef.current) return;

    // Brief timeout to ensure DOM nodes #gjs-canvas, #gjs-blocks, #gjs-styles exist
    const timer = setTimeout(() => {
      try {
        const editor = grapesjs.init({
          container: '#gjs-canvas',
          fromElement: false,
          height: '100%',
          width: 'auto',
          storageManager: false,
          panels: { defaults: [] },
          deviceManager: {
            devices: [
              { id: 'desktop', name: 'Desktop', width: '' },
              { id: 'tablet', name: 'Tablet', width: '768px', widthMedia: '768px' },
              { id: 'mobile', name: 'Mobile', width: '375px', widthMedia: '480px' },
            ],
          },
          blockManager: {
            appendTo: '#gjs-blocks',
            blocks: [
              {
                id: 'sect-card',
                label: '<div class="gjs-block-label"><b>Card Container</b></div>',
                category: 'Structure',
                content: `<table width="100%" cellpadding="0" cellspacing="0" style="padding: 24px 0; background-color: #f4f6f8;"><tr><td align="center"><table width="600" cellpadding="24" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);"><tr><td><h2 style="color: #1e293b; font-family: Arial, sans-serif; margin-top: 0;">Card Header</h2><p style="color: #475569; font-family: Arial, sans-serif; line-height: 1.6;">Add your message details here...</p></td></tr></table></td></tr></table>`,
              },
              {
                id: 'sect-header',
                label: '<div class="gjs-block-label"><b>Brand Header</b></div>',
                category: 'Structure',
                content: `<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #4A90E2; padding: 32px 20px; text-align: center; border-radius: 8px 8px 0 0;"><tr><td align="center"><h1 style="color: #ffffff; font-size: 28px; margin: 0; font-family: Arial, sans-serif;">{{company_name}}</h1><p style="color: #e0f2fe; margin: 8px 0 0 0; font-size: 15px; font-family: Arial, sans-serif;">Official Notification</p></td></tr></table>`,
              },
              {
                id: 'sect-button',
                label: '<div class="gjs-block-label"><b>Action Button</b></div>',
                category: 'Elements',
                content: `<table cellpadding="0" cellspacing="0" border="0" style="margin: 24px auto;"><tr><td style="background-color: #4A90E2; border-radius: 25px;"><a href="{{invitation_link}}" style="color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px; padding: 14px 36px; display: inline-block; font-family: Arial, sans-serif;">Click to Proceed</a></td></tr></table>`,
              },
              {
                id: 'sect-text',
                label: '<div class="gjs-block-label"><b>Paragraph Text</b></div>',
                category: 'Elements',
                content: `<p style="color: #475569; font-size: 15px; line-height: 1.6; font-family: Arial, sans-serif; margin: 12px 0;">Hello {{name}}, this is an automated message regarding your account.</p>`,
              },
              {
                id: 'sect-details-box',
                label: '<div class="gjs-block-label"><b>Details Callout Box</b></div>',
                category: 'Elements',
                content: `<div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 16px; margin: 20px 0;"><h4 style="margin: 0 0 8px 0; color: #334155; font-family: Arial, sans-serif;">Notification Details</h4><p style="margin: 0; color: #64748b; font-size: 14px; font-family: Arial, sans-serif;">Email: <strong>{{email}}</strong></p></div>`,
              },
              {
                id: 'sect-divider',
                label: '<div class="gjs-block-label"><b>Divider</b></div>',
                category: 'Elements',
                content: `<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />`,
              },
              {
                id: 'sect-footer',
                label: '<div class="gjs-block-label"><b>Footer</b></div>',
                category: 'Structure',
                content: `<table width="100%" cellpadding="0" cellspacing="0" style="padding: 24px; text-align: center; background-color: #f8fafc; border-radius: 0 0 8px 8px;"><tr><td><p style="color: #94a3b8; font-size: 12px; margin: 0; font-family: Arial, sans-serif;">&copy; {{current_year}} {{company_name}}. All rights reserved.</p></td></tr></table>`,
              },
            ],
          },
          styleManager: {
            appendTo: '#gjs-styles',
            sectors: [
              {
                name: 'Dimension',
                open: true,
                buildProps: ['width', 'height', 'max-width', 'padding', 'margin'],
              },
              {
                name: 'Typography',
                open: true,
                buildProps: ['font-family', 'font-size', 'font-weight', 'color', 'line-height', 'text-align'],
              },
              {
                name: 'Decorations',
                open: true,
                buildProps: ['background-color', 'border-radius', 'border', 'box-shadow'],
              },
            ],
          },
          layerManager: {
            appendTo: '#gjs-layers',
          },
          traitManager: {
            appendTo: '#gjs-traits',
          },
        });

        // Set initial components
        if (template.html_template) {
          editor.setComponents(template.html_template);
        }

        // Listen for changes
        editor.on('update', () => {
          setHasUnsavedChanges(true);
        });

        editorRef.current = editor;
      } catch (e) {
        console.error('Failed to init GrapesJS editor:', e);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [isLoading, template]);

  // Insert Variable into Subject
  const handleInsertVarToSubject = (varTag: string) => {
    const input = subjectInputRef.current;
    const tag = `{{${varTag}}}`;
    if (!input) {
      setSubjectTemplate((prev) => `${prev} ${tag}`);
      setHasUnsavedChanges(true);
      return;
    }
    const start = input.selectionStart || subjectTemplate.length;
    const end = input.selectionEnd || subjectTemplate.length;
    const newSub = subjectTemplate.slice(0, start) + tag + subjectTemplate.slice(end);
    setSubjectTemplate(newSub);
    setHasUnsavedChanges(true);
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + tag.length, start + tag.length);
    }, 10);
  };

  // Insert Variable into active GrapesJS element
  const handleInsertVarToCanvas = (varName: string) => {
    const tag = `{{${varName}}}`;
    if (editorRef.current) {
      const selected = editorRef.current.getSelected();
      if (selected) {
        const content = selected.get('content') || '';
        selected.set('content', `${content} ${tag}`);
      } else {
        editorRef.current.addComponents(`<span style="font-weight: 600; color: #4A90E2;">${tag}</span>`);
      }
      toast.success(`Inserted ${tag} into canvas`);
      setHasUnsavedChanges(true);
    }
  };

  // Copy Variable tag
  const handleCopyVar = (varName: string) => {
    const tag = `{{${varName}}}`;
    navigator.clipboard.writeText(tag);
    setCopiedVar(varName);
    toast.success(`Copied ${tag} to clipboard`);
    setTimeout(() => setCopiedVar(null), 1500);
  };

  // Device switcher
  const handleSetDevice = (device: 'desktop' | 'tablet' | 'mobile') => {
    setViewportMode(device);
    if (editorRef.current) {
      editorRef.current.setDevice(device);
    }
  };

  // Undo / Redo
  const handleUndo = () => {
    if (editorRef.current) editorRef.current.UndoManager?.undo();
  };
  const handleRedo = () => {
    if (editorRef.current) editorRef.current.UndoManager?.redo();
  };

  // Preview Mode Toggle
  const handleTogglePreview = () => {
    if (editorRef.current) {
      const isPreview = editorRef.current.Commands.isActive('preview');
      if (isPreview) {
        editorRef.current.stopCommand('preview');
      } else {
        editorRef.current.runCommand('preview');
      }
    }
  };

  // Open Raw Code Modal
  const handleOpenCodeModal = () => {
    if (editorRef.current) {
      const html = editorRef.current.getHtml();
      const css = editorRef.current.getCss() || '';
      setRawCodeContent(`<style>\n${css}\n</style>\n\n${html}`);
      setIsCodeModalOpen(true);
    }
  };

  // Apply Raw Code Modal changes
  const handleApplyCode = () => {
    if (editorRef.current) {
      editorRef.current.setComponents(rawCodeContent);
      setIsCodeModalOpen(false);
      setHasUnsavedChanges(true);
      toast.success('Canvas updated from source code');
    }
  };

  // Save / Update Template
  const handleSaveTemplate = useCallback(async () => {
    if (!id || !template) return;
    if (!templateName.trim()) {
      toast.error('Template name cannot be empty');
      return;
    }

    try {
      setIsSaving(true);
      let updatedHtml = template.html_template;
      if (editorRef.current) {
        const html = editorRef.current.getHtml();
        const css = editorRef.current.getCss() || '';
        updatedHtml = `<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>${templateName}</title><style>${css}</style></head><body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">${html}</body></html>`;
      }

      await emailTemplatesService.updateTemplate(id, {
        template_name: templateName.trim(),
        subject_template: subjectTemplate.trim(),
        html_template: updatedHtml,
        is_active: isActive,
      });

      setHasUnsavedChanges(false);
      toast.success('Email template updated successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update email template');
    } finally {
      setIsSaving(false);
    }
  }, [id, template, templateName, subjectTemplate, isActive]);

  // Send Test Email
  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !testEmailAddress.trim()) return;

    try {
      setIsSendingTest(true);
      let currentHtml = template?.html_template;
      if (editorRef.current) {
        const html = editorRef.current.getHtml();
        const css = editorRef.current.getCss() || '';
        currentHtml = `<style>${css}</style>${html}`;
      }

      await emailTemplatesService.sendTestEmail(id, {
        recipient_email: testEmailAddress.trim(),
        custom_html: currentHtml,
        custom_subject: subjectTemplate.trim(),
      });

      toast.success(`Test email dispatched to ${testEmailAddress.trim()}!`);
      setIsTestMailOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to dispatch test email');
    } finally {
      setIsSendingTest(false);
    }
  };

  const currentTypeMeta = typesMeta.find((m) => m.type === template?.template_type);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-500">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold">Loading Free Canvas Email Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white select-none">
      {/* ─── TOP BAR (Matches user's exact screenshot) ─────────────────────────── */}
      <header className="bg-white border-b border-slate-200 px-5 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs z-30">
        {/* Left: Navigation, Title & Subject Editor */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Discard and leave?')) return;
                navigate(ROUTES.EMAIL_TEMPLATES);
              }}
              className="text-slate-500 hover:text-slate-900 transition-colors p-1 -ml-1 rounded hover:bg-slate-100"
              title="Back to Email Templates"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="w-5 h-5 rounded bg-purple-100 text-purple-600 flex items-center justify-center">
              <Mail className="w-3.5 h-3.5" />
            </div>

            <h1 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Edit Email Template
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Free Canvas Studio
              </span>
            </h1>

            {hasUnsavedChanges && (
              <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-medium">
                Unsaved changes
              </span>
            )}
          </div>

          <div className="text-xs text-slate-500 font-medium -mt-0.5 pl-6">
            {templateName || template?.template_name}
          </div>

          {/* Subject Field Input (Exact screenshot style) */}
          <div className="flex items-center gap-2 pl-6 mt-1">
            <label htmlFor="subject-input" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              SUBJECT:
            </label>
            <div className="relative flex-1 max-w-2xl">
              <input
                id="subject-input"
                ref={subjectInputRef}
                type="text"
                value={subjectTemplate}
                onChange={(e) => {
                  setSubjectTemplate(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="Enter email subject line (e.g. Welcome {{name}}!)"
                className="w-full text-xs font-mono bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            {/* Quick Variable Picker for Subject */}
            {currentTypeMeta && currentTypeMeta.allowedVariables.length > 0 && (
              <div className="hidden lg:flex items-center gap-1 overflow-x-auto max-w-xs scrollbar-none py-0.5">
                {currentTypeMeta.allowedVariables.slice(0, 3).map((v) => (
                  <button
                    key={v.name}
                    type="button"
                    onClick={() => handleInsertVarToSubject(v.name)}
                    className="text-[10px] px-1.5 py-0.5 bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-600 rounded font-mono transition-colors border border-slate-200"
                    title={`Click to insert {{${v.name}}} into subject`}
                  >
                    +&#123;&#123;{v.name}&#125;&#125;
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions (Preview, Cancel, Update) */}
        <div className="flex items-center gap-2 self-end md:self-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTogglePreview}
            className="flex items-center gap-1.5 text-xs text-slate-700 border-slate-300 hover:bg-slate-50"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsTestMailOpen(true)}
            className="flex items-center gap-1.5 text-xs text-slate-700 border-slate-300 hover:bg-slate-50"
            title="Dispatch test email"
          >
            <Send className="w-3.5 h-3.5" />
            Send Test
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (hasUnsavedChanges && !window.confirm('Discard changes and return?')) return;
              navigate(ROUTES.EMAIL_TEMPLATES);
            }}
            className="text-xs text-slate-600 hover:text-slate-800"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSaveTemplate}
            disabled={isSaving}
            className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600 text-xs font-semibold px-4 shadow-sm"
          >
            {isSaving ? 'Updating...' : 'Update'}
          </Button>
        </div>
      </header>

      {/* ─── MAIN CANVAS STUDIO AREA ───────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden relative">
        {/* Dark Toolbar (Exact matching screenshot toolbar #2c3038) */}
        <div className="bg-[#24272c] border-b border-[#1b1d22] px-4 py-1.5 flex items-center justify-between text-slate-300 text-xs z-20">
          {/* Left Toolbar Controls: Viewport & Undo/Redo */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleSetDevice('desktop')}
              className={`p-1.5 rounded hover:bg-[#34383f] transition-colors ${
                viewportMode === 'desktop' ? 'bg-[#3b4049] text-white' : 'text-slate-400'
              }`}
              title="Desktop View (600px)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleSetDevice('tablet')}
              className={`p-1.5 rounded hover:bg-[#34383f] transition-colors ${
                viewportMode === 'tablet' ? 'bg-[#3b4049] text-white' : 'text-slate-400'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleSetDevice('mobile')}
              className={`p-1.5 rounded hover:bg-[#34383f] transition-colors ${
                viewportMode === 'mobile' ? 'bg-[#3b4049] text-white' : 'text-slate-400'
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-4 bg-[#3b4049] mx-1" />

            <button
              type="button"
              onClick={handleUndo}
              className="p-1.5 rounded hover:bg-[#34383f] text-slate-400 hover:text-white transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              className="p-1.5 rounded hover:bg-[#34383f] text-slate-400 hover:text-white transition-colors"
              title="Redo (Ctrl+Y)"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-4 bg-[#3b4049] mx-1" />

            <button
              type="button"
              onClick={handleOpenCodeModal}
              className="p-1.5 rounded hover:bg-[#34383f] text-slate-400 hover:text-white transition-colors flex items-center gap-1"
              title="View & Edit Source HTML"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">HTML Code</span>
            </button>
          </div>

          {/* Right Toolbar Tabs: Styles, Settings, Layers, Blocks, Variables */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveRightTab('styles')}
              className={`p-1.5 rounded hover:bg-[#34383f] transition-colors ${
                activeRightTab === 'styles' ? 'bg-[#d94848] text-white' : 'text-slate-400'
              }`}
              title="Style Manager"
            >
              <Paintbrush className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('traits')}
              className={`p-1.5 rounded hover:bg-[#34383f] transition-colors ${
                activeRightTab === 'traits' ? 'bg-[#3b4049] text-white' : 'text-slate-400'
              }`}
              title="Attributes & Settings"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('layers')}
              className={`p-1.5 rounded hover:bg-[#34383f] transition-colors ${
                activeRightTab === 'layers' ? 'bg-[#3b4049] text-white' : 'text-slate-400'
              }`}
              title="Layer Manager"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('blocks')}
              className={`p-1.5 rounded hover:bg-[#34383f] transition-colors ${
                activeRightTab === 'blocks' ? 'bg-[#3b4049] text-white' : 'text-slate-400'
              }`}
              title="Blocks Library"
            >
              <Component className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('variables')}
              className={`px-2 py-1 rounded hover:bg-[#34383f] text-xs font-mono font-semibold transition-colors ${
                activeRightTab === 'variables' ? 'bg-purple-600 text-white' : 'text-purple-300'
              }`}
              title="Template Variables"
            >
              &#123;&#123; x &#125;&#125;
            </button>
          </div>
        </div>

        {/* Center Canvas & Right Sidebar */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* GrapesJS Central Visual Canvas (where iframe renders) */}
          <div
            id="gjs-canvas"
            ref={editorContainerRef}
            className="flex-1 h-full bg-[#f4f4f4] overflow-hidden"
          />

          {/* Right Sidebar Panels (Dark UI matching screenshot) */}
          <aside className="w-72 md:w-80 bg-[#1e2124] text-slate-200 border-l border-[#181a1d] flex flex-col h-full overflow-hidden shrink-0 z-10">
            {/* Header of Active Panel */}
            <div className="px-4 py-2.5 border-b border-[#2a2e33] flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                {activeRightTab === 'styles' && (
                  <>
                    <Paintbrush className="w-3.5 h-3.5 text-red-400" />
                    Style Manager
                  </>
                )}
                {activeRightTab === 'traits' && (
                  <>
                    <Sliders className="w-3.5 h-3.5 text-blue-400" />
                    Attributes
                  </>
                )}
                {activeRightTab === 'layers' && (
                  <>
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    DOM Layers
                  </>
                )}
                {activeRightTab === 'blocks' && (
                  <>
                    <Component className="w-3.5 h-3.5 text-emerald-400" />
                    Blocks Library
                  </>
                )}
                {activeRightTab === 'variables' && (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Allowed Variables
                  </>
                )}
              </span>

              {/* Status toggle inside sidebar */}
              <label className="flex items-center gap-1.5 text-[11px] cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => {
                    setIsActive(e.target.checked);
                    setHasUnsavedChanges(true);
                  }}
                  className="rounded text-purple-600 focus:ring-0 bg-[#2a2e33] border-[#3a3f45]"
                />
                <span>Active</span>
              </label>
            </div>

            {/* Container for Style Manager */}
            <div
              id="gjs-styles"
              className={`flex-1 overflow-y-auto p-2 text-xs scrollbar-thin ${
                activeRightTab === 'styles' ? 'block' : 'hidden'
              }`}
            >
              <div className="p-3 text-[11px] text-slate-400 italic text-center">
                Select an element on canvas to modify styling
              </div>
            </div>

            {/* Container for Traits / Attributes */}
            <div
              id="gjs-traits"
              className={`flex-1 overflow-y-auto p-2 text-xs scrollbar-thin ${
                activeRightTab === 'traits' ? 'block' : 'hidden'
              }`}
            />

            {/* Container for Layer Manager */}
            <div
              id="gjs-layers"
              className={`flex-1 overflow-y-auto p-2 text-xs scrollbar-thin ${
                activeRightTab === 'layers' ? 'block' : 'hidden'
              }`}
            />

            {/* Container for Block Manager */}
            <div
              id="gjs-blocks"
              className={`flex-1 overflow-y-auto p-3 text-xs scrollbar-thin ${
                activeRightTab === 'blocks' ? 'block' : 'hidden'
              }`}
            />

            {/* Variables Drawer */}
            <div
              className={`flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin ${
                activeRightTab === 'variables' ? 'block' : 'hidden'
              }`}
            >
              <div className="bg-[#262a2e] p-2.5 rounded border border-[#343940]">
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  These mustache variables are dynamically injected by the server for event:
                  <strong className="text-purple-400 block mt-0.5">{template?.template_type}</strong>
                </p>
              </div>

              <div className="space-y-2">
                {template?.allowed_variables && template.allowed_variables.length > 0 ? (
                  template.allowed_variables.map((variable) => (
                    <div
                      key={variable.name}
                      className="bg-[#24282c] border border-[#2f353d] rounded p-2.5 hover:border-purple-500/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[11px] font-bold text-purple-300">
                          &#123;&#123;{variable.name}&#125;&#125;
                        </span>
                        {variable.required && (
                          <span className="text-[9px] uppercase px-1 rounded bg-amber-900/60 text-amber-300 font-semibold">
                            Req
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mb-2">{variable.description}</p>
                      {variable.example && (
                        <p className="text-[10px] text-slate-500 italic mb-2">
                          e.g. "{variable.example}"
                        </p>
                      )}

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyVar(variable.name)}
                          className="flex-1 py-1 px-2 rounded bg-[#2f353d] hover:bg-[#3b434d] text-slate-200 text-[10px] flex items-center justify-center gap-1 transition-colors"
                        >
                          {copiedVar === variable.name ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copy Tag
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertVarToCanvas(variable.name)}
                          className="py-1 px-2 rounded bg-purple-900/50 hover:bg-purple-800 text-purple-200 text-[10px] transition-colors"
                          title="Insert into canvas"
                        >
                          + Canvas
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No predefined variables for this type.</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ─── MODAL: RAW HTML SOURCE CODE ───────────────────────────────────────── */}
      {isCodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#1e2124] border border-[#343940] rounded-lg shadow-2xl max-w-4xl w-full flex flex-col max-h-[85vh] overflow-hidden text-slate-200">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#2e333b]">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Email Source HTML / CSS</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCodeModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-hidden flex flex-col">
              <p className="text-xs text-slate-400 mb-2">
                Edit raw HTML template source code. Clicking Apply will update the visual canvas.
              </p>
              <textarea
                value={rawCodeContent}
                onChange={(e) => setRawCodeContent(e.target.value)}
                rows={18}
                className="w-full flex-1 p-3 bg-[#141618] border border-[#2b3038] rounded font-mono text-xs text-emerald-400 focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#2e333b] bg-[#191b1e]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCodeModalOpen(false)}
                className="border-[#3a3f47] text-slate-300 hover:bg-[#2a2e35]"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleApplyCode}
                className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
              >
                Apply to Canvas
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: SEND TEST EMAIL ────────────────────────────────────────────── */}
      {isTestMailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-800">Dispatch Live Test Email</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTestMailOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendTest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  required
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  The active template canvas state will be sent with sample placeholder data.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTestMailOpen(false)}
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
                  {isSendingTest ? 'Sending...' : 'Send Test Now'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplateCanvasEditorPage;
