'use client'

import React from "react"
import Link from "next/link"
import { useSession ,signOut} from "next-auth/react"
import {User} from 'next-auth'
import { Button } from "./ui/button"

const Navbar = () => {

    const {data:session} = useSession()

    return (
        <>
        <div className="  flex flex-row justify-between items-center py-4 px-6 bg-green-500 fixed z-50 top-0 w-[100%] shadow-md">
      <a href="#" className="text-2xl font-bold text-white hover:text-green-300 transition duration-300">
        Green Foundation
      </a>

      <div className="flex gap-5 items-center">
        <Link href="/" className="text-white hover:text-green-300 transition duration-300">
          Home
        </Link>
        <Link href="/about" className="text-white hover:text-green-300 transition duration-300">
          About
        </Link>
        <Link href="/project" className="text-white hover:text-green-300 transition duration-300">
          Project
        </Link>
        <Link href="/get-involved" className="text-white hover:text-green-300 transition duration-300">
          Get Involved
        </Link>
      </div>

      <Link href='/signup' className="px-4 py-2 bg-white text-green-500 font-bold rounded hover:bg-green-300 hover:text-white transition duration-300">
        Sign Up
      </Link>
    </div>
        </>
    )
}

export default Navbar