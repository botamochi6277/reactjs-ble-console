//@ts-check
import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { CardHeader } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import FunctionsIcon from '@mui/icons-material/Functions';
import SearchIcon from '@mui/icons-material/Search';

/**
 * @typedef {Object} CharacteristicPreset 
 * @property {string} name 
 * @property {string} uuid 
 * @property {string} type
 * @property {string} unit 
 * @property {boolean} little_endian 
 */

/**
 * @typedef {Object} ServicePreset
 * @property {string} name
 * @property {string} uuid
 * @property {Array<CharacteristicPreset>} characteristics
 */

/**
 * 
 * @param {{searchAllDevice:boolean, onChange:Function}} props 
 * @returns 
 */
function SwitchAllDevice(props) {
    const search_all_device = props.searchAllDevice;
    const onChange = props.onChange;
    const handleChange = (event) => {
        // setState({
        //   ...state,
        //   [event.target.name]: event.target.checked,
        // });
        if (onChange != null) {
            onChange(event.target.checked);
        }
    };

    return (
        <FormControl fullWidth component="fieldset" variant="standard">
            <FormControlLabel
                control={
                    <Switch
                        checked={search_all_device}
                        onChange={handleChange} name="search_all_device" />
                }
                label="Search All Device"
            />
        </FormControl>
    );
}

/**
 * 
 * @param {{candidates:Array<ServicePreset>,currentSrv:ServicePreset,onChange:Function}} props 
 * @returns 
 */
function ServiceSelect(props) {

    const candidates = props.candidates;

    // const [ble_type, setType] = React.useState('');
    const handleChange = (event) => {
        // setType(event.target.value);
        console.log(`current service : ${event.target.value}`);
        if (props.onChange != null) {
            props.onChange(event.target.value);
        }
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

/**
 * 
 * @param {{onClick:React.MouseEventHandler<HTMLButtonElement>,
 * onChangeService:React.MouseEventHandler<HTMLButtonElement>,
 * onChangeSwitch:React.MouseEventHandler<HTMLButtonElement>,
 * searchAllDevice:boolean,
 * service:ServicePreset,
 * candidates:Array<ServicePreset>}} props 
 * @returns 
 */
function ServiceCard(props) {
    const on_click = props.onClick;
    const on_change = props.onChangeService;
    const on_switch = props.onChangeSwitch;
    const srv = props.service;
    const service_uuid = srv.uuid;
    const search_all_device = props.searchAllDevice;
    return (
        <Card>
            <CardHeader
                avatar={
                    <Avatar sx={{ width: 36, height: 36 }}>
                        <FunctionsIcon />
                    </Avatar>
                }
                title="Service"
                titleTypographyProps={{ variant: 'h5' }}
            >

            </CardHeader>
            <CardContent>
                {/* 2-4-4-2 */}
                <Grid container spacing={2}>

                    <Grid item xs={6} md={3}>
                        <ServiceSelect candidates={props.candidates} onChange={on_change} currentSrv={props.service} />
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
                        <SwitchAllDevice searchAllDevice={search_all_device} onChange={on_switch} />
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <Button variant="contained" onClick={on_click} startIcon={<SearchIcon />} fullWidth>Search</Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}


export default ServiceCard;