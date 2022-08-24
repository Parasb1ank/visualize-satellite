// Shane Carty - 12713771
// Orbital Prediction for Earth Observation

// this module contains functions for drawing the satellites instrument footprint to the globe

function drawFootPrintInterval(czmlSatId, numberOfFootPrintsAtAtime, intervalBetweenFootPrints, instrumentFOV){
	var footPrintCollectionArray = [];	

	var ec = viewer.dataSources._dataSources[0]._entityCollection;
	var sat = ec.getById(czmlSatId);	

   	var cartesian = sat.position.getValue(clock.currentTime);
    var cartographic = Cesium.Cartographic.fromCartesian(cartesian);

 
    var longitude = Cesium.Math.toDegrees(cartographic.longitude);
    var latitude = Cesium.Math.toDegrees(cartographic.latitude);
    var height = cartographic.height;

    var footPrintCollection = drawFootPrintMain(longitude, latitude, height, instrumentFOV);
    footPrintCollectionArray.push(footPrintCollection);	

	setInterval(function() {
		if(footPrintCollectionArray.length == numberOfFootPrintsAtAtime){
        	

			var entities = footPrintCollectionArray[0].values;
        	footPrintCollectionArray.splice(0,1);		        	

        	for(var i = 0; i < entities.length; i++){
        	
        		viewer.entities.remove(entities[i]);	
        	}						
		}
	
       	var cartesian = sat.position.getValue(clock.currentTime);
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian);

		
        var longitude = Cesium.Math.toDegrees(cartographic.longitude);
        var latitude = Cesium.Math.toDegrees(cartographic.latitude);
        var height = cartographic.height;

        footPrintCollection = drawFootPrintMain(longitude, latitude, height, instrumentFOV);
        footPrintCollectionArray.push(footPrintCollection);

	}, intervalBetweenFootPrints);	
}



