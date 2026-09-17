import React, { useState, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import api from '../api';

function numberToWords(num) {
    if (num === 0) return "Zero Rupees only.";
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const numStr = Math.floor(num).toString();
    if (numStr.length > 9) return 'Amount too large';

    const n = ('000000000' + numStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + ' Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + ' Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + ' Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + ' Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + ' Rupees only' : 'Rupees only';
    
    return str.replace(/\s+/g, ' ').trim() + ".";
}

import InvoiceTemplate from '../components/InvoiceTemplate';

export default function CreateInvoice({ onBack, initialData }) {
  const [formData, setFormData] = useState({
    invoiceNo: initialData?.invoiceNo || `NM-${Math.floor(Math.random() * 1000)}`,
    invoiceDate: initialData?.invoiceDate || new Date().toISOString().split('T')[0],
    customerName: initialData?.customerName || '',
    customerAddress: initialData?.customerAddress || '',
    customerPan: initialData?.customerPan || '',
    customerGstin: initialData?.customerGstin || '',
    deliveryCity: initialData?.deliveryCity || 'Bangalore',
    servicePeriodFrom: initialData?.servicePeriodFrom || '',
    servicePeriodTo: initialData?.servicePeriodTo || '',
    bankName: initialData?.bankName || 'KOTAK MAHINDRA BANK',
    accountNo: initialData?.accountNo || '8751183874',
    ifscCode: initialData?.ifscCode || 'KKBK0008045',
    sacNo: initialData?.sacNo || '996601',
    reverseCharge: initialData?.reverseCharge || 'no',
    applyGst: initialData?.applyGst || 'yes',
  });

  const [items, setItems] = useState(() => {
    if (initialData?.items && initialData.items.length > 0) {
      return initialData.items;
    }
    if (initialData?.amount !== undefined && initialData?.amount !== null && initialData?.amount !== '') {
      return [{ particular: initialData.particulars || 'Vehicle Rental Service', amount: initialData.amount }];
    }
    return [{ particular: 'Vehicle Rental Service', amount: '' }];
  });

  const [loading, setLoading] = useState(false);
  const pdfRef = useRef();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: field === 'amount' ? value : value
      };
      return updated;
    });
  };

  const handleAddItem = () => {
    setItems(prev => [...prev, { particular: '', amount: '' }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const parsedAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const isGstApplied = formData.applyGst === 'yes';
  const cgst = isGstApplied ? parsedAmount * 0.025 : 0;
  const sgst = isGstApplied ? parsedAmount * 0.025 : 0;
  const grandTotal = parsedAmount + cgst + sgst;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Save to DB
      const invoiceData = {
        ...formData,
        items,
        amount: parsedAmount,
        cgst,
        sgst,
        grandTotal,
        status: initialData ? initialData.status : 'Completed',
        particulars: items.map(i => i.particular).filter(Boolean).join(', ') || 'Vehicle Rental Service',
      };
      
      if (initialData && initialData._id) {
        await api.put(`/invoices/${initialData._id}`, invoiceData);
      } else {
        await api.post('/invoices', invoiceData);
      }

      // 2. Generate PDF
      const element = pdfRef.current;
      const opt = {
        margin:       0,
        filename:     `${formData.invoiceNo}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();

      alert(`Invoice ${initialData ? 'updated' : 'created'} and PDF downloaded successfully!`);
      onBack(true);
    } catch (error) {
      console.error(error);
      alert(`Error ${initialData ? 'updating' : 'creating'} invoice`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{initialData ? 'Edit Tax Invoice' : 'Create Tax Invoice'}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{initialData ? 'Update invoice details' : 'Generate a new vehicle rental invoice'}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">Invoice No</label>
              <input type="text" name="invoiceNo" value={formData.invoiceNo} onChange={handleInputChange} placeholder="e.g. NM-37" className="w-full px-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">Invoice Date</label>
              <input type="date" name="invoiceDate" value={formData.invoiceDate} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">Customer Name</label>
              <input type="text" name="customerName" value={formData.customerName} onChange={handleInputChange} placeholder="e.g. VTT MOBILITY PRIVATE LIMITED" className="w-full px-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">Reverse Charge Applicable</label>
              <input type="text" name="reverseCharge" value={formData.reverseCharge} onChange={handleInputChange} placeholder="e.g. no" className="w-full px-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">Customer Address</label>
              <textarea name="customerAddress" value={formData.customerAddress} onChange={handleInputChange} placeholder="e.g. No.3 3rd Main Muneshwara Temple Street&#10;Venkatagowda Layout, Hebbal, Kempapura&#10;Bangalore - 560024" rows="3" className="w-full px-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" required></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">Customer PAN</label>
              <input type="text" name="customerPan" value={formData.customerPan} onChange={handleInputChange} placeholder="e.g. AAGCV9204J" className="w-full px-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">Customer GSTIN</label>
              <input type="text" name="customerGstin" value={formData.customerGstin} onChange={handleInputChange} placeholder="e.g. 29AAGCV9204J1ZW" className="w-full px-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">Delivery City</label>
              <input type="text" name="deliveryCity" value={formData.deliveryCity} onChange={handleInputChange} placeholder="e.g. BANGALORE" className="w-full px-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">Service Period From</label>
              <input type="date" name="servicePeriodFrom" value={formData.servicePeriodFrom} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">Service Period To</label>
              <input type="date" name="servicePeriodTo" value={formData.servicePeriodTo} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">Apply GST</label>
              <select name="applyGst" value={formData.applyGst} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="yes">Yes (Apply 5% GST)</option>
                <option value="no">No (0% GST)</option>
              </select>
            </div>

            {/* Dynamic Particulars Section */}
            <div className="md:col-span-2 space-y-3">
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Particulars
              </label>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 text-sm font-medium border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2.5 px-4 w-16 text-center">S.No</th>
                      <th className="py-2.5 px-4">Particulars</th>
                      <th className="py-2.5 px-4 w-48">Amount</th>
                      <th className="py-2.5 px-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {items.map((item, index) => (
                      <tr key={index} className="bg-white dark:bg-slate-800">
                        <td className="py-2 px-4 text-center font-medium text-slate-600 dark:text-slate-400 text-sm">
                          {index + 1}
                        </td>
                        <td className="py-2 px-4">
                          <input
                            type="text"
                            value={item.particular}
                            onChange={(e) => handleItemChange(index, 'particular', e.target.value)}
                            placeholder="e.g. Vehicle Rental Service"
                            className="w-full px-3 py-1.5 border rounded-lg dark:bg-slate-900 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            required
                          />
                        </td>
                        <td className="py-2 px-4">
                          <input
                            type="number"
                            step="any"
                            value={item.amount}
                            onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                            placeholder="e.g. 240680"
                            className="w-full px-3 py-1.5 border rounded-lg dark:bg-slate-900 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            required
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-md"
                              title="Remove row"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:hover:bg-indigo-900 dark:text-indigo-400 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span className="text-base font-bold">+</span> Add Row
              </button>
            </div>

            <div className="md:col-span-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-4">Bank Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-slate-300">Bank Name</label>
                  <input type="text" name="bankName" value={formData.bankName} onChange={handleInputChange} placeholder="e.g. KOTAK MAHINDRA BANK" className="w-full px-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-slate-300">Account No</label>
                  <input type="text" name="accountNo" value={formData.accountNo} onChange={handleInputChange} placeholder="e.g. 8751183874" className="w-full px-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-slate-300">IFSC Code</label>
                  <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleInputChange} placeholder="e.g. KKBK0008045" className="w-full px-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" required />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Tax Calculation</h3>
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-1">
              <span>Amount:</span>
              <span>₹{parsedAmount.toFixed(2)}</span>
            </div>
            {isGstApplied && (
              <>
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-1">
                  <span>CGST (2.5%):</span>
                  <span>₹{cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-1">
                  <span>SGST (2.5%):</span>
                  <span>₹{sgst.toFixed(2)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <span>Grand Total:</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors disabled:opacity-70">
            {loading ? 'Processing & Generating PDF...' : (initialData ? 'Update Invoice & Download PDF' : 'Create Invoice & Download PDF')}
          </button>
        </form>
      </div>

      {/* Hidden PDF Template */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0, width: '750px', backgroundColor: '#fff' }}>
        <InvoiceTemplate 
          ref={pdfRef} 
          invoice={{ ...formData, items }} 
          calculatedValues={{ amount: parsedAmount, cgst, sgst, grandTotal }} 
        />
      </div>
    </div>
  );
}
