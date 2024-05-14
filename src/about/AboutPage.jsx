import React from "react";
import { makeStyles } from "@mui/styles";
import { useMediaQuery, useTheme } from "@mui/material";
import Header from "./Header";
import Main from "./Main";
import MobileNav from "./MobileNav";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    padding: theme.spacing(2),
  },
}));

const AboutPage = () => {
  const theme = useTheme();
  const classes = useStyles();
  const desktop = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <div className={classes.container}>
      <Header />
      <Main />
    </div>
  );
};

export default AboutPage;
