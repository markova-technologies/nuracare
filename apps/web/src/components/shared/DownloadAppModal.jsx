import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { showToast } from '@/lib/utils';

// NuraCare Standalone Release Download
const DEFAULT_VERSION = '1.0.7';
const DEFAULT_APK_URL = 'https://github.com/markova-technologies/nuracare/releases/download/v1.0.7/NuraCare-v1.0.7.apk';

export default function DownloadAppModal({ isOpen = true, onClose }) {
  const [activeTab, setActiveTab] = useState('instant'); // 'instant' | 'apk'
  const [copied, setCopied] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [versionData, setVersionData] = useState({
    appVersion: DEFAULT_VERSION,
    downloadUrl: DEFAULT_APK_URL
  });

  useEffect(() => {
    // 1. Check if already running in standalone PWA mode
    if (typeof window !== 'undefined') {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
      setIsInstalled(isStandalone);

      // 2. Capture install prompt if available
      if (window.deferredInstallPrompt) {
        setInstallPrompt(window.deferredInstallPrompt);
      }

      const onInstallable = () => {
        if (window.deferredInstallPrompt) {
          setInstallPrompt(window.deferredInstallPrompt);
        }
      };
      window.addEventListener('pwa-installable', onInstallable);

      // Priority 1: Fetch live release metadata from /api/version (edge-cached GitHub Releases)
      fetch(`/api/version?t=${Date.now()}`, { cache: 'no-store' })
        .then(res => {
          if (!res.ok) throw new Error('API unavailable');
          return res.json();
        })
        .then(data => {
          if (data && data.appVersion) {
            setVersionData({
              appVersion: data.appVersion,
              downloadUrl: data.downloadUrl || DEFAULT_APK_URL
            });
          }
        })
        .catch(() => {
          // Priority 2 Fallback: Static manifest /version.json
          fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
              if (data) {
                setVersionData(prev => ({
                  appVersion: data.appVersion || prev.appVersion,
                  downloadUrl: data.downloadUrl || data.directApkUrl || prev.downloadUrl
                }));
              }
            })
            .catch(() => {});
        });

      return () => {
        window.removeEventListener('pwa-installable', onInstallable);
      };
    }
  }, []);

  if (!isOpen) return null;

  const currentVersion = versionData.appVersion || DEFAULT_VERSION;
  const apkFileName = `NuraCare-v${currentVersion}.apk`;
  const activeDownloadUrl = versionData.downloadUrl || DEFAULT_APK_URL;

  // QR code encodes the direct .apk link
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(activeDownloadUrl)}&color=166534&bgcolor=f0fdf4`;

  const handleInstallPWA = async () => {
    const promptEvent = installPrompt || (typeof window !== 'undefined' ? window.deferredInstallPrompt : null);
    if (promptEvent) {
      try {
        promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') {
          showToast('NuraCare installed successfully!', 'success');
          setInstallPrompt(null);
          setIsInstalled(true);
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
    } else {
      // Guide user based on browser/OS
      const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        showToast('To Install on iOS: Tap Share (⎋) below and select "Add to Home Screen" (⊞).', 'info', 7000);
      } else {
        showToast('To Install: Tap your browser menu (⋮ or ⋯) and choose "Install App" or "Add to Home screen".', 'info', 7000);
      }
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(activeDownloadUrl);
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
          maxWidth: '500px',
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

        {/* Tab Switcher: Instant App (Recommended) vs APK File */}
        <div style={{
          display: 'flex',
          padding: '8px 16px 0',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          gap: '8px'
        }}>
          <button
            onClick={() => setActiveTab('instant')}
            style={{
              flex: 1,
              padding: '10px 12px',
              fontSize: '13px',
              fontWeight: activeTab === 'instant' ? 700 : 500,
              color: activeTab === 'instant' ? '#15803d' : '#64748b',
              background: activeTab === 'instant' ? '#ffffff' : 'transparent',
              border: activeTab === 'instant' ? '1px solid #cbd5e1' : '1px solid transparent',
              borderBottom: activeTab === 'instant' ? '2px solid #16a34a' : 'none',
              borderRadius: '10px 10px 0 0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Icons.Zap size={15} color={activeTab === 'instant' ? '#16a34a' : '#64748b'} />
            <span>Instant App (All Devices)</span>
          </button>

          <button
            onClick={() => setActiveTab('apk')}
            style={{
              flex: 1,
              padding: '10px 12px',
              fontSize: '13px',
              fontWeight: activeTab === 'apk' ? 700 : 500,
              color: activeTab === 'apk' ? '#15803d' : '#64748b',
              background: activeTab === 'apk' ? '#ffffff' : 'transparent',
              border: activeTab === 'apk' ? '1px solid #cbd5e1' : '1px solid transparent',
              borderBottom: activeTab === 'apk' ? '2px solid #16a34a' : 'none',
              borderRadius: '10px 10px 0 0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Icons.Package size={15} color={activeTab === 'apk' ? '#16a34a' : '#64748b'} />
            <span>Standalone APK</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'instant' ? (
            /* TAB 1: 1-Tap Instant Installation (PWA) */
            <div>
              <div style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(22, 101, 52, 0.02) 100%)',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                borderRadius: '16px',
                padding: '18px',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '10px',
                  boxShadow: '0 6px 16px rgba(22, 163, 74, 0.25)'
                }}>
                  <Icons.CheckCircle size={28} color="#ffffff" />
                </div>
                <h4 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#14532d' }}>
                  {isInstalled ? 'App Is Already Installed!' : '1-Tap Universal App Install'}
                </h4>
                <p style={{ margin: '6px 0 16px', fontSize: '13px', color: '#4b5563', lineHeight: '1.5' }}>
                  {isInstalled 
                    ? 'NuraCare is installed on your device and running as a standalone app.' 
                    : 'Works on all Android phones (Samsung, Xiaomi, Tecno, etc.) & iPhones. Zero startup crashes, no APK downloads required.'}
                </p>

                <button
                  onClick={handleInstallPWA}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    padding: '15px 20px',
                    borderRadius: '14px',
                    fontWeight: 800,
                    fontSize: '15px',
                    border: 'none',
                    boxShadow: '0 6px 20px rgba(22, 163, 74, 0.35)',
                    transition: 'all 0.15s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                >
                  <Icons.DownloadCloud size={20} />
                  <span>{isInstalled ? 'Open / Reinstall to Home Screen' : 'Install App to Home Screen'}</span>
                </button>
              </div>

              {/* Compatibility Highlights */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                marginBottom: '16px'
              }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803d', fontWeight: 700, fontSize: '12px' }}>
                    <Icons.ShieldCheck size={15} /> 100% Compatible
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#64748b' }}>
                    Guaranteed to open on every Samsung, Xiaomi, and Android 8-15 phone.
                  </p>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803d', fontWeight: 700, fontSize: '12px' }}>
                    <Icons.Zap size={15} /> Instant Launch
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#64748b' }}>
                    No 118 MB file to download, no security warnings, loads in 1 second.
                  </p>
                </div>
              </div>

              {/* Instructions on manual install if prompt is dismissed */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px 14px',
                fontSize: '11.5px',
                color: '#64748b'
              }}>
                <strong>Tip for Samsung & Chrome browsers:</strong> If prompted, tap <em>"Install"</em> or tap the 3 dots (⋮) in your browser and select <em>"Install app"</em> or <em>"Add to Home Screen"</em>.
              </div>
            </div>
          ) : (
            /* TAB 2: Standalone APK */
            <div>
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
                    padding: '8px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    <img 
                      src={qrCodeUrl} 
                      alt="Scan to Download NuraCare APK" 
                      style={{ width: '110px', height: '110px', borderRadius: '6px', display: 'block' }}
                    />
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#15803d', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Icons.QrCode size={11} /> Scan with Phone
                    </span>
                  </div>

                  <div style={{ flex: '1', minWidth: '170px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803d', fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>
                      <Icons.CheckCircle2 size={16} /> Direct Standalone APK
                    </div>
                    <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b', lineHeight: '1.4', marginBottom: '8px' }}>
                      Full offline bundle. Download directly if you cannot use the instant app install.
                    </p>
                    <div style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', display: 'inline-block' }}>
                      📦 Version {currentVersion} • ~118 MB
                    </div>
                  </div>
                </div>

                {/* APK Download Button */}
                <a 
                  href={activeDownloadUrl} 
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
                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                  <button 
                    onClick={handleCopyLink}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {copied ? <Icons.Check size={12} color="#16a34a" /> : <Icons.Copy size={12} />}
                    <span>{copied ? 'Link copied!' : 'Copy download link'}</span>
                  </button>
                </div>
              </div>

              {/* 3 Simple Install Steps */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px 14px'
              }}>
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Manual APK installation steps:
                </div>
                <ol style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: '#64748b', lineHeight: '1.6' }}>
                  <li>Tap the green <strong>Download</strong> button above.</li>
                  <li>When Android asks, tap <strong>Download anyway</strong>.</li>
                  <li>Tap <strong>Install</strong> (enable "Install unknown apps" if prompted).</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
