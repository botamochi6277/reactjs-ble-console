
// icons
import ThermostatIcon from '@mui/icons-material/Thermostat';
import TimerIcon from '@mui/icons-material/Timer';
import SpeedIcon from '@mui/icons-material/Speed';
import ScreenRotationAltIcon from '@mui/icons-material/ScreenRotationAlt';
import Rotate90DegreesCcwIcon from '@mui/icons-material/Rotate90DegreesCcw';
import NumbersIcon from '@mui/icons-material/Numbers';

export const DataDimensionsIcon = (props: { dimensions: string }) => {

  switch (props.dimensions) {
    case "m/s**2":
      return <SpeedIcon />;
    case "rad/s":
      return <ScreenRotationAltIcon />;
    case "sec":
      return <TimerIcon />;
    case '°C':
      return <ThermostatIcon />;
    case 'rad':
      return <Rotate90DegreesCcwIcon />;
    case 'deg':
      return <Rotate90DegreesCcwIcon />;
    default:
      return <NumbersIcon />;
  }
}

