import { grey, green, indigo } from "@mui/material/colors";

const validatedColor = (color) =>
  /^#([0-9A-Fa-f]{3}){1,2}$/.test(color) ? color : null;

export default (server, darkMode) => ({
  mode: darkMode ? "dark" : "light",
  background: {
    default: darkMode ? grey[900] : grey[50],
  },
  primary: {
    main: "#0694a2",
  },
  success: {
    main: "#0DD3BA",
  },
  secondary: {
    main: "#0694a2",
  },
  neutral: {
    main: grey[500],
  },
  // Replay line
  geometry: {
    main: "#0dd3ba",
  },
  warning: {
    main: "#FFA100",
  },
  error: {
    main: "#ec1b3e",
  },
  white: {
    main: "#fff",
  },
});
