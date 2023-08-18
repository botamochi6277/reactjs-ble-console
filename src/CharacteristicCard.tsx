import React, { ChangeEvent } from 'react';

import {
    Button, Card, CardHeader, CardContent, CardActions,
    Chip,
    InputAdornment,
    InputLabel,
    FormControl,
    Box,
    Avatar,
    TextField,
    Select,
    MenuItem,
    Stack,
    SelectChangeEvent,
} from '@mui/material';

import MenuBookIcon from '@mui/icons-material/MenuBook';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EditIcon from '@mui/icons-material/Edit';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PodcastsIcon from '@mui/icons-material/Podcasts';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import NumbersIcon from '@mui/icons-material/Numbers';

// icons
import ThermostatIcon from '@mui/icons-material/Thermostat';
import TimerIcon from '@mui/icons-material/Timer';
import SpeedIcon from '@mui/icons-material/Speed';
import ScreenRotationAltIcon from '@mui/icons-material/ScreenRotationAlt';
import Rotate90DegreesCcwIcon from '@mui/icons-material/Rotate90DegreesCcw';

import { ble_data_formats, writeValue } from "./bluetooth_utils"


const DataTypeIcon = (props: { unit: string }) => {
    // const ble_units = [
    //     { name: 'acc', unit: <>m/s<sup>2</sup></>, hex: 0x2713, icon: <SpeedIcon /> },
    //     { name: 'gyro', unit: 'rad/s', hex: 0x2743, icon: <ScreenRotationAltIcon /> },
    //     { name: 'time', unit: 'sec', hex: 0x2703, icon: <TimerIcon /> },
    //     { name: 'temperature', unit: '°C', hex: 0x272F, icon: <ThermostatIcon /> }
    // ];
    switch (props.unit) {
        case "m/s**2":
            return <SpeedIcon />;
        case "rad/s":
            return <ScreenRotationAltIcon />;
        case "sec":
            return <TimerIcon />;
        case '°C':
            return <ThermostatIcon />;
        case 'rad':
            return <Rotate90DegreesCcwIcon />;
        case 'deg':
            return <Rotate90DegreesCcwIcon />;
        default:
            return <NumbersIcon />;
    }
}



function BLETypeSelect(props: {
    value: string,
    onChange: (ev: SelectChangeEvent) => void
}) {
    const menus = ble_data_formats.map((b) => <MenuItem value={b.name} key={b.name}>{b.name}</MenuItem>)

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
                    onChange={props.onChange}
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

function PropertiesChip(props: {
    properties: BluetoothCharacteristicProperties,
}) {
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
            <Chip label={c.name} icon={c.icon} key={c.name} size='small' />
    )

    // https://bobbyhadz.com/blog/react-cannot-be-used-as-a-jsx-component
    return (
        <>
            {chips}
        </>
    )
}

function ValueField(props: {
    value: string,
    readonly: boolean,
    unit: string,
    prefix: string
    onChange: ((ev: ChangeEvent) => void) | undefined
}) {
    const unit_str = `${props.prefix}${props.unit}`;
    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <TextField id="input-with-sx" label="value" variant="standard"
                onChange={props.onChange}
                InputProps={{
                    readOnly: props.readonly,
                    style: { textAlign: 'right' },
                    startAdornment: (
                        <InputAdornment position="start">
                            <NumbersIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                        </InputAdornment>
                    ),
                    endAdornment: <InputAdornment position="end">{unit_str}</InputAdornment>
                }} value={props.value} />
        </Box>
    );
}

const CharacteristicCard = (props: {
    characteristic: CharacteristicWrapper,
    avatar: JSX.Element | undefined,
    readValueHandle: () => void,
    notifyHandle: (ev: Event) => void,
    changeBleType: (ev: SelectChangeEvent) => void
}) => {

    // const handleNotifications = (event) => {
    //     let value = event.target.value;
    //     const v = this.state.decoder ? this.state.decoder(value, 0) : 0;
    //     this.setState({ value: v });
    // }

    const uuid = props.characteristic.characteristic.uuid;
    // BluetoothCharacteristicProperties
    const properties = props.characteristic.characteristic.properties;
    let readonly = properties ? !properties.write : true;


    const [is_subscribing, setIsSubscribe] = React.useState(false);
    const [text_field_value, setTextFieldVal] = React.useState("");
    React.useEffect(
        () => { setTextFieldVal(typeof (props.characteristic.value) === "string" ? props.characteristic.value : props.characteristic.value.toString()) },
        [props.characteristic]
    )

    const onChangeSubscription = () => {
        if (!properties.notify) { return; }
        const my_characteristic = props.characteristic.characteristic;
        if (!is_subscribing) {
            my_characteristic.startNotifications().then(() => {
                my_characteristic.addEventListener(
                    'characteristicvaluechanged',
                    props.notifyHandle);
            });
            setIsSubscribe(true); // switch
        } else {
            // fail to stop...
            my_characteristic.stopNotifications().then(() => {
                my_characteristic.removeEventListener(
                    'characteristicvaluechanged',
                    props.notifyHandle);
            });
            setIsSubscribe(false);
        }
    }

    const writeVal = () => {
        const data = props.characteristic.format === "string" ? text_field_value : Number(text_field_value);
        writeValue(props.characteristic, data, props.readValueHandle);
    }

    return (
        <Card variant='outlined'>
            <CardHeader
                avatar={
                    <Avatar aria-label="recipe">
                        <DataTypeIcon unit={props.characteristic.unit} />
                    </Avatar>

                }
                title={props.characteristic.name}
                subheader={uuid}
            >
            </CardHeader>
            <CardContent sx={{ "padding-top": 0, "padding-bottom": 0 }}>
                <Stack direction="row" spacing={1} justifyContent="flex-start">
                    <PropertiesChip properties={properties} />
                </Stack>
            </CardContent>

            <CardActions>
                <BLETypeSelect
                    onChange={props.changeBleType}
                    value={props.characteristic.format} />
                <ValueField
                    value={text_field_value}
                    unit={props.characteristic.unit}
                    prefix={props.characteristic.prefix}
                    onChange={(ev: ChangeEvent) => { setTextFieldVal((ev.target as HTMLInputElement).value) }}
                    readonly={readonly} />
            </CardActions>

            <CardActions>

                <Button
                    startIcon={<MenuBookIcon />}
                    variant="contained"
                    sx={{ display: properties.read ? 'flex' : 'none' }}
                    onClick={() => { props.readValueHandle() }}>
                    Read</Button>
                <Button
                    startIcon={<NotificationsIcon />}
                    variant={is_subscribing ? "outlined" : "contained"}
                    sx={{ display: properties.notify ? 'flex' : 'none' }}
                    onClick={onChangeSubscription}
                >
                    Notify</Button>
                <Button
                    startIcon={<EditIcon />}
                    variant="contained"
                    sx={{ display: properties.write ? 'flex' : 'none' }}
                    onClick={writeVal}
                >
                    Write</Button>

            </CardActions>
        </Card >
    )
}


export default CharacteristicCard;