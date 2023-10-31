import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Center, ScrollView, VStack, Skeleton, Text, Heading, useToast } from 'native-base';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

import { ScreenHeader } from '@components/ScreenHeader';
import { UserPhoto } from '@components/UserPhoto';
import { Input } from '@components/Input';
import { Button } from '@components/Button';

const PHOTO_SIZE = 33;

type FileInfo = {
    exists: true;
    uri: string;
    size: number;
    isDirectory: boolean;
    modificationTime: number;
    md5?: string;
}

export function Profile() {
    const [photoIsLoading, setPhotoIsLoading] = useState(false);
    const [userPhoto, setUserPhoto] = useState('https://github.com/CarolLira.png');

    const toast = useToast();

    async function handleSelectUserPhoto() {
        setPhotoIsLoading(true);
        try {
            const selectedPhoto = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
                aspect: [4, 4],
                allowsEditing: true,
                selectionLimit: 1,
            });

            console.log('selectedPhoto', selectedPhoto);

            if (selectedPhoto.canceled) {
                return;
            }

            if (selectedPhoto.assets[0].uri) {
                const photoInfo = await FileSystem.getInfoAsync(selectedPhoto.assets[0].uri, { size: true }) as FileInfo;
                
                if (photoInfo.size && (photoInfo.size / 1024 / 1024) > 5) {
                    return toast.show({
                        title: 'Essa imagem é muito grande. Escolha uma de até 5MB.',
                        placement: 'top',
                        bgColor: 'red.500',
                    });
                }

                setUserPhoto(selectedPhoto.assets[0].uri);
            }

            
        } catch (error) {
            console.log(error);
        } finally {
            setPhotoIsLoading(false);
        }

    }

    return (
        <VStack flex={1}>
            <ScreenHeader title='Perfil' />

            <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
                <Center mt={6} px={10}>
                    {
                        photoIsLoading ?
                            <Skeleton
                                w={PHOTO_SIZE}
                                h={PHOTO_SIZE}
                                rounded='full'
                                startColor='gray.500'
                                endColor='gray.400'
                            /> :
                            <UserPhoto
                                source={{ uri: userPhoto }}
                                alt='Foto do usuário'
                                size={PHOTO_SIZE}
                            />
                    }

                    <TouchableOpacity
                        onPress={handleSelectUserPhoto}>
                        <Text
                            color='green.500'
                            fontWeight='bold'
                            fontSize='md'
                            mt={2} mb={8}>
                            Alterar foto
                        </Text>
                    </TouchableOpacity>

                    <Input
                        bg='gray.600'
                        placeholder='Nome'
                    />
                    <Input
                        bg='gray.600'
                        placeholder='E-mail'
                        isDisabled
                    />
                </Center>

                <Center px={10} mt={12} mb={9}>
                    <Heading
                        color='gray.200'
                        fontSize='md'
                        fontFamily='heading'
                        alignSelf='flex-start'
                        mb={2}
                    >
                        Alterar senha
                    </Heading>

                    <Input
                        bg='gray.600'
                        placeholder='Senha antiga'
                        secureTextEntry
                    />
                    <Input
                        bg='gray.600'
                        placeholder='Nova senha'
                        secureTextEntry
                    />
                    <Input
                        bg='gray.600'
                        placeholder='Confirme a nova senha'
                        secureTextEntry
                    />
                    <Button
                        title='Atualizar'
                        mt={4}
                    />
                </Center>
            </ScrollView>
        </VStack>
    );
}