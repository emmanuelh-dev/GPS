import React from 'react';
import { Card, CardMedia, Typography, Box, IconButton, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PhoneIcon from '@mui/icons-material/Phone';

const useStyles = makeStyles((theme) => ({
  media: {
    height: 280,
    backgroundSize: 'cover',
  },
  content: {
    padding: theme.spacing(2),
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  dangerLevel: {
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
    color: 'white',
    display: 'inline-block',
    fontWeight: 'bold',
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
  }
}));

// Datos de ejemplo
const personData = {
  photo: "https://randomuser.me/api/portraits/men/1.jpg", // URL de ejemplo
  fullName: "Carlos Ramírez Mendoza",
  age: 34,
  dangerLevel: "Alto",
  location: "Av. Insurgentes Sur 1234, Col. Del Valle, CDMX",
  directPhone: "(55) 1234-5678",
  contactPhone: "(55) 8765-4321"
};

export const PersonCard = ({device}) => {
  const classes = useStyles();

  const getDangerLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case 'alto':
        return '#dc3545';
      case 'medio':
        return '#ffc107';
      case 'bajo':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };
  const deviceImage = device?.attributes?.deviceImage;

  return (
    <Card>
      {deviceImage ? (
        <CardMedia
          className={classes.media}
          image={`/api/media/${device.uniqueId}/${deviceImage}`}
        >
        </CardMedia>
      ) : (
        <>
        
        </>
      )}
      <Box className={classes.content}>
        <Typography variant="h5" gutterBottom style={{ color: '#2c3e50', fontWeight: 'bold' }}>
          {personData.fullName}
        </Typography>

        <div className={classes.infoRow}>
          <Typography variant="body1">
            <span className={classes.label}>Edad:</span> {personData.age} años
          </Typography>
          <Typography
            variant="body2"
            style={{
              backgroundColor: getDangerLevelColor(personData.dangerLevel),
            }}
            className={classes.dangerLevel}
          >
            Nivel {personData.dangerLevel}
          </Typography>
        </div>

        <Typography variant="body1" gutterBottom style={{ marginTop: '10px' }}>
          <span className={classes.label}>Ubicación:</span><br />
          {personData.location}
        </Typography>

        <Typography variant="body1" gutterBottom style={{ marginTop: '10px' }}>
          <span className={classes.label}>Tel. Directo:</span><br />
          <Button
            href={`tel:${personData.directPhone.replace(/[\s()-]/g, '')}`}
            startIcon={<PhoneIcon />}
            variant="contained"
            size="small"
            style={{ marginTop: '4px' }}
          >
            Llamar Directo
          </Button>
        </Typography>

        <Typography variant="body1" style={{ marginTop: '10px' }}>
          <span className={classes.label}>Tel. Contacto:</span><br />
          <Button
            href={`tel:${personData.contactPhone.replace(/[\s()-]/g, '')}`}
            startIcon={<PhoneIcon />}
            variant="contained"
            size="small"
            style={{ marginTop: '4px' }}
          >
            Llamar Contacto
          </Button>
        </Typography>
      </Box>
    </Card>
  );
};
