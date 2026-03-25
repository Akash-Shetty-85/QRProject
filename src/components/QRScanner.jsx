import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X } from 'lucide-react';

const QRScanner = ({ onScanSuccess }) => {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (isScanning) {
      scannerRef.current = new Html5Qrcode("qr-reader");
      
      const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };
      
      scannerRef.current.start(
        { facingMode: "environment" },
        config,
        (decodedText, decodedResult) => {
          stopScanning();
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Continuous scanning drops errors until read
        }
      ).catch((err) => {
        console.error("Error starting scanner:", err);
      });
    }

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [isScanning]);

  const stopScanning = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop();
      setIsScanning(false);
    } else {
      setIsScanning(false);
    }
  };

  return (
    <div className="w-full mb-6 relative z-20">
      {!isScanning ? (
        <button
          type="button"
          onClick={() => setIsScanning(true)}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl transition-all shadow-lg shadow-blue-500/30 font-medium"
        >
          <Camera size={24} />
          Scan QR Code
        </button>
      ) : (
        <div className="relative rounded-xl overflow-hidden glass dark:glass-dark p-2 border border-blue-500/30">
          <div className="flex justify-between items-center mb-2 px-2">
            <span className="font-medium text-sm text-gray-700 dark:text-gray-300">Point camera at QR Code</span>
            <button 
              type="button" 
              onClick={stopScanning}
              className="p-1.5 bg-red-100/80 text-red-700 rounded-full hover:bg-red-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <div id="qr-reader" className="w-full overflow-hidden rounded-lg bg-black min-h-[250px]"></div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
