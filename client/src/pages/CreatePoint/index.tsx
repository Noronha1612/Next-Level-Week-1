import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import axios from 'axios';

import Dropzone from '../../components/Dropzone';

import logo from '../../assets/logo.svg';

import api from '../../services/api';

import './styles.css'

interface ImageObject {
  id: number;
  title: string;
  image_url: string;
}

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECITYResponse {
  nome: string
}

interface FormData {
  name: string;
  email: string;
  whatsapp: string;
}

const CreatePoint: React.FC = () => {
  const history = useHistory();

  const [images, setImages] = useState<ImageObject[]>([]);
  const [ ufs, setUfs ] = useState<string[]>([]);
  const [ uf, setUf ] = useState('0');
  const [ cities, setCities ] = useState<string[]>([]);
  const [ city, setCity ] = useState('');

  const [ selectedFile, setSelectedFile ] = useState<File>();

  const [ initialPosition, setInitialPosition ] = useState<[number, number]>([0, 0]);
  const [ position, setPosition ] = useState<[number, number]>([0, 0]);

  const [ formData, setFormData ] = useState<FormData>({
    name: '',
    email: '',
    whatsapp: ''
  });

  const [ selectedItems, setSelectedItems ] = useState<number[]>([]);

  useEffect(() => {
    async function getImages() {
      const response = await api.get('/items');

      setImages(response.data);
    }

    getImages();
  }, []);

  useEffect(() => {
    async function getIBGEData() {
      const response = await axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados');

      const ufInitials = response.data.map( uf => uf.sigla)

      setUfs(ufInitials);
    }

    getIBGEData();
  }, []);

  useEffect(() => {
    async function getCities() {
      const response = await axios.get<IBGECITYResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);

      const cityNames = response.data.map(city => city.nome);

      setCities(cityNames);
    }

    getCities();
  }, [ uf ]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      setInitialPosition([
        position.coords.latitude,
        position.coords.longitude
      ])
    })
  }, []);

  function handleMapClick(event: LeafletMouseEvent) {
    const { lat, lng } = event.latlng;

    setPosition([lat, lng]);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setFormData({ ...formData, [name]: value })
  }

  function handleSelectItem(id: number) {
    const alreadySelected = selectedItems.findIndex(item => item === id);

    if ( alreadySelected >= 0 ) {
      
      const filteredItems = selectedItems.filter(item => item !== id);

      setSelectedItems(filteredItems);

      return;
    }

    setSelectedItems([...selectedItems, id])
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { name, email, whatsapp } = formData;
    const [ latitude, longitude ] = position;
    const userCity = city;
    const userUf = uf;
    const items = selectedItems;

    const data = new FormData();

    data.append('name', name);
    data.append('city', userCity);
    data.append('uf', userUf);
    data.append('email', email);
    data.append('whatsapp', whatsapp);
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('items', items.join(','));

    if ( selectedFile ) {
      data.append('image', selectedFile);
    }

    await api.post("/points", data);

    history.push('/')
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta"/>

        <Link to="/" >
          <FiArrowLeft />

          Voltar para Home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br/> ponto de coleta</h1>

        <Dropzone onFileUploaded={ setSelectedFile } />

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
              onChange={handleInputChange}
            />
          </div>

          <div className="field-group">
            
            <div className="field">
              <label htmlFor="email">Email</label>
              <input 
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>

            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input 
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
              />
            </div>

          </div>
        </fieldset>
        
        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={ initialPosition } zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={ position } />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select onChange={ e => setUf(e.target.value) } value={uf} name="uf" id="uf">
                <option value="0">Selecione uma UF</option>
                {ufs.map(uf => (
                  <option value={uf} key={uf}>{uf}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select onChange={ e => setCity(e.target.value) } name="city" id="city">
                <option value="0">Selecione uma cidade</option>
                {cities.map( city => (
                  <option key={city} value={city}> {city} </option>
                ) )}
              </select>
            </div>

          </div>
        </fieldset>
        
        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
          </legend>

          <ul className="items-grid">
            
            {images.map( image => (
              <li 
                key={image.id} 
                className={ selectedItems.includes(image.id) ? "selected" : ""}
                onClick={() => handleSelectItem(image.id)}
              >
                <img src={image.image_url} alt={image.title}/>
                <span>{image.title}</span>
              </li>
            ))}

          </ul>
        </fieldset>

        <button type="submit">
          Cadastrar ponto de coleta
        </button>
      </form>
    </div>
  )
}

export default CreatePoint;
