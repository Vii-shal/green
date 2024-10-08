
import { NextApiRequest, NextApiResponse } from 'next';
import Razorpay from 'razorpay';
import mongoose from 'mongoose';
import Donation from '@/models/donation.models';
import { NextRequest } from 'next/server';
import dbConnect from '@/dbconfig/dbConnect';
import { ApiResponse } from '@/helpers/ApiResponse';
import OrderModel from '@/models/order.models';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {

    await dbConnect()

        const { userId , cartItems , address , totalAmount , phone ,couponCode} = await req.json();

        console.log("uuu",totalAmount,address,couponCode,userId, phone,cartItems)


        const options = {
            amount: totalAmount * 100, // Convert to paise
            currency: 'INR',
            receipt: `receipt_order_${new Date().getTime()}`,
        };

        try {
            console.log("order")
            const order = await razorpay.orders.create(options);
            console.log("order",order)

            const purchaseOrder = new OrderModel({
                userId,
                currency: options.currency,
                razorpayOrderId: order.id,
                items:cartItems,
                address,
                totalAmount,
                phone,
                couponCode,
                status: 'created',
            });

            console.log("ppppppp",purchaseOrder)
            await purchaseOrder.save();

            return Response.json(
                new ApiResponse(true,200,order,"Purchase order created"),
                {status:200}
            )
        } catch (error: any) {
            console.log({ error: error.message });
            return Response.json(
                new ApiResponse(false,500,{},"error while creating purchase order"),
                {status:500}
            )
        } 
}
