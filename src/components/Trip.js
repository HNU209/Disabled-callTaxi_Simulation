import React, { useState, useEffect } from 'react';
import { Map } from 'react-map-gl';
import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import { TripsLayer } from '@deck.gl/geo-layers';
import { ScatterplotLayer, IconLayer } from '@deck.gl/layers';
import ICON_PNG from '../image/icon-atlas.png';
import DeckGL from '@deck.gl/react';
import '../css/trip.css';

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});
  
const pointLight = new PointLight({
  color: [255, 255, 255],
  intensity: 2.0,
  position: [-74.05, 40.7, 8000]
});

const lightingEffect = new LightingEffect({ambientLight, pointLight});

const material = {
  ambient: 0.1,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [60, 64, 70]
};

const DEFAULT_THEME = {
  trailColor0: [253, 128, 93],
  trailColor1: [23, 184, 190],
  material,
  effects: [lightingEffect]
};

const INITIAL_VIEW_STATE = {
  longitude: 126.994335,
  latitude: 37.558058,
  zoom: 11,
  minZoom: 2,
  maxZoom: 20,
  pitch: 0,
  bearing: 0
};

const mapStyle = 'mapbox://styles/spear5306/ckzcz5m8w002814o2coz02sjc';
const MAPBOX_TOKEN = `pk.eyJ1Ijoic3BlYXI1MzA2IiwiYSI6ImNremN5Z2FrOTI0ZGgycm45Mzh3dDV6OWQifQ.kXGWHPRjnVAEHgVgLzXn2g`; 

const currData = (data, time) => {
  const arr = [];
  data.forEach(v => {
    const [start, end] = v.timestamp;
    if ((start <= time) & (time <= end)) {
      arr.push(v.location);
    };
  });
  return arr;
}

const ICON_MAPPING = {
  marker: {x: 0, y: 0, width: 128, height: 128, mask: true}
};

const Trip = (props) => {
  const animationSpeed = 1;
  const time = props.time;
  const minTime = props.minTime;
  const maxTime = props.maxTime;

  const DRIVER = props.data.DRIVER_TRIP;
  const D_MARKER = currData(props.data.DRIVER_MARKER, time);
  const P_MARKER = currData(props.data.PASSENGER_MARKER, time);

  const [animationFrame, setAnimationFrame] = useState('');

  const animate = () => {
    props.setTime(time => {
      if (time > maxTime) {
        return minTime;
      } else {
        return time + (0.01) * animationSpeed;
      };
    });
    const af = window.requestAnimationFrame(animate);
    setAnimationFrame(af);
  };

  useEffect(() => {
    animate();
    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  const layers = [
    new TripsLayer({
      id: 'DRIVER',
      data: DRIVER,
      getPath: d => d.trip,
      getTimestamps: d => d.timestamp,
      getColor: d => d.board === 1 ? [255, 153, 51] : [23, 184, 190],
      opacity: 0.7,
      widthMinPixels: 5,
      trailLength: 1,
      currentTime: time,
      shadowEnabled: false,
    }),
    new ScatterplotLayer({
      id: 'driver-marker',
      data: D_MARKER,
      getPosition: d => d,
      getFillColor: d => [255, 255, 255],
      getRadius: d => 3,
      opacity: 0.1,
      pickable: false,
      radiusScale: 6,
      radiusMinPixels: 1,
      radiusMaxPixels: 10,
    }),
    new IconLayer({
      id: 'passenger-marker',
      data: P_MARKER,
      pickable: false,
      iconAtlas: ICON_PNG,
      iconMapping: ICON_MAPPING,
      sizeMinPixels: 20,
      sizeMaxPixels: 20,
      sizeScale: 5,
      getIcon: d => 'marker',
      getPosition: d => [d[0], d[1]],
      getSize: d => 10,
      getColor: d => [0, 255, 255]
    }),
  ];

  return (
    <div className='trip-container' style={{position: 'relative'}}>
      <DeckGL
        effects={DEFAULT_THEME.effects}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
      >
        <Map
          mapStyle={mapStyle}
          mapboxAccessToken={MAPBOX_TOKEN}
        />
      </DeckGL>
      <h1 className='time'>
        TIME : {(String(parseInt(Math.round(time) / 60) % 24).length === 2) ? parseInt(Math.round(time) / 60) % 24 : '0'+String(parseInt(Math.round(time) / 60) % 24)} : {(String(Math.round(time) % 60).length === 2) ? Math.round(time) % 60 : '0'+String(Math.round(time) % 60)}
      </h1>
    </div>
  );
}

export default Trip;