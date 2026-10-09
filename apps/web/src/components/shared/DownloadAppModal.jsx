import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { showToast } from '@/lib/utils';

// NuraCare Standalone Release Download
const DEFAULT_VERSION = '1.0.8';
const GITHUB_REPO = 'markova-technologies/nuracare';
const DEFAULT_APK_URL = `https://github.com/${GITHUB_REPO}/releases/download/v${DEFAULT_VERSION}/NuraCare-v${DEFAULT_VERSION}.apk`;

export default function DownloadAppModal({ isOpen = true, onClose }) {
  const [copied, setCopied] = useState(false);
  const [versionData, setVersionData] = useState({
    appVersion: DEFAULT_VERSION,
    downloadUrl: DEFAULT_APK_URL,
    apkFileName: `NuraCare-v${DEFAULT_VERSION}.apk`
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Fetch live release metadata from /api/version (edge-cached GitHub Releases)
      fetch(`/api/version?t=${Date.now()}`, { cache: 'no-store' })
        .then(res => {
          if (!res.ok) throw new Error('API unavailable');
          return res.json();
        })
        .then(data => {
          if (data && data.appVersion) {
            setVersionData({
              appVersion: data.appVersion,
              downloadUrl: data.downloadUrl || DEFAULT_APK_URL,
              apkFileName: data.apkFileName || `NuraCare-v${data.appVersion}.apk`
            });
          }
        })
        .catch(() => {
          // Fallback: Static manifest /version.json
          fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
              if (data) {
                setVersionData(prev => ({
                  appVersion: data.appVersion || prev.appVersion,
                  downloadUrl: data.downloadUrl || prev.downloadUrl,
                  apkFileName: data.apkFileName || prev.apkFileName
                }));
              }
            })
            .catch(() => {});
        });
    }
  }, []);

  if (!isOpen) return null;

  const currentVersion = versionData.appVersion || DEFAULT_VERSION;
  const apkFileName = versionData.apkFileName || `NuraCare-v${currentVersion}.apk`;
  const activeDownloadUrl = versionData.downloadUrl || DEFAULT_APK_URL;

  // The QR code encodes the canonical versioned APK URL
  const qrTargetUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/NuraCare-v${currentVersion}.apk`
    : `https://nuracare.pro.et/NuraCare-v${currentVersion}.apk`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrTargetUrl)}&color=166534&bgcolor=f0fdf4`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(qrTargetUrl);
      setCopied(true);
      showToast('Direct APK download link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          maxWidth: '480px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(22, 101, 52, 0.3), 0 0 0 1px rgba(34, 197, 94, 0.2)',
          border: '1px solid #e2e8f0',
          position: 'relative',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(22, 101, 52, 0.04) 100%)',
          borderBottom: '1px solid rgba(34, 197, 94, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '13px',
              background: 'linear-gradient(135deg, #22c55e, #15803d)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(22, 163, 74, 0.3)'
            }}>
              <Icons.Smartphone size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#14532d' }}>
                  NuraCare App
                </h3>
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, border: '1px solid #86efac' }}>
                  v{currentVersion}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#4b5563', marginTop: '2px' }}>
                Universal Mobile & Tablet Edition
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(0,0,0,0.06)',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              color: '#94a3b8',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icons.X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          <div style={{
            background: '#f8fafc',
            borderRadius: '18px',
            padding: '18px',
            border: '1px solid #e2e8f0',
            marginBottom: '16px'
          }}>
            <div style={{
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: '14px'
            }}>
              {/* QR Code */}
              <div style={{
                background: 'white',
                padding: '10px',
                borderRadius: '14px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <img 
                  src={qrCodeUrl} 
                  alt="Scan to Download NuraCare APK" 
                  style={{ width: '120px', height: '120px', borderRadius: '8px', display: 'block' }}
                />
                <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#15803d', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Icons.QrCode size={12} /> Scan with Phone
                </span>
              </div>

              <div style={{ flex: '1', minWidth: '170px', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803d', fontWeight: 700, fontSize: '13.5px', marginBottom: '4px' }}>
                  <Icons.CheckCircle2 size={16} /> Direct Standalone APK
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.45', marginBottom: '8px' }}>
                  Complete standalone app bundle. Works on all Android 10 - 15 devices (Samsung, Xiaomi, Tecno, etc.).
                </p>
                <div style={{ fontSize: '11px', color: '#15803d', background: '#dcfce7', padding: '4px 8px', borderRadius: '6px', display: 'inline-block', fontWeight: 600, border: '1px solid #86efac' }}>
                  📦 {apkFileName} • ~118 MB
                </div>
              </div>
            </div>

            {/* Direct APK Download Button */}
            <a 
              href={`/NuraCare-v${currentVersion}.apk`}
              download={apkFileName}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                padding: '14px 20px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '15px',
                textDecoration: 'none',
                boxShadow: '0 4px 15px rgba(22, 163, 74, 0.35)',
                transition: 'all 0.15s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
            >
              <Icons.Download size={20} color="#ffffff" />
              <span>Download NuraCare v{currentVersion} (.APK)</span>
            </a>

            {/* Copy link button */}
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <button 
                onClick={handleCopyLink}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                {copied ? <Icons.Check size={13} color="#16a34a" /> : <Icons.Copy size={13} />}
                <span>{copied ? 'Download link copied!' : 'Copy download link'}</span>
              </button>
            </div>
          </div>

          {/* 3 Simple Install Steps */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '14px 16px'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icons.HelpCircle size={14} color="#16a34a" /> Installation Instructions:
            </div>
            <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '11.5px', color: '#64748b', lineHeight: '1.65' }}>
              <li>Tap the green <strong>Download</strong> button above.</li>
              <li>When Android asks, tap <strong>Download anyway</strong>.</li>
              <li>Open the downloaded <strong>{apkFileName}</strong> and tap <strong>Install</strong>.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
