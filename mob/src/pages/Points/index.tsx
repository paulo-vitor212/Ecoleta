import React, {useState, useEffect} from 'react';
import {Feather as Icon} from '@expo/vector-icons';
import {View, Text, TouchableOpacity, ScrollView, Image, SafeAreaView, Alert} from 'react-native';
import { useNavigation,useRoute } from '@react-navigation/native';
import MapView, {Marker} from 'react-native-maps';
import { SvgUri } from 'react-native-svg';
import * as Location from 'expo-location';
import api from '../../services/api';

import styles from './styles'

interface Item {
  id: number;
  title:string,
  url: string;
}

interface Point {
  id: number;
  name:string,
  image: string;
  latitude: number;
  longitude: number;
}

interface Params {
  cidade: string;
  estado: string;
}

const Points = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [initialPosition,setInitialPosition] = useState<[number, number]>([0,0]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const navigation = useNavigation();
  const route = useRoute();

  const handleNavigationBack = () => {
    navigation.goBack();
  }

  const routeParams = route.params as Params;

  const handleNavigateToDetail = (id: number) => {
    navigation.navigate('Detail', {point_id: id});
  }

  const handleSelectItem = (id:number) => {
    if(selectedItems.includes(id)){
      //tirando o item já incluído
    const filteredItems = selectedItems.filter(item => item !== id);
      setSelectedItems(filteredItems);
    
    }else{
      //colocando o item escolhido
      setSelectedItems([
        ...selectedItems,
        id
      ]);
    }
  }

  const getItems = () => {
    api.get('/items').then(res => {
      setItems(res.data.serializerItems);
    });
  }

  const getPoints = () => {
    if(selectedItems[0]){
      api.get('/points',{
        params: {
          cidade: routeParams.cidade,
          uf: routeParams.estado,
          items: selectedItems
        }
      }).then(res => {
        setPoints(res.data.point);
      });
    }
  }

  const getLoadPosition = async () => {
    const { status } = await Location.requestPermissionsAsync();

    if(status !== 'granted'){
      Alert.alert('Ops..', 'Precisamos da sua permissão para obter a localização')
      return;
    }

    const location = await Location.getCurrentPositionAsync();

    const { latitude, longitude } = location.coords;
    setInitialPosition([
      latitude,
      longitude
    ])

  }

  useEffect( ()=>{
    getItems()
    getLoadPosition()
    

  },[])

  useEffect( ()=>{
    getPoints()
  },[selectedItems])

  return(
    <SafeAreaView style={{flex:1}}>
      <View style={styles.container} >
        <TouchableOpacity onPress={handleNavigationBack} >
          <Icon name="arrow-left" size={30}  color="#34cb79"/>
        </TouchableOpacity>
        <Text style={styles.title}>Bem vindo.</Text>
        <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

        <View style={styles.mapContainer}>
          {initialPosition[0] !== 0 && (
            <MapView 
              style={styles.map}
              initialRegion={{
                latitude: initialPosition[0],
                longitude: initialPosition[1],
                latitudeDelta: 0.15,
                longitudeDelta: 0.15,
              }}
            >
              {points && points.map(point => (
                <Marker 
                key={String(point.id)}
                style={styles.mapMarker}
                onPress={() => handleNavigateToDetail(point.id)}
                coordinate={{
                  latitude:point.latitude,
                  longitude: point.longitude
                }}
              >
                <View style={styles.mapMarkerContainer}>
                  <Image style={styles.mapMarkerImage} source={{ uri: point.image}}/>
                  <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                </View>
              </Marker>  
              ))}
            </MapView>
          )}
        </View>
      </View>
      <View style={styles.itemsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {items.map( item => (
            <TouchableOpacity 
              activeOpacity={0.4}
              key={String(item.id)} 
              style={[ 
                styles.item,
                selectedItems.includes(item.id) ? styles.selectedItem : {}
              ]} 
              onPress={() => handleSelectItem(item.id) }>

                <SvgUri width={42} height={42} uri={item.url} />
                <Text style={styles.itemTitle}>{item.title}</Text>

            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView> 
  )
}

export default Points;