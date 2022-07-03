import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';


import { Card } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';


function PropertiesChip(props) {
    const properties = props.properties;
    /** @type {string}  */
    let s = "";
    if (properties.read) {
        s += "Read|"
    }
    if (properties.write) {
        s += "Write|"
    }
    if (properties.notify) {
        s += "Notify";
    }
    return (
        <Chip label={s} />
    )
}

function CharacteristicCard(props) {
    // https://developer.mozilla.org/en-US/docs/Web/API/BluetoothRemoteGATTCharacteristic
    const characteristic = props.characteristic;

    if (characteristic == null) {
        return (<Card>
            <CardContent>
                <Typography variant="h5" component="div">{props.name}</Typography>
            </CardContent>
        </Card>
        )
    }

    const uuid = characteristic.uuid;
    // BluetoothCharacteristicProperties
    const properties = characteristic.properties;
    const value = characteristic.value;


    return (
        <Card>
            <CardContent>
                <Typography variant="h5" component="div">{props.name}</Typography>

                <PropertiesChip properties={properties} />
                <Stack direction="row" spacing={1}>
                    <Chip label={props.type} avatar={props.avatar} />
                    <Chip label={uuid} variant="outlined" />
                </Stack>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    {value}
                </Typography>

            </CardContent>
        </Card>
    )
}


export default CharacteristicCard;