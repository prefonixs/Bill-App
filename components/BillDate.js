import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import Installment from "./Installment";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Entypo from "@expo/vector-icons/Entypo";
import Collapsible from "react-native-collapsible";
import * as ImagePicker from "expo-image-picker";
import ImageViewing from "react-native-image-viewing";

const BillDate = ({
  bill,
  personIndex,
  billIndex,
  addBillImage,
  addInstallment,
  deleteBill,
  deleteBillImage,
  deleteInstallment,
}) => {
  const [collapsed, setCollapsed] = useState(true);
  const [image, setImage] = useState(bill.image);
  const [isImageViewVisible, setIsImageViewVisible] = useState(false);

  const toggleCollapse = () => {
    setCollapsed(!collapsed); // Toggle the collapse state
  };

  const confirmDeleteBill = () => {
    Alert.alert(
      "Delete Bill",
      `Are you sure you want to delete this bill?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteBill(personIndex, billIndex),
        },
      ],
      { cancelable: true }
    );
  };

  const confirmDeleteBillImage = () => {
    Alert.alert(
      "Delete Bill",
      `Are you sure you want to delete this image?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteBillImage(personIndex, billIndex);
            setImage(bill.image);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const remaining = bill.amt - bill.paid;

  const backgroundColor = remaining > 0 ? "#f8d7da" : "#d4edda";

  const pickImage = async () => {
    // Request media library permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need access to your camera to take photos."
      );
      return;
    }

    // Launch the image library
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true, // Enable basic cropping
      quality: 1, // Highest quality
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      addBillImage(personIndex, billIndex, result.assets[0].uri);
    }
  };

  return (
    <View style={[styles.billContainer, { backgroundColor }]}>
      <View style={styles.billHead}>
        <Text style={styles.billDate}>Date: {bill.date}</Text>

        <View style={styles.billHeadBtn}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addInstallment(personIndex, billIndex)}
          >
            <Text style={styles.addButtonText}>
              <MaterialIcons name="notes" size={24} color="white" />+
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={confirmDeleteBill}
          >
            <MaterialIcons name="delete-outline" size={24} color="gray" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.billDateAmt}>
        <View>
          <Text style={styles.billDate}>Amount</Text>
          <Text style={styles.billDate}>₹{bill.amt}</Text>
          <Text style={styles.billAmt}>Remaining</Text>
          <Text style={styles.billAmt}>₹{remaining}</Text>
        </View>
        {image ? (
          <View>
            <View style={styles.imageContainer}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={confirmDeleteBillImage}
              >
                <Entypo name="circle-with-cross" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsImageViewVisible(true)}>
                <Image source={{ uri: image }} style={styles.imagePreview} />
              </TouchableOpacity>
            </View>
            <ImageViewing
              images={[{ uri: image }]}
              imageIndex={0}
              visible={isImageViewVisible}
              onRequestClose={() => setIsImageViewVisible(false)}
            />
          </View>
        ) : (
          <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
            <MaterialIcons name="camera-alt" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* Accordion Section for Installments */}
      {bill.installments.length > 0 && (
        <View>
          <TouchableOpacity
            onPress={toggleCollapse}
            style={styles.accordionHeader}
          >
            <Text style={styles.accordionHeaderText}>
              {collapsed ? "Show Installments" : "Hide Installments"}
            </Text>
            <MaterialIcons
              name={collapsed ? "expand-more" : "expand-less"}
              size={24}
              color="gray"
            />
          </TouchableOpacity>

          <Collapsible collapsed={collapsed}>
            {bill.installments.map((installment, installmentIndex) => (
              <Installment
                key={installmentIndex}
                installment={installment}
                personIndex={personIndex}
                billIndex={billIndex}
                installmentIndex={installmentIndex}
                deleteInstallment={deleteInstallment}
              />
            ))}
          </Collapsible>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    position: "absolute", // Allows positioning relative to the parent
    zIndex: 1,
    top: 5, // Adjust to position the icon
    right: 0, // Adjust to position the icon
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Optional: add a semi-transparent background
    borderRadius: 12, // Rounded edges for the button
    padding: 5, // Add padding for better touchability
  },
  billContainer: {
    backgroundColor: "#e0e0e0",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  billDateAmt: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "99%",
    alignItems: "center",
  },
  billDate: {
    fontSize: 18,
    fontWeight: "bold",
  },
  billAmt: {
    fontSize: 18,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 5,
    paddingTop: 9,
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
  photoButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
  imageContainer: {
    marginTop: 0,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginTop: 5,
    borderRadius: 10,
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    marginVertical: 5,
  },
  accordionHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  billHeadBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "99%",
  },

  billHead: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "99%",
  },
});

export default BillDate;
