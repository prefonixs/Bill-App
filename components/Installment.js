import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";

const Installment = ({
  installment,
  personIndex,
  billIndex,
  installmentIndex,
  deleteInstallment,
}) => {
  const confirmDeleteInstallment = () => {
    Alert.alert(
      "Delete Installment",
      `Are you sure you want to delete this installment?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // console.log("here")
            deleteInstallment(personIndex, billIndex, installmentIndex);
          },
        },
      ],
      { cancelable: true }
    );
  };
  return (
    <View style={styles.installment}>
      <View style={styles.installmentHead}>
        <View style={styles.installmentHeadIndex}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={confirmDeleteInstallment}
          >
            <Text style={styles.deleteButtonText}>X</Text>
          </TouchableOpacity>
          <Text style={styles.installmentText}>{installment.date}</Text>
        </View>
        <Text style={styles.installmentText}>₹{installment.amount}</Text>
      </View>
      <View
        style={{
          borderBottomColor: "gray",
          borderBottomWidth: StyleSheet.hairlineWidth,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  installment: {
    height: 40,
  },
  installmentText: {
    fontSize: 16,
    marginLeft: 5,
  },
  deleteButton: {
    backgroundColor: "lightgray",
    width: 25,
    height: 25,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "gray",
    fontWeight: "bold",
  },
  installmentHead: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "99%",
    marginVertical: 5,
  },
  installmentHeadIndex: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    width: "99%",
  },
});

export default Installment;
