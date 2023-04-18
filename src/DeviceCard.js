//@ts-check
import React from 'react';

import { CardHeader, Alert, Avatar, Chip, Card, CardContent } from '@mui/material';

import BluetoothIcon from '@mui/icons-material/Bluetooth';
import TabletAndroidIcon from '@mui/icons-material/TabletAndroid';

/**
 * 
 * @param {{device:BluetoothDevice|null}} props 
 * @returns 
 */
function DeviceName(props) {
    const device = props.device;
    if (device == null) {
        return (<Alert severity="info">No connected device</Alert>)
    } else {
        return <Chip color="success" icon={<BluetoothIcon />} label={device.name} />
    }
}


/**
 * 
 * @param {{device:BluetoothDevice|null}} props 
 * @returns 
 */
function DeviceCard(props) {
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