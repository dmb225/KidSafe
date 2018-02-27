import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import leaflet from 'leaflet';
import * as firebase from 'firebase';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
@ViewChild('map') mapContainer: ElementRef;
      map: any;
      constructor(public navCtrl: NavController,
                  public authProvider: AuthProvider
    ) {}

async logOut(): Promise<void> {
      await this.authProvider.logoutUser();
      this.navCtrl.setRoot('LoginPage');
      }

ionViewDidEnter() {
        this.loadmap(); // Main function
    }

loadmap() {
    var usersPos = {}

    var map = leaflet.map('map').fitWorld();
    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
      maxZoom: 19,
        id: 'mapbox.streets'
            }).addTo(map);
    
    var markers = leaflet.layerGroup();
    
    /****************************DB AUTHENTICATION****************************************
    var userID;
    var email = "admin@sensio.com"
    var password = "adminadmin"
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // ...
      console.log(errorCode);
      console.log(errorMessage);
    });
      
    firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      userID = user.uid; // User is signed in.
    } else {
      // No user is signed in.
      console.log('Failed to logg in');
    }});
    **/
    
    /******************************DB READ ONCE*****************************************/
    // Read locations of all users
    firebase.database().ref('/USERS').once('value').then(function(snapshot){
      snapshot.forEach(function(deltaSnapshot){
          var key = deltaSnapshot.key;
          var value = deltaSnapshot.val();
          var lastPos = [parseFloat(value['lastPosition']['lat']), parseFloat(value['lastPosition']['lng'])];

          if(lastPos.length == 2){
            usersPos[key] = lastPos;	
          }          
      });  
      //Add markers to map
    for(var user in usersPos){
        var marker = leaflet.marker(usersPos[user]);
            marker.bindPopup("Hey you !👀 🤖 ");
            marker.addTo(map);
        };
    });
    
    // Add map and its markers
    map.locate({setView: true, maxZoom: 19});
    map.addLayer(markers);
    
    var onSuccess = function(position) {
      alert('Latitude: '          + position.coords.latitude          + '\n' +
            'Longitude: '         + position.coords.longitude         + '\n' +
            'Altitude: '          + position.coords.altitude          + '\n' +
            'Accuracy: '          + position.coords.accuracy          + '\n' +
            'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
            'Heading: '           + position.coords.heading           + '\n' +
            'Speed: '             + position.coords.speed             + '\n' +
            'Timestamp: '         + position.timestamp                + '\n');
            
            // Jump to user's location
            map.setView(new leaflet.LatLng(position.coords.latitude, position.coords.longitude), 19);
    };

    // onError Callback receives a PositionError object
    function onError(error) {
          alert('code: '    + error.code    + '\n' +
                'message: ' + error.message + '\n');
    }

    // Get user pos
    navigator.geolocation.getCurrentPosition(onSuccess, onError);

 }

}
