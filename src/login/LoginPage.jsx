import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  useMediaQuery,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Button,
  TextField,
  Link,
  Snackbar,
  IconButton,
  Tooltip,
  LinearProgress,
  Box,
  Typography,
} from "@mui/material";
import ReactCountryFlag from "react-country-flag";
import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { useTheme } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import RoomRounded from "@mui/icons-material/Room";
import { sessionActions } from "../store";
import {
  useLocalization,
  useTranslation,
} from "../common/components/LocalizationProvider";
import LoginLayout from "./LoginLayout";
import usePersistedState from "../common/util/usePersistedState";
import {
  handleLoginTokenListeners,
  nativeEnvironment,
  nativePostMessage,
} from "../common/components/NativeInterface";
import { useCatch } from "../reactHelper";
import LogoImage from "./LogoImage";

const useStyles = makeStyles((theme) => ({
  options: {
    position: "fixed",
    top: theme.spacing(1),
    right: theme.spacing(1),
  },
  container: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    maxWidth: "100%",
    padding: theme.spacing(2),
    boxSizing: "border-box",
  },
  extraContainer: {
    display: "flex",
    gap: theme.spacing(2),
  },
  registerButton: {
    minWidth: "unset",
  },
  resetPassword: {
    cursor: "pointer",
    textAlign: "center",
    marginTop: theme.spacing(2),
  },
  title: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing(5),
    fontSize: theme.spacing(6),
    fontWeight: "bold",
    color: theme.palette.primary.main,
  },
  logo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: theme.spacing(10),
    color: theme.palette.primary.main,
  },
}));

const LoginPage = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const t = useTranslation();

  const { languages, language, setLanguage } = useLocalization();
  const languageList = Object.entries(languages).map((values) => ({
    code: values[0],
    country: values[1].country,
    name: values[1].name,
  }));

  const [failed, setFailed] = useState(false);

  const [email, setEmail] = usePersistedState("loginEmail", "");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const registrationEnabled = useSelector(
    (state) => state.session.server.registration,
  );
  const languageEnabled = useSelector(
    (state) => !state.session.server.attributes["ui.disableLoginLanguage"],
  );
  const changeEnabled = useSelector(
    (state) => !state.session.server.attributes.disableChange,
  );
  const emailEnabled = useSelector(
    (state) => state.session.server.emailEnabled,
  );
  const openIdEnabled = useSelector(
    (state) => state.session.server.openIdEnabled,
  );
  const openIdForced = useSelector(
    (state) =>
      state.session.server.openIdEnabled && state.session.server.openIdForce,
  );
  const [codeEnabled, setCodeEnabled] = useState(false);

  const [announcementShown, setAnnouncementShown] = useState(false);
  const announcement = useSelector(
    (state) => state.session.server.announcement,
  );

  const generateLoginToken = async () => {
    if (nativeEnvironment) {
      let token = "";
      try {
        const expiration = dayjs().add(6, "months").toISOString();
        const response = await fetch("/api/session/token", {
          method: "POST",
          body: new URLSearchParams(`expiration=${expiration}`),
        });
        if (response.ok) {
          token = await response.text();
        }
      } catch (error) {
        token = "";
      }
      nativePostMessage(`login|${token}`);
    }
  };

  const handlePasswordLogin = async (event) => {
    event.preventDefault();
    setFailed(false);
    try {
      const query = `email=${encodeURIComponent(
        email,
      )}&password=${encodeURIComponent(password)}`;
      const response = await fetch("/api/session", {
        method: "POST",
        body: new URLSearchParams(
          code.length ? `${query}&code=${code}` : query,
        ),
      });
      if (response.ok) {
        const user = await response.json();
        generateLoginToken();
        dispatch(sessionActions.updateUser(user));
        navigate("/");
      } else if (
        response.status === 401 &&
        response.headers.get("WWW-Authenticate") === "TOTP"
      ) {
        setCodeEnabled(true);
      } else {
        throw Error(await response.text());
      }
    } catch (error) {
      setFailed(true);
      setPassword("");
    }
  };

  const handleTokenLogin = useCatch(async (token) => {
    const response = await fetch(
      `/api/session?token=${encodeURIComponent(token)}`,
    );
    if (response.ok) {
      const user = await response.json();
      dispatch(sessionActions.updateUser(user));
      navigate("/");
    } else {
      throw Error(await response.text());
    }
  });

  const handleSpecialKey = (e) => {
    if (e.keyCode === 13 && email && password && (!codeEnabled || code)) {
      handlePasswordLogin(e);
    }
  };

  const handleOpenIdLogin = () => {
    document.location = "/api/session/openid/auth";
  };

  useEffect(() => nativePostMessage("authentication"), []);

  useEffect(() => {
    const listener = (token) => handleTokenLogin(token);
    handleLoginTokenListeners.add(listener);
    return () => handleLoginTokenListeners.delete(listener);
  }, []);

  if (openIdForced) {
    handleOpenIdLogin();
    return <LinearProgress />;
  }

  return (
    <LoginLayout>
      <div className={classes.options}>
        {nativeEnvironment && changeEnabled && (
          <Tooltip title={t("settingsServer")}>
            <IconButton onClick={() => navigate("/change-server")}>
              <LockOpenIcon />
            </IconButton>
          </Tooltip>
        )}
      </div>
      <div className={classes.container}>
        <div className={classes.logo}>
          <LogoImage />
        </div>
        <TextField
          required
          error={failed}
          label={t("userEmail")}
          name="email"
          value={email}
          autoComplete="email"
          autoFocus={!email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyUp={handleSpecialKey}
          helperText={failed && "Invalid username or password"}
        />
        <TextField
          required
          error={failed}
          label={t("userPassword")}
          name="password"
          value={password}
          type="password"
          autoComplete="current-password"
          autoFocus={!!email}
          onChange={(e) => setPassword(e.target.value)}
          onKeyUp={handleSpecialKey}
        />
        {codeEnabled && (
          <TextField
            required
            error={failed}
            label={t("loginTotpCode")}
            name="code"
            value={code}
            type="number"
            onChange={(e) => setCode(e.target.value)}
            onKeyUp={handleSpecialKey}
          />
        )}
        <Button
          onClick={handlePasswordLogin}
          onKeyUp={handleSpecialKey}
          variant="contained"
          color="secondary"
          disabled={!email || !password || (codeEnabled && !code)}
        >
          {t("loginLogin")}
        </Button>
        {openIdEnabled && (
          <Button
            onClick={() => handleOpenIdLogin()}
            variant="contained"
            color="secondary"
          >
            {t("loginOpenId")}
          </Button>
        )}
      </div>
      <Snackbar
        open={!!announcement && !announcementShown}
        message={announcement}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setAnnouncementShown(true)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </LoginLayout>
  );
};

export default LoginPage;
