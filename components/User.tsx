import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal, TouchableWithoutFeedback } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
import { MaterialIcons } from '@expo/vector-icons';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
}

interface CartItem {
  item: MenuItem;
  quantity: number;
}

type UserScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export default function UserScreen() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [searchQuery, setSearchQuery] = useState('');

  const navigation = useNavigation<UserScreenNavigationProp>();

  useEffect(() => {
    axios
      .get('http://localhost:7001/api/menuItems')
      .then(response => {
        setMenuItems(response.data);
      })
      .catch(error => {
        console.error('Error fetching menu items:', error);
      });
  }, []);

  // Filter menu items based on the search query
  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (menuItem: MenuItem, quantity: number) => {
    const existingItemIndex = cart.findIndex(item => item.item.id === menuItem.id);
    if (existingItemIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity;
      setCart(updatedCart);
      Alert.alert('Updated Cart', `${menuItem.name} quantity increased by ${quantity}.`);
    } else {
      setCart([...cart, { item: menuItem, quantity }]);
      Alert.alert('Added to Cart', `${menuItem.name} has been added to your cart.`);
    }
  };

  const calculateTotalPrice = () => {
    return cart.reduce((total, cartItem) => total + (parseFloat(cartItem.item.price) * cartItem.quantity), 0);
  };

  const handleOrder = () => {
    if (cart.length === 0) {
      Alert.alert('Cart is Empty', 'Please add items to your cart before ordering.');
      return;
    }

    const totalPrice = calculateTotalPrice();

    axios
      .post('http://localhost:7001/api/orders', {
        items: cart.map(item => ({ itemId: item.item.id, quantity: item.quantity })),
        totalPrice: totalPrice,
      })
      .then(() => {
        Alert.alert('Order Placed', 'Your order has been placed successfully.');
        setCart([]);
        setIsCartVisible(false); // Close the cart modal after placing the order
      })
      .catch(error => {
        Alert.alert('Order Failed', 'There was an issue placing your order.');
        console.error(error);
      });
  };

  const handleQuantityChange = (itemId: number, quantity: number) => {
    setQuantities(prevQuantities => ({
      ...prevQuantities,
      [itemId]: Math.max(1, quantity),
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Menu</Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search for dishes..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <ScrollView contentContainerStyle={styles.menuList}>
        {filteredMenuItems.length === 0 ? (
          <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
        ) : (
          filteredMenuItems.map(item => (
            <View key={item.id} style={styles.menuItem}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
              <Text style={styles.itemPrice}>${item.price}</Text>

              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(item.id, (quantities[item.id] || 1) - 1)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.quantityInput}
                  value={(quantities[item.id] || 1).toString()}
                  onChangeText={(text) => handleQuantityChange(item.id, parseInt(text || '1', 10))}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(item.id, (quantities[item.id] || 1) + 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.addToCartButton}
                onPress={() => addToCart(item, quantities[item.id] || 1)}
              >
                <Text style={styles.addToCartButtonText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.cartIconContainer}
        onPress={() => setIsCartVisible(true)}
      >
        <MaterialIcons name="shopping-cart" size={30} color="#FFF" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.ordersButtonContainer}
        onPress={() => navigation.navigate('UserOrdersScreen')}
      >
        <Text style={styles.ordersButtonText}>Your Orders</Text>
      </TouchableOpacity>

      <Modal visible={isCartVisible} animationType="slide" transparent={true}>
        <TouchableWithoutFeedback onPress={() => setIsCartVisible(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.cartTitle}>Your Cart</Text>
                {cart.length === 0 ? (
                  <Text style={styles.emptyCartText}>Your cart is empty</Text>
                ) : (
                  cart.map((cartItem, index) => (
                    <View key={index} style={styles.cartItem}>
                      <Text style={styles.cartItemName}>{cartItem.item.name}</Text>
                      <Text style={styles.cartItemPrice}>
                        {cartItem.quantity} x ${cartItem.item.price}
                      </Text>
                    </View>
                  ))
                )}
                <Text style={styles.totalPrice}>Total: ${calculateTotalPrice().toFixed(2)}</Text>
                <TouchableOpacity style={styles.orderButton} onPress={handleOrder}>
                  <Text style={styles.orderButtonText}>Place Order</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  header: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    color: '#2D2D2D',
    marginBottom: 20,
  },
  searchInput: {
    height: 40,
    borderColor: '#DCDCDC',
    borderWidth: 1,
    borderRadius: 6,
    paddingLeft: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  menuList: {
    paddingBottom: 80, // space for cart icon at the bottom
  },
  menuItem: {
    backgroundColor: '#F9F9F9',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#B0B0B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  itemName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  itemDescription: {
    fontSize: 14,
    color: '#777',
    marginVertical: 8,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2DAB2E',
    marginBottom: 12,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  quantityButton: {
    backgroundColor: '#FFB02E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  quantityButtonText: {
    color: '#FFF',
    fontSize: 20,
  },
  quantityInput: {
    width: 50,
    height: 40,
    textAlign: 'center',
    borderColor: '#DCDCDC',
    borderWidth: 1,
    borderRadius: 6,
    marginHorizontal: 12,
    fontSize: 18,
  },
  addToCartButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 12,
  },
  addToCartButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  cartIconContainer: {
    position: 'absolute',
    bottom: 80,
    right: 15,
    backgroundColor: '#FF5722',
    padding: 10,
    borderRadius: 50,
  },
  ordersButtonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 15,
    backgroundColor: '#2DAB2E',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  ordersButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    maxHeight: '80%',
  },
  cartTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  cartItemName: {
    fontSize: 18,
    color: '#333',
  },
  cartItemPrice: {
    fontSize: 18,
    color: '#2DAB2E',
  },
  emptyCartText: {
    fontSize: 18,
    color: '#777',
    textAlign: 'center',
  },
  orderButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  orderButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2DAB2E',
    marginTop: 20,
  },
  noResultsText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
});
