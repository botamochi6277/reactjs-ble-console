import {
  Alert,
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

  const [search_params, setSearchParams] = useSearchParams(new URLSearchParams(window.location.search));
  const tmp_uuid = search_params.get("srv") ?? "0x180";
  const init_srv = service_preset.find((s) => s.uuid == tmp_uuid) ?? service_preset[0];

  // srv_preset is for searching device
  const [srv_preset, setServicePreset] = React.useState(init_srv);
  // BluetoothDevice|null
  const [device, setDevice] = React.useState<BluetoothDevice | null>(null);
  // characteristics: BluetoothRemoteGATTCharacteristic[]
  const [characteristics, setCharacteristics] = React.useState<CharacteristicWrapper[]>([]);

  const [log_message, setLogMessage] = React.useState("please, search and connect to the target BLE device");
  const [is_search_all_device, setSearchAllDevice] = React.useState(false);

  const changeService = (name: string) => {
    const srv = service_preset.find((c) => c.name === name) ?? service_preset[0];
    setServicePreset(srv);
    // url_search_params.set("srv", srv.uuid);
    setSearchParams({ srv: srv.uuid })
  }

  return (
    <Stack spacing={1}>
      <ServiceCard
        onSearchDevice={() => {
          searchDevice(
            srv_preset.uuid,
            is_search_all_device,
            srv_preset,
            setLogMessage,
            setDevice,
            setCharacteristics,
            () => {
              setLogMessage("Device is disconnected");
              setDevice(null);
              setCharacteristics([]);
            }
          )
        }}
        onChangeService={changeService}
        onChangeAllSearchDevice={(b: boolean) => setSearchAllDevice(b)}
        candidates={service_preset}
        service={srv_preset}
        is_search_all_device={is_search_all_device}
        device={device}
        message={log_message}
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