import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import api from '../api';
import CreateInvoice from './CreateInvoice';
import InvoiceTemplate from '../components/InvoiceTemplate';
import { Plus, Receipt, FileText, Search, Edit, Trash2, Eye, X, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function Payslip() {
  const [invoices, setInvoices] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const downloadPdfRef = useRef();

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/invoices');
      setInvoices(res.data);
    } catch (error) {
      console.error('Failed to fetch invoices', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isCreating) {
      fetchInvoices();
    }
  }, [isCreating]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await api.delete(`/invoices/${id}`);
        setInvoices(prev => prev.filter(inv => inv._id !== id));
      } catch (error) {
        console.error('Error deleting invoice', error);
        alert('Failed to delete invoice');
      }
    }
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setIsCreating(true);
  };

  useEffect(() => {
    if (downloadingInvoice && downloadPdfRef.current) {
      const timer = setTimeout(() => {
        const element = downloadPdfRef.current;
        const opt = {
          margin:       0,
          filename:     `${downloadingInvoice.invoiceNo}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true, logging: false },
          jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        
        html2pdf().set(opt).from(element).save().then(() => {
          setDownloadingInvoice(null);
        }).catch(err => {
          console.error('PDF error', err);
          setDownloadingInvoice(null);
        });
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [downloadingInvoice]);

  const triggerDownload = (invoice) => {
    setDownloadingInvoice(invoice);
  };

  if (isCreating) {
    return (
      <CreateInvoice 
        initialData={editingInvoice} 
        onBack={(refresh) => {
          setIsCreating(false);
          setEditingInvoice(null);
          if (refresh) fetchInvoices();
        }} 
      />
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 tracking-tight">
            Invoices
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-indigo-500" />
            Manage and generate all your tax invoices
          </p>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search invoices..." 
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all shadow-sm hover:shadow-md"
            />
          </div>
          
          <button onClick={() => setIsCreating(true)} className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-500/30 transition-all hover:shadow-indigo-500/50 hover:-translate-y-0.5 flex items-center gap-2 flex-shrink-0 group">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            Create Invoice
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50" />
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50/80 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-5 uppercase tracking-wider text-xs">Invoice No</th>
                <th className="px-6 py-5 uppercase tracking-wider text-xs">Customer</th>
                <th className="px-6 py-5 uppercase tracking-wider text-xs">Amount</th>
                <th className="px-6 py-5 uppercase tracking-wider text-xs">Date</th>
                <th className="px-6 py-5 uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-5 text-right uppercase tracking-wider text-xs">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3 animate-pulse">
                      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
                      <p>Loading invoices...</p>
                    </div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-2">
                        <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      </div>
                      <p className="text-lg font-medium text-slate-700 dark:text-slate-300">No invoices generated yet</p>
                      <p className="text-sm">Click the create button above to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : invoices.map((inv, i) => (
                <tr 
                  key={inv._id} 
                  className="hover:bg-indigo-50/50 dark:hover:bg-slate-800/80 transition-colors group animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
                >
                  <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">
                        #
                      </div>
                      {inv.invoiceNo}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{inv.customerName}</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                      GSTIN: {inv.customerGstin || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                    ₹{inv.grandTotal.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm font-medium">
                    {inv.invoiceDate}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 shadow-sm shadow-emerald-500/10">
                      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-emerald-500"></span>
                      Completed
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => triggerDownload(inv)}
                        title="Download PDF"
                        disabled={downloadingInvoice?._id === inv._id}
                        className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Download className={`w-4 h-4 ${downloadingInvoice?._id === inv._id ? 'animate-pulse' : ''}`} />
                      </button>
                      <button 
                        onClick={() => setPreviewInvoice(inv)}
                        title="Preview Invoice"
                        className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(inv)}
                        title="Edit Invoice"
                        className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(inv._id)}
                        title="Delete Invoice"
                        className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700/50">
          {loading ? (
            <div className="p-8 flex flex-col items-center gap-3 animate-pulse text-slate-500">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
              <p>Loading invoices...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-2">
                <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-lg font-medium text-slate-700 dark:text-slate-300">No invoices generated yet</p>
              <p className="text-sm">Click the create button above to get started.</p>
            </div>
          ) : invoices.map((inv, i) => (
            <div 
              key={inv._id} 
              className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    #
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{inv.invoiceNo}</h4>
                    <span className="text-xs text-slate-500 font-medium">{inv.invoiceDate}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-slate-700 dark:text-slate-200">₹{inv.grandTotal.toFixed(2)}</div>
                  <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                    Completed
                  </span>
                </div>
              </div>
              
              <div className="mb-4 text-sm">
                <div className="font-semibold text-slate-700 dark:text-slate-300">{inv.customerName}</div>
                <div className="text-xs text-slate-400">GSTIN: {inv.customerGstin || 'N/A'}</div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/50">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Actions</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => triggerDownload(inv)}
                    disabled={downloadingInvoice?._id === inv._id}
                    className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Download className={`w-4 h-4 ${downloadingInvoice?._id === inv._id ? 'animate-pulse' : ''}`} />
                  </button>
                  <button 
                    onClick={() => setPreviewInvoice(inv)}
                    className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleEdit(inv)}
                    className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(inv._id)}
                    className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
      
    {/* Preview Modal */}
    {previewInvoice && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setPreviewInvoice(null)}></div>
          <div className="relative bg-slate-100 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center z-10 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-500" />
                Invoice Preview
              </h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => triggerDownload(previewInvoice)}
                  disabled={downloadingInvoice?._id === previewInvoice._id}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Download className={`w-4 h-4 ${downloadingInvoice?._id === previewInvoice._id ? 'animate-pulse' : ''}`} />
                  Download PDF
                </button>
                <button 
                  onClick={() => setPreviewInvoice(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 sm:p-8 bg-slate-100 flex justify-center sm:justify-center justify-start">
              <div className="shadow-2xl ring-1 ring-slate-900/5 rounded-sm flex-shrink-0 w-[750px] bg-white">
                <InvoiceTemplate invoice={previewInvoice} />
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Hidden PDF Download Template */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0, width: '750px', backgroundColor: '#fff' }}>
        {downloadingInvoice && (
          <InvoiceTemplate 
            ref={downloadPdfRef} 
            invoice={downloadingInvoice} 
          />
        )}
      </div>
    </>
  );
}
