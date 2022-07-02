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


class BLEManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      device: null,
      service_uuid: "D6F33618-597E-4998-B4A2-33F2BA265706".toLowerCase(),
      characteristic_uuids: [],
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
      this.setState({ device: device })

      console.log('Connecting to GATT Server...');
      const server = await this.state.device.gatt.connect();

      console.log('Getting Service...');
      const service = await server.getPrimaryService(this.state.service_uuid);

      console.log('Getting Characteristic...');
      const characteristic = await service.getCharacteristic(this.state.characteristic_uuids[0]);

      console.log(`Characteristic UUID:  ${characteristic.uuid}`);

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
            <TextField
              required
              fullWidth
              id="outlined-required"
              label="Service UUID"
              defaultValue={this.state.service_uuid}
            />
            <CardActions>
              <Button variant="contained" onClick={this.searchDevice}>Search for Device</Button>
            </CardActions>
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
                  <CharacteristicCard name="test" uuid="0x1234" type="int" value={3} />
                </Grid>
                <Grid item>
                  <CharacteristicCard name="test2" uuid="0x5678" type="char" value={"a"} />
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
          <Chip label={props.type} />
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
        <h1>BLE console</h1>
        <BLEManager ></BLEManager>
      </Container>

    </div>
  );
}

export default App;
