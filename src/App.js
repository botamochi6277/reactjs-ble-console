import logo from './logo.svg';
import './App.css';
import React from 'react';
import { Card } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';

import BluetoothIcon from '@mui/icons-material/Bluetooth';
import SearchIcon from '@mui/icons-material/Search';
import NumbersIcon from '@mui/icons-material/Numbers';
import AbcIcon from '@mui/icons-material/Abc';


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



class BLEManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      device: null,// Promise<BluetoothDevice>
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
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [this.state.service_uuid] }]
      });

      // https://ja.reactjs.org/docs/state-and-lifecycle.html#using-state-correctly
      this.setState((state, device) => ({ device: device }));// this process may be still async

      console.log(`device name: ${device.name}`);
      // console.log(`state.device name: ${this.device.name}`); // null access error

      console.log('Connecting to GATT Server...');
      const server = await device.gatt.connect();

      console.log('Getting Service...');
      const service = await server.getPrimaryService(this.state.service_uuid);

      // get the all characteristic uuids

      console.log('Getting Characteristic...');
      const characteristic = await service.getCharacteristic(this.state.characteristic_uuids[0]);

      console.log(`Characteristic UUID:  ${characteristic.uuid}`);

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
            <Typography variant="h5" component="div">Console Log</Typography>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
              {this.state.log_message}
            </Typography>
          </CardContent>
        </Card>

        {/* device */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h5" component="div">
              Service
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

        {/* Characteristics */}
        <Card>
          <CardContent>
            <Typography variant="h5" component="div">
              Characteristics
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <Grid container spacing={2}>
                <Grid item>
                  <CharacteristicCard name="test" uuid="0x1234" type="int" avatar={<Avatar> <NumbersIcon />  </Avatar>} value={3} />
                </Grid>
                <Grid item>
                  <CharacteristicCard name="test2" uuid="0x5678" type="char" avatar={<Avatar> <AbcIcon />  </Avatar>} value={"a"} />
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>


      </div>


    )
  }
}



function CharacteristicCard(props) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div">{props.name}</Typography>

        <Stack direction="row" spacing={1}>
          <Chip label={props.type} avatar={props.avatar} />
          <Chip label={props.uuid} variant="outlined" />
        </Stack>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {props.value}
        </Typography>

      </CardContent>
    </Card>
  )
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
