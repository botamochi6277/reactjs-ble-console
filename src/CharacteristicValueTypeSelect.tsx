import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
} from '@mui/material';

import { ble_data_formats } from "./bluetooth_utils";


function CharacteristicValueTypeSelect(props: {
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


export default CharacteristicValueTypeSelect;