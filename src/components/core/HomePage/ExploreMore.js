import React, { useState } from 'react'
import {HomePageExplore} from '../../../data/homepage-explore'
import HighLightText from './HighLightText';
import CourseCard from './CourseCard';
const tabName =[
    "Free",
    "New to coding",
    "Most popular",
    "Skill paths",
    "Career paths"
];
function ExploreMore() {
    const [currentTab, setCurrentTab] = useState(tabName[0]);
   const [courses,setCourses] = useState(HomePageExplore[0].courses)
   const [currentCard, setCurrentCard]  = useState(HomePageExplore[0].courses[0].heading)

   const setMyCards = (value)=>{
     setCurrentTab(value);
    //  console.log(currentTab)
     const result = HomePageExplore.filter((course)=>course.tag === value)
    //  console.log( result)
     setCourses(result[0].courses)
     setCurrentCard(result[0].courses[0].heading);
    //  console.log(currentCard)
   }
  return (
    <div className='relative justify-center item-center w-full h-[1300px] sm:h-[700px] xl:h-auto'>
        <div className='text-4xl font-semibold text-center'>
            Unlock the 
            <HighLightText text={"Power of Code"}/>
        </div>

        <p className='text-center text-richblack-300 text-[18px] mt-3 font-semibold'>
            Learn to build anything you can Imagine 
        </p>

        <div className='flex flex-col sm:flex-row rounded-md sm:rounded-full w-[90vw] flex-wrap sm:flex-nowrap sm:w-[92vw] max-w-[800px]  gap-2 sm:gap-7 m-auto bg-richblack-800 mb-14 border-richblack-100 mt-5 px-1 py-1  '>
            {
                tabName.map((element,index)=>{
                    return (
                        <div className={`text-[16px] sm:text-[12px] lg:text-[16px]  flex flex-row gap-2 
                         ${currentTab === element ? "bg-richblack-900 text-richblack-5 font-medium"
                         : "text-richblack-200"} rounded-full transition-all duration-200 
                         cursor-pointer hover:bg-richblack-900 hover:text-richblack-5 px-7 py-2`
                         }
                         key={index}
                         onClick={()=>setMyCards(element)}>
                            {element}
                        </div>
                    )
                })
            }
        </div>

        <div className='h-[150px]'></div>
        {/* course card */}
        <div className='absolute -translate-y-40 flex flex-col sm:flex-row flex-wrap xl:flex-nowrap  gap-10 justify-center m-auto items-start '>
            {
               courses.map((element,index)=>{
                 return (
                    <CourseCard key={index}
                     cardData={element} 
                     currentCard = {currentCard}
                     setCurrentCard={setCurrentCard}
                     />
                 )
               }) 
            }
        </div>
    </div>
  )
}

export default ExploreMore