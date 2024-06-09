import { ChangeEvent } from 'react';

import {
    FormControl,
    InputAdornment,
    TextField
} from '@mui/material';

function CharacteristicValueField(props: {
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


export default CharacteristicValueField;