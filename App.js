import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Person from "./components/Person";
import DateTimePicker from "react-native-ui-datepicker";
import dayjs from "dayjs";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";

export default function App() {
  const [people, setPeople] = useState([]);
  const [isPersonModalVisible, setIsPersonModalVisible] = useState(false);
  const [isBillModalVisible, setIsBillModalVisible] = useState(false);
  const [isInstallmentModalVisible, setIsInstallmentModalVisible] =
    useState(false);
  const [newPersonName, setNewPersonName] = useState("");
  const [newBillDate, setNewBillDate] = useState(dayjs());
  const [newBillAmt, setNewBillAmt] = useState(0);
  const [newBillPaid, setNewBillPaid] = useState(0);
  const [installmentDate, setInstallmentDate] = useState(dayjs());
  const [installmentAmount, setInstallmentAmount] = useState(0);
  const [currentPersonIndex, setCurrentPersonIndex] = useState(null);
  const [currentBillIndex, setCurrentBillIndex] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [showNoMatch, setShowNoMatch] = useState(false);
  const [showDev, setShowDev] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    const loadPeopleData = async () => {
      try {
        const storedPeopleData = await AsyncStorage.getItem("peopleData");
        if (storedPeopleData) {
          setPeople(JSON.parse(storedPeopleData));
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadPeopleData();
  }, []);

  useEffect(() => {
    const savePeopleData = async () => {
      try {
        await AsyncStorage.setItem("peopleData", JSON.stringify(people));
      } catch (error) {
        console.error("Error saving data:", error);
      }
    };

    savePeopleData();
  }, [people]);

  const downloadPeopleData = async () => {
    try {
      const jsonContent = JSON.stringify(people, null, 2);
      const fileUri = `${FileSystem.documentDirectory}people_data.json`;

      await FileSystem.writeAsStringAsync(fileUri, jsonContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        alert("Sharing is not available on this device.");
      }
    } catch (error) {
      console.error("Error saving or sharing file:", error);
      alert("An error occurred while saving or sharing the file.");
    }
  };

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*", // Accept any file type
      });

      if (!result.canceled) {
        const fileUri = result.assets[0].uri;
        const fileContent = await FileSystem.readAsStringAsync(fileUri);

        try {
          const parsedData = JSON.parse(fileContent);
          if (Array.isArray(parsedData)) {
            setPeople(parsedData);
            alert("Data successfully uploaded!");
          } else {
            alert("Invalid file format. Please upload a valid JSON file.");
          }
        } catch (error) {
          alert("Error parsing JSON file. Please check the file format.");
        }
      } else {
        alert("File selection was canceled.");
      }
    } catch (error) {
      console.error("Error picking file:", error);
      alert("An error occurred while selecting the file.");
    }
  };

  const findClosestMatchIndex = (query) => {
    let low = 0;
    let high = people.length - 1;
    let closestMatchIndex = -1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const currentName = people[mid].name.toLowerCase();
      const lowerQuery = query.toLowerCase();

      if (currentName.startsWith(lowerQuery)) {
        closestMatchIndex = mid; // Update the closest match index
        high = mid - 1; // Keep searching for earlier matches
      } else if (currentName < lowerQuery) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return closestMatchIndex;
  };

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query.trim() === "") {
      setShowNoMatch(false); // Hide "No match found" when query is empty
      return;
    }

    const index = findClosestMatchIndex(query.trim());
    if (index !== -1 && flatListRef.current) {
      setShowNoMatch(false);
      flatListRef.current.scrollToIndex({ animated: true, index });
    } else {
      setShowNoMatch(true); // Show "No match found" if no match exists
    }
  };

  const compareDates = (a, b) => {
    // Parse the date strings "DD/MM/YYYY" to Date objects
    const [dayA, monthA, yearA] = a.split("/").map(Number);
    const [dayB, monthB, yearB] = b.split("/").map(Number);

    const dateA = new Date(yearA, monthA - 1, dayA); // month is 0-based in JavaScript Date
    const dateB = new Date(yearB, monthB - 1, dayB);

    // Compare the dates by their time (milliseconds)
    return dateB.getTime() - dateA.getTime();
  };

  // Function to delete a person
  const deletePerson = (index) => {
    const updatedPeople = people.filter((_, i) => i !== index);
    updatedPeople.sort((a, b) => a.name.localeCompare(b.name));
    setPeople(updatedPeople);
  };

  const deleteBill = (personIndex, billIndex) => {
    const updatedPeople = [...people];
    updatedPeople[personIndex].billDates.splice(billIndex, 1); // Remove bill from the person
    setPeople(updatedPeople);
  };

  const deleteBillImage = (personIndex, billIndex) => {
    const updatedPeople = [...people];
    updatedPeople[personIndex].billDates[billIndex].image = null;

    setPeople(updatedPeople);
  };

  const deleteInstallment = (personIndex, billIndex, installmentIndex) => {
    const updatedPeople = [...people];
    updatedPeople[personIndex].billDates[billIndex].paid -= parseFloat(
      updatedPeople[personIndex].billDates[billIndex].installments[
        installmentIndex
      ].amount
    );
    updatedPeople[personIndex].billDates[billIndex].installments.splice(
      installmentIndex,
      1
    );
    setPeople(updatedPeople);
  };

  const clearAsyncStorage = async () => {
    try {
      await AsyncStorage.clear();
      setPeople([]);
      console.log("AsyncStorage cleared!");
    } catch (error) {
      console.error("Error clearing AsyncStorage:", error);
    }
  };

  // Open modal to add a person
  const openAddPersonModal = () => {
    setNewPersonName("");
    setIsPersonModalVisible(true);
  };

  // Add a new person
  const addPerson = () => {
    if (newPersonName.trim() === "") {
      alert("Name cannot be empty.");
      return;
    }

    const newPerson = {
      name: newPersonName,
      billDates: [],
    };

    const updatedPeople = [...people, newPerson];
    updatedPeople.sort((a, b) => a.name.localeCompare(b.name));

    setPeople(updatedPeople);
    setIsPersonModalVisible(false);
  };

  // Open modal to add a bill
  const openAddBillModal = (index) => {
    setCurrentPersonIndex(index);
    setNewBillDate(dayjs());
    setNewBillAmt(0);
    setNewBillPaid(0);
    setIsBillModalVisible(true);
  };

  // Add a bill for a specific person
  const addBill = () => {
    const newBill = {
      date: newBillDate.format("DD/MM/YYYY"),
      amt: newBillAmt,
      paid: newBillPaid,
      installments: [],
      image: null,
    };

    const updatedPeople = [...people];
    updatedPeople[currentPersonIndex].billDates.push(newBill);
    updatedPeople[currentPersonIndex].billDates.sort((a, b) =>
      compareDates(a.date, b.date)
    );

    setPeople(updatedPeople);

    setIsBillModalVisible(false);
  };

  const addBillImage = (personIndex, billIndex, image) => {
    const updatedPeople = [...people];
    updatedPeople[personIndex].billDates[billIndex].image = image;

    setPeople(updatedPeople);
  };

  const openAddInstallmentModal = (personIndex, billIndex) => {
    setCurrentPersonIndex(personIndex);
    setCurrentBillIndex(billIndex);
    setInstallmentDate(dayjs());
    setInstallmentAmount(0);
    setIsInstallmentModalVisible(true);
  };

  const addInstallment = () => {
    const newInstallment = {
      date: installmentDate.format("DD/MM/YYYY"),
      amount: installmentAmount,
    };

    const updatedPeople = [...people];
    updatedPeople[currentPersonIndex].billDates[
      currentBillIndex
    ].installments.push(newInstallment);

    updatedPeople[currentPersonIndex].billDates[
      currentBillIndex
    ].installments.sort((a, b) => compareDates(a.date, b.date));

    updatedPeople[currentPersonIndex].billDates[currentBillIndex].paid +=
      parseFloat(newInstallment.amount);
    setPeople(updatedPeople);

    setIsInstallmentModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setShowDev(!showDev)}>
        <Text style={styles.title}>People and Bills:</Text>
      </TouchableOpacity>
      {showDev && (
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={styles.devButton}
            onPress={downloadPeopleData}
          >
            <Text style={styles.devButtonText}>Download</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.devButton} onPress={handleUpload}>
            <Text style={styles.devButtonText}>Upload</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.personHeader}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search person..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {showNoMatch && (
          <View style={styles.noMatchPopup}>
            <Text style={styles.noMatchText}>No match found</Text>
          </View>
        )}

        <TouchableOpacity style={styles.addButton} onPress={openAddPersonModal}>
          <FontAwesome name="user-plus" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <FlatList
        ref={flatListRef}
        data={people}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <Person
            person={item}
            personIndex={index}
            addBill={openAddBillModal}
            addBillImage={addBillImage}
            addInstallment={openAddInstallmentModal}
            deletePerson={deletePerson}
            deleteBill={deleteBill}
            deleteBillImage={deleteBillImage}
            deleteInstallment={deleteInstallment}
          />
        )}
      />

      {/* Modal for adding a person's name */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isPersonModalVisible}
        onRequestClose={() => setIsPersonModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add a New Person</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter name"
              value={newPersonName}
              onChangeText={setNewPersonName}
            />
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setIsPersonModalVisible(false)}
              />
              <Button title="Add" onPress={addPerson} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for adding a bill */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isBillModalVisible}
        onRequestClose={() => setIsBillModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add a New Bill</Text>
            <DateTimePicker
              mode="single"
              date={newBillDate}
              onChange={(params) => setNewBillDate(params.date)}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              value={newBillAmt}
              onChangeText={setNewBillAmt}
              keyboardType="number-pad"
            />
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setIsBillModalVisible(false)}
              />
              <Button title="Add" onPress={addBill} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for adding an installment */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isInstallmentModalVisible}
        onRequestClose={() => setIsInstallmentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Installment</Text>
            <DateTimePicker
              mode="single"
              date={installmentDate}
              onChange={(params) => setInstallmentDate(params.date)}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              value={installmentAmount}
              onChangeText={setInstallmentAmount}
              keyboardType="number-pad"
            />
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setIsInstallmentModalVisible(false)}
              />
              <Button title="Add" onPress={addInstallment} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    width: "75%",
    borderRadius: 5,
  },
  noMatchPopup: {
    backgroundColor: "#f8d7da",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    position: "absolute",
    zIndex: 1,
    top: 50,
  },
  noMatchText: {
    color: "#721c24",
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    paddingRight: 7,
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    width: "15%",
  },
  personHeader: {
    // flex:1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "90%",
  },
  clearButton: {
    backgroundColor: "#f44336",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  clearButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    width: "100%",
    marginBottom: 20,
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
  },
  devButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
  devButtonText: {
    color: "white",
  },
});
