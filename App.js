import { Component } from "react";
import {Map, GoogleApiWrapper, Marker} from 'google-maps-react'
import "../src/index.css";


class MapContainer extends Component { // MapContainer inherits everything from component 
  // controlling and updating data in this component 
  // below initalizes the state 
      constructor(props) {
        super(props) // need to call this because component has a constructor itself
        this.state = {
          map: null, 
          cityName: "",
          places: [],
          userLocation: null,
        }; 

        // Access the API key from the environment variable and store it as a class variable
        this.apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        }
    
      mapReady = (mapProps, map) => {
        this.setState({ map });
      
        const { google } = this.props;
        const { places } = this.state;
      
        // Create an empty InfoWindow instance
        const infowindow = new google.maps.InfoWindow();
      
        // Add click event listener to each marker
        places.forEach((place) => {
          const marker = new google.maps.Marker({
            map: this.state.map,
            position: place.geometry.location,
          });
      
          // Add click event listener to open the info window when marker is clicked
          marker.addListener("click", () => {
            // Set the content of the InfoWindow to the name of the bubble tea place
            infowindow.setContent(place.name);
            // Open the InfoWindow on the clicked marker
            infowindow.open(map, marker);
          });
        });
      };
    
      // Updates the cityName component whenever the user types a city name
      latestCityName = (event) => { // Rename latestZipCode to latestCityName
        this.setState({ cityName: event.target.value });
      };

      // Function to get the user's current location
      getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            this.setState({ userLocation });
          },
          (error) => {
            console.log("Error getting user location:", error);
          }
        );
      } else {
        console.log("Geolocation is not supported by this browser.");
      }
    };
    
      // Handles the search submit button click
      handleSearchSubmit = () => {
        const { google } = this.props;
        const { cityName } = this.state; // Rename zipCode to cityName
    
        const geoCoder = new google.maps.Geocoder();
    
        try {
          // Using the geocoding API to get the latitude and longitude from the given city name
          geoCoder.geocode({ address: cityName }, (results, status) => { // Rename zipCode to cityName
            if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
              // Accesses the lat and lng from the location of the first result to obtain geographical coordinates
              const lat = +results[0].geometry.location.lat();
              const lng = +results[0].geometry.location.lng();
    
              // Use Places API text search with the latitude and longitude coordinates
              const service = new google.maps.places.PlacesService(this.state.map);
              const request = {
                location: { lat, lng },
                radius: 5000, // Search within 5km
                query: "bubble-tea | boba | gong-cha " // Bubble tea places
              };
              service.textSearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                  // Update component's state places with bubble tea places found
                  this.setState({ places: results });
                } else {
                  console.log("Error in Places API text search:", status);
                }
              });
            } else {
              console.log("Error in geocoding:", status);
            }
          });
        } catch (error) {
          console.log("Error occurred:", error);
        }
      };
    
      render() {

        const { places } = this.state;
    
        return (
          <div className="flex-box">
            <div className="sidebar">
              <h1> Bubble Tea Finder </h1>
              <input
                type="text"
                placeholder="Enter your city name" 
                value={this.state.cityName} 
                onChange={this.latestCityName} 
                className="input-box"
              />
              <button onClick={this.handleSearchSubmit}>Search</button>
              <button onClick={this.getUserLocation}>Use My Location</button>
            </div>
            <div className="map-container">
              <Map
                google={this.props.google}
                containerElement={<div style={{ height: "100%" }} />}
                style={{ height: "100%", width: "100%" }}
                initialCenter={{
                  lat: 40.7128,
                  lng: 74.0060,
                }}
                zoom={10}
                onReady={this.mapReady}
              >
                {places.map(place => (
                  <Marker
                    key={place.place_id}
                    name={place.name}
                    position={place.geometry.location}
                  />
                ))}
              </Map>
            </div>
          </div>
        );
      };
    };
    
    export default GoogleApiWrapper({
      apiKey: MapContainer.apiKey, // Use the apiKey variable from the component's class
    })(MapContainer);
    
