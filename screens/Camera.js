
import React, { useRef, useState } from 'react';
import {StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import {Button} from "react-native-elements";
import Icon from 'react-native-vector-icons/FontAwesome';
import { RNCamera } from 'react-native-camera';
import { utils } from '@react-native-firebase/app';
import vision from '@react-native-firebase/ml-vision';
import { set } from 'react-native-reanimated';



const PendingView = () => (
    <ActivityIndicator size="large" />
  );

export default function Camera ({navigation}) {
  const [flash,setFlash]=useState(RNCamera.Constants.FlashMode.on);
  const [Cam,setCam]=useState(RNCamera.Constants.Type.back);
  const [loading,setloading]=useState(false);

  async function processDocument(localPath) {
    const processed = await vision().textRecognizerProcessImage(localPath);
    console.log('Found text in document: ', processed.text);
    processed.blocks.forEach(block => {
      console.log('Found block with text: ', block.text);
      console.log('Confidence in block: ', block.confidence);
      console.log('Languages found in block: ', block.recognizedLanguages);
    });
    return processed.text;
  }

// Local path to file on the device
  let CameraRef=useRef(null);
  const takePicture=async()=> {
    setloading(true);
    const options = { quality: 0.5, base64: true };
    const data = await CameraRef.current.takePictureAsync(options);
    processDocument(data.uri).then((text) =>{
      navigation.navigate('Image View', {
        uri: data.uri,
        imageText:text
      }),
      console.log('Finished processing file.');
      setloading(false);
    });
  };
  const toggleFlash=()=>{
    if(flash==RNCamera.Constants.FlashMode.on)
    {
      setFlash(RNCamera.Constants.FlashMode.off)
    }else{
      setFlash(RNCamera.Constants.FlashMode.on)
    }
  }
  const ToggleCam=()=>{
    if(Cam==RNCamera.Constants.Type.back)
    {
      setCam(RNCamera.Constants.Type.front)
    }else{
      setCam(RNCamera.Constants.Type.back)
    }
  }
      return (
        <View style={styles.container}>
          <RNCamera
          style={styles.preview}
          type={Cam}
          ref={CameraRef}
          flashMode={flash}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
          androidRecordAudioPermissionOptions={{
            title: 'Permission to use audio recording',
            message: 'We need your permission to use your audio',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
        >
          {({ camera, status, recordAudioPermissionStatus }) => {
            if (status !== 'READY') return <PendingView />;
            return (
              <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
                 <TouchableOpacity onPress={() => toggleFlash()} style={styles.capture}>
                  <Text style={{ fontSize: 14 }}> {flash==RNCamera.Constants.FlashMode.on? "Flash Off" : "Flash on" } </Text>
                </TouchableOpacity>
                <Button  icon={
                <Icon
                  name="camera"
                  size={15}
                  color="white"
                />
              }            
    title="Scan" onPress={()=>takePicture()} loading={loading} />
              
                <TouchableOpacity onPress={() => ToggleCam()} style={styles.capture}>
                  <Text style={{ fontSize: 14 }}> Toggle </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        </RNCamera>
        </View>
      );
  }


const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      backgroundColor: 'black',
    },
    preview: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    capture: {
      flex: 0,
      backgroundColor: '#fff',
      borderRadius: 5,
      padding: 15,
      paddingHorizontal: 20,
      alignSelf: 'center',
      margin: 20,
    },
  });