import React from 'react'
import { NavbarLinks } from "../../data/navbar-links"
import { matchPath, useLocation,Link } from 'react-router-dom'
import { BsChevronDown } from "react-icons/bs"
import {  AiOutlineShoppingCart } from "react-icons/ai"

import { useSelector } from "react-redux"
import { ACCOUNT_TYPE } from "../../utils/constants"
import ProfileDropdown from "../core/Auth/ProfileDropDown"

function Sidebar({loading,subLinks,openNavbar,setOpenNavbar,handleNavbarOpen}) {
    const location = useLocation()
    const matchRoute = (route) => {
        return matchPath({ path: route }, location.pathname)
      }
      const { token } = useSelector((state) => state.auth)
      const { user } = useSelector((state) => state.profile)
      const { totalItems } = useSelector((state) => state.cart)

  return (
    <div className={`text-white absolute z-50  top-14  w-screen m-auto ${openNavbar? "h-screen  opacity-100 transition-opacity md:hidden "
      :"h-0 opacity-0"} ${location.pathname !== "/" ? "bg-richblack-800" : "bg-richblack-900"} transition-all duration-200`}>

         <div className='flex justify-center flex-col gap-y-20 items-center mt-4'>
         <nav>
          <ul className="flex gap-y-6 text-richblack-900 flex-col ">
            {NavbarLinks.map((link, index) => (
              <li key={index}>
                {link.title === "Catalog" ? (
                  <>
                    <div
                      className={`group relative flex cursor-pointer items-center gap-1 ${
                        matchRoute("/catalog/:catalogName")
                          ? "text-yellow-25 text-[18px]"
                          : "text-richblack-25 text-[18px]"
                      }`}
                    >
                      <p>{link.title}</p>
                      <BsChevronDown />
                      <div className="invisible absolute left-[50%] top-[50%] z-[1000] flex w-[200px] translate-x-[-50%] translate-y-[3em] flex-col rounded-lg bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100 lg:w-[300px]">
                        <div className="absolute left-[50%] top-0 -z-10 h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded bg-richblack-5"></div>
                        {loading ? (
                          <p className="text-center">Loading...</p>
                        ) : (subLinks && subLinks.length) ? (
                          <>
                            {subLinks
                              ?.filter(
                                (subLink) => subLink?.courses?.length > 0
                              )
                              ?.map((subLink, i) => (
                                <Link
                                onClick={()=>{handleNavbarOpen()}}
                                  to={`/catalog/${subLink.name
                                    .split(" ")
                                    .join("-")
                                    .toLowerCase()}`}
                                  className="rounded-lg bg-transparent py-4 pl-4 hover:bg-richblack-50"
                                  key={i}
                                >
                                  <p  onClick={()=>{handleNavbarOpen()}}>{subLink.name}</p>
                                </Link>
                              ))}
                          </>
                        ) : (
                          <p className="text-center">No Courses Found</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link to={link?.path}>
                    <p
                     onClick={()=>{handleNavbarOpen()}}
                      className={`${
                        matchRoute(link?.path)
                          ? "text-yellow-25 text-[18px]"
                          : "text-richblack-25 text-[18px]"
                      }`}
                    >
                      {link.title}
                    </p>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex  items-center gap-x-10 ">
          {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
            <Link to="/dashboard/cart" className="relative"  onClick={()=>{handleNavbarOpen()}}>
              <AiOutlineShoppingCart className="text-2xl text-richblack-100" />
              {totalItems > 0 && (
                <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-center text-xs font-bold text-yellow-100">
                  {totalItems}
                </span>
              )}
            </Link>
          )}
          {token === null && (
            <Link to="/login" onClick={()=>{setOpenNavbar(false)}}>
              <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                Log in
              </button>
            </Link>
          )}
          {token === null && (
            <Link to="/signup" onClick={()=>{setOpenNavbar(false)}}>
              <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                Sign up
              </button>
            </Link>
          )}
          {token !== null && <ProfileDropdown  handleNavbarOpen={handleNavbarOpen}/>}
        </div>
         </div>
    </div>
  )
}

export default Sidebar