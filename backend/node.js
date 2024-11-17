const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const port = 7001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Sequelize MySQL connection
const sequelize = new Sequelize('menu_db', 'root', 'Tr98523@', {
  host: 'localhost',
  dialect: 'mysql',
});

// Test the connection
sequelize.authenticate()
  .then(() => console.log('Database connected successfully.'))
  .catch(err => console.log('Error connecting to the database:', err));

// Define the MenuItem model
const MenuItem = sequelize.define('MenuItem', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Define the Order model
const Order = sequelize.define('Order', {
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'received',
  },
  totalPrice: {  // Add totalPrice here
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
});

// Define the OrderItem model (for storing quantity of each menu item in an order)
const OrderItem = sequelize.define('OrderItem', {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1, // Default quantity is 1
  },
});
// Inside the backend Express route for creating an order

  
// Create a many-to-many relationship between Orders and MenuItems
Order.belongsToMany(MenuItem, { through: OrderItem });
MenuItem.belongsToMany(Order, { through: OrderItem });

// Sync the models with the database
sequelize.sync({ alter: true });

// Routes

// Get all menu items
app.get('/api/menuItems', async (req, res) => {
  try {
    const menuItems = await MenuItem.findAll();
    res.status(200).json(menuItems);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching menu items', error: err });
  }
});


// Add a new menu item
app.post('/api/menuItems', async (req, res) => {
  const { name, description, price } = req.body;
  try {
    const newItem = await MenuItem.create({ name, description, price });
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ message: 'Error adding menu item', error: err });
  }
});

// Update a menu item
app.put('/api/menuItems/:id', async (req, res) => {
  const { name, description, price } = req.body;
  const { id } = req.params;
  try {
    const updatedItem = await MenuItem.update(
      { name, description, price },
      { where: { id } }
    );
    res.status(200).json({ message: 'Menu item updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating menu item', error: err });
  }
});

// Delete a menu item
app.delete('/api/menuItems/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await MenuItem.destroy({ where: { id } });
    res.status(200).json({ message: 'Menu item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting menu item', error: err });
  }
});

// Define the OrderItem and Order models
Order.belongsToMany(MenuItem, { through: OrderItem });
MenuItem.belongsToMany(Order, { through: OrderItem });

app.post('/api/orders', async (req, res) => {
    try {
      const { items, totalPrice } = req.body;
  
      // Create the order
      const order = await Order.create({ totalPrice });
  
      if (!order.id) {
        return res.status(500).json({ message: 'Order creation failed' });
      }
  
      // Add order items
      for (const item of items) {
        const { itemId, quantity } = item;
        if (itemId && quantity) {
          await OrderItem.create({
            OrderId: order.id,
            MenuItemId: itemId,
            quantity,
          });
        } else {
          return res.status(400).json({ message: 'Invalid item data' });
        }
      }
  
      res.status(201).json({ message: 'Order placed successfully.' });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ message: 'Failed to place order.' });
    }
  });
  





// Get all orders (admin view)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: MenuItem, // Include associated MenuItems
    });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err });
  }
});

// Update order status (backend)
app.put('/api/orders/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
      const order = await Order.findByPk(req.params.id);
      if (order) {
        order.status = status;
        await order.save();
        res.status(200).json({ message: 'Order status updated successfully' });
      } else {
        res.status(404).json({ message: 'Order not found' });
      }
    } catch (err) {
      res.status(500).json({ message: 'Error updating order status', error: err });
    }
  });
  
  // Delete an order by ID
app.delete('/api/orders/:id', async (req, res) => {
    try {
      // Find the order by its ID
      const order = await Order.findByPk(req.params.id);
      
      if (!order) {
        // If the order doesn't exist, send a 404 error
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Destroy the order and its related order items
      await order.destroy();
  
      // Send a success response
      res.status(200).json({ message: 'Order deleted successfully' });
    } catch (err) {
      // Handle any errors and send a failure response
      res.status(500).json({ message: 'Error deleting order', error: err.message });
    }
  });
  
// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
