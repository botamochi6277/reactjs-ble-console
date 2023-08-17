import { CardHeader, Alert, Avatar, Chip, Card, CardContent } from '@mui/material';

import BluetoothIcon from '@mui/icons-material/Bluetooth';
import TabletAndroidIcon from '@mui/icons-material/TabletAndroid';

const DeviceName = (props: {
    device: BluetoothDevice | null
}) => {
    const device = props.device;
    if (device == null) {
        return (<Alert severity="info">No connected device</Alert>)
    } else {
        return <Chip color="success" icon={<BluetoothIcon />} label={device.name} />
    }
}

const DeviceCard = (props: { device: BluetoothDevice | null }
) => {
    const device = props.device;
    return (
        <Card>
            <CardHeader
                avatar={
                    <Avatar sx={{ width: 36, height: 36 }}>
                        <TabletAndroidIcon />
                    </Avatar>
                }
                title="Device"
                titleTypographyProps={{ variant: 'h5' }}
            >

            </CardHeader>
            <CardContent>
                <DeviceName device={device} />
            </CardContent>
        </Card>
    );
}

export default DeviceCard;