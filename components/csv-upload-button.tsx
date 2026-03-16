"use client";

import { useRef, useState } from "react";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import { parseCSVFromText } from "@/lib/csv-parser-client";

interface CSVUploadButtonProps {
  onDataLoaded: (data: { NM: string[]; RW: any[][] }) => void;
  disabled?: boolean;
  theme?: "dark" | "light";
}

export function CSVUploadButton({
  onDataLoaded,
  disabled = false,
  theme = "dark",
}: CSVUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      showNotification('error', 'Please select a CSV file');
      return;
    }

    // Validate file size (10MB max)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      showNotification('error', 'File size must be less than 10MB');
      return;
    }

    setLoading(true);

    try {
      // Read file as text
      const text = await file.text();

      // Parse CSV
      const result = parseCSVFromText(text);

      if (result.success && result.data) {
        onDataLoaded(result.data);
        showNotification(
          'success',
          `Loaded ${result.stats!.deals} deals from ${result.stats!.advisors} advisors`
        );
      } else {
        showNotification('error', result.error || 'Failed to parse CSV');
      }
    } catch (error) {
      showNotification(
        'error',
        `Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setLoading(false);
      // Reset input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const colors = theme === "dark"
    ? { bg: '#0F2847', border: '#475569', text: '#CBD5E1', success: '#00E5A0', error: '#FF6B6B', notifBg: '#0A1628' }
    : { bg: '#FFFFFF', border: '#CBD5E1', text: '#334155', success: '#059669', error: '#DC2626', notifBg: '#F8FAFC' };

  return (
    <div style={{ position: 'relative' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
        disabled={disabled || loading}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || loading}
        style={{
          padding: '5px 10px',
          fontSize: 12,
          borderRadius: 7,
          border: `1px solid ${colors.border}`,
          background: colors.bg,
          color: colors.text,
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          opacity: disabled || loading ? 0.5 : 1,
        }}
      >
        <Upload size={12} />
        {loading ? 'Loading...' : 'Upload CSV'}
      </button>
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            background: colors.notifBg,
            border: `1px solid ${notification.type === 'success' ? colors.success : colors.error}`,
            borderRadius: 8,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 10000,
            maxWidth: 400,
          }}
        >
          {notification.type === 'success' ? (
            <CheckCircle size={18} color={colors.success} />
          ) : (
            <AlertCircle size={18} color={colors.error} />
          )}
          <span style={{ fontSize: 13, color: colors.text, flex: 1 }}>
            {notification.message}
          </span>
          <button
            onClick={() => setNotification(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={14} color={colors.text} />
          </button>
        </div>
      )}
    </div>
  );
}
