const Course = require("../models/Course")
const Category = require('../models/Category')
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
const User = require('../models/User')
const {convertSecondsToDuration} =  require('../utils/secToDuration')
const {uploadImageToCloudinary} = require('../utils/imageUploader')
const CourseProgress = require('../models/CourseProgress')

//createCourse handler function
exports.createCourse = async(req,res)=>{  
    try {
        //fetch data
        const {courseName,courseDescription,whatYouWillLearn,price,category,tags:_tags,status,instructions:_instructions} = req.body;

        //get thumbnail
        const thumbnail = req.files.thumbnailImage;

            // Convert the tag and instructions from stringified Array to Array
    const tags = JSON.parse(_tags)
    const instructions = JSON.parse(_instructions)

    console.log("tag", tags)
    console.log("instructions", instructions)

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !thumbnail || !tags.length || !instructions.length){
             res.status(400).json({
                success:false,
                message:"All fields are required",

             })
        }

        if (!status || status === undefined) {
            status = "Draft"
          }

        //check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("instructor details", instructorDetails);
        if(!instructorDetails){
            res.status(404).json({
                success:false,
                message:"Instructor details not found",
             })
        }

        // check given tag is valid or not
        const CategoryDetails = await Category.findById(category)
        if(!CategoryDetails){
            res.status(404).json({
                success:false,
                message:"Category details not found",
             })
        }
  
        // upload Image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME)
        
        // create a  entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn:whatYouWillLearn,
            price,
            tags,
            category:CategoryDetails._id,
            thumbnail:thumbnailImage.secure_url,
            status:status,
            instructions,
        })
       
        console.log("in course controller",newCourse)
        // add the new course to the user schema of the instructor
        await User.findByIdAndUpdate(
            {_id:instructorDetails._id},
            {
                $push:{
                    courses:newCourse._id
                }
            },
            {new:true},
        )

       // Add the new course to the Categories
    const categoryDetails2 = await Category.findByIdAndUpdate(
        { _id: category },
        {
          $push: {
            courses: newCourse._id,
          },
        },
        { new: true }
      )
      console.log("HEREEEEEEEE", categoryDetails2)

        //return response
        return res.status(200).json({
             success:true,
             message:"course created successfully",
             data:newCourse,
        });
    } catch (error) {
        console.log(error);
        return  res.status(500).json({
            success:false,
            message:"failed to create course ",
            error:error.message,
       });
    }
}

exports.getAllCourses = async(req,res)=>{
    try {
        const allCourses = await Course.find(
            { status: "Published" },
            {
              courseName: true,
              price: true,
              thumbnail: true,
              instructor: true,
              ratingAndReviews: true,
              studentsEnrolled: true,
            }
          )

              return res.status(200).json({
                success:true,
                message:"data for all courses fetched successfully ",
                data:allCourses,
                
           });                                      
    } catch (error) {
        console.log(error);
        return  res.status(500).json({
            success:false,
            message:"cannot fetch course data ",
            error:error.message,
       });
    }
}

//getCourse Details

exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          select: "-videoUrl",
        },
      })
      .exec()

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subsection) => {
        const timeDurationInSeconds = parseInt(subsection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
      },
      message:"courseDetails and totalDuration fetched successfully"
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Edit Course Details
exports.editCourse = async (req, res) => {
    try {
      const { courseId } = req.body
      const updates = req.body
      const course = await Course.findById(courseId)
  
      if (!course) {
        return res.status(404).json({ error: "Course not found" })
      }
  
      // If Thumbnail Image is found, update it
      if (req.files) {
        console.log("thumbnail update")
        const thumbnail = req.files.thumbnailImage
        const thumbnailImage = await uploadImageToCloudinary(
          thumbnail,
          process.env.FOLDER_NAME
        )
        course.thumbnail = thumbnailImage.secure_url
      }
  
      // Update only the fields that are present in the request body
      for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
          if (key === "tag" || key === "instructions") {
            course[key] = JSON.parse(updates[key])
          } else {
            course[key] = updates[key]
          }
        }
      }
  
      await course.save()
  
      const updatedCourse = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec()
  
      res.json({
        success: true,
        message: "Course updated successfully",
        data: updatedCourse,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
}

exports.getFullCourseDetails = async (req, res) => {
    try {
      const { courseId } = req.body
      const userId = req.user.id
      const courseDetails = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec()
  
      let courseProgressCount = await CourseProgress.findOne({
        courseID: courseId,
        userId: userId,
      })
  
      // console.log("courseProgressCount : ", courseProgressCount)
  
      if (!courseDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find course with id: ${courseId}`,
        })
      }
  
      // if (courseDetails.status === "Draft") {
      //   return res.status(403).json({
      //     success: false,
      //     message: `Accessing a draft course is forbidden`,
      //   });
      // }
  
      let totalDurationInSeconds = 0
      courseDetails.courseContent.forEach((content) => {
        content.subSection.forEach((subSection) => {
          const timeDurationInSeconds = parseInt(subSection.timeDuration)
          totalDurationInSeconds += timeDurationInSeconds
        })
      })
  
      const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
  
      return res.status(200).json({
        success: true,
        data: {
          courseDetails,
          totalDuration,
          completedVideos: courseProgressCount?.completedVideos
            ? courseProgressCount?.completedVideos
            : [],
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  // Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
    try {
      // Get the instructor ID from the authenticated user or request body
      const instructorId = req.user.id
  
      // Find all courses belonging to the instructor
      const instructorCourses = await Course.find({
        instructor: instructorId,
      }).sort({ createdAt: -1 }).populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      //  console.log("GET INSTRUCTOR COURSES API RESPINSE",instructorCourses)
      const totalTimeDuration =  instructorCourses.map((courses)=>{
           
           let totalDurationInSeconds = 0
          courses.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
              const timeDurationInSeconds = parseInt(subSection.timeDuration)
              totalDurationInSeconds += timeDurationInSeconds
            })
          })
      
          const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
          return totalDuration
        })
        console.log("totalTimeDuration",totalTimeDuration)

      // Return the instructor's courses
      res.status(200).json({
        success: true,
        data: instructorCourses,
        totalDuration:totalTimeDuration,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Failed to retrieve instructor courses",
        error: error.message,
      })
    }
  }

// Delete the Course
exports.deleteCourse = async (req, res) => {
    try {
      const { courseId } = req.body
  
      // Find the course
      const course = await Course.findById(courseId)
      if (!course) {
        return res.status(404).json({ message: "Course not found" })
      }
  
      // Unenroll students from the course
      const studentsEnrolled = course.studentsEnrolled
      for (const studentId of studentsEnrolled) {
        await User.findByIdAndUpdate(studentId, {
          $pull: { courses: courseId },
        })
      }
  
      // Delete sections and sub-sections
      const courseSections = course.courseContent
      for (const sectionId of courseSections) {
        // Delete sub-sections of the section
        const section = await Section.findById(sectionId)
        if (section) {
          const subSections = section.subSection
          for (const subSectionId of subSections) {
            await SubSection.findByIdAndDelete(subSectionId)
          }
        }
  
        // Delete the section
        await Section.findByIdAndDelete(sectionId)
      }
  
      // Delete the course
      await Course.findByIdAndDelete(courseId)
  
      return res.status(200).json({
        success: true,
        message: "Course deleted successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      })
    }
  }