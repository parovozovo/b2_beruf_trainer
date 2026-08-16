import React, { useState, useMemo } from 'react';
import type {
  Modelltest,
  TileType,
  ModelltestVariants,
  PromoCode,
  ForumsbeitragTopic,
} from '../../types';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Code,
  X,
  RefreshCw,
} from 'lucide-react';

export type SprechenTopicsState = {
  sprecher1AQuestions: Array<{ id: string; title: string; promptText: string }>;
  sprecher2Topics: Array<{ id: string; title: string; promptText: string }>;
  sprecher3Situations: Array<{ id: string; title: string; promptText: string }>;
};

export const ALL_TILE_TYPES: { type: TileType; label: string }[] = [
  { type: 'lesen_1', label: 'Lesen 1 (1–5)' },
  { type: 'lesen_2', label: 'Lesen 2 (6–9)' },
  { type: 'lesen_3', label: 'Lesen 3 (10–13)' },
  { type: 'lesen_4', label: 'Lesen 4 (14–18)' },
  { type: 'lesen_schreiben', label: 'Lesen & Schreiben (19–21)' },
  { type: 'hoeren_1', label: 'Hören 1 (22–27)' },
  { type: 'hoeren_2', label: 'Hören 2 (28–31)' },
  { type: 'hoeren_3', label: 'Hören 3 (32–35)' },
  { type: 'hoeren_4', label: 'Hören 4 (36–40)' },
  { type: 'hoeren_schreiben', label: 'Hören & Schreiben (41–45)' },
  { type: 'sprachbausteine_1', label: 'Sprachbausteine 1 (46–51)' },
  { type: 'sprachbausteine_2', label: 'Sprachbausteine 2 (52–57)' },
];

const createEmptyVariants = (): ModelltestVariants => ({
  lesen_1: [],
  lesen_2: [],
  lesen_3: [],
  lesen_4: [],
  lesen_schreiben: [],
  hoeren_1: [],
  hoeren_2: [],
  hoeren_3: [],
  hoeren_4: [],
  hoeren_schreiben: [],
  sprachbausteine_1: [],
  sprachbausteine_2: [],
});

interface DetectedPayload {
  type: 'full_backup' | 'multiple_modelltests' | 'single_modelltest' | 'partial_variants' | 'single_tile' | 'promo_codes' | 'forumsbeitrag' | 'sprechen';
  summary: string;
  details: string[];
  targetTestId?: string;
  tileType?: TileType;
  parsedData: any;
}

