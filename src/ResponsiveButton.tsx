// https://codesandbox.io/p/sandbox/mui-responsive-button-v3gtvh?file=%2Fsrc%2FDemo.tsx%3A28%2C61-28%2C67
import { Box, Button, ButtonPropsColorOverrides } from "@mui/material";
import { OverridableStringUnion } from '@mui/types';
import * as React from "react";
const ResponsiveButton = (
    props: {
        icon?: React.ReactNode,
        label?: string,
        color?: OverridableStringUnion<
            'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning',
            ButtonPropsColorOverrides
        >,
        onClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void
    }
) => {
    return (
        <Button
            // sx={{
            //   minWidth: 32,
            //   ".MuiButton-startIcon": {
            //     ml: { xs: 0, sm: "-4px" },
            //     mr: { xs: 0, sm: "8px" }
            //   }
            // }}
            sx={(theme) => ({
                [theme.breakpoints.down("sm")]: {
                    minWidth: 32,
                    ".MuiButton-startIcon": { m: 0 }
                }
            })}
            variant="contained"
            startIcon={props.icon}
            onClick={props.onClick}
            color={props.color}
        >
            <Box sx={{ display: { xs: "none", sm: "inline" } }}>{props.label}</Box>
        </Button>
    )
}

export default ResponsiveButton;