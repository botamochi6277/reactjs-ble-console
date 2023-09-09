import { Chip } from '@mui/material';
// icons
import MenuBookIcon from '@mui/icons-material/MenuBook';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EditIcon from '@mui/icons-material/Edit';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PodcastsIcon from '@mui/icons-material/Podcasts';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

export function CharacteristicPropertiesChip(props: {
  properties: BluetoothCharacteristicProperties,
}) {
  // https://developer.mozilla.org/en-US/docs/Web/API/BluetoothCharacteristicProperties
  const properties = props.properties;
  let chip_state = [];

  if (properties.authenticatedSignedWrites) {
    chip_state.push(
      { name: "authenticatedSignedWrites", icon: <EditOutlinedIcon /> }
    )
  }

  if (properties.broadcast) {
    chip_state.push(
      { name: "broadcast", icon: <PodcastsIcon /> }
    )
  }

  if (properties.indicate) {
    chip_state.push(
      { name: "indicate", icon: <LightbulbIcon /> }
    )
  }

  if (properties.notify) {
    chip_state.push(
      { name: "Notify", icon: <NotificationsIcon /> }
    )
  }

  if (properties.read) {
    chip_state.push(
      { name: "Read", icon: <MenuBookIcon /> }
    );
  }

  if (properties.reliableWrite) {
    chip_state.push(
      { name: "reliableWrite", icon: <EditOutlinedIcon /> }
    );
  }

  if (properties.writableAuxiliaries) {
    chip_state.push(
      { name: "writableAuxiliaries", icon: <EditOutlinedIcon /> }
    );
  }

  if (properties.write) {
    chip_state.push(
      { name: "write", icon: <EditIcon /> }
    );
  }

  if (properties.writeWithoutResponse) {
    chip_state.push(
      { name: "writeWithoutResponse", icon: <EditIcon /> }
    );
  }


  const chips = chip_state.map(
    (c) =>
      <Chip label={c.name} icon={c.icon} key={c.name} size='small' />
  )

  // https://bobbyhadz.com/blog/react-cannot-be-used-as-a-jsx-component
  return (
    <>
      {chips}
    </>
  )
}