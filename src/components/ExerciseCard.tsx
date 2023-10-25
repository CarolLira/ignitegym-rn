import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { HStack, Heading, Image, VStack, Text, Icon } from "native-base";

import { Entypo } from '@expo/vector-icons';

type Props = TouchableOpacityProps & {

};

export function ExerciseCard({...rest}: Props) {
    return (
        <TouchableOpacity {...rest}>
            <HStack bg='gray.500' alignItems='center' p={2} pr={4} mb={3} rounded='md'>
                <Image
                    source={{ uri: 'https://static.tuasaude.com/media/article/wv/no/treino-costas_57722_l.jpg' }}
                    alt='Imagem remada unilateral'
                    w={16}
                    h={16}
                    rounded='md'
                    mr={4}
                    resizeMode='cover'
                />
                <VStack flex={1}>
                    <Heading color='white' fontSize='lg'>
                        Remada unilateral
                    </Heading>
                    <Text color='gray.200' fontSize='sm' numberOfLines={2}>
                        3 séries x 12 repetições
                    </Text>
                </VStack>

                <Icon as={Entypo} name='chevron-thin-right' color='gray.300'/>
            </HStack>
        </TouchableOpacity>
    );
}