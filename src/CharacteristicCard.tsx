import React, { ChangeEvent } from 'react';

import {
    Avatar,
    Button, Card,
    CardActions,
    CardHeader,
    FormGroup,
    IconButton,
    SelectChangeEvent,
    Stack,
} from '@mui/material';

import {
    MuiColorInput, MuiColorInputValue,
    matchIsValidColor
} from 'mui-color-input';

import { TinyColor } from '@ctrl/tinycolor'; // installed w/ mui-color-input

// icons
// solid icons
import {
    Publish as PublishIcon,
    Download as DownloadIcon,
    Abc as AbcIcon,
    Notifications as NotificationsIcon
} from '@mui/icons-material';

// outlined icons
import {
    NotificationsActiveOutlined as NotificationsActiveOutlinedIcon,
} from '@mui/icons-material';

// house-made
import { DataDimensionsIcon } from "./DataDimensionsIcon";
import { NumerationSystemSelect } from "./NumerationSystemSelect";
import ResponsiveButton from './ResponsiveButton';
import { writeValue, writeAddedValue } from "./bluetooth_utils";
import CharacteristicValueTypeSelect from './CharacteristicValueTypeSelect';
import ValueUpDownButtons from './ValueUpDownButtons';
import CharacteristicValueField from './CharacteristicValueField';



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
                    setTextFieldVal(new_value.toFixed(4))
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
            const tmp_color = new TinyColor(color);
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
            // float
            writeValue(props.wrapper, parseFloat(text_field_value), props.readValueHandle);
            return;
        } else {

            // integer
            writeValue(props.wrapper, parseInt(text_field_value, numeration_sys.radix), props.readValueHandle);
            return;
        }
    }

    const publishUpDownVal = (direction: string = 'up') => {
        let diff = 0.0;
        if (direction === 'up') {
            diff = 1.0;
        }
        if (direction === 'down') {
            diff = -1.0;
        }
        if (["float32", "float64"].includes(props.wrapper.data_type.name)) {
            // float
            diff *= 0.1;
        }
        writeAddedValue(
            props.wrapper, diff, props.readValueHandle
        )
    };

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
                                <DownloadIcon />
                            </IconButton>
                            <IconButton
                                color={is_subscribing ? "success" : "primary"}
                                sx={{ display: properties.notify ? 'flex' : 'none' }}
                                onClick={onChangeSubscription}
                            >
                                {is_subscribing ? <NotificationsActiveOutlinedIcon /> : <NotificationsIcon />}
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
                            <CharacteristicValueTypeSelect
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

                    <CharacteristicValueField
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
                    (properties.write && props.is_compact_view) ? <ValueUpDownButtons
                        onClickUp={() => {
                            publishUpDownVal('up')
                        }}
                        onClickDown={() => {
                            publishUpDownVal('down')
                        }} /> : null
                }

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
                    startIcon={<PublishIcon />}
                    variant="contained"
                    sx={{ display: properties.write ? 'flex' : 'none' }}
                    onClick={publishVal}
                >
                    Write</Button>
            </CardActions>

            <CardActions sx={{ display: props.is_compact_view ? "none" : "flex" }}>
                {properties.read ? <ResponsiveButton
                    icon={<DownloadIcon />}
                    label='Read'
                    onClick={props.readValueHandle}
                /> : null}

                {properties.write ? <ResponsiveButton
                    icon={<PublishIcon />}
                    label='Write'
                    onClick={publishVal}
                /> : null}

                {properties.notify ? <ResponsiveButton
                    icon={is_subscribing ? <NotificationsActiveOutlinedIcon /> : <NotificationsIcon />}
                    label={is_subscribing ? 'Stop' : 'Subscribe'}
                    color={is_subscribing ? "success" : "primary"}
                    onClick={onChangeSubscription}
                /> : null}
            </CardActions>
        </Card >
    )
}


export default CharacteristicCard;