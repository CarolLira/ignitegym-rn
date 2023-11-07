import { useTheme, Box } from 'native-base';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { AuthRoutes } from './auth.routes';
import { AppRoutes } from './app.routes';
import { Loading } from '@components/Loading';

import { useAuth } from '@hooks/useAuth';

export function Routes() {
    const { colors } = useTheme();

    const { user, isLoadingUserData } = useAuth();

    const theme = DefaultTheme;
    theme.colors.background = colors.gray[700];

    if (isLoadingUserData) {
        return <Loading/>
    }

    return (
        <Box flex={1} bg='gray.700'>
            <NavigationContainer theme={theme}>
                {user.id ? <AppRoutes /> : <AuthRoutes />}
            </NavigationContainer>
        </Box>
    );
}