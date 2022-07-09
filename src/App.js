//@ts-check

import './App.css';
import React from 'react';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';

import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';

import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';

// icons
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import SearchIcon from '@mui/icons-material/Search';
import FunctionsIcon from '@mui/icons-material/Functions';
import TabletAndroidIcon from '@mui/icons-material/TabletAndroid';
import EmojiSymbolsIcon from '@mui/icons-material/EmojiSymbols';
import TerminalIcon from '@mui/icons-material/Terminal';
import ErrorIcon from '@mui/icons-material/Error';

import NumbersIcon from '@mui/icons-material/Numbers';


import ServiceCard from './ServiceCard';
import CharacteristicCard from './CharacteristicCard';
import DeviceCard from './DeviceCard';
import ServicePreset from './ServicePreset';

const service_preset = ServicePreset();

function BLEAvailableAlert() {
  // https://developer.mozilla.org/en-US/docs/Web/API/Bluetooth/getAvailability

  if (typeof (navigator.bluetooth) === "undefined") {
    return (
      <Alert severity="error">Web Bluetooth API is unavailable with this browser</Alert>
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


const arduino_imu = service_preset.find((p) => p.name === "Arduino IMU");


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
        <Chip label="Characteristics will appear after connecting device"></Chip>
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
        <></>
      );
    }
    return (
      <Grid item key={ch.uuid} xs={12} md={6} lg={4}>
        <CharacteristicCard name={cp.name} type={cp.type} characteristic={ch} avatar={<Avatar> <NumbersIcon />  </Avatar>} />
      </Grid>
    )
  }

  const cards = characteristics.map(
    (chars) =>
      minicard(chars, props.preset)
  );

  console.log(`len minicards ${cards.length}`)
  return cards;
}


class BLEManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      device: null,// Promise<BluetoothDevice>
      characteristics: [],
      service_uuid: arduino_imu.uuid,
      characteristic_uuids: arduino_imu.characteristics.map((c) => c.uuid),
      service_preset: arduino_imu,
      log_message: "console log message will be appear",
    }

    this.searchDevice = this.searchDevice.bind(this);

  }

  async searchDevice(e) {
    e.preventDefault();
    const msg = `searching for service having uuid: ${this.state.service_preset.uuid}`;
    console.log(msg);
    this.setState({ log_message: msg })
    try {
      const ble_device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [this.state.service_uuid] }]
      });

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

      console.log('Getting Service...');
      const service = await server.getPrimaryService(this.state.service_uuid);

      // get the all characteristic uuids

      console.log('Getting Characteristics...');
      let preset_characteristic_uuids = this.state.service_preset.characteristics.map((c) => c.uuid);
      let characteristics = [];

      for (let index = 0; index < preset_characteristic_uuids.length; index++) {
        const uuid = preset_characteristic_uuids[index];
        const characteristic = await service.getCharacteristic(uuid);
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
      <div>
        {/* logger */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h5" component="div"> <TerminalIcon />  Console Log</Typography>
            <BLEAvailableAlert />
            <Alert severity="info">{this.state.log_message}</Alert>
          </CardContent>
        </Card>

        <Grid container spacing={2}>
          <Grid item xs={12} md={8} lg={8}>
            {/* service */}
            <ServiceCard serviceUuid={this.state.service_uuid} onClick={this.searchDevice} />
          </Grid>
          <Grid item xs={12} md={4} lg={4}>
            {/* device */}
            <DeviceCard device={this.state.device} />
          </Grid>
        </Grid>

        {/* Characteristics */}
        <Card>
          <CardContent>
            <Typography variant="h5" component="div">
              <EmojiSymbolsIcon /> Characteristics
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <Grid container spacing={2}>
                <CharacteristicGridCards characteristics={this.state.characteristics} preset={this.state.service_preset} ></CharacteristicGridCards>
              </Grid>
            </Box>
          </CardContent>
        </Card>

      </div>
    )
  }
}


function App() {

  console.log("hello app!")

  return (
    <div className="App">
      <Container>
        <h1> <BluetoothIcon />  BLE console</h1>
        <BLEManager ></BLEManager>
      </Container>

    </div>
  );
}

export default App;
