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
import ResponsiveButton from './ResponsiveButton';
import { ble_data_formats, writeValue } from "./bluetooth_utils";

function BLETypeSelect(props: {
    value: string,
    onChange: (ev: SelectChangeEvent) => void,
    name: string
}) {
    const menus = ble_data_formats.map((b) => <MenuItem value={b.name} key={b.name}>{b.name}</MenuItem>)

    return (
        <FormControl variant="standard" sx={{ m: 1, minWidth: 40 }}>
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
        <FormControl variant="standard" sx={{ m: 1, minWidth: 40 }} >
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
    wrapper: CharacteristicWrapper,
    avatar: JSX.Element | undefined,
    readValueHandle: () => void,
    notifyHandle: (ev: Event) => void,
    changeBleType: (ev: SelectChangeEvent) => void,
    is_compact_view?: boolean
}) => {
    const uuid = props.wrapper.characteristic.uuid;
    // BluetoothCharacteristicProperties
    const properties = props.wrapper.characteristic.properties;
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

    const is_color = ["#", "$"].includes(props.wrapper.unit);
    // effect for change of the characteristic
    // rerender text-value when characteristic is changed
    React.useEffect(
        () => {
            if (!props.wrapper.dataview) {
                setTextFieldVal("null");
                return;
            }
            const new_value = props.wrapper.data_type.decoder(
                props.wrapper.dataview, 0
            )
            if (typeof (new_value) === "string") {
                setTextFieldVal(new_value);
            }
            if (typeof (new_value) === "number") {
                if (["uint8", "uint16", "uint32", "uint64", "int8", "int16", "int32", "int64"].includes(props.wrapper.data_type.name)) {
                    // integer
                    if (numeration_sys.radix == 10) {
                        setTextFieldVal(
                            new_value.toString(numeration_sys.radix));
                    } else {
                        // binary or hex
                        const max_val = parseInt("".padStart(props.wrapper.data_type.data_length * 2, "f"), 16);
                        const max_digits = max_val.toString(numeration_sys.radix).length;
                        setTextFieldVal(new_value.toString(numeration_sys.radix).padStart(max_digits, '0'));
                    }

                    if (is_color) {
                        if (props.wrapper.unit === "#") {
                            // rgb hex
                            console.log(`${matchIsValidColor(color)}`)
                            setColor(`#${new_value.toString(16).padStart(6, '0')}`);
                        }
                        if (props.wrapper.unit === "$") {
                            const hex_str = new_value.toString(16).padStart(8, '0');
                            const hue = 360.0 * parseInt(hex_str.slice(0, 4), 16) / 65535;
                            const saturation = parseInt(hex_str.slice(4, 6), 16) / 255;
                            const brightness = parseInt(hex_str.slice(6), 16) / 255;
                            console.log(`hsb-hex: ${hex_str}`);
                            setColor({ h: hue, s: saturation, v: brightness });

                        }
                    }

                } else {
                    // float
                    setTextFieldVal(new_value.toString())
                }
            }
        },
        [props.wrapper, numeration_sys]
    )

    const onChangeSubscription = () => {
        if (!properties.notify) { return; }
        const my_characteristic = props.wrapper.characteristic;
        if (!is_subscribing) {
            my_characteristic.startNotifications().then(() => {
                my_characteristic.addEventListener(
                    'characteristicvaluechanged',
                    props.notifyHandle);
            });
            setIsSubscribe(true); // switch
        } else {
            my_characteristic.stopNotifications().then(() => {
                my_characteristic.removeEventListener(
                    'characteristicvaluechanged',
                    props.notifyHandle);
            });
            setIsSubscribe(false);
        }
    }

    const publishVal = () => {

        if (is_color) {
            console.log(color);
            // console.log(color.v);
            const tmp_color = tinycolor(color);
            if (props.wrapper.unit === "#") {
                const hex_color = tmp_color.toHex();
                writeValue(props.wrapper, parseInt(hex_color, 16), props.readValueHandle);
            }
            if (props.wrapper.unit === "$") {
                // hex to hsv
                const tmp_hsv = tmp_color.toHsv();
                const hue_hex = Math.floor(tmp_hsv.h / 360 * 0xFFFF).toString(16);
                const s_hex = Math.floor(tmp_hsv.s * 0xFF).toString(16);
                const v_hex = Math.floor(tmp_hsv.v * 0xFF).toString(16);
                console.debug("write: " + parseInt(`${hue_hex}${s_hex}${v_hex}`, 16))
                writeValue(props.wrapper, parseInt(`${hue_hex}${s_hex}${v_hex}`, 16), props.readValueHandle);
            }

            return;
        }

        if (["utf8", "utf16"].includes(props.wrapper.data_type.name)) {
            writeValue(props.wrapper, text_field_value, props.readValueHandle);
            return;
        }

        // number
        if (["float32", "float64"].includes(props.wrapper.data_type.name)) {
            // integer
            // console.debug(`field value: ${text_field_value}, parsed: ${parseFloat(text_field_value)}`)
            writeValue(props.wrapper, parseFloat(text_field_value), props.readValueHandle);
            return;
        } else {

            // integer
            writeValue(props.wrapper, parseInt(text_field_value, numeration_sys.radix), props.readValueHandle);
            return;
        }
    }

    return (
        <Card variant='outlined'>
            <CardHeader
                avatar={
                    <Avatar aria-label="recipe">
                        {(["utf8", "utf16"].includes(props.wrapper.data_type.name)) ? <AbcIcon /> : <DataDimensionsIcon dimensions={props.wrapper.unit} />}
                    </Avatar>
                }
                title={props.wrapper.name}
                titleTypographyProps={{ variant: (props.is_compact_view ? "h5" : "inherit") }}
                subheader={props.is_compact_view ? null : uuid}
                action={
                    props.is_compact_view ?
                        <Stack direction={"row"} spacing={0}>
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
                        </Stack> : null
                }
                sx={{ paddingBottom: (props.is_compact_view ? 0 : "inherit") }}
            >
            </CardHeader>

            <CardActions
                sx={{ display: is_color ? "none" : "flex", justifyContent: "space-between" }}
            >
                <FormGroup
                    row
                >
                    {props.is_compact_view ? null :
                        <>
                            <BLETypeSelect
                                onChange={props.changeBleType}
                                value={props.wrapper.data_type.name}
                                name={props.wrapper.name} />
                            <NumerationSystemSelect
                                sx={{ display: (["uint8", "uint16", "uint32", "uint64"].includes(props.wrapper.data_type.name)) ? 'flex' : 'none', m: 1, minWidth: 80 }}
                                value={numeration_sys}
                                onChange={(ev: SelectChangeEvent) => {
                                    const i = ns_items.find(item => item.name === ev.target.value);
                                    if (i) { setNumerationSys(i); }
                                }
                                }
                                items={ns_items}
                                name={props.wrapper.name}
                            /></>
                    }

                    <ValueField
                        value={text_field_value}
                        data_type={props.wrapper.data_type}
                        unit={props.wrapper.unit}
                        prefix={props.wrapper.prefix}
                        onChange={(ev: ChangeEvent) => { setTextFieldVal((ev.target as HTMLInputElement).value) }}
                        readonly={readonly}
                        name={props.wrapper.name}
                        start_adornment={["uint8", "uint16", "uint32", "uint64"].includes(props.wrapper.data_type.name) ? numeration_sys.prefix : ""} />
                </FormGroup>
                {
                    (properties.write && props.is_compact_view) ? <ResponsiveButton
                        icon={<PublishIcon />}
                        label='Publish'
                        onClick={publishVal}
                    /> : null}
                {/* <Button
                    startIcon={<PublishIcon />}
                    variant="contained"
                    sx={{ display: properties.write ? 'flex' : 'none' }}
                    onClick={publishVal}
                >
                    Publish</Button> */}
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
                    onClick={publishVal}
                >
                    Write</Button>
            </CardActions>

            <CardActions sx={{ display: props.is_compact_view ? "none" : "flex" }}>
                {properties.read ? <ResponsiveButton
                    icon={<SyncIcon />}
                    label='Sync'
                    onClick={props.readValueHandle}
                /> : null}

                {properties.write ? <ResponsiveButton
                    icon={<PublishIcon />}
                    label='Publish'
                    onClick={publishVal}
                /> : null}

                {properties.notify ? <ResponsiveButton
                    icon={<NotificationsIcon />}
                    label={is_subscribing ? 'Stop' : 'Subscribe'}
                    color={is_subscribing ? "success" : "primary"}
                    onClick={onChangeSubscription}
                /> : null}
            </CardActions>
        </Card >
    )
}


export default CharacteristicCard;