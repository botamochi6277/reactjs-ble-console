
// icons
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import NumbersIcon from '@mui/icons-material/Numbers';
import PaletteIcon from '@mui/icons-material/Palette';
import Rotate90DegreesCcwIcon from '@mui/icons-material/Rotate90DegreesCcw';
import ScreenRotationAltIcon from '@mui/icons-material/ScreenRotationAlt';
import SpeedIcon from '@mui/icons-material/Speed';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import TimerIcon from '@mui/icons-material/Timer';

export const DataDimensionsIcon = (props: { dimensions: string }) => {

  switch (props.dimensions) {
    case "m/s**2":
      return <SpeedIcon />;
    case "rad/s":
      return <ScreenRotationAltIcon />;
    case "sec":
      return <TimerIcon />;
    case "Hz":
      return <MonitorHeartIcon />;
    case "°C":
      return <ThermostatIcon />;
    case "rad":
      return <Rotate90DegreesCcwIcon />;
    case "deg":
      return <Rotate90DegreesCcwIcon />;
    case "#":
      return <PaletteIcon />;
    case "$":
      return <PaletteIcon />;
    default:
      return <NumbersIcon />;
  }
}

