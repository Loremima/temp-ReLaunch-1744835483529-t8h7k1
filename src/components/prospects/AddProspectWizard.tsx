import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  X, FileText, Upload, Link as LinkIcon, ChevronLeft, ChevronRight,
  Check, AlertCircle, Calendar, FileUp, Download, Loader2, Plus
} from 'lucide-react';
import { format, addDays, parseISO, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import confetti from 'canvas-confetti';

interface FormData {
  name: string;
  email: string;
  project: string;
  first_contact: string;
}

interface WizardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ValidationState {
  email: {
    isValid: boolean;
    message: string | null;
    isChecking: boolean;
  };
}

interface FollowupSchedule {
  stage1: number;
  stage2: number;
  stage3: number;
}

interface CSVRow {
  name: string;
  email: string;
  project?: string;
  first_contact: string;
}

interface UploadState {
  status: 'idle' | 'parsing' | 'previewing' | 'uploading' | 'error' | 'success';
  progress: number;
  error?: string;
  summary?: {
    total: number;
    valid: number;
    invalid: number;
    duplicate: number;
    toUpload: number;
  };
}

export default function AddProspectWizard({ isOpen, onClose }: WizardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<'manual' | 'csv' | 'api' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    project: '',
    first_contact: format(new Date(), 'yyyy-MM-dd')
  });
  const [schedule, setSchedule] = useState<FollowupSchedule>({
    stage1: 3,
    stage2: 7,
    stage3: 14
  });
  const [validation, setValidation] = useState<ValidationState>({
    email: {
      isValid: false,
      message: null,
      isChecking: false
    }
  });
  const [emailCheckTimeout, setEmailCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  // CSV Upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0
  });
  const [previewData, setPreviewData] = useState<CSVRow[]>([]);
  const [invalidEmails, setInvalidEmails] = useState<Set<string>>(new Set());
  const [duplicateEmails, setDuplicateEmails] = useState<Set<string>>(new Set());

  const validateEmail = (email: string) => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  };

  const checkEmailUniqueness = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('prospects')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return !data;
    } catch (error) {
      console.error('Error checking email uniqueness:', error);
      return false;
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetUpload();
    onClose();
  };

  const resetUpload = () => {
    setFile(null);
    setPreviewData([]);
    setUploadState({ status: 'idle', progress: 0 });
    setInvalidEmails(new Set());
    setDuplicateEmails(new Set());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const parseCSV = async (file: File): Promise<CSVRow[]> => {
    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0]
      .split(',')
      .map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase())
      .map(h => h === 'first contact date' ? 'first_contact' : h);

    return lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
        return headers.reduce((obj: any, header, i) => {
          obj[header] = values[i];
          return obj;
        }, {});
      });
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    await handleFile(droppedFile);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      await handleFile(selectedFile);
    }
  };

  const handleFile = async (file: File) => {
    if (file.type !== 'text/csv') {
      setUploadState({
        status: 'error',
        progress: 0,
        error: 'Please upload a CSV file'
      });
      return;
    }

    setFile(file);
    setUploadState({ status: 'parsing', progress: 0 });

    try {
      const data = await parseCSV(file);
      const invalidEmails = new Set<string>();
      const duplicateEmails = new Set<string>();
      let validCount = 0;

      // Validate each row
      for (const row of data) {
        if (!validateEmail(row.email)) {
          invalidEmails.add(row.email);
        } else {
          const isUnique = await checkEmailUniqueness(row.email);
          if (!isUnique) {
            duplicateEmails.add(row.email);
          } else {
            validCount++;
          }
        }
      }

      setPreviewData(data);
      setInvalidEmails(invalidEmails);
      setDuplicateEmails(duplicateEmails);

      setUploadState({
        status: 'previewing',
        progress: 0,
        summary: {
          total: data.length,
          valid: validCount,
          invalid: invalidEmails.size,
          duplicate: duplicateEmails.size,
          toUpload: validCount
        }
      });
    } catch (error) {
      setUploadState({
        status: 'error',
        progress: 0,
        error: 'Failed to parse CSV file'
      });
    }
  };

  const downloadTemplate = () => {
    const template = 'Name,Email,Project,First Contact Date\nJohn Doe,john@example.com,Website Redesign,2024-04-01\n';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prospects_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploadState({ status: 'uploading', progress: 0 });
    const validRows = previewData.filter(row =>
      !invalidEmails.has(row.email) && !duplicateEmails.has(row.email)
    );
    const total = validRows.length;
    let processed = 0;

    try {
      for (const row of validRows) {
        const { error } = await supabase
          .from('prospects')
          .insert({
            user_id: user.id,
            name: row.name,
            email: row.email,
            project: row.project,
            first_contact: row.first_contact,
            status: 'Pending',
            followup_stage: 1,
            next_followup: format(addDays(new Date(row.first_contact), 3), 'yyyy-MM-dd')
          });

        if (error) throw error;

        processed++;
        setUploadState({
          status: 'uploading',
          progress: (processed / total) * 100
        });
      }

      setUploadState({ status: 'success', progress: 100 });

      // Show success message and navigate
      setTimeout(() => {
        navigate('/app/prospects/schedule', {
          state: {
            count: total,
            firstContact: validRows[0].first_contact
          }
        });
        handleClose();
      }, 1500);
    } catch (error) {
      setUploadState({
        status: 'error',
        progress: 0,
        error: 'Failed to upload prospects'
      });
    }
  };

  const getHeaderTitle = () => {
    if (!method) return 'Ajouter un prospect';
    if (method === 'manual') {
      switch (step) {
        case 1:
          return 'Informations du prospect';
        case 2:
          return 'Planification des relances';
        case 3:
          return 'Confirmation';
        default:
          return 'Ajouter un prospect';
      }
    }
    if (method === 'csv') return 'Import CSV';
    if (method === 'api') return 'API Integration';
    return 'Ajouter un prospect';
  };

  const getHeaderSubtitle = () => {
    if (!method) return 'Choisissez une méthode d\'ajout';
    if (method === 'manual') {
      switch (step) {
        case 1:
          return 'Entrez les informations de base du prospect';
        case 2:
          return 'Définissez le calendrier des relances';
        case 3:
          return 'Vérifiez les informations avant de créer le prospect';
        default:
          return '';
      }
    }
    if (method === 'csv') return 'Importez plusieurs prospects depuis un fichier CSV';
    if (method === 'api') return 'Intégrez via notre API';
    return '';
  };

  const getActionButton = () => {
    if (!method) {
      return null;
    }

    if (method === 'manual') {
      if (step === 3) {
        return (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Créer le prospect
              </>
            )}
          </button>
        );
      }

      return (
        <button
          onClick={() => setStep(step + 1)}
          disabled={step === 1 && (!formData.name || !formData.email || !validation.email.isValid)}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant
          <ChevronRight className="ml-2 h-4 w-4" />
        </button>
      );
    }

    if (method === 'csv' && uploadState.status === 'previewing' && uploadState.summary && uploadState.summary.toUpload > 0) {
      return (
        <button
          onClick={handleUpload}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Import {uploadState.summary.toUpload} prospects
          <Plus className="ml-2 h-4 w-4" />
        </button>
      );
    }

    return null;
  };

  const renderContent = () => {
    if (!method) {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button
            onClick={() => setMethod('manual')}
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <FileText className="h-10 w-10 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Manuel</h3>
            <p className="mt-1 text-sm text-gray-500">
              Ajoutez un prospect manuellement
            </p>
          </button>

          <button
            onClick={() => setMethod('csv')}
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Upload className="h-10 w-10 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Import CSV</h3>
            <p className="mt-1 text-sm text-gray-500">
              Importez plusieurs prospects depuis un fichier CSV
            </p>
          </button>

          <button
            onClick={() => setMethod('api')}
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <LinkIcon className="h-10 w-10 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">API</h3>
            <p className="mt-1 text-sm text-gray-500">
              Intégrez via notre API
            </p>
          </button>
        </div>
      );
    }

    if (method === 'manual') {
      if (step === 1) {
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Jean Dupont"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });

                  // Validation de l'email
                  if (emailCheckTimeout) clearTimeout(emailCheckTimeout);

                  if (validateEmail(e.target.value)) {
                    setValidation({
                      ...validation,
                      email: { ...validation.email, isChecking: true, message: null }
                    });

                    const timeout = setTimeout(async () => {
                      const isUnique = await checkEmailUniqueness(e.target.value);
                      setValidation({
                        ...validation,
                        email: {
                          isValid: isUnique,
                          isChecking: false,
                          message: isUnique ? null : "Cette adresse email existe déjà dans votre liste"
                        }
                      });
                    }, 500);

                    setEmailCheckTimeout(timeout);
                  } else {
                    setValidation({
                      ...validation,
                      email: {
                        isValid: false,
                        isChecking: false,
                        message: e.target.value ? "Adresse email invalide" : null
                      }
                    });
                  }
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${formData.email && !validation.email.isValid && !validation.email.isChecking
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
                  }`}
                placeholder="jean.dupont@exemple.com"
                required
              />
              {validation.email.isChecking && (
                <p className="mt-1 text-sm text-gray-500 flex items-center">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Vérification...
                </p>
              )}
              {formData.email && validation.email.message && (
                <p className="mt-1 text-sm text-red-600">
                  {validation.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">
                Entreprise
              </label>
              <input
                id="project"
                type="text"
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Entreprise"
              />
            </div>

            <div>
              <label htmlFor="first_contact" className="block text-sm font-medium text-gray-700 mb-1">
                Date de premier contact
              </label>
              <div className="relative">
                <input
                  id="first_contact"
                  type="date"
                  value={formData.first_contact}
                  onChange={(e) => setFormData({ ...formData, first_contact: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>
        );
      }

      if (step === 2) {
        return (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">
              Définissez quand les emails de suivi seront envoyés après le premier contact.
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="stage1" className="block text-sm font-medium text-gray-700 mb-1">
                  Première relance (jours)
                </label>
                <input
                  id="stage1"
                  type="number"
                  min="1"
                  max="30"
                  value={schedule.stage1}
                  onChange={(e) => setSchedule({ ...schedule, stage1: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {schedule.stage1 === 1
                    ? "1 jour après le premier contact"
                    : `${schedule.stage1} jours après le premier contact`
                  }
                </p>
              </div>

              <div>
                <label htmlFor="stage2" className="block text-sm font-medium text-gray-700 mb-1">
                  Deuxième relance (jours)
                </label>
                <input
                  id="stage2"
                  type="number"
                  min={schedule.stage1 + 1}
                  max="60"
                  value={schedule.stage2}
                  onChange={(e) => setSchedule({ ...schedule, stage2: parseInt(e.target.value) || (schedule.stage1 + 1) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {schedule.stage2 - schedule.stage1 === 1
                    ? "1 jour après la première relance"
                    : `${schedule.stage2 - schedule.stage1} jours après la première relance`
                  }
                </p>
              </div>

              <div>
                <label htmlFor="stage3" className="block text-sm font-medium text-gray-700 mb-1">
                  Troisième relance (jours)
                </label>
                <input
                  id="stage3"
                  type="number"
                  min={schedule.stage2 + 1}
                  max="90"
                  value={schedule.stage3}
                  onChange={(e) => setSchedule({ ...schedule, stage3: parseInt(e.target.value) || (schedule.stage2 + 1) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {schedule.stage3 - schedule.stage2 === 1
                    ? "1 jour après la deuxième relance"
                    : `${schedule.stage3 - schedule.stage2} jours après la deuxième relance`
                  }
                </p>
              </div>
            </div>
          </div>
        );
      }

      if (step === 3) {
        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Résumé</h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nom</p>
                    <p className="text-sm text-gray-900">{formData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{formData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Entreprise</p>
                    <p className="text-sm text-gray-900">{formData.project || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Premier contact</p>
                    <p className="text-sm text-gray-900">
                      {format(parseISO(formData.first_contact), 'PP', { locale: fr })}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-500 mb-2">Calendrier de relance</p>
                  <ul className="space-y-2">
                    <li className="flex justify-between text-sm">
                      <span className="text-gray-600">Première relance:</span>
                      <span className="font-medium text-gray-900">
                        {format(addDays(parseISO(formData.first_contact), schedule.stage1), 'PP', { locale: fr })}
                      </span>
                    </li>
                    <li className="flex justify-between text-sm">
                      <span className="text-gray-600">Deuxième relance:</span>
                      <span className="font-medium text-gray-900">
                        {format(addDays(parseISO(formData.first_contact), schedule.stage2), 'PP', { locale: fr })}
                      </span>
                    </li>
                    <li className="flex justify-between text-sm">
                      <span className="text-gray-600">Troisième relance:</span>
                      <span className="font-medium text-gray-900">
                        {format(addDays(parseISO(formData.first_contact), schedule.stage3), 'PP', { locale: fr })}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      }
    }

    if (method === 'csv') {
      return (
        <div className="space-y-6">
          {/* Template Download */}
          <div className="bg-blue-50 rounded-lg p-4 flex items-start">
            <div className="flex-1">
              <h3 className="text-blue-800 font-medium">Need a template?</h3>
              <p className="text-blue-600 text-sm mt-1">
                Download our CSV template to ensure your data is formatted correctly.
              </p>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </button>
          </div>

          {/* Upload Area */}
          {uploadState.status === 'idle' && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FileUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />

              <div className="text-gray-600 mb-4">
                <span className="font-medium">Drop your CSV file here</span>
                <br />
                <span className="text-sm">or</span>
              </div>

              <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium text-gray-600">Browse files</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          )}

          {/* Preview Area */}
          {uploadState.status === 'previewing' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Preview</h3>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-green-600">
                    <Check className="inline-block h-4 w-4 mr-1" />
                    {uploadState.summary?.valid} valid
                  </span>
                  {uploadState.summary && uploadState.summary.invalid > 0 && (
                    <span className="text-red-600">
                      <AlertCircle className="inline-block h-4 w-4 mr-1" />
                      {uploadState.summary?.invalid} invalid
                    </span>
                  )}
                  {uploadState.summary && uploadState.summary.duplicate > 0 && (
                    <span className="text-orange-600">
                      <AlertCircle className="inline-block h-4 w-4 mr-1" />
                      {uploadState.summary?.duplicate} duplicate
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(previewData[0] || {}).map((header) => (
                        <th
                          key={header}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((value, j) => (
                          <td
                            key={j}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          >
                            {value || '-'}
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {invalidEmails.has(row.email) ? (
                            <span className="text-red-600 text-sm">Invalid email</span>
                          ) : duplicateEmails.has(row.email) ? (
                            <span className="text-orange-600 text-sm">Duplicate</span>
                          ) : (
                            <span className="text-green-600 text-sm">Valid</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {uploadState.status === 'uploading' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin mr-2" />
                  <span className="font-medium text-gray-900">Uploading prospects...</span>
                </div>
                <span className="text-sm text-gray-500">
                  {Math.round(uploadState.progress)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadState.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success Message */}
          {uploadState.status === 'success' && (
            <div className="bg-green-50 text-green-800 rounded-lg p-4">
              Upload completed successfully! Redirecting...
            </div>
          )}

          {/* Error Message */}
          {uploadState.error && (
            <div className="flex items-center text-sm text-red-600 bg-red-50 p-4 rounded-lg">
              <AlertCircle className="h-4 w-4 mr-2" />
              {uploadState.error}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const handleSubmit = async () => {
    if (!user || !formData.name || !formData.email || !validateEmail(formData.email)) {
      setError('Veuillez remplir tous les champs requis.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Vérifier une dernière fois que l'email est unique
      const isUnique = await checkEmailUniqueness(formData.email);
      if (!isUnique) {
        throw new Error('Cette adresse email existe déjà dans votre liste.');
      }

      // Ajouter le prospect
      const { error: insertError } = await supabase.from('prospects').insert({
        user_id: user.id,
        name: formData.name,
        email: formData.email,
        project: formData.project || null,
        first_contact: formData.first_contact,
        status: 'Pending',
        followup_stage: 1,
        next_followup: format(addDays(parseISO(formData.first_contact), schedule.stage1), 'yyyy-MM-dd')
      });

      if (insertError) throw insertError;

      // Animation de succès
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (error: any) {
      console.error('Error adding prospect:', error);
      setError(error.message || 'Une erreur est survenue lors de l\'ajout du prospect.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={handleClose} />

        <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl border border-gray-100">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {getHeaderTitle()}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {getHeaderSubtitle()}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress bar */}
          {method === 'manual' && (
            <div className="h-1 w-full bg-gray-100">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {renderContent()}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex justify-between">
              <button
                onClick={() => {
                  if (method === null || step === 1) {
                    handleClose();
                  } else if (method === 'manual') {
                    setStep(step - 1);
                  } else if (method === 'csv') {
                    setMethod(null);
                    resetUpload();
                  }
                }}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                {method === null || step === 1 ? 'Annuler' : 'Retour'}
              </button>

              {getActionButton()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}