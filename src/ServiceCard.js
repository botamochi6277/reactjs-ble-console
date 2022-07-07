//@ts-check

import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import FunctionsIcon from '@mui/icons-material/Functions';
import SearchIcon from '@mui/icons-material/Search';

/**
 * 
 * @param {{onClick:React.MouseEventHandler<HTMLButtonElement>,serviceUuid:string}} props 
 * @returns 
 */
function ServiceCard(props) {
    let on_click = props.onClick;
    const service_uuid = props.serviceUuid;
    return (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="h5" component="div">
                    <FunctionsIcon /> Service
                </Typography>

                {/* https://zenn.dev/enish/articles/5cc332d3eeb1a7 */}
                <TextField
                    required
                    style={{ width: 400 }}
                    id="outlined-required"
                    label="Service UUID"
                    value={service_uuid}
                />

                <Button variant="contained" onClick={on_click} startIcon={<SearchIcon />}>Search</Button>
            </CardContent>
        </Card>
    )
}


export default ServiceCard;