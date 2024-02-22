import { Avatar, Box, Card, CardContent, CardHeader, CircularProgress, Grid } from '@mui/material';

import { LinkOff as LinkOffIcon } from '@mui/icons-material';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import BluetoothConnectedIcon from '@mui/icons-material/BluetoothConnected';

// house-made
import CharacteristicCardGrid from './CharacteristicCardGrid';

import ResponsiveButton from './ResponsiveButton';

function CircularIndeterminate() {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
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
                    <Avatar
                        sx={{
                            width: 36,
                            height: 36,
                            bgcolor: (props.chr_wrappers.length === 0 ? "secondary.main" : "primary.main")
                        }}>
                        {props.chr_wrappers.length === 0 ? <BluetoothIcon /> : <BluetoothConnectedIcon />}
                    </Avatar>
                }
                title={device ? device.name : "Device"}
                titleTypographyProps={{ variant: 'h5' }}
                subheader={device?.id}
                action={

                    <ResponsiveButton
                        icon={<LinkOffIcon />}
                        onClick={() => { device?.gatt?.disconnect() }}
                        label='Disconnect'
                        color='warning'
                    />

                    // <Button
                    //     startIcon={<LinkOffIcon />}
                    //     variant="contained"
                    //     color="warning"
                    //     size="small"
                    //     onClick={() => { device?.gatt?.disconnect() }}>Disconnect</Button>
                }
            >

            </CardHeader>

            {(device && props.chr_wrappers.length === 0) ? <CircularIndeterminate /> : null}
            <CardContent>
                <Box sx={{ flexGrow: 1 }}>
                    <Grid container spacing={2}>
                        <CharacteristicCardGrid
                            chr_wrappers={props.chr_wrappers}
                            setChrWrappers={props.setChrWrappers}
                        />
                    </Grid>
                </Box>
            </CardContent>
        </Card>
    );
}

export default DeviceCard;