import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import CloseIcon from '@mui/icons-material/Close';
import FlashlightOnIcon from '@mui/icons-material/FlashlightOn';
import FlashlightOffIcon from '@mui/icons-material/FlashlightOff';
import BarcodeScanner from 'react-qr-barcode-scanner';
import { useTranslation } from '../../common/components/LocalizationProvider';

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(2),
    minHeight: '400px',
  },
  scannerContainer: {
    width: '100%',
    height: '300px',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: theme.spacing(1),
  },
  result: {
    marginTop: theme.spacing(2),
    width: '100%',
    textAlign: 'center',
  },
  torchButton: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
  },
}));

const BarcodeScannerDialog = ({ open, onClose, onScan, title }) => {
  const classes = useStyles();
  const t = useTranslation();
  const [data, setData] = useState('');
  const [torchOn, setTorchOn] = useState(false);
  const [stopStream, setStopStream] = useState(false);

  // Reiniciar el estado cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      setData('');
      setStopStream(false);
    }
  }, [open]);

  const handleClose = () => {
    // Detener la transmisión antes de cerrar para evitar que el navegador se congele
    setStopStream(true);
    setTimeout(() => {
      onClose();
    }, 100);
  };

  const handleScan = () => {
    if (data) {
      onScan(data);
      handleClose();
    }
  };

  const toggleTorch = () => {
    setTorchOn(!torchOn);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="barcode-scanner-dialog-title"
    >
      <DialogTitle id="barcode-scanner-dialog-title">
        {title || t('deviceScanBarcode', 'Escanear código')}
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Box className={classes.scannerContainer}>
          <IconButton
            className={classes.torchButton}
            onClick={toggleTorch}
            color="primary"
            aria-label="toggle flashlight"
          >
            {torchOn ? <FlashlightOnIcon /> : <FlashlightOffIcon />}
          </IconButton>
          <BarcodeScanner
            width="100%"
            height="100%"
            torch={torchOn}
            facingMode="environment"
            delay={500}
            onUpdate={(err, result) => {
              if (result) {
                setData(result.text);
              }
            }}
            stopStream={stopStream}
          />
        </Box>
        {data && (
          <Typography variant="body1" className={classes.result}>
            {t('deviceScannedCode', 'Código escaneado')}: {data}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('sharedCancel', 'Cancelar')}</Button>
        <Button
          onClick={handleScan}
          color="primary"
          variant="contained"
          disabled={!data}
        >
          {t('sharedUse', 'Usar')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BarcodeScannerDialog;