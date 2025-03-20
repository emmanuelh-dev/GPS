import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import makeStyles from "@mui/styles/makeStyles";
import {
  IconButton,
  Tooltip,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
} from "@mui/material";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FaTemperatureFull } from "react-icons/fa6";
import { TbSettingsShare } from "react-icons/tb";
import EditIcon from "@mui/icons-material/Edit";
import { devicesActions } from "../store";
import {
  formatAlarm,
  formatBoolean,
  formatPercentage,
  formatStatus,
  getStatusColor,
} from "../common/util/formatter";
import { useTranslation } from "../common/components/LocalizationProvider";
import { useAdministrator } from "../common/util/permissions";
import { useAttributePreference } from "../common/util/preferences";
import { PiEngineFill } from "react-icons/pi";
import { MdError } from "react-icons/md";
import {
  Battery6Bar,
  BatteryFull,
  DeviceThermostat,
} from "@mui/icons-material";
import EditNameDialog from "./EditNameDialog";

dayjs.extend(relativeTime);

const useStyles = makeStyles((theme) => ({
  icon: {
    width: "40px",
  },
  success: {
    color: theme.palette.success.main,
  },
  warning: {
    color: theme.palette.warning.main,
  },
  error: {
    color: theme.palette.error.main,
  },
  neutral: {
    color: theme.palette.neutral.main,
  },
  tooltipButton: {
    color: theme.palette.primary.main,
  },
  iconText: {
    fontSize: "0.9rem",
    fontWeight: "normal",
    lineHeight: "0.875rem",
  },
}));

