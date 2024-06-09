import * as React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';



const ValueUpDownButtons = (props: {
    onClickUp: React.MouseEventHandler<HTMLButtonElement>,
    onClickDown: React.MouseEventHandler<HTMLButtonElement>
}) => {
    const buttons = [
        <Button key="up" onClick={props.onClickUp}>Up</Button>,
        <Button key="down" onClick={props.onClickDown}>Down</Button>,
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