import {
  Alert,
  AlertColor,
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Container,
  CssBaseline,
  Grid,
  SelectChangeEvent,
  Stack,
  ThemeProvider,
  createTheme
} from '@mui/material';
import React from 'react';
import { useSearchParams } from "react-router-dom";


import { ble_data_formats, readValue, searchDevice } from "./bluetooth_utils";

// icons
import EmojiSymbolsIcon from '@mui/icons-material/EmojiSymbols';
import NumbersIcon from '@mui/icons-material/Numbers';

import CharacteristicCard from './CharacteristicCard';
import MyAppBar from './MyAppBar';
import ServiceCard from './ServiceCard';
import service_preset from './ServicePreset';

function CharacteristicGridCards(props: {
  characteristics: CharacteristicWrapper[],
  setCharacteristics: (chs: CharacteristicWrapper[]) => void,
}) {
  function mini_card(
    chr_wrapper: CharacteristicWrapper,
    idx: number) {

    const changeBleType = (ev: SelectChangeEvent) => {
      const new_type = ble_data_formats.find(element => element.name === ev.target.value);
      if (!new_type) { return; }
      props.setCharacteristics(
        props.characteristics.map((c, i) => {
          if (i === idx) {
            return {
              characteristic: c.characteristic,
              name: c.name,
              config: c.config,
              data_type: new_type,
              prefix: c.prefix,
              unit: c.unit,
              decoder: new_type.decoder,
              encoder: new_type.encoder,
              value: c.value
            };
          }
          else { return c; }
        })
      );


    }


    const readValueHandle = (chr_wrapper: CharacteristicWrapper) => {
      readValue(chr_wrapper).then((v) => {
        props.setCharacteristics(
          props.characteristics.map((c, i) => {
            if (i === idx) {
              return {
                characteristic: c.characteristic,
                name: c.name,
                config: c.config,
                data_type: c.data_type,
                prefix: c.prefix,
                unit: c.unit,
                value: v ?? "none"
              };
            }
            else { return c; }
          })
        );
      });
    }

    const notifyValueHandle = (ev: any) => {
      if (!ev.target) { return; }
      let v = ev.target.value as DataView;
      props.setCharacteristics(
        props.characteristics.map((c, i) => {
          if (i === idx) {
            return {
              characteristic: c.characteristic,
              name: c.name,
              config: c.config,
              data_type: c.data_type,
              prefix: c.prefix,
              unit: c.unit,
              value: c.data_type.decoder(v, 0)
            };
          }
          else { return c; }
        })
      );
    }

    return (
      <Grid item key={`${chr_wrapper.characteristic.uuid}-${idx}`} xs={12} md={6} lg={4}>
        <CharacteristicCard
          characteristic={chr_wrapper}
          readValueHandle={() => { readValueHandle(chr_wrapper) }}
          notifyHandle={notifyValueHandle}
          changeBleType={changeBleType}
          avatar={<Avatar> <NumbersIcon />  </Avatar>} />
      </Grid>
    )
  }

  const cards = props.characteristics.map(
    (char, i) =>
      mini_card(char, i)
  );

  return (
    <>{cards}</>
  );
}


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

  const [log_message, setLogMessage] = React.useState("please, search and connect to the target BLE device");
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
      <ServiceCard
        onSearchDevice={() => {
          searchDevice(
            srv_uuid,
            is_search_all_device,
            (msg: string, status?: string) => { setLogMessage(msg); if (status) { setLogStatus((status as AlertColor)); } else { setLogStatus("info") } },
            setDevice,
            setCharacteristics,
            () => {
              setLogMessage("Device is disconnected");
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

      {/* Characteristics */}
      <Card>
        <CardHeader
          avatar={
            <Avatar sx={{ width: 36, height: 36 }}>
              <EmojiSymbolsIcon />
            </Avatar>
          }
          title="Characteristics"
          titleTypographyProps={{ variant: 'h5' }}
        ></CardHeader>
        <CardContent>
          {
            characteristics.length === 0 &&
            <Alert severity='info'>Characteristics will appear after connecting device</Alert>
          }

          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
              <CharacteristicGridCards
                characteristics={characteristics}
                setCharacteristics={setCharacteristics}
              />
            </Grid>
          </Box>
        </CardContent>
      </Card>
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