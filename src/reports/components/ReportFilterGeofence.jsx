import React, { useState } from 'react';
import {
  FormControl, InputLabel, Select, MenuItem, Button, TextField, Typography,
  Checkbox, FormControlLabel
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { useTranslation } from '../../common/components/LocalizationProvider';
import useReportStyles from '../common/useReportStyles';
import { geofencesActions, reportsActions, devicesActions } from '../../store';
import SplitButton from '../../common/components/SplitButton';
import SelectField from '../../common/components/SelectField';
import { useRestriction } from '../../common/util/permissions';

const ReportFilterGeofence = ({
  children, handleSubmit, handleSchedule, showOnly, ignoreDevice, multi, loading, multiDevice,
}) => {
  const classes = useReportStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const readonly = useRestriction('readonly');

  const geofences = useSelector((state) => state.geofences.items);
  const geofenceId = useSelector((state) => state.geofences.selectedId);
  const geofenceIds = useSelector((state) => state.geofences.selectedIds);
  const devices = useSelector((state) => state.devices.items);
  const deviceId = useSelector((state) => state.devices.selectedId);
  const deviceIds = useSelector((state) => state.devices.selectedIds);
  const period = useSelector((state) => state.reports.period);
  const from = useSelector((state) => state.reports.from);
  const to = useSelector((state) => state.reports.to);

  const [button, setButton] = useState('json');
  const [description, setDescription] = useState();
  const [calendarId, setCalendarId] = useState();

  const scheduleDisabled = button === 'schedule' && (!description || !calendarId);
  const disabled = (!ignoreDevice && !geofenceId && !geofenceIds.length) || scheduleDisabled || loading;

  const handleClick = (type) => {
    if (type === 'schedule') {
      handleSchedule(geofenceIds, {
        description,
        calendarId,
        attributes: {},
      });
    } else {
      let selectedFrom;
      let selectedTo;
      switch (period) {
        case 'today':
          selectedFrom = dayjs().startOf('day');
          selectedTo = dayjs().endOf('day');
          break;
        case 'yesterday':
          selectedFrom = dayjs().subtract(1, 'day').startOf('day');
          selectedTo = dayjs().subtract(1, 'day').endOf('day');
          break;
        case 'thisWeek':
          selectedFrom = dayjs().startOf('week');
          selectedTo = dayjs().endOf('week');
          break;
        case 'previousWeek':
          selectedFrom = dayjs().subtract(1, 'week').startOf('week');
          selectedTo = dayjs().subtract(1, 'week').endOf('week');
          break;
        case 'thisMonth':
          selectedFrom = dayjs().startOf('month');
          selectedTo = dayjs().endOf('month');
          break;
        case 'previousMonth':
          selectedFrom = dayjs().subtract(1, 'month').startOf('month');
          selectedTo = dayjs().subtract(1, 'month').endOf('month');
          break;
        default:
          selectedFrom = dayjs(from, 'YYYY-MM-DDTHH:mm');
          selectedTo = dayjs(to, 'YYYY-MM-DDTHH:mm');
          break;
      }

      handleSubmit({
        geofenceId: geofenceId,
        geofenceIds: geofenceIds,
        deviceId: deviceId,
        deviceIds: deviceIds,
        from: selectedFrom.toISOString(),
        to: selectedTo.toISOString(),
        calendarId,
        type,
      });
    }
  };

  // Las funciones handleAllGeofences y handleAllDevices ya no son necesarias
  // ya que la funcionalidad ha sido integrada directamente en los selects

  return (
    <div className={classes.filter}>
      <div className={classes.filterItem}>
        <FormControl fullWidth>
          <InputLabel>{t(multi ? 'sharedGeofences' : 'sharedGeofence')}</InputLabel>
          <Select
            label={t(multi ? 'sharedGeofences' : 'sharedGeofence')}
            value={multi ? geofenceIds : geofenceId || ''}
            onChange={(e) => {
              if (multi && e.target.value.includes('all')) {
                // Si se selecciona 'Todos', seleccionar todos los geofences
                const allGeofenceIds = Object.values(geofences).map(geofence => geofence.id);
                dispatch(geofencesActions.selectIds(allGeofenceIds));
              } else {
                dispatch(multi ? geofencesActions.selectIds(e.target.value) : geofencesActions.selectId(e.target.value));
              }
            }}
            multiple={multi}
          >
            {multi && (
              <MenuItem value="all">
                <em>Todos los geofences</em>
              </MenuItem>
            )}
            {Object.values(geofences)
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((geofence) => (
                <MenuItem key={geofence.id} value={geofence.id}>
                  {geofence.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </div>

      <div className={classes.filterItem}>
        <FormControl fullWidth>
          <InputLabel>
            {t(multiDevice ? 'deviceTitle' : 'reportDevice')}
          </InputLabel>
          <Select
            label={t(multiDevice ? 'deviceTitle' : 'reportDevice')}
            value={multiDevice ? deviceIds : deviceId || ''}
            onChange={(e) => {
              if (multiDevice && e.target.value.includes('all')) {
                // Si se selecciona 'Todos', seleccionar todos los dispositivos
                const allDeviceIds = Object.values(devices).map(device => device.id);
                dispatch(devicesActions.selectIds(allDeviceIds));
              } else {
                dispatch(
                  multiDevice
                    ? devicesActions.selectIds(e.target.value)
                    : devicesActions.selectId(e.target.value)
                );
              }
            }}
            multiple={multiDevice}
          >
            {multiDevice && (
              <MenuItem value="all">
                <em>Todos los dispositivos</em>
              </MenuItem>
            )}
            {Object.values(devices)
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((device) => (
                <MenuItem key={device.id} value={device.id}>
                  {device.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </div>
      {button !== 'schedule' ? (
        <>
          <div className={classes.filterItem}>
            <FormControl fullWidth>
              <InputLabel>{t('reportPeriod')}</InputLabel>
              <Select label={t('reportPeriod')} value={period} onChange={(e) => dispatch(reportsActions.updatePeriod(e.target.value))}>
                <MenuItem value="today">{t('reportToday')}</MenuItem>
                <MenuItem value="yesterday">{t('reportYesterday')}</MenuItem>
                <MenuItem value="thisWeek">{t('reportThisWeek')}</MenuItem>
                <MenuItem value="previousWeek">{t('reportPreviousWeek')}</MenuItem>
                <MenuItem value="thisMonth">{t('reportThisMonth')}</MenuItem>
                <MenuItem value="previousMonth">{t('reportPreviousMonth')}</MenuItem>
                <MenuItem value="custom">{t('reportCustom')}</MenuItem>
              </Select>
            </FormControl>
          </div>
          {period === 'custom' && (
            <div className={classes.filterItem}>
              <TextField
                label={t('reportFrom')}
                type="datetime-local"
                value={from}
                onChange={(e) => dispatch(reportsActions.updateFrom(e.target.value))}
                fullWidth
              />
            </div>
          )}
          {period === 'custom' && (
            <div className={classes.filterItem}>
              <TextField
                label={t('reportTo')}
                type="datetime-local"
                value={to}
                onChange={(e) => dispatch(reportsActions.updateTo(e.target.value))}
                fullWidth
              />
            </div>
          )}
        </>
      ) : (
        <>
          <div className={classes.filterItem}>
            <TextField
              value={description || ''}
              onChange={(event) => setDescription(event.target.value)}
              label={t('sharedDescription')}
              fullWidth
            />
          </div>
          <div className={classes.filterItem}>
            <SelectField
              value={calendarId}
              onChange={(event) => setCalendarId(Number(event.target.value))}
              endpoint="/api/calendars"
              label={t('sharedCalendar')}
              fullWidth
            />
          </div>
        </>
      )}
      {children}
      <div className={classes.filterItem}>
        {showOnly ? (
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            disabled={disabled}
            onClick={() => handleClick('json')}
          >
            <Typography variant="button" noWrap>{t('reportShow')}</Typography>
          </Button>
        ) : (
          <SplitButton
            fullWidth
            variant="outlined"
            color="secondary"
            disabled={disabled}
            onClick={handleClick}
            selected={button}
            setSelected={(value) => setButton(value)}
            options={readonly ? {
              json: t('reportShow'),
              export: t('reportExport'),
              mail: t('reportEmail'),
            } : {
              json: t('reportShow'),
              export: t('reportExport'),
              mail: t('reportEmail'),
              schedule: t('reportSchedule'),
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ReportFilterGeofence;
