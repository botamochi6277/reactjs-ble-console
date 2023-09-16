import React from 'react';

import {
  CardHeader, Card,
  CardContent,
  Box,
  Container,
  Alert,
  Grid,
  Avatar,
  Stack,
  AppBar,
  Toolbar,
  Typography,
  Link,
  Button,
  createTheme, ThemeProvider, CssBaseline, SelectChangeEvent,
} from '@mui/material';



import { readValue, ble_data_formats, searchDevice } from "./bluetooth_utils";

// icons
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import EmojiSymbolsIcon from '@mui/icons-material/EmojiSymbols';
import TerminalIcon from '@mui/icons-material/Terminal';
import NumbersIcon from '@mui/icons-material/Numbers';
import { GitHub } from '@mui/icons-material';


import ServiceCard from './ServiceCard';
import CharacteristicCard from './CharacteristicCard';
import service_preset from './ServicePreset';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';



function BLEAvailableAlert() {
  // https://developer.mozilla.org/en-US/docs/Web/API/Bluetooth/getAvailability

  if (typeof (navigator.bluetooth) === "undefined") {
    return (
      <Alert severity="error">
        Web Bluetooth API is unavailable with this browser.
        Google Chrome is recommended.
      </Alert>
    );
  }


  navigator.bluetooth.getAvailability().then(available => {
    if (available) {
      // console.log("This device supports Bluetooth!");
      return (
        <div > </div>
      );
    }
    else {
      console.log("Doh! Bluetooth is not supported");
      return (
        <Alert severity="error">Bluetooth is not supported</Alert>
      );
    }
  });
  return (
    <div > </div>
  );
}

function CharacteristicGridCards(props: {
  characteristics: CharacteristicWrapper[],
  setCharacteristics: (chs: CharacteristicWrapper[]) => void,
}) {
  function mini_card(
    ch: CharacteristicWrapper,
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


    const readValueHandle = (ch: CharacteristicWrapper) => {
      readValue(ch).then((v) => {
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
      <Grid item key={`${ch.characteristic.uuid}-${idx}`} xs={12} md={6} lg={4}>
        <CharacteristicCard
          characteristic={ch}
          readValueHandle={() => { readValueHandle(ch) }}
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

  const init_srv = service_preset[0];
  // srv_preset is for searching device
  const [srv_preset, setServicePreset] = React.useState(init_srv);
  // BluetoothDevice|null
  const [device, setDevice] = React.useState<BluetoothDevice | null>(null);
  // characteristics: BluetoothRemoteGATTCharacteristic[]
  const [characteristics, setCharacteristics] = React.useState<CharacteristicWrapper[]>([]);

  const [log_message, setLogMessage] = React.useState("console log message will be appear");
  const [is_search_all_device, setSearchAllDevice] = React.useState(false);


  const changeService = (name: string) => {
    const srv = service_preset.find((c) => c.name === name);
    if (srv) {
      setServicePreset(srv);
    } else {
      setServicePreset(service_preset[0]);
    }
  }


  return (
    <Stack spacing={1}>
      {/* logger */}
      <Card>
        <CardHeader
          avatar={
            <Avatar sx={{ width: 36, height: 36 }}>
              <TerminalIcon />
            </Avatar>
          }
          title="Console Log"
          titleTypographyProps={{ variant: 'h5' }}
        ></CardHeader>
        <CardContent>
          <BLEAvailableAlert />
          <Alert severity="info">{log_message}</Alert>
        </CardContent>
      </Card>

      <ServiceCard
        onSearchDevice={() => {
          searchDevice(
            srv_preset.uuid,
            is_search_all_device,
            srv_preset,
            setLogMessage,
            setDevice,
            setCharacteristics
          )
        }}
        onChangeService={changeService}
        onChangeAllSearchDevice={(b: boolean) => setSearchAllDevice(b)}
        candidates={service_preset}
        service={srv_preset}
        is_search_all_device={is_search_all_device}
        device={device}
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
          <AppBar position="static" color="primary" enableColorOnDark>
            <Container maxWidth="xl">
              <Toolbar disableGutters>
                <BluetoothIcon sx={{ display: { md: 'flex' }, mr: 1 }} />
                <Typography
                  variant="h6"
                  noWrap
                  component="a"
                  href="/"
                  sx={{
                    mr: 2,
                    display: { xs: 'none', sm: 'flex' },
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '.3rem',
                    color: 'inherit',
                    textDecoration: 'none',
                  }}
                >
                  BLE WEB Console
                </Typography>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                </Typography>
                <Link color="inherit" href='https://github.com/botamochi6277/reactjs-ble-console' target='_blank' >
                  <GitHub />
                </Link>
              </Toolbar></Container></AppBar>

          <BLEManager ></BLEManager>

          <Button
            startIcon={theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            variant="outlined"
            color="secondary"
            onClick={() => toggleTheme(theme)}
            fullWidth
          >
            {theme.palette.mode} mode
          </Button>
        </Stack>
      </Container>
    </ThemeProvider>

  );
}

export default App;