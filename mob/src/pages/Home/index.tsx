import React, {useEffect, useState} from 'react';
import {Feather} from '@expo/vector-icons';
import {View,ImageBackground,Text, Image, Alert} from 'react-native';
import {RectButton} from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';

import styles from './styles';

interface Estado{
  id: number;
  sigla: string;
  nome: string;
}

interface Cidade{
  nome: string;
}

const Home = () => {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [selectedEstado, setSelectedEstado] = useState<String>("");
  const [selectedCidade, setSelectedCidade] = useState<String>("");
  const navigation = useNavigation();

  const handleNavigateToPoints = () => {
      if(selectedEstado === "" || selectedCidade === ""){
        Alert.alert('Ops...', 'Você precisa selecionar todos os campos para prosseguir');
      }else{
        navigation.navigate('Points', {
          estado: selectedEstado,
          cidade: selectedCidade
        });
      }
  }

  const getEstados = async () => {
    await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(res => {
      setEstados(res.data);
    });
  }

  useEffect(() =>{
    getEstados();
  }, []);

  useEffect(() => {
    if(selectedEstado !== ""){
      axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedEstado}/municipios`).then(res => {
        setCidades(res.data);
      })
    }
  }, [selectedEstado])

  return (
      <ImageBackground 
        source={require('../../assets/home-background.png')}
        style={styles.container}
        imageStyle={{width:274, height:368}}
      >
        <View style={styles.container}>
          <View style={styles.main}>
            <Image source={require('../../assets/logo.png')} />
            <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
            <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coletas de forma eficiente.</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.select}>
            <RNPickerSelect
                onValueChange={(value) => setSelectedEstado(value)}
                placeholder={{label:'Selecione o estado'}}
                items= {estados && estados.map(estado => (
                  {label: estado.nome, value: estado.sigla}
                ))}
            />
          </View>
          <View style={styles.select}>
            <RNPickerSelect
                placeholder={{label:'Selecione a cidade'}}
                onValueChange={(value) => setSelectedCidade(value)}
                items= {cidades && cidades.map(cidade => (
                  {label: cidade.nome, value: cidade.nome}
                ))}
            />
          </View>
          <RectButton style={styles.button} onPress={handleNavigateToPoints}>
            <View style={styles.buttonIcon}>
              <Text>
                <Feather name="arrow-right" color="#FFF" size={24}/>
              </Text>
            </View>
            <Text style={styles.buttonText}>
              Entrar
            </Text>
          </RectButton>
        </View>

      </ImageBackground>
  )
}



export default Home;