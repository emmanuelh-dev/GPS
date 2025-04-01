import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  InputLabel,
  Checkbox,
  TableFooter,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import LinkIcon from "@mui/icons-material/Link";
import { useCatch, useEffectAsync } from "../reactHelper";
import { formatBoolean, formatTime } from "../common/util/formatter";
import { useTranslation } from "../common/components/LocalizationProvider";
import PageLayout from "../common/components/PageLayout";
import SettingsMenu from "./components/SettingsMenu";
import CollectionFab from "./components/CollectionFab";
import CollectionActions from "./components/CollectionActions";
import TableShimmer from "../common/components/TableShimmer";
import { useAdministrator, useManager } from "../common/util/permissions";
import SearchHeader, { filterByKeyword } from "./components/SearchHeader";
import { usePreference } from "../common/util/preferences";
import useSettingsStyles from "./common/useSettingsStyles";

const UsersPage = () => {
  const classes = useSettingsStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const manager = useManager();

  const hours12 = usePreference("twelveHourFormat");

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showID, setShowID] = useState(false);
  const [temporary, setTemporary] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // Opciones: 'id', 'name', 'email'

  const [selectedUserTypes, setSelectedUserTypes] = useState({
    cliente: false,
    espejo: false,
  });
  const handleLogin = useCatch(async (userId) => {
    const response = await fetch(`/api/session/${userId}`);
    if (response.ok) {
      window.location.replace("/");
    } else {
      throw Error(await response.text());
    }
  });
  const handleCheckboxChange = (userType) => {
    setSelectedUserTypes((prevSelectedUserTypes) => ({
      ...prevSelectedUserTypes,
      [userType]: !prevSelectedUserTypes[userType],
    }));
  };

  const actionLogin = {
    key: "login",
    title: t("loginLogin"),
    icon: <LoginIcon fontSize="small" />,
    handler: handleLogin,
  };

  const actionConnections = {
    key: "connections",
    title: t("sharedConnections"),
    icon: <LinkIcon fontSize="small" />,
    handler: (userId) => navigate(`/settings/user/${userId}/connections`),
  };
  const filterByUserType = (item) => {
    const { cliente, espejo, administrador } = selectedUserTypes;
    if (!cliente && !espejo && !administrador) return true;
    return (
      (cliente && item.attributes.cliente) ||
      (espejo && item.attributes.espejo) ||
      (administrador && item.attributes.administrador)
    );
  };

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        setItems(await response.json());
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  }, [timestamp]);

  const admin = useAdministrator();

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={["settingsTitle", "settingsUsers"]}
    >
      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword}>
        <FormControl variant="outlined" style={{ minWidth: 120 }}>
          <InputLabel id="sort-by-label">{t("sharedSortBy")}</InputLabel>
          <Select
            labelId="sort-by-label"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            label={t("sharedSortBy")}
            size="small"
          >
            <MenuItem value="id">ID</MenuItem>
            <MenuItem value="name">{t("sharedName")}</MenuItem>
            <MenuItem value="email">{t("userEmail")}</MenuItem>
          </Select>
        </FormControl>
        {admin && (
          <>
            <InputLabel>
              ID
              <Checkbox checked={showID} onChange={() => setShowID(!showID)} />
            </InputLabel>
            <InputLabel>
              Clientes
              <Checkbox
                checked={handleCheckboxChange.cliente}
                onChange={() => handleCheckboxChange("cliente")}
              />
            </InputLabel>
            <InputLabel>
              Cuentas Espejo
              <Checkbox
                checked={handleCheckboxChange.espejo}
                onChange={() => handleCheckboxChange("espejo")}
              />
            </InputLabel>
          </>
        )}
      </SearchHeader>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            {showID && <TableCell>ID</TableCell>}
            <TableCell>{t("sharedName")}</TableCell>
            <TableCell>{t("userEmail")}</TableCell>
            <TableCell>{t("userAdmin")}</TableCell>
            <TableCell>{t("sharedDisabled")}</TableCell>
            <TableCell>Solo lectura</TableCell>
            <TableCell>Reportes</TableCell>
            <TableCell>Cliente</TableCell>
            <TableCell>{t("userExpirationTime")}</TableCell>
            <TableCell className={classes.columnAction} />
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading ? (
            items
              .filter((u) => temporary || !u.temporary)
              .filter(filterByKeyword(searchKeyword))
              .filter(filterByUserType)
              .sort((a, b) => {
                switch (sortBy) {
                  case 'id':
                    return a.id - b.id;
                  case 'email':
                    return a.email.localeCompare(b.email);
                  case 'name':
                  default:
                    return a.name.localeCompare(b.name);
                }
              })
              .map((item) => (
                <TableRow key={item.id}>
                  {showID && <TableCell>{item.id}</TableCell>}
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{formatBoolean(item.administrator, t)}</TableCell>
                  <TableCell>{formatBoolean(item.disabled, t)}</TableCell>
                  <TableCell>{formatBoolean(item.readonly, t)}</TableCell>
                  <TableCell>
                    {formatBoolean(!item.disableReports, t)}
                  </TableCell>
                  <TableCell>{item.attributes.cliente ? "Si" : "No"}</TableCell>
                  <TableCell>
                    {formatTime(item.expirationTime, "date", hours12)}
                  </TableCell>
                  <TableCell className={classes.columnAction} padding="none">
                    <CollectionActions
                      itemId={item.id}
                      editPath="/settings/user"
                      endpoint="users"
                      setTimestamp={setTimestamp}
                      customActions={
                        manager
                          ? [actionLogin, actionConnections]
                          : [actionConnections]
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
          ) : (
            <TableShimmer columns={6} endAction />
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={10} align="right">
              <FormControlLabel
                control={
                  <Switch
                    value={temporary}
                    onChange={(e) => setTemporary(e.target.checked)}
                    size="small"
                  />
                }
                label={t("userTemporary")}
                labelPlacement="start"
              />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <CollectionFab editPath="/settings/user" />
    </PageLayout>
  );
};

export default UsersPage;
