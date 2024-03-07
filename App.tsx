import { xmlAnfrage, filterItdPointsFromXml } from './routenplaner_v2';
import React, { useState } from 'react';
import { TextInput, View, Text, Button, Alert, Modal, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const App = () => {
  const [originInput, setOriginInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dateText, setDateText] = useState('');
  const [timeText, setTimeText] = useState('');
  const [routenText, setRoutenText] = useState('');

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      // Format the date as DD:MM:YYYY
      setDateText(
        `${selectedDate.getDate().toString().padStart(2, '0')}.${(selectedDate.getMonth() + 1)
          .toString()
          .padStart(2, '0')}.${selectedDate.getFullYear()}`
      );
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
      // Format the time as HH:MM
      setTimeText(
        `${selectedTime.getHours().toString().padStart(2, '0')}:${selectedTime.getMinutes()
          .toString()
          .padStart(2, '0')}`
      );
    }
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
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 ,paddingTop:100}}>Routenplanner</Text>
      <Text>Startstation:</Text>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20 }}
        value={originInput}
        onChangeText={setOriginInput}
      />
      <Text>Zielstation:</Text>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20 }}
        value={destinationInput}
        onChangeText={setDestinationInput}
      />
       
       <View style={styles.dateTimeContainer}>
        <View style={styles.buttonContainer}>
          <Button title="Datum wählen" onPress={() => setShowDatePicker(true)} />
          {dateText ? <Text style={styles.dateText}>{dateText}</Text> : null}
        </View>
        
        <View style={styles.buttonContainer}>
          <Button title="Zeit wählen" onPress={() => setShowTimePicker(true)} />
          {timeText ? <Text style={styles.timeText}>{timeText}</Text> : null}
        </View>
      </View>
      
      {/* DateTimePicker for date */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* DateTimePicker for time */}
      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      <Button title="Anfrage senden" onPress={handleSubmit} />
      {routenText ? (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 16 }}>Antwort:</Text>
          <Text>{routenText}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    marginHorizontal: 10,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    marginTop: 10,
  },
  timeText: {
    fontSize: 16,
    marginTop: 10,
  }
});

export default App;