import React from 'react';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import NativeSelect from '@mui/material/NativeSelect';

import { Button, Card } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';

import ErrorIcon from '@mui/icons-material/Error';

import MenuBookIcon from '@mui/icons-material/MenuBook';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EditIcon from '@mui/icons-material/Edit';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PodcastsIcon from '@mui/icons-material/Podcasts';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import NumbersIcon from '@mui/icons-material/Numbers';
const utf8_decoder = new TextDecoder('utf-8')
// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/DataView
const ble_types = [
    { name: 'int8', decoder: (v, o) => v.getInt8(o) },
    { name: 'uint8', decoder: (v, o) => v.getUint8(o) },
    { name: 'int16', decoder: (v, o) => v.getInt16(o) },
    { name: 'uint16', decoder: (v, o) => v.getUint16(o) },
    { name: 'int32', decoder: (v, o) => v.getInt32(o) },
    { name: 'uint32', decoder: (v, o) => v.getUint32(o) },
    { name: 'float32', decoder: (v, o) => v.getFloat32(o) },
    { name: 'float64', decoder: (v, o) => v.getFloat64(o) },
    { name: 'string', decoder: (v, o) => utf8_decoder.decode(v) },
]


function BLETypeSelect(props) {
    const [ble_type, setType] = React.useState('');
    const handleChange = (event) => {
        setType(event.target.value);
        if (props.onChange != null) {
            props.onChange(event.target.value);
        }
    };
    const menus = ble_types.map((b) => <option value={b.name} key={b.name}>{b.name}</option>)

    return (
        <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth size="small">
                <InputLabel id="ble-data-type-select-label" htmlFor="ble-data-type-select">Type</InputLabel>
                <NativeSelect
                    labelId="ble-data-type-select-label"
                    id="ble-data-type-select"
                    defaultValue={'int8'}
                    value={ble_type}
                    label="Type"
                    onChange={handleChange}
                >
                    {menus}
                </NativeSelect>
            </FormControl>
        </Box>);
}

function PropertiesChip(props) {
    // https://developer.mozilla.org/en-US/docs/Web/API/BluetoothCharacteristicProperties
    const properties = props.properties;
    let chip_state = [];

    if (properties.authenticatedSignedWrites) {
        chip_state.push(
            { name: "authenticatedSignedWrites", icon: <EditOutlinedIcon /> }
        )
    }

    if (properties.broadcast) {
        chip_state.push(
            { name: "broadcast", icon: <PodcastsIcon /> }
        )
    }

    if (properties.indicate) {
        chip_state.push(
            { name: "indicate", icon: <LightbulbIcon /> }
        )
    }

    if (properties.notify) {
        chip_state.push(
            { name: "Notify", icon: <NotificationsIcon /> }
        )
    }

    if (properties.read) {
        chip_state.push(
            { name: "Read", icon: <MenuBookIcon /> }
        );
    }

    if (properties.reliableWrite) {
        chip_state.push(
            { name: "reliableWrite", icon: <EditOutlinedIcon /> }
        );
    }

    if (properties.writableAuxiliaries) {
        chip_state.push(
            { name: "writableAuxiliaries", icon: <EditOutlinedIcon /> }
        );
    }

    if (properties.write) {
        chip_state.push(
            { name: "write", icon: <EditIcon /> }
        );
    }

    if (properties.writeWithoutResponse) {
        chip_state.push(
            { name: "writeWithoutResponse", icon: <EditIcon /> }
        );
    }


    const chips = chip_state.map(
        (c) =>
            <Chip label={c.name} icon={c.icon} key={c.name}></Chip>
    )

    return (
        chips
    )
}

function DescriptorsChips(props) {
    const descriptors = props.descriptors;
    if (descriptors.length === 0) {
        return (
            <Chip icon={<ErrorIcon />} label="No Descriptor"></Chip>
        )
    } else {
        const chips = descriptors.map(
            (d) =>
                <Chip key={d} label={d} />
        );
        return chips;
    }
}