interface AdminImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelltests: Modelltest[];
  onSaveModelltests: (updated: Modelltest[]) => Promise<void>;
  onSavePromoCodes?: (updated: PromoCode[]) => Promise<void>;
  onSaveForumsbeitragTopics?: (updated: ForumsbeitragTopic[]) => Promise<void>;
  onSaveSprechenTopics?: (updated: SprechenTopicsState) => Promise<void>;
  initialTargetModelltestId?: string;
  initialTargetTileType?: TileType;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const AdminImportModal: React.FC<AdminImportModalProps> = ({
  isOpen,
  onClose,
  modelltests,
  onSaveModelltests,
  onSavePromoCodes,
  onSaveForumsbeitragTopics,
  onSaveSprechenTopics,
  initialTargetModelltestId,
  initialTargetTileType,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'paste'>('paste');
  const [jsonText, setJsonText] = useState('');
  const [selectedTargetTestId, setSelectedTargetTestId] = useState<string>(initialTargetModelltestId || 'auto');
  const [selectedTileTypeOverride, setSelectedTileTypeOverride] = useState<TileType | 'auto'>(initialTargetTileType || 'auto');
  const [mergeMode, setMergeMode] = useState<'merge' | 'replace'>('merge');
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState('');

  // Reset or initialize state when opened
  React.useEffect(() => {
    if (isOpen) {
      if (initialTargetModelltestId) setSelectedTargetTestId(initialTargetModelltestId);
      if (initialTargetTileType) setSelectedTileTypeOverride(initialTargetTileType);
    }
  }, [isOpen, initialTargetModelltestId, initialTargetTileType]);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setJsonText(content);
      setActiveTab('paste'); // switch to inspect/preview
    };
    reader.readAsText(file);
  };

  // Helper: Detect which tile type a variant object belongs to
  const detectTileTypeFromVariant = (variant: any): TileType | null => {
    if (!variant || typeof variant !== 'object') return null;
    if (variant.q6Correct || variant.q6Text || variant.q7 || variant.q8Correct || variant.q9) return 'lesen_2';
    if (variant.headingsBlock && variant.textBlock) return 'lesen_1';
    if (variant.optionsAtoF && variant.text1 && variant.text2) return 'lesen_3';
    if (variant.protocolText) return 'lesen_4';
    if (variant.emailsText) return 'lesen_schreiben';
    if (variant.questions && Array.isArray(variant.questions)) {
      if (variant.questions.some((q: any) => q.type === 'richtig_falsch' || (q.id >= 22 && q.id <= 27))) return 'hoeren_1';
      if (variant.questions.some((q: any) => q.id >= 32 && q.id <= 35)) return 'hoeren_3';
      if (variant.questions.some((q: any) => q.id >= 36 && q.id <= 40)) return 'hoeren_4';
      if (variant.questions.some((q: any) => q.id >= 52 && q.id <= 57)) return 'sprachbausteine_2';
    }
    if (variant.optionsAtoF && (variant.audioUrl || variant.scriptText)) return 'hoeren_2';
    if (variant.fields || variant.q41Text || variant.q41Options || variant.q41Correct) return 'hoeren_schreiben';
    if (variant.textWithGaps && (variant.extraDistractors || variant.correctAnswers)) return 'sprachbausteine_1';
    if (variant.textWithGaps && variant.questions) return 'sprachbausteine_2';
    return null;
  };

  // Analyze parsed JSON
  const detectedPayload = useMemo<DetectedPayload | { error: string } | null>(() => {
    if (!jsonText.trim()) return null;
    try {
      const parsed = JSON.parse(jsonText);

      // 1. Full Backup (contains top-level keys like modelltests, promoCodes...)
      if (parsed.modelltests && Array.isArray(parsed.modelltests)) {
        return {
          type: 'full_backup',
          summary: `Vollständiges Backup mit ${parsed.modelltests.length} Modelltests`,
          details: [
            `Modelltests: ${parsed.modelltests.length}`,
            parsed.promoCodes ? `Promo-Codes: ${parsed.promoCodes.length}` : '',
            parsed.forumsbeitragTopics ? `Forenbeiträge: ${parsed.forumsbeitragTopics.length}` : '',
            parsed.sprechenTopics ? `Sprechthemen enthalten` : '',
          ].filter(Boolean),
          parsedData: parsed,
        };
      }

      // 2. Array of Modelltests
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].variants) {
        return {
          type: 'multiple_modelltests',
          summary: `Liste von ${parsed.length} vollständigen Modelltests`,
          details: parsed.map((m: any) => `• ${m.title || m.id}`),
          parsedData: parsed,
        };
      }

      // 3. Single full Modelltest
      if (parsed.id && parsed.variants && typeof parsed.variants === 'object') {
        const tileCounts = Object.entries(parsed.variants)
          .filter(([_, v]) => Array.isArray(v) && v.length > 0)
          .map(([k, v]) => `${k} (${(v as any[]).length} Var.)`);

        return {
          type: 'single_modelltest',
          summary: `Einzelner Modelltest: "${parsed.title || parsed.id}"`,
          details: tileCounts.length > 0 ? tileCounts : ['Keine Kachelvarianten hinterlegt'],
          targetTestId: parsed.id,
          parsedData: parsed,
        };
      }

      // 4. Single Tile with explicit tileType & variants: { tileType: "lesen_1", variants: [...] }
      if (parsed.tileType && (parsed.variants || parsed.variant)) {
        const vars = Array.isArray(parsed.variants) ? parsed.variants : parsed.variant ? [parsed.variant] : [];
        return {
          type: 'single_tile',
          summary: `Einzelmodul-Import: ${parsed.tileType} (${vars.length} Variante(n))`,
          details: vars.map((v: any, idx: number) => `• Variante ${idx + 1}: ${v.title || v.id || 'Ohne Titel'}`),
          tileType: parsed.tileType as TileType,
          targetTestId: parsed.targetModelltestId || parsed.modelltestId,
          parsedData: { [parsed.tileType]: vars },
        };
      }

      // 5. Partial Variants Object: { "variants": { "lesen_1": [...], "hoeren_1": [...] } } OR { "lesen_1": [...], "hoeren_2": [...] }
      const possibleVariantsMap = parsed.variants && typeof parsed.variants === 'object' ? parsed.variants : parsed;
      const recognizedTiles: { tileType: TileType; count: number; items: any[] }[] = [];

      ALL_TILE_TYPES.forEach(({ type }) => {
        if (possibleVariantsMap[type] && Array.isArray(possibleVariantsMap[type])) {
          recognizedTiles.push({
            tileType: type,
            count: possibleVariantsMap[type].length,
            items: possibleVariantsMap[type],
          });
        }
      });

      if (recognizedTiles.length > 0) {
        return {
          type: 'partial_variants',
          summary: `Teil-Import (${recognizedTiles.length} Kacheln / Prüfungsteile erkannt)`,
          details: recognizedTiles.map((r) => `• ${r.tileType}: ${r.count} Variante(n)`),
          targetTestId: parsed.targetModelltestId || parsed.modelltestId || parsed.id,
          parsedData: recognizedTiles.reduce((acc, r) => ({ ...acc, [r.tileType]: r.items }), {}),
        };
      }

      // 6. Direct Array of Variant Objects: [ { id: "l1-v1", ... } ]
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
        const guessedTile = detectTileTypeFromVariant(parsed[0]) || (selectedTileTypeOverride !== 'auto' ? selectedTileTypeOverride : 'lesen_1');
        return {
          type: 'single_tile',
          summary: `Variantenliste für Modul: ${guessedTile} (${parsed.length} Variante(n))`,
          details: parsed.map((v: any, idx: number) => `• Variante ${idx + 1}: ${v.title || v.id || 'Ohne Titel'}`),
          tileType: guessedTile,
          parsedData: { [guessedTile]: parsed },
        };
      }

      // 7. Single Variant Object: { textBlock: "...", headingsBlock: "..." }
      if (typeof parsed === 'object' && !Array.isArray(parsed)) {
        const guessedTile = detectTileTypeFromVariant(parsed) || (selectedTileTypeOverride !== 'auto' ? selectedTileTypeOverride : 'lesen_1');
        return {
          type: 'single_tile',
          summary: `Einzelne Kachel-Variante für Modul: ${guessedTile}`,
          details: [`• ${parsed.title || parsed.id || 'Neue Variante'}`],
          tileType: guessedTile,
          parsedData: { [guessedTile]: [parsed] },
        };
      }

      // 8. Special collections (Forumsbeitrag, Sprechen, Promo)
      if (parsed.forumsbeitragTopics && Array.isArray(parsed.forumsbeitragTopics)) {
        return {
          type: 'forumsbeitrag',
          summary: `${parsed.forumsbeitragTopics.length} Forenbeitrag-Themen (Q58)`,
          details: parsed.forumsbeitragTopics.map((f: any) => `• ${f.title}`),
          parsedData: parsed,
        };
      }

      return { error: 'Keine erkennbaren Modelltests oder Modul-Varianten in diesem JSON gefunden.' };
    } catch (err: any) {
      return { error: `Ungültiges JSON-Format: ${err.message}` };
    }
  }, [jsonText, selectedTileTypeOverride]);

  // Execute Import
  const handleExecuteImport = async () => {
    if (!detectedPayload || 'error' in detectedPayload) return;

    setIsProcessing(true);
    try {
      const payload = detectedPayload as DetectedPayload;
      let updatedTests = [...modelltests];

      // CASE 1: Full Backup or Multiple Modelltests
      if (payload.type === 'full_backup' || payload.type === 'multiple_modelltests') {
        const incomingTests: Modelltest[] = payload.type === 'full_backup' ? payload.parsedData.modelltests : payload.parsedData;
        incomingTests.forEach((impMT) => {
          const idx = updatedTests.findIndex((m) => m.id === impMT.id);
          if (idx >= 0) {
            if (mergeMode === 'merge') {
              // Deep merge variants
              const existingVariants = { ...updatedTests[idx].variants };
              ALL_TILE_TYPES.forEach(({ type }) => {
                const incomingVars = impMT.variants?.[type] || [];
                if (incomingVars.length > 0) {
                  const existingVars = [...(existingVariants[type] || [])];
                  incomingVars.forEach((newV: any) => {
                    const vIdx = existingVars.findIndex((v: any) => v.id === newV.id);
                    if (vIdx >= 0) existingVars[vIdx] = newV;
                    else existingVars.push(newV);
                  });
                  existingVariants[type] = existingVars as any;
                }
              });
              updatedTests[idx] = {
                ...updatedTests[idx],
                title: impMT.title || updatedTests[idx].title,
                description: impMT.description || updatedTests[idx].description,
                variants: existingVariants,
              };
            } else {
              updatedTests[idx] = impMT;
            }
          } else {
            updatedTests.push(impMT);
          }
        });

        // Also promoCodes, forumsbeitrag, sprechen if full backup
        if (payload.type === 'full_backup') {
          if (payload.parsedData.promoCodes && onSavePromoCodes) await onSavePromoCodes(payload.parsedData.promoCodes);
          if (payload.parsedData.forumsbeitragTopics && onSaveForumsbeitragTopics) await onSaveForumsbeitragTopics(payload.parsedData.forumsbeitragTopics);
          if (payload.parsedData.sprechenTopics && onSaveSprechenTopics) await onSaveSprechenTopics(payload.parsedData.sprechenTopics);
        }

        await onSaveModelltests(updatedTests);
        showToast('Modelltests erfolgreich importiert & gespeichert!');
        onClose();
        return;
      }

      // CASE 2: Single full Modelltest
      if (payload.type === 'single_modelltest') {
        const impMT: Modelltest = payload.parsedData;
        let targetId = selectedTargetTestId === 'auto' ? impMT.id : selectedTargetTestId;

        if (targetId === 'new' || (selectedTargetTestId === 'auto' && !updatedTests.some((m) => m.id === impMT.id))) {
          // Create as new test
          const newTest: Modelltest = {
            id: `mt-${Date.now()}`,
            title: impMT.title || `Importierter Modelltest ${updatedTests.length + 1}`,
            description: impMT.description || 'Importiert via Admin JSON',
            isPremium: impMT.isPremium ?? false,
            variants: impMT.variants || createEmptyVariants(),
          };
          updatedTests.push(newTest);
        } else {
          // Merge into existing test
          const idx = updatedTests.findIndex((m) => m.id === targetId);
          if (idx >= 0) {
            const existingVariants = { ...updatedTests[idx].variants };
            ALL_TILE_TYPES.forEach(({ type }) => {
              const incomingVars = impMT.variants?.[type] || [];
              if (incomingVars.length > 0) {
                if (mergeMode === 'merge') {
                  const existingVars = [...(existingVariants[type] || [])];
                  incomingVars.forEach((newV: any) => {
                    const vIdx = existingVars.findIndex((v: any) => v.id === newV.id);
                    if (vIdx >= 0) existingVars[vIdx] = newV;
                    else existingVars.push(newV);
                  });
                  existingVariants[type] = existingVars as any;
                } else {
                  existingVariants[type] = incomingVars as any;
                }
              }
            });
            updatedTests[idx] = {
              ...updatedTests[idx],
              title: impMT.title || updatedTests[idx].title,
              description: impMT.description || updatedTests[idx].description,
              variants: existingVariants,
            };
          }
        }

        await onSaveModelltests(updatedTests);
        showToast(`Modelltest "${impMT.title || targetId}" erfolgreich importiert!`);
        onClose();
        return;
      }

      // CASE 3: Partial Variants (e.g. only Lesen, or only Hören, or specific tiles)
      if (payload.type === 'partial_variants' || payload.type === 'single_tile') {
        const variantsMap = payload.parsedData; // { "lesen_1": [...], "hoeren_1": [...] }
        let targetId = selectedTargetTestId;

        // Auto-detect target test if set to 'auto'
        if (targetId === 'auto') {
          if (payload.targetTestId && updatedTests.some((m) => m.id === payload.targetTestId)) {
            targetId = payload.targetTestId;
          } else if (updatedTests.length > 0) {
            targetId = updatedTests[0].id; // default to first test if none specified
          } else {
            targetId = 'new';
          }
        }

        if (targetId === 'new') {
          // Create new test and inject imported variants
          const newVariants = createEmptyVariants();
          Object.entries(variantsMap).forEach(([tType, vList]) => {
            if (tType in newVariants) {
              (newVariants as any)[tType] = vList;
            }
          });

          const newTest: Modelltest = {
            id: `mt-${Date.now()}`,
            title: `Modelltest (Importiert ${new Date().toLocaleDateString('de-DE')})`,
            description: `Enthält ${Object.keys(variantsMap).length} importierte Prüfungsteile`,
            isPremium: false,
            variants: newVariants,
          };
          updatedTests.push(newTest);
        } else {
          // Merge into the selected target Modelltest
          const idx = updatedTests.findIndex((m) => m.id === targetId);
          if (idx >= 0) {
            const existingVariants = { ...updatedTests[idx].variants };

            Object.entries(variantsMap).forEach(([tType, incomingVars]) => {
              if (Array.isArray(incomingVars) && incomingVars.length > 0) {
                if (mergeMode === 'merge') {
                  const existingVars = [...((existingVariants as any)[tType] || [])];
                  incomingVars.forEach((newV: any) => {
                    const vIdx = existingVars.findIndex((v: any) => v.id === newV.id);
                    if (vIdx >= 0) existingVars[vIdx] = newV;
                    else existingVars.push(newV);
                  });
                  (existingVariants as any)[tType] = existingVars;
                } else {
                  // Replace this specific tile only
                  (existingVariants as any)[tType] = incomingVars;
                }
              }
            });

            updatedTests[idx] = {
              ...updatedTests[idx],
              variants: existingVariants,
            };
          }
        }

        await onSaveModelltests(updatedTests);
        showToast(
          `Erfolgreich ${Object.keys(variantsMap).length} Kachel(n) in "${
            targetId === 'new' ? 'Neuen Test' : updatedTests.find((m) => m.id === targetId)?.title || targetId
          }" importiert!`
        );
        onClose();
        return;
      }

      // CASE 4: Forumsbeitrag / Sprechen
      if (payload.type === 'forumsbeitrag' && onSaveForumsbeitragTopics) {
        await onSaveForumsbeitragTopics(payload.parsedData.forumsbeitragTopics);
        showToast('Forenbeitrag-Themen erfolgreich importiert!');
        onClose();
        return;
      }
    } catch (err: any) {
      console.error('Import execution error:', err);
      showToast(`Fehler beim Importieren: ${err.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl rounded-3xl border border-indigo-500/40 p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              Modelltests & Module importieren
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                JSON Modular
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Importieren Sie ganze Tests, einzelne Kacheln (z.B. nur Lesen oder nur Hören) oder Varianten-Listen.
            </p>
          </div>
        </div>

        {/* Tabs: Paste JSON vs Upload File */}
        <div className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-800 gap-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'paste' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-4 h-4" /> JSON-Text direkt einfügen
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'file' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" /> .json Datei hochladen
          </button>
        </div>

        {/* Tab 1: File Upload */}
        {activeTab === 'file' && (
          <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-8 text-center space-y-3 transition-colors">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer inline-flex items-center gap-2 shadow-sm">
                <FileText className="w-4 h-4" /> JSON-Datei auswählen
                <input type="file" accept=".json,application/json" onChange={handleFileUpload} className="hidden" />
              </label>
              {fileName && <p className="text-xs text-emerald-400 font-bold mt-2">Ausgewählt: {fileName}</p>}
            </div>
            <p className="text-[11px] text-slate-500">Unterstützt Full-Backups, einzelne Modelltests oder Kachel-JSONs</p>
          </div>
        )}

        {/* Tab 2: Direct Paste */}
        {activeTab === 'paste' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-indigo-400">JSON-Inhalt (Hier einfügen):</label>
              {jsonText && (
                <button
                  type="button"
                  onClick={() => setJsonText('')}
                  className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                >
                  Leeren
                </button>
              )}
            </div>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder={`{\n  "targetModelltestId": "m1",\n  "variants": {\n    "lesen_1": [ ... ],\n    "hoeren_1": [ ... ]\n  }\n}`}
              rows={7}
              className="w-full p-3.5 glass-input rounded-xl text-xs font-mono resize-y"
            />
          </div>
        )}

        {/* JSON Detection Status Badge */}
        {detectedPayload && (
          <div
            className={`p-4 rounded-2xl border text-xs space-y-2 animate-fadeIn ${
              'error' in detectedPayload
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
            }`}
          >
            {'error' in detectedPayload ? (
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{detectedPayload.error}</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 font-black text-emerald-400">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{detectedPayload.summary}</span>
                </div>
                {detectedPayload.details.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-300 pt-1 border-t border-emerald-500/20">
                    {detectedPayload.details.slice(0, 8).map((d, i) => (
                      <div key={i} className="truncate">
                        {d}
                      </div>
                    ))}
                    {detectedPayload.details.length > 8 && (
                      <div className="text-slate-400 italic">+ {detectedPayload.details.length - 8} weitere...</div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Target Options & Merge Config (Only when JSON is valid) */}
        {detectedPayload && !('error' in detectedPayload) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-900/60 rounded-2xl border border-slate-800 text-xs">
            {/* Target Modelltest */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-extrabold text-indigo-400">
                🎯 Ziel-Modelltest (Wohin importieren?):
              </label>
              <select
                value={selectedTargetTestId}
                onChange={(e) => setSelectedTargetTestId(e.target.value)}
                className="w-full px-3 py-2 glass-input rounded-xl text-xs font-bold"
              >
                <option value="auto">🤖 Automatisch (Aus JSON / Erster Test)</option>
                <option value="new">➕ Als neuen Modelltest anlegen</option>
                <optgroup label="Bestehenden Modelltest wählen:">
                  {modelltests.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.id})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Merge Mode */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-extrabold text-indigo-400">
                🔄 Zusammenführungs-Modus:
              </label>
              <select
                value={mergeMode}
                onChange={(e) => setMergeMode(e.target.value as 'merge' | 'replace')}
                className="w-full px-3 py-2 glass-input rounded-xl text-xs font-bold"
              >
                <option value="merge">
                  Intelligent mergen (Bestehende Kacheln behalten)
                </option>
                <option value="replace">
                  Kachel-Inhalte ersetzen (Nur importierte Kacheln)
                </option>
              </select>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Abbrechen
          </button>
          <button
            type="button"
            disabled={!detectedPayload || 'error' in detectedPayload || isProcessing}
            onClick={handleExecuteImport}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Importiere & synchronisiere...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Jetzt importieren & in БД speichern
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
