import React from "react";
import { useTranslation } from "../common/components/LocalizationProvider";
import { useNavigate } from "react-router-dom";
import { useManager } from "../common/util/permissions";
import { Grid, Card, CardContent, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(3),
    paddingTop: theme.spacing(8),
    maxWidth: '1000px',
    margin: '0 auto',
  },
  card: {
    height: '100%',
    borderColor: '#0dd3ba',
    backgroundColor: '#cff6f1',
    color: '#000',
    borderWidth: 1,
    borderStyle: 'solid',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'scale(1.02)',
    },
  },
  gridItem: {
    padding: theme.spacing(1),
  },
  cardContent: {
    textAlign: 'center',
    padding: theme.spacing(3),
    width: '100%',
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing(4),
  },
}));

const HomePage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();
  const manager = useManager();
  
  const baseMenuItems = [
    { title: 'Mapa', path: '/' },
    { title: 'Dispositivos', path: '/settings/devices' },
    { title: 'Reporte Geozonas', path: '/reports/geofence' },
    { title: 'Notificaciones', path: '/settings/notifications' },
    { title: 'Geozonas', path: '/geofences' },
    { title: 'Usuarios', path: '/settings/users' },
  ];
  
  const menuItems = manager
    ? [{ title: 'Dashboard', path: '/settings/dashboard' }, ...baseMenuItems]
    : baseMenuItems;
    
  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <div className={classes.container}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h4" component="h1" className={classes.title}>
              Panel de Control
            </Typography>
          </Grid>
          
          {menuItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.path} className={classes.gridItem}>
              <Card 
                className={classes.card}
                onClick={() => navigate(item.path)}
              >
                <CardContent className={classes.cardContent}>
                  <Typography variant="h6" component="h2" className="title">
                    {item.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
    </div>
  );
};

export default HomePage;