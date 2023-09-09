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

// icons
import MenuBookIcon from '@mui/icons-material/MenuBook';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EditIcon from '@mui/icons-material/Edit';

// house-made
import { ble_data_formats, writeValue } from "./bluetooth_utils"
import { CharacteristicPropertiesChip } from "./CharacteristicPropertiesChip"
import { DataDimensionsIcon } from "./DataDimensionsIcon";
import { NumerationSystemSelect } from "./NumerationSystemSelect";

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
                data type
            </InputLabel>
            <Select
                value={props.value}
                label="data type"
                labelId={`ble-data-type-select-label-${props.name}`}
                onChange={props.onChange}
                inputProps={{
                    name: 'data type',
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
    name: string,
    start_adornment: string
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
                    startAdornment: <InputAdornment position="start">{props.start_adornment}</InputAdornment>,
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
    const uuid = props.characteristic.characteristic.uuid;
    // BluetoothCharacteristicProperties
    const properties = props.characteristic.characteristic.properties;
    let readonly = properties ? !properties.write : true;
    const ns_items: NumerationSystemItem[] = [
        { name: "bin", radix: 2, prefix: "0b" },
        { name: "dec", radix: 10, prefix: "" },
        { name: "hex", radix: 16, prefix: "0x" },
    ]

    const [is_subscribing, setIsSubscribe] = React.useState(false);
    const [text_field_value, setTextFieldVal] = React.useState("");
    const [numeration_sys, setNumerationSys] = React.useState(ns_items[1]);

    React.useEffect(
        () => {
            if (typeof (props.characteristic.value) === "string") {
                setTextFieldVal(props.characteristic.value);
            }
            if (typeof (props.characteristic.value) === "number") {
                if (["uint8", "uint16", "uint32"].includes(props.characteristic.data_type)) {
                    setTextFieldVal(props.characteristic.value.toString(numeration_sys.radix));
                } else {
                    setTextFieldVal(props.characteristic.value.toString())
                }
            }
            // error

        },
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
        const data = props.characteristic.data_type === "string" ? text_field_value : Number(text_field_value);
        writeValue(props.characteristic, data, props.readValueHandle);
    }

    return (
        <Card variant='outlined'>
            <CardHeader
                avatar={
                    <Avatar aria-label="recipe">
                        <DataDimensionsIcon dimensions={props.characteristic.unit} />
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
                    value={props.characteristic.data_type}
                    name={props.characteristic.name} />
                <NumerationSystemSelect
                    sx={{ display: (["uint8", "uint16", "uint32"].includes(props.characteristic.data_type)) ? 'flex' : 'none' }}
                    value={numeration_sys}
                    onChange={(ev: SelectChangeEvent) => {
                        const i = ns_items.find(item => item.name === ev.target.value);
                        if (i) { setNumerationSys(i); }
                    }
                    }
                    items={ns_items}
                    name={props.characteristic.name}
                />
                <ValueField
                    value={text_field_value}
                    unit={props.characteristic.unit}
                    prefix={props.characteristic.prefix}
                    onChange={(ev: ChangeEvent) => { setTextFieldVal((ev.target as HTMLInputElement).value) }}
                    readonly={readonly}
                    name={props.characteristic.name}
                    start_adornment={["uint8", "uint16", "uint32"].includes(props.characteristic.data_type) ? numeration_sys.prefix : ""} />
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