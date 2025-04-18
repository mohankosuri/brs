import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { FaFileUpload, FaSyncAlt } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';

const ReconcileTool = () => {
  const [companyData, setCompanyData] = useState([]);
  const [vendorData, setVendorData] = useState([]);
  const [result, setResult] = useState({ matched: [], companyOnly: [], vendorOnly: [] });

  const normalizeEntry = (entry) => {
    const normalized = { ...entry };

    // Normalize date: take only yyyy-mm-dd
    if (normalized.Date) {
      const date = new Date(normalized.Date);
      if (!isNaN(date)) {
        normalized.Date = date.toISOString().split('T')[0];
      }
    }

    // Normalize amount: convert to number
    if (normalized.Amount) {
      normalized.Amount = parseFloat(normalized.Amount.toString().replace(/[^0-9.-]+/g, ''));
    }

    // Normalize description: trim and lowercase
    if (normalized.Description) {
      normalized.Description = normalized.Description.toString().trim().toLowerCase();
    }

    // Normalize invoice number: trim and lowercase (optional depending on data format)
    if (normalized.InvoiceNumber) {
      normalized.InvoiceNumber = normalized.InvoiceNumber.toString().trim().toLowerCase();
    }

    return normalized;
  };

  const parseFile = (file, callback) => {
    const reader = new FileReader();
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    reader.onload = (e) => {
      if (isExcel) {
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

        const parsedData = rawData.map(row => {
          const formattedRow = { ...row };
          for (const key in formattedRow) {
            if (!isNaN(formattedRow[key]) && key.toLowerCase().includes('date')) {
              const excelDate = Number(formattedRow[key]);
              const jsDate = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
              formattedRow[key] = jsDate.toISOString().split('T')[0];
            }
          }
          return formattedRow;
        });

        callback(parsedData);
      } else {
        Papa.parse(file, {
          header: true,
          complete: (results) => callback(results.data),
        });
      }
    };

    if (isExcel) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleCompanyUpload = (e) => {
    const file = e.target.files[0];
    parseFile(file, setCompanyData);
  };

  const handleVendorUpload = (e) => {
    const file = e.target.files[0];
    parseFile(file, setVendorData);
  };

  const reconcile = () => {
    const matched = [];
    const vendorRemaining = vendorData.map(normalizeEntry);
    const companyRemaining = [];

    companyData.forEach((c) => {
      const normalizedC = normalizeEntry(c);

      const matchIndex = vendorRemaining.findIndex(v =>
        v.Date === normalizedC.Date &&
        v.Amount === normalizedC.Amount &&
         
        (v.InvoiceNumber === normalizedC.InvoiceNumber || (!v.InvoiceNumber && !normalizedC.InvoiceNumber))
      );

      if (matchIndex !== -1) {
        matched.push(c);
        vendorRemaining.splice(matchIndex, 1);
      } else {
        companyRemaining.push(c);
      }
    });

    setResult({
      matched,
      companyOnly: companyRemaining,
      vendorOnly: vendorRemaining
    });
  };

  const resetAll = () => {
    setCompanyData([]);
    setVendorData([]);
    setResult({ matched: [], companyOnly: [], vendorOnly: [] });
  };

  const renderTable = (data) => (
    <div className="overflow-x-auto rounded-md border border-gray-200">
      <table className="min-w-full text-sm text-left text-gray-700">
        <thead className="bg-gray-100 text-gray-800 font-medium">
          <tr>
            {Object.keys(data[0] || {}).map((key) => (
              <th key={key} className="px-4 py-2">{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t">
              {Object.values(row).map((val, j) => (
                <td key={j} className="px-4 py-2">{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
     <div className='flex justify-end'> <NavLink to={'/'}><button className='bg-red-600 py-2 px-4 text-white rounded full font-semibold '>Home</button></NavLink></div> 
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">📊 Bank Reconciliation Tool</h1>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow rounded-lg p-4 border">
          <label className="block text-gray-600 font-semibold mb-2">📁 Upload Company Ledger</label>
          <input type="file" accept=".csv,.xlsx" onChange={handleCompanyUpload} className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200" />
        </div>

        <div className="bg-white shadow rounded-lg p-4 border">
          <label className="block text-gray-600 font-semibold mb-2">📁 Upload Vendor Ledger</label>
          <input type="file" accept=".csv,.xlsx" onChange={handleVendorUpload} className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-green-100 file:text-green-700 hover:file:bg-green-200" />
        </div>

        <div className="flex items-end space-x-2">
          <button
            onClick={reconcile}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg shadow hover:bg-indigo-700 transition"
          >
            Reconcile
          </button>
          <button
            onClick={resetAll}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg shadow hover:bg-indigo-700 transition"
          >
            <FaSyncAlt /> Reset
          </button>
        </div>
      </div>

      {result.matched.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-green-700 mb-3">✅ Matched Entries</h2>
          {renderTable(result.matched)}
        </div>
      )}

      {result.companyOnly.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-yellow-700 mb-3">📙 Only in Company Ledger</h2>
          {renderTable(result.companyOnly)}
        </div>
      )}

      {result.vendorOnly.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-red-700 mb-3">📕 Only in Vendor Ledger</h2>
          {renderTable(result.vendorOnly)}
        </div>
      )}
    </div>
  );
};

export default ReconcileTool;
