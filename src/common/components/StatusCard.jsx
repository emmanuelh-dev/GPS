import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Draggable from 'react-draggable';
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Menu,
  MenuItem,
  CardMedia,
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import makeStyles from '@mui/styles/makeStyles';
import CloseIcon from '@mui/icons-material/Close';
import PublishIcon from '@mui/icons-material/Publish';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PendingIcon from '@mui/icons-material/Pending';
import { RiSpeedUpFill } from 'react-icons/ri';

import { TbEngineOff, TbEngine, TbReportSearch } from 'react-icons/tb';
import { FaMapMarkerAlt } from 'react-icons/fa';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { useTranslation } from './LocalizationProvider';
import RemoveDialog from './RemoveDialog';
import PositionValue from './PositionValue';
import { useDeviceReadonly, useManager } from '../util/permissions';
import usePositionAttributes from '../attributes/usePositionAttributes';
import { devicesActions } from '../../store';
import { useCatch, useCatchCallback } from '../../reactHelper';
import { useAttributePreference } from '../util/preferences';

import { runMotor, stopMotor } from '../util/sms';

const useStyles = makeStyles((theme) => ({
  card: {
    pointerEvents: 'auto',
    width: theme.dimensions.popupMaxWidth,
  },
  media: {
    height: theme.dimensions.popupImageHeight,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  mediaButton: {
    color: theme.palette.primary.contrastText,
    mixBlendMode: 'difference',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 1, 0, 2),
  },
  content: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    maxHeight: theme.dimensions.cardContentMaxHeight,
    overflow: 'auto',
  },
  delete: {
    color: theme.palette.error.main,
  },
  block: {
    color: theme.palette.error.main,
  },
  play: {
    color: theme.palette.primary.main,
  },
  icon: {
    width: '25px',
    height: '25px',
    filter: 'brightness(0) invert(1)',
  },
  table: {
    '& .MuiTableCell-sizeSmall': {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  cell: {
    borderBottom: 'none',
  },
  actions: {
    justifyContent: 'space-between',
  },
  root: ({ desktopPadding }) => ({
    pointerEvents: 'none',
    position: 'fixed',
    zIndex: 5,
    left: '50%',
    [theme.breakpoints.up('md')]: {
      left: `calc(50% + ${desktopPadding} / 2)`,
      bottom: theme.spacing(3),
    },
    [theme.breakpoints.down('md')]: {
      left: '50%',
      bottom: `calc(${theme.spacing(3)} + ${
        theme.dimensions.bottomBarHeight
      }px)`,
    },
    transform: 'translateX(-50%)',
  }),
}));

const StatusRow = ({ name, content }) => {
  const classes = useStyles();
  return (
    <TableRow>
      <TableCell className={classes.cell}>
        <Typography variant="body2">{name}</Typography>
      </TableCell>
      <TableCell className={classes.cell}>
        <Typography variant="body2" color="textSecondary">
          {content}
        </Typography>
      </TableCell>
    </TableRow>
  );
};

const StatusCard = ({
  deviceId,
  position,
  onClose,
  disableActions,
  desktopPadding = 0,
}) => {
  const manager = useManager();
  const classes = useStyles({ desktopPadding });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  const deviceReadonly = useDeviceReadonly();

  const device = useSelector((state) => state.devices.items[deviceId]);

  const deviceImage = device?.attributes?.deviceImage;

  const positionAttributes = usePositionAttributes(t);
  const positionItems = useAttributePreference(
    'positionItems',
    'speed,totalDistance',
  );

  const [anchorEl, setAnchorEl] = useState(null);

  const [removing, setRemoving] = useState(false);

  const handleRemove = useCatch(async (removed) => {
    if (removed) {
      const response = await fetch('/api/devices');
      if (response.ok) {
        dispatch(devicesActions.refresh(await response.json()));
      } else {
        throw Error(await response.text());
      }
    }
    setRemoving(false);
  });

  const [openDialog, setOpenDialog] = useState(false);

  const handleShutdownClick = () => {
    setOpenDialog(true);
  };
  const handleConfirmShutdown = ({ phoneNumber, deviceName }) => {
    stopMotor({
      phoneNumber,
      deviceName,
    });
    setOpenDialog(false);
  };
  const handleGeofence = useCatchCallback(async () => {
    const newItem = {
      name: '',
      area: `CIRCLE (${position.latitude} ${position.longitude}, 50)`,
    };
    const response = await fetch('/api/geofences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    if (response.ok) {
      const item = await response.json();
      const permissionResponse = await fetch('/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: position.deviceId,
          geofenceId: item.id,
        }),
      });
      if (!permissionResponse.ok) {
        throw Error(await permissionResponse.text());
      }
      navigate(`/settings/geofence/${item.id}`);
    } else {
      throw Error(await response.text());
    }
  }, [navigate, position]);
  return (
    <>
      <div className={classes.root}>
        {device && (
          <Draggable handle={`.${classes.media}, .${classes.header}`}>
            <Card elevation={3} className={classes.card}>
              {deviceImage ? (
                <CardMedia
                  className={classes.media}
                  image={`/api/media/${device.uniqueId}/${deviceImage}`}
                >
                  <IconButton
                    size="small"
                    onClick={onClose}
                    onTouchStart={onClose}
                  >
                    <CloseIcon
                      fontSize="small"
                      className={classes.mediaButton}
                    />
                  </IconButton>
                </CardMedia>
              ) : (
                <div className={classes.header}>
                  <Typography variant="body2" color="textSecondary">
                    {device.name}
                    {' '}
                  </Typography>
                  { position && positionItems
                    .split(',')
                    .filter(
                      (key) => position.hasOwnProperty(key)
                            || position.attributes.hasOwnProperty(key),
                    )
                    .map((key) => (
                      <Typography variant="body2" color="textSecondary" key={key}>
                        <PositionValue
                          position={position}
                          property={
                          position.hasOwnProperty(key) ? key : null
                        }
                          attribute={
                          position.hasOwnProperty(key) ? null : key
                        }
                        />
                      </Typography>
                    ))}
                  <IconButton
                    size="small"
                    onClick={onClose}
                    onTouchStart={onClose}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </div>
              )}
              {/* {position && (
              <CardContent className={classes.content}>
                <Table size="small" classes={{ root: classes.table }}>
                  <TableBody>
                    {positionItems
                      .split(',')
                      .filter(
                        (key) => position.hasOwnProperty(key)
                            || position.attributes.hasOwnProperty(key),
                      )
                      .map((key) => (
                        <StatusRow
                          key={key}
                          name={
                              positionAttributes.hasOwnProperty(key)
                                ? positionAttributes[key].name
                                : key
                            }
                          content={(
                            <PositionValue
                              position={position}
                              property={
                                  position.hasOwnProperty(key) ? key : null
                                }
                              attribute={
                                  position.hasOwnProperty(key) ? null : key
                                }
                            />
                            )}
                        />
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
              )} */}
              <CardActions classes={{ root: classes.actions }} disableSpacing>
                {/* <IconButton
                  color="secondary"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  disabled={!position}
                >
                  <PendingIcon />
                </IconButton> */}
                <IconButton
                  onClick={() => navigate('/historial')}
                  disabled={disableActions || !position}
                >
                  <TbReportSearch />
                </IconButton>
                {
                  position && (

                  <IconButton
                    href={`https://www.google.com.mx/maps/place/${position.latitude},${position.longitude}/`}
                    target="_blank"
                    className={classes.block}
                  >
                    <FaMapMarkerAlt />
                  </IconButton>
                  )
                }
                {/* <IconButton
                  onClick={() => navigate(`/settings/device/${deviceId}/command`)}
                  disabled={disableActions}
                >
                  <PublishIcon />
                </IconButton> */}
                <IconButton
                  onClick={handleShutdownClick}
                  className={classes.block}
                >
                  <TbEngineOff />
                </IconButton>
                <Dialog
                  open={openDialog}
                  onClose={() => setOpenDialog(false)}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description"
                >
                  <DialogTitle id="alert-dialog-title">
                    ¿Estás seguro de que quieres apagar el motor?
                  </DialogTitle>
                  <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                      Apagar el motor abruptamente, especialmente a altas
                      velocidades, puede ocasionar pérdida de control y aumentar
                      el riesgo de accidentes. En situaciones donde sea
                      necesario apagar el motor mientras te desplazas, se
                      recomienda hacerlo a baja velocidad para minimizar
                      cualquier impacto en la conducción.
                    </DialogContentText>
                  </DialogContent>

                  <DialogActions>
                    <Button
                      onClick={() => setOpenDialog(false)}
                      color="primary"
                    >
                      Cancelar
                    </Button>
                    <Button
                      className={classes.block}
                      onClick={() => handleConfirmShutdown({
                        phoneNumber: device.phone,
                        deviceName: device.name,
                      })}
                      autoFocus
                    >
                      Apagar
                    </Button>
                  </DialogActions>
                </Dialog>

                <IconButton
                  onClick={() => runMotor({
                    phoneNumber: device.phone,
                    deviceName: device.name,
                  })}
                >
                  <TbEngine className={classes.play} />
                </IconButton>
                {!manager ? null : (
                  <>
                    <IconButton
                      onClick={() => navigate(`/settings/device/${deviceId}`)}
                      disabled={disableActions || deviceReadonly}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => setRemoving(true)}
                      disabled={disableActions || deviceReadonly}
                      className={classes.delete}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </>
                )}
              </CardActions>
            </Card>
          </Draggable>
        )}
      </div>
      {position && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => navigate(`/position/${position.id}`)}>
            <Typography color="secondary">{t('sharedShowDetails')}</Typography>
          </MenuItem>
          <MenuItem onClick={handleGeofence}>
            {t('sharedCreateGeofence')}
          </MenuItem>
          <MenuItem
            component="a"
            target="_blank"
            href={`https://www.google.com/maps/search/?api=1&query=${position.latitude}%2C${position.longitude}`}
          >
            {t('linkGoogleMaps')}
          </MenuItem>
          <MenuItem
            component="a"
            target="_blank"
            href={`http://maps.apple.com/?ll=${position.latitude},${position.longitude}`}
          >
            {t('linkAppleMaps')}
          </MenuItem>
          <MenuItem
            component="a"
            target="_blank"
            href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${position.latitude}%2C${position.longitude}&heading=${position.course}`}
          >
            {t('linkStreetView')}
          </MenuItem>
        </Menu>
      )}
      <RemoveDialog
        open={removing}
        endpoint="devices"
        itemId={deviceId}
        onResult={(removed) => handleRemove(removed)}
      />
    </>
  );
};

export default StatusCard;