function drawFootPrintMain(longitude, latitude, height, instrumentFOV){

	var footPrintCollection = new Cesium.EntityCollection();		

	drawLineGroundToSatellite(longitude, latitude, height);	

	var color = Cesium.Color.RED.withAlpha(0.8);
	drawVisibleFootPrint(longitude, latitude, height, color);
	
	color = Cesium.Color.GREEN.withAlpha(0.3);
	drawInstrumentFootPrintSwathWidth(instrumentFOV, longitude, latitude, height, color);	


	// Draws ellipse over satellites visible footprint
	function drawVisibleFootPrint(longitude, latitude, height, color){

		var satLocation = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);		
		var groundPoint = new Cesium.Cartesian3.fromDegrees(longitude, latitude, 0.0);

		var radiusOfEarth = Cesium.Cartesian3.distance(new Cesium.Cartesian3(0,0,0), groundPoint);

		var satToOrignEarth = radiusOfEarth + height;  // point to origin of earth
		var PT = Math.sqrt(Math.pow(satToOrignEarth,2) - Math.pow(radiusOfEarth, 2) );  // point to tangent 

		var groundPointToSatPointToTangentAngle = Cesium.Math.toDegrees(Math.asin(radiusOfEarth/satToOrignEarth));
		var groundPointToOriginToTangentAngle  = 90.0 - groundPointToSatPointToTangentAngle;
		
		var distanceAlongGround = Cesium.Math.TWO_PI * radiusOfEarth *(groundPointToOriginToTangentAngle/360.0);

		var directionInDegrees = 0.0;
		var coords = getLatLongAtBearingAndDistance(directionInDegrees, distanceAlongGround, latitude, longitude); 
		
		var intersectionWithGroundPoint = new Cesium.Cartesian3.fromDegrees(coords[0], coords[1], 0);

		var angle = "Max";
		

		var entity = viewer.entities.add({
			name : '45 degrees Vview point',				
			position: groundPoint,
			ellipse : {
				semiMinorAxis : distanceAlongGround,
				semiMajorAxis : distanceAlongGround,
				height: 0.0,
				outlineColor : color,
				outline: true,
				fill: false
			}
		});	
		
		footPrintCollection.add(entity);
	
	}

	// draws footprint of satellite based on its angle looking down towards the earth
	function drawInstrumentFootPrintAngle(instrumentFOVAngle, longitude, latitude, height, color){
		instrumentFOV = instrumentFOV/2;
		var satLocation = new Cesium.Cartesian3.fromDegrees(longitude, latitude, height);		
		var groundPoint = new Cesium.Cartesian3.fromDegrees(longitude, latitude, 0.0);
		var distanceAlongGround = getDistanceOfIntersectionWithGlobeAtAngleFromHeight(instrumentFOV, height);  // gets the length of the opposite side of a right angle triangle, which runs along the earth, from the pov of the satellite

		drawPointAndLineInFourDirections(distanceAlongGround, longitude, latitude, satLocation);	

		var entity = viewer.entities.add({
			position: groundPoint,
			name : instrumentFOV * 2 + ' degrees View point',
			ellipse : {
				semiMinorAxis : distanceAlongGround,
				semiMajorAxis : distanceAlongGround,
				height: 0.0,
				material : color
			}
		});	
		footPrintCollection.add(entity);	
	}


	// draws footprint of satellite based on its swath width of its instrument along the ground
	function drawInstrumentFootPrintSwathWidth(instrumentFOV, longitude, latitude, height, color){
		var satLocation = new Cesium.Cartesian3.fromDegrees(longitude, latitude, height);		
		var groundPoint = new Cesium.Cartesian3.fromDegrees(longitude, latitude, 0.0);
	
		var distanceAlongGround = instrumentFOV;

		var redCone = viewer.entities.add({
		    name : 'Red cone',
		    position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height/2),
		    cylinder : {
		        length : height,
		        topRadius : 0.0,
		        bottomRadius : instrumentFOV,
		        material : color,
		        outline: true,
		        outlineColor: Cesium.Color.RED.withAlpha(0.5)
		    }
		});
		footPrintCollection.add(redCone);	
	}

	function drawPointAndLineInTwoDirections(distanceAlongGround, longitude, latitude, satLocation){
		var directions = [90, 180];

		for(var i = 0; i < directions.length; i++){
			var coords = getLatLongAtBearingAndDistance(directions[i], distanceAlongGround, latitude, longitude); // gets the coords for a point at a distance in a particular direction, which is the limit to where the satellites view intersects with the earth
			var intersectionWithGroundPoint = new Cesium.Cartesian3.fromDegrees(coords[0], coords[1], 0);	

			var entity = viewer.entities.add({
				position: intersectionWithGroundPoint,
				point: {
					pixelSize: 4,
					color : Cesium.Color.RED
				}
			});

			footPrintCollection.add(entity);

			var entity = viewer.entities.add({		
				polyline: {
					positions: [
						satLocation,
						intersectionWithGroundPoint
					],
					width: 1,
					material : Cesium.Color.YELLOW,
					followSurface: false
				}
			});
			footPrintCollection.add(entity);
		}
	}		


	function drawPointAndLineInFourDirections(distanceAlongGround, longitude, latitude, satLocation){
		var directions = [0.0, 90, 180, 270];

		for(var i = 0; i < directions.length; i++){
			var coords = getLatLongAtBearingAndDistance(directions[i], distanceAlongGround, latitude, longitude); // gets the coords for a point at a distance in a particular direction, which is the limit to where the satellites view intersects with the earth
			var intersectionWithGroundPoint = new Cesium.Cartesian3.fromDegrees(coords[0], coords[1], 0);	

			var entity = viewer.entities.add({
				position: intersectionWithGroundPoint,
				point: {
					pixelSize: 4,
					color : Cesium.Color.RED
				}
			});

			footPrintCollection.add(entity);

			var entity = viewer.entities.add({		
				polyline: {
					positions: [
						satLocation,
						intersectionWithGroundPoint
					],
					width: 1,
					material : Cesium.Color.YELLOW,
					followSurface: false
				}
			});
			footPrintCollection.add(entity);
		}
	}	

			
	
	function drawLineGroundToSatellite(longitude, latitude, height){
		var satLocation = new Cesium.Cartesian3.fromDegrees(longitude, latitude, height);  // position of satellite in sky
		var groundPoint = new Cesium.Cartesian3.fromDegrees(longitude, latitude, 0.0);
		
		var entity = viewer.entities.add({
			position: satLocation,
			point: {
				pixelSize : 2,
				color : Cesium.Color.RED
			}
		});	

		footPrintCollection.add(entity);

		var entity = viewer.entities.add({
			position: groundPoint,
			point: {
				pixelSize : 2,
				color : Cesium.Color.RED
			}
		});	

		footPrintCollection.add(entity);	

		var entity = viewer.entities.add({
			polyline : {
				positions : [
					satLocation,
					groundPoint
				],
				width : 1,
				material : Cesium.Color.YELLOW
			}
		});	

		footPrintCollection.add(entity);
	}

	function getDistanceOfIntersectionWithGlobeAtAngleFromHeight(theta, height){
		return Math.tan(Cesium.Math.toRadians(theta)) * height;
	}	


	function getLatLongAtBearingAndDistance(bearing, distance, latitude, longitude){
		distance = distance/1000;
		var R = 6378.1; //Radius of the Earth

		var bearingRadians = Cesium.Math.toRadians(bearing); //Bearing is 90 degrees converted to radians.

		var lat1 = Cesium.Math.toRadians(latitude);
		var lon1 = Cesium.Math.toRadians(longitude);
		
		var lat2 = Math.asin(Math.sin(lat1) * Math.cos(distance/R) + Math.cos(lat1) * Math.sin(distance/R) * Math.cos(bearingRadians));
		var lon2 = lon1 + Math.atan2(Math.sin(bearingRadians) * Math.sin(distance/R) * Math.cos(lat1), Math.cos(distance/R)-Math.sin(lat1) * Math.sin(lat2));

		lat2 = Cesium.Math.toDegrees(lat2)
		lon2 = Cesium.Math.toDegrees(lon2)
		return [lon2, lat2];
	}

return footPrintCollection;
}

