import * as React from "react";

import {
    Alert,
    AlertColor,
    Button,
    Checkbox,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    Grid,
    TextField,
} from "@mui/material";
// icons
import SearchIcon from "@mui/icons-material/Search";
// house made
import BleSrvSelect from "./BleSrvSelect";

function BLEAvailableAlert(props: { is_available: boolean }) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Bluetooth/getAvailability

    if (typeof navigator.bluetooth === "undefined") {
        return (
            <Alert severity="error">
                Web Bluetooth API is unavailable/locked in this browser. Google
                Chrome is recommended.
            </Alert>
        );
    }

    if (props.is_available) {
        // console.log("This device supports Bluetooth!");
        return <div> </div>;
    } else {
        return (
            <Alert severity="error">
                Bluetooth is not supported in this machine.
            </Alert>
        );
    }
}

function CheckboxSearchAllDevice(props: {
    is_search_all_device: boolean;
    onChange: (b: boolean) => void;
}) {
    const onChange = props.onChange;
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange != null) {
            onChange(event.target.checked);
        }
    };

    return (
        <FormControl fullWidth component="fieldset" variant="standard">
            <FormControlLabel
                control={
                    <Checkbox
                        checked={props.is_search_all_device}
                        onChange={handleChange}
                        name="search_all_device"
                    />
                }
                label="Search All Device"
            />
        </FormControl>
    );
}

export interface SimpleDialogProps {
    is_opened: boolean;
    // selectedValue: string;
    // onClose: (value: string) => void;
    message?: string;
    message_status?: AlertColor;
    onSearchDevice: () => void;
    onChangeServicePreset: (s: string) => void;
    onChangeAllSearchDevice: (b: boolean) => void;
    is_search_all_device: boolean;
    service: ServicePreset;
    srv_uuid: string;
    candidates: ServicePreset[];
    device: BluetoothDevice | null;
    setUuid?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ConnectingDialog = (props: SimpleDialogProps) => {
    const [is_ble_available, setIsBleAvailable] = React.useState(true);

    // check Web Bluetooth API available
    React.useEffect(() => {
        if (typeof navigator.bluetooth === "undefined") {
            setIsBleAvailable(false);
            return;
        }
        const is_available = async () => {
            const a = await navigator.bluetooth.getAvailability();
            setIsBleAvailable(a);
        };
        is_available();
    }, []);

    const handleClose = () => {
        // props.onClose(props.selectedValue);
    };

    return (
        <Dialog onClose={handleClose} open={props.is_opened} fullWidth>
            <DialogTitle variant="h5">Connect BLE Device</DialogTitle>
            <DialogContent>
                {is_ble_available ? (
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            <Alert severity={props.message_status ?? "info"}>
                                {props.message}
                            </Alert>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <BleSrvSelect
                                candidates={props.candidates}
                                onChange={props.onChangeServicePreset}
                                current_srv={props.service}
                            />
                        </Grid>
                        <Grid item xs={12} sm={8}>
                            <TextField
                                required
                                disabled={props.service.name != "user_defined"}
                                variant="standard"
                                id="outlined-required"
                                label="Service UUID"
                                value={props.srv_uuid}
                                onChange={props.setUuid}
                                fullWidth
                            />
                        </Grid>
                        <Grid item>
                            <CheckboxSearchAllDevice
                                is_search_all_device={
                                    props.is_search_all_device
                                }
                                onChange={props.onChangeAllSearchDevice}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                onClick={props.onSearchDevice}
                                startIcon={<SearchIcon />}
                                fullWidth
                            >
                                Search for Devices
                            </Button>
                        </Grid>
                    </Grid>
                ) : (
                    <BLEAvailableAlert is_available={is_ble_available} />
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ConnectingDialog;
