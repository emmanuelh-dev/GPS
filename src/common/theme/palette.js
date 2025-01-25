import { grey, green, indigo } from "@mui/material/colors";

const validatedColor = (color) =>
  /^#([0-9A-Fa-f]{3}){1,2}$/.test(color) ? color : null;

export default (server, darkMode) => ({
  mode: darkMode ? "dark" : "light",
  background: {
    default:  darkMode ? grey[950] : grey[50],
  },
  primary: {
    main: "#0F52BA",
  },
  secondary: {
    main: "#0F52BA",
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
