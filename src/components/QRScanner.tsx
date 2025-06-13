// components/QRScanner.tsx
import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerProps {
  onScanSuccess: (locationId: string) => void;
  onClose: () => void;
}

interface QRCodeData {
  id: string | number;
}

export const QRScanner = ({ onScanSuccess, onClose }: QRScannerProps) => {
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scannerRef.current) return;

    const config = {
      fps: 10,
      qrbox: 250,
      rememberLastUsedCamera: true,
    };
    
    const scanner = new Html5QrcodeScanner(scannerRef.current.id, config, /* verbose: */ false); 

    scanner.render(
      (decodedText) => {
        try {
          // Try to parse the QR code content as JSON
          const qrData = JSON.parse(decodedText) as QRCodeData;
          if (qrData && qrData.id) {
            onScanSuccess(String(qrData.id));
            scanner.clear().then(onClose).catch(console.error);
            return;
          }
        } catch (error) {
          // Not JSON, continue
        }

        // Try to extract ?start=... from a URL
        try {
          const url = new URL(decodedText);
          const startParam = url.searchParams.get('start');
          if (startParam) {
            onScanSuccess(startParam);
            scanner.clear().then(onClose).catch(console.error);
            return;
          }
        } catch (e) {
          // Not a valid URL, continue
        }

        // Use raw text as location ID
        onScanSuccess(decodedText);
        scanner.clear().then(onClose).catch(console.error);
      },
      (error) => {
        // Optionally log errors
        console.error('QR scanning error:', error);
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [onScanSuccess, onClose]);

  return <div id="qr-scanner" ref={scannerRef} />;
};
