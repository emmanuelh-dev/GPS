import React, { useState, useCallback, useEffect } from "react";
import { Paper } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useDispatch, useSelector } from "react-redux";
import DeviceList from "./DeviceList";
import BottomMenu from "../common/components/BottomMenu";
import StatusCard from "../common/components/StatusCard";
import { devicesActions } from "../store";
import usePersistedState from "../common/util/usePersistedState";
import EventsDrawer from "./EventsDrawer";
import MainToolbar from "./MainToolbar";
import MainMap from "./MainMap";
import { useAttributePreference } from "../common/util/preferences";
import useFilterMain from "./useFilterMain";
import SendSmsDrawer from "./SendSmsDrawer";
import { useManager } from "../common/util/permissions";
import ManagerSection from "./ManagerSection";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    width: "100vw",
    overflowX: "hidden",
  },
  sidebar: {
    pointerEvents: "none",
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.up("md")]: {
      position: "fixed",
      left: 0,
      top: 0,
      height: "100%",
      width: theme.dimensions.drawerWidthDesktop,
      zIndex: 3,
    },
    [theme.breakpoints.down("md")]: {
      height: "100%",
      width: "100%",
    },
  },
  header: {
    pointerEvents: "auto",
    zIndex: 6,
  },
  footer: {
    pointerEvents: "auto",
    zIndex: 5,
  },
  middle: {
    flex: 1,
    display: "grid",
  },
  contentMap: {
    pointerEvents: "auto",
    gridArea: "1 / 1",
  },
  contentList: {
    pointerEvents: "auto",
    gridArea: "1 / 1",
    zIndex: 4,
  },
  desktopContainer: {
    display: "flex",
    flexDirection: "row",
    height: "100%",
    width: "calc(100vw - " + theme.dimensions.drawerWidthDesktop + "px)",
    position: "fixed",
    right: 0,
    top: 0,
    zIndex: 10,
  },
  mapContainer: {
    flex: 1,
    height: "100%",
    position: "relative",
    zIndex: 2,
  },
  managerContainer: {
    width: '300px',
    height: '100%',
    overflowY: 'auto',
    zIndex: 3,
  },
  splitContainer: {
    display: "flex",
    flexDirection: "row",
    height: "100%",
    width: "100%",
  },
  mapSection: {
    flex: 1,
    height: "100%",
    position: "relative",
  },
  managerSection: {
    width: '300px',
    height: "100%",
    position: "relative",
    borderLeft: `1px solid ${theme.palette.divider}`,
  },
}));

const MainPage = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isManager = useManager();

  const desktop = useMediaQuery(theme.breakpoints.up("md"));

  const mapOnSelect = useAttributePreference("mapOnSelect", true);

  const selectedDeviceId = useSelector((state) => state.devices.selectedId);
  const positions = useSelector((state) => state.session.positions);
  const currentDevice = useSelector((state) => state.devices.currentDevices);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const selectedPosition = filteredPositions.find(
    (position) => selectedDeviceId && position.deviceId === selectedDeviceId,
  );

  const [filteredDevices, setFilteredDevices] = useState([]);

  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = usePersistedState("filter", {
    statuses: [],
    groups: [],
  });

  const [filterSort, setFilterSort] = useState("name");
  const [filterMap, setFilterMap] = usePersistedState("filterMap", true);
  const [filterOnChange, setFilterOnChange] = usePersistedState("filterOnChange", false);
  const [showGeofences, setShowGeofences] = usePersistedState("showGeofences", false);
  const [currentDevices, setCurrentDevices] = useState([]);
  const [devicesOpen, setDevicesOpen] = useState(desktop);
  const [eventsOpen, setEventsOpen] = useState(false);

  const onEventsClick = useCallback(() => setEventsOpen(true), [setEventsOpen]);

  useEffect(() => {
    if (!desktop && mapOnSelect && selectedDeviceId) {
      setDevicesOpen(false);
    }
  }, [desktop, mapOnSelect, selectedDeviceId]);

  useFilterMain(
    keyword,
    filter,
    filterSort,
    filterMap,
    positions,
    setFilteredDevices,
    setFilteredPositions,
  );

  return (
    <div className={classes.root}>
      {desktop && (
        <div className={classes.splitContainer}>
          <div className={classes.mapSection}>
            <MainMap
              filteredPositions={filteredPositions}
              selectedPosition={selectedPosition}
              onEventsClick={onEventsClick}
              setCurrentDevices={setCurrentDevices}
              currentDevices={currentDevices}
              filterOnChange={filterOnChange}
              showGeofences={showGeofences}
            />
          </div>
          {isManager && (
            <div className={classes.managerSection}>
              <ManagerSection />
            </div>
          )}
        </div>
      )}

      <div className={classes.sidebar}>
        <Paper square elevation={3} className={classes.header}>
          <MainToolbar
            filteredDevices={filteredDevices}
            devicesOpen={devicesOpen}
            setDevicesOpen={setDevicesOpen}
            keyword={keyword}
            setKeyword={setKeyword}
            filter={filter}
            setFilter={setFilter}
            filterSort={filterSort}
            setFilterSort={setFilterSort}
            filterMap={filterMap}
            setFilterMap={setFilterMap}
            filterOnChange={filterOnChange}
            setFilterOnChange={setFilterOnChange}
            showGeofences={showGeofences}
            setShowGeofences={setShowGeofences}
          />
        </Paper>
        <div className={classes.middle}>
          {!desktop && (
            <div className={classes.contentMap}>
              <MainMap
                filteredPositions={filteredPositions}
                selectedPosition={selectedPosition}
                onEventsClick={onEventsClick}
                setCurrentDevices={setCurrentDevices}
                currentDevices={currentDevices}
                filterOnChange={filterOnChange}
              />
            </div>
          )}
          <Paper
            square
            className={classes.contentList}
            style={devicesOpen ? {} : { visibility: "hidden" }}
          >
            <DeviceList devices={filterOnChange ? currentDevices : filteredDevices} />
          </Paper>

        </div>
        {desktop && (
          <div className={classes.footer}>
            <BottomMenu />
          </div>
        )}
      </div>
      <EventsDrawer open={eventsOpen} onClose={() => setEventsOpen(false)} />

      <SendSmsDrawer deviceId={selectedDeviceId} />
      {selectedDeviceId && (
        <StatusCard
          deviceId={selectedDeviceId}
          position={selectedPosition}
          onClose={() => dispatch(devicesActions.selectId(null))}
          desktopPadding={theme.dimensions.drawerWidthDesktop}
        />
      )}
    </div>
  );
};

export default MainPage;
