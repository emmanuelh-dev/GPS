import React from 'react';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import { Grid, useMediaQuery, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
  },
  mainGrid: {
    display: 'flex',
    alignItems: 'center',
  },
  mainImage: {
    width: '100%',
    maxHeight: '600px',
    objectFit: 'cover',
  },
  mainGridText: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  section: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
}));

const Main = () => {
  const theme = useTheme();
  const classes = useStyles();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <>
      <Grid container spacing={2} className={classes.mainGrid}>
        <Grid item md={4} className={classes.mainGridText}>
          <Typography variant="h2">GPS Gonzher</Typography>
          <Typography variant="p">Ten el control de tus GPS en todo momento. Monitoreo en tiempo real.</Typography>
          <Link to="/login"><Button variant="contained">Inicia sesión</Button></Link>
        </Grid>
        <Grid item md={8}>
          <div>
            <img src="/static/devices.png" alt="Dashboard" className={classes.mainImage} />
          </div>
        </Grid>
      </Grid>

      <section className={classes.section}>
        <Typography variant="h3">Introducción:</Typography>
        <Typography variant="body1">¡Hola que tal! Somos tu asistente virtual diseñado exclusivamente para simplificar la vida de los transportistas. Desde el inicio del viaje hasta la facturación, Gonzher está aquí para acompañarte en cada paso del camino. Con soporte para la Carta Porte 3.0, una plataforma de GPS para monitoreo 24/7 y muchas más funciones específicas para el transporte, hemos creado Gonzher pensando en tus necesidades únicas.</Typography>
      </section>

      <section className={classes.section}>
        <Typography variant="h3">Características Destacadas:</Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Soporte para Carta Porte 3.0"
              secondary="Gonzher ha sido diseñado para cumplir con las últimas normativas, incluido el soporte completo para la Carta Porte 3.0. Simplifica tus trámites legales y asegura el cumplimiento normativo con facilidad."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Plataforma de GPS para Monitoreo 24/7"
              secondary="Mantén un control total sobre tu flota con nuestra plataforma de GPS integrada. Monitorea tus vehículos en tiempo real y garantiza la seguridad y eficiencia de tus operaciones."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Soporte en Tiempo Real"
              secondary="En Gonzher, no estarás solo. Ofrecemos soporte en tiempo real para resolver tus consultas y problemas de manera rápida y eficiente."
            />
          </ListItem>
        </List>
      </section>

      <section className={classes.section}>
        <Typography variant="h3">Explora la Documentación:</Typography>
        <Typography variant="body1">Esta documentación está diseñada para guiarte a través de todas las funciones de Gonzher. Encuentra tutoriales paso a paso, detalles sobre características específicas y consejos para optimizar tu experiencia. Ya seas un transportista experimentado o recién comenzando, estamos aquí para hacer tu vida más fácil.</Typography>
      </section>

      <footer>
        <Typography variant="body1">Gracias por confiar en Gonzher para simplificar tu experiencia de facturación y transporte. Si tienes preguntas o necesitas asistencia, nuestro equipo de soporte está listo para ayudarte.</Typography>
        <Button variant="contained">¡Comienza Ahora!</Button>
      </footer>
    </>
  );
};

export default Main;
