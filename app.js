/* global window */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL, {HexagonLayer, HexagonCellLayer} from 'deck.gl';
import _ from 'lodash';

import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/lab/Slider';

import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import img from './assets/img2.jpg';
import data from './data.csv';

import classes from './styles.css';

const MAPBOX_TOKEN = "pk.eyJ1IjoibXAyODYiLCJhIjoiY2pvczE5NnlvMGkxZzNxbWo1YzEybDcyciJ9.q9535HEBBvgUO0qdjKhEhw";


export const INITIAL_VIEW_STATE = {
  longitude: -113.518204267055,
  latitude: 53.5135250352252,
  zoom: 11,
  minZoom: 5,
  maxZoom: 15,
  pitch: 40.5,
  bearing: -27.396674584323023
};

const LIGHT_SETTINGS = {
  lightsPosition: [-0.144528, 49.739968, 8000, -3.807751, 54.104682, 8000],
  ambientRatio: 0.4,
  diffuseRatio: 0.6,
  specularRatio: 0.2,
  lightsStrength: [0.8, 0.0, 0.8, 0.0],
  numberOfLights: 2
};

const colorRange = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78]
];

const elevationScale = {min: 1, max: 50};
const dataPointFraction = 1.0;

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// React component responsible for rendering UI
export class App extends Component {
  static get defaultColorRange() {
    return colorRange;
  }

  constructor(props) {
    super(props);
    this.state = {
      elevationScale: elevationScale.min,
      radius: 50,
      coverage: 1.0,
      upperPercentile: 100,
      hover: -1,
      datasetSize: 0,
      lowerPercentile: 0,
      data: null,
      scale: 0.0005,
      scalefn: 10,
      x: 0,
      y: 0,
      price: 0,
      location: [0, 0]
    };

    this.startAnimationTimer = null;
    this.intervalTimer = null;

    this._startAnimate = this._startAnimate.bind(this);
    this._animateHeight = this._animateHeight.bind(this);
    this._renderTooltip = this._renderTooltip.bind(this);
  }

  componentDidMount() {
    this._animate();
  }

  componentWillMount() {
    if (this.props.data) {
      this.setState({datasetSize: this.props.data.length});
    }
  }

  retrieveColor(percent) {
    const datapoints = [
      { r:   1, g: 152, b: 189 },
      { r:  73, g: 227, b: 206 },
      { r: 216, g: 254, b: 181 },
      { r: 254, g: 237, b: 117 },
      { r: 254, g: 173, b:  84 },
      { r: 209, g:  55, b:  78 }
    ];

    let p = 0;
    let i = 0;
    let pDiff = 1.0/(datapoints.length-1);
    while (p < 1.0) {
      let p1 = datapoints[i];
      let p2 = datapoints[i+1];
      if (p <= percent && (p+pDiff) >= percent) {
        let diff = (percent - p)/(pDiff);
        let diffColor = {
          r: p2.r - p1.r,
          g: p2.g - p1.g,
          b: p2.b - p1.b,
        }

        const c = [ p1.r + diffColor.r*diff, p1.g + diffColor.g*diff, p1.b + diffColor.b*diff ];
        return c;
      }
      i += 1;
      p += pDiff;
    }

  }

  componentWillUnmount() {
    this._stopAnimate();
  }

  _animate() {
    this._stopAnimate();

    // wait 1.5 secs to start animation so that all data are loaded
    this.startAnimationTimer = window.setTimeout(this._startAnimate, 1500);
  }

  _startAnimate() {
    this.intervalTimer = window.setInterval(this._animateHeight, 20);
  }

  _stopAnimate() {
    window.clearTimeout(this.startAnimationTimer);
    window.clearTimeout(this.intervalTimer);
  }

  _animateHeight() {
    if (this.state.elevationScale === elevationScale.max) {
      this._stopAnimate();
    } else {
      this.setState({elevationScale: this.state.elevationScale + 1});
    }
  }

  _renderLayers(data) {
    const {radius, upperPercentile, coverage, hover, scalefn} = this.state;

    return new HexagonCellLayer({
      id: 'hexagon-cell-layer',
      data,
      radius: radius,
      angle: 0,
      elevationScale: 1,
      extruded: true,
      lightSettings: LIGHT_SETTINGS,
      colorRange,
      getPosition: d => d,
      opacity: 1,
      getElevation: x => x.elevation,
      getCentroid: x => x.centroid,
      getColor: x => {
        if (x.index == hover) {
          return [255,0,0];
        } else {
          return x.color;
        }
      },
      pickable: true,
      onHover: ({ x, y, object }) => {
        this.setState({x, y});
        if (object && object.price)
          this.setState({
            price: object.price,
            location: object.centroid
          });
        else
          this.setState({price: null});

        if (object) {
          this.setState({
            hover:object.index
          });
        } else {
          this.setState({
            hover:-1
          });
        }
      },
      onClick: ({ object }) => object&&console.log(object),
      updateTriggers: {
        getColor: {
          hover: hover,
          scalefn: scalefn,
        },
        getPosition: {
          scalefn2: scalefn,
        }
      },
      coverage,
      upperPercentile,
    });
  }

