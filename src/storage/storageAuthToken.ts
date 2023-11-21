import AsyncStorage from '@react-native-async-storage/async-storage';

import { AUTH_TOKEN_STORAGE } from '@storage/storageConfig';

export async function setStorageAuthToken(token: string) {
    await AsyncStorage.setItem(AUTH_TOKEN_STORAGE, token);
}

export async function getStorageAuthToken() {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_STORAGE);
    return token;
}

export async function removeStorageAuthToken() {
    await AsyncStorage.removeItem(AUTH_TOKEN_STORAGE);
}