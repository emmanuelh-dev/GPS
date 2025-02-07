import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataGrid } from '@mui/x-data-grid';
import dayjs from "dayjs";
import {useEffectAsync } from "../reactHelper";
import LinkIcon from '@mui/icons-material/Link';
import { useTranslation } from "../common/components/LocalizationProvider";
import PageLayout from "../common/components/PageLayout";
import SettingsMenu from "./components/SettingsMenu";
import CollectionActions from "./components/CollectionActions";
import { formatBoolean} from '../common/util/formatter';
import CollectionFabCustom from "./components/CollectionFabCustom";

const InmatesPage = () => {
  const navigate = useNavigate();
  const t = useTranslation();

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);


  const actionConnections = {
    key: "connections",
    title: t("sharedConnections"),
    icon: <LinkIcon fontSize="small" />,
    handler: (userId) => navigate(`/settings/inmate/${userId}/connections`),
  };

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/inmates");
      if (response.ok) {
        setItems(await response.json());
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  }, [timestamp]);

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 50
    },
    {
      field: 'firstName',
      headerName: 'First Name',
      minWidth: 200,
      flex: 1,
      editable: false,
      hideable: false,
    },
    {
      field: 'lastName',
      headerName: 'Last Name',
      minWidth: 200,
      flex: 1,
      editable: false,
      hideable: false,
    },
    {
      field: 'dniIdentification',
      headerName: 'DNI',
      minWidth: 100,
      flex: 1,
      editable: false,
      hideable: false,
    },
    {
      field: 'dateOfBirth',
      headerName: 'DOB',
      type: 'date',
      width: 100,
      editable: false,
      valueGetter: (value) => value ? dayjs(value).toDate() : dayjs('2099-01-01').toDate(),
    },
    {
      field: 'dateOfAdmission',
      headerName: 'Admitted',
      type: 'date',
      width: 100,
      editable: false,
      valueGetter: (value) => value ? dayjs(value).toDate() : dayjs('2099-01-01').toDate(),
    },
    {
      field: 'caseNumber',
      headerName: 'Case Number',
      minWidth: 120,
      flex: 1,
      editable: false,
    },
    {
      field: 'sentenceDuration',
      headerName: 'Sentence Duration',
      minWidth: 150,
      flex: 1,
      editable: false,
    },
    {
      field: 'pavillion',
      headerName: 'Pavillion',
      minWidth: 100,
      flex: 1,
      editable: false,
    },
    {
      field: 'cell',
      headerName: 'Cell',
      minWidth: 50,
      flex: 1,
      editable: false,
    },
    {
      field: 'highRisk',
      headerName: 'High Risk',
      minWidth: 80,
      flex: 1,
      editable: false,
      valueGetter: (value) => formatBoolean(value, t),
    },
    {
      field: 'reasonForAdmission',
      headerName: 'Reason',
      minWidth: 100,
      flex: 1,
      editable: false,
    },
    {
      field: 'requireMedicalAttention',
      headerName: 'Require Medical Attention',
      minWidth: 200,
      flex: 1,
      editable: false,
      valueGetter: (value) => formatBoolean(value, t),
    },
    {
      field: 'isolation',
      headerName: 'Isolation',
      minWidth: 80,
      flex: 1,
      editable: false,
      valueGetter: (value) => formatBoolean(value, t),
    },
    {
      field: 'observations',
      headerName: 'Observations',
      minWidth: 200,
      flex: 1,
      editable: false,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      display: 'flex',
      width: 120,
      renderCell: (params) => <CollectionActions
        itemId={params.value}
        editPath="/settings/inmate"
        endpoint="inmates"
        setTimestamp={setTimestamp}
        customActions={[actionConnections]}
      />,
      valueGetter: (value, row) => row.id,
      sortable: false,
      filterable: false,
      hideable: false,
      align: 'left'
    },
  ];

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={["settingsTitle", "settingsUsers"]}
    >
      <DataGrid
        rows={items}
        columns={columns}
        autoPageSize
        density={'compact'}
        loading={loading}
        slotProps={{
          loadingOverlay: {
            variant: 'skeleton',
            noRowsVariant: 'skeleton',
          },
        }}
        hideFooterSelectedRowCount
      />
      <CollectionFabCustom editPath="/settings/inmate" />
    </PageLayout>
  );
};

export default InmatesPage;
