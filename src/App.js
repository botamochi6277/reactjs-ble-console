//@ts-check

import './App.css';
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
  Button, IconButton, Link
} from '@mui/material';

// icons
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import EmojiSymbolsIcon from '@mui/icons-material/EmojiSymbols';
import TerminalIcon from '@mui/icons-material/Terminal';
import NumbersIcon from '@mui/icons-material/Numbers';
import { GitHub } from '@mui/icons-material';


import ServiceCard from './ServiceCard';
import CharacteristicCard from './CharacteristicCard';
import DeviceCard from './DeviceCard';
import service_preset from './ServicePreset';



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
      console.log("This device supports Bluetooth!");
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

// https://www.typescriptlang.org/ja/docs/handbook/jsdoc-supported-types.html#typedef、callbackおよびparam
/**
 * @typedef {Object} CharacteristicPreset 
 * @property {string} name 
 * @property {string} uuid 
 * @property {string} type
 * @property {string} unit 
 * @property {boolean} little_endian 
 */

/**
 * @typedef {Object} ServicePreset
 * @property {string} name
 * @property {string} uuid
 * @property {Array<CharacteristicPreset>} characteristics
 */


/**
 * 
 * @param {{characteristics:Array<BluetoothRemoteGATTCharacteristic>,preset:object}} props 
 * @returns 
 */
function CharacteristicGridCards(props) {
  const characteristics = props.characteristics;
  if (characteristics.length === 0) {
    return (
      <Grid item>
        <Alert severity='info'>Characteristics will appear after connecting device</Alert>
        {/* <Chip label="Characteristics will appear after connecting device"></Chip> */}
      </Grid>
    )
  }

  /**
   * 
   * @param {BluetoothRemoteGATTCharacteristic} ch 
   * @param {ServicePreset} preset 
   * @returns 
   */
  function minicard(ch, preset) {
    const cp = preset.characteristics.find((c) => c.uuid === ch.uuid)
    if (typeof cp === "undefined") {
      return (
        // set default variables
        <Grid item key={ch.uuid} xs={12} md={6} lg={4}>
          <CharacteristicCard
            name={`${ch.uuid.slice(0, 6)}`}
            type="uint8"
            unit=""
            characteristic={ch}
            avatar={<Avatar> <NumbersIcon />  </Avatar>} />
        </Grid>
      );
    }
    return (
      <Grid item key={ch.uuid} xs={12} md={6} lg={4}>
        <CharacteristicCard
          name={cp.name}
          type={cp.type}
          unit={cp.unit}
          characteristic={ch}
          avatar={<Avatar> <NumbersIcon />  </Avatar>} />
      </Grid>
    )
  }

  const cards = characteristics.map(
    (chars) =>
      minicard(chars, props.preset)
  );

  console.debug(`len minicards ${cards.length}`)
  return (
    <>{cards}</>
  );
}


class BLEManager extends React.Component {
  constructor(props) {
    const init_srv = service_preset[0];

    super(props);
    /**
     * @type {{device:BluetoothDevice|null,characteristics:Array<BluetoothRemoteGATTCharacteristic>,service_preset:ServicePreset,log_message:string,candidates:Array<ServicePreset>,search_all_device:boolean}}
     */
    this.state = {
      device: null,// Promise<BluetoothDevice>
      characteristics: [],
      service_preset: init_srv,
      log_message: "console log message will be appear",
      candidates: service_preset,
      search_all_device: false
    }

    this.switchSearchAllDevice = this.switchSearchAllDevice.bind(this);
    this.searchDevice = this.searchDevice.bind(this);
    this.changeService = this.changeService.bind(this);

  }

  /**
   * 
   * @param {boolean} b 
   */
  switchSearchAllDevice(b) {
    this.setState(
      { search_all_device: b }
    );
  }

  changeService(name) {
    const srv = this.state.candidates.find((c) => c.name === name);

    if (typeof srv === "undefined") {
      this.setState({
        service_preset: service_preset[0]
      });

    } else {
      this.setState({
        service_preset: srv
      });
    }
  }

