const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple in-memory products (frontend also loads same file)
// You can expand this or connect to DB later.
const products = [
  { id: 1, name: "Aurora Sneakers", price: 3499, sku: "SNK-AUR-01", img: "https://source.unsplash.com/600x600/?sneakers", desc: "Lightweight, breathable urban sneakers with glow-edge design." },
  { id: 2, name: "Nimbus Jacket", price: 5799, sku: "JKT-NIM-02", img: "https://source.unsplash.com/600x600/?jacket", desc: "Water-resistant jacket with breathable mesh and neon piping." },
  { id: 3, name: "Orbit Watch", price: 7999, sku: "WAT-ORB-03", img: "https://source.unsplash.com/600x600/?watch", desc: "Smart-analog watch with subtle motion animations." },
  { id: 4, name: "Halo Backpack", price: 2599, sku: "BAG-HAL-04", img: "https://source.unsplash.com/600x600/?backpack", desc: "Ergonomic backpack with anti-theft pocket and LED strip." }
];

// API endpoints
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const p = products.find(x => x.id === id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

// Simple order endpoint (no DB) — returns order id
app.post('/api/order', (req, res) => {
  const { items, name, address } = req.body;
  if (!items || items.length === 0) return res.status(400).json({ error: 'Cart empty' });
  const orderId = 'ORD' + Math.floor(Math.random() * 1000000);
  // In real app save to DB — here we just return success
  res.json({ orderId, message: 'Order placed', itemsCount: items.length });
});

// Fallback to index for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Server listening on ${PORT}`));

