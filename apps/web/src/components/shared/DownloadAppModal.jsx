import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { showToast } from '@/lib/utils';

// Permanent GitHub Release CDN download URL (never expires, fast global CDN)
const APK_DOWNLOAD_URL = 'https://github.com/markova-technologies/nuracare/releases/download/v1.0.5/nuracare.apk';

export default function DownloadAppModal({ isOpen = true, onClose }) {
  const [copied, setCopied] = useState(false);
  const [versionData, setVersionData] = useState({
    appVersion: '1.0.5',
    downloadUrl: '/nuracare.apk'
  });

  useEffect(() => {
    fetch('/version.json')
      .then(res => res.json())
      .then(data => {
        if (data && data.downloadUrl) {
          setVersionData(data);
        }
      })
      .catch(() => {});
  }, []);

  if (!isOpen) return null;

  // QR code encodes the direct .apk link so scanning it immediately triggers Android's native download
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(APK_DOWNLOAD_URL)}&color=166534&bgcolor=f0fdf4`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(APK_DOWNLOAD_URL);
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
<<<<<<< HEAD
=======
          boxShadow: '0 25px 50px -12px rgba(22, 101, 52, 0.3), 0 0 0 1px rgba(34, 197, 94, 0.2)',
>>>>>>> 2be93c8 (feat(download): point all download endpoints to permanent GitHub Release v1.0.5 APK and simplify modal to single button)
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
<<<<<<< HEAD
          padding: '24px 28px 16px',
          borderBottom: '1px solid #f1f5f9',
=======
          padding: '22px 26px 16px',
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(22, 101, 52, 0.04) 100%)',
          borderBottom: '1px solid rgba(34, 197, 94, 0.15)',
>>>>>>> 2be93c8 (feat(download): point all download endpoints to permanent GitHub Release v1.0.5 APK and simplify modal to single button)
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
<<<<<<< HEAD
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
=======
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #22c55e, #15803d)',
>>>>>>> 2be93c8 (feat(download): point all download endpoints to permanent GitHub Release v1.0.5 APK and simplify modal to single button)
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(22, 163, 74, 0.3)'
            }}>
              <Icons.Smartphone size={24} color="#ffffff" />
            </div>
            <div>
<<<<<<< HEAD
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                Download NuraCare App
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted, #4b5563)' }}>
                v{versionData.appVersion} Android APK Direct Download
=======
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: '#14532d' }}>
                  NuraCare Mobile
                </h3>
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, border: '1px solid #86efac' }}>
                  v1.0.5 Latest
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#4b5563', marginTop: '2px' }}>
                Android APK Standalone Release
>>>>>>> 2be93c8 (feat(download): point all download endpoints to permanent GitHub Release v1.0.5 APK and simplify modal to single button)
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
<<<<<<< HEAD
              background: 'none',
=======
              background: 'rgba(0,0,0,0.06)',
>>>>>>> 2be93c8 (feat(download): point all download endpoints to permanent GitHub Release v1.0.5 APK and simplify modal to single button)
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

<<<<<<< HEAD
        {/* Content Body */}
        <div style={{ padding: '24px 28px' }}>
          {/* Guarantee Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '1px solid #86efac',
            borderRadius: '14px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <Icons.Sparkles size={20} color="#16a34a" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#14532d' }}>
                No Expo Go App Required!
              </div>
              <div style={{ fontSize: '12px', color: '#166534', marginTop: '2px', lineHeight: '1.4' }}>
                This is a standalone native Android app (.APK). It installs directly on any Android device without installing any extra software.
              </div>
            </div>
          </div>

          {/* Download & QR Action Box */}
=======
        {/* Content */}
        <div style={{ padding: '22px 26px 26px' }}>
          {/* Main Action Area */}
>>>>>>> 2be93c8 (feat(download): point all download endpoints to permanent GitHub Release v1.0.5 APK and simplify modal to single button)
          <div style={{
            background: '#f8fafc',
            borderRadius: '18px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            marginBottom: '18px'
          }}>
            <div style={{
              display: 'flex',
              gap: '20px',
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'center',
              width: '100%',
              marginBottom: '16px'
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
                  style={{ width: '130px', height: '130px', borderRadius: '8px', display: 'block' }}
                />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803d', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Icons.QrCode size={12} /> Scan with Phone
                </span>
              </div>

              {/* Information pill */}
              <div style={{ flex: '1', minWidth: '180px', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803d', fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>
                  <Icons.CheckCircle2 size={16} /> Standalone Android App
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5', marginBottom: '10px' }}>
                  Works on all Android phones. No Expo Go required. Includes 3D avatar companion, fasting calendar, and calming water sounds.
                </p>
                <div style={{ fontSize: '11px', color: '#94a3b8', background: '#f1f5f9', padding: '6px 10px', borderRadius: '8px', display: 'inline-block' }}>
                  📦 Size: ~114 MB • Verified Safe
                </div>
              </div>
            </div>

            {/* ONLY ONE SINGLE PROMINENT DOWNLOAD BUTTON */}
            <a 
              href={APK_DOWNLOAD_URL} 
              download="nuracare.apk"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                padding: '16px 24px',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '16px',
                textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(22, 163, 74, 0.45)',
                transition: 'all 0.15s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
            >
              <Icons.Download size={22} color="#ffffff" />
              <span>Download NuraCare App (.APK)</span>
            </a>

            {/* Copy link button */}
            <button 
              onClick={handleCopyLink}
              style={{
                marginTop: '10px',
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
              <span>{copied ? 'Link copied to clipboard!' : 'Copy download link'}</span>
            </button>
          </div>

          {/* 3 Simple Install Steps */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '12px 16px'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              How to install in 3 steps:
            </div>
            <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '11.5px', color: '#64748b', lineHeight: '1.7' }}>
              <li>Tap the green <strong>Download</strong> button above or scan the QR code.</li>
              <li>When Android asks, tap <strong>Download anyway</strong> and open the file.</li>
              <li>Tap <strong>Install</strong> (enable "Install unknown apps" if prompted).</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
