'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

type Product = { id: string; name: string; description: string; price: number; category: string; };
type CartItem = { product: Product; quantity: number };

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [orderComplete, setOrderComplete] = useState<boolean>(false);

  const catalogUrl = process.env.NEXT_PUBLIC_CATALOG_URL || 'http://localhost:3001';
  const cartUrl = process.env.NEXT_PUBLIC_CART_URL || 'http://localhost:3002';
  const orderUrl = process.env.NEXT_PUBLIC_ORDER_URL || 'http://localhost:3003';

  useEffect(() => {
    const currentUserId = localStorage.getItem('userId') || uuidv4();
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', currentUserId);
    }
    setUserId(currentUserId);

    const fetchData = async () => {
      try {
        const prodRes = await axios.get(`${catalogUrl}/api/products`);
        setProducts(prodRes.data);
        const cartRes = await axios.get(`${cartUrl}/api/cart/${currentUserId}`);
        setCart(cartRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [catalogUrl, cartUrl]);

  const addToCart = async (product: Product) => {
    try {
      const res = await axios.post(`${cartUrl}/api/cart/${userId}`, {
        productId: product.id,
        quantity: 1
      });
      setCart(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const checkout = async () => {
    try {
      setLoading(true);
      await axios.post(`${orderUrl}/api/orders`, {
        userId,
        email: 'user@example.com',
        shippingAddress: '123 Cloud Native Way, K8s City'
      });
      setOrderComplete(true);
      setCart([]);
    } catch (err) {
      console.error(err);
      alert('Checkout failed!');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading store data...</div>;

  if (orderComplete) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-bold text-green-600 mb-4">Order Successful!</h2>
        <p className="text-gray-600 mb-8">Your payment was processed and the order is confirmed.</p>
        <button onClick={() => setOrderComplete(false)} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
          Continue Shopping
        </button>
      </div>
    );
  }

  const cartTotal = cart.reduce((sum: number, item: CartItem) => sum + (item.product.price * item.quantity), 0);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1">
        <h2 className="text-xl font-semibold mb-6">Our Collection</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map(p => (
            <div key={p.id} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{p.name}</h3>
                  <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full uppercase font-semibold">
                    {p.category}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{p.description}</p>
                <div className="flex justify-between items-center mt-4 border-t dark:border-gray-700 pt-4">
                  <span className="font-extrabold text-xl">${p.price.toFixed(2)}</span>
                  <button 
                    onClick={() => addToCart(p)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition font-medium"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-80 shrink-0">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm sticky top-6">
          <h2 className="text-xl font-bold mb-4">Your Cart</h2>
          {cart.length === 0 ? (
            <p className="text-gray-500">Cart is empty.</p>
          ) : (
            <>
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">{item.product.name}</span>
                      <div className="text-gray-500">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <div className="border-t dark:border-gray-700 pt-4 mb-6">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>
              <button 
                onClick={checkout}
                className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition"
              >
                Checkout Now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
