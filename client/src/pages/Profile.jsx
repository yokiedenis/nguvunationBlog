// src/pages/Profile.jsx
import axios from "axios";
import React, { useState, useEffect } from "react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaRegHeart, FaTwitter } from "react-icons/fa";
import { GoDotFill } from "react-icons/go";
import { LuBookmarkMinus, LuCalendarDays } from "react-icons/lu";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../store/Authentication";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import UserGallery from "../components/UserGallery"; // New component

const Profile = () => {
  const [activeTab, setActiveTab] = useState("allPosts");
  const [userDetails, setUserDetails] = useState({});
  const [blogs, setBlogs] = useState([]);
  const [savedBlogs, setSavedBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const { userId } = useParams();
  const { token, user } = useAuth();
  const currentUserId = user?.user._id;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch user details
        const userResponse = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/user/${userId}`
        );
        setUserDetails(userResponse.data.user);
        setIsFollowing(userResponse.data.user.followers.includes(currentUserId));
        setSavedBlogs(userResponse.data.user.savedPosts || []);

        // Fetch user's blogs
        const blogsResponse = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/blog/user/${userId}/blogs`
        );
        if (blogsResponse.data.success) {
          setBlogs(
            blogsResponse.data.blogs.filter(blog => blog.isDraft === false)
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, currentUserId]);

  const handleFollow = async () => {
    if (!user) {
      toast.error("Please login to follow a user");
      return;
    }

    setLocalLoading(true);
    try {
      const endpoint = isFollowing
        ? `${import.meta.env.VITE_SERVER_URL}/api/unfollow/${userId}`
        : `${import.meta.env.VITE_SERVER_URL}/api/follow/${userId}`;

      const response = await axios.put(
        endpoint,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setIsFollowing(!isFollowing);
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLocalLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <section className="my-[5rem] px-24 max-md:px-5">
      <div className="relative">
        <img
          src={
            userDetails.bannerImg ||
            "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"
          }
          alt="banner img"
          className="w-full h-56 max-[500px]:h-40 object-cover rounded-lg shadow-lg"
        />
        <img
          src={userDetails.profileImg || "https://via.placeholder.com/150"}
          alt="profile image"
          className="w-32 h-32 max-[500px]:w-28 max-[500px]:h-28 rounded-full absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 border-4 border-white"
        />
      </div>
      <div className="text-center mt-[5rem]">
        <h1 className="text-2xl font-bold text-custom-light-black">
          {userDetails.name || "Name"}
        </h1>
        <span className="italic text-gray-500 font-medium">
          @{userDetails.username || "username"}
        </span>
        <p className="w-[70%] mx-auto text-custom-light-black font-medium mt-2">
          {userDetails.headline || "No Bio available."}
        </p>
        
        {userDetails.socialMedia && (
          <ul className="flex items-center gap-2 md:gap-3 text-sm order-2 md:order-1 mx-auto w-fit mt-6">
            {/* Social media icons remain the same */}
          </ul>
        )}
        
        <button
          disabled={localLoading}
          className={`bg-custom-orange text-base font-medium px-6 py-2 rounded-lg mt-4 ${
            isFollowing ? "bg-gray-400 text-white" : ""
          }`}
          onClick={handleFollow}
        >
          {localLoading ? "Processing..." : isFollowing ? "Unfollow" : "Follow"}
        </button>
      </div>
      <hr className="mt-8" />

      <div className="mx-auto mt-6 bg-white rounded-lg">
        {/* Updated Tab Navigation */}
        <div className="flex">
          <button
            className={`flex-1 rounded-l-md transition-all font-semibold ease-in-out duration-200 text-center py-3 cursor-pointer ${
              activeTab === "allPosts"
                ? "bg-custom-orange text-custom-light-black"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab("allPosts")}
          >
            All Posts
          </button>

          <button
            className={`flex-1 transition-all ease-in-out duration-200 text-center py-3 cursor-pointer font-semibold ${
              activeTab === "savedPosts"
                ? "bg-custom-orange text-custom-light-black"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab("savedPosts")}
          >
            Saved Posts
          </button>
          
          <button
            className={`flex-1 rounded-r-md transition-all ease-in-out duration-200 text-center py-3 cursor-pointer font-semibold ${
              activeTab === "gallery"
                ? "bg-custom-orange text-custom-light-black"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab("gallery")}
          >
            Gallery
          </button>
        </div>

        {/* Content Area */}
        <div className="mt-6">
          {activeTab === "allPosts" && (
            <div className="grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-10 mt-8">
              {/* All posts rendering remains the same */}
            </div>
          )}
          
          {activeTab === "savedPosts" && (
            <div className="grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-10 mt-8">
              {/* Saved posts rendering remains the same */}
            </div>
          )}
          
          {activeTab === "gallery" && (
            <div className="mt-6">
              <UserGallery userId={userId} token={token} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Profile;