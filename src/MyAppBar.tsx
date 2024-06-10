import {
    AppBar,
    Avatar,
    Container,
    Divider,
    IconButton,
    Stack,
    Switch,
    Theme,
    Toolbar,
    Typography,
} from "@mui/material";

// icons
import DarkModeIcon from "@mui/icons-material/DarkMode";
import GitHubIcon from "@mui/icons-material/GitHub";
import LightModeIcon from "@mui/icons-material/LightMode";

import {
    PhoneAndroid as PhoneAndroidIcon,
    Computer as ComputerIcon,
} from "@mui/icons-material";

const MyAppBar = (props: {
    theme: Theme;
    onToggleTheme?: (
        event: React.ChangeEvent<HTMLInputElement>,
        checked: boolean
    ) => void;
    is_compact_view?: boolean;
    onToggleAdvancedMode?: (
        event: React.ChangeEvent<HTMLInputElement>,
        checked: boolean
    ) => void;
}) => {
    return (
        <AppBar position="static" color="primary" enableColorOnDark>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    {/* <BluetoothIcon sx={{ display: { md: "flex" }, mr: 1 }} /> */}
                    <IconButton disabled>
                        <Avatar src="/ble_button.svg" alt="app icon" />
                    </IconButton>
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            mr: 2,
                            display: { xs: "none", sm: "flex" },
                            fontFamily: "monospace",
                            fontWeight: 700,
                            letterSpacing: ".3rem",
                            color: "inherit",
                            textDecoration: "none",
                        }}
                    >
                        BLE WEB Console
                    </Typography>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1 }}
                    ></Typography>
                    <Stack
                        direction="row"
                        spacing={1}
                        divider={<Divider orientation="vertical" flexItem />}
                    >
                        <IconButton
                            color="inherit"
                            href="https://github.com/botamochi6277/reactjs-ble-console"
                            target="_blank"
                        >
                            <GitHubIcon />
                        </IconButton>
                        {/*  */}
                        <Stack direction="row" spacing={0} alignItems="center">
                            <ComputerIcon fontSize="small" />
                            <Switch
                                checked={props.is_compact_view}
                                onChange={props.onToggleAdvancedMode}
                                color="secondary"
                            />
                            <PhoneAndroidIcon fontSize="small" />
                        </Stack>
                        {/*  */}
                        <Stack direction="row" spacing={0} alignItems="center">
                            <LightModeIcon fontSize="small" />
                            <Switch
                                checked={props.theme.palette.mode === "dark"}
                                onChange={props.onToggleTheme}
                                color="secondary"
                            />
                            <DarkModeIcon fontSize="small" />
                        </Stack>
                    </Stack>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default MyAppBar;
