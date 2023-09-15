const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

//create rating
exports.createRating = async (req, res) => {
  try {
    //get user id
    const userId = req.user.id;

    //fetch data from req body
    const { rating, review, courseId } = req.body;

    //check if user is enrolled or not
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: { $elemMatch: { $eq: userId } },
    });
     console.log("in ratingAnd Review controller..,printing courseDetails",courseDetails)
    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "student is not enrolled in the course",
      });
    }
    //check if user already reviewed the course
    const alreadyReviewed = await RatingAndReview.findOne({
                                                        user: userId,
                                                        course: courseId,
                                                        });
    if (alreadyReviewed) {
      return res.status(403).json({
            success:false,
            message:"course is already reviewed by the user",
      });
    }
    //create rating and review
    const ratingReview = await RatingAndReview.create({
                                            rating,
                                            review,
                                            course:courseId,
                                            user:userId,
                                        });
    //update course with this rating/review
   const updatedCourseDetails =  await Course.findByIdAndUpdate({_id:courseId},
                                {
                                   $push:{
                                    ratingAndReviews:ratingReview._id,
                                   }
                                },
                                {new:true})
    console.log(updatedCourseDetails)
    //return review
    return res.status(200).json({
        success:true,
        message:"rating and review created successfully",
        ratingReview,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
        success:false,
        message:error.message,
       
    })
  }
};

//get Average Rating
exports.getAverageRating = async(req,res)=>{
    try {
        //get course id
        const courseId = req.body.courseId;

        //calculate avarage rating
        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    course: new mongoose.Types.ObjectId(courseId),
                }
            },
            {
                $group:{
                    _id:null,
                    averageRating:{$avg:"$rating"},
                }
            }
        ])
        //return rating
        if(result.length > 0){
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating,
            })
        }
        //if no review exist
        return res.status(200).json({
            success:true,
            message:"Average rating is 0, no rating given till now ",
            averageRating:0,
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message,
           
        })
    }
}

//getAllRatingAndReview

exports.getAllRating = async(req,res)=>{
    try {
        const allReviews = await RatingAndReview.find({})
                                //  .sort({rating:"des"})
                                 .populate({
                                    path:"user",
                                    select:"firstName lastName email image",
                                 })
                                 .populate({
                                    path:"course",
                                    select:"courseName",
                                 })
                                 .exec();
  
  return res.status(200).json({
     success:true,
      message:"All reviews fetched successfully",
      data:allReviews,
                                   
 })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message,
           
        })
    }
}
