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
    title: t("sharedConnections"), // Conexiones compartidas
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
      headerName: 'Nombre', // Nombre
      minWidth: 200,
      flex: 1,
      editable: false,
      hideable: false,
    },
    {
      field: 'lastName',
      headerName: 'Apellido', // Apellido
      minWidth: 200,
      flex: 1,
      editable: false,
      hideable: false,
    },
    {
      field: 'dniIdentification',
      headerName: 'DNI', // DNI
      minWidth: 100,
      flex: 1,
      editable: false,
      hideable: false,
    },
    {
      field: 'dateOfBirth',
      headerName: 'Fecha de Nacimiento', // Fecha de Nacimiento
      type: 'date',
      width: 100,
      editable: false,
      valueGetter: (value) => value ? dayjs(value).toDate() : dayjs('2099-01-01').toDate(),
    },
    {
      field: 'dateOfAdmission',
      headerName: 'Fecha de Admisión', // Fecha de Admisión
      type: 'date',
      width: 100,
      editable: false,
      valueGetter: (value) => value ? dayjs(value).toDate() : dayjs('2099-01-01').toDate(),
    },
    {
      field: 'caseNumber',
      headerName: 'Número de Caso', // Número de Caso
      minWidth: 120,
      flex: 1,
      editable: false,
    },
    {
      field: 'sentenceDuration',
      headerName: 'Duración de la Sentencia', // Duración de la Sentencia
      minWidth: 150,
      flex: 1,
      editable: false,
    },
    {
      field: 'pavillion',
      headerName: 'Pabellón', // Pabellón
      minWidth: 100,
      flex: 1,
      editable: false,
    },
    {
      field: 'cell',
      headerName: 'Celda', // Celda
      minWidth: 50,
      flex: 1,
      editable: false,
    },
    {
      field: 'highRisk',
      headerName: 'Alto Riesgo', // Alto Riesgo
      minWidth: 80,
      flex: 1,
      editable: false,
      valueGetter: (value) => formatBoolean(value, t),
    },
    {
      field: 'reasonForAdmission',
      headerName: 'Razón', // Razón
      minWidth: 100,
      flex: 1,
      editable: false,
    },
    {
      field: 'requireMedicalAttention',
      headerName: 'Requiere Atención Médica', // Requiere Atención Médica
      minWidth: 200,
      flex: 1,
      editable: false,
      valueGetter: (value) => formatBoolean(value, t),
    },
    {
      field: 'isolation',
      headerName: 'Aislamiento', // Aislamiento
      minWidth: 80,
      flex: 1,
      editable: false,
      valueGetter: (value) => formatBoolean(value, t),
    },
    {
      field: 'observations',
      headerName: 'Observaciones', // Observaciones
      minWidth: 200,
      flex: 1,
      editable: false,
    },
    {
      field: 'actions',
      headerName: 'Acciones', // Acciones
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
      breadcrumbs={["settingsTitle", "settingsUsers"]} // Títulos de las migas de pan
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