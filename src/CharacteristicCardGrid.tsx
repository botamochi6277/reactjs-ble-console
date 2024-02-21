
import {
    Avatar,
    Grid,
    SelectChangeEvent
} from '@mui/material';

// icons
import NumbersIcon from '@mui/icons-material/Numbers';
// local
import CharacteristicCard from './CharacteristicCard';
import { ble_data_formats, readValue } from "./bluetooth_utils";

const CharacteristicCardGrid = (props: {
    chr_wrappers: CharacteristicWrapper[],
    setChrWrappers: (chs: CharacteristicWrapper[]) => void,
}) => {
    function mini_card(
        chr_wrapper: CharacteristicWrapper,
        idx: number) {

        const changeBleType = (ev: SelectChangeEvent) => {
            const new_type = ble_data_formats.find(element => element.name === ev.target.value);
            if (!new_type) { return; }
            props.setChrWrappers(
                props.chr_wrappers.map((c, i) => {
                    if (i === idx) {
                        return {
                            characteristic: c.characteristic,
                            name: c.name,
                            config: c.config,
                            data_type: new_type,
                            prefix: c.prefix,
                            unit: c.unit,
                            decoder: new_type.decoder,
                            encoder: new_type.encoder,
                            value: c.value
                        };
                    }
                    else { return c; }
                })
            );
        }


        const readValueHandle = (chr_wrapper: CharacteristicWrapper) => {
            readValue(chr_wrapper).then((v) => {
                props.setChrWrappers(
                    props.chr_wrappers.map((c, i) => {
                        if (i === idx) {
                            return {
                                characteristic: c.characteristic,
                                name: c.name,
                                config: c.config,
                                data_type: c.data_type,
                                prefix: c.prefix,
                                unit: c.unit,
                                value: v ?? "none"
                            };
                        }
                        else { return c; }
                    })
                );
            });
        }

        const notifyValueHandle = (ev: any) => {
            if (!ev.target) { return; }
            let v = ev.target.value as DataView;
            props.setChrWrappers(
                props.chr_wrappers.map((c, i) => {
                    if (i === idx) {
                        return {
                            characteristic: c.characteristic,
                            name: c.name,
                            config: c.config,
                            data_type: c.data_type,
                            prefix: c.prefix,
                            unit: c.unit,
                            value: c.data_type.decoder(v, 0)
                        };
                    }
                    else { return c; }
                })
            );
        }

        return (
            <Grid item key={`${chr_wrapper.characteristic.uuid}-${idx}`} xs={12} md={6}>
                <CharacteristicCard
                    characteristic={chr_wrapper}
                    readValueHandle={() => { readValueHandle(chr_wrapper) }}
                    notifyHandle={notifyValueHandle}
                    changeBleType={changeBleType}
                    avatar={<Avatar> <NumbersIcon />  </Avatar>} />
            </Grid>
        )
    }

    const cards = props.chr_wrappers.map(
        (char, i) =>
            mini_card(char, i)
    );

    return (
        <>{cards}</>
    );
}



export default CharacteristicCardGrid;