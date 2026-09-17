import React, { forwardRef } from 'react';

function numberToWords(num) {
    if (num === 0 || !num) return "Zero Rupees only.";
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

const InvoiceTemplate = forwardRef(({ invoice, calculatedValues }, ref) => {
  // Use calculated values if provided (during creation), else use saved DB values
  const amount = calculatedValues?.amount ?? parseFloat(invoice.amount) ?? 0;
  const cgst = calculatedValues?.cgst ?? invoice.cgst ?? 0;
  const sgst = calculatedValues?.sgst ?? invoice.sgst ?? 0;
  const grandTotal = calculatedValues?.grandTotal ?? invoice.grandTotal ?? 0;
  const isGstApplied = invoice.applyGst !== 'no';

  // Fallbacks for older invoices that didn't have these fields saved in DB
  const bankName = invoice.bankName || 'KOTAK MAHINDRA BANK';
  const accountNo = invoice.accountNo || '8751183874';
  const ifscCode = invoice.ifscCode || 'KKBK0008045';

  return (
    <div ref={ref} style={{ padding: '30px', fontFamily: '"Times New Roman", Times, serif', color: '#000', backgroundColor: '#fff', width: '800px', margin: '0 auto' }}>
      
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
                <span style={{ fontWeight: 'bold' }}>{invoice.customerName}</span><br/><br/>
                <div style={{ whiteSpace: 'pre-wrap' }}>{invoice.customerAddress}</div>
            </div>
            <div style={{ width: '50%' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                  <div style={{ width: '50%', borderRight: '1px solid #000', padding: '6px' }}>Invoice Date :</div>
                  <div style={{ width: '50%', padding: '6px', fontWeight: 'bold' }}>{invoice.invoiceDate}</div>
                </div>
                <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                  <div style={{ width: '50%', borderRight: '1px solid #000', padding: '6px' }}>Invoice No :</div>
                  <div style={{ width: '50%', padding: '6px', fontWeight: 'bold' }}>{invoice.invoiceNo}</div>
                </div>
                <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                  <div style={{ width: '50%', borderRight: '1px solid #000', padding: '6px' }}>PAN No :</div>
                  <div style={{ width: '50%', padding: '6px', fontWeight: 'bold' }}>AFYFS0562E</div>
                </div>
                <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                  <div style={{ width: '50%', borderRight: '1px solid #000', padding: '6px' }}>GSTIN :</div>
                  <div style={{ width: '50%', padding: '6px', fontWeight: 'bold' }}>29AFYFS0562E1ZH</div>
                </div>
                <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                  <div style={{ width: '50%', borderRight: '1px solid #000', padding: '6px' }}>Nature of Services:</div>
                  <div style={{ width: '50%', padding: '6px', fontWeight: 'bold' }}>Vehicle Rental Services</div>
                </div>
                <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                  <div style={{ width: '50%', borderRight: '1px solid #000', padding: '6px' }}>Service Account Code (SAC No)</div>
                  <div style={{ width: '50%', padding: '6px', fontWeight: 'bold' }}>{invoice.sacNo || '996601'}</div>
                </div>
                <div style={{ display: 'flex' }}>
                  <div style={{ width: '50%', borderRight: '1px solid #000', padding: '6px' }}>REVERSE CHARGE APPLICABLE (Yes/No)</div>
                  <div style={{ width: '50%', padding: '6px', fontWeight: 'bold' }}>{invoice.reverseCharge || 'no'}</div>
                </div>
            </div>
          </div>

          {/* Customer PAN / GSTIN */}
          <div style={{ display: 'flex', borderBottom: '2px solid #000' }}>
            <div style={{ width: '50%', borderRight: '2px solid #000' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                  <div style={{ width: '50%', borderRight: '1px solid #000', padding: '6px' }}>Customer PAN No:</div>
                  <div style={{ width: '50%', padding: '6px' }}>{invoice.customerPan}</div>
                </div>
                <div style={{ display: 'flex' }}>
                  <div style={{ width: '50%', borderRight: '1px solid #000', padding: '6px' }}>Customer GSTIN:</div>
                  <div style={{ width: '50%', padding: '6px' }}>{invoice.customerGstin}</div>
                </div>
            </div>
            <div style={{ width: '50%' }}></div>
          </div>

          {/* Address of Delivery & Date */}
          <div style={{ display: 'flex', borderBottom: '2px solid #000' }}>
            <div style={{ width: '50%', borderRight: '2px solid #000' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid #000', height: '50%' }}>
                  <div style={{ width: '50%', borderRight: '1px solid #000', padding: '6px' }}>Address of Delivery (City, State):</div>
                  <div style={{ width: '50%', padding: '6px' }}>{invoice.deliveryCity?.toUpperCase()}</div>
                </div>
                <div style={{ display: 'flex', height: '50%' }}>
                  <div style={{ width: '50%', borderRight: '1px solid #000', padding: '6px' }}>Customer Name :</div>
                  <div style={{ width: '50%', padding: '6px' }}>{invoice.customerName}</div>
                </div>
            </div>
            <div style={{ width: '50%', display: 'flex' }}>
                <div style={{ width: '25%', borderRight: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>Date:</div>
                <div style={{ width: '75%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', borderBottom: '1px solid #000', flex: 1 }}>
                      <div style={{ width: '30%', borderRight: '1px solid #000', padding: '6px' }}>From</div>
                      <div style={{ width: '70%', padding: '6px', fontWeight: 'bold' }}>{invoice.servicePeriodFrom}</div>
                  </div>
                  <div style={{ display: 'flex', flex: 1 }}>
                      <div style={{ width: '30%', borderRight: '1px solid #000', padding: '6px' }}>To</div>
                      <div style={{ width: '70%', padding: '6px', fontWeight: 'bold' }}>{invoice.servicePeriodTo}</div>
                  </div>
                </div>
            </div>
          </div>

          {/* Transportation Charges */}
          <div style={{ borderBottom: '2px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
            Transportation Charges for the Month of {invoice.servicePeriodFrom ? new Date(invoice.servicePeriodFrom).toLocaleString('default', { month: 'long', year: 'numeric' }) : ''}
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
            <div style={{ width: '20%', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>{amount.toFixed(2)}</div>
          </div>
          
          {/* Bank Details Table Row 2 */}
          <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
            <div style={{ width: '25%', borderRight: '1px solid #000', padding: '6px', textAlign: 'center' }}>{bankName}</div>
            <div style={{ width: '25%', borderRight: '1px solid #000', padding: '6px', textAlign: 'center' }}>{accountNo}</div>
            <div style={{ width: '15%', borderRight: '1px solid #000', padding: '6px', textAlign: 'center' }}>{ifscCode}</div>
            <div style={{ width: '7.5%', borderRight: '1px solid #000', padding: '6px', textAlign: 'center' }}>CGST</div>
            <div style={{ width: '7.5%', borderRight: '1px solid #000', padding: '6px', textAlign: 'center' }}>{isGstApplied ? '2.5%' : '0%'}</div>
            <div style={{ width: '20%', padding: '6px', textAlign: 'center' }}>{cgst.toFixed(2)}</div>
          </div>
          
          {/* Bank Details Table Row 3 (Amount in words + SGST + Grand Total) */}
          <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
            <div style={{ width: '65%', borderRight: '1px solid #000', padding: '10px', textAlign: 'left', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                Amount in words : {numberToWords(grandTotal)}
            </div>
            <div style={{ width: '15%', borderRight: '1px solid #000', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid #000', flex: 1 }}>
                  <div style={{ width: '50%', borderRight: '1px solid #000', padding: '6px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>SGST</div>
                  <div style={{ width: '50%', padding: '6px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{isGstApplied ? '2.5%' : '0%'}</div>
                </div>
                <div style={{ padding: '6px', textAlign: 'center', fontWeight: 'bold', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Grand Total
                </div>
            </div>
            <div style={{ width: '20%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ borderBottom: '1px solid #000', padding: '6px', textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {sgst.toFixed(2)}
                </div>
                <div style={{ padding: '6px', textAlign: 'center', fontWeight: 'bold', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {grandTotal.toFixed(2)}
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
  );
});

export default InvoiceTemplate;
