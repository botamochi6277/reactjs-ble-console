import React from 'react';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';


import { Button, Card } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import { render } from '@testing-library/react';


function PropertiesChip(props) {
    const properties = props.properties;
    /** @type {string}  */
    let s = "";
    if (properties.read) {
        s += "Read|"
    }
    if (properties.write) {
        s += "Write|"
    }
    if (properties.notify) {
        s += "Notify";
    }
    return (
        <Chip label={s} />
    )
}

class CharacteristicCard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            characteristic: props.characteristic,
            type: "na",
            avatar: props.avatar,
            name: "test",
            desp: []
        }

        this.is_reading_desp = false;
        // this.searchDevice = this.searchDevice.bind(this);
        this.readValue = this.readValue.bind(this);
        this.readDescriptors = this.readDescriptors.bind(this);
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/BluetoothRemoteGATTCharacteristic

    async readValue(event) {
        if (this.state.characteristic === null) {
            return;
        }
        event.stopPropagation();
        event.preventDefault();
        console.log(`reading value of ${this.state.characteristic.uuid}`);
        const v = await this.state.characteristic.readValue();
        console.log(`value = ${v.getUint8(0)}`);
        this.setState({ value: v.getUint8(0) });
    }

    async readDescriptors() {
        this.is_reading_desp = true;
        // https://googlechrome.github.io/samples/web-bluetooth/read-descriptors-async-await.html
        if (this.state.characteristic === null) {
            return;
        }
        let decoder = new TextDecoder('utf-8')

        const descriptors = await this.state.characteristic.getDescriptors();
        const desps = descriptors.map((d) => d.value);

        this.setState({ desp: desps });


        for (let index = 0; index < descriptors.length; index++) {
            const element = descriptors[index];
            let v = await element.readValue();
            console.log(`descriptor uuid: ${element.uuid}`)
            console.log(`${decoder.decode(v)}`)
        }

        this.is_reading_desp = false;
    }

    render() {

        if (this.state.desp.length === 0) {
            if (this.is_reading_desp === false) {
                this.readDescriptors();
            }
        }

        const uuid = this.state.characteristic.uuid;
        // BluetoothCharacteristicProperties
        const properties = this.state.characteristic.properties;
        // const value = this.state.characteristic.value;
        const value = this.state.value;

        if (this.state.characteristic == null) {
            return (<Card>
                <CardContent>
                    <Typography variant="h5" component="div">{this.state.name}</Typography>
                </CardContent>
            </Card>
            )
        }

        return (
            <Card>
                <CardContent>
                    <Typography variant="h5" component="div">{this.state.name}</Typography>

                    <PropertiesChip properties={properties} />
                    <Stack direction="row" spacing={1}>
                        <Chip label={this.state.type} avatar={this.state.avatar} />
                        <Chip label={uuid} variant="outlined" />
                    </Stack>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                        {value}
                    </Typography>
                    <CardActions>
                        <Button variant="contained" onClick={this.readValue}>Read Value</Button>
                    </CardActions>

                </CardContent>
            </Card>
        )


    }


}


export default CharacteristicCard;