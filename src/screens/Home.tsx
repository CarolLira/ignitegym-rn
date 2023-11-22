import { useState, useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { VStack, Text, HStack, FlatList, Heading, useToast } from 'native-base';

import { Group } from '@components/Group';
import { HomeHeader } from '@components/HomeHeader';
import { ExerciseCard } from '@components/ExerciseCard';
import { Loading } from '@components/Loading';
import { AppNavigatorRoutesProps } from '@routes/app.routes';

import { api } from '@services/api';
import { AppError } from '@utils/AppError';
import { ExerciseDTO } from '@dtos/ExerciseDTO';

export function Home() {
    const toast = useToast();
    const navigation = useNavigation<AppNavigatorRoutesProps>();

    const [isLoading, setIsLoading] = useState(true);
    const [groups, setGroups] = useState<string[]>([]);
    const [exercises, setExercises] = useState<ExerciseDTO[]>([]);
    const [selectedGroup, setSelectedGroup] = useState('');

    function handleOpenExerciseDetails(exerciseId: string) {
        navigation.navigate('exercise', { exerciseId });
    }

    async function fetchGroups() {
        try {
            const response = await api.get('/groups');
            setGroups(response.data);

        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possível carregar os grupos musculares.'

            toast.show({
                title,
                placement: 'top',
                bgColor: 'red.500',
            });
        }
    }

    async function fetchExercisesByGroup() {
        try {
            setIsLoading(true);

            const response = await api.get(`/exercises/bygroup/${selectedGroup}`);
            setExercises(response.data);

        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possível carregar os exercícios.'

            toast.show({
                title,
                placement: 'top',
                bgColor: 'red.500',
            });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchGroups();
    }, []);

    useFocusEffect(useCallback(() => {
        fetchExercisesByGroup();
    }, [selectedGroup]));

    return (
        <VStack flex={1}>
            <HomeHeader />

            <FlatList
                data={groups}
                keyExtractor={item => item}
                horizontal
                showsHorizontalScrollIndicator={false}
                _contentContainerStyle={{ px: 8 }}
                my={10}
                maxHeight={10}
                minHeight={10}
                renderItem={({ item }) => (
                    <Group
                        name={item}
                        isActive={selectedGroup.toLocaleUpperCase() === item.toLocaleUpperCase()}
                        onPress={() => setSelectedGroup(item)}
                    />
                )}
            />

            {
                isLoading ?
                    <Loading />
                    :
                    <VStack flex={1} px={8}>
                        <HStack justifyContent='space-between' mb={5}>
                            <Heading color='gray.200' fontSize='md' fontFamily='heading'>
                                Exercícios
                            </Heading>
                            <Text color='gray.200' fontSize='sm'>
                                {exercises.length}
                            </Text>
                        </HStack>

                        <FlatList
                            data={exercises}
                            keyExtractor={item => item.id}
                            showsVerticalScrollIndicator={false}
                            _contentContainerStyle={{
                                paddingBottom: 20
                            }}
                            renderItem={({ item }) => (
                                <ExerciseCard
                                    onPress={() => handleOpenExerciseDetails(item.id)}
                                    data={item}
                                />
                            )}
                        />

                    </VStack>
            }

        </VStack>
    );
}