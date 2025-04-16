import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { FileUp, Download, AlertCircle, X, ChevronLeft, Loader2, Check, Trash2 } from 'lucide-react';
import { format, isAfter, parseISO, addDays } from 'date-fns';

interface CSVRow {
  name: string;
  email: string;
  project?: string;
  first_contact: string;
}

interface FileData {
  file: File;
  rows: CSVRow[];
  invalidEmails: Set<string>;
  duplicateEmails: Set<string>;
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

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CSVUploadModal({ isOpen, onClose }: CSVUploadModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<Map<string, FileData>>(new Map());
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0
  });

  const resetUpload = () => {
    setFiles(new Map());
    setUploadState({ status: 'idle', progress: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetUpload();
    onClose();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

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

  const validateRow = async (row: CSVRow): Promise<{
    isValid: boolean;
    invalidEmail: boolean;
    duplicateEmail: boolean;
  }> => {
    const errors: string[] = [];
    let invalidEmail = false;
    let duplicateEmail = false;

    if (!row.name) errors.push('Name is required');
    if (!row.email) errors.push('Email is required');

    if (row.email) {
      if (!validateEmail(row.email)) {
        invalidEmail = true;
        errors.push('Invalid email format');
      } else {
        const isUnique = await checkEmailUniqueness(row.email);
        if (!isUnique) {
          duplicateEmail = true;
          errors.push('Email already exists');
        }
      }
    }

    if (!row.first_contact) errors.push('First contact date is required');

    if (row.first_contact) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(row.first_contact)) {
        errors.push('Invalid date format (use YYYY-MM-DD)');
      } else {
        const contactDate = parseISO(row.first_contact);
        if (isAfter(contactDate, new Date())) {
          errors.push('First contact date cannot be in the future');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      invalidEmail,
      duplicateEmail
    };
  };

  const handleFiles = async (newFiles: FileList) => {
    const fileArray = Array.from(newFiles);
    const invalidFiles = fileArray.filter(file => file.type !== 'text/csv');

    if (invalidFiles.length > 0) {
      setUploadState({
        status: 'error',
        progress: 0,
        error: 'Please upload only CSV files'
      });
      return;
    }

    setUploadState({ status: 'parsing', progress: 0 });

    try {
      const newFilesMap = new Map(files);

      for (const file of fileArray) {
        const rows = await parseCSV(file);
        const invalidEmails = new Set<string>();
        const duplicateEmails = new Set<string>();

        // Validate all rows
        for (const row of rows) {
          const validation = await validateRow(row);
          if (validation.invalidEmail) {
            invalidEmails.add(row.email);
          }
          if (validation.duplicateEmail) {
            duplicateEmails.add(row.email);
          }
        }

        newFilesMap.set(file.name, {
          file,
          rows,
          invalidEmails,
          duplicateEmails
        });
      }

      setFiles(newFilesMap);

      // Calculate totals
      let totalRows = 0;
      let totalValid = 0;
      let totalInvalid = 0;
      let totalDuplicate = 0;

      newFilesMap.forEach(fileData => {
        totalRows += fileData.rows.length;
        totalInvalid += fileData.invalidEmails.size;
        totalDuplicate += fileData.duplicateEmails.size;
      });

      totalValid = totalRows - (totalInvalid + totalDuplicate);

      setUploadState({
        status: 'previewing',
        progress: 0,
        summary: {
          total: totalRows,
          valid: totalValid,
          invalid: totalInvalid,
          duplicate: totalDuplicate,
          toUpload: totalValid
        }
      });
    } catch (error) {
      setUploadState({
        status: 'error',
        progress: 0,
        error: 'Failed to parse CSV files'
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (fileName: string) => {
    const newFiles = new Map(files);
    newFiles.delete(fileName);
    setFiles(newFiles);

    if (newFiles.size === 0) {
      setUploadState({ status: 'idle', progress: 0 });
    } else {
      // Recalculate summary
      let totalRows = 0;
      let totalValid = 0;
      let totalInvalid = 0;
      let totalDuplicate = 0;

      newFiles.forEach(fileData => {
        totalRows += fileData.rows.length;
        totalInvalid += fileData.invalidEmails.size;
        totalDuplicate += fileData.duplicateEmails.size;
      });

      totalValid = totalRows - (totalInvalid + totalDuplicate);

      setUploadState(prev => ({
        ...prev,
        summary: {
          total: totalRows,
          valid: totalValid,
          invalid: totalInvalid,
          duplicate: totalDuplicate,
          toUpload: totalValid
        }
      }));
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
    if (files.size === 0 || !user) return;

    setUploadState(prev => ({ ...prev, status: 'uploading', progress: 0 }));

    let totalToUpload = 0;
    let processed = 0;
    let successCount = 0;

    // Calculate total valid rows to upload
    files.forEach(fileData => {
      totalToUpload += fileData.rows.filter(row =>
        !fileData.invalidEmails.has(row.email) && !fileData.duplicateEmails.has(row.email)
      ).length;
    });

    try {
      for (const [fileName, fileData] of files) {
        const validRows = fileData.rows.filter(row =>
          !fileData.invalidEmails.has(row.email) && !fileData.duplicateEmails.has(row.email)
        );

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

          if (!error) successCount++;

          processed++;
          setUploadState(prev => ({
            ...prev,
            progress: (processed / totalToUpload) * 100
          }));
        }
      }

      setUploadState(prev => ({
        ...prev,
        status: 'success',
        progress: 100,
        summary: {
          ...prev.summary!,
          valid: successCount
        }
      }));

      // Show success message for 2 seconds before navigating
      setTimeout(() => {
        navigate('/app/prospects');
        handleClose();
      }, 2000);
    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        status: 'error',
        error: 'Failed to upload prospects'
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={handleClose} />

        <div className="relative w-full max-w-3xl rounded-xl bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Upload Prospects</h2>
              <p className="mt-1 text-sm text-gray-500">
                Import your prospects from CSV files
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Template Download */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 flex items-start">
              <div className="flex-1">
                <h3 className="text-blue-800 font-medium">Need a template?</h3>
                <p className="text-blue-600 text-sm mt-1">
                  Download our CSV template to ensure your data is formatted correctly.
                </p>
              </div>
              <button
                onClick={downloadTemplate}
                className="flex items-center px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 transform hover:shadow hover:-translate-y-0.5"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </button>
            </div>

            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FileUp className="h-12 w-12 text-blue-400 mx-auto mb-4" />

              <div className="text-gray-600 mb-4">
                <span className="font-medium">Drop your CSV files here</span>
                <br />
                <span className="text-sm">or</span>
              </div>

              <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium text-gray-600">Browse files</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* Files List */}
            {files.size > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Files</h3>
                  {uploadState.summary && (
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-green-600">
                        <Check className="inline-block h-4 w-4 mr-1" />
                        {uploadState.summary.valid} valid
                      </span>
                      {uploadState.summary.invalid > 0 && (
                        <span className="text-red-600">
                          <AlertCircle className="inline-block h-4 w-4 mr-1" />
                          {uploadState.summary.invalid} invalid
                        </span>
                      )}
                      {uploadState.summary.duplicate > 0 && (
                        <span className="text-orange-600">
                          <AlertCircle className="inline-block h-4 w-4 mr-1" />
                          {uploadState.summary.duplicate} duplicate
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {Array.from(files.entries()).map(([fileName, fileData]) => (
                    <div
                      key={fileName}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{fileName}</p>
                        <p className="text-sm text-gray-500">
                          {fileData.rows.length} rows
                          {fileData.invalidEmails.size > 0 && ` • ${fileData.invalidEmails.size} invalid`}
                          {fileData.duplicateEmails.size > 0 && ` • ${fileData.duplicateEmails.size} duplicate`}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFile(fileName)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
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
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadState.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Success Message */}
            {uploadState.status === 'success' && (
              <div className="bg-green-50 text-green-800 rounded-lg p-4">
                <div className="flex items-center">
                  <Check className="h-5 w-5 mr-2" />
                  <span>
                    Successfully imported {uploadState.summary?.valid} prospects!
                    {uploadState.summary?.duplicate ? ` (${uploadState.summary.duplicate} duplicates skipped)` : ''}
                  </span>
                </div>
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

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 flex justify-end space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            {uploadState.status === 'previewing' && uploadState.summary?.toUpload > 0 && (
              <button
                onClick={handleUpload}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 transform hover:shadow hover:-translate-y-0.5 flex items-center"
              >
                Import {uploadState.summary.toUpload} prospects
                <Plus className="ml-1.5 h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}