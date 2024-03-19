import React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { useMediaQuery, useTheme } from '@mui/material';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
  },
  title: {
    fontSize: '3rem',
  },
}));
const Header = () => {
  const theme = useTheme();
  const classes = useStyles();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  return (
    <header>
      <nav>
        <div>GPS GONZHER</div>
        {desktop ? (
          <ul>
            <li>
              <a href="https://gonzher.com">Inicio</a>
            </li>
            <li>
              <Link to="/login">Log In</Link>
            </li>
            <li>
              <a href="https://system.gonzher.com">Sistea Gonzher</a>
            </li>
            <li>
              <a href="https://docs.gonzher.com">Documentacion</a>
            </li>
          </ul>
        ) : (
          <Header />
        )}
      </nav>
    </header>
  );
};

export default Header;
