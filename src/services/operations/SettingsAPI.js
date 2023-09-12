import { toast } from "react-hot-toast"

import { setUser } from "../../slices/profileSlice"
import { apiConnector } from "../apiconnector"
import { settingsEndpoints } from "../apis"
import { logout } from "./authAPI";
import { useDispatch } from "react-redux";
// import { useSelector } from "react-redux"

const {
  UPDATE_DISPLAY_PICTURE_API,
  UPDATE_PROFILE_API,
  CHANGE_PASSWORD_API,
  DELETE_PROFILE_API,
} = settingsEndpoints

export function updateDisplayPicture(token, formData) {
  
  
  return async (dispatch) => {
   
    const toastId = toast.loading("Loading...")
    // console.log("in settings api",formData)
    try {
      const response = await apiConnector(
        "PUT",
        UPDATE_DISPLAY_PICTURE_API,
        formData,
        {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        }
      )
      // console.log("formdata",formData)
      console.log(
        "UPDATE_DISPLAY_PICTURE_API API RESPONSE............",
        response
      )

      if (!response.data.success) {
        throw new Error(response.data.message) 
      }
      toast.success("Display Picture Updated Successfully")
      console.log("user data when profile change",response?.data?.data)
      // setUser({ ...response.data.data})

      
      // dispatch(setUser(JSON.stringify(response?.data?.data)))
      const userData = JSON.parse(localStorage.getItem('user'));
      if(userData){
          setUser(localStorage.setItem("user",JSON.stringify(response?.data?.data)));
      }
      console.log("userData",userData)
      // dispatch(setUser({...response.data.data,image:formData?.displayPicture}))
       


      // const userData = JSON.parse(localStorage.getItem('user'));
      // if(userData){
      //   userData.image = response.data.data.image;
      //   localStorage.setItem("user",JSON.stringify(userData));
      //   console.log('Image value updated successfully.');
      // }
      // else{
      //   console.log('Object not found in localStorage.');

      // }
    } catch (error) {
      console.log("UPDATE_DISPLAY_PICTURE_API API ERROR............", error)
      toast.error("Could Not Update Display Picture")
    }
    toast.dismiss(toastId)
  }
}

export function updateProfile(token, formData) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...")
    try {
      const response = await apiConnector("PUT", UPDATE_PROFILE_API, formData, {
        Authorization: `Bearer ${token}`,
      })
      console.log("UPDATE_PROFILE_API API RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      console.log("updated user details", response.data)
      const userImage = response.data.updatedUserDetails.image
      ? response.data.updatedUserDetails.image
      : `https://api.dicebear.com/6.x/initials/svg?seed=${response.data.profileDetails.firstName} ${response.data.profileDetails.lastName}`
       

        console.log("second")
        dispatch(setUser({ ...response.data.updatedUserDetails, image: userImage }))

        let userData = JSON.parse(localStorage.getItem('user'));
        if(userData){
            userData = response.data.updatedUserDetails;
            localStorage.setItem("user",JSON.stringify(userData))
          // userData.image = response.data.data.image;
          // localStorage.setItem("user",JSON.stringify(userData));
          // console.log('Image value updated successfully.');
        }
        else{
          console.log('Object not found in localStorage.');
  
        }

      toast.success("Profile Updated Successfully")
    } catch (error) {
      console.log("UPDATE_PROFILE_API API ERROR............", error)
      toast.error("Could Not Update Profile")
    }
    toast.dismiss(toastId)
  }
}

export async function changePassword(token, formData) {
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", CHANGE_PASSWORD_API, formData, {
      Authorization: `Bearer ${token}`,
    })
    console.log("CHANGE_PASSWORD_API API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    toast.success("Password Changed Successfully")
  } catch (error) {
    console.log("CHANGE_PASSWORD_API API ERROR............", error)
    toast.error(error.response.data.message)
  }
  toast.dismiss(toastId)
}

export function deleteProfile(token, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...")
    try {
      const response = await apiConnector("DELETE", DELETE_PROFILE_API, null, {
        Authorization: `Bearer ${token}`,
      })
      console.log("DELETE_PROFILE_API API RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      toast.success("Profile Deleted Successfully")
      dispatch(logout(navigate))
    } catch (error) {
      console.log("DELETE_PROFILE_API API ERROR............", error)
      toast.error("Could Not Delete Profile")
    }
    toast.dismiss(toastId)
  }
}