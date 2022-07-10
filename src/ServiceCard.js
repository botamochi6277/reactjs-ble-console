//@ts-check

import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

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
        <FormControl fullWidth component="fieldset" variant="outlined">
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
        <Box sx={{ minWidth: 240 }}>
            <FormControl fullWidth>
                <InputLabel
                    // variant="standard"
                    id="ble-data-type-select-label"
                    htmlFor="ble-service-name-select">
                    Service Name
                </InputLabel>
                <Select
                    value={props.currentSrv.name}
                    onChange={handleChange}
                    variant="outlined"
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
        <Card variant="outlined">
            <CardContent>
                <Typography variant="h5" component="div">
                    <FunctionsIcon /> Service
                </Typography>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={{ xs: 1, sm: 1, md: 1 }}
                >
                    <SwitchAllDevice searchAllDevice={search_all_device} onChange={on_switch} />
                    <ServiceSelect candidates={props.candidates} onChange={on_change} currentSrv={props.service} />
                    {/* https://zenn.dev/enish/articles/5cc332d3eeb1a7 */}
                    <TextField
                        required
                        fullWidth
                        // style={{ width: 400 }}
                        id="outlined-required"
                        label="Service UUID"
                        value={service_uuid}
                    />
                    <Button variant="contained" onClick={on_click} startIcon={<SearchIcon />} fullWidth>Search</Button>
                </Stack>

            </CardContent>
        </Card>
    )
}


export default ServiceCard;