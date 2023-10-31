import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { VStack, Text, HStack, FlatList, Heading } from 'native-base';

import { Group } from '@components/Group';
import { HomeHeader } from '@components/HomeHeader';
import { ExerciseCard } from '@components/ExerciseCard';
import { AppNavigatorRoutesProps } from '@routes/app.routes';

export function Home() {
    const navigation = useNavigation<AppNavigatorRoutesProps>();

    const [groups, setGroups] = useState(['costas', 'bíceps', 'tríceps', 'ombro']);
    const [exercises, setExercises] = useState(['Puxada frontal', 'Remada curvada', 'Remada unilateral', 'Levantamento terras']);
    const [selectedGroup, setSelectedGroup] = useState('ombro');

    function handleOpenExerciseDetails() {
        navigation.navigate('exercise');
    }

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
                    keyExtractor={item => item}
                    showsVerticalScrollIndicator={false}
                    _contentContainerStyle={{
                        paddingBottom: 20
                    }}
                    renderItem={({ item }) => (
                        <ExerciseCard
                            onPress={handleOpenExerciseDetails}
                        />
                    )}
                />

            </VStack>
        </VStack>
    );
}