import React from 'react'
import Instructor from '../../../assets/Images/Instructor.png'
import HighLightText from './HighLightText'
import { FaArrowRight } from 'react-icons/fa'
import CTAButton from './CTAButton'
function InstructorSection() {
  return (
    <div className='mt-16'>
        <div className='flex flex-col sm:flex-row gap-20 items-center'>
            <div className='w-full sm:w-[50%]'>
                 <img src={Instructor} 
                 alt='img' 
                className='shadow-white'
                 />
            </div>

            <div className='w-full sm:w-[50%] flex flex-col gap-10'>
              <div className='text-4xl font-semibold lg:w-[50%]'>
                 Become an <HighLightText text={"Instructor"}/>
              </div>
               
               <p className='font-medium text-[16px] lg:w-[80%] text-richblack-300'>
               Instructors from around the world teach millions of students on StudyNotion. We provide the
                tools and skills to teach what you love.
               </p>
               
               <div className='w-fit'>

               <CTAButton active={true} linkto={'/signup'}>
                    <div className='flex flex-row gap-2 items-center'>
                          Start Learning Today
                          <FaArrowRight/>
                    </div>
               </CTAButton>
               </div>

            </div>
        </div>
    </div>
  )
}

export default InstructorSection