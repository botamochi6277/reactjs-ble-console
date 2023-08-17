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
    Stack,
    SelectChangeEvent
} from '@mui/material';

import MenuBookIcon from '@mui/icons-material/MenuBook';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EditIcon from '@mui/icons-material/Edit';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PodcastsIcon from '@mui/icons-material/Podcasts';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import NumbersIcon from '@mui/icons-material/Numbers';

import ThermostatIcon from '@mui/icons-material/Thermostat';
import TimerIcon from '@mui/icons-material/Timer';
import SpeedIcon from '@mui/icons-material/Speed';
import ScreenRotationAltIcon from '@mui/icons-material/ScreenRotationAlt';

import { grey } from '@mui/material/colors';

import { ble_data_formats } from "./bluetooth_utils"
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
    readonly: boolean
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
            <Chip label={c.name} icon={c.icon} key={c.name}></Chip>
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
    unit: string
}) {
    const btn = props.readonly ? <Button>Write</Button> : <p />;
    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>

            <TextField id="input-with-sx" label="value" variant="standard"
                InputProps={{
                    readOnly: props.readonly,
                    style: { textAlign: 'right' },
                    startAdornment: (
                        <InputAdornment position="start">
                            <NumbersIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                        </InputAdornment>
                    ),
                    endAdornment: <InputAdornment position="end">{props.unit}</InputAdornment>
                }} value={props.value} />
            {btn}
        </Box>
    );
}

const CharacteristicCard = (props: {
    characteristic: CharacteristicWrapper,
    avatar: JSX.Element | undefined,
    readValueHandle: () => void,
    changeBleType: (ev: SelectChangeEvent) => void
}) => {

    // const changeBleType = (b_type: BleType) => {
    //     const new_type = ble_data_formats.find(element => element.name === b_type.name);
    //     if (!new_type) { return; }
    //     setBleType(new_type);
    // }


    // const handleNotifications = (event) => {
    //     let value = event.target.value;
    //     const v = this.state.decoder ? this.state.decoder(value, 0) : 0;
    //     this.setState({ value: v });
    // }

    const uuid = props.characteristic.characteristic.uuid;
    // BluetoothCharacteristicProperties
    const properties = props.characteristic.characteristic.properties;
    let readonly = properties ? !properties.write : true;

    // if (this.state.characteristic == null) {
    //     return (
    //         <Card>
    //             <CardContent>
    //                 <Typography variant="h5" component="div">{this.state.name}</Typography>
    //             </CardContent>
    //         </Card>
    //     )
    // }


    // if (properties?.notify) {
    //     if (!this.is_notifying) {
    //         // start notifying
    //         this.is_notifying = true;
    //         const callback = this.handleNotifications;
    //         this.state.characteristic.startNotifications().then(_ => {
    //             this.state.characteristic.addEventListener(
    //                 'characteristicvaluechanged',
    //                 callback);
    //         });
    //     }
    // }

    const ReadValBtn = (props: {
        properties: BluetoothCharacteristicProperties,
        readValueHandle: () => void
    }) => {
        if (properties.notify) {
            return (
                <></>
            )
        } else if (properties.read) {
            return (
                <Button variant="contained"
                    onClick={() => { props.readValueHandle() }}>
                    Read Value</Button>
            )
        } else {
            return (<></>)
        }
    }

    return (
        <Card>
            <CardHeader
                // avatar={
                //     <Avatar sx={{ bgcolor: grey[500] }} aria-label="recipe">
                //         {this.state.icon}
                //     </Avatar>

                // }
                title={props.characteristic.name}
                subheader={uuid}
            >
            </CardHeader>
            <CardContent>
                <CardActions>
                    <BLETypeSelect
                        onChange={props.changeBleType}
                        value={props.characteristic.format} />
                    <ReadValBtn properties={properties}
                        readValueHandle={props.readValueHandle}
                    />
                    <ValueField
                        value={typeof (props.characteristic.value) === "string" ? props.characteristic.value : props.characteristic.value.toString()}
                        unit={props.characteristic.unit}
                        readonly={readonly} />
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


export default CharacteristicCard;