import React, { useState } from 'react';
import QRScanner from './QRScanner';
import { submitToGoogleSheet } from '../services/googleSheets';
import { Send, CheckCircle, Clock, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const DataForm = () => {
  const [stage, setStage] = useState(1); // 1 = Setup, 2 = Scanning

  const [sessionData, setSessionData] = useState({
    from: '',
    deliveredBy: '',
    to: '',
    receivedBy: '',
    momentType: 'Out',
    scannedBy: '',
    finalReceivedBy: ''
  });

  const [scannedItems, setScannedItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSessionChange = (e) => {
    const { name, value } = e.target;
    setSessionData(prev => ({ ...prev, [name]: value }));
  };

  const handleScanSuccess = (decodedText) => {
    try {
      let parsed = {};
      try {
        parsed = JSON.parse(decodedText);
      } catch (e) {
        parsed = { desc: decodedText, code: '', batch: '' };
      }

      const newItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        productDescription: parsed.desc || parsed.productDescription || parsed.product || decodedText,
        productCode: parsed.code || parsed.productCode || '',
        batchNumber: parsed.batch || parsed.batchNumber || '',
        timeStamp: new Date().toLocaleString()
      };

      setScannedItems(prev => [...prev, newItem]);
      toast.success('Added: ' + newItem.productDescription, { icon: '📦' });
    } catch (err) {
      toast.error('Failed to parse QR data');
    }
  };

  const removeItem = (id) => {
    setScannedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (scannedItems.length === 0) {
      toast.error('No items scanned to submit!');
      return;
    }
    
    setIsSubmitting(true);
    
    // Combine session data with each scanned item
    const finalPayload = scannedItems.map(item => ({
      ...sessionData,
      productDescription: item.productDescription,
      productCode: item.productCode,
      batchNumber: item.batchNumber,
      timeStamp: item.timeStamp
    }));
    
    // REPLACE THIS with your deployed Google Apps Script Web App URL
    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzbdncSu3SAF2XwP_COblSELO9hpnhrDB2anN-ww9yguUfQCY68nGMa41fswM18Pvye/exec"; 

    try {
      await submitToGoogleSheet(finalPayload, WEB_APP_URL);
      toast.success(`${scannedItems.length} items submitted to Dashboard!`, { icon: '✅', style: { borderRadius: '10px', background: '#333', color: '#fff' } });
      
      // Reset after successful submission
      setScannedItems([]);
      setStage(1);
    } catch (error) {
      toast.error('Failed to submit data. Check console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl w-full mx-auto p-6 md:p-8 glass dark:glass-dark rounded-3xl z-10 relative shadow-2xl transition-all">
      <Toaster position="top-center" />
      <div className="mb-6 border-b border-gray-200/50 dark:border-gray-700/50 pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 tracking-tight">
            Movement Tracker
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 font-medium">
            Stage {stage} of 2
          </p>
        </div>
        {stage === 2 && (
          <button onClick={() => setStage(1)} type="button" className="text-sm font-semibold flex items-center gap-1 text-gray-500 hover:text-blue-600 transition">
            <ArrowLeft size={16} /> Edit Setup
          </button>
        )}
      </div>

      {stage === 1 && (
        <form onSubmit={(e) => { e.preventDefault(); setStage(2); }} className="space-y-6">
          <div className="bg-white/40 dark:bg-gray-800/40 p-5 rounded-2xl border border-white/50 dark:border-gray-700/50 shadow-inner space-y-5">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Origin Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 ml-1">From</label>
                <input name="from" value={sessionData.from} onChange={handleSessionChange} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. SMS Warehouse" required />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Delivered By</label>
                <input name="deliveredBy" value={sessionData.deliveredBy} onChange={handleSessionChange} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Carrier Name" required />
              </div>
            </div>
            
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 pt-2 border-t border-gray-200 dark:border-gray-700">Destination Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 ml-1">To</label>
                <input name="to" value={sessionData.to} onChange={handleSessionChange} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. KIMS Hospital" required />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Received By</label>
                <input name="receivedBy" value={sessionData.receivedBy} onChange={handleSessionChange} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Recipient Name" required />
              </div>
            </div>

            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 pt-2 border-t border-gray-200 dark:border-gray-700">Audit Setup</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Type</label>
                <select name="momentType" value={sessionData.momentType} onChange={handleSessionChange} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Out">Out</option>
                  <option value="In">In</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Scanned By</label>
                <input name="scannedBy" value={sessionData.scannedBy} onChange={handleSessionChange} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Final Rcvr</label>
                <input name="finalReceivedBy" value={sessionData.finalReceivedBy} onChange={handleSessionChange} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
          
          <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl flex justify-center items-center gap-2 transition-all shadow-xl shadow-indigo-500/30">
            Continue to Scanner <ArrowRight size={20} />
          </button>
        </form>
      )}

      {stage === 2 && (
        <div className="space-y-6">
          <QRScanner onScanSuccess={handleScanSuccess} />

          <div className="bg-white/40 dark:bg-gray-800/40 p-4 rounded-2xl border border-white/50 dark:border-gray-700/50 shadow-inner">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-500" /> Scanned Items
              </span>
              <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 py-1 px-3 rounded-full text-xs font-bold">
                {scannedItems.length} items
              </span>
            </h3>
            
            {scannedItems.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">No items scanned yet. Start scanning above!</p>
            ) : (
              <ul className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {scannedItems.map((item, index) => (
                  <li key={item.id} className="bg-white dark:bg-gray-900 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center group">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 block uppercase">#{index + 1} • {item.productCode || 'N/A'}</span>
                      <strong className="text-sm text-gray-800 dark:text-gray-100">{item.productDescription}</strong>
                      <span className="text-xs text-blue-600 dark:text-blue-400 block mt-0.5">Batch: {item.batchNumber || 'N/A'}</span>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Remove item">
                      <Trash2 size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button 
            type="button" 
            onClick={handleSubmit}
            disabled={isSubmitting || scannedItems.length === 0}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-4 px-6 rounded-xl flex justify-center items-center gap-2 transition-all shadow-xl shadow-teal-500/30 disabled:opacity-50 disabled:scale-100"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2"><Clock className="animate-spin" size={20} /> Submitting Batch...</span>
            ) : (
              <span className="flex items-center gap-2"><Send size={20} /> Submit Batch ({scannedItems.length})</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default DataForm;
