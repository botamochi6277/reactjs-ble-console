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

class BLEManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      device: null,
      service_uuid: "D6F33618-597E-4998-B4A2-33F2BA265706".toLowerCase(),
      characteristic_uuids: [],
    }

    this.searchDevice = this.searchDevice.bind(this);

  }

  async searchDevice(e) {
    e.preventDefault();
    console.log(this.state.service_uuid);
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
    }

  }

  render() {
    return (
      <div>
        <Card variant="outlined">

          <CardContent>
            <Typography variant="h5" component="div">
              Service
            </Typography>
            <TextField
              required
              id="outlined-required"
              label="Service UUID"
              defaultValue={this.state.service_uuid}
            />
            <CardActions>
              <Button variant="contained" onClick={this.searchDevice}>Search</Button>
            </CardActions>
          </CardContent>
        </Card></div>

    )
  }
}


function App() {

  console.log("hello app!")

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <Container>
        <h2>BLE console</h2>
        <BLEManager ></BLEManager>
      </Container>

    </div>
  );
}

export default App;
