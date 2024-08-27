

'use client'

import { addToCart, clearCart, ICartItem, removeFromCart, updateQuantity } from '@/cartRedux/cartSlice';
import { RootState } from '@/cartRedux/store';
import { ApiResponse } from '@/helpers/ApiResponse';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"



const Page = () => {
  const cart = useSelector((state: RootState) => state.cart.cart);
  const dispatch = useDispatch();
  const [discount, setDiscount] = useState<number>(0);
  const [code, setCode] = useState('');
  const [codeMsg, setCodeMsg] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load cart from localStorage when component mounts
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      const parsedCart: ICartItem[] = JSON.parse(storedCart);
      parsedCart.forEach(item => dispatch(addToCart(item)));
    }
  }, [dispatch]);

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const handleRemoveFromCart = (productId: string) => {
    dispatch(removeFromCart(productId));
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    dispatch(updateQuantity({ productId, quantity: newQuantity }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };



  // apply coupon
  useEffect(() => {
    const applyCoupon = async () => {
      try {
        const response = await axios.post('/api/admin/apply-coupon', {
          code
        })
        const disc = response.data.data?.discount
        setDiscount(disc)
        console.log("-----", disc)
        calculateTotal()
        setCodeMsg("Coupon applyed")
      } catch (error) {
        console.error("Error applying coupon", error)
        const axiosError = error as AxiosError<ApiResponse>
        let errorMessage = axiosError.response?.data.message
        console.log(errorMessage)
        setDiscount(0)
        setCodeMsg("Invalid or expired coupon code")
      }
    }
    applyCoupon()

  }, [code])

  // calculate total amount to pay
  const calculateTotal = () => {
    const subtotal = cart.reduce((acc, item) => acc + parseFloat(item.product.sellingPrice) * item.quantity, 0);
    const total = subtotal - (subtotal * discount / 100);
    return total.toFixed(2);
  };



  // buy ===================================================================

  // check user logged or not
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [userId, setUserId] = useState('')
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);




  const handleBuyClick = () => {
    if (!session) {
      // Redirect to login page if user is not logged in
      router.push('/login');
    } else {
      // Show Popover if user is logged in
      const id = session.user?._id as string
      setUserId(id)
      setIsPopoverOpen(true);
    }
  };

  const handleNextClick = async () => {

    setIsLoading(true)

    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    const address = {
      street: street,
      city: city,
      state: state,
      postalCode: postalCode,
    };
    const totalAmount = cartItems.reduce((acc: any, item: any) => acc + item.price * item.quantity, 0);

    try {
      const response = await axios.post('/api/create-buy-order', {
        userId,
        cartItems,
        address,
        totalAmount,
        phone
      });

      toast({
        title: "Success",
        description: "Order Created",
        className: 'toast-success'
      })

      const order = response.data
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: order.amount,
        currency: order.currency,
        name: 'E-commerce',
        description: 'Shopping',
        order_id: order.id,
        handler: async (response: any) => {
          // Send payment details to backend for verification
          const verificationRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verificationData = await verificationRes.json();

          if (verificationRes.ok) {
            alert('Payment successful!');
          } else {
            alert(`Payment failed: ${verificationData.error}`);
          }
        },
        prefill: {
          userId: userId,
          phone: phone,
          address: address
        },
        notes: {
          address: 'User Address',
        },
        theme: {
          color: '#3399cc',
        },
      };



      const rzp = new (window as any).Razorpay(options);
      rzp.open();

      handleClearCart()
      setIsLoading(false)

      toast({
        title: "Success",
        description:  "Order Placed",
        className: 'toast-success'
      })

    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      let errorMessage = axiosError.response?.data.message
      toast({
        title: "Failed",
        description: errorMessage || "Order failed",
        className: 'toast-error'
      })
      setIsLoading(false)
    }
  };


  

  return (
    <>
      <Head>
        <title>Cart </title>
        <meta name="description" content="This is the cart page." />
      </Head>
      <div className="mt-16 p-10 bg-[#9cc09c] min-h-screen">
        <div className='container'>
          <h2 className="text-3xl font-bold mb-6 text-green-800">Your Cart</h2>
          {cart.length === 0 ? (
            <p className="text-lg text-gray-600">Your cart is empty.</p>
          ) : (
            <div className="space-y-4">
              {cart.map((item: ICartItem) => (
                <div key={item.product._id} className="cart-item flex items-center p-4 bg-white rounded-lg shadow-md">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.productName}
                    className="w-24 h-24 object-cover rounded-lg mr-4"
                  />
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-800">{item.product.productName}</h4>
                    <p className="text-lg text-gray-600">${(parseFloat(item.product.sellingPrice) * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(event) => handleQuantityChange(item.product._id, parseInt(event.target.value, 10))}
                      min="1"
                      className="w-16 text-center border border-gray-300 rounded-md p-1"
                    />
                    <button
                      onClick={() => handleRemoveFromCart(item.product._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {/* Discount Section */}
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Apply Coupon</h3>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter Coupon Code"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <p className='text-xs py-1'>{codeMsg}</p>
              </div>

              {/* Cart Summary */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Cart Summary</h3>
                <div className="flex justify-between mb-4">
                  <span className="text-lg text-gray-700">Subtotal:</span>
                  <span className="text-lg font-semibold text-gray-800">${cart.reduce((acc, item) => acc + parseFloat(item.product.sellingPrice) * item.quantity, 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-lg text-gray-700">Discount:</span>
                  <span className="text-lg font-semibold text-gray-800">-{discount}%</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-lg text-gray-700">Total:</span>
                  <span className="text-2xl font-bold text-green-800">${calculateTotal()}</span>
                </div>
                <button
                  onClick={handleClearCart}
                  className="mt-6 mr-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Clear Cart
                </button>

                <AlertDialog open={isPopoverOpen} >
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" onClick={handleBuyClick} className="mt-6 mr-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 hover:text-white transition-colors">Buy</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className='text-center'>Details</AlertDialogTitle>
                      <AlertDialogDescription>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleNextClick();
                          }}
                          className="space-y-4"
                        >
                          <div>
                            <label htmlFor="street" className="block text-gray-700 font-medium mb-1">
                              Street:
                            </label>
                            <input
                              type="text"
                              id="street"
                              value={street}
                              onChange={(e) => setStreet(e.target.value)}
                              required
                              className="w-full px-2 py-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="city" className="block text-gray-700 font-medium mb-1">
                              City:
                            </label>
                            <input
                              type="text"
                              id="city"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              required
                              className="w-full px-2 py-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="state" className="block text-gray-700 font-medium mb-1">
                              State:
                            </label>
                            <input
                              type="text"
                              id="state"
                              value={state}
                              onChange={(e) => setState(e.target.value)}
                              required
                              className="w-full px-2 py-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="postalCode" className="block text-gray-700 font-medium mb-1">
                              Postal Code:
                            </label>
                            <input
                              type="text"
                              id="postalCode"
                              value={postalCode}
                              onChange={(e) => setPostalCode(e.target.value)}
                              required
                              className="w-full px-2 py-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="phone" className="block text-gray-700 font-medium mb-1">
                              Phone No:
                            </label>
                            <input
                              type="tel"
                              id="phone"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              required
                              className="w-full px-2 py-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            />
                          </div>
                          <button
                            type="submit"
                            className=" mr-4 bg-green-600 text-white font-bold py-2 px-3 rounded-lg shadow-md hover:bg-green-700 transition-colors text-sm"
                          >
                            {
                                    isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />Please Wait
                                        </>
                                    ) : ('Next')
                                }
                          </button>
                          <button
                            type="button"
                            className="w-[80px] bg-green-600 text-white font-bold py-2 px-3 rounded-lg shadow-md hover:bg-green-700 hover:text-white transition-colors text-sm"
                            onClick={() => setIsPopoverOpen(false)}
                          >
                            Cancel
                          </button>
                        </form>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      {/* <AlertDialogCancel onClick={()=>setIsPopoverOpen(false)}>Cancel</AlertDialogCancel> */}
                      {/* <AlertDialogAction className=" bg-green-600 text-white font-bold py-2 px-3 rounded-lg shadow-md hover:bg-green-700 transition-colors text-sm">Continue</AlertDialogAction> */}
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Page;