  async searchDevice(e) {
    e.preventDefault();
    let filters = [];
    let filter_service = this.state.service_preset.uuid;
    if (filter_service.startsWith('0x')) {
      const i = parseInt(filter_service);
      if (i) {
        filters.push({ services: [i] });
      }
    }
    else if (filter_service) {
      filters.push({ services: [filter_service] });
    }

    let options = {};
    if (this.state.search_all_device) {
      options.acceptAllDevices = true;
    } else {
      options.filters = filters;
    }

    const msg = `searching for service having uuid: ${this.state.service_preset.uuid}`;
    console.log(msg);
    this.setState({ log_message: msg })
    try {

      const ble_device = await navigator.bluetooth.requestDevice(options);

      if (ble_device === undefined) {
        const unfound_msg = `Available device is not found`
        this.setState({ log_message: `${unfound_msg}` })
        return;
      }
      if (typeof (ble_device) === "undefined") {
        const unfound_msg = `Available device is not found`
        this.setState({ log_message: `${unfound_msg}` })
        return;
      }
      if (ble_device === null) {
        const unfound_msg = `Available device is not found`
        this.setState({ log_message: `${unfound_msg}` })
        return;
      }

      // https://ja.reactjs.org/docs/state-and-lifecycle.html#using-state-correctly
      this.setState({ device: ble_device });// this process may be still async
      this.setState({ log_message: `connecting ${ble_device.name}` })

      console.log(`device name: ${ble_device.name}`);

      console.log('Connecting to GATT Server...');
      if (typeof ble_device.gatt === "undefined") {
        const msg = `NO GATT Server`
        this.setState({ log_message: msg })
        return;
      }
      const server = await ble_device.gatt.connect();

      let target_srv_uuid;
      if (this.state.service_preset.uuid.startsWith('0x')) {
        target_srv_uuid = parseInt(this.state.service_preset.uuid);
      } else {
        target_srv_uuid = this.state.service_preset.uuid;
      }
      console.log('Getting Service...');
      const service = await server.getPrimaryService(target_srv_uuid);

      // get the all characteristic uuids

      console.log('Getting Characteristics...');
      let preset_characteristic_uuids = this.state.service_preset.characteristics.map((c) => c.uuid);
      let characteristics = [];

      for (let index = 0; index < preset_characteristic_uuids.length; index++) {
        let ch_uuid;
        if (preset_characteristic_uuids[index].startsWith('0x')) {
          ch_uuid = parseInt(preset_characteristic_uuids[index]);
        } else {
          ch_uuid = preset_characteristic_uuids[index];
        }
        const characteristic = await service.getCharacteristic(ch_uuid);
        console.log(`Characteristic UUID:  ${characteristic.uuid}`);
        characteristics.push(characteristic);
      }
      this.setState({ characteristics: characteristics });

    } catch (error) {
      console.log(`Argh! ${error}`);
      this.setState({ log_message: `Argh! ${error}` })

    }

  }

  render() {
    return (
      <Stack spacing={1}>
        {/* logger */}
        <Card variant="outlined">
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
            <Alert severity="info">{this.state.log_message}</Alert>
          </CardContent>
        </Card>

        <ServiceCard
          onClick={this.searchDevice}
          onChangeService={this.changeService}
          onChangeSwitch={this.switchSearchAllDevice}
          candidates={this.state.candidates}
          service={this.state.service_preset}
          searchAllDevice={this.state.search_all_device}
        />
        <DeviceCard device={this.state.device} />

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
            <Box sx={{ flexGrow: 1 }}>
              <Grid container spacing={2}>
                <CharacteristicGridCards characteristics={this.state.characteristics} preset={this.state.service_preset} ></CharacteristicGridCards>
              </Grid>
            </Box>
          </CardContent>
        </Card>

      </Stack>
    )
  }
}


function App() {

  return (
    <div className="App">
      <Container>
        <Stack spacing={1}>
          <AppBar position="static">
            <Container maxWidth="xl">
              <Toolbar disableGutters>
                <BluetoothIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                <Typography
                  variant="h6"
                  noWrap
                  component="a"
                  href="/"
                  sx={{
                    mr: 2,
                    display: { xs: 'none', md: 'flex' },
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
        </Stack>
      </Container>

    </div>
  );
}

export default App;
