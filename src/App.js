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
import AbcIcon from '@mui/icons-material/Abc';


class BLEServiceModel {
  constructor(props) {
    this.srv_uuid = props.service_uuid;

  }

}

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
      return;
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
  service_uuid: "ABF0E000-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(),
  characteristic_uuids: [
    "ABF0E001-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), // acc x
    "ABF0E002-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), // acc y
    "ABF0E003-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), // acc z
    "ABF0E004-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), // gyro x
    "ABF0E005-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), // gyro y
    "ABF0E006-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), // gyro z
    "ABF0E007-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), // temperature
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

  const cards = characteristics.map(
    (chars) =>
      <Grid item key={chars.uuid} xs={12} md={6} lg={4}>
        <CharacteristicCard name="test" type="int" characteristic={chars} avatar={<Avatar> <NumbersIcon />  </Avatar>} />
      </Grid>
  );

  return cards;
}


class BLEManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      device: null,// Promise<BluetoothDevice>
      characteristics: [],
      service_uuid: arduino_imu.service_uuid,
      characteristic_uuids: arduino_imu.characteristic_uuids,
      log_message: "console log message will be appear",
    }

    this.searchDevice = this.searchDevice.bind(this);

  }

  async searchDevice(e) {
    e.preventDefault();
    console.log(this.state.service_uuid);
    this.setState({ log_message: `service uuid = ${this.state.service_uuid}` })
    try {
      const ble_device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [this.state.service_uuid] }]
      });

      // https://ja.reactjs.org/docs/state-and-lifecycle.html#using-state-correctly
      this.setState({ device: ble_device });// this process may be still async

      console.log(`device name: ${ble_device.name}`);
      // console.log(`state.device name: ${this.device.name}`); // null access error

      console.log('Connecting to GATT Server...');
      const server = await ble_device.gatt.connect();

      console.log('Getting Service...');
      const service = await server.getPrimaryService(this.state.service_uuid);

      // get the all characteristic uuids

      console.log('Getting Characteristics...');
      let characteristics = [];
      for (let index = 0; index < this.state.characteristic_uuids.length; index++) {
        const uuid = this.state.characteristic_uuids[index];
        const characteristic = await service.getCharacteristic(uuid);
        console.log(`Characteristic UUID:  ${characteristic.uuid}`);
        characteristics.push(characteristic);
      }
      this.setState({ characteristics: characteristics });
      // get value

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
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
              {this.state.log_message}
            </Typography>
          </CardContent>
        </Card>

        {/* service */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h5" component="div">
              <FunctionsIcon /> Service
            </Typography>
            <Stack direction="row" spacing={1}>
              {/* https://zenn.dev/enish/articles/5cc332d3eeb1a7 */}
              <TextField
                required
                style={{ width: 400 }}
                id="outlined-required"
                label="Service UUID"
                defaultValue={this.state.service_uuid}
              />
              <CardActions>
                <Button variant="contained" onClick={this.searchDevice} startIcon={<SearchIcon />}>Search for Device</Button>
              </CardActions>
            </Stack>

          </CardContent>
        </Card>

        {/* device */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h5" component="div">
              <TabletAndroidIcon /> Device
            </Typography>

            <DeviceNameClip device={this.state.device} />
          </CardContent>
        </Card>


        {/* Characteristics */}
        <Card>
          <CardContent>
            <Typography variant="h5" component="div">
              <EmojiSymbolsIcon /> Characteristics
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <Grid container spacing={2}>
                <CharacteristicGridCards characteristics={this.state.characteristics}  ></CharacteristicGridCards>
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
