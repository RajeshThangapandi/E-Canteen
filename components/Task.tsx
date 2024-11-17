import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TaskProps {
  name: string;
  description: string;
  price: string;
}

const Task: React.FC<TaskProps> = ({ name, description, price }) => {
  return (
    <View style={styles.item}>
      <View style={styles.itemLeft}>
        <Text style={styles.itemName}>{name}</Text>
        <Text style={styles.itemDescription}>{description}</Text>
      </View>
      <Text style={styles.itemPrice}>${price}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  itemLeft: {
    flexDirection: 'column',
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  itemDescription: {
    color: '#555',
  },
  itemPrice: {
    fontWeight: 'bold',
    color: '#55BCF6',
  },
});

export default Task;




