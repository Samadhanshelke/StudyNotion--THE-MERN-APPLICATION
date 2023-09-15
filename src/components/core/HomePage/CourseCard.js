import React from 'react'
import {BsPeopleFill} from 'react-icons/bs'
import {AiOutlineCluster} from 'react-icons/ai'
function CourseCard({cardData,currentCard,setCurrentCard}) {
  // 
  // 
  function getCurrentCard(){
    setCurrentCard(cardData.heading)
  }
  return (
    <div onClick={()=>getCurrentCard()}  className={`${currentCard === cardData.heading ? "bg-white shadow-[13px_12px_0px_0px_#f6e05e]" : "bg-richblack-800 "}   w-[90vw] sm:w-[320px] lg:w-[400px] h-[300px] flex flex-col justify-center items-start m-auto`}>
       <div className='p-9'>
          <div className={`${currentCard === cardData.heading ? "text-richblack-900":"text-white"} font-bold text-[20px]`}>{cardData.heading}</div>
          <div className='text-richblack-500 text-[17px] my-4 h-20 sm:h-20'>{cardData.description}</div>
          
       </div>
       <div className='w-full pt-4 pb-8 ps-6 pe-6 mb-4  flex flex-row justify-between items-center border-t-[3px] border-dashed border-richblack-400 '>
          <span className={`${currentCard === cardData.heading ? "text-[#0F7A9D]":"text-richblack-500"}  flex justify-center items-center gap-2 text-[16px] font-medium `}>
           <BsPeopleFill/>{cardData.level}
          </span>
          <span className={`${currentCard === cardData.heading ? "text-[#0F7A9D]":"text-richblack-500"}  flex justify-center items-center gap-2 text-[16px] font-medium `}>
           <AiOutlineCluster/> {cardData.lessionNumber} Lession
          </span>
       </div>
    </div>
  )
}

export default CourseCard