const DeviceRow = ({ data, index, style }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const admin = useAdministrator();

  const item = data[index];
  const position = useSelector((state) => state.session.positions[item.id]);

  const devicePrimary = useAttributePreference("devicePrimary", "name");
  const deviceSecondary = useAttributePreference("deviceSecondary", "");

  const secondaryText = () => {
    let status;
    const now = dayjs();
    const lastUpdate = dayjs(item.lastUpdate);

    const tenMinutesAgo = now.subtract(10, "minute");
    const hasTenMinutesPassed = lastUpdate.isBefore(tenMinutesAgo);

    if (item.status === "online" || !item.lastUpdate) {
      if (hasTenMinutesPassed) {
        status = dayjs(item.lastUpdate).fromNow();
      } else {
        status = formatStatus(item.status, t);
      }
    } else {
      status = dayjs(item.lastUpdate).fromNow();
    }
    if (position?.attributes.hasOwnProperty("bleTemp1")) {
      return <></>;
    }
    return (
      <>
        {deviceSecondary &&
          item[deviceSecondary] &&
          `${item[deviceSecondary]} • `}
        <span
          className={
            classes[
            getStatusColor({
              status: item.status,
              speed: position?.speed,
              termo: position?.attributes.hasOwnProperty("bleTemp1"),
              ignition: position?.attributes?.ignition,
            })
            ]
          }
        >
          {status}
        </span>
      </>
    );
  };

  // const secondaryText = () => {
  //   let status;
  //   if (item.status === 'online' || !item.lastUpdate) {
  //     status = formatStatus(item.status, t);
  //   } else {
  //     status = dayjs(item.lastUpdate).fromNow();
  //   }
  //   return (
  //     <>
  //       {deviceSecondary &&
  //         item[deviceSecondary] &&
  //         `${item[deviceSecondary]} • `}
  //       <span
  //         className={
  //           classes[
  //             getStatusColor({ status: item.status, speed: position?.speed })
  //           ]
  //         }
  //       >
  //         {status}
  //       </span>
  //     </>
  //   );
  // };

  const toggleSendSms = () => {
    dispatch(devicesActions.toggleSendSms());
  };

  const handleSaveDevice = (updatedDevice) => {
    dispatch(devicesActions.update(updatedDevice));
  };

  const image = () => {
    if (item.status === "online") {
      if (position?.speed > 0) {
        return "/1.png";
      }
      return !position?.attributes?.ignition ? "/2.png" : "/3.png";
    }
    return "/2.png";
  };

  return (
    <div style={style}>
      <ListItemButton
        key={item.id}
        onClick={() => dispatch(devicesActions.selectId(item.id))}
        disabled={!admin && item.disabled}
      >
        <ListItemAvatar>
          <img className={classes.icon} src={image()} alt="" />
        </ListItemAvatar>

        <ListItemText
          primary={item[devicePrimary]}
          primaryTypographyProps={{ noWrap: true }}
          secondary={secondaryText()}
          secondaryTypographyProps={{ noWrap: true }}
        />
        {/* {position && (
          <>
            {position.attributes.hasOwnProperty('alarm') && (
              <Tooltip
                title={`${t('eventAlarm')}: ${formatAlarm(
                  position.attributes.alarm,
                  t
                )}`}
              >
                <IconButton size='small'>
                  <MdError fontSize='small' className={classes.error} />
                </IconButton>
              </Tooltip>
            )}

            {position.attributes.hasOwnProperty('batteryLevel') && (
              <Tooltip
                title={`${t('positionBatteryLevel')}: ${formatPercentage(
                  position.attributes.batteryLevel
                )}`}
              >
                <IconButton size='small'>
                  {position.attributes.batteryLevel > 70 ? (
                    position.attributes.charge ? (
                      <BatteryChargingFullIcon
                        fontSize='small'
                        className={classes.success}
                      />
                    ) : (
                      <BatteryFull
                        fontSize='small'
                        className={classes.success}
                      />
                    )
                  ) : position.attributes.batteryLevel > 30 ? (
                    position.attributes.charge ? (
                      <BatteryCharging60Icon
                        fontSize='small'
                        className={classes.warning}
                      />
                    ) : (
                      <Battery6Bar
                        fontSize='small'
                        className={classes.warning}
                      />
                    )
                  ) : position.attributes.charge ? (
                    <BatteryCharging20Icon
                      fontSize='small'
                      className={classes.error}
                    />
                  ) : (
                    <Battery20Icon fontSize='small' className={classes.error} />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </>
        )} */}
        {/* {
          deviceReadonly ? null : (
            <Tooltip title="run" onClick={() => resumeDevice(item.phone)}>
              <IconButton size="small">
                <EngineIcon width={20} height={20} className={classes.tooltipButton} />
              </IconButton>
            </Tooltip>
          )
        } */}
        {/* <PositionValue
          position={item}
          property="speed"
          attribute={position?.speed}
        /> */}
        {admin && position?.attributes.hasOwnProperty("ignition") && (
          <Tooltip
            title={`${t("positionIgnition")}: ${formatBoolean(
              position.attributes.ignition,
              t
            )}`}
          >
            <IconButton size="small">
              {position.attributes.ignition ? (
                <PiEngineFill
                  width={20}
                  height={20}
                  className={classes.success}
                />
              ) : (
                <PiEngineFill
                  width={20}
                  height={20}
                  className={classes.neutral}
                />
              )}
            </IconButton>
          </Tooltip>
        )}
        {position?.attributes.hasOwnProperty("bleTemp1") && (
          <Tooltip title="Temperatura">
            <>
              <DeviceThermostat
                fontSize="small"
                className={
                  position.attributes.bleTemp1 > 18
                    ? classes.warning
                    : classes.tooltipButton
                }
              />
              <span className={classes.iconText}>
                {Math.round(position.attributes.bleTemp1)}° /{" "}
                {Math.round(
                  Math.round(position.attributes.bleTemp1) * (9 / 5) + 32
                )}
                °
              </span>
            </>
          </Tooltip>
        )}
        {admin && (
          <>
            <IconButton size="small" onClick={toggleSendSms}>
              <TbSettingsShare fontSize="medium" />
            </IconButton>
          </>
        )}
        <IconButton size="small" onClick={() => setEditDialogOpen(true)}>
          <EditIcon fontSize="small" />
        </IconButton>
      </ListItemButton>
      <EditNameDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        device={item}
        onSave={handleSaveDevice}
      />
    </div>
  );
};

export default DeviceRow;
