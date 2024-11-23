import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import BillDate from "./BillDate";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const Person = ({
  person,
  personIndex,
  addBill,
  addBillImage,
  addInstallment,
  deletePerson,
  deleteBill,
  deleteBillImage,
  deleteInstallment,
}) => {
  const confirmDeletePerson = () => {
    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to delete ${person.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deletePerson(personIndex),
        },
      ],
      { cancelable: true }
    );
  };
  return (
    <>
      <View style={styles.personContainer}>
        <View style={styles.personHead}>
          <Text style={styles.personName}>{person.name}</Text>
          <View style={styles.personHeadBtn}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addBill(personIndex)}
            >
              <Text style={styles.addButtonText}>
                +<MaterialIcons name="receipt-long" size={24} color="white" />
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              // onPress={() => deletePerson(personIndex)}
              onPress={confirmDeletePerson}
            >
              <MaterialIcons name="delete-outline" size={24} color="gray" />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={person.billDates}
          keyExtractor={(billItem, billIndex) => billIndex.toString()}
          renderItem={({ item, index: billIndex }) => (
            <BillDate
              bill={item}
              personIndex={personIndex}
              billIndex={billIndex}
              addBillImage={addBillImage}
              addInstallment={addInstallment}
              deleteBill={deleteBill}
              deleteBillImage={deleteBillImage}
              deleteInstallment={deleteInstallment}
            />
          )}
        />
      </View>
      <View
        style={{
          borderBottomColor: "black",
          borderBottomWidth: StyleSheet.hairlineWidth,
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  personContainer: {
    backgroundColor: "#f0f0f0",
    marginVertical: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    width: "100%",
  },
  personName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 7,
    paddingTop: 10,
    margin: 5,
    borderRadius: 5,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "lightgray",
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  personHead: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "99%",
    alignItems: "center",
  },
  personHeadBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "99%",
  },
});

export default Person;
