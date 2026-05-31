import Razorpay from "razorpay";
import { db } from "@/lib/db";
import { requireUserId } from "@/server/auth";


export const razorpay = new Razorpay( {
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECERT!
     });
export const RAZORPAY_PLANS = {
  PRO: process.env.RAZORPAY_PRO_PLAN_ID!,
  TEAM: process.env.RAZORPAY_TEAM_PLAN_ID!,
};

