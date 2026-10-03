import React, { useState } from 'react';
import { Upload, CheckCircle2, X } from 'lucide-react';
import Button from '@shared/ui/Button';
import Alert from '@shared/ui/Alert';
import { categoriesService } from '@shared/api/categories.service';

interface CategoryImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CategoryImportModal: React.FC<CategoryImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedItems, setParsedItems] = useState<any[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    createdCount: number;
    updatedCount: number;
    errorsCount: number;
    errors: any[];
  } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setParseError(null);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        if (selected.name.endsWith('.json')) {
          const json = JSON.parse(content);
          if (Array.isArray(json)) {
            setParsedItems(json);
          } else {
            setParseError('JSON file must contain an array of category objects.');
          }
        } else if (selected.name.endsWith('.csv')) {
          // Basic CSV Parser
          const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
          if (lines.length < 2) {
            setParseError('CSV file must have a header row and at least 1 data row.');
            return;
          }
          const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim());
          const items: any[] = [];

          for (let i = 1; i < lines.length; i++) {
            // Regex handles quoted commas
            const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
            const values: string[] = [];
            let match;
            while ((match = regex.exec(lines[i])) !== null && values.length < headers.length) {
              let val = match[1] || '';
              if (val.startsWith('"') && val.endsWith('"')) {
                val = val.slice(1, -1).replace(/""/g, '"');
              }
              values.push(val.trim());
            }

            const rowObj: any = {};
            headers.forEach((h, idx) => {
              rowObj[h] = values[idx] || '';
            });

            if (rowObj.Name || rowObj.name) {
              items.push({
                name: rowObj.Name || rowObj.name,
                slug: rowObj.Slug || rowObj.slug,
                description: rowObj.Description || rowObj.description,
                parentSlug: rowObj.ParentSlug || rowObj.parentSlug,
                level: Number(rowObj.Level || rowObj.level) || 1,
                displayOrder: Number(rowObj.DisplayOrder || rowObj.displayOrder) || 0,
                status: (rowObj.Status || rowObj.status || 'ACTIVE').toUpperCase(),
                includeInMenu: rowObj.IncludeInMenu === 'true' || rowObj.includeInMenu === true,
                isFeatured: rowObj.IsFeatured === 'true' || rowObj.isFeatured === true,
                badgeText: rowObj.BadgeText || rowObj.badgeText,
                badgeColor: rowObj.BadgeColor || rowObj.badgeColor || 'indigo',
                badgeExpiresAt: rowObj.BadgeExpiresAt || rowObj.badgeExpiresAt,
                isSmartCollection: rowObj.IsSmartCollection === 'true' || rowObj.isSmartCollection === true,
                rulesCondition: (rowObj.RulesCondition || rowObj.rulesCondition || 'ALL').toUpperCase(),
                filterableAttributes: rowObj.FilterableAttributes || rowObj.filterableAttributes,
                metaTitle: rowObj.MetaTitle || rowObj.metaTitle,
                metaDescription: rowObj.MetaDescription || rowObj.metaDescription,
                iconUrl: rowObj.IconUrl || rowObj.iconUrl,
                thumbnailUrl: rowObj.ThumbnailUrl || rowObj.thumbnailUrl,
                bannerDesktopUrl: rowObj.BannerDesktopUrl || rowObj.bannerDesktopUrl,
              });
            }
          }
          setParsedItems(items);
        } else {
          setParseError('Unsupported file format. Please upload a .csv or .json file.');
        }
      } catch (err: any) {
        setParseError(`Parse error: ${err.message}`);
      }
    };
    reader.readAsText(selected);
  };

  const handleExecuteImport = async () => {
    if (parsedItems.length === 0) return;
    try {
      setIsImporting(true);
      const res = await categoriesService.importData(parsedItems);
      setImportResult(res);
      if (res.createdCount > 0 || res.updatedCount > 0) {
        onSuccess();
      }
    } catch (err: any) {
      setParseError(err.message || 'Import failed.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-md shadow-none flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-600" />
              Bulk Import Categories Taxonomy
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload a CSV or JSON file to batch create or update catalog classifications.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {parseError && (
            <Alert tone="error" title="Import Error">
              {parseError}
            </Alert>
          )}

          {importResult && (
            <div className="p-4 rounded-md border border-emerald-200 bg-emerald-50/60 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Import Process Complete
              </div>
              <p className="text-xs text-emerald-700">
                Processed <b>{importResult.createdCount + importResult.updatedCount}</b> categories: {importResult.createdCount} created, {importResult.updatedCount} updated.
                {importResult.errorsCount > 0 && ` (${importResult.errorsCount} skipped with validation issues)`}
              </p>
            </div>
          )}

          {/* Upload Drop Area */}
          {!importResult && (
            <div>
              <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-indigo-50/20">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-xs font-semibold text-slate-700">
                  {file ? file.name : 'Click to select CSV or JSON file to upload'}
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Supported formats: .csv, .json (Up to 5MB)
                </span>
                <input
                  type="file"
                  accept=".csv,.json,application/json,text/csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedItems.length > 0 && !importResult && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Preview Ready ({parsedItems.length} categories detected)</span>
                <span className="text-indigo-600 font-semibold">Ready to validate</span>
              </div>
              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-md divide-y divide-slate-100 text-xs">
                {parsedItems.slice(0, 15).map((row, idx) => (
                  <div key={idx} className="p-2 flex items-center justify-between bg-white hover:bg-slate-50">
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-slate-800 truncate">{row.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">
                        Slug: /{row.slug || 'auto'} {row.parentSlug && `· Parent: /${row.parentSlug}`}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                        L{row.level || 1}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700">
                        {row.status || 'ACTIVE'}
                      </span>
                    </div>
                  </div>
                ))}
                {parsedItems.length > 15 && (
                  <div className="p-2 text-center text-slate-400 bg-slate-50 text-[11px]">
                    ...and {parsedItems.length - 15} more categories
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between shrink-0">
          <Button size="sm" variant="outline" onClick={onClose}>
            {importResult ? 'Close' : 'Cancel'}
          </Button>

          {parsedItems.length > 0 && !importResult && (
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Upload className="w-3.5 h-3.5" />}
              isLoading={isImporting}
              onClick={handleExecuteImport}
            >
              Confirm &amp; Import ({parsedItems.length})
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryImportModal;
