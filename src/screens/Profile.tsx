import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Center, ScrollView, VStack, Skeleton, Text, Heading, useToast } from 'native-base';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

import { ScreenHeader } from '@components/ScreenHeader';
import { UserPhoto } from '@components/UserPhoto';
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { useAuth } from '@hooks/useAuth';

import { api } from '@services/api';
import { AppError } from '@utils/AppError';

const PHOTO_SIZE = 33;

type FormDataProps = {
    name: string;
    email: string;
    password: string;
    old_password: string;
    password_confirm: string;
}

type FileInfo = {
    exists: true;
    uri: string;
    size: number;
    isDirectory: boolean;
    modificationTime: number;
    md5?: string;
}

const profileSchema = yup.object({
    name: yup.string().required('Informe o nome.'),
    password: yup.string().min(6, 'A senha deve ter no mínimo 6 dígitos.').nullable().transform((value) => !!value ? value : null),
    password_confirm: yup
        .string()
        .nullable()
        .transform((value) => !!value ? value : null)
        .oneOf([yup.ref('password'), undefined], 'Confirmação de senha não confere.')
        .when('password', {
            is: (Field: any) => Field,
            then: (schema) => schema.nullable().required('Confirme a senha.').transform((value) => !!value ? value : null),
        })
});

export function Profile() {
    const [isUpdating, setIsUpdating] = useState(false);
    const [photoIsLoading, setPhotoIsLoading] = useState(false);
    const [userPhoto, setUserPhoto] = useState('https://github.com/CarolLira.png');

    const toast = useToast();
    const { user, updateUserProfile } = useAuth();

    const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
        defaultValues: {
            name: user.name,
            email: user.email,
        },
        resolver: yupResolver(profileSchema),
    });

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

    async function handleProfileUpdate(data: FormDataProps) {
        try {
            setIsUpdating(true);

            const userUpdated = user;
            userUpdated.name = data.name;
            
            await api.put('/users', data);
            await updateUserProfile(userUpdated);

            toast.show({
                title: 'Perfil atualizado!',
                placement: 'top',
                bgColor: 'green.500',
            });
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possível atualizar os dados.'
        
            toast.show({
                title,
                placement: 'top',
                bgColor: 'red.500',
            });
        } finally {
            setIsUpdating(false);
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

                    <Controller
                        control={control}
                        name='name'
                        render={({ field: { value, onChange } }) => (
                            <Input
                                bg='gray.600'
                                placeholder='Nome'
                                onChangeText={onChange}
                                value={value}
                                errorMessage={errors.name?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name='email'
                        render={({ field: { value, onChange } }) => (
                            <Input
                                bg='gray.600'
                                placeholder='E-mail'
                                isDisabled
                                onChangeText={onChange}
                                value={value}
                            />
                        )}
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

                    <Controller
                        control={control}
                        name='old_password'
                        render={({ field: { onChange } }) => (
                            <Input
                                bg='gray.600'
                                placeholder='Senha antiga'
                                secureTextEntry
                                onChangeText={onChange}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name='password'
                        render={({ field: { onChange } }) => (
                            <Input
                                bg='gray.600'
                                placeholder='Nova senha'
                                secureTextEntry
                                onChangeText={onChange}
                                errorMessage={errors.password?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name='password_confirm'
                        render={({ field: { onChange } }) => (
                            <Input
                                bg='gray.600'
                                placeholder='Confirme a nova senha'
                                secureTextEntry
                                onChangeText={onChange}
                                errorMessage={errors.password_confirm?.message}
                            />
                        )}
                    />

                    <Button
                        title='Atualizar'
                        mt={4}
                        onPress={handleSubmit(handleProfileUpdate)}
                        isLoading={isUpdating}
                    />
                </Center>
            </ScrollView>
        </VStack>
    );
}