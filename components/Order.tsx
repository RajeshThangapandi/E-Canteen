import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from 'axios';

interface MenuItem {
  name: string;
  quantity: number;
  price: string;
}

interface Order {
  id: number;
  createdAt: string;
  MenuItems: MenuItem[];
  status: string;
  totalPrice: number;
}

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [itemQuantities, setItemQuantities] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:7001/api/orders")
      .then((response) => {
        const fetchedOrders = response.data;
  
        // Calculate total quantities for each menu item
        const quantities: { [key: string]: number } = {};
  
        fetchedOrders.forEach((order: Order) => {
          order.MenuItems.forEach((menuItem) => {
            // Safely access quantity
            const quantity = menuItem.quantity || 0;
            if (menuItem.name) {
              quantities[menuItem.name] = (quantities[menuItem.name] || 0) + quantity;
            }
          });
        });
  
        setOrders(fetchedOrders);
        setItemQuantities(quantities); // Update total quantities
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        setError("Error fetching orders. Please try again later.");
        setLoading(false);
      });
  }, []);
  
  const updateOrderStatus = (orderId: number, newStatus: string) => {
    setLoading(true);
    axios.put(`http://localhost:7001/api/orders/${orderId}/status`, { status: newStatus })
      .then(() => {
        const updatedOrders = orders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        );
        setOrders(updatedOrders);
        setLoading(false);
        alert('Order status updated successfully');
      })
      .catch(() => {
        setLoading(false);
        alert('Failed to update order status');
      });
  };

  const deleteOrder = (orderId: number) => {
    setLoading(true);
    axios.delete(`http://localhost:7001/api/orders/${orderId}`)
      .then(() => {
        const updatedOrders = orders.filter(order => order.id !== orderId);
        setOrders(updatedOrders);
        setLoading(false);
        alert('Order deleted successfully');
      })
      .catch(() => {
        setLoading(false);
        alert('Failed to delete order');
      });
  };


  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Orders</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#FF5722" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : orders.length === 0 ? (
          <Text style={styles.noOrdersText}>No orders available.</Text>
        ) : (
          orders.map((order) => (
            <View key={order.id} style={styles.orderContainer}>
              <Text style={styles.orderTitle}>Order #{order.id}</Text>
              <Text style={styles.orderDate}>Placed on: {order.createdAt}</Text>
              <Text style={styles.orderStatus}>Status: {order.status}</Text>

              <View style={styles.statusButtons}>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    order.status === 'received' && styles.activeStatusButton,
                    order.status === 'prepared' && styles.disabledStatusButton
                  ]}
                  onPress={() => order.status !== 'prepared' && updateOrderStatus(order.id, 'received')}
                  disabled={order.status === 'prepared'}
                >
                  <Text style={styles.statusButtonText}>Received</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    order.status === 'picked' && styles.activeStatusButton,
                    order.status === 'prepared' && styles.disabledStatusButton
                  ]}
                  onPress={() => order.status !== 'prepared' && updateOrderStatus(order.id, 'picked')}
                  disabled={order.status === 'prepared'}
                >
                  <Text style={styles.statusButtonText}>Picked</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    order.status === 'prepared' && styles.activeStatusButton
                  ]}
                  onPress={() => updateOrderStatus(order.id, 'prepared')}
                >
                  <Text style={styles.statusButtonText}>Prepared</Text>
                </TouchableOpacity>
              </View>

              {order.status === 'prepared' && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteOrder(order.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete Order</Text>
                </TouchableOpacity>
              )}

<View style={styles.menuItemList}>
  {order.MenuItems.length > 0 ? (
    order.MenuItems.map((menuItem, idx) => (
      <View key={idx} style={styles.menuCard}>
        <View style={styles.menuCardHeader}>
          <Text style={styles.menuCardTitle}>{menuItem.name}</Text>
        </View>
        <View style={styles.menuCardDetails}>
          <Text style={styles.menuCardText}>Quantity: {menuItem.OrderItem.quantity}</Text>
          <Text style={styles.menuCardText}>Price: ${menuItem.price}</Text>
        </View>
      </View>
    ))
  ) : (
    <Text style={styles.noItemsText}>No items ordered</Text>
  )}
</View>


              <View style={styles.totalPriceContainer}>
                <Text style={styles.totalPriceText}>Total Price: ${order.totalPrice}</Text>
              </View>
            </View>
          ))
        )}

    
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 25,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  orderContainer: {
    backgroundColor: '#ffffff',
    marginBottom: 15,
    padding: 20,
    borderRadius: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDate: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
  },
  orderStatus: {
    fontSize: 16,
    color: '#00C853',
    fontWeight: '600',
    marginTop: 15,
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  statusButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: '#f2f2f2',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  statusButtonText: {
    fontSize: 14,
    color: '#555',
  },
  totalQuantityContainer: {
    marginTop: 20,
  },
  totalQuantityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalQuantityText: {
    fontSize: 16,
    color: '#555',
  },
  activeStatusButton: {
    backgroundColor: '#00C853',
    borderColor: '#00C853',
  },
  disabledStatusButton: {
    backgroundColor: '#dcdcdc',
    borderColor: '#dcdcdc',
    opacity: 0.6,
  },
  menuItemList: {
    marginTop: 15,
  },
  menuCard: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuCardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 8,
    marginBottom: 8,
  },
  menuCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  menuCardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  menuCardText: {
    fontSize: 14,
    color: '#555',
  },
  noItemsText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  
  deleteButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: '#FF1744',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#FF1744',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#fff',
  },

  menuItem: {
    marginTop: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    fontSize: 14,
    color: '#555',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  noOrdersText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  totalPriceContainer: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalPriceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
  },
});
