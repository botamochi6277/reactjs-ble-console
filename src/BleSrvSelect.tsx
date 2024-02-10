import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent
} from '@mui/material';

const BleSrvSelect = (props:
    {
        candidates: ServicePreset[],
        current_srv: ServicePreset,
        onChange: (s: string) => void
    }) => {

    const candidates = props.candidates;

    const handleChange = (event: SelectChangeEvent) => {
        console.log(`current service : ${event.target.value}`);
        props.onChange(event.target.value);
    };

    const menus = candidates.map(
        (p) => <MenuItem value={p.name} key={p.uuid}>{p.name}</MenuItem>
    );

    return (
        <FormControl variant="standard" fullWidth>
            <InputLabel
                id="ble-data-type-select-label"
                htmlFor="ble-service-name-select">
                Service Name
            </InputLabel>
            <Select
                value={props.current_srv.name}
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
    );
}

export default BleSrvSelect;