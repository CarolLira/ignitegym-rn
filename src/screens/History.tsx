import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { Heading, VStack, SectionList, Text, useToast } from 'native-base';
import { ScreenHeader } from '@components/ScreenHeader';
import { HistoryCard } from '@components/HistoryCard';
import { Loading } from '@components/Loading';

import { api } from '@services/api';
import { HistoryByDayDTO } from '@dtos/HistoryByDayDTO';

import { AppError } from '@utils/AppError';

export function History() {
    const [isLoading, setIsLoading] = useState(true)

    const toast = useToast();

    const [exercises, setExercises] = useState<HistoryByDayDTO[]>([]);

    async function fetchHistory() {
        try {
            setIsLoading(true);

            const response = await api.get('/history');
            setExercises(response.data);

        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possível carregar o histórico.'

            toast.show({
                title,
                placement: 'top',
                bgColor: 'red.500',
            });
        } finally {
            setIsLoading(false);
        }
    }

    useFocusEffect(useCallback(() => {
        fetchHistory();
    }, []));

    return (
        <VStack flex={1}>
            <ScreenHeader
                title='Histórico de Exercícios'
            />

            {isLoading ? <Loading /> :
                <SectionList
                    px={8}
                    contentContainerStyle={exercises.length === 0 && {
                        flex: 1,
                        justifyContent: 'center',
                    }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => (
                        <Text color='gray.100' textAlign='center'>
                            Não há exercícios registrados ainda. {'\n'}
                            Vamos fazer exercícios hoje?
                        </Text>
                    )}
                    sections={exercises}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <HistoryCard
                            data={item}
                        />
                    )}
                    renderSectionHeader={({ section }) => (
                        <Heading color='gray.200' fontSize='md' fontFamily='heading' mt={10} mb={3}>
                            {section.title}
                        </Heading>
                    )}
                />
            }

        </VStack>
    );
}