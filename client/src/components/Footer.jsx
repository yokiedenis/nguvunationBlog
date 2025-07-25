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
import "../index.css";


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
          {/* <p className="text-white">
          our vision is to see young girls
                    and living in a hygienic, friendly and inclusive environment with
                    access to basic education and life opportunities
          </p> */}
          <ul className="flex items-center gap-3 text-sm text-white">
            <li className="p-3 rounded-md cursor-pointer  bg-[#e7739a] text-[#34b9be] hover:bg-cyan-500 transition-all ease-in-out duration-200">
              <FaFacebookF />
            </li>
            <li className="p-3 rounded-md cursor-pointer bg-[#e7739a] text-[#34b9be] hover:bg-cyan-500 transition-all ease-in-out duration-200">
              <FaTwitter />
            </li>
            <li className="bg-[#e7739a] hover:bg-cyan-500 p-3 text-[#34b9be] rounded-md cursor-pointer transition-all ease-in-out duration-200">
              <FaInstagram />
            </li>
            <li className=" p-3 rounded-md cursor-pointer bg-[#e7739a] text-[#34b9be] hover:bg-cyan-500 transition-all ease-in-out duration-200">
              <FaLinkedinIn />
            </li>
          </ul>
        </div>

        <div className="flex justify-evenly gap-10 max-[561px]:flex-col text-center mx-5px">
          {/* links list */}
          <div>
          <div className="wavyHeading">
  <h5><span className="text-white"> N</span><span className="text-white">guvu</span><span className="text-white">nation</span></h5>
    <h5><span className="text-[#e7739a]"> N</span><span className="text-[#e7739a]">guvu</span><span className="text-[#34b9be]">nation</span></h5>
</div>
            <ul className="text-white mt-5 text-base flex flex-col gap-2">
            <li className="text-sm md:text-lg font-medium hover:text-[#e7739a] px-3 py-1 border-[1px] border-cyan-500 text-[#34b9be] transition-all ease-in-out duration-200">
             
              <Link to="./events">Crafts shop</Link>
              </li>
              <li className="text-sm md:text-lg font-medium hover:text-[#e7739a] px-3 py-1 border-[1px] border-cyan-500 text-[#34b9be] transition-all ease-in-out duration-200">
              <Link to="./contact-us">Contact Us</Link>
              </li>
              <li className="text-sm md:text-lg font-medium hover:text-[#e7739a] px-3 py-1 border-[1px] border-cyan-500 text-[#34b9be] transition-all ease-in-out duration-200">
                <Link>FAQ&apos;s</Link>
              </li>
              <li className="text-sm md:text-lg font-medium hover:text-[#e7739a] px-3 py-1 border-[1px] border-cyan-500 text-[#34b9be] transition-all ease-in-out duration-200">
                <Link>Gallery</Link>
              </li>
            </ul>
          </div>
          <div>
            {/* <h4 className="text-xl font-medium text-white">Quick Links</h4> */}
            <ul className="text-white mt-5 text-base flex flex-col gap-2">
              <li className="text-sm md:text-lg font-medium hover:text-[#e7739a] px-3 py-1 border-[1px] border-cyan-500 text-[#34b9be] transition-all ease-in-out duration-200">
              <Link>Resources</Link>
              </li>
              <li className="text-sm md:text-lg font-medium hover:text-[#e7739a] px-3 py-1 border-[1px] border-cyan-500 text-[#34b9be] transition-all ease-in-out duration-200">
                <Link>Volunteer</Link>
              </li>
              <li className="text-sm md:text-lg font-medium hover:text-[#e7739a] px-3 py-1 border-[1px] border-cyan-500 text-[#34b9be] transition-all ease-in-out duration-200">
                <Link>Community</Link>
                </li>
                <li className="text-sm md:text-lg font-medium hover:text-[#e7739a] px-3 py-1 border-[1px] border-cyan-500 text-[#34b9be] transition-all ease-in-out duration-200">
              <Link>Spirituality</Link>
              </li>
            </ul>
          </div>
          <div>
            {/* <h4 className="text-xl font-medium text-white">Category</h4> */}
            <ul className="text-white mt-5 text-base  flex flex-col gap-2">
            <li className="text-sm md:text-lg font-medium hover:text-[#e7739a] px-9 py-1 border-[1px] border-cyan-500 text-[#34b9be] transition-all ease-in-out duration-200">
                <Link>Mental Heatlh</Link>
              </li>
              <li className="text-sm md:text-lg font-medium hover:text-[#e7739a] px-9 py-1 border-[1px] border-cyan-500 text-[#34b9be] transition-all ease-in-out duration-200">
                <Link>Football</Link>
              </li>
              <li className="text-sm md:text-lg font-medium hover:text-[#e7739a] px-9 py-1 border-[1px] border-cyan-500 text-[#34b9be] transition-all ease-in-out duration-200">
                <Link>Travel tips</Link>
              </li>
              <li className="text-sm md:text-lg font-medium hover:text-[#e7739a] px-9 py-1 border-[1px] border-cyan-500 text-[#34b9be] transition-all ease-in-out duration-200">
                <Link>Creativity</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-black text-white text-center py-5 flex justify-between max-sm:flex-col max-sm:items-center max-sm:gap-3 px-5">
        <p className="flex items-center flex-wrap justify-center text-[15px] font-medium">
          Website underdevelopment, 1{" "}
          <FaHeart className="mx-2 text-red-500" />yokas, milcan, custer'ed, rukundo this
        </p>
        <p>© 2025 <Link className="mx-2 text-[#34b9be]">Nguvu Nation Foundation</Link></p>
        <button className="bg-[#e7739a]  hover:bg-cyan-500 text-white hover:text-white flex items-center gap-2 text-[15px] transition-all ease-in-out duration-200 py-3 font-medium px-3 rounded-lg w-fit">
          Share your thinking <BsArrowRight />
        </button>
      </div>
    </footer>
  );
};

export default Footer;
