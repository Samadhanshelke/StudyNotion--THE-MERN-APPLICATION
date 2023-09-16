import React from 'react'
// import Swiper from 'swiper';

import {Swiper, SwiperSlide} from "swiper/react"
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"
import { Autoplay, FreeMode, Pagination } from "swiper/modules"

import Course_Card from './Course_Card'



const CourseSlider = ({Courses}) => {
 
  return (
    <>
      {Courses?.length ? (
        <Swiper
          slidesPerView={1}
          spaceBetween={25}
          loop={true}
          freeMode={true}

          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          speed={1000}
        pagination={{
          clickable: true,
        }}
        // Navigation={true}
          modules={[ FreeMode, Pagination, Autoplay]}
          breakpoints={{
            760: { slidesPerView: 2 },
            1024: {
              slidesPerView: 2,
            },
            1440: {
              slidesPerView: 3,
            },
          }}
          className="min-h-[380px] sm:min-h-[350px]  max-w-[85vw] mySwiper border  bg-richblack-900"
        >
          {Courses?.map((course, i) => (
            <SwiperSlide key={i}>
              <Course_Card course={course} Height={"h-[200px]"} Width={"80vw"} />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p className="text-xl text-richblack-5">No Course Found</p>
      )}
    </>
  )
}

export default CourseSlider
