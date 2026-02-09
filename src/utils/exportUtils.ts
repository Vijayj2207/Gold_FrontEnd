import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { User, Deposit, Payment } from '@/types';

interface ExportData {
  user: User;
  deposits: Deposit[];
  getDepositPayments: (depositId: string) => Payment[];
}

export const exportToPDF = ({ user, deposits, getDepositPayments }: ExportData) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Customer Profile Report', 14, 20);
  
  // Customer Info
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  doc.text(`Name: ${user.name}`, 14, 35);
  doc.text(`Mobile: ${user.mobile}`, 14, 42);
  doc.text(`Address: ${user.address || 'N/A'}`, 14, 49);
  doc.text(`Total Gold Weight: ${user.totalGoldWeight.toFixed(3)}g`, 14, 56);
  doc.text(`Report Date: ${new Date().toLocaleDateString('en-IN')}`, 14, 63);
  
  let yPos = 75;
  
  // Deposits Table
  if (deposits.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Deposits Summary', 14, yPos);
    
    const depositRows = deposits.map(d => [
      d.depositId,
      new Date(d.createdAt).toLocaleDateString('en-IN'),
      `₹${d.amount.toLocaleString('en-IN')}`,
      `${d.goldWeight.toFixed(3)}g`,
      `₹${d.goldRateAtDeposit.toLocaleString('en-IN')}/g`,
      d.status
    ]);
    
    autoTable(doc, {
      startY: yPos + 5,
      head: [['Deposit ID', 'Date', 'Amount', 'Gold Weight', 'Rate', 'Status']],
      body: depositRows,
      theme: 'striped',
      headStyles: { fillColor: [212, 175, 55] },
      styles: { fontSize: 9 }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }
  
  // Payments by Deposit
  deposits.forEach((deposit, index) => {
    const payments = getDepositPayments(deposit.depositId);
    if (payments.length > 0) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      doc.text(`Payments for ${deposit.depositId}`, 14, yPos);
      
      const paymentRows = payments.map(p => [
        new Date(p.date).toLocaleDateString('en-IN'),
        p.time,
        p.paymentMode.toUpperCase(),
        `₹${p.amount.toLocaleString('en-IN')}`
      ]);
      
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      paymentRows.push(['', '', 'Total', `₹${totalPaid.toLocaleString('en-IN')}`]);
      
      autoTable(doc, {
        startY: yPos + 5,
        head: [['Date', 'Time', 'Mode', 'Amount']],
        body: paymentRows,
        theme: 'grid',
        headStyles: { fillColor: [100, 100, 100] },
        styles: { fontSize: 8 }
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 10;
    }
  });
  
  // Total Summary
  const totalPayments = deposits.reduce((sum, deposit) => {
    const payments = getDepositPayments(deposit.depositId);
    return sum + payments.reduce((pSum, p) => pSum + p.amount, 0);
  }, 0);
  
  if (yPos > 270) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text(`Total Gold Weight: ${user.totalGoldWeight.toFixed(3)}g`, 14, yPos + 10);
  doc.text(`Total Payments: ₹${totalPayments.toLocaleString('en-IN')}`, 14, yPos + 18);
  
  doc.save(`${user.name.replace(/\s+/g, '_')}_report.pdf`);
};

export const exportToExcel = ({ user, deposits, getDepositPayments }: ExportData) => {
  const workbook = XLSX.utils.book_new();
  
  // Customer Info Sheet
  const customerData = [
    ['Customer Profile Report'],
    [],
    ['Name', user.name],
    ['Mobile', user.mobile],
    ['Address', user.address || 'N/A'],
    ['Total Gold Weight', `${user.totalGoldWeight.toFixed(3)}g`],
    ['Report Date', new Date().toLocaleDateString('en-IN')],
  ];
  const customerSheet = XLSX.utils.aoa_to_sheet(customerData);
  XLSX.utils.book_append_sheet(workbook, customerSheet, 'Customer Info');
  
  // Deposits Sheet
  const depositsData = [
    ['Deposit ID', 'Date', 'Amount', 'Gold Weight', 'Gold Rate', 'Status'],
    ...deposits.map(d => [
      d.depositId,
      new Date(d.createdAt).toLocaleDateString('en-IN'),
      d.amount,
      d.goldWeight.toFixed(3),
      d.goldRateAtDeposit,
      d.status
    ])
  ];
  const depositsSheet = XLSX.utils.aoa_to_sheet(depositsData);
  XLSX.utils.book_append_sheet(workbook, depositsSheet, 'Deposits');
  
  // Payments Sheet
  const allPayments: any[][] = [
    ['Deposit ID', 'Date', 'Time', 'Payment Mode', 'Amount']
  ];
  
  deposits.forEach(deposit => {
    const payments = getDepositPayments(deposit.depositId);
    payments.forEach(p => {
      allPayments.push([
        deposit.depositId,
        new Date(p.date).toLocaleDateString('en-IN'),
        p.time,
        p.paymentMode.toUpperCase(),
        p.amount
      ]);
    });
  });
  
  const paymentsSheet = XLSX.utils.aoa_to_sheet(allPayments);
  XLSX.utils.book_append_sheet(workbook, paymentsSheet, 'Payments');
  
  // Summary Sheet
  const totalPayments = deposits.reduce((sum, deposit) => {
    const payments = getDepositPayments(deposit.depositId);
    return sum + payments.reduce((pSum, p) => pSum + p.amount, 0);
  }, 0);
  
  const summaryData = [
    ['Summary'],
    [],
    ['Total Deposits', deposits.length],
    ['Total Gold Weight', `${user.totalGoldWeight.toFixed(3)}g`],
    ['Total Payments', totalPayments],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  XLSX.writeFile(workbook, `${user.name.replace(/\s+/g, '_')}_report.xlsx`);
};
