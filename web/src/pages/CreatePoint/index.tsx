import React, {useState,useEffect, ChangeEvent, FormEvent} from 'react';
import {Link,useHistory} from 'react-router-dom';
import {FiArrowLeft} from 'react-icons/fi';
import {Map, TileLayer, Marker} from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
 
import api from '../../services/api';
import axios from 'axios';

import './styles.css';

import Noty from 'noty';

import logo from '../../assets/logo.svg';


interface Item{
  id:number;
  title: string;
  url: string;
}

interface Estado{
  id: number;
  sigla: string;
  nome: string;
}

interface Cidade{
  id: number;
  nome: string;
}

const CreatPoint = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<Estado[]>([]);
  const [cidades,setCidades] = useState<Cidade[]>([]);
  const [selectedUf, setSelectedUf] = useState<String>("");
  const [selectedCidade, setSelectedCidade] = useState<String>("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedPositionMap, setSelectedPositionMap] = useState<[number,number]>([0,0]);
  const [initalPositionMap, setInitalPositionMap] = useState<[number,number]>([0,0]);
  const [formData, setFormData] = useState({
    name:'',
    email:'',
    telefone:'',
  });

  const history = useHistory();

  const handleMapClick = (event: LeafletMouseEvent) => {
    console.log(event.latlng);
    setSelectedPositionMap([
      event.latlng.lat,
      event.latlng.lng,
    ])
  }

  const getItems = async () => {
    await api.get('/items').then(res => {
      setItems(res.data.serializerItems);
    });
  }

  const getEstados = async () => {
    await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(res => {
      setUfs(res.data);
    });
  }

  useEffect(() =>{
    getItems();
    getEstados();
  }, []);

  useEffect(() => {
    if(selectedUf !== ""){
      axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(res => {
        setCidades(res.data);
      })
    }
  }, [selectedUf])
  
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      setInitalPositionMap([latitude,longitude]);

    })
  }, [])

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) =>{
    const name = event.currentTarget.name;
    const value = event.currentTarget.value;
    setFormData({
      ...formData,
      [name] : value
    })
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

  const handleSubmit = (event: FormEvent) =>{
    event.preventDefault();
    let podeCadastrar = false;
    if(selectedPositionMap[0] === 0){
      new Noty({
        type:'error',
        text:'Você esqueceu de colocar o ponto de coleta no mapa',
        timeout: 3000,
      }).show()
    }
    
    if(!selectedItems[0]){
      new Noty({
        type:'error',
        text:'Você não selecionou nenhum ítem',
        timeout: 3000,
      }).show()
    }
    
    if(selectedUf === ""){
      new Noty({
        type:'error',
        text:'Você não selecionou nenhum estado',
        timeout: 3000,
      }).show()
    }

    if(selectedCidade === ""){
      new Noty({
        type:'error',
        text:'Você não selecionou nenhuma cidade',
        timeout: 3000,
      }).show()
    }

    podeCadastrar = selectedPositionMap[0] === 0 || !selectedItems[0] || selectedCidade === "" || selectedUf === ""? false : true;


    if(podeCadastrar){
      const {name, email, telefone} = formData;
      const uf = selectedUf;
      const cidade = selectedCidade;
      const [latitude, longitude] = selectedPositionMap;
      const items = selectedItems;

      const data = {
        name,
        email,
        telefone,
        uf,
        cidade,
        latitude,
        longitude,
        items
      }

      api.post('points', data).then(res => {
        new Noty({
          type: 'success',
          text:'Ponto de coleta cadastrado com sucesso!',
          timeout:3000
        }).show()
        history.push('/');
      }).catch(err => {
        console.log(err)
        new Noty({
          type: 'error',
          text:'Ocorreu um erro, tente novamente mais tarde',
          timeout:3000
        }).show()
      })
    }
  
  }

  
  return(
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta"/>
        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form onSubmit={(e) => handleSubmit(e)}>
        <h1>Cadastro do <br /> ponto de coleta</h1>
        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          
          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input 
              type="text"
              name="name"
              id="name"
              onChange={e => handleInputChange(e)}
              required
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input 
                type="text"
                name="email"
                id="email"
                onChange={e => handleInputChange(e)}
                required
              />
            </div>
            
            <div className="field">
              <label htmlFor="telefone">Telefone</label>
              <input 
                type="text"
                name="telefone"
                id="telefone"
                onChange={e => handleInputChange(e)}
                required
              />
            </div>
          </div>

        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Seleciona o endereço no mapa</span>
          </legend>

          <Map center={initalPositionMap} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPositionMap}/>
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select name="uf" id="uf" onChange={(e) => setSelectedUf(e.currentTarget.value)} required>
                <option value="0">Selecione uma UF</option>
                {ufs[0] ? 
                  ufs.map(uf => (
                    // <option value="teste">Nome</option>
                    <option key={uf.id} value={uf.sigla}>{uf.nome}</option>
                  ))
                :null}
              </select>
            </div>
            <div className="field">
              <label htmlFor="cidade">Cidade</label>
              <select name="cidade" id="cidade" onChange={(e) => setSelectedCidade(e.currentTarget.value)} required>
                <option value="0">Selecione uma cidade</option>
                {cidades[0] ? 
                  cidades.map(cidade => (
                    // <option value="teste">Nome</option>
                    <option key={cidade.id} value={cidade.nome}>{cidade.nome}</option>
                  ))
                :null}
              </select>
            </div>
          </div>

        </fieldset>

        <fieldset>
          <legend>
            <h2>
              Ítens de Coleta
            </h2>
            <span>Seleciona um ou mais ítens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items[0] ? 
              items.map(item => (
                <li 
                  key={item.id} 
                  onClick={() => handleSelectItem(item.id)}
                  className={selectedItems.includes(item.id) ? 'selected' : ''}>

                    <img src={item.url} alt={item.title}/>
                    <span>{item.title}</span>
                </li>
              ))
            : null}
          </ul>

        </fieldset>

        <button type="submit">
          Cadastrar ponto de coleta
        </button>
      </form>
    </div>
  )
}

export default CreatPoint;