  componentWillReceiveProps(nextProps, scalefn = null) {
    if (nextProps.data && this.props.data && nextProps.data.length !== this.props.data.length) {
      this._animate();
    }

    if (scalefn == null && this) {
      scalefn = this.state.scalefn;
    }

    if (nextProps.data && scalefn) {
      const l = Math.round(nextProps.data.length * dataPointFraction * (this.state.upperPercentile/100 - this.state.lowerPercentile/100));
      const state2 = this.state;
      let d3 = _.cloneDeep(nextProps.data);
      let d2 = _.orderBy(d3, 'elevation', 'desc').map(function(x) {
        x.price = x.elevation;
        if (scalefn == 20)
          x.elevation = 100000*Math.log(x.elevation)/Math.log(2);
        return x;
      });

      d3 = d3.map(function(x) {
        if (scalefn == 20)
          x.elevation = x.elevation - d2[0].elevation;
        return x;
      });

      this.setState({
        data: d2.slice(Math.round(this.state.lowerPercentile/100 * nextProps.data.length * dataPointFraction), l).map((d,i) => ({
          centroid: [Number(d.lng), 
          Number(d.lat)], 
          color: this.retrieveColor(i / l), 
          elevation: Number(d.elevation * this.state.scale),
          price: d.price,
          index: i
        })),
        datasetSize: nextProps.data.length
      });
    }
  }

  handleRadiusChange(event, radius) {
    this.setState({ radius });
  }

  handleCoverageChange(event, coverage) {
    this.setState({ coverage });
    this.componentWillReceiveProps(this.props)
  }

  handleUpperPercentileChange(event, upperPercentile) {
    this.setState({ upperPercentile });
    this.componentWillReceiveProps(this.props);
  }

  handleLowerPercentileChange(event, lowerPercentile) {
    this.setState({ lowerPercentile });
    this.componentWillReceiveProps(this.props);
  }

  handleScaleChange(event, scale) {
    this.setState({ scale });
    this.componentWillReceiveProps(this.props);
  }

  handleStateFnChange (event, scalefn) {
    this.setState({scalefn: scalefn.props.value});
    this.componentWillReceiveProps(this.props, scalefn.props.value);
  }

  _renderTooltip() {
    const {x, y, price, hover, location} = this.state;
    return (
      (hover >= 0 && price != null) && (
        <div className="tooltip" style={{left: x, top: y}}>
          <span className="tooltipLine"><span className="tooltipLabel">PRICE:</span>$ {numberWithCommas(price)}</span>
          <span className="tooltipLine"><span className="tooltipLabel">Latitude:</span>{ location[1] }</span>
          <span className="tooltipLine"><span className="tooltipLabel">Longitude:</span>{ location[0] }</span>
        </div>
      )
    );
  }

  render() {
    const { viewState, controller = true, baseMap = true } = this.props;
    const { radius, coverage, upperPercentile, lowerPercentile, data, scale, scalefn } = this.state;

    const renderLayers = this._renderLayers.bind(this);
    const layer = renderLayers(data);

    return (
      <div><DeckGL
        layers={[layer]}
        initialViewState={INITIAL_VIEW_STATE}
        viewState={viewState}
        controller={controller}
      >
        {baseMap && (
          <StaticMap
            reuseMaps
            mapStyle="mapbox://styles/mapbox/dark-v9"
            preventStyleDiffing={true}
            mapboxApiAccessToken={MAPBOX_TOKEN}
          />
        )}
        {this._renderTooltip}
      </DeckGL>
      <Card className={"card"}>
        <CardMedia
          className={"media"}
          image={img}
          title="Edmonton"
        />

        <CardContent>
          <Typography gutterBottom variant="h6" component="h3" className={"card-header"}>
            Radius <span className={"num"}>{Math.round(radius)}</span>
          </Typography>
          <Typography component="p">
            <Slider
              classes={"slider"}
              aria-labelledby="label"
              onChange={this.handleRadiusChange.bind(this)}
              max={50.0}
              min={5.0}
              step={1}
              value={radius}
            />
          </Typography>
          <Typography gutterBottom variant="h6" component="h3" className={"card-header"} style={{marginTop: 25}}>
            Upper Percentile <span className={"num"}>{Math.round(upperPercentile)}</span>
          </Typography>
          <Typography component="p">
            <Slider
              classes={"slider"}
              aria-labelledby="label"
              onChange={this.handleUpperPercentileChange.bind(this)}
              max={100.0}
              min={80.0}
              step={0.01}
              value={upperPercentile}
            />
          </Typography>
          <Typography gutterBottom variant="h6" component="h3" className={"card-header"} style={{marginTop: 25}}>
            Lower Percentile <span className={"num"}>{Math.round(lowerPercentile)}</span>
          </Typography>
          <Typography component="p">
            <Slider
              classes={"slider"}
              aria-labelledby="label"
              onChange={this.handleLowerPercentileChange.bind(this)}
              max={20.0}
              min={0.0}
              step={0.01}
              value={lowerPercentile}
            />
          </Typography>
          <Typography gutterBottom variant="h6" component="h3" className={"card-header"} style={{marginTop: 25}}>
            Scale <span className={"num"}>{Math.round(scale*10000)/10000}</span>
          </Typography>
          <Typography component="p">
            <Slider
              classes={"slider"}
              aria-labelledby="label"
              onChange={this.handleScaleChange.bind(this)}
              max={0.005}
              min={0.0001}
              step={0.0001}
              value={scale}
            />
          </Typography>

          <FormControl className={"form-control"}>
            <InputLabel htmlFor="age-simple">&nbsp;</InputLabel>
            <Select
              value={scalefn}
              onChange={this.handleStateFnChange.bind(this)}
              inputProps={{
                name: 'age',
                id: 'age-simple',
              }}>
              <MenuItem value={10}>Linear</MenuItem>
              <MenuItem value={20}>Ln</MenuItem>
            </Select>
          </FormControl>
        </CardContent>

      </Card>
      </div>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
  require('d3-request').csv(data, (error, response) => {
    if (!error) {
      const data = response;
      render(<App data={data} />, container);
    }
  });
}
