import React, { useEffect,useState } from 'react';
import {View, Text, TouchableOpacity, Image, SafeAreaView, Linking} from 'react-native';
import {Feather as Icon, FontAwesome, Zocial} from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import {RectButton} from 'react-native-gesture-handler';
import api from '../../services/api';
import * as MailComposer from 'expo-mail-composer';

import styles from './styles'

interface Params {
  point_id: number;
}

interface Data {
  point: {
    name:string,
    image: string;
    cidade: string;
    uf: string;
    email: string;
    telefone: number;
  }
  items:{
    title:string;
  }[];
}

const Detail = () => {
  const [data, setData] = useState<Data>({} as Data)
  const navigation = useNavigation();
  const route = useRoute();

  const routeParams = route.params as Params;

  const handleNavigationBack = () => {
    navigation.goBack();
  }

  const handleComposeMail = () => {
    MailComposer.composeAsync({
      subject: 'Interesse na coleta de resíduos',
      recipients: [data.point.email],
    })
  }

  const handleWhatsapp = () => {
    Linking.openURL(`whatsapp://send?phone=5521${data.point.telefone}&text=Tenho interesse sobre a coleta seletiva`)
  }

  useEffect( () => {
    api.get(`/points/${routeParams.point_id}`).then(res => {
      setData(res.data);
    });
  },[])

  if(!data.point){
    return null;
  }

  return(
    <SafeAreaView style={{flex:1}}>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigationBack} >
            <Icon name="arrow-left" size={30}  color="#34cb79"/>
        </TouchableOpacity>
        <Image style={styles.pointImage} source={{uri: data.point.image}}></Image>
        <Text style={styles.pointName}> {data.point.name}</Text>
        <Text style={styles.pointItems}>{data.items.map( item => item.title).join(', ')}</Text>

        <View style={styles.address}>
          <Text style={styles.addressTitle}>Endereço</Text>
          <Text style={styles.addressContent}>{data.point.cidade}, {data.point.uf}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <RectButton style={styles.button} onPress={handleWhatsapp}>
          <FontAwesome name="whatsapp" size={20} color="#fff"/>
          <Text style={styles.buttonText}>
            Telefone
          </Text>
        </RectButton>
        <RectButton style={styles.button} onPress={handleComposeMail}>
          <Zocial name="email" size={20} color="#fff"/>
          <Text style={styles.buttonText}>
            E-mail
          </Text>
        </RectButton>
      </View>
    </SafeAreaView>
  )
}

export default Detail;