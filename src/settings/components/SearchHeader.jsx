import React from "react";
import { TextField, useTheme, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { useTranslation } from "../../common/components/LocalizationProvider";

export const filterByKeyword = (keyword) => (item) =>
  !keyword ||
  JSON.stringify(item).toLowerCase().includes(keyword.toLowerCase());

const useStyles = makeStyles((theme) => ({
  header: {
    position: "sticky",
    left: 0,
    display: "flex",
    alignItems: "stretch",
    gap: "1rem",
    padding: theme.spacing(3, 2, 2),
  },
}));

const SearchHeader = ({ keyword, setKeyword, children }) => {
  const classes = useStyles();
  const t = useTranslation();

  return (
    <div className={classes.header}>
      <TextField
        variant="outlined"
        placeholder={t("sharedSearch")}
        value={keyword}
        fullWidth={!children}
        onChange={(e) => setKeyword(e.target.value)}
      />
      {children}
    </div>
  );
};

export default SearchHeader;
