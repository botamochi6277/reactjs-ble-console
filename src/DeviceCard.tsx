import { Avatar, Box, Card, CardContent, CardHeader, CircularProgress, Grid } from '@mui/material';

import BluetoothIcon from '@mui/icons-material/Bluetooth';

import CharacteristicCardGrid from './CharacteristicCardGrid';

function CircularIndeterminate() {
    return (
        <Box sx={{ display: 'flex' }}>
            <CircularProgress />
        </Box>
    );
}

const DeviceCard = (props: {
    device: BluetoothDevice | null,
    chr_wrappers: CharacteristicWrapper[],
    setChrWrappers: (chs: CharacteristicWrapper[]) => void
}
) => {
    const device = props.device;
    return (
        <Card>
            <CardHeader
                avatar={
                    <Avatar sx={{ width: 36, height: 36 }}>
                        <BluetoothIcon />
                    </Avatar>
                }
                title={device ? device.name : "Device"}
                titleTypographyProps={{ variant: 'h5' }}
            >

            </CardHeader>
            <CardContent>
                {(device && props.chr_wrappers.length === 0) ? <CircularIndeterminate /> : null}

                <Box sx={{ flexGrow: 1 }}>
                    <Grid container spacing={2}>
                        <CharacteristicCardGrid
                            chr_wrappers={props.chr_wrappers}
                            setChrWrappers={props.setCharacteristics}
                        />
                    </Grid>
                </Box>
            </CardContent>
        </Card>
    );
}

export default DeviceCard;