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
import { MuiColorInput } from 'mui-color-input'

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
    const [color, setColor] = React.useState('#ffffff')
    const handleColorChange = (color: string) => {
        setColor(color)
    }
    // effect for change of the characteristic
    React.useEffect(
        () => {
            if (typeof (props.characteristic.value) === "string") {
                setTextFieldVal(props.characteristic.value);
            }
            if (typeof (props.characteristic.value) === "number") {
                if (["uint8", "uint16", "uint32", "uint64", "int8", "int16", "int32", "int64"].includes(props.characteristic.data_type.name)) {
                    // integer
                    if (numeration_sys.radix == 10) {
                        setTextFieldVal(props.characteristic.value.toString(numeration_sys.radix));
                    } else {
                        // binary or hex
                        const max_val = parseInt("".padStart(props.characteristic.data_type.data_length * 2, "f"), 16);
                        const max_digits = max_val.toString(numeration_sys.radix).length;
                        setTextFieldVal(props.characteristic.value.toString(numeration_sys.radix).padStart(max_digits, '0'));
                    }

                } else {
                    setTextFieldVal(props.characteristic.value.toString())
                }
            }
            // error

        },
        [props.characteristic, numeration_sys]
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

        if (props.characteristic.data_type.name === "string") {
            writeValue(props.characteristic, text_field_value, props.readValueHandle);
            return;
        }

        // number
        if (["float", "double"].includes(props.characteristic.data_type.name)) {
            // integer
            writeValue(props.characteristic, parseFloat(text_field_value), props.readValueHandle);
            return;
        } else {

            // integer
            writeValue(props.characteristic, parseInt(text_field_value, numeration_sys.radix), props.readValueHandle);
            return;
        }
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
                    value={props.characteristic.data_type.name}
                    name={props.characteristic.name} />
                <NumerationSystemSelect
                    sx={{ display: (["uint8", "uint16", "uint32", "uint64"].includes(props.characteristic.data_type.name)) ? 'flex' : 'none' }}
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
                    start_adornment={["uint8", "uint16", "uint32", "uint64"].includes(props.characteristic.data_type.name) ? numeration_sys.prefix : ""} />
                <MuiColorInput
                    sx={{ display: props.characteristic.unit === "$" ? "flex" : "none" }}
                    value={color}
                    onChange={handleColorChange}
                />
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