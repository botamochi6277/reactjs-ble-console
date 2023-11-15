import * as React from 'react';

import {
    CardHeader, Card,
    CardContent,
    Select,
    Box,
    TextField,
    Alert,
    Grid,
    Avatar,
    MenuItem,
    InputLabel,
    FormControl,
    FormControlLabel,
    Checkbox,
    Chip,
    Button,
    SelectChangeEvent,
} from '@mui/material';

// icons
import FunctionsIcon from '@mui/icons-material/Functions';
import SearchIcon from '@mui/icons-material/Search';
import BluetoothIcon from '@mui/icons-material/Bluetooth';

function BLEAvailableAlert() {
    // https://developer.mozilla.org/en-US/docs/Web/API/Bluetooth/getAvailability

    if (typeof (navigator.bluetooth) === "undefined") {
        return (
            <Alert severity="error">
                Web Bluetooth API is unavailable with this browser.
                Google Chrome is recommended.
            </Alert>
        );
    }


    navigator.bluetooth.getAvailability().then(available => {
        if (available) {
            // console.log("This device supports Bluetooth!");
            return (
                <div > </div>
            );
        }
        else {
            console.log("Doh! Bluetooth is not supported");
            return (
                <Alert severity="error">Bluetooth is not supported</Alert>
            );
        }
    });
    return (
        <div > </div>
    );
}

function CheckboxSearchAllDevice(props: {
    is_search_all_device: boolean,
    onChange: (b: boolean) => void
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
                        onChange={handleChange} name="search_all_device" />
                }
                label="Search All Device"
            />
        </FormControl>
    );
}

function ServiceSelect(props:
    {
        candidates: Array<ServicePreset>,
        currentSrv: ServicePreset,
        onChange: (s: string) => void
    }) {

    const candidates = props.candidates;

    const handleChange = (event: SelectChangeEvent) => {
        console.log(`current service : ${event.target.value}`);
        props.onChange(event.target.value);
    };

    const menus = candidates.map(
        (p) => <MenuItem value={p.name} key={p.uuid}>{p.name}</MenuItem>
    );

    return (
        <Box >
            <FormControl variant="standard" fullWidth>
                <InputLabel
                    id="ble-data-type-select-label"
                    htmlFor="ble-service-name-select">
                    Service Name
                </InputLabel>
                <Select
                    value={props.currentSrv.name}
                    onChange={handleChange}
                    label="Service Name"
                    inputProps={{
                        name: 'Service',
                        id: 'ble-service-name-select',
                    }}
                >
                    {menus}
                </Select>
            </FormControl>
        </Box>);
}

function ServiceCard(props: {
    onSearchDevice: () => void,
    onChangeService: (s: string) => void,
    onChangeAllSearchDevice: (b: boolean) => void,
    is_search_all_device: boolean,
    service: ServicePreset,
    candidates: ServicePreset[],
    device: BluetoothDevice | null,
    message: string | null,
}) {

    const srv = props.service;
    const service_uuid = srv.uuid;
    return (
        <Card>
            <CardHeader
                avatar={
                    <Avatar sx={{ width: 36, height: 36 }}>
                        <FunctionsIcon />
                    </Avatar>
                }
                title="Device & Service"
                titleTypographyProps={{ variant: 'h5' }}
            >
            </CardHeader>
            <CardContent>
                <BLEAvailableAlert />
                <Alert severity="info">{props.message}</Alert>
            </CardContent>
            <CardContent>
                {props.device ? (<Chip color="success" icon={<BluetoothIcon />} label={props.device.name} />) : (<Chip color="secondary" icon={<FunctionsIcon />} label={"no device"} />)}
            </CardContent>
            <CardContent>
                {/* 2-4-4-2 */}
                <Grid container spacing={2}>

                    <Grid item xs={6} md={3}>
                        <ServiceSelect
                            candidates={props.candidates}
                            onChange={props.onChangeService}
                            currentSrv={props.service} />
                    </Grid>
                    <Grid item xs={6} md={4}>
                        <TextField
                            required
                            fullWidth
                            variant='standard'
                            id="outlined-required"
                            label="Service UUID"
                            value={service_uuid}
                        />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <CheckboxSearchAllDevice
                            is_search_all_device={props.is_search_all_device}
                            onChange={props.onChangeAllSearchDevice} />
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <Button variant="contained" onClick={props.onSearchDevice} startIcon={<SearchIcon />} fullWidth>Search</Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}


export default ServiceCard;