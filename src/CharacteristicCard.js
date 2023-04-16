import React from 'react';

import {
    Button, Card, CardHeader, CardContent, CardActions, Typography,
    Chip,
    InputAdornment,
    InputLabel,
    FormControl,
    Box,
    Avatar,
    TextField,
    Select,
    MenuItem,
    Stack
} from '@mui/material';

import MenuBookIcon from '@mui/icons-material/MenuBook';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EditIcon from '@mui/icons-material/Edit';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PodcastsIcon from '@mui/icons-material/Podcasts';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import NumbersIcon from '@mui/icons-material/Numbers';
import { grey } from '@mui/material/colors';

const utf8_decoder = new TextDecoder('utf-8')


// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/DataView
const ble_types = [
    { name: 'int8', hex: 0x0C, decoder: (v, offset) => v.getInt8(offset, true) },
    { name: 'uint8', hex: 0x04, decoder: (v, offset) => v.getUint8(offset, true) },
    { name: 'int16', hex: 0x0E, decoder: (v, offset) => v.getInt16(offset, true) },
    { name: 'uint16', hex: 0x06, decoder: (v, offset) => v.getUint16(offset, true) },
    { name: 'int32', hex: 0x10, decoder: (v, offset) => v.getInt32(offset, true) },
    { name: 'uint32', hex: 0x08, decoder: (v, offset) => v.getUint32(offset, true) },
    { name: 'float32', hex: 0x14, decoder: (v, offset) => `${v.getFloat32(offset, true).toFixed(4)}` },
    { name: 'float64', hex: 0x15, decoder: (v, offset) => `${v.getFloat64(offset, true).toFixed(4)}` },
    { name: 'string', hex: 0x00, decoder: (v, offset) => utf8_decoder.decode(v) },
];

const ble_units = [
    { name: 'acc', unit: 'm/s^2', hex: 0x2713 }
];

function BLETypeSelect(props) {
    // const [ble_type, setType] = React.useState('');
    const handleChange = (event) => {
        // setType(event.target.value);
        if (props.onChange != null) {
            props.onChange(event.target.value);
        }
    };

    const menus = ble_types.map((b) => <MenuItem value={b.name} key={b.name}>{b.name}</MenuItem>)

    return (
        <Box >
            <FormControl size='small' variant="standard">
                <InputLabel id="ble-data-type-select-label" htmlFor="ble-data-type-select">format</InputLabel>
                <Select
                    fullWidth
                    // labelId="ble-data-type-select-label"
                    // id="ble-data-type-select"
                    value={props.value}
                    label="format"
                    onChange={handleChange}
                    inputProps={{
                        name: 'format',
                        id: 'ble-data-type-select',
                    }}
                >
                    {menus}
                </Select>
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

    // https://bobbyhadz.com/blog/react-cannot-be-used-as-a-jsx-component
    return (
        <>
            {chips}
        </>
    )
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

            <TextField id="input-with-sx" label="value" variant="standard"
                InputProps={{
                    readOnly: readonly,
                    style: { textAlign: 'right' },
                    startAdornment: (
                        <InputAdornment position="start">
                            <NumbersIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                        </InputAdornment>
                    ),
                    endAdornment: <InputAdornment position="end">{props.unit}</InputAdornment>
                }} value={v} />
            {btn}
        </Box>
    );
}

class CharacteristicCard extends React.Component {

    constructor(props) {
        super(props);

        const t = props.type;
        const decoder = ble_types.find((b) => b.name === t)?.decoder;

        this.state = {
            characteristic: props.characteristic,
            type: props.type, // value format
            avatar: props.avatar,
            name: props.name,
            unit: props.unit,
            value: 0,
            descriptors: [],
            decoder: decoder
        }
        // private params
        this.is_reading_dscp = false;
        this.is_notifying = false;
        // this.searchDevice = this.searchDevice.bind(this);
        this.readValue = this.readValue.bind(this);
        this.readDescriptors = this.readDescriptors.bind(this);
        this.changeBleType = this.changeBleType.bind(this);
        this.handleNotifications = this.handleNotifications.bind(this);
    }

