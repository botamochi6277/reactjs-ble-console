import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
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
    <FormControl variant="standard" sx={props.sx}>
      <InputLabel
        id={`numeration-system-select-label-${props.name}`}>
        numeration sys.
      </InputLabel>
      <Select
        value={props.value.name}
        label="numeration-system"
        labelId={`numeration-system-select-label-${props.name}`}
        onChange={props.onChange}
        inputProps={{
          name: 'numeration sys.',
          id: `numeration-system-select-${props.name}`,
        }}
      >
        {menus}
      </Select>
    </FormControl>
  );
}