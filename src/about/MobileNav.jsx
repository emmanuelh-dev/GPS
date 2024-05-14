import React, { useState } from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import Button from "@mui/material/Button";
import headerNavLinks from "../../data/headerNavLinks";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    padding: theme.spacing(2),
  },
  overlay: {
    position: "fixed",
    left: 0,
    top: 0,
    zIndex: 10,
    height: "100%",
    width: "100%",
    backgroundColor:
      theme.palette.mode === "dark" ? "#374151" : "rgba(0, 0, 0, 0.4)",
    opacity: 0.95,
    transition: "transform 0.3s ease-in-out",
    transform: "translateX(100%)",
  },
  overlayVisible: {
    transform: "translateX(0)",
  },
  closeButton: {
    marginRight: theme.spacing(5),
    marginTop: theme.spacing(11),
    height: "2rem",
    width: "2rem",
    borderRadius: "50%",
  },
  navItem: {
    paddingLeft: theme.spacing(12),
    paddingRight: theme.spacing(12),
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    fontSize: "1.5rem",
    fontWeight: "bold",
    letterSpacing: "widest",
    color: theme.palette.mode === "dark" ? "#D1D5DB" : "#1F2937",
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: "1.2rem",
  },
  nav: {
    display: "flex",
    gap: theme.spacing(2),
  },
  navLink: {
    textDecoration: "none",
    color: "white",
    transition: "color 0.3s ease-in-out",
    "&:hover": {
      color: "lightgray",
    },
  },
}));

const MobileNav = () => {
  const [navShow, setNavShow] = useState(false);

  const onToggleNav = () => {
    setNavShow((status) => {
      if (status) {
        document.body.style.overflow = "auto";
      } else {
        // Prevent scrolling
        document.body.style.overflow = "hidden";
      }
      return !status;
    });
  };

  const classes = useStyles();
  return (
    <div className="sm:hidden">
      <Button
        type="button"
        variant="icon"
        className={classes.toggleButton}
        aria-label="Toggle Menu"
        onClick={onToggleNav}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="text-gray-900 dark:text-gray-100"
        >
          <path
            fillRule="evenodd"
            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </Button>
      <div
        className={`${classes.overlay} ${navShow ? classes.overlayVisible : ""}`}
      >
        <div>
          <Button
            type="button"
            variant="icon"
            className={classes.closeButton}
            aria-label="Toggle Menu"
            onClick={onToggleNav}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="text-gray-900 dark:text-gray-100"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Button>
        </div>
        <nav className="fixed mt-8 h-full">
          {headerNavLinks.map((link) => (
            <div key={link.title} className={classes.navItem}>
              <Link
                to={link.href}
                className={classes.navLink}
                onClick={onToggleNav}
                title={link.title}
              >
                {link.title}
              </Link>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default MobileNav;
