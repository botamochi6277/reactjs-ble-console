import {
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem,
  SxProps,
  Theme
} from '@mui/material';

export const NumerationSystemSelect = (props: {
  value: NumerationSystemItem,
  onChange: (ev: SelectChangeEvent) => void,
  items: NumerationSystemItem[],
  name: string,
  sx: SxProps<Theme> | undefined
}) => {

  const menus = props.items.map((b) => <MenuItem value={b.name} key={b.name}>{b.name}</MenuItem>)
  return (
    <FormControl variant="standard" sx={props.sx} fullWidth>
      <InputLabel
        id={`numeration-system-select-label-${props.name}`}>
        numeration system
      </InputLabel>
      <Select
        value={props.value.name}
        label="numeration-system"
        labelId={`numeration-system-select-label-${props.name}`}
        onChange={props.onChange}
        inputProps={{
          name: 'numeration system',
          id: `numeration-system-select-${props.name}`,
        }}
      >
        {menus}
      </Select>
    </FormControl>
  );
}