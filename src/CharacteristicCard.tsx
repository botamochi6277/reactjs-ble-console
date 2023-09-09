import React, { ChangeEvent } from 'react';

import {
    Button, Card, CardHeader, CardContent, CardActions,
    InputAdornment,
    InputLabel,
    FormControl,
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
import NumbersIcon from '@mui/icons-material/Numbers';

// icons
import ThermostatIcon from '@mui/icons-material/Thermostat';
import TimerIcon from '@mui/icons-material/Timer';
import SpeedIcon from '@mui/icons-material/Speed';
import ScreenRotationAltIcon from '@mui/icons-material/ScreenRotationAlt';
import Rotate90DegreesCcwIcon from '@mui/icons-material/Rotate90DegreesCcw';

import { ble_data_formats, writeValue } from "./bluetooth_utils"
import { CharacteristicPropertiesChip } from "./CharacteristicPropertiesChip"

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
    onChange: (ev: SelectChangeEvent) => void,
    name: string
}) {
    const menus = ble_data_formats.map((b) => <MenuItem value={b.name} key={b.name}>{b.name}</MenuItem>)

    return (
        <FormControl variant="standard" fullWidth>
            <InputLabel
                id={`ble-data-type-select-label-${props.name}`}>
                format
            </InputLabel>
            <Select
                value={props.value}
                label="format"
                labelId={`ble-data-type-select-label-${props.name}`}
                onChange={props.onChange}
                inputProps={{
                    name: 'format',
                    id: `ble-data-type-select-${props.name}`,
                }}
            >
                {menus}
            </Select>
        </FormControl>
    );
}


function ValueField(props: {
    value: string,
    readonly: boolean,
    unit: string,
    prefix: string
    onChange: ((ev: ChangeEvent) => void) | undefined,
    name: string
}) {
    const unit_str = `${props.prefix}${props.unit}`;
    return (
        <FormControl variant="standard" fullWidth>
            <TextField
                id={`input-with-sx-${props.name}`}
                label={`value`}
                variant="standard"
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
        </FormControl>
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
            <CardContent sx={{ "pt": 0, "pb": 0 }}>
                <Stack direction="row" spacing={1} justifyContent="flex-start">
                    <CharacteristicPropertiesChip properties={properties} />
                </Stack>
            </CardContent>

            <CardActions>
                <BLETypeSelect
                    onChange={props.changeBleType}
                    value={props.characteristic.format}
                    name={props.characteristic.name} />
                <ValueField
                    value={text_field_value}
                    unit={props.characteristic.unit}
                    prefix={props.characteristic.prefix}
                    onChange={(ev: ChangeEvent) => { setTextFieldVal((ev.target as HTMLInputElement).value) }}
                    readonly={readonly}
                    name={props.characteristic.name} />
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