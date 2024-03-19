import React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { useMediaQuery, useTheme } from '@mui/material';
import MobileNav from './MobileNav';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: '2rem',
  },
  nav: {
    display: 'flex',
    gap: theme.spacing(2),
  },
  navItem: {
    textDecoration: 'none',
    color: 'white',
    transition: 'color 0.3s ease-in-out',
    '&:hover': {
      color: 'lightgray',
    },
  },
}));
const Header = () => {
  const theme = useTheme();
  const classes = useStyles();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  return (
    <header className={classes.header}>
      <div className={classes.title}>GPS GONZHER</div>
      <nav className={classes.nav}>
        {desktop ? (
          <>
            <a className={classes.navItem} href="https://gonzher.com">Inicio</a>
            <Link className={classes.navItem} to="/login">Log In</Link>
            <a className={classes.navItem} href="https://system.gonzher.com">Sistema Gonzher</a>
            <a className={classes.navItem} href="https://docs.gonzher.com">Documentacion</a>
          </>
        ) : (
          <MobileNav />
        )}
      </nav>
    </header>
  );
};

export default Header;
