import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { CssBaseline, StyledEngineProvider } from "@mui/material";
import { Toaster } from "react-hot-toast";
import store from "./store";
import { LocalizationProvider } from "./common/components/LocalizationProvider";
import ErrorHandler from "./common/components/ErrorHandler";
import Navigation from "./Navigation";
import preloadImages from "./map/core/preloadImages";
import NativeInterface from "./common/components/NativeInterface";
import ServerProvider from "./ServerProvider";
import ErrorBoundary from "./ErrorBoundary";
import AppThemeProvider from "./AppThemeProvider";
import { LocalizationProvider as MuiLocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import VisitasDialog from "./main/VisitasDialog";
import { VisitasDialogProvider } from "./store/VisitasDialogContext";

preloadImages();

const root = createRoot(document.getElementById("root"));
root.render(
  <ErrorBoundary>
    <Provider store={store}>
      <MuiLocalizationProvider dateAdapter={AdapterDayjs}>
        <LocalizationProvider>
          <StyledEngineProvider injectFirst>
            <AppThemeProvider>
              <CssBaseline />
              <ServerProvider>
                <BrowserRouter>
                  <VisitasDialogProvider>
                    <VisitasDialog />
                    <Toaster />
                    <Navigation />
                  </VisitasDialogProvider>
                </BrowserRouter>
                <ErrorHandler />
                <NativeInterface />
              </ServerProvider>
            </AppThemeProvider>
          </StyledEngineProvider>
        </LocalizationProvider>
      </MuiLocalizationProvider>
    </Provider>
  </ErrorBoundary>,
);
