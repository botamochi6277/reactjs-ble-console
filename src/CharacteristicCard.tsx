import React, { ChangeEvent } from 'react';

import {
    Avatar,
    Button, Card,
    CardActions,
    CardHeader,
    FormControl,
    FormGroup,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Stack,
    TextField
} from '@mui/material';

import {
    MuiColorInput, MuiColorInputValue,
    matchIsValidColor
} from 'mui-color-input';

import { tinycolor } from '@ctrl/tinycolor'; // installed w/ mui-color-input

// icons
import { Publish as PublishIcon, Sync as SyncIcon } from '@mui/icons-material';
import AbcIcon from '@mui/icons-material/Abc';
import EditIcon from '@mui/icons-material/Edit';
import NotificationsIcon from '@mui/icons-material/Notifications';
// house-made
import { DataDimensionsIcon } from "./DataDimensionsIcon";
import { NumerationSystemSelect } from "./NumerationSystemSelect";
import { ble_data_formats, writeValue } from "./bluetooth_utils";

function BLETypeSelect(props: {
    value: string,
    onChange: (ev: SelectChangeEvent) => void,
    name: string
}) {
    const menus = ble_data_formats.map((b) => <MenuItem value={b.name} key={b.name}>{b.name}</MenuItem>)

    return (
        <FormControl variant="standard" sx={{ m: 1, minWidth: 80 }}>
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
    data_type: BleDataType,
    unit: string,
    prefix: string
    onChange: ((ev: ChangeEvent) => void) | undefined,
    name: string,
    start_adornment: string
}) {
    const unit_str = `${props.prefix}${props.unit}`;
    return (
        <FormControl variant="standard" sx={{ m: 1, minWidth: 80 }} >
            <TextField
                id={`input-with-sx-${props.name}`}
                label={props.readonly ? "read only " : `value`}
                variant="standard"
                color={props.readonly ? "secondary" : "primary"}
                onChange={props.onChange}
                InputProps={{
                    readOnly: props.readonly,
                    style: { textAlignLast: (["utf8", "utf16"].includes(props.data_type.name) ? "inherit" : "end") },
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
    const [color, setColor] = React.useState<MuiColorInputValue>('#ffffff');
    const handleColorChange = (new_color: string) => {

        // console.log(`color validation: ${matchIsValidColor(new_color)}`)
        setColor(new_color)
    }

    const is_color = ["#", "$"].includes(props.characteristic.unit);
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

                    if (is_color) {

                        if (props.characteristic.unit === "#") {
                            // rgb hex
                            console.log(`${matchIsValidColor(color)}`)
                            setColor(`#${props.characteristic.value.toString(16).padStart(6, '0')}`);
                        }
                        if (props.characteristic.unit === "$") {
                            const hex_str = props.characteristic.value.toString(16).padStart(8, '0');
                            const hue = 360.0 * parseInt(hex_str.slice(0, 4), 16) / 65535;
                            const saturation = parseInt(hex_str.slice(4, 6), 16) / 255;
                            const brightness = parseInt(hex_str.slice(6), 16) / 255;
                            console.log(`hsb-hex: ${hex_str}`);
                            setColor({ h: hue, s: saturation, v: brightness });

                        }
                    }

                } else {
                    setTextFieldVal(props.characteristic.value.toString())
                }
            }
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

        if (is_color) {
            console.log(color);
            // console.log(color.v);
            const tmp_color = tinycolor(color);
            if (props.characteristic.unit === "#") {
                const hex_color = tmp_color.toHex();
                writeValue(props.characteristic, parseInt(hex_color, 16), props.readValueHandle);
            }
            if (props.characteristic.unit === "$") {
                // hex to hsv
                const tmp_hsv = tmp_color.toHsv();
                const hue_hex = Math.floor(tmp_hsv.h / 360 * 0xFFFF).toString(16);
                const s_hex = Math.floor(tmp_hsv.s * 0xFF).toString(16);
                const v_hex = Math.floor(tmp_hsv.v * 0xFF).toString(16);
                console.debug("write: " + parseInt(`${hue_hex}${s_hex}${v_hex}`, 16))
                writeValue(props.characteristic, parseInt(`${hue_hex}${s_hex}${v_hex}`, 16), props.readValueHandle);
            }

            return;
        }

        if (["utf8", "utf16"].includes(props.characteristic.data_type.name)) {
            writeValue(props.characteristic, text_field_value, props.readValueHandle);
            return;
        }

        // number
        if (["float32", "float64"].includes(props.characteristic.data_type.name)) {
            // integer
            // console.debug(`field value: ${text_field_value}, parsed: ${parseFloat(text_field_value)}`)
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
                        {(["utf8", "utf16"].includes(props.characteristic.data_type.name)) ? <AbcIcon /> : <DataDimensionsIcon dimensions={props.characteristic.unit} />}
                    </Avatar>
                }
                title={props.characteristic.name}
                subheader={uuid}
                action={
                    <Stack direction={"row"}>
                        <IconButton
                            sx={{ display: properties.read ? 'flex' : 'none' }}
                            onClick={() => { props.readValueHandle() }}
                            color="primary">
                            <SyncIcon />
                        </IconButton>
                        <IconButton
                            color={is_subscribing ? "success" : "primary"}
                            sx={{ display: properties.notify ? 'flex' : 'none' }}
                            onClick={onChangeSubscription}
                        >
                            <NotificationsIcon />
                        </IconButton>
                    </Stack>
                }
            >
            </CardHeader>
            {/* <CardContent sx={{ "pt": 0, "pb": 0 }}>
                <Stack direction="row" spacing={1} justifyContent="flex-start">
                    <CharacteristicPropertiesChip properties={properties} />
                </Stack>
            </CardContent> */}

            <CardActions sx={{ display: is_color ? "none" : "flex", justifyContent: "space-between" }}>
                <FormGroup
                    row
                >
                    <BLETypeSelect
                        onChange={props.changeBleType}
                        value={props.characteristic.data_type.name}
                        name={props.characteristic.name} />
                    <NumerationSystemSelect
                        sx={{ display: (["uint8", "uint16", "uint32", "uint64"].includes(props.characteristic.data_type.name)) ? 'flex' : 'none', m: 1, minWidth: 80 }}
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
                        data_type={props.characteristic.data_type}
                        unit={props.characteristic.unit}
                        prefix={props.characteristic.prefix}
                        onChange={(ev: ChangeEvent) => { setTextFieldVal((ev.target as HTMLInputElement).value) }}
                        readonly={readonly}
                        name={props.characteristic.name}
                        start_adornment={["uint8", "uint16", "uint32", "uint64"].includes(props.characteristic.data_type.name) ? numeration_sys.prefix : ""} />
                </FormGroup>
                <Button
                    startIcon={<PublishIcon />}
                    variant="contained"
                    sx={{ display: properties.write ? 'flex' : 'none' }}
                    onClick={writeVal}
                >
                    Publish</Button>
            </CardActions>

            {/* color */}
            <CardActions sx={{ display: is_color ? "flex" : "none" }}>
                <MuiColorInput
                    value={color}
                    onChange={handleColorChange}
                    // format={color_format} // fail of color preview in hsv
                    fullWidth
                />
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