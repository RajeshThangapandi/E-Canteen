import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import axios from 'axios';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  quantity: any;
  price: string;
}

interface Order {
  id: number;
  status: string;
  quantity: number;
  createdAt: string;
  totalPrice: string;
  MenuItems: MenuItem[];
}

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Fetch orders from server
    axios
      .get('http://localhost:7001/api/orders')
      .then(response => {
        // Sort orders by createdAt in descending order (newest first)
        const sortedOrders = response.data.sort((a: Order, b: Order) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sortedOrders);
      })
      .catch(error => {
        console.error('Error fetching orders:', error);
      });
  }, []);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedOrder(null); // Reset selected order when closing
  };

  const handleDeleteOrder = (orderId: number) => {
    // Confirmation alert before deleting the order
    Alert.alert(
      'Delete Order',
      'Are you sure you want to delete this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => {
            axios
              .delete(`http://localhost:7001/api/orders/${orderId}`)
              .then(response => {
                // Remove the deleted order from the list
                setOrders(orders.filter(order => order.id !== orderId));
                closeModal(); // Close modal after deletion
                Alert.alert('Success', 'Order deleted successfully');
              })
              .catch(error => {
                console.error('Error deleting order:', error);
                Alert.alert('Error', 'Failed to delete the order');
              });
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Orders</Text>
      {orders.length === 0 ? (
        <Text style={styles.noOrdersText}>You have no orders yet.</Text>
      ) : (
        <FlatList
          data={orders}
          renderItem={({ item, index }) => {
            // Check if this is the first item (latest order)
            const isNewOrder = index === 0;

            return (
              <TouchableOpacity
                style={styles.orderContainer}
                onPress={() => handleViewOrder(item)} // Open modal on clicking the order card
              >
                <Text style={styles.orderId}>Order ID: {item.id}</Text>
                <Text style={styles.orderDate}>Date: {item.createdAt}</Text>
                <Text style={styles.orderStatus}>Status: {item.status}</Text>
                {item.MenuItems.map((menuItem, index) => (
                  <Text key={index} style={styles.orderItem}>
                    {menuItem.name} ({menuItem.OrderItem.quantity}) ${menuItem.price}
                  </Text>
                ))}
                <Text style={styles.orderTotal}>TOTAL: ${item.totalPrice}</Text>
                {/* Display label for new order */}
                {isNewOrder && <Text style={styles.newOrderLabel}>New Order</Text>}
              </TouchableOpacity>
            );
          }}
          keyExtractor={item => item.id.toString()}
        />
      )}

      {/* Modal to display full order details */}
      {selectedOrder && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <ScrollView>
                <Text style={styles.modalHeader}>Order Details</Text>
                <Text style={styles.modalText}>Order ID: {selectedOrder.id}</Text>
                <Text style={styles.modalText}>Date: {selectedOrder.createdAt}</Text>
                <Text style={styles.modalText}>Status: {selectedOrder.status}</Text>
                <Text style={styles.modalText}>Items:</Text>
                {selectedOrder.MenuItems.map((menuItem, index) => (
                  <Text key={index} style={styles.modalItemText}>
                    {menuItem.name} - ${menuItem.price} - {menuItem.description}
                  </Text>
                ))}
                <Text style={styles.modalText}>Total: ${selectedOrder.totalPrice}</Text>
              </ScrollView>
              <TouchableOpacity
                style={styles.deleteOrderButton}
                onPress={() => selectedOrder && handleDeleteOrder(selectedOrder.id)}
              >
                <Text style={styles.deleteOrderButtonText}>Delete Order</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeModalButton} onPress={closeModal}>
                <Text style={styles.closeModalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f0f2',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#3d405b',
  },
  orderContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2f3b52',
  },
  orderDate: {
    fontSize: 14,
    color: '#4a5d73',
    marginTop: 5,
  },
  orderStatus: {
    fontSize: 14,
    color: '#FFB02E',
    marginVertical: 5,
  },
  orderItem: {
    fontSize: 15,
    color: '#555',
    marginVertical: 4,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f26c4f',
    marginTop: 10,
  },
  newOrderLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00C853',
    textAlign: 'center',
    marginTop: 15,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  modalHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3d405b',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#3d405b',
    marginBottom: 10,
  },
  modalItemText: {
    fontSize: 15,
    color: '#555',
    marginBottom: 5,
  },
  closeModalButton: {
    backgroundColor: '#3d405b',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  closeModalButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  deleteOrderButton: {
    backgroundColor: '#f26c4f',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  deleteOrderButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  noOrdersText: {
    fontSize: 18,
    color: '#4a5d73',
    textAlign: 'center',
  },
});