    changeBleType(v) {
        // v is string of new type name
        const t = ble_types.find(element => element.name === v)
        this.setState(
            {
                type: t ? t.name : "string",
                decoder: t ? t.decoder : ble_types['string'].decoder
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
        const dv = await this.state.characteristic.readValue();//dataview
        const v = this.state.decoder ? this.state.decoder(dv, 0) : 0;
        console.log(`value = ${v}, byte_length = ${dv.buffer.byteLength}`);

        this.setState({ value: v });
    }

    async readDescriptors() {
        this.is_reading_dscp = true;
        // https://googlechrome.github.io/samples/web-bluetooth/read-descriptors-async-await.html
        if (this.state.characteristic === null) {
            return;
        }
        let txt_decoder = new TextDecoder('utf-8')

        const descriptors = await this.state.characteristic.getDescriptors();

        let dscp = [];

        for (let index = 0; index < descriptors.length; index++) {
            const descriptor = descriptors[index];
            console.debug(`descriptor uuid: ${descriptor.uuid}`);
            switch (descriptor.uuid) {
                case "00002901-0000-1000-8000-00805f9b34fb":
                    // Characteristic User Descriptor
                    const v = await descriptor.readValue();
                    console.debug(`${txt_decoder.decode(v)}`);
                    dscp.push(txt_decoder.decode(v));
                    // string
                    this.setState(
                        { name: txt_decoder.decode(v) }
                    );

                    break;
                case "00002902-0000-1000-8000-00805f9b34fb":
                    // Client Characteristic Configuration descriptor.
                    const v2 = await descriptor.readValue();
                    console.debug(`${txt_decoder.decode(v2)}`);
                    // int
                    dscp.push(txt_decoder.decode(v2));
                    break;
                case "00002904-0000-1000-8000-00805f9b34fb":
                    // Characteristic Presentation Format
                    const p_view = await descriptor.readValue();
                    // p_view: dataview
                    // format | exponent |unit|namespace|description
                    // 1      | 1        | 2  | 1       | 2
                    // console.log(`Presentation view: ${p_view.byteLength} bytes`)
                    // for (let index = 0; index < p_view.byteLength; index++) {
                    //     const element = p_view.getUint8(index, true);
                    //     console.log(`[${index}]: 0x${element.toString(16)}`)
                    // }
                    // console.log(`Presentation view: 0x${p_view.getUint32(0).toString(16)}`)
                    const len = p_view.byteLength;
                    const fmt = p_view.getUint8(0, false);
                    const exp = p_view.getUint8(1, true);
                    const unit = p_view.getUint16(2, true);
                    const ns = p_view.getUint8(4, true);

                    console.debug(`fmt: 0x${fmt.toString(16)}`)
                    console.debug(`exp: 0x${exp.toString(16)}`)
                    console.debug(`unit: 0x${unit.toString(16)}`)
                    console.debug(`ns: 0x${ns.toString(16)}`)

                    const format_item = ble_types.find((b) => b.hex === fmt);
                    const unit_item = ble_units.find((b) => b.hex === unit);

                    if (!format_item) { console.debug(`no format: 0x${fmt.toString(16)}`); return; }
                    if (!unit_item) { console.debug('no unit'); return; }

                    this.setState(
                        {
                            type: format_item.name,
                            decoder: format_item.decoder,
                            unit: unit_item.unit
                        }
                    )
                    // const n = p_view.getUint8(0, true);
                    // dscp.push(n);
                    break;
                default:
                    console.log(`Unprepared Descriptor: ${descriptor.uuid}`);
                    console.log(`type: ${typeof (descriptor.uuid)}`);
                    break;

            }
        }

        this.setState({ descriptors: dscp });

        this.is_reading_dscp = false;
    }


    handleNotifications(event) {
        let value = event.target.value;
        const v = this.state.decoder ? this.state.decoder(value, 0) : 0;
        this.setState({ value: v });
    }

    render() {

        if (this.state.descriptors.length === 0) {
            if (this.is_reading_dscp === false) {
                this.readDescriptors();
            }
        }

        const uuid = this.state.characteristic ? this.state.characteristic.uuid : "0x00";
        // BluetoothCharacteristicProperties
        const properties = this.state.characteristic ? this.state.characteristic.properties : undefined;
        // const value = this.state.characteristic.value;
        const value = this.state.value;

        let readonly = properties ? !properties.write : true;

        if (this.state.characteristic == null) {
            return (
                <Card>
                    <CardContent>
                        <Typography variant="h5" component="div">{this.state.name}</Typography>
                    </CardContent>
                </Card>
            )
        }


        if (properties?.notify) {
            if (!this.is_notifying) {
                // start notifying
                this.is_notifying = true;
                const callback = this.handleNotifications;
                this.state.characteristic.startNotifications().then(_ => {
                    this.state.characteristic.addEventListener(
                        'characteristicvaluechanged',
                        callback);
                });
            }
        }

        const ReadValBtn = (props) => {
            if (props.properties.notify) {
                return (
                    <></>
                )
            } else if (props.properties.read) {
                return (
                    <Button variant="contained" onClick={this.readValue}>Read Value</Button>
                )
            } else {
                return (<></>)
            }
        }

        return (
            <Card>
                <CardHeader
                    avatar={
                        <Avatar sx={{ bgcolor: grey[500] }} aria-label="recipe">
                            {this.state.name[0]}
                        </Avatar>

                    }
                    title={this.state.name}
                    subheader={uuid}
                >
                </CardHeader>
                <CardContent>
                    <CardActions>
                        <BLETypeSelect onChange={this.changeBleType} value={this.state.type} />
                        <ReadValBtn properties={properties}></ReadValBtn>
                        <ValueField value={value} unit={this.state.unit} />
                    </CardActions>


                    <CardActions disableSpacing>
                        <Stack direction="row" spacing={1}>
                            <PropertiesChip properties={properties} readonly={readonly} />
                        </Stack>
                    </CardActions>

                </CardContent>
            </Card>
        )


    }


}


export default CharacteristicCard;