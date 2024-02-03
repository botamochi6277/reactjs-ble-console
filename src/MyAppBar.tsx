

import { AppBar, Container, IconButton, Stack, Switch, Theme, Toolbar, Typography } from "@mui/material";

// icons
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import GitHubIcon from '@mui/icons-material/GitHub';
import LightModeIcon from '@mui/icons-material/LightMode';

const MyAppBar = (props: {
    theme: Theme,
    onToggleTheme?: any // (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void)
}) => {


    return (
        <AppBar position="static" color="primary" enableColorOnDark>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <BluetoothIcon sx={{ display: { md: 'flex' }, mr: 1 }} />
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', sm: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        BLE WEB Console
                    </Typography>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    </Typography>
                    <IconButton color="inherit" href='https://github.com/botamochi6277/reactjs-ble-console' target='_blank'>
                        <GitHubIcon />
                    </IconButton>
                    <Stack direction="row" spacing={0} alignItems="center">

                        <LightModeIcon fontSize="small" />
                        <Switch
                            checked={props.theme.palette.mode === 'dark'}
                            onChange={props.onToggleTheme}
                            color="secondary"
                        />
                        <DarkModeIcon fontSize="small" />
                    </Stack>
                </Toolbar></Container></AppBar>
    )
}

export default MyAppBar;