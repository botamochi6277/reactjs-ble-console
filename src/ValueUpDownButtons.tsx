import * as React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';

import {
    KeyboardArrowUp as KeyboardArrowUpIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon
} from "@mui/icons-material";

const ValueUpDownButtons = (props: {
    onClickUp: React.MouseEventHandler<HTMLButtonElement>,
    onClickDown: React.MouseEventHandler<HTMLButtonElement>
}) => {
    const buttons = [
        <Button
            key="up" startIcon={<KeyboardArrowUpIcon />}
            onClick={props.onClickUp} sx={{ justifyContent: "start" }}>Up</Button>,
        <Button
            key="down" startIcon={<KeyboardArrowDownIcon />}
            onClick={props.onClickDown} sx={{ justifyContent: "start" }}>Down</Button>,
    ];
    return (
        <ButtonGroup
            orientation="vertical"
            aria-label="Vertical button group"
            variant="contained"
        >
            {buttons}
        </ButtonGroup>
    );

}

export default ValueUpDownButtons;