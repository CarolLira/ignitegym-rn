import { ReactNode, createContext, useState, useEffect } from "react";

import { storageUserSave, storageGetUser, storageRemoveUser } from '@storage/storageUser';

import { api } from "@services/api";
import { UserDTO } from "@dtos/UserDTO";

export type AuthContextDataProps = {
    user: UserDTO;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    isLoadingUserData: boolean;
}

type AuthContextProviderProps = {
    children: ReactNode;
}

export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps);

export function AuthContextProvider({ children }: AuthContextProviderProps) {
    const [user, setUser] = useState<UserDTO>({} as UserDTO);
    const [isLoadingUserData, setIsLoadingUserData] = useState(true);

    async function signIn(email: string, password: string) {
        try {
            const { data } = await api.post('/sessions', { email, password });

            if (data.user) {
                setUser(data.user);
                storageUserSave(data.user);
            }
        } catch (error) {
            throw error;
        }
    }

    async function signOut() {
        try {
            setIsLoadingUserData(true);
            await storageRemoveUser();
            setUser({} as UserDTO);
        } catch (error) {
            throw error;
        } finally {
            setIsLoadingUserData(false);
        }
    }

    async function loadUserData() {
        try {
            const userLogged = await storageGetUser();

            if (userLogged) {
                setUser(userLogged);
            }
        } catch (error) {
            throw error;
        } finally {
            setIsLoadingUserData(false);
        }
    }

    useEffect(() => {
        loadUserData();
    });

    return (
        <AuthContext.Provider value={{ user, signIn, signOut, isLoadingUserData }}>
            {children}
        </AuthContext.Provider>
    )
}