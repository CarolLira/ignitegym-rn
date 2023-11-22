import { ReactNode, createContext, useState, useEffect } from "react";

import { getStorageAuthToken, setStorageAuthToken, removeStorageAuthToken } from '@storage/storageAuthToken';
import { storageUserSave, storageGetUser, storageRemoveUser } from '@storage/storageUser';

import { api } from "@services/api";
import { UserDTO } from "@dtos/UserDTO";

export type AuthContextDataProps = {
    user: UserDTO;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    updateUserProfile: (userUpdate: UserDTO) => Promise<void>,
    isLoadingUserData: boolean;
}

type AuthContextProviderProps = {
    children: ReactNode;
}

export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps);

export function AuthContextProvider({ children }: AuthContextProviderProps) {
    const [user, setUser] = useState<UserDTO>({} as UserDTO);
    const [isLoadingUserData, setIsLoadingUserData] = useState(true);

    async function userAndTokenUpdate(userData: UserDTO, token: string) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(userData);
    }

    async function setStorageUserAndToken(userData: UserDTO, token: string) {
            try {
                setIsLoadingUserData(true);

                await storageUserSave(userData);
                await setStorageAuthToken(token);
            } catch (error) {
                throw error;
            } finally {
                setIsLoadingUserData(false);
            }
    }

    async function signIn(email: string, password: string) {
        try {
            const { data } = await api.post('/sessions', { email, password });
            
            if (data.user && data.token) {
                setIsLoadingUserData(true);

                await setStorageUserAndToken(data.user, data.token);
                userAndTokenUpdate(data.user, data.token);
            }
        } catch (error) {
            throw error;
        } finally {
            setIsLoadingUserData(false);
        }
    }

    async function signOut() {
        try {
            setIsLoadingUserData(true);
            await storageRemoveUser();
            await removeStorageAuthToken();
            setUser({} as UserDTO);
        } catch (error) {
            throw error;
        } finally {
            setIsLoadingUserData(false);
        }
    }

    async function updateUserProfile(userUpdated: UserDTO) {
        try {
            setUser(userUpdated);
            await storageUserSave(userUpdated);
        } catch (error) {
            throw error;
        }
    }

    async function loadUserData() {
        try {
            setIsLoadingUserData(true);

            const userLogged = await storageGetUser();
            const token = await getStorageAuthToken();

            if (token && userLogged) {
                userAndTokenUpdate(userLogged, token);
            }
        } catch (error) {
            throw error;
        } finally {
            setIsLoadingUserData(false);
        }
    }

    useEffect(() => {
        loadUserData();
    }, []);

    return (
        <AuthContext.Provider value={{ user, signIn, signOut, updateUserProfile, isLoadingUserData }}>
            {children}
        </AuthContext.Provider>
    )
}