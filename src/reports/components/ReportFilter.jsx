import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { DatePicker, DateTimeField, DateTimePicker } from '@mui/x-date-pickers';
import { useTranslation } from '../../common/components/LocalizationProvider';
import useReportStyles from '../common/useReportStyles';
import { devicesActions, reportsActions } from '../../store';
import SplitButton from '../../common/components/SplitButton';
import SelectField from '../../common/components/SelectField';
import { useRestriction } from '../../common/util/permissions';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);
const date = dayjs().locale('en').day(1);

const ReportFilter = ({
  children,
  handleSubmit,
  handleSchedule,
  showOnly,
  ignoreDevice,
  multiDevice,
  includeGroups,
}) => {
  const classes = useReportStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const readonly = useRestriction('readonly');

  const devices = useSelector((state) => state.devices.items);
  const groups = useSelector((state) => state.groups.items);

  const deviceId = useSelector((state) => state.devices.selectedId);
  const deviceIds = useSelector((state) => state.devices.selectedIds);
  const groupIds = useSelector((state) => state.reports.groupIds);
  const period = useSelector((state) => state.reports.period);
  const from = useSelector((state) => state.reports.from);
  const to = useSelector((state) => state.reports.to);
  const [button, setButton] = useState('json');

  const [description, setDescription] = useState();
  const [calendarId, setCalendarId] = useState();

  const scheduleDisabled =
    button === 'schedule' && (!description || !calendarId);
  const disabled =
    (!ignoreDevice && !deviceId && !deviceIds.length && !groupIds.length) ||
    scheduleDisabled;

  const handleClick = (type) => {
    if (type === 'schedule') {
      handleSchedule(deviceIds, groupIds, {
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
          selectedFrom = date.subtract(1, 'day').startOf('day');
          selectedTo = date.subtract(1, 'day').endOf('day');
          break;
        case 'thisWeek':
          selectedFrom = date.startOf('week');
          selectedTo = date.endOf('week');
          break;
        case 'previousWeek':
          selectedFrom = date.subtract(1, 'week').startOf('week');
          selectedTo = date.subtract(1, 'week').endOf('week');
          break;
        case 'thisMonth':
          selectedFrom = date.startOf('month');
          selectedTo = date.endOf('month');
          break;
        case 'previousMonth':
          selectedFrom = date.subtract(1, 'month').startOf('month');
          selectedTo = date.subtract(1, 'month').endOf('month');
          break;
        default:
          selectedFrom = dayjs(from, 'YYYY-MM-DDTHH:mm');
          selectedTo = dayjs(to, 'YYYY-MM-DDTHH:mm');
          break;
      }

      handleSubmit({
        deviceId,
        deviceIds,
        groupIds,
        from: selectedFrom.toISOString(),
        to: selectedTo.toISOString(),
        calendarId,
        type,
      });
    }
  };

  return (
    <div className={classes.filter}>
      {!ignoreDevice && (
        <div className={classes.filterItem}>
          <FormControl fullWidth>
            <InputLabel>
              {t(multiDevice ? 'deviceTitle' : 'reportDevice')}
            </InputLabel>
            <Select
              label={t(multiDevice ? 'deviceTitle' : 'reportDevice')}
              value={multiDevice ? deviceIds : deviceId || ''}
              onChange={(e) =>
                dispatch(
                  multiDevice
                    ? devicesActions.selectIds(e.target.value)
                    : devicesActions.selectId(e.target.value)
                )
              }
              multiple={multiDevice}
            >
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
      )}
      {includeGroups && (
        <div className={classes.filterItem}>
          <FormControl fullWidth>
            <InputLabel>{t('settingsGroups')}</InputLabel>
            <Select
              label={t('settingsGroups')}
              value={groupIds}
              onChange={(e) =>
                dispatch(reportsActions.updateGroupIds(e.target.value))
              }
              multiple
            >
              {Object.values(groups)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((group) => (
                  <MenuItem key={group.id} value={group.id}>
                    {group.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </div>
      )}
      {button !== 'schedule' ? (
        <>
          <div className={classes.filterItem}>
            <FormControl fullWidth>
              <InputLabel>{t('reportPeriod')}</InputLabel>
              <Select
                label={t('reportPeriod')}
                value={period}
                onChange={(e) =>
                  dispatch(reportsActions.updatePeriod(e.target.value))
                }
              >
                <MenuItem value='custom' default>
                  {t('reportCustom')}
                </MenuItem>
                <MenuItem value='today'>{t('reportToday')}</MenuItem>
                <MenuItem value='yesterday'>{t('reportYesterday')}</MenuItem>
              </Select>
            </FormControl>
          </div>
          {period === 'custom' && (
            <div className={classes.filterItem}>
              <TextField
                label={t('reportFrom')}
                type='datetime-local'
                value={from}
                onChange={(e) =>
                  dispatch(reportsActions.updateFrom(e.target.value))
                }
                fullWidth
              />
            </div>
          )}
          {period === 'custom' && (
            <div className={classes.filterItem}>
              <TextField
                label={t('reportTo')}
                type='datetime-local'
                value={to}
                onChange={(e) =>
                  dispatch(reportsActions.updateTo(e.target.value))
                }
                fullWidth
              />
            </div>
          )}
          {/* <DateTimePicker
            className={classes.dateFilter}
            value={dayjs(from)}
            label={t("reportFrom")}
            ampm={false}
            fullWidth
            onChange={(newValue) =>
              dispatch(reportsActions.updateFrom(newValue))
            }
          />

          <DateTimePicker
            className={classes.dateFilter}
            ampm={false}
            fullWidth
            value={dayjs(to)}
            label={t("reportTo")}
            onChange={(newValue) => dispatch(reportsActions.updateTo(newValue))}
          /> */}
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
              value={calendarId || 0}
              onChange={(event) => setCalendarId(Number(event.target.value))}
              endpoint='/api/calendars'
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
            variant='outlined'
            color='secondary'
            disabled={disabled}
            onClick={() => handleClick('json')}
          >
            <Typography variant='button' noWrap>
              {t('reportShow')}
            </Typography>
          </Button>
        ) : (
          <SplitButton
            fullWidth
            variant='outlined'
            color='secondary'
            disabled={disabled}
            onClick={handleClick}
            selected={button}
            setSelected={(value) => setButton(value)}
            options={
              readonly
                ? {
                    json: t('reportShow'),
                    export: t('reportExport'),
                    mail: t('reportEmail'),
                  }
                : {
                    json: t('reportShow'),
                    export: t('reportExport'),
                    mail: t('reportEmail'),
                    schedule: t('reportSchedule'),
                  }
            }
          />
        )}
      </div>
    </div>
  );
};

export default ReportFilter;
