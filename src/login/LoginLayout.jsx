import React from 'react';
import { useMediaQuery, Paper } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { Helmet } from 'react-helmet';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    height: '100%',
  },
  sidebar: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: theme.palette.primary.main,
    paddingBottom: theme.spacing(5),
    width: theme.dimensions.sidebarWidth,
    [theme.breakpoints.down('lg')]: {
      width: theme.dimensions.sidebarWidthTablet,
    },
    [theme.breakpoints.down('sm')]: {
      width: '0px',
    },
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    boxShadow: '-2px 0px 16px rgba(0, 0, 0, 0.25)',
    [theme.breakpoints.up('lg')]: {
      padding: theme.spacing(0, 25, 0, 0),
    },
  },
  form: {
    maxWidth: theme.spacing(52),
    padding: theme.spacing(5),
    width: '100%',
  },
}));

const LoginLayout = ({ children }) => {
  const classes = useStyles();
  return (
    <main className={classes.root}>
      <Helmet>
        <meta charSet="utf-8" />
        <title>GPS Gonzher</title>
        <meta name="description" content="Con el GPS de Gonzher Monitorea y administra fácilmente tu fuerza móvil de trabajadores. Ten una vista de 360º en casi tiempo real de las maniobras diarias de tu flota, para reducir costos, aumentar la productividad, estar al día con el mantenimiento del vehículo y sacar el máximo provecho a cada día de trabajo." />

        <link rel="canonical" href="https://api.gonzher.com/" />

        <meta property="og:url" content="https://api.gonzher.com" />
        <meta property="og:title" content="Gonzher - Software de Logística y Facturación" />
        <meta property="og:description" content="Optimiza tu logística con el software de Gonzher. Facturación en línea, seguimiento de pedidos y más para transportistas." />
        <meta property="og:image" content="https://gonzher.com/og-image.png" />
        <meta property="og:image:width" content="800" />
        <meta property="og:image:height" content="600" />

        <meta name="twitter:title" content="Gonzher - " />
        <meta name="twitter:description" content="Optimiza procesos de transporte con nuestro software" />
        <meta name="twitter:image" content="https://gonzher.com/og-image.png" />
      </Helmet>
      <Paper className={classes.paper}>
        <form className={classes.form}>
          {children}
        </form>
      </Paper>
    </main>
  );
};

export default LoginLayout;
