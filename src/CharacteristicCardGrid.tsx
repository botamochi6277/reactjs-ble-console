
import {
    Avatar,
    Grid,
    SelectChangeEvent
} from '@mui/material';

// icons
import NumbersIcon from '@mui/icons-material/Numbers';
// local
import CharacteristicCard from './CharacteristicCard';
import { ble_data_formats, loadValue } from "./bluetooth_utils";


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
                            ...c,
                            data_type: new_type,
                        };
                    }
                    else { return c; }
                })
            );
        }


        const readValueHandle = (chr_wrapper: CharacteristicWrapper) => {
            loadValue(chr_wrapper).then((dv) => {
                props.setChrWrappers(
                    props.chr_wrappers.map((c, i) => {
                        if (i === idx) {
                            return {
                                ...c,
                                dataview: dv
                            };
                        }
                        else { return c; }
                    })
                );
            });
        }

        const notifyValueHandle = (ev: any) => {
            if (!ev.target) { return; }
            let dv = ev.target.value as DataView;
            props.setChrWrappers(
                props.chr_wrappers.map((c, i) => {
                    if (i === idx) {
                        return {
                            ...c,
                            dataview: dv
                        };
                    }
                    else { return c; }
                })
            );
        }

        return (
            <Grid item key={`${chr_wrapper.characteristic.uuid}-${idx}`} xs={12} md={6}>
                <CharacteristicCard
                    wrapper={chr_wrapper}
                    readValueHandle={() => { readValueHandle(chr_wrapper); }}
                    notifyHandle={notifyValueHandle}
                    changeBleType={changeBleType}
                    avatar={<Avatar> <NumbersIcon />  </Avatar>} />
            </Grid>
        )
    }

    const cards = props.chr_wrappers.map(
        (wrapper, i) =>
            mini_card(wrapper, i)
    );

    return (
        <>{cards}</>
    );
}



export default CharacteristicCardGrid;