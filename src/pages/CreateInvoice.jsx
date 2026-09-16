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

export default function CreateInvoice({ onBack }) {
  const [formData, setFormData] = useState({
    invoiceNo: `NM-${Math.floor(Math.random() * 1000)}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    customerName: '',
    customerAddress: '',
    customerPan: '',
    customerGstin: '',
    deliveryCity: 'Bangalore',
    servicePeriodFrom: '',
    servicePeriodTo: '',
    amount: 0,
    bankName: 'KOTAK MAHINDRA BANK',
    accountNo: '8751183874',
    ifscCode: 'KKBK0008045',
  });

  const [loading, setLoading] = useState(false);
  const pdfRef = useRef();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const amount = formData.amount;
  const cgst = amount * 0.025;
  const sgst = amount * 0.025;
  const grandTotal = amount + cgst + sgst;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Save to DB
      const invoiceData = {
        ...formData,
        cgst,
        sgst,
        grandTotal,
        particulars: 'Vehicle Rental Service',
      };
      await api.post('/invoices', invoiceData);

      // 2. Generate PDF
      const element = pdfRef.current;
      const opt = {
        margin:       0.5,
        filename:     `${formData.invoiceNo}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      // Temporarily make it visible for html2pdf to process properly if needed
      element.style.display = 'block';
      await html2pdf().set(opt).from(element).save();
      element.style.display = 'none';

      alert('Invoice created and PDF downloaded successfully!');
      onBack();
    } catch (error) {
      console.error(error);
      alert('Error creating invoice');
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
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Create Tax Invoice</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Generate a new vehicle rental invoice</p>
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
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">Amount (₹)</label>
              <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} placeholder="e.g. 4731250" className="w-full px-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" required />
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
              <span>₹{amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-1">
              <span>CGST (2.5%):</span>
              <span>₹{cgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-1">
              <span>SGST (2.5%):</span>
              <span>₹{sgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <span>Grand Total:</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors disabled:opacity-70">
            {loading ? 'Creating & Generating PDF...' : 'Create Invoice & Download PDF'}
          </button>
        </form>
      </div>

      {/* Hidden PDF Template */}
      <div style={{ display: 'none' }}>
        <div ref={pdfRef} style={{ padding: '30px', fontFamily: '"Times New Roman", Times, serif', color: '#000', backgroundColor: '#fff' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '26px' }}>
                 <div style={{ width: '22px', height: '26px', backgroundColor: '#0055b8' }}></div>
                 <div style={{ width: '0', height: '0', borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderBottom: '26px solid #0055b8' }}></div>
                 <div style={{ width: '22px', height: '26px', backgroundColor: '#0055b8' }}></div>
               </div>
               <div style={{ fontSize: '11px', color: '#00a4e4', fontWeight: 'bold', margin: '4px 0', letterSpacing: '1px' }}>SURYA CABS</div>
               <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-start', height: '26px' }}>
                 <div style={{ width: '22px', height: '26px', backgroundColor: '#0055b8' }}></div>
                 <div style={{ width: '0', height: '0', borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderTop: '26px solid #0055b8' }}></div>
                 <div style={{ width: '22px', height: '26px', backgroundColor: '#0055b8' }}></div>
               </div>
            </div>
            <div style={{ backgroundColor: '#0055b8', color: '#fff', padding: '10px 40px', letterSpacing: '4px', fontSize: '24px', marginTop: '20px', fontWeight: 'bold' }}>
              SURYA CABS AND LOGISTICS
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: '14px', marginBottom: '15px' }}>
            # 420: 7th Block 1st C.Cross Koramangala. Bangalore 560095.<br/>
            Contact No - 9980275630 / 9481354131 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Website: www.suryacabsandlogistics.com<br/>
            GSTNO : 29AFYFS0562E1ZH
          </div>

          <div style={{ border: '3px solid #000', width: '100%', fontSize: '13px', display: 'flex', flexDirection: 'column' }}>
             {/* TAX INVOICE */}
             <div style={{ textAlign: 'center', fontWeight: 'bold', borderBottom: '2px solid #000', padding: '8px', fontSize: '15px' }}>
                TAX INVOICE
             </div>

             {/* Top block: To ... Invoice Details */}
             <div style={{ display: 'flex', borderBottom: '2px solid #000' }}>
                <div style={{ width: '50%', borderRight: '2px solid #000', padding: '10px' }}>
                   To,<br/><br/>
                   <span style={{ fontWeight: 'bold' }}>{formData.customerName}</span><br/><br/>
                   {formData.customerAddress}
                </div>
                <div style={{ width: '50%' }}>
                   <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                      <div style={{ width: '50%', borderRight: '1px solid #000', padding: '6px' }}>Invoice Date :</div>
                      <div style={{ width: '50%', padding: '6px', fontWeight: 'bold' }}>{formData.invoiceDate}</div>
                   </div>
                   <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                      <div style={{ width: '50%', borderRight: '1px solid #000', padding: '6px' }}>Invoice No :</div>
                      <div style={{ width: '50%', padding: '6px', fontWeight: 'bold' }}>{formData.invoiceNo}</div>
                   </div>
                   <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                      <div style={{ width: '50%', borderRight: '1px solid #000', padding: '6px' }}>PAN No :</div>
                      <div style={{ width: '50%', padding: '6px', fontWeight: 'bold' }}>AFYFS0562E</div>
                   </div>
                   <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                      <div style={{ width: '50%', borderRight: '1px solid #000', padding: '6px' }}>GSTIN :</div>
                      <div style={{ width: '50%', padding: '6px', fontWeight: 'bold' }}>29AFYFS0562E1ZH</div>
                   </div>
                   <div style={{ display: 'flex' }}>
                      <div style={{ width: '50%', borderRight: '1px solid #000', padding: '6px' }}>Nature of Services:</div>
                      <div style={{ width: '50%', padding: '6px', fontWeight: 'bold' }}>Vehicle Rental Services</div>
                   </div>
                </div>
             </div>

             {/* Customer PAN / GSTIN */}
             <div style={{ display: 'flex', borderBottom: '2px solid #000' }}>
                <div style={{ width: '50%', borderRight: '2px solid #000' }}>
                   <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                      <div style={{ width: '50%', borderRight: '1px solid #000', padding: '6px' }}>Customer PAN No:</div>
                      <div style={{ width: '50%', padding: '6px' }}>{formData.customerPan}</div>
                   </div>
                   <div style={{ display: 'flex' }}>
                      <div style={{ width: '50%', borderRight: '1px solid #000', padding: '6px' }}>Customer GSTIN:</div>
                      <div style={{ width: '50%', padding: '6px' }}>{formData.customerGstin}</div>
                   </div>
                </div>
                <div style={{ width: '50%' }}></div>
             </div>

             {/* Address of Delivery & Date */}
             <div style={{ display: 'flex', borderBottom: '2px solid #000' }}>
                <div style={{ width: '50%', borderRight: '2px solid #000' }}>
                   <div style={{ display: 'flex', borderBottom: '1px solid #000', height: '50%' }}>
                      <div style={{ width: '50%', borderRight: '1px solid #000', padding: '6px' }}>Address of Delivery (City, State):</div>
                      <div style={{ width: '50%', padding: '6px' }}>{formData.deliveryCity.toUpperCase()}</div>
                   </div>
                   <div style={{ display: 'flex', height: '50%' }}>
                      <div style={{ width: '50%', borderRight: '1px solid #000', padding: '6px' }}>Customer Name :</div>
                      <div style={{ width: '50%', padding: '6px' }}>{formData.customerName}</div>
                   </div>
                </div>
                <div style={{ width: '50%', display: 'flex' }}>
                   <div style={{ width: '25%', borderRight: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>Date:</div>
                   <div style={{ width: '75%', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', borderBottom: '1px solid #000', flex: 1 }}>
                         <div style={{ width: '30%', borderRight: '1px solid #000', padding: '6px' }}>From</div>
                         <div style={{ width: '70%', padding: '6px', fontWeight: 'bold' }}>{formData.servicePeriodFrom}</div>
                      </div>
                      <div style={{ display: 'flex', flex: 1 }}>
                         <div style={{ width: '30%', borderRight: '1px solid #000', padding: '6px' }}>To</div>
                         <div style={{ width: '70%', padding: '6px', fontWeight: 'bold' }}>{formData.servicePeriodTo}</div>
                      </div>
                   </div>
                </div>
             </div>

             {/* Transportation Charges */}
             <div style={{ borderBottom: '2px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                Transportation Charges for the Month of {formData.servicePeriodFrom ? new Date(formData.servicePeriodFrom).toLocaleString('default', { month: 'long', year: 'numeric' }) : ''}
             </div>

             {/* Main Items Table Headers */}
             <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                <div style={{ width: '8%', borderRight: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>Sl No</div>
                <div style={{ width: '72%', borderRight: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>Particulars</div>
                <div style={{ width: '20%', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>AMOUNT</div>
             </div>
             
             {/* Main Items Row */}
             <div style={{ display: 'flex', borderBottom: '2px solid #000' }}>
                <div style={{ width: '8%', borderRight: '1px solid #000', padding: '40px 6px', textAlign: 'center' }}>1</div>
                <div style={{ width: '72%', borderRight: '1px solid #000', padding: '40px 6px', textAlign: 'center' }}>Vehicle Rental Service</div>
                <div style={{ width: '20%', padding: '40px 6px', textAlign: 'center' }}>{amount}</div>
             </div>

             {/* Bank Details Table Row 1 */}
             <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                <div style={{ width: '25%', borderRight: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>Bank Name :</div>
                <div style={{ width: '25%', borderRight: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>A/c No</div>
                <div style={{ width: '15%', borderRight: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>IFSC Code</div>
                <div style={{ width: '15%', borderRight: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>Total</div>
                <div style={{ width: '20%', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>{amount}</div>
             </div>
             
             {/* Bank Details Table Row 2 */}
             <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                <div style={{ width: '25%', borderRight: '1px solid #000', padding: '6px', textAlign: 'center' }}>{formData.bankName}</div>
                <div style={{ width: '25%', borderRight: '1px solid #000', padding: '6px', textAlign: 'center' }}>{formData.accountNo}</div>
                <div style={{ width: '15%', borderRight: '1px solid #000', padding: '6px', textAlign: 'center' }}>{formData.ifscCode}</div>
                <div style={{ width: '7.5%', borderRight: '1px solid #000', padding: '6px', textAlign: 'center' }}>CGST</div>
                <div style={{ width: '7.5%', borderRight: '1px solid #000', padding: '6px', textAlign: 'center' }}>2.5%</div>
                <div style={{ width: '20%', padding: '6px', textAlign: 'center' }}>{cgst}</div>
             </div>
             
             {/* Bank Details Table Row 3 (Amount in words + SGST + Grand Total) */}
             <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                <div style={{ width: '65%', borderRight: '1px solid #000', padding: '10px', textAlign: 'left', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                   Amount in words : {numberToWords(grandTotal)}
                </div>
                <div style={{ width: '15%', borderRight: '1px solid #000', display: 'flex', flexDirection: 'column' }}>
                   <div style={{ display: 'flex', borderBottom: '1px solid #000', flex: 1 }}>
                      <div style={{ width: '50%', borderRight: '1px solid #000', padding: '6px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>SGST</div>
                      <div style={{ width: '50%', padding: '6px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2.5%</div>
                   </div>
                   <div style={{ padding: '6px', textAlign: 'center', fontWeight: 'bold', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      Grand Total
                   </div>
                </div>
                <div style={{ width: '20%', display: 'flex', flexDirection: 'column' }}>
                   <div style={{ borderBottom: '1px solid #000', padding: '6px', textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {sgst}
                   </div>
                   <div style={{ padding: '6px', textAlign: 'center', fontWeight: 'bold', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {grandTotal}
                   </div>
                </div>
             </div>

             {/* Notes */}
             <div style={{ backgroundColor: '#ffff00', borderBottom: '2px solid #000', padding: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px' }}>
                Note : As per GST notification No. 22/2019 Central Tax (Rate) as Amended to original notification No.13/2017 Central Tax (Rate). GST is payable on reverse charge basis by the recipient of service.
             </div>

             {/* Terms and conditions */}
             <div style={{ padding: '10px', textAlign: 'left' }}>
                <div style={{ textDecoration: 'underline', fontSize: '13px', marginBottom: '6px', fontWeight: 'bold' }}>Terms and conditions:-</div>
                <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
                   1. All payment by NEFT / RTGS In favour of : SURYA CABS AND LOGISTICS<br/>
                   2. No claims and / or discrepancy if any shall be considered unless brought to the notice of the company in e-mail with in 3days of the receipt of the bill.<br/>
                   3. Dispute if any shall be subjected to the jurisdiction of Bangalore courts only<br/>
                   4. Company reserves the right to charge interest @ 18% P.M. on bills not as per the contract on payment terms.
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
