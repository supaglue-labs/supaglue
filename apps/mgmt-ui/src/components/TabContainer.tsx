import { Box } from '@mui/material';

interface TabContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function TabContainer(props: TabContainerProps) {
  const { children } = props;

  return (
    <Box component="main" sx={{ flex: 1, p: 1, bgcolor: '#eaeff1' }}>
      {children}
    </Box>
  );
}
