import {
  FaFacebookF,
  FaHeart,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa";
import LogoWhite from "../img/logo-white.webp";
import { Link } from "react-router-dom";
import { BsArrowRight } from "react-icons/bs";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";

const Footer = () => {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/subscribe`,
        data
      );

      toast.success(response.data.message);
      reset(); // Reset form on successful submission
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <footer className="">
      <div className="flex justify-evenly max-lg:flex-col max-lg:items-center max-lg:gap-12 bg-black p-20">
        {/* top content  */}
        <div className="w-[25%] max-sm:w-11/12 flex flex-col max-lg:items-center max-lg:text-center gap-5">
          <figure>
            <img src={LogoWhite} alt=" blog logo" />
          </figure>
          <p className="text-white">
 Our goal is to have an impact on the lives of young girls by providing positive and godly impact
 oriented, cost effective and culturally competent capacity building programs.
          </p>
          <ul className="flex items-center gap-3 text-sm text-white">
            <li className="p-3 rounded-md cursor-pointer  bg-[#e7739a] text-black hover:bg-cyan-500 transition-all ease-in-out duration-200">
              <FaFacebookF />
            </li>
            <li className="p-3 rounded-md cursor-pointer bg-[#e7739a] text-black hover:bg-cyan-500 transition-all ease-in-out duration-200">
              <FaTwitter />
            </li>
            <li className="bg-[#e7739a] hover:bg-cyan-500 p-3 text-black rounded-md cursor-pointer transition-all ease-in-out duration-200">
              <FaInstagram />
            </li>
            <li className=" p-3 rounded-md cursor-pointer bg-[#e7739a] text-black hover:bg-cyan-500 transition-all ease-in-out duration-200">
              <FaLinkedinIn />
            </li>
          </ul>
        </div>

        <div>
          {/* subscription form  */}
          <h4 className="text-xl font-medium text-white max-lg:text-center">
            Subscribe
          </h4>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-3 w-fit mt-5"
          >
            <input
              type="text"
              name="name"
              {...register("name", { required: true })}
              className="bg-custom-light-black text-white h-14 px-5 rounded-lg outline-none placeholder:text-white"
              placeholder="Your Name"
            />
            <input
              type="email"
              name="email"
              {...register("email", { required: true })}
              className="bg-custom-light-black text-white h-14 px-5 rounded-lg outline-none placeholder:text-white"
              placeholder="Your Email Address"
            />
            <button
              disabled={loading}
              type="submit"
              className="bg-[#e7739a] hover:bg-cyan-500 hover:text-white transition-all ease-in-out duration-200 py-3 text-lg font-medium px-3 rounded-lg"
            >
              {loading ? "Subscribing" : "Subscribe Now"}
            </button>
          </form>
        </div>
        <div className="flex justify-evenly gap-10 max-[561px]:flex-col text-center">
          {/* links list */}
          <div>
            <h4 className="text-xl font-medium text-white">Nguvu Nation</h4>
            <ul className="text-white mt-5 text-base flex flex-col gap-2">
              <li className="hover:text-cyan-500 transition-all ease-in-out duration-200">
              <Link to="/contact-us">Contact Us</Link>
              </li>
              <li className="hover:text-cyan-500 transition-all ease-in-out duration-200">
                <Link to="/gallery">Gallery</Link>
              </li>
              <li className="hover:text-cyan-500 transition-all ease-in-out duration-200">
                <Link>FAQ&apos;s</Link>
              </li>

            </ul>
          </div>
          <div>
            <h4 className="text-xl font-medium text-white">Quick Links</h4>
            <ul className="text-white mt-5 text-base flex flex-col gap-2">
              <li className="hover:text-cyan-500 transition-all ease-in-out duration-200">
              <Link>Shop</Link>
              </li>
              <li className="hover:text-cyan-500  transition-all ease-in-out duration-200">
                <Link>Volunteer</Link>
              </li>
              <li className="hover:text-cyan-500  transition-all ease-in-out duration-200">
                <Link>Terms & conditions</Link>
              </li>
              <li className="hover:text-cyan-500  transition-all ease-in-out duration-200">
              <Link>Privacy Policy</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-medium text-white">Category</h4>
            <ul className="text-white mt-5 text-base  flex flex-col gap-2">
              <li className="hover:text-cyan-500 transition-all ease-in-out duration-200">
                <Link>Lifestyle</Link>
              </li>
              <li className="hover:text-cyan-500  transition-all ease-in-out duration-200">
                <Link>Healthy</Link>
              </li>
              <li className="hover:text-cyan-500  transition-all ease-in-out duration-200">
                <Link>Travel tips</Link>
              </li>
              <li className="hover:text-cyan-500  transition-all ease-in-out duration-200">
                <Link>Marketing</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-black text-white text-center py-5 flex justify-between max-sm:flex-col max-sm:items-center max-sm:gap-3 px-5">
        <p className="flex items-center flex-wrap justify-center text-[15px] font-medium">
          © 2025 <Link className="mx-2 text-cyan-500">Nguvu Nation</Link> . Made with{" "}
          <FaHeart className="mx-2 text-red-500" /> by yoki3
        </p>
        <button className="bg-[#e7739a]  hover:bg-cyan-500 text-custom-black hover:text-white flex items-center gap-2 text-[15px] transition-all ease-in-out duration-200 py-3 font-medium px-3 rounded-lg w-fit">
          Share your thinking <BsArrowRight />
        </button>
      </div>
    </footer>
  );
};

export default Footer;
