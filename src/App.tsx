import {
  AlertColor,
  Container,
  CssBaseline,
  Stack,
  ThemeProvider,
  createTheme
} from '@mui/material';
import React from 'react';
import { useSearchParams } from "react-router-dom";


import { searchDevice } from "./bluetooth_utils";

// icons

import ConnectingDialog from './ConnectingDialog';
import MyAppBar from './MyAppBar';
import service_preset from './ServicePreset';

import DeviceCard from './DeviceCard';

const BLEManager = () => {

  const [query_params, setQueryParams] = useSearchParams(new URLSearchParams(window.location.search));
  const tmp_uuid = query_params.get("srv") ?? "0x180";
  const initial_srv = service_preset.find((s) => s.uuid == tmp_uuid) ?? service_preset[0];

  // srv_preset is for searching device
  const [srv_preset, setServicePreset] = React.useState(initial_srv);
  const [srv_uuid, setSrvUuid] = React.useState(initial_srv.uuid);
  // BluetoothDevice|null
  const [device, setDevice] = React.useState<BluetoothDevice | null>(null);
  // characteristics: BluetoothRemoteGATTCharacteristic[]
  const [characteristics, setCharacteristics] = React.useState<CharacteristicWrapper[]>([]);

  const [log_message, setLogMessage] = React.useState("please, search for and connect to a BLE device");
  const [log_status, setLogStatus] = React.useState<AlertColor>("info");
  const [is_search_all_device, setSearchAllDevice] = React.useState(false);

  const changeService = (name: string) => {
    const srv = service_preset.find((c) => c.name === name) ?? service_preset[0];
    setServicePreset(srv);
    setQueryParams({ srv: srv.uuid })
    setSrvUuid(srv.uuid);
  }

  return (
    <Stack spacing={1}>
      <ConnectingDialog
        is_opened={!device}
        onSearchDevice={() => {
          searchDevice(
            srv_uuid,
            is_search_all_device,
            (msg: string, status?: string) => { setLogMessage(msg); if (status) { setLogStatus((status as AlertColor)); } else { setLogStatus("info") } },
            setDevice,
            setCharacteristics,
            () => {
              setLogMessage("The device was disconnected");
              setDevice(null);
              setCharacteristics([]);
            }
          )
        }}
        onChangeServicePreset={changeService}
        onChangeAllSearchDevice={(b: boolean) => setSearchAllDevice(b)}
        candidates={service_preset}
        service={srv_preset}
        srv_uuid={srv_uuid}
        is_search_all_device={is_search_all_device}
        device={device}
        message={log_message}
        message_status={log_status}
        setUuid={(ev) => { setSrvUuid(ev.target.value); setQueryParams({ srv: ev.target.value }) }}

      />

      <DeviceCard
        device={device}
        chr_wrappers={characteristics}
        setChrWrappers={setCharacteristics}
      />
    </Stack>
  )
}



function App() {
  const [theme, setTheme] = React.useState(
    createTheme({
      palette: {
        mode: 'dark',
      },
    })
  );

  const toggleTheme = (theme: any) => {
    if (theme.palette.mode === 'dark') {
      setTheme(createTheme({ palette: { mode: 'light', }, }))
    } else {
      setTheme(createTheme({ palette: { mode: 'dark', }, }))
    }
  }
  console.log(`baseurl: ${import.meta.env.BASE_URL}`);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>
        <Stack spacing={1}>
          <MyAppBar theme={theme} onToggleTheme={() => toggleTheme(theme)} />
          <BLEManager ></BLEManager>
        </Stack>
      </Container>
    </ThemeProvider>
  );
}

export default App;