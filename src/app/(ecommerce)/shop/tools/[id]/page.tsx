'use client'

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { IProduct } from '@/models/product.models';
import { useToast } from '@/components/ui/use-toast';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { addToCart, ICartItem } from '@/cartRedux/cartSlice';
import { ApiResponse } from '@/helpers/ApiResponse';
import Rating from '@/components/Rating';
import getRandomElements from '@/helpers/getRandomElements';
import Testimonials from '@/components/Testimonials';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import Head from 'next/head';
import WishlistButton from '@/components/wishlistButton';



const Page = () => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [products, setProducts] = useState<IProduct[]>([])
    const [product, setProduct] = useState<IProduct[]>([])
    const [alsoLikeProducts, setAlsoLikeProducts] = useState<IProduct[]>([])
    const [hoveredProductId, setHoveredProductId] = useState<string | null>(null)

    const { id } = useParams();
    const { toast } = useToast()
    const router = useRouter()

    const dispatch = useDispatch();

    const handleAddToCart = (product: any) => {
        const cartItem: ICartItem = {
            product,
            quantity: 1,
        };
        dispatch(addToCart(cartItem));
        toast({
            title: "Success",
            description: "Product added to cart",
            className: "toast-success"
        })
        router.replace('/cart')
    };

    // fetching data
    useEffect(() => {
        const fetchProducts = async () => {
            setIsSubmitting(true)
            try {
                const allProducts = await axios.get<ApiResponse>('/api/get-products')
                console.log("*************", allProducts)
                const productData = allProducts.data.data as []
                console.log(productData, "*************")
                setProducts(productData)
            } catch (error) {
                console.error("Error fetching products:", error)
            } finally {
                setIsSubmitting(false)
            }
        }
        fetchProducts()
    }, [])


    useEffect(() => {
        const product = products.filter((product) => product._id.toString() === id)
        setProduct(product)

    }, [products])

    useEffect(() => {
        if (products.length > 0) {
            setAlsoLikeProducts(getRandomElements(products, 5));
        }
    }, [products]);

    const autoplay = React.useRef(
        Autoplay({ delay: 2000, stopOnInteraction: true })
    )

    return (


        <>
            <Head>
                <title>Tool product</title>
                <meta name="description" content="This is the tool product page." />
            </Head>
            <section className='min-h-screen mt-16 pt-10 bg-[#9cc09c]'>
                {product.length > 0 ? (
                    <div className="container mx-auto p-4 border-green-800 border-y-2 md:p-6 bg-cover bg-[#d8e6d8] rounded-lg shadow-lg " style={{ backgroundImage: "url(http://clipart-library.com/images/8izrdA9LT.png)", backgroundRepeat: "no-repeat", objectFit: 'cover', }}>

                        <div className="flex flex-col md:flex-row md:space-x-8">
                            <div className="relative w-full mb-4 md:w-1/2">
                                <div
                                    className="relative w-full mb-4 h-64 md:h-[400px] rounded-lg  border-green-800 border-y-2"
                                    onMouseEnter={() => setHoveredProductId(product[0]._id.toString())}
                                    onMouseLeave={() => setHoveredProductId(null)}
                                >
                                    <img
                                        src={product[0].images[0]}
                                        alt={product[0].productName}
                                        className={`w-full h-full object-cover rounded-lg transition-opacity duration-500 ${hoveredProductId === product[0]._id.toString() ? 'opacity-0' : 'opacity-100'}`}
                                    />
                                    {product[0].images.slice(1).map((image, index) => (
                                        <img
                                            key={index}
                                            src={image}
                                            alt={product[0].productName}
                                            className={`absolute inset-0 w-full h-full object-cover rounded-lg transition-opacity duration-500 ${hoveredProductId === product[0]._id.toString() ? 'opacity-100' : 'opacity-0'}`}
                                        />
                                    ))}
                                </div>
                                <div className="flex gap-2 justify-center mb-6 ">
                                    <Carousel
                                        plugins={[autoplay.current]}
                                        className="w-[80%] "
                                    >
                                        <CarouselContent >
                                            {product[0].images.map((image, index) => (
                                                <CarouselItem className="md:basis-1/3 lg:basis-1/4 xl::basis-1/5">

                                                    <img
                                                        key={index}
                                                        src={image}
                                                        alt={`${product[0].productName} image ${index + 1}`}
                                                        className="h-[100px] object-cover  shadow-md transition-transform duration-500 hover:scale-105 rounded-lg  border-green-800 border-y-2"
                                                    />
                                                </CarouselItem>

                                            ))}
                                        </CarouselContent>
                                        <CarouselPrevious />
                                        <CarouselNext />
                                    </Carousel>
                                </div>
                            </div>

                            <div className="w-full md:w-1/2 mt-6 md:mt-0">
                                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 md:mb-8">{product[0].productName}</h1>
                                <p className="text-base md:text-lg text-gray-700 mb-4 md:mb-6">{product[0].productDesc}</p>
                                <p className="text-base md:text-lg text-gray-700 mb-4 md:mb-6">{product[0].category}</p>
                                <p className="text-base md:text-lg text-gray-700 mb-4 md:mb-6">{product[0].subCategory}</p>

                                {/* <Rating rating={parseFloat(product[0].rating)} /> */}
                                <div className="flex justify-around my-2 items-center">
                                <Rating rating={parseFloat(product[0].rating)} />
                                            <WishlistButton productId={product[0]._id.toString()} />
                                            
                                          </div>
                                <div className="flex flex-col md:flex-row items-start md:items-center mb-6 space-y-2 md:space-x-4 md:space-y-0">
                                    <span className="text-2xl md:text-3xl font-bold text-green-600">${product[0].sellingPrice}</span>
                                    <span className="text-base md:text-lg text-gray-500 line-through">${product[0].price}</span>
                                </div>

                                <div className="space-y-4 flex-col md:w-1/2">
                                    <button className="mt-4 flex items-center justify-center w-full px-4 py-2 bg-green-600 text-white font-bold text-lg rounded-lg shadow-md hover:bg-green-700 transition duration-300" onClick={() => handleAddToCart(product[0])}>
                                        Add to Cart
                                    </button>
                                    <button className="mt-4 flex items-center justify-center w-full px-4 py-2 bg-green-600 text-white font-bold text-lg rounded-lg shadow-md hover:bg-green-700 transition duration-300" onClick={() => handleAddToCart(product[0])}>
                                        Buy
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="container mx-auto p-4 md:p-6">
                        <p className="text-center text-lg md:text-xl text-gray-500">Loading...</p>
                    </div>
                )}
            </section>

            {/* tool care */}
            <section className="bg-[#d8e6d8] py-16 px-4 md:px-8">
                <div className="container mx-auto">
                    <h2 className="text-4xl font-bold text-gray-800 text-center mb-2">Tool Care Guidelines from Green E-commerce</h2>
                    <p className="text-lg text-gray-700 text-center mb-12 md:max-w-2xl mx-auto">
                        Keep your gardening tools in top condition with these essential care tips, ensuring they last and perform their best.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                            <img
                                src="https://www.thespruce.com/thmb/2K-5g62NEC5E9CMEx_TU4NWvTUk=/5538x3692/filters:no_upscale():max_bytes(150000):strip_icc()/how-to-clean-garden-tools-4799140-10-014cca25a6094ee7881805c2ccddadb1.jpg"
                                alt="Tool Cleaning"
                                className="w-20 h-20 mx-auto mb-4"
                            />
                            <h3 className="text-2xl font-bold text-green-600 mb-2 text-center">Cleaning Tools</h3>
                            <p className="text-gray-600 text-center">
                                Regularly clean your tools after each use. Remove dirt, sap, and moisture to prevent rust and keep them in optimal condition.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                            <img
                                src="https://www.thespruce.com/thmb/B__W6hkEBywl0FDW_pr9dThKbhQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/sharpening-mower-blade-big-3a358c8dcf65468bbe4705f0a3221dd0.jpg"
                                alt="Tool Sharpening"
                                className="w-20 h-20 mx-auto mb-4"
                            />
                            <h3 className="text-2xl font-bold text-green-600 mb-2 text-center">Sharpening Tools</h3>
                            <p className="text-gray-600 text-center">
                                Keep your tools sharp for better performance. Regularly sharpen blades, pruners, and shears to make your gardening tasks easier.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                            <img
                                src="https://i.pinimg.com/originals/1c/3d/0a/1c3d0a39036444ebeecc3057cc6a40f5.jpg"
                                alt="Tool Storage"
                                className="w-20 h-20 mx-auto mb-4"
                            />
                            <h3 className="text-2xl font-bold text-green-600 mb-2 text-center">Tool Storage</h3>
                            <p className="text-gray-600 text-center">
                                Store your tools in a dry place. Hanging them on a pegboard or in a tool shed will prolong their life and prevent rusting.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                            <img
                                src="https://cdn.notonthehighstreet.com/fs/e0/52/c926-5aef-4079-bf91-18d0cb348a51/original_personalised-father-s-day-garden-tool-set.jpg"
                                alt="Tool Maintenance"
                                className="w-20 h-20 mx-auto mb-4"
                            />
                            <h3 className="text-2xl font-bold text-green-600 mb-2 text-center">Regular Maintenance</h3>
                            <p className="text-gray-600 text-center">
                                Perform regular maintenance checks on your tools. Tighten any loose screws and oil moving parts to ensure smooth operation.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                            <img
                                src="https://tse4.mm.bing.net/th?id=OIP.6CPOBcC1FL7P_JMGwqnelAAAAA&pid=Api&P=0&h=180"
                                alt="Tool Replacement"
                                className="w-20 h-20 mx-auto mb-4"
                            />
                            <h3 className="text-2xl font-bold text-green-600 mb-2 text-center">Replacing Worn Tools</h3>
                            <p className="text-gray-600 text-center">
                                Replace worn or damaged tools promptly. Investing in quality tools from our store ensures you have the best equipment for your gardening needs.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                            <img
                                src="https://images-na.ssl-images-amazon.com/images/I/81vDkLJ75XL._AC_SL1500_.jpg"
                                alt="Ergonomics"
                                className="w-20 h-20 mx-auto mb-4"
                            />
                            <h3 className="text-2xl font-bold text-green-600 mb-2 text-center">Ergonomics</h3>
                            <p className="text-gray-600 text-center">
                                Choose ergonomic tools to reduce strain and fatigue. Our selection includes tools designed for comfort and efficiency in your gardening tasks.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* recommended */}
            <section className="py-16 px-4 md:px-8 bg-[#9cc09c]">
                <div className="container mx-auto">
                    <h2 className="text-4xl font-bold text-gray-800 text-center mb-2">Recommended</h2>
                    <p className="text-lg text-gray-700 text-center mb-8 md:max-w-2xl mx-auto">
                        Explore these recommended products that you'll love just as much!
                    </p>

                    <div className="flex flex-wrap justify-center gap-8">
                        {alsoLikeProducts.map((product) => (
                            <div
                                key={product._id.toString()}
                                className="w-full sm:w-1/2 lg:w-1/4 p-4"
                                onMouseEnter={() => setHoveredProductId(product._id.toString())}
                                onMouseLeave={() => setHoveredProductId(null)}
                            >
                                <div className="bg-white rounded-lg overflow-hidden shadow-lg relative border-y-4 border-green-700">
                                    <div className="relative h-48">
                                        <img
                                            src={product.images[0]}
                                            alt={product.productName}
                                            className={`w-full h-full object-cover transition-opacity duration-500 ${hoveredProductId === product._id.toString() ? 'opacity-0' : 'opacity-100'
                                                }`}
                                        />
                                        <img
                                            src={product.images[1]}
                                            alt={product.productName}
                                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${hoveredProductId === product._id.toString() ? 'opacity-100' : 'opacity-0'
                                                }`}
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold mb-2">{product.productName}</h3>
                                        <Rating rating={parseFloat(product.rating)} />
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-3xl font-bold text-green-900">${product.price}</span>
                                            <span className="text-sm line-through text-gray-500">${product.sellingPrice}</span>
                                        </div>
                                        <button
                                            className="mt-4 flex items-center justify-center w-full px-3 py-1.5 bg-green-600 text-white font-semibold text-sm rounded-md shadow-md hover:bg-green-700 transition duration-300"
                                            onClick={() => handleAddToCart(product)}
                                        >
                                            Add to Cart
                                        </button>
                                        <button
                                            className="mt-2 flex items-center justify-center w-full px-3 py-1.5 bg-green-600 text-white font-semibold text-sm rounded-md shadow-md hover:bg-green-700 transition duration-300"
                                            onClick={() => handleAddToCart(product)}
                                        >
                                            Buy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <Testimonials />


        </>


    )
};

export default Page;
