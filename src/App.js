//@ts-check

import './App.css';
import React from 'react';

import CharacteristicCard from './CharacteristicCard';


import { Card } from '@mui/material';
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

function DeviceNameClip(props) {
  const device = props.device;
  if (device == null) {
    return <Chip color="warning" icon={<ErrorIcon />} label={"No connected device"} />
  } else {
    return <Chip color="success" icon={<BluetoothIcon />} label={device.name} />
  }
}

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
}


const arduino_imu = {
  service: { uuid: "ABF0E000-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), name: "Arduino IMU" },
  characteristics: [
    { name: "timer", uuid: "ABF0E001-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), type: "uint32", unit: "msec", little_endian: true },
    { name: "acc x", uuid: "ABF0E002-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), type: "float32", unit: "g", little_endian: true },
    { name: "acc y", uuid: "ABF0E003-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), type: "float32", unit: "g", little_endian: true },
    { name: "acc z", uuid: "ABF0E004-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), type: "float32", unit: "g", little_endian: true },
    { name: "gyro x", uuid: "ABF0E005-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), type: "float32", unit: "deg/s", little_endian: true },
    { name: "gyro y", uuid: "ABF0E006-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), type: "float32", unit: "deg/s", little_endian: true },
    { name: "gyro z", uuid: "ABF0E007-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), type: "float32", unit: "deg/s", little_endian: true },
    { name: "temperature", uuid: "ABF0E008-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), type: "float32", unit: "°C", little_endian: true },
  ]
}

function CharacteristicGridCards(props) {
  const characteristics = props.characteristics;
  if (characteristics.length === 0) {
    return (
      <Grid item>
        <Chip label="Characteristics will appear after connecting device"></Chip>
      </Grid>
    )
  }

  // const preset = props.preset;

  function minicard(ch, preset) {
    const cp = preset.characteristics.find((c) => c.uuid === ch.uuid)
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
      service_uuid: arduino_imu.service.uuid,
      characteristic_uuids: arduino_imu.characteristic_uuids,
      service_preset: arduino_imu,
      log_message: "console log message will be appear",
    }

    this.searchDevice = this.searchDevice.bind(this);

  }

  async searchDevice(e) {
    e.preventDefault();
    const msg = `searching for service having uuid: ${this.state.service_preset.service.uuid}`;
    console.log(msg);
    this.setState({ log_message: msg })
    try {
      const ble_device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [this.state.service_uuid] }]
      });

      // https://ja.reactjs.org/docs/state-and-lifecycle.html#using-state-correctly
      this.setState({ device: ble_device });// this process may be still async
      this.setState({ log_message: `connecting ${ble_device.name}` })

      console.log(`device name: ${ble_device.name}`);

      console.log('Connecting to GATT Server...');
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
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h5" component="div">
                  <TabletAndroidIcon /> Device
                </Typography>

                <DeviceNameClip device={this.state.device} />
              </CardContent>
            </Card>
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
