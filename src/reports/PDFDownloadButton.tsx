import React, { useCallback, useState } from 'react';
import * as XLSX from 'xlsx';
import { CircularProgress, IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { Position } from '../../types';

interface PDFDownloadButtonProps {
  positions: Position[];
  deviceName: string;
}

const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({ positions, deviceName }) => {

  const [generando, setGenerando] = useState(false);

  const handleDownload = useCallback(() => {
    setGenerando(true);
    const totalPositions = positions.length;

    // Prepare table data
    const tableData = positions.map(position => ({
      'KM/H': String(position.speed),
      'Fecha/Hora': new Date(position.fixTime).toLocaleString(),
      'Lat, Lon': `${position.latitude}, ${position.longitude}`,
      'Temp': position.attributes.bleTemp1 ?
        `${Math.round(position.attributes.bleTemp1)}° / ${Math.round((Math.round(position.attributes.bleTemp1) * (9 / 5)) + 32)}°` :
        '',
      'Km': String(position.attributes.totalDistance)
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Historial');

    // Write to file
    XLSX.writeFile(workbook, `Reporte ${new Date(positions[0].fixTime).toLocaleString()} - ${new Date(positions[positions.length - 1].fixTime).toLocaleString()}.xlsx`);
    setGenerando(false);
  }, [positions, deviceName]);

  return (
    <IconButton onClick={handleDownload} disabled={generando}>
      {generando ? <CircularProgress /> : <DownloadIcon />}
    </IconButton>
  );
};

export default PDFDownloadButton;
