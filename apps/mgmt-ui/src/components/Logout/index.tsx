import { IS_CLOUD } from '@/pages/api';
import { useClerk } from '@clerk/nextjs';
import MUILogout from '@mui/icons-material/Logout';
import { ListItemIcon, MenuItem } from '@mui/material';
import { signOut } from 'next-auth/react';

const LogoutImpl = ({ handleLogout }: { handleLogout: () => void }) => {
  return (
    <MenuItem onClick={handleLogout}>
      <ListItemIcon>
        <MUILogout fontSize="small" />
      </ListItemIcon>
      Logout
    </MenuItem>
  );
};

const NonCloudLogout = () => {
  const handleLogout = async () => {
    await signOut();
  };
  return <LogoutImpl handleLogout={handleLogout} />;
};

const CloudLogout = () => {
  const { signOut: clerkSignOut } = useClerk();
  const handleLogout = async () => {
    await clerkSignOut();
  };
  return <LogoutImpl handleLogout={handleLogout} />;
};

export const Logout = () => (IS_CLOUD ? <CloudLogout /> : <NonCloudLogout />);
