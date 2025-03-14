import React, { useCallback, useState } from 'react';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { CircularProgress, IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

interface Alert {
  id: number;
  eventId: number;
  deviceId: number;
  type: string;
  alertTime: string;
}

interface Device {
  id: number;
  name: string;
}

interface PDFAlertsButtonProps {
  alerts: Alert[];
  devices: { [key: number]: Device };
  formatAlertMessage: (alert: Alert, device: Device) => string;
}

const PDFAlertsButton: React.FC<PDFAlertsButtonProps> = ({ alerts, devices, formatAlertMessage }) => {
  const [generando, setGenerando] = useState(false);

  const handleDownload = useCallback(() => {
    setGenerando(true);
    const doc = new jsPDF();
    const totalAlerts = alerts.length;

    // Add text-based logo
    doc.setFontSize(24);
    doc.setTextColor(0, 0, 255);
    doc.addImage('/1.png', 'PNG', 10, 10, 20, 20);
    doc.setTextColor(0, 0, 0);

    // Add title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Reporte de Alertas", 35, 20);

    // Add subtitle
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`${totalAlerts} Alertas.`, 10, 40);

    // Add date range
    const pageWidth = doc.internal.pageSize.width;
    if (alerts.length > 0) {
      doc.text(`${new Date(alerts[0].alertTime).toLocaleString()}`, pageWidth - 10, 40, { align: 'right' });
      doc.text("al", pageWidth - 10, 46, { align: 'right' });
      doc.text(`${new Date(alerts[alerts.length - 1].alertTime).toLocaleString()}`, pageWidth - 10, 52, { align: 'right' });
    }

    // Prepare table data
    const tableData = alerts.map(alert => [
      devices[alert.deviceId]?.name || 'Desconocido',
      alert.type || 'N/A',
      formatAlertMessage(alert, devices[alert.deviceId]),
      new Date(alert.alertTime).toLocaleString()
    ]);

    // Add table
    autoTable(doc, {
      head: [['Dispositivo', 'Tipo', 'Mensaje', 'Fecha/Hora']],
      body: tableData,
      startY: 60,
      styles: { fontSize: 8, cellPadding: 1 },
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
    });

    // Add page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`${i} / ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
    }

    doc.save(`Alertas ${new Date().toLocaleString()}.pdf`);
    setGenerando(false);
  }, [alerts, devices, formatAlertMessage]);

  return (
    <IconButton onClick={handleDownload} disabled={generando}>
      {generando ? <CircularProgress /> : <DownloadIcon />}
    </IconButton>
  );
};

export default PDFAlertsButton;