function ValueField(props) {
    const v = props.value;

    const readonly = props.readonly;

    let btn = <p />;

    if (readonly) {
        btn = <Button>Write</Button>;
    }

    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <NumbersIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
            <TextField id="input-with-sx" label="value" variant="standard" InputProps={{
                readOnly: readonly,
            }} value={v} />
            {btn}
        </Box>
    );
}

class CharacteristicCard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            characteristic: props.characteristic,
            type: "na",
            avatar: props.avatar,
            name: "test",
            value: 0,
            descriptors: [],
            decoder: (v, o) => v.getInt8(o)
        }

        this.is_reading_dscp = false;
        // this.searchDevice = this.searchDevice.bind(this);
        this.readValue = this.readValue.bind(this);
        this.readDescriptors = this.readDescriptors.bind(this);
        this.changeBleType = this.changeBleType.bind(this);
    }

    changeBleType(v) {
        // v is string of new type name
        const t = ble_types.find(element => element.name === v)
        this.setState(
            {
                type: t.name,
                decoder: t.decoder
            }
        );
    }


    // https://developer.mozilla.org/en-US/docs/Web/API/BluetoothRemoteGATTCharacteristic

    async readValue(event) {
        if (this.state.characteristic === null) {
            return;
        }
        event.stopPropagation();
        event.preventDefault();
        console.log(`reading value of ${this.state.characteristic.uuid}`);
        const dw = await this.state.characteristic.readValue();//dataview
        const v = this.state.decoder(dw, 0);
        console.log(`dwalue = ${v}`);
        this.setState({ value: v });
    }

    async readDescriptors() {
        this.is_reading_dscp = true;
        // https://googlechrome.github.io/samples/web-bluetooth/read-descriptors-async-await.html
        if (this.state.characteristic === null) {
            return;
        }
        let decoder = new TextDecoder('utf-8')

        const descriptors = await this.state.characteristic.getDescriptors();

        let dscp = [];

        for (let index = 0; index < descriptors.length; index++) {
            const descriptor = descriptors[index];
            console.log(`descriptor uuid: ${descriptor.uuid}`);
            switch (descriptor.uuid) {
                case "00002901-0000-1000-8000-00805f9b34fb":
                    // Characteristic User Descriptor
                    const v = await descriptor.readValue();
                    console.log(`${decoder.decode(v)}`);
                    dscp.push(decoder.decode(v));
                    this.setState(
                        { name: decoder.decode(v) }
                    );

                    break;
                case "00002902-0000-1000-8000-00805f9b34fb":
                    // Client Characteristic Configuration descriptor.
                    const v2 = await descriptor.readValue();
                    console.log(`${decoder.decode(v2)}`);
                    dscp.push(decoder.decode(v2));
                    break;
                default: {
                    console.log(`Unknown Descriptor: ${descriptor.uuid}`);
                    console.log(`type: ${typeof (descriptor.uuid)}`);
                }
            }
        }

        this.setState({ descriptors: dscp });

        this.is_reading_dscp = false;
    }

    render() {

        if (this.state.descriptors.length === 0) {
            if (this.is_reading_dscp === false) {
                this.readDescriptors();
            }
        }

        const uuid = this.state.characteristic.uuid;
        // BluetoothCharacteristicProperties
        const properties = this.state.characteristic.properties;
        // const value = this.state.characteristic.value;
        const value = this.state.value;

        let readonly = !properties.write;

        if (this.state.characteristic == null) {
            return (
                <Card>
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
                    {/* <DescriptorsChips descriptors={this.state.descriptors} /> */}

                    <PropertiesChip properties={properties} readonly={readonly} />
                    <Chip label={uuid} variant="outlined" avatar={<Avatar>uuid</Avatar>} />

                    <CardActions>
                        <BLETypeSelect onChange={this.changeBleType} />
                        <Button variant="contained" onClick={this.readValue}>Read Value</Button>
                    </CardActions>
                    <ValueField value={value} />
                </CardContent>
            </Card>
        )


    }


}


export default CharacteristicCard;