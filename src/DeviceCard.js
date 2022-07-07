//@ts-check
import React from 'react';

import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import ErrorIcon from '@mui/icons-material/Error';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import TabletAndroidIcon from '@mui/icons-material/TabletAndroid';


/**
 * 
 * @param {{device:BluetoothDevice|null}} props 
 * @returns 
 */
function DeviceNameClip(props) {
    const device = props.device;
    if (device == null) {
        return <Chip color="warning" icon={<ErrorIcon />} label={"No connected device"} />
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
        <Card variant="outlined">
            <CardContent>
                <Typography variant="h5" component="div">
                    <TabletAndroidIcon /> Device
                </Typography>
                <DeviceNameClip device={device} />
            </CardContent>
        </Card>
    );
}

export default DeviceCard;