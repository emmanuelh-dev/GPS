import React from "react";
import { FaUserCircle } from "react-icons/fa";
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
  Battery20,
  Battery6Bar,
  BatteryCharging20,
  BatteryCharging60,
  BatteryChargingFull,
  BatteryFull,
  DeviceThermostat,
} from "@mui/icons-material";

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

  const admin = useAdministrator();

  const item = data[index];
  const position = useSelector((state) => state.session.positions[item.id]);

  const devicePrimary = useAttributePreference("devicePrimary", "name");
  const deviceSecondary = useAttributePreference("deviceSecondary", "");
  const deviceImage = item?.attributes?.deviceImage;
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
          {deviceImage ? (
            <img
              src={`/api/media/${item.uniqueId}/${deviceImage}`}
              alt="Device"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <FaUserCircle className={classes.icon} size="2rem" color="black" />
          )}
        </ListItemAvatar>
        <ListItemText
          primary={item[devicePrimary]}
          primaryTypographyProps={{ noWrap: true }}
          secondary={secondaryText()}
          secondaryTypographyProps={{ noWrap: true }}
        />
        {position && (
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
                      <BatteryChargingFull
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
                      <BatteryCharging60
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
                    <BatteryCharging20
                      fontSize='small'
                      className={classes.error}
                    />
                  ) : (
                    <Battery20 fontSize='small' className={classes.error} />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </>
        )}
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

        {admin && (
          <IconButton size="small" onClick={toggleSendSms}>
            <TbSettingsShare fontSize="medium" />
          </IconButton>
        )}
      </ListItemButton>
    </div>
  );
};

export default DeviceRow;
