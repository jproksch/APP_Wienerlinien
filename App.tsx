import React, { useState,useEffect  } from 'react';
import { Alert, TextInput, View, Text, Button, StyleSheet, Modal, TouchableOpacity, SafeAreaView ,ScrollView} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { xmlAnfrage, filterItdPointsFromXml } from './routenplaner_v2';

type PickerMode = 'date' | 'time';

const App = () => {
  const [originInput, setOriginInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [isPickerModalVisible, setPickerModalVisibility] = useState(false);
  const [pickerMode, setPickerMode] = useState<PickerMode>('date');
  const [dateText, setDateText] = useState('');
  const [timeText, setTimeText] = useState('');
  const [routenText, setRoutenText] = useState('');

  useEffect(() => {
    // Formatierung für das Anzeigedatum
    const newDateText = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}.${date.getFullYear()}`;
    setDateText(newDateText);
  
    // Formatierung für die Anzeigezeit
    const newTimeText = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes()
      .toString()
      .padStart(2, '0')}`;
    setTimeText(newTimeText);
  }, [date, time]);


  const handlePickerConfirm = (event, selectedValue) => {
    if (pickerMode === 'date') {
      const selectedDate = selectedValue || date;
      setDate(selectedDate);
      setDateText(
        `${selectedDate.getDate().toString().padStart(2, '0')}.${(selectedDate.getMonth() + 1)
          .toString()
          .padStart(2, '0')}.${selectedDate.getFullYear()}`
      );
    } else {
      const selectedTime = selectedValue || time;
      setTime(selectedTime);
      setTimeText(
        `${selectedTime.getHours().toString().padStart(2, '0')}:${selectedTime.getMinutes()
          .toString()
          .padStart(2, '0')}`
      );
    }
    setPickerModalVisibility(false);
  };

  const openPickerModal = (mode: PickerMode) => {
    setPickerMode(mode);
    setPickerModalVisibility(true);
  };

  const handleSubmit = async () => {
    const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    const formattedTime = `${time.getHours().toString().padStart(2, '0')}${time.getMinutes().toString().padStart(2, '0')}`;

    if (originInput && destinationInput && formattedDate && formattedTime) {
      try {
        const itdPoints = await filterItdPointsFromXml(originInput, destinationInput, formattedDate, formattedTime);
        setRoutenText(itdPoints);
        console.log(itdPoints);
        Alert.alert("Erfolg", "Anfrage erfolgreich. Details siehe Konsole.");
      } catch (error) {
        console.error('Anfrage fehlgeschlagen:', error);
        Alert.alert("Fehler", "Anfrage fehlgeschlagen. Details siehe Konsole.");
      }
    } else {
      Alert.alert("Fehler", "Bitte stellen Sie sicher, dass alle Felder korrekt ausgefüllt sind.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Routenplanner</Text>

      <TextInput
        style={styles.input}
        placeholder="Startstation"
        value={originInput}
        onChangeText={setOriginInput}
      />

      <TextInput
        style={styles.input}
        placeholder="Zielstation"
        value={destinationInput}
        onChangeText={setDestinationInput}
      />

      <View style={styles.dateTimeContainer}>
        <View style={styles.inputWrapper}>
          <Button title="Datum wählen" onPress={() => openPickerModal('date')} />
          <Text style={styles.dateText}>{dateText || 'TT.MM.JJJJ'}</Text>
        </View>

        <View style={styles.inputWrapper}>
          <Button title="Zeit wählen" onPress={() => openPickerModal('time')} />
          <Text style={styles.timeText}>{timeText || 'HH:MM'}</Text>
        </View>
      </View>

      <Button title="Anfrage senden" onPress={handleSubmit} />

      <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.text}>
          '{routenText}'
        </Text>
      </ScrollView>
    </SafeAreaView>

      <Modal
        visible={isPickerModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPickerModalVisibility(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setPickerModalVisibility(false)}
        >
          <View style={styles.modalContent}>
            <DateTimePicker
              value={pickerMode === 'date' ? date : time}
              mode={pickerMode}
              display="default"
              onChange={handlePickerConfirm}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    paddingTop: 100,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  dateText: {
    textAlign: 'center',
    marginTop: 10,
  },
  timeText: {
    textAlign: 'center',
    marginTop: 10,
  },
  scrollView: {
    backgroundColor: 'lightblue',
    marginHorizontal: 20,
  },
  text: {
    fontSize: 12
  }
});

export default App;