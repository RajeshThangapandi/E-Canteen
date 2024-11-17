import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types'; // Define your types here

interface MenuItem {
  id?: number;
  name: string;
  description: string;
  price: string;
}

export default function MenuScreen() {
  const [task, setTask] = useState<MenuItem>({ name: '', description: '', price: '' });
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    axios
      .get('http://localhost:7001/api/menuItems')
      .then((response) => setMenuItems(response.data))
      .catch((error) => console.error('Error fetching menu items:', error));
  }, []);

  const handleAddTask = () => {
    if (task.name && task.description && task.price) {
      if (isEditing && editId) {
        axios
          .put(`http://localhost:7001/api/menuItems/${editId}`, task)
          .then(() => {
            setMenuItems((prev) =>
              prev.map((item) => (item.id === editId ? { ...task, id: editId } : item))
            );
            resetInput();
          })
          .catch((error) => console.error('Error updating menu item:', error));
      } else {
        axios
          .post('http://localhost:7001/api/menuItems', task)
          .then((response) => {
            setMenuItems((prev) => [...prev, response.data]);
            resetInput();
          })
          .catch((error) => console.error('Error adding menu item:', error));
      }
    } else {
      Alert.alert('Validation Error', 'All fields are required!');
    }
  };

  const resetInput = () => {
    setTask({ name: '', description: '', price: '' });
    setIsEditing(false);
    setEditId(null);
  };

  const handleEdit = (id: number) => {
    const itemToEdit = menuItems.find((item) => item.id === id);
    if (itemToEdit) {
      setTask(itemToEdit);
      setIsEditing(true);
      setEditId(id);
    }
  };

  const handleDelete = (id: number) => {
    axios
      .delete(`http://localhost:7001/api/menuItems/${id}`)
      .then(() => setMenuItems((prev) => prev.filter((item) => item.id !== id)))
      .catch((error) => console.error('Error deleting menu item:', error));
  };

  const renderItem = ({ item }: { item: MenuItem }) => (
    <View style={styles.menuItem}>
      <View style={styles.menuDetails}>
        <Text style={styles.menuTitle}>{item.name}</Text>
        <Text style={styles.menuDescription}>{item.description}</Text>
        <Text style={styles.menuPrice}>₹{item.price}</Text>
      </View>
      <View style={styles.menuActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item.id!)}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id!)}>
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Canteen Menu</Text>
      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={renderItem}
        style={styles.menuList}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={task.name}
          onChangeText={(text) => setTask({ ...task, name: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={task.description}
          onChangeText={(text) => setTask({ ...task, description: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Price"
          keyboardType="numeric"
          value={task.price}
          onChangeText={(text) => setTask({ ...task, price: text })}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Text style={styles.addButtonText}>{isEditing ? 'Update' : 'Add'}</Text>
        </TouchableOpacity>
        {/* View Orders Button */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: '#FF5722' }]}
          onPress={() => navigation.navigate('OrdersScreen')}
        >
          <Text style={styles.addButtonText}>View Orders</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  menuList: {
    marginHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    elevation: 2,
  },
  menuDetails: {
    flex: 2,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  menuDescription: {
    fontSize: 14,
    color: '#555',
    marginVertical: 4,
  },
  menuPrice: {
    fontSize: 16,
    color: '#FF5722',
    fontWeight: 'bold',
  },
  menuActions: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#FFB02E',
    padding: 8,
    borderRadius: 5,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: '#FF5722',
    padding: 8,
    borderRadius: 5,
  },
  actionText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  inputContainer: {
    padding: 15,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    elevation: 10,
  },
  input: {
    backgroundColor: '#F0F0F0',
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#FFB02E',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
